import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/coming-soon";

// TODO: replace with a full bank-statement-to-Tally-XML import guide.
export const Route = createFileRoute("/bank-statement-to-tally")({
  head: () => ({
    meta: [
      { title: "Bank Statement to Tally — LedgerLocal" },
      { name: "description", content: "Convert a PDF bank statement to Tally-ready XML, on-device." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="Bank statement to Tally"
      blurb="A step-by-step guide for exporting your bank statement as Tally XML and importing it is on the way. LedgerLocal already exports Tally XML today."
    />
  ),
});
