/**
 * Infers whether a statement uses day-first (DD-MM / DD/MM) or month-first
 * (MM-DD / MM/DD) numeric date ordering, by scanning every numeric date-like
 * token in the whole document once, rather than guessing per-row.
 *
 * Why this matters: a token like "03-04-2025" is inherently ambiguous in
 * isolation — could be March 4 or April 3. But a single document is
 * internally consistent (a bank doesn't mix conventions within one
 * statement), so if ANY date elsewhere in the same document is unambiguous
 * (e.g. "25-04-2025" — no month 25 exists, so this must be day-first), that
 * resolves every ambiguous date in the document too.
 */

export type DateOrder = "DMY" | "MDY";

const NUMERIC_DATE_RE = /\b(\d{1,2})([-/])(\d{1,2})\2(\d{4})\b/g;

/**
 * Scans the full document text for the first unambiguous numeric date and
 * returns its implied order. If no date in the document is independently
 * unambiguous, falls back to a separator-based prior rather than one flat
 * global default: slash-separated numeric dates (06/01/2025) are
 * conventionally MM/DD/YYYY (US statements), while dash-separated numeric
 * dates (06-01-2025) are conventionally DD-MM-YYYY (common in Indian/UK
 * statements). This is a real, useful signal — collapsing it to a single
 * default in either direction silently flips whichever convention doesn't
 * match the default on any statement too small to contain disambiguating
 * evidence of its own.
 */
export function inferDateOrder(fullText: string): DateOrder {
  const matches = [...fullText.matchAll(NUMERIC_DATE_RE)];
  if (matches.length === 0) return "DMY";

  let slashCount = 0;
  let dashCount = 0;

  for (const m of matches) {
    const first = parseInt(m[1], 10);
    const second = parseInt(m[3], 10);
    const separator = m[2];

    if (first > 12 && second <= 12) return "DMY"; // unambiguous, overrides everything
    if (second > 12 && first <= 12) return "MDY"; // unambiguous, overrides everything

    if (separator === "/") slashCount++;
    else dashCount++;
  }

  // No unambiguous evidence anywhere in the document — fall back to the
  // separator-based prior, using whichever separator is more common in case
  // a document mixes (shouldn't normally happen, but stay deterministic).
  return slashCount >= dashCount ? "MDY" : "DMY";
}

/** Applies an inferred order to convert a two-number, ambiguous date pair into an ISO date string. */
export function resolveAmbiguousDate(first: string, second: string, year: string, order: DateOrder): string | null {
  const a = parseInt(first, 10);
  const b = parseInt(second, 10);

  // Even with a document-level order inferred, an individual token can still
  // force the opposite reading if it's independently unambiguous (e.g. the
  // document is mostly DMY but this one row happens to say "25-04-2025" —
  // no, wait, that's still DMY-consistent; the real case is e.g. a document
  // inferred as MDY encountering "25-04-2025" where 25 can't be a month, so
  // this specific token must be DD-MM regardless of the document default).
  let month: number, day: number;
  if (a > 12 && b <= 12) {
    day = a;
    month = b;
  } else if (b > 12 && a <= 12) {
    month = a;
    day = b;
  } else if (order === "DMY") {
    day = a;
    month = b;
  } else {
    month = a;
    day = b;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
