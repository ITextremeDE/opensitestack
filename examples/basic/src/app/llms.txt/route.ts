import { getCurrentSiteOrNull } from "@/lib/current-site";
import { getExamplePublicationEntries } from "@/lib/example-content";

// Content curation belongs to the consuming application, not the platform core.
export async function GET() {
  const site = await getCurrentSiteOrNull();
  if (!site) return new Response("Not found\n", { status: 404 });
  const entries = await getExamplePublicationEntries(site.id);
  const plain = (value: string) => value.replace(/[\r\n]+/g, " ").replace(/([\\[\]<>*_`])/g, "\\$1");
  const body = [
    `# ${plain(site.name)}`, "", `> ${plain(site.metadata.description)}`, "",
    "This optional guide describes public content. It grants no access or permission to act.", "",
    "## Published information", "",
    ...entries.map((entry) => `- [${plain(entry.content.title)}](${entry.canonicalUrl})`),
    "", "## Discovery", "",
    `- [Sitemap](${site.canonicalOrigin}/sitemap.xml)`,
    `- [Crawler rules](${site.canonicalOrigin}/robots.txt)`, "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
  });
}
