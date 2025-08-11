
import { SignificanceHeuristic } from "../types.js";

/**
 * Algorithm used in Solr's "relatedness" aggregation.
 */

export class SolrRelatedness implements SignificanceHeuristic {
  readonly name = "solr";

  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number {
    if (subsetSize == 0 || supersetSize == 0) return 0;

    // Compute background probability
    const bgProb = supersetFreq / supersetSize;

    // Compute expected count in foreground
    const expected = subsetSize * bgProb;

    // Z-score
    const num = subsetFreq - expected;
    let denom = Math.sqrt(expected * (1.0 - bgProb));
    denom = (denom == 0) ? 1e-10 : denom;
    let z = num / denom;

    // Inlined sigmoid functions
    let s1 = (z + (-80)) / (50 + Math.abs(z + (-80)));
    let s2 = (z + (-30)) / (30 + Math.abs(z + (-30)));
    let s3 = (z + 0) / (30 + Math.abs(z + 0));
    let s4 = (z + 30) / (30 + Math.abs(z + 30));
    let s5 = (z + 80) / (50 + Math.abs(z + 80));

    let result = 0.2 * s1 + 0.2 * s2 + 0.2 * s3 + 0.2 * s4 + 0.2 * s5;

    return Math.round(result * 1e5) / 1e5;

  }
}
