
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


## Usage

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
