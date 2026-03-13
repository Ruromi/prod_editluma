# SEO Rollout

## Implemented in code

- `sitemap.xml` via `web/app/sitemap.ts`
- `robots.txt` via `web/app/robots.ts`
- Global metadata, canonical URLs, OpenGraph, and Twitter image defaults
- English-first root metadata and `html lang="en"`
- AI crawler allow rules for OpenAI, Perplexity, Anthropic, Google, and Common Crawl agents
- Trust pages:
  - `/contact`
  - `/refund-policy`
  - `/privacy`
  - `/terms`
- Keyword pages:
  - `/ai-image-generator`
  - `/ai-photo-enhancer`
  - `/ai-portrait-enhancer`
- Private pages marked `noindex`

## Manual tasks after deploy

1. Verify these live URLs:
   - `/sitemap.xml`
   - `/robots.txt`
   - `/opengraph-image`
   - `/contact`
   - `/refund-policy`
   - `/ai-image-generator`
   - `/ai-photo-enhancer`
   - `/ai-portrait-enhancer`

2. Submit the sitemap to:
   - Google Search Console
   - Bing Webmaster Tools

3. Register EditLuma in AI directories:
   - Futurepedia: `https://www.futurepedia.io/submit-tool`
   - Toolify: `https://www.toolify.ai/submit`
   - TopAI.tools: `https://topai.tools/submit`
   - AI Tools: `https://aitools.inc/submit-ai-tool`

4. Recheck social previews after deploy:
   - LinkedIn Post Inspector
   - Facebook Sharing Debugger

## Optional next steps

- Add Search Console verification tags
- Add `SoftwareApplication` structured data
- Split Korean SEO into dedicated public routes if Korean organic traffic becomes important
