import type { PageText, TextItem } from "./extract-text";

export type RawTransaction = {
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  sourcePage: number;
  confidence: "high" | "low";
};

// --- date parsing -----------------------------------------------------------

// Covers the common statement date formats: 01/15/2025, 15/01/2025, 15-Jan-2025,
// Jan 15, 2025, 2025-01-15. We don't try to be exhaustive — this is the generic
// fallback path; bank-specific profiles can narrow this down further later.
const DATE_PATTERNS: Array<{ re: RegExp; toIso: (m: RegExpMatchArray) => string | null }> = [
  {
    // YYYY-MM-DD
    re: /\b(\d{4})-(\d{2})-(\d{2})\b/,
    toIso: (m) => `${m[1]}-${m[2]}-${m[3]}`,
  },
  {
    // DD-Mon-YYYY or DD Mon YYYY (e.g. 15-Jan-2025, common in Indian bank statements)
    re: /\b(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{4})\b/,
    toIso: (m) => {
      const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
      if (!month) return null;
      return `${m[3]}-${month}-${m[1].padStart(2, "0")}`;
    },
  },
  {
    // Mon DD, YYYY (e.g. Jan 15, 2025 — common in US statements)
    re: /\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})\b/,
    toIso: (m) => {
      const month = MONTHS[m[1].toLowerCase().slice(0, 3)];
      if (!month) return null;
      return `${m[3]}-${month}-${m[2].padStart(2, "0")}`;
    },
  },
  {
    // MM/DD/YYYY or DD/MM/YYYY — ambiguous without locale context, so we assume
    // MM/DD/YYYY (US) unless the first number is >12, in which case it must be DD/MM.
    re: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/,
    toIso: (m) => {
      let [, a, b, year] = m;
      if (year.length === 2) year = `20${year}`;
      const first = parseInt(a, 10);
      const second = parseInt(b, 10);
      const month = first > 12 ? second : first;
      const day = first > 12 ? first : second;
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    },
  },
];

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function findDate(text: string): string | null {
  for (const { re, toIso } of DATE_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const iso = toIso(m);
      if (iso) return iso;
    }
  }
  return null;
}

// --- amount parsing -----------------------------------------------------------

// Matches numbers like 1,234.56 / -1,234.56 / (1,234.56) / 1234.56 / 14612.48.
// Tries comma-grouped digits first, falling back to plain (ungrouped) digit runs —
// bank statements are inconsistent about thousand separators, so both must work.
// European decimal-comma format (1.234,56) is NOT handled — known limitation.
const AMOUNT_RE = /\(?-?\$?\s?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})\)?/g;

function parseAmountToken(token: string): number {
  const negative = /^\(.*\)$/.test(token.trim()) || token.trim().startsWith("-");
  const cleaned = token.replace(/[()$,\s-]/g, "");
  const value = parseFloat(cleaned);
  return negative ? -Math.abs(value) : value;
}

function findAmountTokens(text: string): string[] {
  return text.match(AMOUNT_RE) ?? [];
}

// --- row reconstruction -----------------------------------------------------------

type Row = { y: number; items: TextItem[]; text: string };

// Groups text items into visual rows by clustering nearby y-coordinates, then
// sorts each row's items left-to-right by x. PDFs rarely give us perfectly
// aligned y-values for the same visual line, so we use a tolerance band.
function groupIntoRows(items: TextItem[], yTolerance = 3): Row[] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: Row[] = [];

  for (const item of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(item.y - last.y) <= yTolerance) {
      last.items.push(item);
      last.y = (last.y * (last.items.length - 1) + item.y) / last.items.length;
    } else {
      rows.push({ y: item.y, items: [item], text: "" });
    }
  }

  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    row.text = row.items.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim();
  }

  return rows;
}

/**
 * Generic, bank-agnostic transaction extraction: reconstructs visual rows from
 * PDF text positions, then for every row that starts with a recognizable date
 * and contains at least one currency-shaped number, classifies the trailing
 * numeric tokens as amount (and balance, if a second number is present) and
 * everything in between as the description.
 *
 * This intentionally does NOT try to hand-parse per-bank column layouts — see
 * the module comment in bank-detection.ts for why. Rows that don't fit the
 * date-at-start / numbers-at-end pattern are skipped, and rows that parse but
 * look ambiguous (e.g. only one trailing number, so we can't tell amount from
 * balance) are marked low-confidence for manual review in the preview screen.
 */
export function parseTransactionsFromPages(pages: PageText[]): RawTransaction[] {
  const transactions: RawTransaction[] = [];

  for (const page of pages) {
    const rows = groupIntoRows(page.items);

    for (const row of rows) {
      const date = findDate(row.text);
      if (!date) continue;

      const amountTokens = findAmountTokens(row.text);
      if (amountTokens.length === 0) continue;

      // Description = row text with the date and all matched amount tokens stripped out.
      let description = row.text;
      const dateMatch = row.text.match(dateSourcePattern(row.text));
      if (dateMatch) description = description.replace(dateMatch[0], "");
      for (const tok of amountTokens) description = description.replace(tok, "");
      description = description.replace(/\s+/g, " ").trim().replace(/^[-–|,.\s]+|[-–|,.\s]+$/g, "");

      let amount: number;
      let balance: number | null;
      let confidence: "high" | "low";

      if (amountTokens.length >= 2) {
        // Last two numeric tokens are treated as [amount, balance] — the most
        // common layout (amount column, then running balance column).
        const last = amountTokens[amountTokens.length - 1];
        const secondLast = amountTokens[amountTokens.length - 2];
        amount = parseAmountToken(secondLast);
        balance = parseAmountToken(last);
        confidence = "high";
      } else if (/\b(opening|closing|beginning|ending)\s+balance\b/i.test(row.text)) {
        // Single-number row that's explicitly labeled as a balance line (common
        // for opening/closing balance rows) — the number is the balance, not a
        // transaction amount.
        amount = 0;
        balance = parseAmountToken(amountTokens[0]);
        confidence = "high";
      } else {
        // Only one number on the row — could be amount OR balance depending on
        // the statement layout. We guess amount and flag it for the user to check.
        amount = parseAmountToken(amountTokens[0]);
        balance = null;
        confidence = "low";
      }

      if (!description) description = "(description not detected)";

      transactions.push({
        date,
        description,
        amount,
        balance,
        sourcePage: page.pageNumber,
        confidence,
      });
    }
  }

  return transactions;
}

// Re-derive whichever date pattern actually matched, so we can strip exactly
// that substring out of the description text.
function dateSourcePattern(text: string): RegExp {
  for (const { re } of DATE_PATTERNS) {
    if (re.test(text)) return re;
  }
  return /$^/; // matches nothing
}
