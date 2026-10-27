"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ExampleConsentManager,
  serverSnapshot,
} from "@/lib/example-consent-manager";
import { registerOnceWhenReady } from "@/lib/consent-registration";

export function ConsentExample({
  children,
  initiallyReady,
}: {
  children: ReactNode;
  initiallyReady: boolean;
}) {
  const [manager] = useState(() => new ExampleConsentManager());
  const state = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    () => serverSnapshot,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    manager.loadSavedChoice();
    if (initiallyReady) manager.initialize();
    return registerOnceWhenReady(manager);
  }, [manager, initiallyReady]);
  const choose = (choice: "granted" | "rejected") => {
    manager.choose(choice);
    dialog.current?.close();
  };
  return (
    <main className="consent-example">
      <h1>Consent lifecycle example</h1>
      <p>
        A synthetic local manager demonstrates registration after readiness. No
        third-party scripts or analytics requests are used.
      </p>
      {children}
      <p>
        Manager: <strong>{state.ready ? "ready" : "waiting"}</strong>. Choice:{" "}
        <strong data-testid="choice">{state.choice}</strong>.
      </p>
      <p>
        Registrations:{" "}
        <output data-testid="registrations">{state.registrations}</output>.
        Script starts:{" "}
        <output data-testid="starts" aria-live="polite">
          {state.starts}
        </output>
        .
      </p>
      {state.persistenceError && (
        <p role="alert">
          Preference storage is unavailable or invalid; no previous grant was
          accepted.
        </p>
      )}
      <div className="consent-example__controls">
        <button type="button" onClick={manager.initialize}>
          Initialize manager
        </button>
        <button
          type="button"
          disabled={!state.ready}
          onClick={() => dialog.current?.showModal()}
        >
          Privacy settings
        </button>
        <button
          type="button"
          disabled={!state.ready}
          onClick={() => manager.choose("rejected")}
        >
          Revoke analytics
        </button>
      </div>
      <p>
        Repeated readiness signals do not register or start scripts twice.
        Revocation blocks future activation; it cannot undo code already
        executed. Reload to observe the stored choice.
      </p>
      <dialog
        ref={dialog}
        aria-labelledby="consent-example-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const buttons =
            event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
          if (event.shiftKey && document.activeElement === buttons[0]) {
            event.preventDefault();
            buttons[buttons.length - 1].focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === buttons[buttons.length - 1]
          ) {
            event.preventDefault();
            buttons[0].focus();
          }
        }}
      >
        <h2 id="consent-example-title">Privacy preferences</h2>
        <p>Allow the local demonstration counter?</p>
        <div className="consent-example__controls">
          <button type="button" onClick={() => choose("granted")}>
            Allow analytics
          </button>
          <button type="button" onClick={() => choose("rejected")}>
            Reject analytics
          </button>
          <button type="button" onClick={() => dialog.current?.close()}>
            Close settings
          </button>
        </div>
      </dialog>
    </main>
  );
}
