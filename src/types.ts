

export type Tokenizer = (s: string) => string[];

/**
 * A mapping from term → document frequency count.
 * Used for both foreground and background corpora.
 */
export type WordUsageCounts = Record<string, number>;

/**
 * Result object for a significant term calculation.
 */
export type TermScore = {
  term: string;
  score: number;
  fgCount: number;
  bgCount: number;
};

/**
 * A heuristic used to calculate the significance of a term in a subset
 */
export interface SignificanceHeuristic {
  readonly name: string;
    /**
     * Calculates the significance of a term found in a subset sample
     * @param subsetFreq   The frequency of the term in the selected sample
     * @param subsetSize   The size of the selected sample (typically number of docs)
     * @param supersetFreq The frequency of the term in the superset from which the sample was taken
     * @param supersetSize The size of the superset from which the sample was taken  (typically number of docs)
     * @returns a "significance" score
     */  
  score(
    subsetFreq: number,
    subsetSize: number,
    supersetFreq: number,
    supersetSize: number
  ): number;
}
