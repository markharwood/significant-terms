import type { WordUsageCounts } from "../types.js";

/**
 * Count the number of documents each term appears in.
 *
 * @group Significant Terms
 *
 * @param docs - Array of tokenized documents (each document is a string[] of tokens)
 * @returns Mapping of term → document frequency
 */
export function countDocFrequencies(docs: string[][]): WordUsageCounts {
  const counts: WordUsageCounts = {};
  for (const tokenStream of docs) {
    const uniqueTokens = new Set(tokenStream); // per-doc counting
    for (const token of uniqueTokens) {
      counts[token] = (counts[token] || 0) + 1;
    }
  }
  return counts;
}