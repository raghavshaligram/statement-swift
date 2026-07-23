import { extractPdfText } from "./extract-text";
import { parseTransactionsFromPages } from "./parse-transactions";
import { detectBank, BANK_LABELS } from "./bank-detection";
import { detectCurrency } from "./detect-currency";
import type { ParsedStatement, Transaction } from "../statement-store";

export async function parseStatementFile(
  file: File,
  onPageParsed?: (pageNumber: number, totalPages: number) => void
): Promise<ParsedStatement> {
  const warnings: string[] = [];

  let extracted;
  try {
    extracted = await extractPdfText(file, onPageParsed);
  } catch (err) {
    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      pageCount: 0,
      detectedBank: null,
      currency: null,
      transactions: [],
      warnings: [
        `Couldn't read this PDF (${err instanceof Error ? err.message : "unknown error"}). ` +
          `It may be password-protected, scanned/image-only, or corrupted.`,
      ],
    };
  }

  const bankId = detectBank(extracted.fullText);
  const detectedBank = bankId === "unknown" ? null : BANK_LABELS[bankId];
  if (bankId === "unknown") {
    warnings.push(
      "Bank not recognized from statement text — used the generic layout parser. Double-check extracted rows before exporting."
    );
  }

  const currency = detectCurrency(extracted.fullText, bankId === "unknown" ? null : bankId);
  if (!currency) {
    warnings.push(
      "Couldn't detect this statement's currency — amounts are shown as plain numbers below. Double-check before exporting if that matters for your records."
    );
  }

  const raw = parseTransactionsFromPages(extracted.pages, extracted.fullText);

  if (raw.length === 0) {
    warnings.push(
      "No transaction rows were detected. This statement's layout may not match the generic parser yet, or it may be a scanned/image-based PDF that needs OCR (not yet supported)."
    );
  }

  const lowConfidenceCount = raw.filter((t) => t.confidence === "low").length;
  if (lowConfidenceCount > 0) {
    warnings.push(
      `${lowConfidenceCount} row${lowConfidenceCount > 1 ? "s" : ""} had only one number detected (couldn't tell amount from balance) — flagged for manual review.`
    );
  }

  const transactions: Transaction[] = raw.map((t, i) => ({
    id: `${file.name}-${i}`,
    date: t.date,
    description: t.description,
    amount: t.amount,
    balance: t.balance,
    sourceFile: file.name,
    sourcePage: t.sourcePage,
    confidence: t.confidence,
  }));

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    pageCount: extracted.pageCount,
    detectedBank,
    currency,
    transactions,
    warnings,
  };
}
