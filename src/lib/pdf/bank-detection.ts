/**
 * Bank detection: lightweight text-signature matching against the full extracted
 * text of a statement. This drives the UI label ("Detected: Chase") and lets us
 * apply small per-bank parsing hints (see bank-profiles.ts) — it is NOT a full
 * per-bank column-layout parser. That requires real sample statements to tune
 * against; until then every bank falls back to the generic row parser.
 */

export type BankId =
  | "chase"
  | "bofa"
  | "wells_fargo"
  | "icici"
  | "hdfc"
  | "sbi"
  | "unknown";

export const BANK_LABELS: Record<BankId, string> = {
  chase: "Chase",
  bofa: "Bank of America",
  wells_fargo: "Wells Fargo",
  icici: "ICICI Bank",
  hdfc: "HDFC Bank",
  sbi: "State Bank of India",
  unknown: "Unrecognized bank (generic parser)",
};

// Signatures are checked in order; first match wins. Keep specific/branded
// strings first so e.g. "chase.com" doesn't get shadowed by something generic.
const SIGNATURES: Array<{ id: BankId; patterns: RegExp[] }> = [
  { id: "chase", patterns: [/\bjpmorgan chase\b/i, /\bchase\.com\b/i, /\bchase bank\b/i] },
  { id: "bofa", patterns: [/\bbank of america\b/i, /\bbankofamerica\.com\b/i, /\bbofa\b/i] },
  { id: "wells_fargo", patterns: [/\bwells fargo\b/i, /\bwellsfargo\.com\b/i] },
  { id: "icici", patterns: [/\bicici bank\b/i, /\bicicibank\.com\b/i] },
  { id: "hdfc", patterns: [/\bhdfc bank\b/i, /\bhdfcbank\.com\b/i] },
  { id: "sbi", patterns: [/\bstate bank of india\b/i, /\bonlinesbi\b/i, /\bsbi\.co\.in\b/i] },
];

export function detectBank(fullText: string): BankId {
  for (const sig of SIGNATURES) {
    if (sig.patterns.some((p) => p.test(fullText))) return sig.id;
  }
  return "unknown";
}
