
import { JLH } from "./heuristics/JLH.js";
import { ChiSquare } from "./heuristics/ChiSquare.js";
import { MutualInformation } from "./heuristics/MutualInformation.js";
import { GND } from "./heuristics/GND.js";
import { PercentageScore } from "./heuristics/PercentageScore.js";
import { SolrRelatedness } from "./heuristics/SolrRelatedness.js";
export type { SignificanceHeuristic, TermScore, WordUsageCounts } from "./types.js";

export const heuristics = {
  /** JLH score: emphasizes sharp increases in frequency within the subset. */
  jlh: new JLH(),
  /** Chi-square: classical statistical test for independence between term and class. */
  chi_square: new ChiSquare(),
  /** Mutual information: captures all co-occurrence relationships between term and class. */
  mutual_information: new MutualInformation(),
 /** GND (Google Normalized Distance): favors focused and discriminative terms. */
   gnd: new GND(),
  /** Percentage score: measures the proportion of term occurrences that fall within the subset. Can be overly sensitive to low-frequency terms*/
  percentage: new PercentageScore(),
  /** Used by Solr for the "relatedness" aggregation*/
  solr: new SolrRelatedness()
};

export type HeuristicName = keyof typeof heuristics;

export function getHeuristic(name: HeuristicName) {
  return heuristics[name];
}

export * from "./utils/countDocFrequencies.js";
export * from "./utils/computeSignificantTermsFromCounts.js";
export * from "./utils/computeSignificantTerms.js";
export * from "./utils/detectAndSortSequences.js";
export * from "./utils/simpleTokenizer.js";
