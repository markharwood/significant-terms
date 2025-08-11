
import { SignificanceHeuristic } from "../types.js";


/**
 * JLHScore heuristic blends absolute and relative changes in popularity from background to foreground
 */
export class JLH implements SignificanceHeuristic {
  readonly name = "jlh";

  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number {
    if (subsetSize === 0 || supersetSize === 0 || supersetFreq === 0) return 0;

    const fgPct = subsetFreq / subsetSize;
    const bgPct = supersetFreq / supersetSize;

    return fgPct > bgPct ? (fgPct - bgPct) * (fgPct / bgPct) : 0;
  }
}
