import { useEffect, useRef, useState } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { formatAmount } from "@/lib/pdf/detect-currency";
import { getConfidenceTier } from "@/lib/pdf/confidence";
import type { Transaction } from "@/lib/statement-store";
import { cn } from "@/lib/utils";

/**
 * Real side-by-side transaction review: raw statement text on the left,
 * extracted transaction cards on the right, hover-synced between the two.
 * Ported from the Figma design reference (LedgerLocalUIDesignSystem repo's
 * SideBySidePane), adapted for our actual data model -- a signed `amount`
 * field with real multi-currency formatting, rather than the reference's
 * separate credit/debit fields and hardcoded INR formatter.
 */

interface SideBySidePaneProps {
  transactions: Transaction[];
  currency: string | null;
  headerLine?: string;
}

export function SideBySidePane({ transactions, currency, headerLine }: SideBySidePaneProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeId === null) return;
    leftRef.current?.querySelector<HTMLElement>(`[data-txid="${activeId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    rightRef.current?.querySelector<HTMLElement>(`[data-cardid="${activeId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const flaggedCount = transactions.filter((t) => getConfidenceTier(t.confidence) === "low").length;
  const avgConf = transactions.reduce((s, t) => s + t.confidence, 0) / (transactions.length || 1);
  const totalsOk = avgConf >= 88 && flaggedCount === 0;

  return (
    <div className="grid overflow-hidden rounded-xl border border-border bg-card shadow-md lg:grid-cols-2">
      {/* Left: raw source text */}
      <div className="flex flex-col border-r border-border">
        <div className="shrink-0 border-b border-border bg-surface-muted/60 px-4 py-3">
          <p className="truncate font-mono text-[11px] text-muted-foreground">{headerLine ?? "Original statement"}</p>
        </div>
        <div ref={leftRef} className="overflow-auto" style={{ maxHeight: "480px" }}>
          <div className="space-y-0.5 p-3">
            {transactions.map((tx, i) =>
              tx.sourceLines.map((line, li) => (
                <div
                  key={`${tx.id}-${li}`}
                  data-txid={li === 0 ? tx.id : undefined}
                  onMouseEnter={() => setActiveId(tx.id)}
                  onMouseLeave={() => setActiveId(null)}
                  className={cn(
                    "flex cursor-default items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-100",
                    activeId === tx.id ? "bg-emerald-soft" : "hover:bg-surface-muted/50"
                  )}
                >
                  {li === 0 ? (
                    <span
                      className={cn(
                        "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold transition-colors duration-100",
                        activeId === tx.id ? "bg-emerald text-primary-foreground" : "bg-surface-muted text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </span>
                  ) : (
                    <span className="w-5 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "break-all font-mono text-[10.5px] leading-relaxed transition-colors duration-100",
                      activeId === tx.id ? "text-accent-foreground" : "text-muted-foreground/80"
                    )}
                  >
                    {line}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: extracted transaction cards */}
      <div className="flex flex-col bg-card">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-bold text-ink">Extracted transactions</span>
          {totalsOk ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald-soft px-2.5 py-1 text-[10px] font-semibold text-accent-foreground">
              <Check className="h-2.5 w-2.5" /> Totals verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
              <AlertTriangle className="h-2.5 w-2.5" /> Review flagged rows
            </span>
          )}
        </div>

        <div ref={rightRef} className="flex-1 space-y-2 overflow-auto p-3" style={{ maxHeight: "480px" }}>
          {transactions.map((tx, i) => {
            const isActive = tx.id === activeId;
            const isCredit = tx.amount > 0;
            const tier = getConfidenceTier(tx.confidence);
            return (
              <div
                key={tx.id}
                data-cardid={tx.id}
                onMouseEnter={() => setActiveId(tx.id)}
                onMouseLeave={() => setActiveId(null)}
                className={cn(
                  "flex cursor-default items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150",
                  isActive ? "border-emerald/40 bg-emerald-soft/60 shadow-sm ring-1 ring-emerald/20" : "border-border bg-background hover:bg-surface-muted/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-colors duration-100",
                    isActive ? "bg-emerald text-primary-foreground" : "bg-surface-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-snug text-ink">{tx.description}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
                <span className={cn("shrink-0 font-mono text-sm font-bold tabular-nums", isCredit ? "text-emerald" : "text-destructive")}>
                  {isCredit ? "+" : "−"}
                  {formatAmount(Math.abs(tx.amount), currency)}
                </span>
                <span className="w-10 shrink-0 text-right">
                  {tier !== "low" ? (
                    <span className="font-mono text-[10px] text-muted-foreground">{tx.confidence}%</span>
                  ) : (
                    <AlertTriangle className="inline h-3 w-3 text-amber-500" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {flaggedCount > 0 && (
          <div className="shrink-0 border-t border-border bg-surface-muted/30 px-4 py-2.5">
            <p className="text-[11px] text-muted-foreground">
              {flaggedCount} of {transactions.length} rows flagged for a second look
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
