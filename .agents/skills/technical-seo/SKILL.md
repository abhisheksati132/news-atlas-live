---
name: technical-seo
description: Implement and verify search crawlability, rendered metadata, canonical URLs, redirects, sitemaps, structured data, and environment indexing policy for public web pages. Use for technical SEO defects or implementation, not keyword marketing, ranking promises, or a general web-quality score.
---

# Technical SEO

Verify what the deployed URL returns and what a crawler can discover. A correct source template or local Lighthouse score does not prove a page is indexed.

## Establish intended visibility

Identify the production domain/base path, preview/staging environments, route types, rendering strategy, URL conventions, localization, and intended public versus private content. Preserve authentication and deliberate indexing exclusions. Do not make an internal application public to improve an audit score.

Use the repository's metadata, routing, sitemap, and structured-data facilities. Inspect representative indexable pages, duplicates, pagination/facets when present, redirected URLs, missing pages, and a protected or preview page. Reuse existing tools. Do not require a Search Console account for locally verifiable work.

## Inspect response and rendering

Read [crawl and rendering evidence](references/crawl-and-render.md) when headers, JavaScript rendering, robots, sitemap discovery, localized alternates, redirects, or environment differences matter. Record the final URL, status, redirect chain, response headers, initial HTML, and relevant rendered DOM. Request the page without an accidental signed-in session when evaluating public visibility.

Use [internationalization](../internationalization/SKILL.md) for locale selection, translated UI, and regional formatting. Keep localized URL annotations and crawl evidence here.

The crawl and rendering reference also covers optional `llms.txt` discovery when requested or relevant to an existing documentation pipeline. Keep that evidence separate from search-engine indexing.

Verify descriptive page-specific titles, meaningful content, discoverable links with actual destinations, and coherent heading structure. Do not fail valid content merely because it contains multiple `h1` elements. Keep social sharing metadata separate from search indexing claims.

Keep canonical, internal-link, redirect, and sitemap signals aligned with the chosen URL policy. Use absolute canonical URLs for the correct public origin, not a development hostname or an untrusted incoming host value. A canonical is a signal, not an access restriction or guaranteed search-engine choice. [Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Generate sitemaps from intended canonical public URLs rather than every route in the application. Exclude deliberate redirects, errors, private content, and non-indexable pages. Keep modification dates truthful. Check the served sitemap, not only the generated file. Submission to an external account is a separate action requiring authorization. [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Use structured data only for supported entities represented by the visible page. Do not fabricate ratings, prices, authorship, or availability. Validate syntax and applicable eligibility requirements separately. Valid markup does not guarantee a rich result. [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

## Change and verify

Fix the shared template, route generation, server configuration, or source data responsible for the defect. Inspect related route classes to avoid copying a page-specific fix across unrelated pages. Preserve locale and pagination intent instead of canonicalizing distinct content indiscriminately.

Build and exercise the production serving path when possible. Verify corrected response and rendered signals on representative URLs, including a negative case that must remain excluded. Use `cli-web-evidence` for browser/HTTP evidence and `web-standard` for protocol or navigation correctness. Use `accessibility` and `performance` for their own evidence, not as substitutes for crawlability.

Report the affected route classes, measured response/rendering result, changes, and remaining hosted or Search Console verification. Distinguish crawlable, eligible for indexing, submitted, observed indexed, and ranking. Do not promise traffic or ranking gains.
