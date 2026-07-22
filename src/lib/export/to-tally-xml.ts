import type { Transaction } from "../statement-store";
import { sortByDate, triggerDownload } from "./types";

/**
 * Generates a Tally-importable XML voucher file (bank statement / daybook style).
 * Each transaction becomes a single "Bank" voucher with one Payment or Receipt
 * ledger entry against the bank ledger — the simplest structure Tally Prime /
 * ERP 9 will accept for a straight bank-statement import. Real-world Tally
 * imports often need a specific ledger name mapped on the ERP side; we default
 * to a placeholder "Bank Account" ledger name that the user can find-and-replace.
 */

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tallyDate(iso: string): string {
  // Tally expects YYYYMMDD
  return iso.replace(/-/g, "");
}

export function exportToTallyXml(transactions: Transaction[], fileName: string, bankLedgerName = "Bank Account") {
  const vouchers = sortByDate(transactions)
    .map((t) => {
      const isCredit = t.amount > 0;
      const voucherType = isCredit ? "Receipt" : "Payment";
      const amount = Math.abs(t.amount).toFixed(2);
      return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
        <DATE>${tallyDate(t.date)}</DATE>
        <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
        <NARRATION>${xmlEscape(t.description)}</NARRATION>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${xmlEscape(bankLedgerName)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${isCredit ? "No" : "Yes"}</ISDEEMEDPOSITIVE>
          <AMOUNT>${isCredit ? amount : `-${amount}`}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Suspense</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${isCredit ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
          <AMOUNT>${isCredit ? `-${amount}` : amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
      </VOUCHER>
    </TALLYMESSAGE>`;
    })
    .join("");

  const xml = `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>${vouchers}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  triggerDownload(blob, fileName);
}
