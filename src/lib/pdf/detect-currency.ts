import type { BankId } from "./bank-detection";

/**
 * Detects a statement's currency from the document's own text, rather than
 * assuming one. Tries three layers, in order of reliability:
 *
 * 1. ISO currency codes (INR, USD, GBP, ...) printed directly in the
 *    statement -- e.g. "Statement of Transactions ... in INR for the
 *    period ..." (this exact phrasing appears in the real ICICI statement
 *    this was built against). Unambiguous when present.
 * 2. Currency symbols (₹, £, €, ¥) -- reliable except for "$", which is used
 *    by many countries (USD, CAD, AUD, SGD, ...), so a bare "$" only counts
 *    as weak evidence for USD specifically, not a confident match.
 * 3. A bank-based fallback: if we've named-detected the issuing bank (see
 *    bank-detection.ts) and know which currency that bank's home country
 *    uses, fall back to that.
 *
 * If none of these produce a match, returns null rather than silently
 * defaulting to USD -- asserting a currency the statement never actually
 * showed is exactly the bug this module exists to avoid. Callers should
 * format amounts as plain grouped numbers (no currency symbol) when this
 * returns null.
 */

const ISO_CODE_RE = /\b(INR|USD|GBP|EUR|AUD|CAD|SGD|AED|JPY|CNY|CHF|NZD|ZAR|PKR)\b/g;

const SYMBOL_MAP: Array<{ symbol: string; currency: string }> = [
  { symbol: "₹", currency: "INR" },
  { symbol: "£", currency: "GBP" },
  { symbol: "€", currency: "EUR" },
  { symbol: "¥", currency: "JPY" },
];

// Bank -> currency of the country that bank operates in. Only used as a last
// resort when the statement text itself has no explicit currency evidence.
const BANK_CURRENCY_FALLBACK: Partial<Record<BankId, string>> = {
  chase: "USD",
  bofa: "USD",
  wells_fargo: "USD",
  icici: "INR",
  hdfc: "INR",
  sbi: "INR",
};

export function detectCurrency(fullText: string, bankId: BankId | null): string | null {
  const isoMatches = fullText.match(ISO_CODE_RE);
  if (isoMatches && isoMatches.length > 0) {
    const counts = new Map<string, number>();
    for (const code of isoMatches) counts.set(code, (counts.get(code) ?? 0) + 1);
    let best: string | null = null;
    let bestCount = 0;
    for (const [code, count] of counts) {
      if (count > bestCount) {
        best = code;
        bestCount = count;
      }
    }
    if (best) return best;
  }

  for (const { symbol, currency } of SYMBOL_MAP) {
    if (fullText.includes(symbol)) return currency;
  }
  if (fullText.includes("$")) return "USD"; // weakest signal, but still better than a silent default elsewhere

  if (bankId && BANK_CURRENCY_FALLBACK[bankId]) {
    return BANK_CURRENCY_FALLBACK[bankId]!;
  }

  return null;
}

/** Formats a number as currency using the detected code, or as a plain grouped number if currency is unknown -- never silently asserts a currency the statement didn't show. */
export function formatAmount(n: number, currency: string | null): string {
  if (currency) {
    try {
      return n.toLocaleString(undefined, { style: "currency", currency });
    } catch {
      // Invalid/unsupported ISO code somehow made it through detection -- fall through to plain formatting.
    }
  }
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
