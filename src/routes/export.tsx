import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileSpreadsheet, FileText, FileCode, FileType, Check, ShieldCheck, Download, ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Export · LedgerLocal" },
      { name: "description", content: "Export to Excel, CSV, Tally XML, OFX, QIF, QBO." },
      { property: "og:title", content: "Export · LedgerLocal" },
      { property: "og:description", content: "Six export formats. All generated on your device." },
    ],
  }),
  component: ExportPage,
});

const FORMATS = [
  { key: "xlsx", name: "Excel", ext: ".xlsx", icon: FileSpreadsheet, desc: "Native Microsoft Excel workbook with formatted columns.", tone: "emerald", ready: true },
  { key: "csv",  name: "CSV",   ext: ".csv",  icon: FileText,        desc: "Universal comma-separated. Opens in anything.",       tone: "slate",  ready: true },
  { key: "tally", name: "Tally XML", ext: ".xml", icon: FileCode,    desc: "Direct import into Tally Prime / ERP 9 daybook.",     tone: "slate", ready: false },
  { key: "ofx", name: "OFX",   ext: ".ofx",  icon: FileType,        desc: "Open Financial Exchange — Quicken, Money.",           tone: "slate", ready: false },
  { key: "qif", name: "QIF",   ext: ".qif",  icon: FileType,        desc: "Legacy Quicken import format.",                       tone: "slate", ready: false },
  { key: "qbo", name: "QBO",   ext: ".qbo",  icon: FileType,        desc: "QuickBooks Web Connect — imports as a bank feed.",    tone: "slate", ready: false },
];

function ExportPage() {
  const [selected, setSelected] = useState<string>("xlsx");
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});

  return (
    <AppShell
      title="Export"
      step={3}
      toolbar={
        <Link
          to="/preview"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to preview
        </Link>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-emerald/30 bg-emerald-soft/40 px-4 py-3 text-sm text-accent-foreground">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald" />
            All exports are generated locally in your browser — no data leaves your device.
          </span>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Choose an export format
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATS.map((f) => {
              const active = selected === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setSelected(f.key)}
                  className={`group relative rounded-xl border p-5 text-left transition ${
                    active
                      ? "border-emerald bg-emerald-soft/40 shadow-sm"
                      : "border-border bg-card hover:border-emerald/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      f.tone === "emerald" ? "bg-emerald text-primary-foreground" : "bg-surface-muted text-ink"
                    }`}>
                      <f.icon className="h-5 w-5" />
                    </div>
                    {!f.ready && (
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Beta
                      </span>
                    )}
                    {active && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-base font-semibold text-ink">{f.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{f.ext}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Options + action */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <div className="text-sm font-semibold text-ink">Export options</div>
            <div className="mt-4 space-y-3 text-sm">
              <Toggle label="Include running balance column" defaultChecked />
              <Toggle label="Split debit / credit into separate columns" />
              <Toggle label="Normalize dates to ISO (YYYY-MM-DD)" defaultChecked />
              <Toggle label="Include source-page reference column" />
              <Toggle label="One sheet per statement (Excel only)" defaultChecked />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-ink p-5 text-background">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald">
              Ready to export
            </div>
            <div className="mt-2 text-lg font-semibold">
              statements-jun-2025{FORMATS.find((f) => f.key === selected)?.ext}
            </div>
            <div className="mt-1 text-xs text-background/60">
              20 transactions · 1 statement · ~12 KB
            </div>
            <button
              onClick={() => setDownloaded((s) => ({ ...s, [selected]: true }))}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-emerald/90"
            >
              <Download className="h-4 w-4" />
              {downloaded[selected] ? "Downloaded — click to re-download" : `Download ${FORMATS.find((f) => f.key === selected)?.name}`}
            </button>
            <div className="mt-3 text-center text-[11px] text-background/50">
              Generated locally · nothing uploaded
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold text-ink">What's next?</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
            <NextCard title="Convert another statement" body="Your queue is cleared — drop a new PDF." to="/upload" />
            <NextCard title="Set up bank rules (Pro)" body="Auto-categorize repeat merchants across statements." to="/pricing" />
            <NextCard title="Get Pro" body="Unlimited pages, all six formats, no credits." to="/pricing" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <label className="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2">
      <span className="text-ink">{label}</span>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative h-5 w-9 rounded-full transition ${on ? "bg-emerald" : "bg-border"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition ${on ? "left-4" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function NextCard({ title, body, to }: { title: string; body: string; to: "/upload" | "/pricing" }) {
  return (
    <Link to={to} className="rounded-lg border border-border bg-surface-muted/40 p-4 transition hover:border-emerald hover:bg-emerald-soft/30">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{body}</div>
    </Link>
  );
}
