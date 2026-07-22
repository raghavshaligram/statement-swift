import type { Transaction } from "../statement-store";
import type { ExportOptions } from "./types";
import { sortByDate, triggerDownload } from "./types";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportToCsv(transactions: Transaction[], options: ExportOptions, fileName: string) {
  const headers = ["Date", "Description"];
  if (options.splitDebitCredit) headers.push("Debit", "Credit");
  else headers.push("Amount");
  if (options.includeBalance) headers.push("Balance");
  if (options.includeSourcePage) headers.push("Source Page");

  const lines = [headers.join(",")];

  for (const t of sortByDate(transactions)) {
    const row: (string | number)[] = [t.date, t.description];
    if (options.splitDebitCredit) {
      row.push(t.amount < 0 ? Math.abs(t.amount).toFixed(2) : "", t.amount > 0 ? t.amount.toFixed(2) : "");
    } else {
      row.push(t.amount.toFixed(2));
    }
    if (options.includeBalance) row.push(t.balance !== null ? t.balance.toFixed(2) : "");
    if (options.includeSourcePage) row.push(t.sourcePage);
    lines.push(row.map(csvEscape).join(","));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, fileName);
}
