// tests/detectAndSortSequences.test.ts
import { describe, it, expect } from 'vitest';
import { detectAndSortSequences } from '../src/utils/detectAndSortSequences';
import type { TermScore } from '../src/types';

describe('detectAndSortSequences', () => {
  it('should detect and order common bigrams', () => {
    const topTerms: TermScore[] = [
      { term: 'charles', score: 2, fgCount: 3, bgCount: 200 },
      { term: 'dolan', score: 10, fgCount: 3, bgCount: 50 },
      { term: 'hbo', score: 3, fgCount: 2, bgCount: 200 },
      { term: 'cablevision', score: 4, fgCount: 2, bgCount: 150 }
    ];

    const tokenStreams = [
      ['charles', 'dolan', 'founder'],
      ['charles', 'dolan', 'hbo'],
      ['hbo', 'and', 'cablevision'],
      ['charles', 'dolan', 'cablevision']
    ];

    const termsAndPhrases = detectAndSortSequences(topTerms, tokenStreams, 2);

    // Expect 'charles' and 'dolan' to appear together, but ordered by dolan's score
    expect(termsAndPhrases[0]).toEqual(['charles', 'dolan']);
    // expect remaining terms to be sorted by significance
    expect(termsAndPhrases[1]).toEqual(['cablevision']);
    expect(termsAndPhrases[2]).toEqual(['hbo']);
  });


  it('should keep high score singletons when no strong sequence', () => {
    const topTerms: TermScore[] = [
      { term: 'impeachment', score: 12, fgCount: 2, bgCount: 20 },
      { term: 'trial', score: 8, fgCount: 2, bgCount: 25 }
    ];

    const tokenStreams = [
      ['something', 'unrelated'],
      ['other', 'words']
    ];

    const termsAndPhrases = detectAndSortSequences(topTerms, tokenStreams, 2);
    expect(termsAndPhrases).toEqual([['impeachment'], ['trial']]);
  });
});