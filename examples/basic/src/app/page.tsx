import { getExampleContent } from "@/lib/example-content";
import { getCurrentSite } from "@/lib/current-site";

export default async function Home() {
  const site = await getCurrentSite();
  const content = await getExampleContent(site.id);

  return (
    <main data-theme={site.theme}>
      <p className="eyebrow">OpenSiteStack example</p>
      <h1>{site.name}</h1>
      <p>{content?.value.body}</p>
      <dl>
        <div>
          <dt>Site</dt>
          <dd>{site.id}</dd>
        </div>
        <div>
          <dt>Resolved from</dt>
          <dd>{content ? `${content.source.kind}:${content.source.id}` : "none"}</dd>
        </div>
      </dl>
    </main>
  );
}
