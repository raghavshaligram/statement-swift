import type { Transaction } from "../statement-store";
import type { ExportOptions } from "./types";
import { sortByDate, triggerDownload } from "./types";
import { formatAmount } from "../pdf/detect-currency";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmt(value: number, options: ExportOptions, currency: string | null): string {
  return options.includeCurrencySymbol ? formatAmount(value, currency) : value.toFixed(2);
}

export function exportToCsv(
  transactions: Transaction[],
  options: ExportOptions,
  fileName: string,
  currency: string | null = null
) {
  const headers = ["Date", "Description"];
  if (options.splitDebitCredit) headers.push("Debit", "Credit");
  else headers.push("Amount");
  if (options.includeBalance) headers.push("Balance");
  if (options.includeSourcePage) headers.push("Source Page");

  const lines = [headers.join(",")];

  for (const t of sortByDate(transactions)) {
    const row: (string | number)[] = [t.date, t.description];
    if (options.splitDebitCredit) {
      row.push(t.amount < 0 ? fmt(Math.abs(t.amount), options, currency) : "", t.amount > 0 ? fmt(t.amount, options, currency) : "");
    } else {
      row.push(fmt(t.amount, options, currency));
    }
    if (options.includeBalance) row.push(t.balance !== null ? fmt(t.balance, options, currency) : "");
    if (options.includeSourcePage) row.push(t.sourcePage);
    lines.push(row.map(csvEscape).join(","));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, fileName);
}
