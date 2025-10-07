import type { WordUsageCounts, TermScore, SignificanceHeuristic } from "../types.js";
import { countDocFrequencies } from "./countDocFrequencies.js";
import { computeSignificantTermsFromCounts, SignificanceFindingOptions } from "./computeSignificantTermsFromCounts.js";

/**
 * Convenience wrapper for `computeSignificantTermsFromCounts` that
 * accepts tokenized documents instead of precomputed counts.
 *
 * @group Significant Terms
 *
 * @param foregroundDocs - Array of foreground documents - each doc is represented as an array of tokens (typically words)
 * @param bgCounts - Background document frequency map for words
 * @param totalBackgroundDocs - Total number of documents in the background set
 * @param options - Same as computeSignificantTermsFromCounts
 */
export function computeSignificantTerms(
  foregroundDocs: string[][],
  bgCounts: WordUsageCounts,
  totalBackgroundDocs: number,
  options: SignificanceFindingOptions = {}
): TermScore[] {
  const fgCounts = countDocFrequencies(foregroundDocs);
  return computeSignificantTermsFromCounts(
    fgCounts,
    foregroundDocs.length,
    bgCounts,
    totalBackgroundDocs,
    options
  );
}