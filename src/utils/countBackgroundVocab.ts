// src/utils/countBackgroundVocab.ts
import fs from "fs";
import path from "path";
import { simpleTokenizer } from "./simpleTokenizer.js";

/**
 * Build background vocabulary statistics from a one-line-per-document text file.
 *
 * - Tokenizes each line using the package's default tokenizer
 * - Counts **document frequency** (each token counted at most once per doc)
 * - Applies a minimum document-frequency threshold (`minDocCount`, default 2)
 * - Writes JSON:
 *   {
 *     "corpus_total_documents": <number>,
 *     "words": { "<term>": <doc_freq>, ... }
 *   }
 *
 * @param inputPath Absolute or relative path to the input `.txt` (one document per line)
 * @param outputPath Absolute or relative path to the output `.json`
 * @param minDocCount Minimum document frequency required to keep a term (default: 2)
 *
 * @returns A small summary of what was written (useful for tests/CLI)
 */
export function countBackgroundVocab(
  inputPath: string,
  outputPath: string,
  minDocCount: number = 2
): { totalDocs: number; keptTerms: number; minDocCount: number } {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const lines = raw.split(/\r?\n/);

  // Count document frequency
  const df: Record<string, number> = Object.create(null);
  let totalDocs = 0;

  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;

    totalDocs++;
    const uniqueTokens = new Set(simpleTokenizer(clean));
    for (const tok of uniqueTokens) {
      df[tok] = (df[tok] || 0) + 1;
    }
  }

  // Apply minDocCount filter
  const filtered: Record<string, number> = Object.create(null);
  for (const [term, count] of Object.entries(df)) {
    if (count >= minDocCount) {
      filtered[term] = count;
    }
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const payload = {
    corpus_total_documents: totalDocs,
    words: filtered,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");

  return { totalDocs, keptTerms: Object.keys(filtered).length, minDocCount };
}