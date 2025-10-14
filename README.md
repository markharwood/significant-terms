
# @andorsearch/significant-terms

[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://markharwood.github.io/significant-terms/)


A set of Elastic/OpenSearch-inspired [significance scoring](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-significantterms-aggregation) heuristics for discovery of terms strongly related to a set.

Typically the point of identifying significant terms is to suggest terms users can use to refine searches.


[Watch this](https://www.youtube.com/watch?v=azP15yvbOBA) for background on the signficance statistics.


## "Significant compared to what"?

These algorithms rely on comparing a focused set of data (the "foreground set") with a larger set of more general content (the "background set").
The sources of data generally fall into two camps:
### 1) Word usage in search results

The words used in a specific set of search results are compared with a cache of word usage statistics which have 
been taken from a much broader selection of content. While elasticsearch and opensearch implementations compare
search results with the full database (often at some expense), it is possible for client applications to hold a much smaller 
cache of only the most common words as the background dataset. This small background set can be less than one megabyte of JSON and still be useful.

### 2) Labelling clusters of similar content

A set of content eg the latest news headlines are grouped into different clusters (e.g. by [using binary vectors](https://qry.codes)).
The words used in each cluster are compared to word usage in all other clusters to help identify what makes it different.



## Heuristics Included

- JLH
- Chi-Square
- Mutual Information
- Google Normalized Distance (GND)
- Percentage Score
- Solr Relatednesss


## Low-level usage

```ts
import { getHeuristic } from "@andorsearch/significance-heuristics";

const jlh = getHeuristic("jlh");
const score = jlh.score(12, 100, 40, 1700000);
```

Each heuristic implements:

```ts
interface SignificanceHeuristic {
  name: string;
  score(subsetFreq: number, subsetSize: number, supersetFreq: number, supersetSize: number): number;
}
```

## Usage with search results

Significant keywords can be detected in search results. These can be shown as suggestions to refine queries e.g
to add keyword "h5n1" to a search for "bird flu".

The language used in search results needs to be compared with some record of general word use we call "the background".
A background is simply a list of words and how frequently they each occur.
You can get a background of word use from a couple of places:

- **Download** a pre-built background [e.g. this English background](https://gist.github.com/markharwood/10c160b19dabe35ba6531410747ef4f0) **or**
- **Generate** your own background
  - **From text**
    The significant terms package contains a utility to count the words in a text file
    ```ts
    npx @andorsearch/significant-terms count-background-vocab 'MyExampleTextFile.txt' MyBackgroundWordStats.json
    ``` **or**
  - **From your elasticsearch/opensearch index**:
    run [a version of this query](https://gist.github.com/markharwood/74bb6b8523f6a5746b1b758da2a5372e) to generate a list of words from a randomised selection of content in your choice of index/field.

Once you have a background it can be used for comparison with search results:

```ts
import { computeSignificantTerms, detectAndSortSequences, simpleTokenizer, WordUsageCounts } from "@andorsearch/significant-terms";

// ==== Your choice of background ====
// const backgroundWordStats:WordUsageCounts
// const backgroundCorpusSize:number

function findSignificantWordsOrPhrases(searchResultTexts: string[]) {
    // Tokenise the text found in search results
    let tokenStreams = searchResultTexts.map((textValue) => simpleTokenizer(textValue))

    //Find the significant words compared to the background
    const significantWords = computeSignificantTerms(
        tokenStreams,
        backgroundWordStats,
        backgroundCorpusSize
    );
    // Optionally, examine how the significant words are placed in the text to identify word pairs e.g. "Mitt" + "Romney"
    let significantWordsOrPhrases = detectAndSortSequences(significantWords, tokenStreams)

    // Display the words or phrases as a comma delimited list.
    const summary = significantWordsOrPhrases.map(termOrPhrase => termOrPhrase.join(" ")).join(", ");
    console.log(summary)
}``` 

