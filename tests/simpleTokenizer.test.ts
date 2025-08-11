import { describe, it, expect } from 'vitest';
import { simpleTokenizer } from '../src/utils/simpleTokenizer';

describe('simpleTokenizer', () => {
    it('should split on punctuation and whitespace', () => {
        expect(simpleTokenizer('Hello, World!'))
            .toEqual(['hello', 'world']);
    });

    it('should handle underscores as delimiters', () => {
        expect(simpleTokenizer('foo_bar_baz'))
            .toEqual(['foo', 'bar', 'baz']);
    });

    it('should lowercase all tokens', () => {
        expect(simpleTokenizer('MixedCASE Words'))
            .toEqual(['mixedcase', 'words']);
    });

    it('should filter out empty tokens', () => {
        expect(simpleTokenizer('---hello---world---'))
            .toEqual(['hello', 'world']);
    });

    it('should return an empty array for empty or delimiter-only input', () => {
        expect(simpleTokenizer('')).toEqual([]);
        expect(simpleTokenizer('---')).toEqual([]);
    });
});