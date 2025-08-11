import type { WordUsageCounts, TermScore, SignificanceHeuristic } from "../types.js";
import { countDocFrequencies } from "./countDocFrequencies.js";
import { computeSignificantTermsFromCounts } from "./computeSignificantTermsFromCounts.js";

/**
 * Convenience wrapper for `computeSignificantTermsFromCounts` that
 * accepts tokenized documents instead of precomputed counts.
 *
 * @group Significant Terms
 *
 */
export function computeSignificantTerms(
  docs: string[][],
  bgCounts: WordUsageCounts,
  totalBackgroundDocs: number,
  topN: number,
  scoringFunction: SignificanceHeuristic,
  isSubset: boolean = true,
  minDocCount: number = 2
): TermScore[] {
  const fgCounts = countDocFrequencies(docs);
  return computeSignificantTermsFromCounts(
    fgCounts,
    docs.length,
    bgCounts,
    totalBackgroundDocs,
    topN,
    scoringFunction,
    isSubset,
    minDocCount
  );
}