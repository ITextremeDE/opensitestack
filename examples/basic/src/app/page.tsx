import { getExampleContent } from "@/lib/example-content";
import { getCurrentSite } from "@/lib/current-site";
import { HomeView } from "@/components/home-views";

export default async function Home() {
  const site = await getCurrentSite();
  const content = await getExampleContent(site.id);

  return (
    <HomeView
      site={site}
      body={content?.value.body ?? null}
      source={content ? `${content.source.kind}:${content.source.id}` : "none"}
    />
  );
}
