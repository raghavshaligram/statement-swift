import type { Transaction } from "../statement-store";

export type ExportOptions = {
  includeBalance: boolean;
  splitDebitCredit: boolean;
  normalizeDatesIso: boolean;
  includeSourcePage: boolean;
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeBalance: true,
  splitDebitCredit: false,
  normalizeDatesIso: true,
  includeSourcePage: false,
};

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on a delay so Safari/Firefox reliably finish the download first.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Formats a date for display in non-ISO exports (MM/DD/YYYY), given our internal ISO string. */
export function isoToUs(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[2]}/${m[3]}/${m[1]}`;
}

export function money(n: number): string {
  return n.toFixed(2);
}

export function sortByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => a.date.localeCompare(b.date));
}
