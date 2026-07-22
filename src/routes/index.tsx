import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Upload,
  FileSpreadsheet,
  Zap,
  Lock,
  Infinity as InfinityIcon,
  Check,
  ArrowRight,
  FileText,
  Table2,
  Download,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LedgerLocal — Bank Statement to Excel Software" },
      {
        name: "description",
        content:
          "Convert PDF bank statements to clean Excel spreadsheets on your device. Unlimited pages. Works with Chase, BofA, Wells Fargo, ICICI, HDFC, SBI, Axis, Kotak and more.",
      },
      { property: "og:title", content: "LedgerLocal — Bank Statement to Excel Software" },
      {
        property: "og:description",
        content: "100% on-device. Unlimited pages. Real software for real accountants.",
      },
    ],
  }),
  component: Landing,
});

const banks = [
  "Chase", "Bank of America", "Wells Fargo", "Citi", "Capital One",
  "ICICI", "HDFC", "SBI", "Axis", "Kotak", "Yes Bank", "IDFC First",
  "Barclays", "HSBC", "Santander", "RBC",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-fintech opacity-60" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-soft/40 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald" />
              Now supporting 400+ banks across US, India, UK & EU
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Bank statement to Excel <span className="text-emerald">software</span>
              <span className="block text-ink/70 sm:mt-2">100% on-device. Unlimited pages.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              LedgerLocal is desktop-grade software that runs entirely in your browser. Drop in a PDF
              statement, get a clean editable spreadsheet in seconds. No account. No upload. No
              per-page fees.
            </p>
          </div>

          {/* Upload panel */}
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-xl shadow-slate-900/5">
              <Link
                to="/upload"
                className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-emerald/40 bg-emerald-soft/30 px-8 py-14 transition hover:border-emerald hover:bg-emerald-soft/60"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm">
                  <Upload className="h-6 w-6 text-emerald" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-ink">
                    Drop PDF statements here
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    or click to browse — multi-file supported · up to 500 pages each
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-background transition group-hover:bg-ink/90">
                  Launch LedgerLocal
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald">
                  <Lock className="h-3.5 w-3.5" /> Processed on your device — nothing uploaded, ever
                </span>
                <span>·</span>
                <span>No signup to try</span>
                <span>·</span>
                <span>Works offline once loaded</span>
              </div>
            </div>

            {/* trust bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <TrustPill icon={ShieldCheck} label="SOC 2 architecture" />
              <TrustPill icon={Lock} label="Zero-server privacy" />
              <TrustPill icon={InfinityIcon} label="No page caps on Pro" />
              <TrustPill icon={Zap} label="~4s per 20-page statement" />
            </div>
          </div>
        </div>
      </section>

      {/* BANK SUPPORT */}
      <section id="banks" className="border-b border-border bg-surface-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald">
              Global coverage from day one
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Works with Chase, ICICI, HDFC, Wells Fargo — and 400+ more
            </h2>
            <p className="mt-4 text-muted-foreground">
              LedgerLocal ships with parser profiles for major US, Indian, UK and European banks.
              Custom layouts? The generic engine handles those too.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {banks.map((b) => (
              <div
                key={b}
                className="flex h-16 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold text-ink/80"
              >
                {b}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't see yours?{" "}
            <a href="#" className="font-medium text-emerald hover:underline">
              Request a bank profile →
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              From messy PDF to clean spreadsheet in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <StepCard
              n={1}
              icon={FileText}
              title="Drop your statements"
              body="Drag one or many PDF statements into LedgerLocal. Multi-account bundles are handled automatically."
            />
            <StepCard
              n={2}
              icon={Table2}
              title="Review & correct"
              body="Extracted transactions land in an editable table. Spot-check anything before export — inline edits, split rows, categorize."
            />
            <StepCard
              n={3}
              icon={Download}
              title="Export anywhere"
              body="Excel, CSV, Tally XML, OFX, QIF, QBO. Drop straight into QuickBooks, Xero, Tally or your ledger."
            />
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="border-b border-border bg-ink py-20 text-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald">
              <ShieldCheck className="h-3.5 w-3.5" /> Why on-device matters
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your bank statements never leave your device.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-background/70">
              Competing "converters" upload your PDF to their servers, parse it there, then email
              you the result. LedgerLocal parses everything locally using WebAssembly — the file never
              touches the network. You can literally unplug your ethernet cable mid-conversion.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Zero server-side processing — no logs, no retention",
                "Works fully offline after first load",
                "Open, auditable client-side pipeline",
                "No account required, ever",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                  <span className="text-background/85">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-emerald/90">
              <div className="mb-2 text-background/40">// network activity during conversion</div>
              <div>[ledgerlocal] loading pdf.wasm ................. ok</div>
              <div>[ledgerlocal] parsing hdfc-statement-oct.pdf</div>
              <div>[ledgerlocal] page 1 → 14 transactions</div>
              <div>[ledgerlocal] page 2 → 22 transactions</div>
              <div>[ledgerlocal] ...</div>
              <div className="mt-2 text-emerald">[ledgerlocal] uploads to server: 0</div>
              <div className="text-emerald">[ledgerlocal] pdf leaves device: never</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-background/60">
              <Lock className="h-3.5 w-3.5" />
              You can verify this in your browser's DevTools → Network tab.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Try it now. No signup, no upload.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Convert your first statements free. Upgrade to Pro for unlimited pages — one flat price,
            no credits, no per-page fees.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-background transition hover:bg-ink/90"
            >
              <Upload className="h-4 w-4" /> Convert a statement
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function TrustPill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-emerald" />
      {label}
    </span>
  );
}

function StepCard({
  n, icon: Icon, title, body,
}: { n: number; icon: any; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-soft text-emerald">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {n}
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
