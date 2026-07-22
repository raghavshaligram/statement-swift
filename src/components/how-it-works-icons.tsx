/**
 * Small looping icon animations for the "How It Works" section (Section 2).
 * Subtle, continuous (repeat: Infinity), 2-3s cycles — scale/opacity pulses,
 * never spinning.
 */
import { motion } from "framer-motion";
import { FileText, ShieldCheck, FileSpreadsheet } from "lucide-react";

/** Step 1 — a statement icon sliding down into a dashed dropzone outline. */
export function DropVisual() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <div className="absolute inset-0 rounded-xl border-2 border-dashed border-emerald/40" />
      <motion.div
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-soft text-emerald shadow-sm"
        animate={{ y: [-10, 2, -10], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <FileText className="h-4 w-4" />
      </motion.div>
    </div>
  );
}

/** Step 2 — a lock/shield with a soft pulsing ring, reinforcing "nothing sent anywhere." */
export function ParseVisual() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <motion.div
        className="absolute h-9 w-9 rounded-full border-2 border-emerald/50"
        animate={{ scale: [1, 1.7], opacity: [0.55, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-soft text-emerald shadow-sm">
        <ShieldCheck className="h-4 w-4" />
      </div>
    </div>
  );
}

/** Step 3 — a small spreadsheet with rows filling in one after another. */
export function ExportVisual() {
  const rows = [0, 1, 2];
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-soft text-emerald shadow-sm">
        <FileSpreadsheet className="h-4 w-4" />
      </div>
      <div className="absolute -bottom-1 -right-2 flex flex-col gap-0.5 rounded-md border border-border bg-card p-1 shadow-sm">
        {rows.map((i) => (
          <motion.div
            key={i}
            className="h-1 w-6 rounded-full bg-emerald/70"
            style={{ transformOrigin: "left" }}
            animate={{ scaleX: [0.25, 1, 1, 0.25], opacity: [0.3, 1, 1, 0.3] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
