import { describe, it, expect } from "vitest";
import { computeSignificantTerms } from "../src/utils/computeSignificantTerms";
import { countDocFrequencies } from "../src/utils/countDocFrequencies";
import { JLH } from "../src/heuristics/JLH";
import type { WordUsageCounts } from "../src/types";
import { withBgZeroFloor } from "../src/utils/computeSignificantTermsFromCounts";

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
      
      { topN:3, scoringFunction}
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("term");
    expect(results[0]).toHaveProperty("score");
  });

  it("raw jlh allows foreground terms not in background but does not discover them", () => {

    const docs = [["dragonfruit"], ["dragonfruit", "apple"]];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      { topN:2, scoringFunction}
    );
    const terms = results.map(r => r.term);
    expect(results.length).toEqual(0);
  });

  it("wrapped jlh allows foreground terms not in background and does discover them", () => {

    const docs = [["dragonfruit"], ["dragonfruit", "apple"]];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      { topN:2, scoringFunction:withBgZeroFloor(scoringFunction)}
    );
    const terms = results.map(r => r.term);
    expect(results.length).toEqual(1);
    expect(terms).toContain("dragonfruit");

  });

    it("Default (solr wrapped with bgZeroFloor) allows foreground terms not in background and does discover them", () => {

    const docs = [["dragonfruit"], ["dragonfruit", "apple"]];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      { topN:2}
    );
    const terms = results.map(r => r.term);
    expect(results.length).toEqual(1);
    expect(terms).toContain("dragonfruit");

  });

  it("filters out terms below minDocCount", () => {
    const docs = [["apple"], ["banana"], ["cherry"]];
    const results = computeSignificantTerms(
      docs,
      backgroundFreqs,
      totalBackgroundDocs,
      { topN:2, scoringFunction, minDocCount:2}
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