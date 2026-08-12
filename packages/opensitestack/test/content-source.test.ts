import { describe, expect, it } from "vitest";

import {
  contentDocumentSchema,
  defineContentSchema,
  validateContentSource,
  type ContentSourceAdapter,
} from "../src";
import { z } from "zod";

function source(...values: unknown[]): ContentSourceAdapter {
  return {
    name: "test-source",
    load: async () =>
      values.map((value, index) => ({ value, reference: `${index}.json` })),
  };
}

const validDocument = {
  id: "welcome",
  slug: "pages/welcome",
  title: "Welcome",
  summary: "A valid content document.",
  status: "published",
  publishedAt: "2026-08-12T12:00:00+02:00",
  tags: ["example"],
  body: "# Welcome",
};

describe("content schemas", () => {
  it("validates the explicit lifecycle and publication date", () => {
    expect(contentDocumentSchema.parse(validDocument)).toMatchObject({
      status: "published",
      tags: ["example"],
    });
    expect(() =>
      contentDocumentSchema.parse({ ...validDocument, publishedAt: undefined }),
    ).toThrow("Published content requires publishedAt");
    expect(() =>
      contentDocumentSchema.parse({ ...validDocument, status: "live" }),
    ).toThrow();
  });

  it("extends the base contract with site-specific fields", () => {
    const articleSchema = defineContentSchema({
      author: z.string().trim().min(1),
    });

    expect(
      articleSchema.parse({ ...validDocument, author: "Ada" }).author,
    ).toBe("Ada");
    expect(() => articleSchema.parse(validDocument)).toThrow();
  });

  it("does not allow extensions to replace lifecycle fields", () => {
    expect(() =>
      defineContentSchema({ status: z.string() } as never),
    ).toThrow(
      "cannot replace reserved field: status",
    );
  });
});

describe("validateContentSource", () => {
  it("returns validated content with source provenance", async () => {
    await expect(
      validateContentSource(source(validDocument), contentDocumentSchema),
    ).resolves.toEqual([
      {
        value: validDocument,
        source: { adapter: "test-source", reference: "0.json" },
      },
    ]);
  });

  it("rejects invalid records with a stable error code and reference", async () => {
    await expect(
      validateContentSource(
        source({ ...validDocument, title: "" }),
        contentDocumentSchema,
      ),
    ).rejects.toMatchObject({
      name: "ContentValidationError",
      code: "INVALID_CONTENT",
      source: { adapter: "test-source", reference: "0.json" },
    });
  });

  it.each([
    ["id", "DUPLICATE_CONTENT_ID"],
    ["slug", "DUPLICATE_CONTENT_SLUG"],
  ] as const)("rejects duplicate %s values", async (field, code) => {
    const duplicate = {
      ...validDocument,
      id: field === "id" ? validDocument.id : "another-id",
      slug: field === "slug" ? validDocument.slug : "another-slug",
    };

    await expect(
      validateContentSource(
        source(validDocument, duplicate),
        contentDocumentSchema,
      ),
    ).rejects.toMatchObject({ code });
  });
});
