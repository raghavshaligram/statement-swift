import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet, FileText, FileCode, FileType, Check, ShieldCheck, Download, ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStatementStore } from "@/lib/statement-store";
import { runExport, DEFAULT_EXPORT_OPTIONS, type ExportFormat, type ExportOptions } from "@/lib/export";

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

const FORMATS: Array<{
  key: ExportFormat; name: string; ext: string; icon: typeof FileSpreadsheet; desc: string; tone: string;
}> = [
  { key: "xlsx", name: "Excel", ext: ".xlsx", icon: FileSpreadsheet, desc: "Native Microsoft Excel workbook with formatted columns.", tone: "emerald" },
  { key: "csv",  name: "CSV",   ext: ".csv",  icon: FileText,        desc: "Universal comma-separated. Opens in anything.",       tone: "slate" },
  { key: "tally", name: "Tally XML", ext: ".xml", icon: FileCode,    desc: "Direct import into Tally Prime / ERP 9 daybook.",     tone: "slate" },
  { key: "ofx", name: "OFX",   ext: ".ofx",  icon: FileType,        desc: "Open Financial Exchange — Quicken, Money.",           tone: "slate" },
  { key: "qif", name: "QIF",   ext: ".qif",  icon: FileType,        desc: "Legacy Quicken import format.",                       tone: "slate" },
  { key: "qbo", name: "QBO",   ext: ".qbo",  icon: FileType,        desc: "QuickBooks Web Connect — imports as a bank feed.",    tone: "slate" },
];

function ExportPage() {
  const nav = useNavigate();
  const statements = useStatementStore((s) => s.statements);
  const rows = useMemo(() => statements.flatMap((st) => st.transactions), [statements]);

  useEffect(() => {
    if (statements.length === 0) nav({ to: "/upload" });
  }, [statements.length, nav]);

  const [selected, setSelected] = useState<ExportFormat>("xlsx");
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [oneSheetPerStatement, setOneSheetPerStatement] = useState(true);

  const baseFileName = useMemo(() => {
    const first = statements[0]?.fileName?.replace(/\.pdf$/i, "");
    return statements.length > 1 ? `${first}-and-${statements.length - 1}-more` : first || "statement";
  }, [statements]);

  // Mirrors the exact header-building logic in lib/export/to-csv.ts, so this
  // list always reflects what a real export will actually contain.
  const columnList = useMemo(() => {
    const cols = ["Date", "Description"];
    if (options.splitDebitCredit) cols.push("Debit", "Credit");
    else cols.push("Amount");
    if (options.includeBalance) cols.push("Balance");
    if (options.includeSourcePage) cols.push("Source Page");
    return cols;
  }, [options]);

  function handleDownload() {
    runExport(selected, rows, baseFileName, options, oneSheetPerStatement);
    setDownloaded((s) => ({ ...s, [selected]: true }));
  }

  if (statements.length === 0) return null;

  return (
    <AppShell
      title="Export"
      toolbar={
        <Link
          to="/preview"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-ink hover:bg-surface-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to preview
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-emerald/30 bg-emerald-soft/40 px-4 py-3 text-sm text-accent-foreground">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald" />
            All exports are generated locally in your browser — no data leaves your device.
          </span>
        </div>

        {/* Format + options (left) / summary panel (right) side by side --
            this pairing (not a stacked single column) is what the freed-up
            width from removing the sidebar buys us. */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Choose an export format
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-sm font-semibold text-ink">Export options</div>
              <div className="mt-4 space-y-3 text-sm">
                <Toggle
                  label="Include running balance column"
                  checked={options.includeBalance}
                  onChange={(v) => setOptions((o) => ({ ...o, includeBalance: v }))}
                />
                <Toggle
                  label="Split debit / credit into separate columns"
                  checked={options.splitDebitCredit}
                  onChange={(v) => setOptions((o) => ({ ...o, splitDebitCredit: v }))}
                />
                <Toggle
                  label="Normalize dates to ISO (YYYY-MM-DD)"
                  checked={options.normalizeDatesIso}
                  onChange={(v) => setOptions((o) => ({ ...o, normalizeDatesIso: v }))}
                />
                <Toggle
                  label="Include source-page reference column"
                  checked={options.includeSourcePage}
                  onChange={(v) => setOptions((o) => ({ ...o, includeSourcePage: v }))}
                />
                <Toggle
                  label="One sheet per statement (Excel only)"
                  checked={oneSheetPerStatement}
                  onChange={setOneSheetPerStatement}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-ink p-5 text-background">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald">
                Export summary
              </div>
              <dl className="mt-4 space-y-2.5 text-xs">
                <SummaryRow label="Format" value={`${FORMATS.find((f) => f.key === selected)?.name} (${FORMATS.find((f) => f.key === selected)?.ext})`} />
                <SummaryRow label="Rows" value={`${rows.length} transactions`} />
                <SummaryRow label="Columns" value={columnList.join(", ")} />
                <SummaryRow label="Header row" value="Yes" />
                <SummaryRow label="Source file" value={statements[0]?.fileName ?? baseFileName} mono />
              </dl>
              <button
                onClick={handleDownload}
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2">
      <span className="text-ink">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-emerald" : "bg-border"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition ${checked ? "left-4" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-background/50">{label}</dt>
      <dd className={`text-right text-background ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
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
