import { describe, it, expect } from "vitest";
import { computeSignificantTerms } from "../src/utils/computeSignificantTerms";
import { countDocFrequencies } from "../src/utils/countDocFrequencies";
import { JLH } from "../src/heuristics/JLH";
import type { WordUsageCounts } from "../src/types";

describe("computeSignificantTerms", () => {
  const scoringFunction = new JLH();

  const backgroundFreqs: WordUsageCounts = {
    apple: 100,
    banana: 200,
    cherry: 50
  };
  const totalBackgroundDocs = 1000;

  it("computes scores for simple foreground data", () => {
    const docs = [
      ["apple", "banana"],
      ["apple"],
      ["banana", "cherry"]
    ];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      3,
      scoringFunction
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("term");
    expect(results[0]).toHaveProperty("score");
  });

  it("allows foreground terms not in background when isSubset=false", () => {
    const docs = [["dragonfruit"], ["dragonfruit", "apple"]];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      2,
      scoringFunction,
      false // not a subset
    );

    const terms = results.map(r => r.term);
    expect(terms).toContain("dragonfruit");
  });

  it("throws error when isSubset=true and fgCount > bgCount", () => {
    const docs = [["apple"], ["apple"], ["apple"]]; // fgCount = 3
    const badBackground: WordUsageCounts = { apple: 2 }; // bgCount = 2

    expect(() =>
      computeSignificantTerms(
        docs,
        badBackground,
        totalBackgroundDocs,
        2,
        scoringFunction,
        true
      )
    ).toThrow(/Foreground count.*exceeds background count/);
  });

  it("filters out terms below minDocCount", () => {
    const docs = [["apple"], ["banana"], ["cherry"]];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      3,
      scoringFunction,
      true,
      2 // require at least 2 docs
    );
    expect(results.length).toBe(0);
  });

  it("works with precomputed foreground counts", () => {
    const docs = [["apple", "banana"], ["apple"]];
    const fgCounts = countDocFrequencies(docs);
    expect(fgCounts.apple).toBe(2);
    expect(fgCounts.banana).toBe(1);
  });
});