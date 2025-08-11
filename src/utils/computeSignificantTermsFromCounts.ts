import type { WordUsageCounts, TermScore, SignificanceHeuristic } from "../types.js";

/**
 * Compute the most significant terms given precomputed foreground counts.
 *
 * @group Significant Terms
 *
 * @param fgCounts - Foreground document frequency map
 * @param totalForegroundDocs - Total number of documents in the foreground set
 * @param bgCounts - Background document frequency map
 * @param totalBackgroundDocs - Total number of documents in the background set
 * @param topN - Maximum number of terms to return
 * @param scoringFunction - Significance heuristic
 * @param isSubset - Whether foreground is guaranteed to be a subset of background
 * @param minDocCount - Minimum number of foreground docs containing term
 */
export function computeSignificantTermsFromCounts(
  fgCounts: WordUsageCounts,
  totalForegroundDocs: number,
  bgCounts: WordUsageCounts,
  totalBackgroundDocs: number,
  topN: number,
  scoringFunction: SignificanceHeuristic,
  isSubset: boolean = true,
  minDocCount: number = 2
): TermScore[] {
  if (totalForegroundDocs < minDocCount) {
    return [];
  }

  const adjustedTotalBackgroundCount = isSubset
    ? totalBackgroundDocs
    : totalBackgroundDocs + totalForegroundDocs;

  const scoredTerms: TermScore[] = [];

  for (const [term, fgCount] of Object.entries(fgCounts)) {
    let bgCount = bgCounts[term] || 0;

    if (!isSubset) {
      bgCount += fgCount;
    } else if (fgCount > bgCount) {
      throw new Error(
        `Foreground count for term '${term}' exceeds background count of ${bgCount}. ` +
        `Set isSubset=false to adjust counts.`
      );
    }

    if (fgCount < minDocCount) continue;

    const score = scoringFunction.score(
      fgCount,
      totalForegroundDocs,
      bgCount,
      adjustedTotalBackgroundCount
    );

    if (score > 0) {
      scoredTerms.push({ term, score, fgCount, bgCount });
    }
  }

  return scoredTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}