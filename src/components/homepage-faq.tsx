/**
 * Section 9: FAQ. Categories match the design brief; answers are written to
 * be truthful about LedgerLocal's current feature set — no OCR/scanned-PDF
 * claims, no capabilities that aren't actually built.
 */
import { Link } from "@tanstack/react-router";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/scroll-reveal";

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How do I convert a statement?",
    a: "Drop a PDF into the converter on this page, or head to /upload. LedgerLocal reads the file and extracts transactions right in your browser — no signup needed to try it.",
  },
  {
    q: "Is it free?",
    a: "Yes, for occasional use. Free includes a handful of conversions a month with a per-statement page limit. Pro removes both limits for one flat monthly price — no credits, no per-page fees.",
  },
  {
    q: "Which banks and formats are supported?",
    a: "Parser profiles for major US, Indian, UK and European banks — Chase, Bank of America, Wells Fargo, ICICI, HDFC, SBI and more — plus a generic layout parser for anything else with a text-based PDF. Export to Excel, CSV, Tally XML, OFX, QIF, or QBO.",
  },
  {
    q: "Does it work with scanned PDFs?",
    a: "Not yet. LedgerLocal currently reads text-based PDF statements — the kind your bank generates directly, where the text can be selected and copied. Scanned or photographed statements need OCR, which isn't built yet.",
  },
  {
    q: "Can I import into QuickBooks?",
    a: "Yes — export to QBO or CSV and import directly into QuickBooks. Bank-specific import walkthroughs are on the way.",
  },
  {
    q: "Can I convert statements from multiple accounts at once?",
    a: "Yes. Drop statements from different accounts, or even different banks, together and LedgerLocal processes them as a batch.",
  },
  {
    q: "Is my data secure?",
    a: "Your statement never leaves your device — there's no upload step at all, so there's nothing in transit to intercept. You can confirm this yourself: open your browser's DevTools Network tab during a conversion and watch for outbound requests. There won't be any.",
  },
];

export function HomepageFaq() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Full plan details are on the{" "}
            <Link to="/pricing" className="font-medium text-emerald hover:underline">
              pricing page
            </Link>
            .
          </p>
        </ScrollReveal>

        <ScrollRevealGroup className="mt-10 space-y-4">
          {FAQ.map(({ q, a }) => (
            <ScrollRevealItem key={q}>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="font-semibold text-ink">{q}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
