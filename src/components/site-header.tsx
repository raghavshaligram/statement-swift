import { Link } from "@tanstack/react-router";
import { FileSpreadsheet } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">LedgerLocal</span>
          <span className="ml-2 hidden rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-block">
            v1.4 · Software
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className="hover:text-ink">Product</Link>
          <a href="/#banks" className="hover:text-ink">Supported banks</a>
          <a href="/#security" className="hover:text-ink">Security</a>
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="hidden text-sm font-medium text-muted-foreground hover:text-ink sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/upload"
            className="inline-flex items-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-background transition hover:bg-ink/90"
          >
            Launch app
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 text-sm text-muted-foreground md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-ink">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold">LedgerLocal</span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed">
            Bank statement to Excel software. Processed on your device — never uploaded to a server.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Product</div>
          <ul className="space-y-2">
            <li><Link to="/upload" className="hover:text-ink">Convert a statement</Link></li>
            <li><Link to="/pricing" className="hover:text-ink">Pricing</Link></li>
            <li><a href="/#banks" className="hover:text-ink">Supported banks</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Formats</div>
          <ul className="space-y-2">
            <li>Excel (.xlsx)</li>
            <li>CSV · OFX · QIF</li>
            <li>Tally XML · QBO</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Company</div>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-ink">Privacy (on-device)</a></li>
            <li><a href="#" className="hover:text-ink">Security</a></li>
            <li><a href="#" className="hover:text-ink">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LedgerLocal. Your statements never leave your device.
      </div>
    </footer>
  );
}
