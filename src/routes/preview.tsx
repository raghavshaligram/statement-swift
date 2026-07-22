import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, Download, ArrowRight, Check, AlertCircle, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Preview & edit · Ledgerly" },
      { name: "description", content: "Review extracted transactions before export." },
      { property: "og:title", content: "Preview & edit · Ledgerly" },
      { property: "og:description", content: "Editable transaction table with inline correction." },
    ],
  }),
  component: PreviewPage,
});

type Txn = {
  id: number;
  date: string;
  description: string;
  amount: number;
  balance: number;
  flagged?: boolean;
};

const MOCK: Txn[] = [
  { id: 1, date: "2025-06-01", description: "Opening balance", amount: 0, balance: 12480.32 },
  { id: 2, date: "2025-06-02", description: "SALARY CREDIT · ACME CORP", amount: 4820.00, balance: 17300.32 },
  { id: 3, date: "2025-06-03", description: "UPI/AMAZON RETAIL/8823", amount: -129.99, balance: 17170.33 },
  { id: 4, date: "2025-06-04", description: "STARBUCKS #4402 SEATTLE", amount: -7.85, balance: 17162.48 },
  { id: 5, date: "2025-06-05", description: "RENT — LANDLORD ACH", amount: -2100.00, balance: 15062.48 },
  { id: 6, date: "2025-06-06", description: "IMPS/HDFC XFER/PRIYA S", amount: -450.00, balance: 14612.48, flagged: true },
  { id: 7, date: "2025-06-07", description: "COSTCO WHOLESALE #221", amount: -218.44, balance: 14394.04 },
  { id: 8, date: "2025-06-08", description: "INTEREST CREDIT", amount: 12.18, balance: 14406.22 },
  { id: 9, date: "2025-06-10", description: "NETFLIX SUBSCRIPTION", amount: -15.49, balance: 14390.73 },
  { id: 10, date: "2025-06-11", description: "UBER TRIP · SFO", amount: -42.30, balance: 14348.43 },
  { id: 11, date: "2025-06-12", description: "ZELLE FROM J. LEE", amount: 300.00, balance: 14648.43 },
  { id: 12, date: "2025-06-14", description: "ICICI CC AUTOPAY", amount: -1250.00, balance: 13398.43 },
  { id: 13, date: "2025-06-15", description: "WHOLE FOODS MARKET #10", amount: -87.62, balance: 13310.81 },
  { id: 14, date: "2025-06-17", description: "REFUND · AMAZON", amount: 24.99, balance: 13335.80 },
  { id: 15, date: "2025-06-19", description: "APPLE.COM/BILL", amount: -0.99, balance: 13334.81 },
  { id: 16, date: "2025-06-20", description: "SBI NEFT · CONSULTING FEE", amount: 1800.00, balance: 15134.81 },
  { id: 17, date: "2025-06-22", description: "ELECTRIC BILL · CON ED", amount: -134.20, balance: 15000.61 },
  { id: 18, date: "2025-06-24", description: "SHELL OIL 12938", amount: -58.42, balance: 14942.19 },
  { id: 19, date: "2025-06-27", description: "ATM WITHDRAWAL", amount: -200.00, balance: 14742.19 },
  { id: 20, date: "2025-06-30", description: "CLOSING BALANCE", amount: 0, balance: 14742.19 },
];

function PreviewPage() {
  const [rows, setRows] = useState<Txn[]>(MOCK);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ id: number; field: keyof Txn } | null>(null);

  const filtered = useMemo(
    () => rows.filter((r) => r.description.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const credits = rows.reduce((s, r) => s + (r.amount > 0 ? r.amount : 0), 0);
  const debits = rows.reduce((s, r) => s + (r.amount < 0 ? -r.amount : 0), 0);

  function update(id: number, field: keyof Txn, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === "amount" || field === "balance" ? parseFloat(value) || 0 : value }
          : r
      )
    );
  }

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
        {/* Summary strip */}
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard label="Transactions" value={rows.length.toString()} />
          <SummaryCard label="Total credits" value={fmt(credits)} tone="pos" />
          <SummaryCard label="Total debits" value={fmt(debits)} tone="neg" />
          <SummaryCard label="Closing balance" value={fmt(rows.at(-1)?.balance ?? 0)} />
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
                      onCommit={(v) => { update(r.id, "date", v); setEditing(null); }}
                      className="font-mono text-xs text-ink"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {r.flagged && (
                        <span title="Low confidence">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        </span>
                      )}
                      <EditableCell
                        value={r.description}
                        editing={editing?.id === r.id && editing.field === "description"}
                        onEdit={() => setEditing({ id: r.id, field: "description" })}
                        onCommit={(v) => { update(r.id, "description", v); setEditing(null); }}
                        className="text-ink"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <EditableCell
                      value={r.amount.toFixed(2)}
                      editing={editing?.id === r.id && editing.field === "amount"}
                      onEdit={() => setEditing({ id: r.id, field: "amount" })}
                      onCommit={(v) => { update(r.id, "amount", v); setEditing(null); }}
                      className={`font-mono tabular-nums ${r.amount > 0 ? "text-emerald" : r.amount < 0 ? "text-destructive" : "text-muted-foreground"}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-ink/80">
                    {r.balance.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}
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
            {rows.length} transactions extracted with 99.2% confidence · 1 row flagged for review
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

function fmt(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
