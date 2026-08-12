import { describe, expect, it } from "vitest";

import { defineComponentSlots, defineMdxComponents } from "../src";

function DefaultHeader() {
  return null;
}

function BrandedHeader() {
  return null;
}

function DefaultFooter() {
  return null;
}

function Callout() {
  return null;
}

function BrandedCallout() {
  return null;
}

describe("component slots", () => {
  it("resolves typed overrides without wrapping components", () => {
    const slots = defineComponentSlots({
      Header: DefaultHeader,
      Footer: DefaultFooter,
    });

    expect(slots.resolve()).toEqual({
      Header: DefaultHeader,
      Footer: DefaultFooter,
    });
    expect(slots.resolve({ Header: BrandedHeader })).toEqual({
      Header: BrandedHeader,
      Footer: DefaultFooter,
    });
    expect(slots.resolve({ Header: BrandedHeader }).Header).toBe(BrandedHeader);
  });

  it("rejects unknown or undefined overrides", () => {
    const slots = defineComponentSlots({ Header: DefaultHeader });

    expect(() =>
      slots.resolve({ Navigation: BrandedHeader } as never),
    ).toThrow(expect.objectContaining({ code: "UNKNOWN_COMPONENT_OVERRIDE" }));
    expect(() =>
      slots.resolve({ Header: undefined } as never),
    ).toThrow(expect.objectContaining({ code: "INVALID_COMPONENT" }));
  });

  it("rejects invalid or empty slot definitions", () => {
    expect(() => defineComponentSlots({})).toThrow(
      expect.objectContaining({ code: "INVALID_COMPONENT_NAME" }),
    );
    expect(() =>
      defineComponentSlots({ "bad-name": DefaultHeader } as never),
    ).toThrow(expect.objectContaining({ code: "INVALID_COMPONENT_NAME" }));
  });
});

describe("controlled MDX components", () => {
  it("exposes only the explicit allowlist and known site overrides", () => {
    const components = defineMdxComponents({
      Callout,
      a: "a",
    });

    expect(components.resolve()).toEqual({ Callout, a: "a" });
    expect(components.resolve({ Callout: BrandedCallout })).toEqual({
      Callout: BrandedCallout,
      a: "a",
    });
    expect(() =>
      components.resolve({ Script: "script" } as never),
    ).toThrow(expect.objectContaining({ code: "UNKNOWN_COMPONENT_OVERRIDE" }));
  });
});
