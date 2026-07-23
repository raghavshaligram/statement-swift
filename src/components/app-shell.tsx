import { Link, useLocation } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  Upload,
  Table2,
  Download,
  Settings,
  HelpCircle,
  ShieldCheck,
  History,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/upload", label: "Convert", icon: Upload },
  { to: "/preview", label: "Preview & edit", icon: Table2 },
  { to: "/export", label: "Export", icon: Download },
];

const secondary = [
  { to: "/pricing", label: "Plan & usage", icon: History },
  { to: "/pricing", label: "Settings", icon: Settings },
  { to: "/", label: "Help", icon: HelpCircle },
];

export function AppShell({
  title,
  step,
  children,
  toolbar,
}: {
  title: string;
  step?: 1 | 2 | 3;
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  const loc = useLocation();
  return (
    <div className="flex min-h-screen bg-surface-muted/40">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald text-primary-foreground">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">LedgerLocal</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Workflow
          </div>
          {nav.map((item) => {
            const active = loc.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Account
          </div>
          {secondary.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="m-3 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-emerald">
            <ShieldCheck className="h-3.5 w-3.5" />
            On-device processing
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/70">
            Files stay in your browser. Nothing is uploaded, ever.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-[15px] font-semibold text-ink">{title}</h1>
            {step && (
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                {[
                  { n: 1, label: "Upload" },
                  { n: 2, label: "Preview" },
                  { n: 3, label: "Export" },
                ].map((s, i) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-semibold ${
                        step >= s.n
                          ? "bg-emerald text-primary-foreground"
                          : "border border-border bg-surface-muted text-muted-foreground"
                      }`}
                    >
                      {s.n}
                    </span>
                    <span className={step >= s.n ? "text-ink" : ""}>{s.label}</span>
                    {i < 2 && <span className="h-px w-6 bg-border" />}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-emerald-soft px-3 py-1 font-mono text-[11px] font-medium text-accent-foreground sm:flex">
              <ShieldCheck className="h-3 w-3" />
              Processed on your device
            </div>
            {toolbar}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
