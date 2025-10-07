import type { WordUsageCounts, TermScore, SignificanceHeuristic } from "../types.js";
import { SolrRelatedness } from "../heuristics/SolrRelatedness.js";

/**
 * Options for controlling the discovery of significant terms
 *
 */
export interface SignificanceFindingOptions {
  /** Significance heuristic (default:  {@link heuristics/SolrRelatedness.SolrRelatedness}) */
  scoringFunction?: SignificanceHeuristic;
  /** Minimum fg doc-frequency to consider a term (default: 2) */
  minDocCount?: number;
  /** How many terms to return (default: 10) */
  topN?: number;
}

/**
 * Compute the most significant terms given precomputed foreground counts.
 *
 * @group Significant Terms
 *
 * @param fgCounts - Foreground document frequency map
 * @param totalForegroundDocs - Total number of documents in the foreground set
 * @param bgCounts - Background document frequency map for words
 * @param totalBackgroundDocs - Total number of documents in the background set
 * @param options - Optional tuning (heuristic, isSubset, minDocCount, topN)
 *
 * @returns Top-N scored terms sorted desc by score.
 */
export function computeSignificantTermsFromCounts(
  fgCounts: WordUsageCounts,
  totalForegroundDocs: number,
  bgCounts: WordUsageCounts,
  totalBackgroundDocs: number,
  options: SignificanceFindingOptions = {}
): TermScore[] {
  const {
    topN = 10,
    scoringFunction = withBgZeroFloor(new SolrRelatedness()),
    minDocCount = 2,
  } = options;
  if (totalForegroundDocs < minDocCount) {
    return [];
  }
  const scoredTerms: TermScore[] = [];

  for (const [term, fgCount] of Object.entries(fgCounts)) {
    let bgCount = bgCounts[term] || 0;


    if (fgCount < minDocCount) continue;

    const score = scoringFunction.score(
      fgCount,
      totalForegroundDocs,
      bgCount,
      totalBackgroundDocs
    );

    if (score > 0) {
      scoredTerms.push({ term, score, fgCount, bgCount });
    }
  }

  return scoredTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// Wrappers for SignificanceHeuristics that deal with data quality issues when
// the foreground is not a subset of the background


/**
 * Wrap a heuristic so any bgCount==0 is replaced with a floor (default 1).
 * Good when BG is sampled and zeros are mostly “missingness”.
 */
export function withBgZeroFloor(
  base: SignificanceHeuristic,
  floor = 1
): SignificanceHeuristic {
  return {
    name: `${base.name || "heuristic"}+bgZeroFloor(${floor})`,
    score(fgCount, fgTotal, bgCount, bgTotal) {
      const bg = bgCount === 0 ? floor : bgCount;
      return base.score(fgCount, fgTotal, bg, bgTotal);
    },
  };
}

