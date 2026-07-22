import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, FileText, X, ShieldCheck, Loader2, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Convert · Ledgerly" },
      { name: "description", content: "Upload PDF bank statements. Processing happens on your device." },
      { property: "og:title", content: "Convert · Ledgerly" },
      { property: "og:description", content: "On-device PDF to Excel conversion." },
    ],
  }),
  component: UploadPage,
});

type FileItem = { name: string; size: number; pages: number };
type Phase = "idle" | "processing" | "done";

function UploadPage() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentFile, setCurrentFile] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(list: FileList | File[]) {
    const arr = Array.from(list).map((f) => ({
      name: f.name,
      size: f.size,
      pages: Math.max(4, Math.min(28, Math.round(f.size / 40000))),
    }));
    setFiles((prev) => [...prev, ...arr]);
  }

  function startProcessing() {
    if (!files.length) return;
    setPhase("processing");
    setCurrentFile(0);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (phase !== "processing") return;
    const t = setTimeout(() => {
      const total = files[currentFile]?.pages ?? 1;
      if (currentPage < total) {
        setCurrentPage((p) => p + 1);
      } else if (currentFile < files.length - 1) {
        setCurrentFile((f) => f + 1);
        setCurrentPage(1);
      } else {
        setPhase("done");
        setTimeout(() => nav({ to: "/preview" }), 700);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [phase, currentFile, currentPage, files, nav]);

  const totalPages = files.reduce((s, f) => s + f.pages, 0);
  const donePages =
    files.slice(0, currentFile).reduce((s, f) => s + f.pages, 0) + (phase === "processing" ? currentPage : 0);
  const pct = totalPages ? Math.round((donePages / totalPages) * 100) : 0;

  return (
    <AppShell title="Convert statements" step={1}>
      <div className="mx-auto max-w-4xl space-y-6">
        {phase === "idle" && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-card px-8 py-16 transition ${
                dragOver ? "border-emerald bg-emerald-soft/40" : "border-border hover:border-emerald/60 hover:bg-surface-muted"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                <Upload className="h-7 w-7" />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-ink">Drop PDF statements here</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  or click to browse — multi-file, no size cap, no page limit on Pro
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-accent-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald" />
                Processed on your device — nothing uploaded, ever
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="text-sm font-semibold text-ink">
                    {files.length} file{files.length > 1 ? "s" : ""} queued · {totalPages} pages
                  </div>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-muted-foreground hover:text-ink"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="divide-y divide-border">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{f.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(f.size / 1024).toFixed(0)} KB · ~{f.pages} pages
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-ink"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end border-t border-border p-4">
                  <button
                    onClick={startProcessing}
                    className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-ink/90"
                  >
                    Start conversion
                  </button>
                </div>
              </div>
            )}

            {files.length === 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Multi-bank bundles", "Drop statements from different banks together."],
                  ["Password-protected PDFs", "Unlock with your password — never sent anywhere."],
                  ["Scanned statements", "Built-in OCR for image-based PDFs (Pro)."],
                ].map(([t, b]) => (
                  <div key={t} className="rounded-lg border border-border bg-card p-4">
                    <div className="text-sm font-semibold text-ink">{t}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{b}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {phase !== "idle" && (
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-3">
              {phase === "done" ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-primary-foreground">
                  <Check className="h-5 w-5" />
                </div>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-emerald" />
              )}
              <div>
                <div className="text-base font-semibold text-ink">
                  {phase === "done" ? "Conversion complete" : "Parsing on your device…"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {phase === "done"
                    ? "Opening preview…"
                    : `Reading page ${currentPage} of ${files[currentFile]?.pages} — ${files[currentFile]?.name}`}
                </div>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-emerald transition-all"
                style={{ width: `${phase === "done" ? 100 : pct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{donePages} / {totalPages} pages</span>
              <span className="inline-flex items-center gap-1 text-emerald">
                <ShieldCheck className="h-3 w-3" /> Zero network activity
              </span>
            </div>

            <ul className="mt-6 space-y-2">
              {files.map((f, i) => {
                const state = i < currentFile || phase === "done" ? "done" : i === currentFile ? "active" : "queued";
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-border bg-surface-muted/50 px-4 py-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-ink">{f.name}</span>
                    </div>
                    <span className={`text-xs ${state === "done" ? "text-emerald" : state === "active" ? "text-ink" : "text-muted-foreground"}`}>
                      {state === "done" ? "Done" : state === "active" ? `Page ${currentPage}/${f.pages}` : "Queued"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
