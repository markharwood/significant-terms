// ---- Types
import type { Tokenizer } from "../types.js";
import { simpleTokenizer, SIMPLE_TOKENIZER_SEP_RE } from "./simpleTokenizer.js";


/** Escape HTML special characters safely. */
export const escapeHTML = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escape a string for use inside a RegExp literal. */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Check if `stream` contains `phraseTokens` as **adjacent** tokens.
 * Uses exact string equality (assumes tokens were normalized by the same tokenizer).
 */
export function containsPhrase(stream: string[], phraseTokens: string[]): boolean {
  if (phraseTokens.length === 0) return false;
  if (phraseTokens.length === 1) return stream.includes(phraseTokens[0]);

  outer: for (let i = 0; i <= stream.length - phraseTokens.length; i++) {
    for (let j = 0; j < phraseTokens.length; j++) {
      if (stream[i + j] !== phraseTokens[j]) continue outer;
    }
    return true;
  }
  return false;
}

export interface NextIndexOptions {
  tokenizer?: Tokenizer; // default: simpleTokenizer
}

/**
 * Find the **next** position (wrapping once) whose token stream contains `term` (as adjacent tokens).
 *
 * @param docPositions positions you navigate in the UI (each maps to a doc id/index in tokenStreams)
 * @param currentPos   current position (0-based) in `docPositions`
 * @param tokenStreams pre-tokenized streams indexed by **doc id**
 * @param term         the clicked significant term/phrase (e.g. "white house")
 * @param options      { tokenizer } defaults to `simpleTokenizer`
 * @returns next position in `docPositions` or `null` if none
 */
export function nextIndexWithPhrase(
  docPositions: number[],
  currentPos: number,
  tokenStreams: ReadonlyArray<ReadonlyArray<string>>,
  term: string,
  options: NextIndexOptions = {}
): number | null {
  const tokenizer = options.tokenizer ?? simpleTokenizer;

  if (!docPositions.length) return null;
  const phrase = tokenizer(term).filter(Boolean);
  if (!phrase.length) return null;

  const n = docPositions.length;
  const start = ((currentPos ?? 0) % n + n) % n;

  for (let step = 1; step <= n; step++) {
    const pos = (start + step) % n;
    const docId = docPositions[pos];
    const stream = tokenStreams[docId];
    if (Array.isArray(stream) && containsPhrase(stream as string[], phrase)) {
      return pos;
    }
  }
  return null;
}

/**
 * Find the **previous** position (wrapping once) whose token stream contains `term` (as adjacent tokens).
 *
 * @param docPositions positions you navigate in the UI (each maps to a doc id/index in tokenStreams)
 * @param currentPos   current position (0-based) in `docPositions`
 * @param tokenStreams pre-tokenized streams indexed by **doc id**
 * @param term         the clicked significant term/phrase (e.g. "white house")
 * @param options      { tokenizer } defaults to `simpleTokenizer`
 * @returns previous position in `docPositions` or `null` if none
 */
export function prevIndexWithPhrase(
  docPositions: number[],
  currentPos: number,
  tokenStreams: ReadonlyArray<ReadonlyArray<string>>,
  term: string,
  options: NextIndexOptions = {}
): number | null {
  const tokenizer = options.tokenizer ?? simpleTokenizer;

  if (!docPositions.length) return null;
  const phrase = tokenizer(term).filter(Boolean);
  if (!phrase.length) return null;

  const n = docPositions.length;
  const start = ((currentPos ?? 0) % n + n) % n;

  for (let step = 1; step <= n; step++) {
    const pos = (start - step + n) % n;
    const docId = docPositions[pos];
    const stream = tokenStreams[docId];
    if (Array.isArray(stream) && containsPhrase(stream as string[], phrase)) {
      return pos;
    }
  }
  return null;
}

export interface HighlightOptions {
  /** Tokenizer for the term, defaults to `simpleTokenizer` */
  tokenizer?: Tokenizer;
  /** Separator regex used by the tokenizer's split; defaults to SIMPLE_TOKENIZER_SEP_RE */
  sepRe?: RegExp;
  /** Tag to wrap matches, default "mark" */
  tag?: string;
  /** Class name to add to the wrapping tag */
  className?: string;
}

/**
 * Convert original `text` to **safe HTML** with all occurrences of `term` highlighted.
 * Matching is case-insensitive and respects the tokenizer's separators between tokens,
 * e.g. "white house" will match "white_house", "WHITE-house", "white   house".
 *
 * - Preserves original casing in the output.
 * - Escapes all non-matching slices.
 * - Wraps only the matched span with <mark> (or custom tag).
 */
export function highlightPhraseHTML(
  text: string,
  term: string,
  options: HighlightOptions = {}
): string {
  const tokenizer = options.tokenizer ?? simpleTokenizer;
  const sepRe = options.sepRe ?? SIMPLE_TOKENIZER_SEP_RE;
  const tag = options.tag ?? "mark";
  const cls = options.className ? ` class="${options.className}"` : "";

  // Tokenize the term (not the text)
  const tokens = tokenizer(term).filter(Boolean);
  if (tokens.length === 0) return escapeHTML(text);

  // Build a pattern:
  //  - core = tokens joined by one-or-more separators (same as tokenizer)
  //  - we also capture a leading boundary (start or a separator) and a trailing boundary (separator or end)
  const sepSrc = `(?:${sepRe.source})`;
  const core = tokens.map(escapeRegExp).join(`${sepSrc}+`);
  const pattern = `(${sepSrc}|^)(${core})(${sepSrc}|$)`;
  const re = new RegExp(pattern, "gi");

  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const lead = m[1] ?? "";
    const inner = m[2] ?? "";
    const trail = m[3] ?? "";

    const leadStart = m.index;
    const innerStart = leadStart + lead.length;
    const innerEnd = innerStart + inner.length;
    const trailEnd = innerEnd + trail.length;

    if (leadStart > last) out += escapeHTML(text.slice(last, leadStart));
    out += escapeHTML(lead);
    out += `<${tag}${cls}>${escapeHTML(inner)}</${tag}>`;
    out += escapeHTML(trail);
    last = trailEnd;

    if (m.index === re.lastIndex) re.lastIndex++; // safety against zero-length loops
  }

  if (last < text.length) out += escapeHTML(text.slice(last));
  return out;
}