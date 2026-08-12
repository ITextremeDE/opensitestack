import type { z } from "zod";

import type { ContentDocument } from "./content-schema";

export type RawContentRecord = {
  readonly value: unknown;
  readonly reference: string;
};

export interface ContentSourceAdapter {
  readonly name: string;
  load(): Promise<readonly RawContentRecord[]>;
}

export type ValidatedContentRecord<T extends ContentDocument> = {
  readonly value: T;
  readonly source: {
    readonly adapter: string;
    readonly reference: string;
  };
};

export type ContentValidationErrorCode =
  | "INVALID_CONTENT"
  | "DUPLICATE_CONTENT_ID"
  | "DUPLICATE_CONTENT_SLUG";

export class ContentValidationError extends Error {
  constructor(
    readonly code: ContentValidationErrorCode,
    message: string,
    readonly source: { adapter: string; reference: string },
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ContentValidationError";
  }
}

export async function validateContentSource<T extends ContentDocument>(
  adapter: ContentSourceAdapter,
  schema: z.ZodType<T>,
): Promise<readonly ValidatedContentRecord<T>[]> {
  const rawRecords = await adapter.load();
  const records: ValidatedContentRecord<T>[] = [];
  const ids = new Map<string, string>();
  const slugs = new Map<string, string>();

  for (const record of rawRecords) {
    const source = { adapter: adapter.name, reference: record.reference };
    const result = schema.safeParse(record.value);
    if (!result.success) {
      throw new ContentValidationError(
        "INVALID_CONTENT",
        `Invalid content from ${adapter.name}:${record.reference}: ${result.error.issues.map((issue) => `${issue.path.join(".") || "document"}: ${issue.message}`).join("; ")}`,
        source,
        { cause: result.error },
      );
    }

    assertUnique("id", result.data.id, record.reference, ids, source);
    assertUnique("slug", result.data.slug, record.reference, slugs, source);
    records.push({ value: result.data, source });
  }

  return records;
}

function assertUnique(
  field: "id" | "slug",
  value: string,
  reference: string,
  seen: Map<string, string>,
  source: { adapter: string; reference: string },
): void {
  const existingReference = seen.get(value);
  if (existingReference) {
    const code = field === "id" ? "DUPLICATE_CONTENT_ID" : "DUPLICATE_CONTENT_SLUG";
    throw new ContentValidationError(
      code,
      `Duplicate content ${field} ${value} in ${existingReference} and ${reference}`,
      source,
    );
  }
  seen.set(value, reference);
}
