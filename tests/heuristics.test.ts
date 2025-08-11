
import { describe, expect, test } from "vitest";
import { heuristics } from "../src/index";

// Copied from MutualInformation.ts
function getMITerm(Nxy: number, Nx_: number, N_y: number, N: number): number {
  const numerator = Math.abs(N * Nxy);
  const denominator = Math.abs(Nx_ * N_y);
  const factor = Math.abs(Nxy / N);
  if (numerator < 1e-7 && factor < 1e-7) return 0;
  return factor * Math.log(numerator / denominator);
}

describe("Significance heuristics", () => {
  test("JLH", () => {
    const h = heuristics.jlh;
    expect(h.score(10, 100, 5, 1000)).toBeGreaterThan(0);
  });

  test("SolrRelatedness", () => {
    const h = heuristics.solr;
    expect(h.score(10, 100, 5, 1000)).toBeGreaterThan(0);
  });  

  test("ChiSquare", () => {
    const h = heuristics.chi_square;
    expect(h.score(10, 100, 10, 1000)).toBeGreaterThan(0);
  });

  test("MutualInformation", () => {
    const h = heuristics.mutual_information;

    const N11 = 10;
    const N_1 = 100;
    const N1_ = 5;
    const N = 1000;

    const N01 = N_1 - N11;
    const N10 = N1_ - N11;
    const N00 = N - (N11 + N01 + N10);

    const N0_ = N - N1_;
    const N_0 = N - N_1;

    const expected =
      (getMITerm(N00, N0_, N_0, N) +
        getMITerm(N01, N0_, N_1, N) +
        getMITerm(N10, N1_, N_0, N) +
        getMITerm(N11, N1_, N_1, N)) / Math.log(2);

    const score = h.score(N11, N_1, N1_, N);
    expect(score).toBeCloseTo(expected, 5);
  });

  test("GND", () => {
    const h = heuristics.gnd;
    const score = h.score(10, 100, 5, 1000);
    expect(score).toBeGreaterThan(0);
  });
});
