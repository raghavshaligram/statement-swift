import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Download, ArrowRight, Check, AlertCircle, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStatementStore } from "@/lib/statement-store";
import { formatAmount } from "@/lib/pdf/detect-currency";
import type { Transaction } from "@/lib/statement-store";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Preview & edit · LedgerLocal" },
      { name: "description", content: "Review extracted transactions before export." },
      { property: "og:title", content: "Preview & edit · LedgerLocal" },
      { property: "og:description", content: "Editable transaction table with inline correction." },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const nav = useNavigate();
  const statements = useStatementStore((s) => s.statements);
  const updateTransaction = useStatementStore((s) => s.updateTransaction);
  const deleteTransaction = useStatementStore((s) => s.deleteTransaction);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ id: string; field: keyof Transaction } | null>(null);

  const rows = useMemo(() => statements.flatMap((st) => st.transactions), [statements]);
  const warnings = useMemo(() => statements.flatMap((st) => st.warnings), [statements]);
  const currency = useMemo(() => statements.find((st) => st.currency)?.currency ?? null, [statements]);
  const flaggedCount = rows.filter((r) => r.confidence === "low").length;

  // No parsed statements in the store (e.g. direct nav, or a page refresh which
  // clears in-memory state) — send back to upload rather than show an empty table.
  useEffect(() => {
    if (statements.length === 0) nav({ to: "/upload" });
  }, [statements.length, nav]);

  const filtered = useMemo(
    () => rows.filter((r) => r.description.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const credits = rows.reduce((s, r) => s + (r.amount > 0 ? r.amount : 0), 0);
  const debits = rows.reduce((s, r) => s + (r.amount < 0 ? -r.amount : 0), 0);
  const lastWithBalance = [...rows].reverse().find((r) => r.balance !== null);

  function update(t: Transaction, field: keyof Transaction, value: string) {
    const patch: Partial<Transaction> =
      field === "amount" || field === "balance" ? { [field]: parseFloat(value) || 0 } : { [field]: value };
    updateTransaction(t.sourceFile, t.id, patch);
  }

  if (statements.length === 0) return null;

  return (
    <AppShell
      title="Preview & edit transactions"
      step={2}
      toolbar={
        <Link
          to="/export"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-background transition hover:bg-ink/90"
        >
          Continue to export <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-4">
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary strip */}
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard label="Transactions" value={rows.length.toString()} />
          <SummaryCard label="Total credits" value={formatAmount(credits, currency)} tone="pos" />
          <SummaryCard label="Total debits" value={formatAmount(debits, currency)} tone="neg" />
          <SummaryCard label="Closing balance" value={lastWithBalance ? formatAmount(lastWithBalance.balance!, currency) : "—"} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search descriptions…"
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Click any cell to edit · changes stay on your device
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="w-10 px-3 py-3"><input type="checkbox" /></th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3 text-right">Amount</th>
                <th className="px-3 py-3 text-right">Balance</th>
                <th className="w-10 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="group hover:bg-surface-muted/50">
                  <td className="px-3 py-2">
                    <input type="checkbox" />
                  </td>
                  <td className="px-3 py-2">
                    <EditableCell
                      value={r.date}
                      editing={editing?.id === r.id && editing.field === "date"}
                      onEdit={() => setEditing({ id: r.id, field: "date" })}
                      onCommit={(v) => { update(r, "date", v); setEditing(null); }}
                      className="font-mono text-xs text-ink"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {r.confidence === "low" && (
                        <span title="Low confidence — please verify">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        </span>
                      )}
                      <EditableCell
                        value={r.description}
                        editing={editing?.id === r.id && editing.field === "description"}
                        onEdit={() => setEditing({ id: r.id, field: "description" })}
                        onCommit={(v) => { update(r, "description", v); setEditing(null); }}
                        className="text-ink"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <EditableCell
                      value={r.amount.toFixed(2)}
                      editing={editing?.id === r.id && editing.field === "amount"}
                      onEdit={() => setEditing({ id: r.id, field: "amount" })}
                      onCommit={(v) => { update(r, "amount", v); setEditing(null); }}
                      className={`font-mono tabular-nums ${r.amount > 0 ? "text-emerald" : r.amount < 0 ? "text-destructive" : "text-muted-foreground"}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-ink/80">
                    {r.balance !== null ? r.balance.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => deleteTransaction(r.sourceFile, r.id)}
                      className="opacity-0 transition group-hover:opacity-100"
                      aria-label="Delete row"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-emerald/30 bg-emerald-soft/40 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-accent-foreground">
            <Check className="h-4 w-4 text-emerald" />
            {rows.length} transactions extracted
            {flaggedCount > 0 ? ` · ${flaggedCount} row${flaggedCount > 1 ? "s" : ""} flagged for review` : ""}
          </div>
          <Link
            to="/export"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-background hover:bg-ink/90"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-mono text-xl font-semibold tabular-nums ${
          tone === "pos" ? "text-emerald" : tone === "neg" ? "text-destructive" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function EditableCell({
  value, editing, onEdit, onCommit, className,
}: {
  value: string; editing: boolean; onEdit: () => void; onCommit: (v: string) => void; className?: string;
}) {
  if (editing) {
    return (
      <input
        autoFocus
        defaultValue={value}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onCommit((e.target as HTMLInputElement).value)}
        className={`w-full rounded border border-emerald bg-background px-1.5 py-0.5 outline-none ${className ?? ""}`}
      />
    );
  }
  return (
    <span onClick={onEdit} className={`cursor-text rounded px-1.5 py-0.5 hover:bg-surface-muted ${className ?? ""}`}>
      {value}
    </span>
  );
}


