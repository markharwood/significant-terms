#!/usr/bin/env node
import path from "path";
import { trainBackgroundVocab } from "../utils/trainBackgroundVocab.js";

/** Parse args and run the trainer.  */
export function cli(argv: string[]) {
  // Support both: `npx train-background-vocab ...` and `npx @scope/pkg train-background-vocab ...`
  const args = [...argv];
  if (args[0]?.toLowerCase() === "train-background-vocab") args.shift();

  // Parse --min-doc-count
  let minDocCount = 2;
  const idx = args.findIndex(a => a === "--min-doc-count" || a.startsWith("--min-doc-count="));
  if (idx !== -1) {
    const a = args[idx];
    if (a.includes("=")) {
      minDocCount = parseInt(a.split("=")[1], 10);
      args.splice(idx, 1);
    } else {
      const v = args[idx + 1];
      if (!v || v.startsWith("--")) throw new Error("Missing value for --min-doc-count");
      minDocCount = parseInt(v, 10);
      args.splice(idx, 2);
    }
  }

  const [inputFile, outputFile] = args;
  if (!inputFile || !outputFile) {
    throw new Error("Usage: train-background-vocab <input.txt> <output.json> [--min-doc-count N]");
  }

  const inputPath = path.resolve(process.cwd(), inputFile);
  const outputPath = path.resolve(process.cwd(), outputFile);

  const summary = trainBackgroundVocab(inputPath, outputPath, minDocCount);
  console.log(
    `✅ Wrote ${outputPath} (${summary.totalDocs} docs, kept ${summary.keptTerms} terms, minDocCount=${summary.minDocCount})`
  );
}

// Run when invoked by Node (npx)
try {
  cli(process.argv.slice(2));
} catch (err: any) {
  console.error(err?.message ?? err);
  process.exit(1);
}