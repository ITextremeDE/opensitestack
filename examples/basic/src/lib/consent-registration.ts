/** Example-owned bridge: the provider retains consent and script execution. */
export type ReadyManager = {
  isReady(): boolean;
  subscribeReady(callback: () => void): () => void;
  registerScripts(): void;
};

export function registerOnceWhenReady(manager: ReadyManager): () => void {
  let registered = false;
  let disposed = false;
  const register = () => {
    if (disposed || registered || !manager.isReady()) return;
    registered = true; // Guard reentrant readiness notifications.
    try {
      manager.registerScripts();
    } catch (error) {
      registered = false;
      throw error;
    }
  };
  const unsubscribe = manager.subscribeReady(register);
  register(); // Handles a manager which became ready before/during subscription.
  return () => {
    if (disposed) return;
    disposed = true;
    unsubscribe();
  };
}
