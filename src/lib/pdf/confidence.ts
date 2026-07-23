export type ConfidenceTier = "high" | "medium" | "low";

/** Matches the confidence-key legend shown in the preview screen's footer. */
export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 90) return "high";
  if (score >= 75) return "medium";
  return "low";
}
