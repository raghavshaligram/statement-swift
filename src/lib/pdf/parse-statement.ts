import { extractPdfText } from "./extract-text";
import { parseTransactionsFromPages } from "./parse-transactions";
import { detectBank, BANK_LABELS } from "./bank-detection";
import { detectCurrency } from "./detect-currency";
import { getConfidenceTier } from "./confidence";
import { ocrPdfToTextItems, looksLikeScannedPage } from "./ocr";
import type { PageText } from "./extract-text";
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

  // A page with almost no real text items is very likely a scanned/photographed
  // page (image-only), not a text-based PDF -- fall back to on-device OCR for
  // the whole document rather than silently returning nothing. This is
  // genuinely slower than normal text extraction, so only do it when the
  // fast path actually looks scanned, not on every upload.
  const scannedPageCount = extracted.pages.filter((p) => looksLikeScannedPage(p.items.length)).length;
  const looksScanned = extracted.pages.length > 0 && scannedPageCount / extracted.pages.length > 0.5;

  let usedOcr = false;
  if (looksScanned) {
    try {
      const ocrResult = await ocrPdfToTextItems(file, (e) => onPageParsed?.(e.sourcePage, e.totalPages));
      const ocrPages: PageText[] = ocrResult.pages.map((p) => ({
        pageNumber: p.pageNumber,
        items: p.items,
        rawText: p.rawText,
      }));
      const ocrFullText = ocrPages.map((p) => p.rawText).join("\n");
      // Only actually switch to the OCR result if it found meaningfully more
      // text than the fast path did -- if OCR also comes back empty (a truly
      // blank page, or an image OCR can't read), keep the original result
      // rather than silently discarding whatever little text was there.
      if (ocrFullText.trim().length > extracted.fullText.trim().length) {
        extracted = { pageCount: ocrResult.pageCount, pages: ocrPages, fullText: ocrFullText };
        usedOcr = true;
        warnings.push(
          "This looked like a scanned or photographed statement, so text was read using on-device OCR instead of a normal text layer. OCR is less precise than reading real text -- double-check extracted rows carefully before exporting."
        );
      }
    } catch (err) {
      warnings.push(
        `This looked like a scanned statement, but on-device OCR failed (${err instanceof Error ? err.message : "unknown error"}). Falling back to whatever text could be read directly, which may be incomplete.`
      );
    }
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
      usedOcr
        ? "No transaction rows were detected, even after OCR. This statement's layout may not match the generic parser yet, or the scan quality may be too low to read reliably."
        : "No transaction rows were detected. This statement's layout may not match the generic parser yet, or it may be a scanned/image-based PDF -- on-device OCR is attempted automatically when that's detected, but didn't find enough text this time."
    );
  }

  const lowConfidenceCount = raw.filter((t) => getConfidenceTier(t.confidence) === "low").length;
  if (lowConfidenceCount > 0) {
    warnings.push(
      `${lowConfidenceCount} row${lowConfidenceCount > 1 ? "s" : ""} scored below 75% confidence — flagged for manual review before exporting.`
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
    sourceLines: t.sourceLines,
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
