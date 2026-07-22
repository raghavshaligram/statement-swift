import * as XLSX from "xlsx";
import type { Transaction } from "../statement-store";
import type { ExportOptions } from "./types";
import { sortByDate, triggerDownload } from "./types";

/** Groups transactions by their source statement file, for "one sheet per statement". */
function groupByFile(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const arr = map.get(t.sourceFile) ?? [];
    arr.push(t);
    map.set(t.sourceFile, arr);
  }
  return map;
}

function buildSheetRows(transactions: Transaction[], options: ExportOptions) {
  const rows: Record<string, string | number>[] = [];
  for (const t of sortByDate(transactions)) {
    const row: Record<string, string | number> = {
      Date: t.date,
      Description: t.description,
    };
    if (options.splitDebitCredit) {
      row["Debit"] = t.amount < 0 ? Math.abs(t.amount) : "";
      row["Credit"] = t.amount > 0 ? t.amount : "";
    } else {
      row["Amount"] = t.amount;
    }
    if (options.includeBalance) row["Balance"] = t.balance ?? "";
    if (options.includeSourcePage) row["Source Page"] = t.sourcePage;
    rows.push(row);
  }
  return rows;
}

export function exportToXlsx(
  transactions: Transaction[],
  options: ExportOptions,
  fileName: string,
  oneSheetPerStatement: boolean
) {
  const wb = XLSX.utils.book_new();

  if (oneSheetPerStatement) {
    const groups = groupByFile(transactions);
    let i = 0;
    for (const [sourceFile, txns] of groups) {
      i++;
      const sheetName = sanitizeSheetName(sourceFile, i);
      const ws = XLSX.utils.json_to_sheet(buildSheetRows(txns, options));
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  } else {
    const ws = XLSX.utils.json_to_sheet(buildSheetRows(transactions, options));
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  }

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  triggerDownload(blob, fileName);
}

function sanitizeSheetName(name: string, index: number): string {
  // Excel sheet names: max 31 chars, no []:*?/\
  const cleaned = name.replace(/\.[^.]+$/, "").replace(/[\[\]:*?/\\]/g, "");
  const truncated = cleaned.slice(0, 25) || `Statement`;
  return `${truncated}_${index}`.slice(0, 31);
}
