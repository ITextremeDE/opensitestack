import { defineComponentSlots, type SiteDefinition } from "opensitestack";

type HomeViewProps = {
  readonly site: SiteDefinition;
  readonly body: string | null;
  readonly source: string;
};

function AlphaHome({ site, body, source }: HomeViewProps) {
  return (
    <main className="alpha-home" data-view="editorial">
      <header>
        <p className="eyebrow">OpenSiteStack · Editorial edition</p>
        <h1>{site.name}</h1>
      </header>
      <blockquote>{body ?? "No published content."}</blockquote>
      <footer>
        <span>Source</span>
        <strong>{source}</strong>
      </footer>
    </main>
  );
}

function BetaHome({ site, body, source }: HomeViewProps) {
  return (
    <main className="beta-home" data-view="control-panel">
      <aside aria-label="Site identity">
        <span className="status-dot" aria-hidden="true" />
        <span>{site.id}</span>
      </aside>
      <section>
        <p className="eyebrow">OpenSiteStack // Control panel</p>
        <h1>{site.name}</h1>
        <p className="beta-copy">{body ?? "No published content."}</p>
      </section>
      <dl>
        <div>
          <dt>Resolved source</dt>
          <dd>{source}</dd>
        </div>
        <div>
          <dt>Theme</dt>
          <dd>{site.theme}</dd>
        </div>
      </dl>
    </main>
  );
}

const homeSlots = defineComponentSlots({ Home: AlphaHome });

const AlphaHomeView = homeSlots.resolve().Home;
const BetaHomeView = homeSlots.resolve({ Home: BetaHome }).Home;

export function HomeView(props: HomeViewProps) {
  return props.site.theme === "beta" ? (
    <BetaHomeView {...props} />
  ) : (
    <AlphaHomeView {...props} />
  );
}
