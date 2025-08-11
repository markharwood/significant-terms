// tests/trainBackgroundVocab.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { trainBackgroundVocab } from "../src/utils/trainBackgroundVocab.js";

const tempDir = path.join(process.cwd(), "tmp-test");
const inputFile = path.join(tempDir, "input.txt");
const outputFile = path.join(tempDir, "output.json");

describe("trainBackgroundVocab", () => {
  beforeEach(() => {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(inputFile, "foo bar\nfoo baz\n");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates a word usage JSON file", () => {
    trainBackgroundVocab(inputFile, outputFile);
    expect(fs.existsSync(outputFile)).toBe(true);

    const stats = JSON.parse(fs.readFileSync(outputFile, "utf-8"));
    expect(stats.corpus_total_documents).toBe(2);
    expect(stats.words.foo).toBe(2);
    expect(stats.words.bar).toBe(undefined); //We remove words <2 frequency
  });
});