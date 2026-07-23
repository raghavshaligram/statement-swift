/**
 * Free-tier page-per-statement limit. Grounded in real competitor data
 * (checked directly by using CapyParse): their free tier caps each PDF at
 * 6 pages. LedgerLocal's free tier is deliberately more generous at 10.
 *
 * Enforcement note: there is no accounts/subscription system yet (see the
 * project's Master Strategy doc), so this is currently a blanket limit
 * applied to every upload, not yet gated specifically to "free" accounts.
 * Once real accounts ship, this should only apply to non-Pro users.
 */
export const FREE_TIER_MAX_PAGES = 10;
