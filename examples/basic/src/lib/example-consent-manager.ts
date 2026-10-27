/** Synthetic provider for reference tests. It never contacts an analytics service. */
const storageKey = "opensitestack-consent-example";
const policyVersion = "example-1";
type Choice = "unknown" | "granted" | "rejected";
type Snapshot = {
  ready: boolean;
  choice: Choice;
  registrations: number;
  starts: number;
  persistenceError: boolean;
};
export const serverSnapshot: Snapshot = {
  ready: false,
  choice: "unknown",
  registrations: 0,
  starts: 0,
  persistenceError: false,
};

export class ExampleConsentManager {
  private state: Snapshot = serverSnapshot;
  private listeners = new Set<() => void>();
  private readyListeners = new Set<() => void>();
  private scripts: HTMLScriptElement[] = [];
  private activated = new Set<string>();
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  isReady = () => this.state.ready;
  subscribeReady = (listener: () => void) => {
    this.readyListeners.add(listener);
    return () => {
      this.readyListeners.delete(listener);
    };
  };
  private publish(patch: Partial<Snapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  loadSavedChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      const choice: Choice =
        saved?.policyVersion === policyVersion &&
        ["granted", "rejected"].includes(saved.choice)
          ? saved.choice
          : "unknown";
      this.publish({ choice });
    } catch {
      this.publish({ choice: "unknown", persistenceError: true });
    }
  }
  initialize = () => {
    this.publish({ ready: true });
    this.readyListeners.forEach((listener) => listener());
  };
  registerScripts = () => {
    this.scripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>(
        'script[type="application/x-example-consent"][data-example-consent-group="analytics"]',
      ),
    );
    this.publish({ registrations: this.state.registrations + 1 });
    this.activate();
  };
  choose = (choice: Exclude<Choice, "unknown">) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ policyVersion, choice }),
      );
    } catch {
      this.publish({ persistenceError: true });
    }
    this.publish({ choice });
    if (choice === "granted") this.activate();
    else
      this.scripts.forEach((script) =>
        document.getElementById(`${script.id}-active`)?.remove(),
      );
    // Revocation cannot undo code already executed; future loads remain blocked.
  };
  private activate() {
    if (!this.state.ready || this.state.choice !== "granted") return;
    for (const inert of this.scripts) {
      if (
        this.activated.has(inert.id) ||
        document.getElementById(`${inert.id}-active`)
      )
        continue;
      this.activated.add(inert.id);
      const active = document.createElement("script");
      active.id = `${inert.id}-active`;
      active.textContent = inert.textContent; // Only the fixed, trusted example adapter supplies this code.
      document.head.appendChild(active);
    }
    this.publish({
      starts: Number(
        document.documentElement.dataset.exampleAnalyticsStarts || 0,
      ),
    });
  }
}
