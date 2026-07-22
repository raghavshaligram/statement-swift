import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/coming-soon";

// TODO: replace with a full ICICI-specific bank-statement-to-Excel guide.
export const Route = createFileRoute("/icici-bank-statement-to-excel")({
  head: () => ({
    meta: [
      { title: "ICICI Bank Statement to Excel — LedgerLocal" },
      { name: "description", content: "Convert an ICICI Bank PDF statement to Excel, on-device." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="ICICI Bank statement to Excel"
      blurb="An ICICI-specific walkthrough is on the way. LedgerLocal already has a parser profile for ICICI Bank statements — drop one in and try it now."
    />
  ),
});
