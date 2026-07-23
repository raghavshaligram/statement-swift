import type { PageText, TextItem } from "./extract-text";
import { inferDateOrder, resolveAmbiguousDate, type DateOrder } from "./date-inference";
import { findHeaderRow, classifyByColumn, type DetectedColumn } from "./detect-columns";

export type RawTransaction = {
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  sourcePage: number;
  confidence: "high" | "low";
};

// --- date parsing -----------------------------------------------------------

// Covers the common statement date formats. "ambiguous" formats are numeric
// with no month name, so day/month order is resolved by the document-wide
// inference in date-inference.ts rather than guessed per-row.
const DATE_PATTERNS: Array<{
  re: RegExp;
  kind: "iso" | "monthName" | "ambiguous";
}> = [
  { re: /\b(\d{4})-(\d{2})-(\d{2})\b/, kind: "iso" }, // YYYY-MM-DD
  { re: /\b(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{4})\b/, kind: "monthName" }, // 15-Jan-2025
  { re: /\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})\b/, kind: "monthName" }, // Jan 15, 2025 (month first)
  { re: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/, kind: "ambiguous" }, // MM/DD/YYYY or DD/MM/YYYY
  { re: /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/, kind: "ambiguous" }, // MM-DD-YYYY or DD-MM-YYYY
];

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/** Finds the first date-like match in text and resolves it to ISO, using the document's inferred date order for ambiguous numeric formats. */
function findDate(text: string, dateOrder: DateOrder): { iso: string; matchedText: string } | null {
  for (const { re, kind } of DATE_PATTERNS) {
    const m = text.match(re);
    if (!m) continue;

    if (kind === "iso") {
      return { iso: `${m[1]}-${m[2]}-${m[3]}`, matchedText: m[0] };
    }

    if (kind === "monthName") {
      // Two possible group orders: "15-Jan-2025" (day, month, year) or
      // "Jan 15, 2025" (month, day, year) -- tell them apart by which group
      // is the month name.
      const isMonthFirst = isNaN(parseInt(m[1], 10));
      const monthStr = isMonthFirst ? m[1] : m[2];
      const dayStr = isMonthFirst ? m[2] : m[1];
      const month = MONTHS[monthStr.toLowerCase().slice(0, 3)];
      if (!month) continue;
      return { iso: `${m[3]}-${month}-${dayStr.padStart(2, "0")}`, matchedText: m[0] };
    }

    // ambiguous numeric -- resolve using the document-wide inferred order,
    // with per-token override when this specific date is independently
    // unambiguous (see resolveAmbiguousDate).
    let year = m[3];
    if (year.length === 2) year = `20${year}`;
    const iso = resolveAmbiguousDate(m[1], m[2], year, dateOrder);
    if (iso) return { iso, matchedText: m[0] };
  }
  return null;
}

function hasDate(text: string): boolean {
  return DATE_PATTERNS.some(({ re }) => re.test(text));
}

// --- amount parsing -----------------------------------------------------------

// Matches a single standalone number-shaped token -- used against individual
// PDF text items (which usually carry one number each), not concatenated row
// text, so we keep each number's real x-position for column classification.
// Handles both Western grouping (100,116 / 1,234,567 -- repeating 3-digit
// groups) and Indian lakh/crore grouping (1,00,116 / 12,34,567 -- a leading
// 1-2 digit group, then repeating 2-digit groups, then one final 3-digit
// group before the decimal). Missing the Indian case entirely broke any
// statement amount >= 1 lakh -- confirmed on the real ICICI statement, where
// it silently dropped whole transactions with no matched numbers at all.
const AMOUNT_ITEM_RE = /^\(?-?\$?(?:\d{1,2}(?:,\d{2})+,\d{3}|\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})\)?$/;

function parseAmountToken(token: string): number {
  const negative = /^\(.*\)$/.test(token.trim()) || token.trim().startsWith("-");
  const cleaned = token.replace(/[()$,\s-]/g, "");
  const value = parseFloat(cleaned);
  return negative ? -Math.abs(value) : value;
}

type NumberToken = { value: number; raw: string; x: number };

function findNumberItems(items: TextItem[]): NumberToken[] {
  return items
    .filter((it) => AMOUNT_ITEM_RE.test(it.str.trim()))
    .map((it) => ({ value: parseAmountToken(it.str), raw: it.str, x: it.x }));
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

// --- multi-line transaction block merging -----------------------------------------------------------

type Block = { rows: Row[]; anchorRow: Row };

/**
 * Groups rows into transaction blocks by assigning every row to whichever
 * date-bearing ("anchor") row is nearest to it by position, rather than
 * simply attaching each row to whatever anchor came before it.
 *
 * This matters because real multi-line statements don't always wrap in a
 * consistent "date row, then continuation lines" order — confirmed on a real
 * ICICI statement, where each transaction's line order is actually prefix
 * line -> date+reference+amount+balance line -> payee-name line. A prefix
 * line has no date of its own, so a naive "attach forward from the last seen
 * anchor" approach wrongly steals it into the PREVIOUS transaction's block.
 * Nearest-anchor assignment fixes this: a prefix line sits closer to the
 * anchor it precedes than the one further back, so it correctly attaches
 * forward, while a trailing suffix line sits closer to the anchor it follows
 * and correctly attaches backward — without hardcoding which order any given
 * statement uses.
 *
 * Known residual limitation: rows after the last anchor on a page/document
 * (e.g. a trailing "TOTAL" summary line) have no "next" anchor to compare
 * against, so they attach to the last transaction found. This can pollute
 * the final transaction's description on a page with footer text — a real
 * edge case, not fully solved here, and worth checking for on further real
 * statements.
 */
function groupRowsIntoBlocks(rows: Row[]): Block[] {
  const anchorIndices: number[] = [];
  rows.forEach((row, i) => {
    if (hasDate(row.text)) anchorIndices.push(i);
  });
  if (anchorIndices.length === 0) return [];

  const blockByAnchor = new Map<number, Row[]>();
  for (const idx of anchorIndices) blockByAnchor.set(idx, []);

  for (let i = 0; i < rows.length; i++) {
    let nearest = anchorIndices[0];
    let nearestDist = Math.abs(i - nearest);
    for (const anchorIdx of anchorIndices) {
      const dist = Math.abs(i - anchorIdx);
      // Prefer the later anchor on ties, since interior prefix lines that are
      // equidistant from the previous and next anchor belong to the next
      // transaction, not the previous one (see block comment above).
      if (dist < nearestDist || (dist === nearestDist && anchorIdx > nearest)) {
        nearest = anchorIdx;
        nearestDist = dist;
      }
    }
    blockByAnchor.get(nearest)!.push(rows[i]);
  }

  return anchorIndices.map((idx) => {
    // blockRows are already in ascending row-index order, since the
    // assignment loop above iterates rows in order — so reading order
    // (prefix line, then anchor, then suffix line) is preserved naturally,
    // unlike forcing the anchor row to the front.
    return { rows: blockByAnchor.get(idx)!, anchorRow: rows[idx] };
  });
}

// Noise tokens that show up constantly in UPI/bank-reference-heavy statement
// lines and aren't part of a human-readable payee name -- filtered out when
// assembling the description from a multi-line block.
const NOISE_SEGMENT_RE = /^(upi|imps|neft|rtgs|ach|bil|inft|mmt)$/i;
// Real reference/hash codes mix letters AND digits together (e.g. a UPI
// transaction ID) -- a plain long word like "STARBUCKS" or "SUBSCRIPTION" is
// still just letters, so requiring both is what keeps this filter from
// stripping legitimate merchant names purely for being long.
const LOOKS_LIKE_REFERENCE_RE = /^(?=.*[a-z])(?=.*\d)[a-z0-9]{8,}$/i;
const MOSTLY_DIGITS_RE = /^\d{6,}$/; // long pure-digit account/reference numbers

function buildDescription(block: Block, dateMatchedText: string, consumedAmounts: string[]): string {
  const rawTexts = block.rows.map((r) => r.text);
  let combined = rawTexts.join(" / ");

  combined = combined.replace(dateMatchedText, "");
  for (const tok of consumedAmounts) combined = combined.replace(tok, "");

  const segments = combined
    .split(/[\/\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !NOISE_SEGMENT_RE.test(s))
    .filter((s) => !LOOKS_LIKE_REFERENCE_RE.test(s))
    .filter((s) => !MOSTLY_DIGITS_RE.test(s));

  // Collapse consecutive duplicate segments (e.g. a payee name split across
  // lines sometimes repeats a word right at the line break).
  const deduped: string[] = [];
  for (const s of segments) {
    if (deduped[deduped.length - 1]?.toLowerCase() !== s.toLowerCase()) deduped.push(s);
  }

  const description = deduped.join(" ").replace(/\s+/g, " ").trim();
  return description || "(description not detected)";
}

function buildTransactionFromBlock(
  block: Block,
  columns: DetectedColumn[] | null,
  dateOrder: DateOrder,
  pageNumber: number
): RawTransaction | null {
  const anchorRow = block.anchorRow;
  const dateResult = findDate(anchorRow.text, dateOrder);
  if (!dateResult) return null;

  // Gather every number across every row in the block, keeping x-position.
  const numbers = block.rows.flatMap((r) => findNumberItems(r.items));
  if (numbers.length === 0) return null;

  let amount: number | null = null;
  let balance: number | null = null;
  let confidence: "high" | "low" = "low";
  const consumedRaw: string[] = [];

  if (columns) {
    // Header-based classification: each number belongs to whichever column
    // it's positioned under, regardless of how many lines the block spans.
    for (const n of numbers) {
      const col = classifyByColumn(n.x, columns);
      if (!col) continue;
      if (col.role === "balance") {
        balance = n.value;
        consumedRaw.push(n.raw);
      } else if (col.role === "deposit") {
        amount = n.value; // positive
        consumedRaw.push(n.raw);
      } else if (col.role === "withdrawal") {
        amount = -Math.abs(n.value);
        consumedRaw.push(n.raw);
      } else if (col.role === "amount" && amount === null) {
        amount = n.value;
        consumedRaw.push(n.raw);
      }
    }
    if (amount !== null) confidence = "high";
  }

  if (amount === null) {
    // No column info, or column classification didn't resolve an amount --
    // fall back to positional heuristic across the whole block's numbers.
    const combinedText = block.rows.map((r) => r.text).join(" ");
    if (numbers.length >= 2) {
      const last = numbers[numbers.length - 1];
      const secondLast = numbers[numbers.length - 2];
      amount = secondLast.value;
      balance = last.value;
      consumedRaw.push(secondLast.raw, last.raw);
      confidence = "high";
    } else if (/\b(opening|closing|beginning|ending)\s+balance\b/i.test(combinedText)) {
      amount = 0;
      balance = numbers[0].value;
      consumedRaw.push(numbers[0].raw);
      confidence = "high";
    } else {
      amount = numbers[0].value;
      balance = null;
      consumedRaw.push(numbers[0].raw);
      confidence = "low";
    }
  }

  const description = buildDescription(block, dateResult.matchedText, consumedRaw);

  return {
    date: dateResult.iso,
    description,
    amount: amount ?? 0,
    balance,
    sourcePage: pageNumber,
    confidence,
  };
}

/**
 * Generic, bank-agnostic transaction extraction. Three layers of inference,
 * each reading the document's own structure instead of assuming a fixed
 * format:
 *  1. Date order (DMY vs MDY) is inferred once for the whole document
 *     (date-inference.ts), not guessed per-row.
 *  2. Column layout (which x-range holds the date/description/amount/balance/
 *     deposit/withdrawal) is read from each page's own header row
 *     (detect-columns.ts), not assumed to be "last two numbers = amount,
 *     balance."
 *  3. Multi-line transactions (a statement wraps one transaction across
 *     several visual lines) are merged into a single block before any of the
 *     above is applied, so the description isn't limited to whichever single
 *     line happened to contain the date.
 *
 * Blocks that don't fit even this are skipped, and blocks that parse but
 * remain ambiguous (single number, no column match) are marked low-confidence
 * for manual review in the preview screen -- the honest fallback for whatever
 * this generic layer can't fully resolve on its own.
 */
export function parseTransactionsFromPages(pages: PageText[], fullText: string): RawTransaction[] {
  const dateOrder = inferDateOrder(fullText);
  const transactions: RawTransaction[] = [];
  let carriedColumns: DetectedColumn[] | null = null;

  for (const page of pages) {
    if (page.items.length === 0) continue;

    const rows = groupIntoRows(page.items);
    const pageWidth = Math.max(...page.items.map((i) => i.x + i.width), 1);

    const header = findHeaderRow(rows, pageWidth);
    const columns = header ? header.columns : carriedColumns;
    if (header) carriedColumns = header.columns;

    const candidateRows = header ? rows.slice(header.headerRowIndex + 1) : rows;
    const blocks = groupRowsIntoBlocks(candidateRows);

    for (const block of blocks) {
      const txn = buildTransactionFromBlock(block, columns, dateOrder, page.pageNumber);
      if (txn) transactions.push(txn);
    }
  }

  return transactions;
}
