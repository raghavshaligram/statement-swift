import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/coming-soon";

// TODO: replace with a full Chase-specific bank-statement-to-Excel guide.
export const Route = createFileRoute("/chase-bank-statement-to-excel")({
  head: () => ({
    meta: [
      { title: "Chase Bank Statement to Excel — LedgerLocal" },
      { name: "description", content: "Convert a Chase PDF bank statement to Excel, on-device." },
    ],
  }),
  component: () => (
    <ComingSoonPage
      title="Chase bank statement to Excel"
      blurb="A Chase-specific walkthrough is on the way. LedgerLocal already has a parser profile for Chase statements — drop one in and try it now."
    />
  ),
});
