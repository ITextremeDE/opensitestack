import { describe, it, expect, vi } from "vitest";
import {
  registerOnceWhenReady,
  type ReadyManager,
} from "../src/lib/consent-registration";
function fixture(ready = false) {
  const callbacks = new Set<() => void>();
  const registerScripts = vi.fn();
  const unsubscribe = vi.fn();
  const manager: ReadyManager = {
    isReady: () => ready,
    registerScripts,
    subscribeReady: (callback) => {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
        unsubscribe();
      };
    },
  };
  return {
    manager,
    registerScripts,
    unsubscribe,
    signal: () => {
      ready = true;
      callbacks.forEach((f) => f());
    },
    callbacks,
  };
}
describe("example-owned consent registration", () => {
  it("registers a previously ready manager once and ignores repeated readiness", () => {
    const f = fixture(true);
    registerOnceWhenReady(f.manager);
    f.signal();
    f.signal();
    expect(f.registerScripts).toHaveBeenCalledTimes(1);
  });
  it("waits for readiness without executing or granting anything itself", () => {
    const f = fixture();
    registerOnceWhenReady(f.manager);
    expect(f.registerScripts).not.toHaveBeenCalled();
    f.signal();
    expect(f.registerScripts).toHaveBeenCalledTimes(1);
  });
  it("does not miss readiness during subscription", () => {
    const f = fixture();
    const original = f.manager.subscribeReady;
    f.manager.subscribeReady = (cb) => {
      const stop = original(cb);
      f.signal();
      return stop;
    };
    registerOnceWhenReady(f.manager);
    expect(f.registerScripts).toHaveBeenCalledTimes(1);
  });
  it("disposes pending and queued callbacks idempotently", () => {
    const f = fixture();
    const stop = registerOnceWhenReady(f.manager);
    const queued = [...f.callbacks];
    stop();
    stop();
    f.signal();
    queued.forEach((cb) => cb());
    expect(f.registerScripts).not.toHaveBeenCalled();
    expect(f.unsubscribe).toHaveBeenCalledTimes(1);
  });
  it("guards reentrant signals and permits an explicit later retry after failure", () => {
    const f = fixture();
    f.registerScripts
      .mockImplementationOnce(() => {
        throw new Error("provider failed");
      })
      .mockImplementation(() => f.signal());
    registerOnceWhenReady(f.manager);
    expect(() => f.signal()).toThrow("provider failed");
    f.signal();
    expect(f.registerScripts).toHaveBeenCalledTimes(2);
  });
});
