import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/coming-soon";

// TODO: replace with a full bank-statement-to-QIF import guide.
export const Route = createFileRoute("/bank-statement-to-qif")({
  head: () => ({
    meta: [
      { title: "Bank Statement to QIF — LedgerLocal" },
      { name: "description", content: "Convert a PDF bank statement to QIF, on-device." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="Bank statement to QIF"
      blurb="A step-by-step guide for exporting your bank statement as QIF is on the way. LedgerLocal already exports QIF today."
    />
  ),
});
