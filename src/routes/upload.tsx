import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, X, ShieldCheck, Loader2, Check, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatementDropzone } from "@/components/statement-dropzone";
import { useStatementStore } from "@/lib/statement-store";
import { parseStatementFile } from "@/lib/pdf/parse-statement";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Convert · LedgerLocal" },
      { name: "description", content: "Upload PDF bank statements. Processing happens on your device." },
      { property: "og:title", content: "Convert · LedgerLocal" },
      { property: "og:description", content: "On-device PDF to Excel conversion." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const nav = useNavigate();
  const [liveLabel, setLiveLabel] = useState<string>("");

  const pendingFiles = useStatementStore((s) => s.pendingFiles);
  const setPendingFiles = useStatementStore((s) => s.setPendingFiles);
  const clearPendingFiles = useStatementStore((s) => s.clearPendingFiles);
  const removePendingFile = useStatementStore((s) => s.removePendingFile);
  const phase = useStatementStore((s) => s.phase);
  const currentFileIndex = useStatementStore((s) => s.currentFileIndex);
  const currentPage = useStatementStore((s) => s.currentPage);
  const startProcessing = useStatementStore((s) => s.startProcessing);
  const setProgress = useStatementStore((s) => s.setProgress);
  const finishProcessing = useStatementStore((s) => s.finishProcessing);
  const failProcessing = useStatementStore((s) => s.failProcessing);
  const errorMessage = useStatementStore((s) => s.errorMessage);

  function addFiles(list: FileList | File[]) {
    const arr = Array.from(list).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    setPendingFiles(arr);
  }

  async function startConversion() {
    if (!pendingFiles.length) return;
    startProcessing();

    const statements = [];
    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        setLiveLabel(file.name);
        const statement = await parseStatementFile(file, (page, total) => {
          setProgress(i, page, total);
        });
        statements.push(statement);
      }
      finishProcessing(statements);
      setTimeout(() => nav({ to: "/preview" }), 500);
    } catch (err) {
      failProcessing(err instanceof Error ? err.message : "Something went wrong while parsing.");
    }
  }

  const currentFile = pendingFiles[currentFileIndex];

  return (
    <AppShell title="Convert statements" step={1}>
      <div className="mx-auto max-w-4xl space-y-6">
        {phase === "idle" && (
          <>
            <StatementDropzone variant="full" onFiles={addFiles} />

            {pendingFiles.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="text-sm font-semibold text-ink">
                    {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} queued
                  </div>
                  <button
                    onClick={clearPendingFiles}
                    className="text-xs text-muted-foreground hover:text-ink"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="divide-y divide-border">
                  {pendingFiles.map((f, i) => (
                    <li key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removePendingFile(i)}
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
                    onClick={startConversion}
                    className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-ink/90"
                  >
                    Start conversion
                  </button>
                </div>
              </div>
            )}

            {pendingFiles.length === 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Multi-bank bundles", "Drop statements from different banks together."],
                  ["Global bank coverage", "Chase, BofA, Wells Fargo, ICICI, HDFC, SBI and more."],
                  ["Text-based PDFs", "Works with any statement pdf.js can read text from."],
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

        {phase === "error" && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <div className="text-base font-semibold text-ink">Conversion failed</div>
                <div className="text-sm text-muted-foreground">{errorMessage}</div>
              </div>
            </div>
          </div>
        )}

        {(phase === "processing" || phase === "done") && (
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
                    : `Reading page ${currentPage} — ${liveLabel || currentFile?.name || ""}`}
                </div>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-emerald transition-all"
                style={{ width: phase === "done" ? "100%" : `${Math.min(95, currentPage * 8)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>File {currentFileIndex + 1} / {pendingFiles.length}</span>
              <span className="inline-flex items-center gap-1 text-emerald">
                <ShieldCheck className="h-3 w-3" /> Zero network activity
              </span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
