import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/coming-soon";

// TODO: replace with a full bank-statement-to-OFX import guide.
export const Route = createFileRoute("/bank-statement-to-ofx")({
  head: () => ({
    meta: [
      { title: "Bank Statement to OFX — LedgerLocal" },
      { name: "description", content: "Convert a PDF bank statement to OFX, on-device." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="Bank statement to OFX"
      blurb="A step-by-step guide for exporting your bank statement as OFX and importing it into your accounting software is on the way. LedgerLocal already exports OFX today."
    />
  ),
});
