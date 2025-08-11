
import { SignificanceHeuristic } from "../types.js";

export class PercentageScore implements SignificanceHeuristic {
  readonly name = "percentage";

  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number {

    return supersetFreq === 0 ? 0 : subsetFreq / supersetFreq;
  }
}
