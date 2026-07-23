import type { TextItem } from "./extract-text";

export type ColumnRole = "date" | "description" | "amount" | "deposit" | "withdrawal" | "balance";

export type DetectedColumn = {
  role: ColumnRole;
  label: string;
  xStart: number; // inclusive left boundary for classifying a number into this column
  xEnd: number; // exclusive right boundary
};

export type HeaderInfo = {
  columns: DetectedColumn[];
  headerRowIndex: number; // index into the rows array this header was found on
};

// Keyword -> role mapping. Order matters for role priority when a single
// header label could plausibly match more than one (it generally won't, but
// e.g. "Amount" should never accidentally match "Withdrawal Amount" as both
// deposit and withdrawal — longer/more specific keywords are checked first).
const ROLE_KEYWORDS: Array<{ role: ColumnRole; patterns: RegExp[] }> = [
  { role: "date", patterns: [/^date$/i, /^transaction date$/i, /^value date$/i, /^txn date$/i] },
  { role: "description", patterns: [/^particulars?$/i, /^description$/i, /^narration$/i, /^details?$/i, /^transaction details?$/i] },
  { role: "withdrawal", patterns: [/^withdrawals?$/i, /^debit$/i, /^dr\.?$/i] },
  { role: "deposit", patterns: [/^deposits?$/i, /^credit$/i, /^cr\.?$/i] },
  { role: "balance", patterns: [/^balance$/i, /^closing balance$/i, /^running balance$/i, /^bal\.?$/i] },
  { role: "amount", patterns: [/^amount$/i, /^amt\.?$/i] },
];

function matchRole(label: string): ColumnRole | null {
  const cleaned = label.trim().replace(/[*:]+$/, "");
  for (const { role, patterns } of ROLE_KEYWORDS) {
    if (patterns.some((p) => p.test(cleaned))) return role;
  }
  return null;
}

type Row = { y: number; items: TextItem[]; text: string };

/**
 * Scans a page's reconstructed rows for a header row — one containing at
 * least two recognizable column-role keywords (so a stray "Balance" mention
 * in a paragraph elsewhere doesn't get mistaken for the real header). Returns
 * the x-position boundaries for each detected column, derived from the
 * midpoints between adjacent header labels, so any number on a transaction
 * row can be classified by which column it visually falls under — instead of
 * assuming "last two numbers are amount then balance," which breaks the
 * moment a statement uses a different column order or a split debit/credit
 * layout.
 */
export function findHeaderRow(rows: Row[], pageWidth: number): HeaderInfo | null {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const matches: Array<{ role: ColumnRole; label: string; x: number }> = [];

    for (const item of row.items) {
      const role = matchRole(item.str);
      if (role) matches.push({ role, label: item.str, x: item.x });
    }

    if (matches.length < 2) continue; // not confident this is the header

    matches.sort((a, b) => a.x - b.x);
    const columns: DetectedColumn[] = matches.map((m, i) => {
      const prevX = i === 0 ? 0 : (matches[i - 1].x + m.x) / 2;
      const nextX = i === matches.length - 1 ? pageWidth : (m.x + matches[i + 1].x) / 2;
      return { role: m.role, label: m.label, xStart: prevX, xEnd: nextX };
    });

    return { columns, headerRowIndex: rowIndex };
  }

  return null;
}

/** Finds which detected column a given x-coordinate falls under, if any. */
export function classifyByColumn(x: number, columns: DetectedColumn[]): DetectedColumn | null {
  return columns.find((c) => x >= c.xStart && x < c.xEnd) ?? null;
}
