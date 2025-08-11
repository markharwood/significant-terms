/**
 * Simple tokenizer for breaking text into lowercase terms.
 *
 * - Converts the string to lowercase using `toLocaleLowerCase()`
 * - Splits on any sequence of non-word characters or underscores
 * - Filters out any empty strings from the result
 *
 * @param value - The text to tokenize
 * @returns An array of lowercase tokens
 *
 * @example
 * ```ts
 * simpleTokenizer("Hello, World!");
 * // → ["hello", "world"]
 * ```
 *
 * @group Tokenization
 */
export function simpleTokenizer(value: string): string[] {
    return value
        .toLocaleLowerCase()
        .split(/[\W_]+/)
        .filter(Boolean);
}