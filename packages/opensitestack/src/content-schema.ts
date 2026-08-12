import { z } from "zod";

export const contentStatusSchema = z.enum([
  "draft",
  "review",
  "published",
  "archived",
]);

export type ContentStatus = z.infer<typeof contentStatusSchema>;

const contentIdentifierSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const contentSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/);

const contentBaseShape = {
  id: contentIdentifierSchema,
  slug: contentSlugSchema,
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  status: contentStatusSchema,
  indexable: z.boolean().default(true),
  publishedAt: z.iso.datetime({ offset: true }).optional(),
  updatedAt: z.iso.datetime({ offset: true }).optional(),
  tags: z.array(contentIdentifierSchema).readonly().default([]),
  body: z.string(),
} satisfies z.ZodRawShape;

type ContentExtensionShape = {
  readonly [Field in keyof typeof contentBaseShape]?: never;
};

export const contentDocumentSchema = z.object(contentBaseShape).strict();

export type ContentDocument = z.infer<typeof contentDocumentSchema>;

export function defineContentSchema<const Shape extends z.ZodRawShape>(
  shape: Shape & ContentExtensionShape,
) {
  const reservedField = Object.keys(shape).find((field) => field in contentBaseShape);
  if (reservedField) {
    throw new Error(`Content extension cannot replace reserved field: ${reservedField}`);
  }

  return z.object({ ...contentBaseShape, ...shape }).strict();
}
