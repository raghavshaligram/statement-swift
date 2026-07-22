/**
 * Shared shell for the SEO landing-page stubs linked from the footer
 * (Section 10). These routes exist so the footer's internal links resolve
 * to a real page instead of a 404 while the actual guides get written.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, Construction } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export function ComingSoonPage({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b border-border py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Construction className="h-3.5 w-3.5" />
            Guide coming soon
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 text-muted-foreground">{blurb}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            In the meantime, you can convert a statement directly — no need to wait for the guide.
          </p>
          <div className="mt-8">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-background transition hover:bg-ink/90"
            >
              Convert a statement <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
