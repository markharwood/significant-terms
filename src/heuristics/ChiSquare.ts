
import { SignificanceHeuristic } from "../types.js";

/**
 * Calculates Chi^2
 * see "Information Retrieval", Manning et al., Eq. 13.19
 */
export class ChiSquare implements SignificanceHeuristic {
  readonly name = "chi_square";

  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number {
    // documents not in class and do not contain term
    const N00 = supersetSize - supersetFreq - (subsetSize - subsetFreq);
    // documents in class and do not contain term
    const N01 = (subsetSize - subsetFreq);
    // documents not in class and do contain term
    const N10 = supersetFreq - subsetFreq;
    // documents in class and do contain term
    const N11 = subsetFreq;
    // documents that do not contain term
    const N0_ = supersetSize - supersetFreq;
    // documents that contain term
    const N1_ = supersetFreq;
    // documents that are not in class
    const N_0 = supersetSize - subsetSize;
    // documents that are in class
    const N_1 = subsetSize;
    // all docs
    const N = supersetSize;

    return (N * Math.pow((N11 * N00 - N01 * N10), 2.0) / ((N_1)
      * (N1_) * (N0_) * (N_0)));

  }
}
