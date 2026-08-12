import type { ElementType } from "react";

export type ComponentMap = Readonly<Record<string, ElementType>>;

export type ComponentRegistry<Components extends ComponentMap> = {
  readonly defaults: Readonly<Components>;
  resolve(overrides?: Partial<Components>): Readonly<Components>;
};

export type ComponentRegistryErrorCode =
  | "INVALID_COMPONENT_NAME"
  | "INVALID_COMPONENT"
  | "UNKNOWN_COMPONENT_OVERRIDE";

export class ComponentRegistryError extends Error {
  constructor(
    readonly code: ComponentRegistryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ComponentRegistryError";
  }
}

export function defineComponentSlots<const Components extends ComponentMap>(
  defaults: Components,
): ComponentRegistry<Components> {
  return createComponentRegistry(defaults, "slot");
}

export function defineMdxComponents<const Components extends ComponentMap>(
  components: Components,
): ComponentRegistry<Components> {
  return createComponentRegistry(components, "MDX component");
}

function createComponentRegistry<Components extends ComponentMap>(
  defaults: Components,
  kind: "slot" | "MDX component",
): ComponentRegistry<Components> {
  const names = Object.keys(defaults);
  if (names.length === 0) {
    throw new ComponentRegistryError(
      "INVALID_COMPONENT_NAME",
      `At least one ${kind} is required`,
    );
  }

  for (const name of names) {
    assertComponentName(name, kind);
    assertComponent(defaults[name], name, kind);
  }

  const frozenDefaults = Object.freeze({ ...defaults }) as Readonly<Components>;
  const allowedNames = new Set(names);

  return Object.freeze({
    defaults: frozenDefaults,
    resolve(overrides: Partial<Components> = {}): Readonly<Components> {
      for (const [name, component] of Object.entries(overrides)) {
        if (!allowedNames.has(name)) {
          throw new ComponentRegistryError(
            "UNKNOWN_COMPONENT_OVERRIDE",
            `Unknown ${kind} override: ${name}`,
          );
        }
        assertComponent(component, name, kind);
      }

      return Object.freeze({ ...frozenDefaults, ...overrides }) as Readonly<Components>;
    },
  });
}

function assertComponentName(name: string, kind: string): void {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
    throw new ComponentRegistryError(
      "INVALID_COMPONENT_NAME",
      `Invalid ${kind} name: ${name}`,
    );
  }
}

function assertComponent(
  component: unknown,
  name: string,
  kind: string,
): void {
  if (
    component === null ||
    component === undefined ||
    !["function", "object", "string"].includes(typeof component)
  ) {
    throw new ComponentRegistryError(
      "INVALID_COMPONENT",
      `Invalid ${kind}: ${name}`,
    );
  }
}
