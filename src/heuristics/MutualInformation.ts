
import { SignificanceHeuristic } from "../types.js";

export class MutualInformation implements SignificanceHeuristic {
  readonly name = "mutual_information";

  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number {

    const N11 = subsetFreq;
    const N01 = subsetSize - subsetFreq;
    const N10 = supersetFreq - subsetFreq;
    const N00 = supersetSize - supersetFreq - N01;

    const N1_ = supersetFreq;
    const N0_ = supersetSize - supersetFreq;
    const N_1 = subsetSize;
    const N_0 = supersetSize - subsetSize;
    const N = supersetSize;

    const log2 = Math.log(2);

    function getMITerm(Nxy: number, Nx_: number, N_y: number, N: number): number {
      const numerator = Math.abs(N * Nxy);
      const denominator = Math.abs(Nx_ * N_y);
      const factor = Math.abs(Nxy / N);
      if (numerator < 1e-7 && factor < 1e-7) return 0;
      return factor * Math.log(numerator / denominator);
    }

    let score =
      getMITerm(N00, N0_, N_0, N) +
      getMITerm(N01, N0_, N_1, N) +
      getMITerm(N10, N1_, N_0, N) +
      getMITerm(N11, N1_, N_1, N);

    score = score / log2;

  
    // Only apply positive signal (includeNegatives = false)
    if ((N_1 === 0 || N_0 === 0) || (N11 / N_1) < (N10 / N_0)) {
      return -Infinity;
    }

    return score;    
  }
}
