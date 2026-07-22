import type { Transaction } from "../statement-store";
import { exportToXlsx } from "./to-xlsx";
import { exportToCsv } from "./to-csv";
import { exportToTallyXml } from "./to-tally-xml";
import { exportToOfx } from "./to-ofx";
import { exportToQif } from "./to-qif";
import { exportToQbo } from "./to-qbo";
import { DEFAULT_EXPORT_OPTIONS, type ExportOptions } from "./types";

export type ExportFormat = "xlsx" | "csv" | "tally" | "ofx" | "qif" | "qbo";

export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  xlsx: ".xlsx",
  csv: ".csv",
  tally: ".xml",
  ofx: ".ofx",
  qif: ".qif",
  qbo: ".qbo",
};

export function runExport(
  format: ExportFormat,
  transactions: Transaction[],
  baseFileName: string,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS,
  oneSheetPerStatement = true
) {
  const fileName = `${baseFileName}${FORMAT_EXTENSIONS[format]}`;

  switch (format) {
    case "xlsx":
      return exportToXlsx(transactions, options, fileName, oneSheetPerStatement);
    case "csv":
      return exportToCsv(transactions, options, fileName);
    case "tally":
      return exportToTallyXml(transactions, fileName);
    case "ofx":
      return exportToOfx(transactions, fileName);
    case "qif":
      return exportToQif(transactions, fileName);
    case "qbo":
      return exportToQbo(transactions, fileName);
  }
}

export type { ExportOptions };
export { DEFAULT_EXPORT_OPTIONS };
