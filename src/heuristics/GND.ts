
import { SignificanceHeuristic } from "../types.js";

/**
 * Calculates Google Normalized Distance, as described in "The Google Similarity Distance", Cilibrasi and Vitanyi, 2007
 * link: http://arxiv.org/pdf/cs/0412098v3.pdf
 */
export class GND implements SignificanceHeuristic {
  readonly name = "gnd";

  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number {
    const fxy = subsetFreq;      // N11
    const fx = supersetFreq;     // N1_
    const fy = subsetSize;       // N_1
    const N = supersetSize;

    if (fxy === 0) return 0;
    if (fx === fy && fx === fxy) return 1;

    const log = Math.log;
    const numerator = Math.max(log(fx), log(fy)) - log(fxy);
    const denominator = log(N) - Math.min(log(fx), log(fy));

    if (denominator === 0) return 0;

    const rawScore = numerator / denominator;
    return Math.exp(-rawScore);
  }
}
