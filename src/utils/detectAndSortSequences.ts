import type { TermScore } from "../types.js";

/**
 * Having discovered statistically significant terms it is often useful to reorganise them into 
 * more readable groups e.g. detecting that the keywords musk, doge and elon are better organised 
 * for readability if the words elon and musk are placed after each other in sequence because that is
 * how they typically appear.
 * 
 * This function detects common token sequences within a set of tokenized documents and
 * reorders terms to prefer sequence ordering while preserving overall significance rank.
 * @group Significant Terms
 *
 * @param topTerms - List of top term objects
 * @param tokenStreams - Tokenized documents from which top terms were found.
 * @param minDocCount - Minimum number of documents that must contain a sequence for it to be considered strong
 * @returns A list of the top terms and/or phrases sorted by score. (Phrases have >1 term in the array and are
 * ranked by the highest scoring term in the phrase)
 */
export function detectAndSortSequences(
    topTerms: TermScore[],
    tokenStreams: string[][],
    minDocCount: number = 2
): string[][] {

    type WordSequence = {
        terms: string[];
        score: number;
    };


    if (topTerms.length <= 1) {
        //Wrap individual terms in an array
        return topTerms.map(t=>[t.term])
    }
    const termSet = new Set(topTerms.map(t => t.term));
    const termScoreMap = new Map(topTerms.map(t => [t.term, t]));
    const usedTerms = new Set<string>();

    const candidateSequences: WordSequence[] = [];
    const docCount = tokenStreams.length;

    // Count all in-order sequences from docs
    const sequenceCounts: Map<string, number> = new Map();

    for (const tokens of tokenStreams) {
        const seen = new Set<string>();

        for (let i = 0; i < tokens.length - 1; i++) {
            const a = tokens[i];
            const b = tokens[i + 1];
            // Reduce to only sequences of terms we care about
            if (termSet.has(a) && termSet.has(b)) {
                const key = `${a}|${b}`;
                if (!seen.has(key)) {
                    sequenceCounts.set(key, (sequenceCounts.get(key) || 0) + 1);
                    seen.add(key);
                }
            }
        }
    }


    // Extract strong sequences
    [...sequenceCounts.entries()]
        .sort((a, b) => b[1] - a[1]) // Sort sequences by popularity
        .forEach(([key, count]) => {
            if (count >= minDocCount) {
                const [a, b] = key.split("|");
                if (!usedTerms.has(a) && !usedTerms.has(b)) {
                    const maxScore = Math.max(
                        // @ts-ignore
                        termScoreMap.get(a).score || 0,
                        // @ts-ignore
                        termScoreMap.get(b).score || 0
                    );
                    candidateSequences.push({ terms: [a, b], score: maxScore });
                    usedTerms.add(a);
                    usedTerms.add(b);
                }
            }
        })

    // Add remaining individual terms as one-word sequences
    const remainingTerms: WordSequence[] = [];
    for (const t of topTerms) {
        if (!usedTerms.has(t.term)) {
            remainingTerms.push({ terms: [t.term], score: t.score });
        }
    }

    // Combine and sort all sequences (includes)
    const allSequences = [...candidateSequences, ...remainingTerms];
    allSequences.sort((a, b) => b.score - a.score);

    let result = allSequences.map(seq=>seq.terms)
    return result
}
