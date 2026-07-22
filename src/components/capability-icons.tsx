/**
 * Small looping visuals for the capability grid (Section 5). Same animation
 * language as how-it-works-icons.tsx — subtle scale/opacity loops, 2-3s
 * cycles, nothing spinning — just sized down for a denser grid.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, MousePointer2, Check, Plus } from "lucide-react";
import { ParseVisual } from "@/components/how-it-works-icons";

/** 1. On-device processing — reuses the same lock/shield pulse from How It Works. */
export function OnDeviceMiniVisual() {
  return (
    <div className="scale-[0.7] origin-left">
      <ParseVisual />
    </div>
  );
}

/** 2. Global bank coverage — a small chip cycling through bank names. */
const CYCLING_BANKS = ["Chase", "ICICI", "HDFC", "Bank of America"];

export function BankCoverageVisual() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % CYCLING_BANKS.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={CYCLING_BANKS[i]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-full bg-emerald-soft px-2 py-1 text-[9px] font-semibold text-accent-foreground"
        >
          {CYCLING_BANKS[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** 3. Six export formats — a small fan of file icons pulsing in sequence. */
export function ExportFormatsVisual() {
  const offsets = [-10, -4, 3, 10];
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      {offsets.map((x, i) => (
        <motion.div
          key={i}
          className="absolute flex h-6 w-5 items-center justify-center rounded-sm border border-emerald/30 bg-emerald-soft text-emerald"
          style={{ transformOrigin: "bottom center" }}
          animate={{
            rotate: [x * 0.6, x, x * 0.6],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          <FileText className="h-3 w-3" />
        </motion.div>
      ))}
    </div>
  );
}

/** 4. Multi-statement batch upload — stacked documents with a pulsing "+". */
export function BatchUploadVisual() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div className="absolute h-7 w-6 translate-x-1 translate-y-1 rounded-sm border border-border bg-card" />
      <div className="absolute flex h-7 w-6 items-center justify-center rounded-sm border border-emerald/40 bg-emerald-soft text-emerald">
        <FileText className="h-3.5 w-3.5" />
      </div>
      <motion.div
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald text-primary-foreground"
        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plus className="h-2.5 w-2.5" />
      </motion.div>
    </div>
  );
}

/** 5. Editable before export — a cursor pulsing into a table cell. */
export function EditableVisual() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div className="grid h-6 w-8 grid-cols-2 gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[2px] bg-surface-muted" />
        ))}
      </div>
      <motion.div
        className="absolute"
        animate={{ x: [6, 2, 6], y: [4, 2, 4], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <MousePointer2 className="h-3.5 w-3.5 text-emerald" fill="currentColor" fillOpacity={0.15} />
      </motion.div>
    </div>
  );
}

/** 6. No account required — a claim, not a feature; kept text-forward and de-emphasized. */
export function NoAccountVisual() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
      <Check className="h-4 w-4" />
    </div>
  );
}
