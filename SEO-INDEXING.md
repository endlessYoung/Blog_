# GSC indexing maintenance

The production origin is `https://endlessyoung.top/`. Article canonical URLs use
`.html`; directory indexes use a trailing slash. Extensionless article URLs may
also return 200, but their canonical should point to the `.html` URL.

## Changes made

- Fixed sitemap exclusion for `noindex` directory indexes: VitePress emits
  `Agent/` for `Agent/index.md`, so both must be compared using the same path form.
- Replaced the Android, Kotlin, Java, AI and Agent JavaScript redirect pages with
  static article listings. These pages are now indexable and self-canonical.
- Added an automatically generated `/archives.html` and links from home to it and
  `/tags/`. All sitemap pages must be reachable through static HTML links.
- Removed `noindex` from 11 existing articles with substantive content:
  Chunking; Activity/Fragment communication; Application instance count;
  RecyclerView grouping; WorkManager; installed-app listing; path animation;
  C++ header guards; Kotlin array initialization; Kotlin extension functions;
  NumPy methods.
- Added title, description, category, tags and the first-commit date to Embedding.
- Kept unfinished placeholders, VitePress examples and the 404 page excluded.
  `noindex, follow` allows discovery of links on excluded pages.
- Made sitemap and canonical URL encoding consistent. Fixed creation-date cache
  lookup to use its actual `.md` keys. Directory pages do not emit Article schema.

## Verify before deployment

Run from the repository root:

```sh
pnpm docs:build
pnpm docs:seo
```

The production build generates the article and tag listings, then checks the
built sitemap against actual HTML files: targets must exist, be indexable,
contain one matching canonical, and be reachable from home without executing
JavaScript. It also checks internal HTML links, robots.txt and CNAME.
This is a build-time audit; it does not check hosting response headers or prove
that Google will index a page.

## GSC steps after deploying

1. In URL Inspection, run a live test on `/Agent/Chunking.html`,
   `/Android/实践-recyclerview分组.html`, `/Agent/Embedding.html` and `/Ai/`.
   Confirm successful fetching and that indexing is allowed. Request indexing
   for these representative pages after the live test passes.
2. Submit `https://endlessyoung.top/sitemap.xml` in Sitemaps. Existing sitemap
   submissions can be retained; there is no need to remove and re-add them.
3. Use URL Inspection for the corrected `noindex` article URLs. Do not repeatedly
   validate the entire exclusion group while unfinished placeholders remain
   intentionally excluded: group validation can still fail, and this report is
   not expected to reach zero.
4. Monitor the canonical `.html` article URLs for the reported discovered/crawled
   but not indexed entries. Google decides whether to index them; a build or an
   indexing request cannot guarantee inclusion. Single-article tag pages may
   remain unindexed even when the article itself is indexed.
5. Keep the HTTP-to-HTTPS and www-to-apex 301 redirects. An alternate page with
   an appropriate canonical is also normally expected, provided its canonical
   target is correct and indexable.
6. If GSC later supplies the specific missing URL, fix its referring link or map
   it to the actual replacement when one exists. Do not redirect every missing
   page to the homepage. A build audit cannot identify unlinked old external URLs.

## Live observations during this fix

The five reported article redirect URLs (RecyclerView cache, clustering,
coroutine lifecycle, coroutine scopes, XOR) returned 200 with `.html` canonicals.
The HTTP homepage and www host returned 301 to the HTTPS apex host. The sitemap
incorrectly included five `noindex` category indexes. These observations can
change after deployment; GSC reports reflect earlier crawl times.

References:

- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
