# Crawl and rendering evidence

## Robots and environments

`robots.txt` controls crawling, not confidentiality. A disallowed URL may still be known to a search engine. For a crawler to observe a page's `noindex`, it must be able to retrieve the applicable directive. Use authentication for private content, not robots rules. Inspect both HTML robots metadata and `X-Robots-Tag`, including inherited proxy/CDN headers. [Robots introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [robots metadata](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

Preserve preview/staging exclusion while fixing production policy. Verify the deployed environment and cache after changes. Do not remove an exclusion globally because a development preview failed an SEO audit.

## Sitemaps and related discovery

Reuse the existing sitemap generator. Verify absolute public URLs, XML escaping, and the deployed response rather than an application-shell fallback. Follow sitemap indexes to their child files; split files at the applicable URL and uncompressed-size limits. Check discovery through the deployed `robots.txt` `Sitemap:` entry or an authorized submission. Do not reset every `lastmod` to build time or spend effort tuning Google's ignored `priority` and `changefreq` fields. Existing RSS/Atom feeds can expose recent updates, but may omit older URLs. Add image, video, or news extensions only for relevant content. [Sitemap formats and discovery](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

For localized sites, check `hreflang` annotations for valid language/region values, self-inclusion, reciprocal alternate links, and reachable equivalent pages. Keep each language page's canonical consistent with its intended identity. Use `x-default` when a language selector or fallback warrants it. Maintain the repository's chosen HTML, header, or sitemap mechanism; duplicating all three adds maintenance without a search benefit. [Localized page annotations](https://developers.google.com/search/docs/specialty/international/localized-versions).

Sitemaps supplement crawlable internal links. Check that important public pages can be reached through navigation, relevant cross-links, or crawlable pagination, and that filters do not create unintended unbounded URL spaces. Choose discovery artifacts for the site's content and consumers; do not add every format to every project.

## JavaScript and navigation

Compare initial HTML with the rendered page and inspect whether content, links, canonical metadata, and status handling depend on successful JavaScript. An initial `noindex` can prevent Google from rendering a page, so removing it later in JavaScript is not a reliable indexing fix. Preserve consistent canonical signals between server output and client updates. [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

Verify actual anchor destinations and direct navigation to deep routes. Check missing pages and redirects through the real host, not only client-side route transitions. An error screen served as a successful page can misrepresent the route. Do not replace every response with a generic application shell without verifying the intended status and content.

## Evidence limits

Local checks can prove emitted HTML, headers, links, and route behavior. They cannot prove Google has crawled the new deployment, selected its canonical, or indexed it. Use authorized Search Console inspection when available and record its observation date. Keep absence of that access separate from an implementation failure.

## Optional agent discovery with llms.txt

Treat `llms.txt` as a curated Markdown entry point for compatible agents, not a robots policy, sitemap replacement, access control, or evidence of indexing. Its absence is not automatically a defect. Add or maintain it when requested, already part of the documentation pipeline, or useful to a documented consumer. Follow the current proposal's format and choose the site root or relevant documentation subpath. [llms.txt proposal](https://llmstxt.org/).

Reuse the site's generator when available. Curate concise descriptions and links to current, public, authoritative content. Avoid copying the whole site, exposing private/draft material, or creating a second source that silently drifts. Verify the deployed file returns the intended Markdown rather than an HTML fallback, and follow its links at the real base path. Test a representative discovery task when an actual consumer is available, then report that consumer and outcome.

Do not claim universal AI adoption, citation, ranking, or training behavior. Google states that no special AI text files are needed for its Search AI features. Keep provider-specific requirements separate from this optional discovery workflow. [Google Search AI guidance](https://developers.google.com/search/docs/appearance/ai-features).
