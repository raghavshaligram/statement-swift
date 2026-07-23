import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — LedgerLocal" },
      {
        name: "description",
        content:
          "One flat price. Unlimited pages. No credits, no per-page fees. Try LedgerLocal free without signing up.",
      },
      { property: "og:title", content: "Pricing — LedgerLocal" },
      { property: "og:description", content: "Flat monthly Pro plan. No credits, no page caps." },
    ],
  }),
  component: Pricing,
});

const FREE = [
  ["5 conversions per month", true],
  ["Up to 20 pages per statement", true],
  ["Excel (.xlsx) and CSV export", true],
  ["Named bank detection + generic parser for any bank", true],
  ["On-device processing", true],
  ["Tally XML, OFX, QIF, QBO", false],
] as const;

const PRO = [
  ["Unlimited conversions", true],
  ["Unlimited pages per statement", true],
  ["All six export formats", true],
  ["Named bank detection + generic parser for any bank", true],
  ["On-device processing", true],
  ["Priority parser requests", true],
] as const;

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Pricing
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            One flat price. Unlimited everything.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No credits. No page limits. No per-page fees. The way software pricing is supposed to work.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 px-6 lg:grid-cols-2">
          {/* FREE */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Free</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-ink">$0</span>
              <span className="text-sm text-muted-foreground">no signup required</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              For the occasional statement or trying LedgerLocal out.
            </p>
            <Link
              to="/upload"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-ink bg-background px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              Start converting — no account
            </Link>
            <ul className="mt-8 space-y-3 text-sm">
              {FREE.map(([label, ok]) => (
                <li key={label as string} className="flex items-start gap-3">
                  {ok ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className={ok ? "text-ink" : "text-muted-foreground/70 line-through"}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* PRO */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald bg-ink p-8 text-background shadow-xl shadow-emerald/10">
            <div className="absolute right-6 top-6 rounded-full bg-emerald px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Recommended
            </div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald">LedgerLocal Pro</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-sm text-background/60">/ month · flat</span>
            </div>
            <p className="mt-3 text-sm text-background/70">
              For accountants, bookkeepers, and anyone who converts more than 5 statements a month.
            </p>
            <Link
              to="/upload"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-emerald/90"
            >
              Get Pro
            </Link>
            <ul className="mt-8 space-y-3 text-sm">
              {PRO.map(([label]) => (
                <li key={label as string} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                  <span className="text-background/90">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Anti-competitor bar */}
        <div className="mx-auto mt-10 max-w-5xl px-6">
          <div className="rounded-xl border border-emerald/30 bg-emerald-soft/40 p-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-accent-foreground">
              <span className="inline-flex items-center gap-2"><InfinityIcon className="h-4 w-4 text-emerald" /> No credits</span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-2"><InfinityIcon className="h-4 w-4 text-emerald" /> No page limits</span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-2"><InfinityIcon className="h-4 w-4 text-emerald" /> No per-page fees</span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald" /> No expiry</span>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Competitors sell you 200-page "credit packs" that expire in 30 days. LedgerLocal Pro is
              flat monthly. Convert 3 pages or 30,000. Same price.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-ink">Common questions</h2>
          <dl className="mt-10 space-y-6">
            {[
              ["Is my statement really not uploaded?", "Correct. LedgerLocal parses PDFs entirely in your browser using WebAssembly. You can verify this in your browser's DevTools Network tab during a conversion — there are zero outbound requests carrying your file."],
              ["Do I need an account?", "No. You can use Free without signing up. An account is only needed if you want Pro (to attach a subscription)."],
              ["What if my bank isn't listed?", "LedgerLocal's generic parser handles most layouts automatically even without a named profile for your bank. If a specific bank isn't producing clean output, you can request a profile from the homepage."],
              ["Does LedgerLocal need an internet connection?", "Yes — you need to load the page like any web app, and Pro accounts need connectivity to verify your subscription. But your statement's content is processed entirely on your device once the page has loaded; the PDF itself is never sent anywhere."],
              ["Team plan?", "Yes — email us. Same flat idea, per-seat billing."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-lg border border-border bg-card p-5">
                <dt className="font-semibold text-ink">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
