/**
 * Regex used by `simpleTokenizer` to split input into tokens.
 *
 * - Matches one or more non-word characters or underscores
 *
 * @group Tokenization
 */
export const SIMPLE_TOKENIZER_SEP_RE = /[\W_]+/;

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
    .split(SIMPLE_TOKENIZER_SEP_RE)
    .filter(Boolean);
}