# Publish a host-specific llms.txt guide

`llms.txt` is an optional discovery proposal, not an access-control mechanism,
a ranking requirement or a guarantee of AI citations. Keep normal metadata,
canonicals, robots rules, sitemaps, accessible text and matching structured data
as the foundation. See the [proposal](https://llmstxt.org/) and
[Google Search AI guidance](https://developers.google.com/search/docs/appearance/ai-features).

## Reuse the publication contract

The reference application serves `/llms.txt` for each resolved host. Its route
uses `getCurrentSiteOrNull` and `getExamplePublicationEntries`, so it inherits
registry validation and `createPublicationEntries`: drafts, archived content,
noindex records and future publications are excluded. Unknown hosts return 404.
Do not cache one host's guide as another host's response.

The application owns its introduction, audience, curated links and service
boundaries. Use a short H1, optional summary blockquote and H2 link lists.
Escape Markdown labels and use validated canonical URLs. Curate important
published pages instead of copying the entire site or exporting private raw
content. Where a shared page has a different canonical owner, link that owner
explicitly. Sitemap and feed links help readers find the rest of the content.

Add `<link rel="describedby" href="/llms.txt" type="text/plain" />` in the
site layout for discovery. A visible footer link is optional; avoid adding a
technical navigation item unless it helps visitors. A guide in another language
does not imply translated pages or justify hreflang alternatives.

## Keep it accurate

Update the guide when identity, services, publications, canonical ownership or
contact routes change. Derived links should share the publication gate with
the sitemap and metadata. Check every host, links and MIME type, unknown-host
behaviour, and draft/noindex exclusion before deployment. Do not invent
credentials, external profiles, FAQs or capabilities to fill a schema.

Contact links should explain the expected input and next step. A discovery file
is not consent to submit personal data, book an appointment or make a contract.
WebMCP or another agent action adapter needs its own concrete use case and
assessment; this guide exposes no actions and does not add an agent runtime.

No new core API, dependency or npm release is needed: the existing public
registry/publication contracts provide the shared behaviour. Brand-specific
curation stays in each consuming repository.
