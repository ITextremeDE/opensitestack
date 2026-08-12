import { z } from "zod";

import type { SiteDefinition, ConsentPurpose } from "./types";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const consentPurposeSchema = z.enum([
  "preferences",
  "analytics",
  "marketing",
]);

const consentStateSchema = z
  .object({
    policyVersion: z.string().trim().min(1),
    grantedPurposes: z.array(consentPurposeSchema).readonly(),
  })
  .strict();

const analyticsScriptSchema = z
  .object({
    id: identifierSchema,
    src: z.url().refine((value) => new URL(value).protocol === "https:", {
      message: "Analytics script URL must use HTTPS",
    }),
    strategy: z.enum(["afterInteractive", "lazyOnload"]).default("lazyOnload"),
  })
  .strict();

const analyticsScriptsSchema = z.array(analyticsScriptSchema).readonly();

export type ConsentState = z.infer<typeof consentStateSchema>;
export type AnalyticsScript = z.infer<typeof analyticsScriptSchema>;

export interface ConsentAdapter<Input = unknown> {
  readonly id: string;
  load(options: {
    readonly site: SiteDefinition;
    readonly input: Input;
  }): Promise<unknown>;
}

export interface AnalyticsAdapter {
  readonly id: string;
  scripts(options: { readonly site: SiteDefinition }): Promise<unknown>;
}

export interface ServerFormAdapter<Input, Output> {
  readonly id: string;
  readonly schema: z.ZodType<Input>;
  submit(options: {
    readonly site: SiteDefinition;
    readonly formId: string;
    readonly value: Input;
  }): Promise<Output>;
}

export type FormValidationIssue = {
  readonly path: readonly string[];
  readonly code: string;
  readonly message: string;
};

export type FormSubmissionResult<Output> =
  | { readonly ok: true; readonly value: Output }
  | { readonly ok: false; readonly issues: readonly FormValidationIssue[] };

export type IntegrationErrorCode =
  | "CONSENT_ADAPTER_MISMATCH"
  | "ANALYTICS_ADAPTER_MISMATCH"
  | "INVALID_ANALYTICS_OUTPUT"
  | "DUPLICATE_ANALYTICS_SCRIPT"
  | "FORM_NOT_CONFIGURED"
  | "FORM_ADAPTER_MISMATCH";

export class IntegrationError extends Error {
  constructor(
    readonly code: IntegrationErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "IntegrationError";
  }
}

export async function resolveConsent<Input>(options: {
  readonly site: SiteDefinition;
  readonly adapter?: ConsentAdapter<Input>;
  readonly input: Input;
}): Promise<ConsentState | null> {
  const configuration = options.site.integrations?.consent;
  if (!configuration) {
    return null;
  }
  if (!options.adapter || options.adapter.id !== configuration.adapterId) {
    throw new IntegrationError(
      "CONSENT_ADAPTER_MISMATCH",
      `Site ${options.site.id} requires consent adapter ${configuration.adapterId}`,
    );
  }

  const result = consentStateSchema.safeParse(
    await options.adapter.load({ site: options.site, input: options.input }),
  );
  if (
    !result.success ||
    result.data.policyVersion !== configuration.policyVersion ||
    result.data.grantedPurposes.some(
      (purpose) => !configuration.purposes.includes(purpose),
    )
  ) {
    return null;
  }

  return {
    ...result.data,
    grantedPurposes: [...new Set(result.data.grantedPurposes)],
  };
}

export function hasConsent(
  site: SiteDefinition,
  state: ConsentState | null,
  purpose: ConsentPurpose,
): boolean {
  const configuration = site.integrations?.consent;
  return Boolean(
    configuration &&
      state &&
      state.policyVersion === configuration.policyVersion &&
      configuration.purposes.includes(purpose) &&
      state.grantedPurposes.includes(purpose),
  );
}

export async function resolveAnalyticsScripts(options: {
  readonly site: SiteDefinition;
  readonly consent: ConsentState | null;
  readonly adapter?: AnalyticsAdapter;
}): Promise<readonly AnalyticsScript[]> {
  const configuration = options.site.integrations?.analytics;
  if (!configuration || !hasConsent(options.site, options.consent, configuration.consentPurpose)) {
    return [];
  }
  if (!options.adapter || options.adapter.id !== configuration.adapterId) {
    throw new IntegrationError(
      "ANALYTICS_ADAPTER_MISMATCH",
      `Site ${options.site.id} requires analytics adapter ${configuration.adapterId}`,
    );
  }

  const result = analyticsScriptsSchema.safeParse(
    await options.adapter.scripts({ site: options.site }),
  );
  if (!result.success) {
    throw new IntegrationError(
      "INVALID_ANALYTICS_OUTPUT",
      `Analytics adapter ${options.adapter.id} returned invalid scripts`,
      { cause: result.error },
    );
  }
  if (new Set(result.data.map((script) => script.id)).size !== result.data.length) {
    throw new IntegrationError(
      "DUPLICATE_ANALYTICS_SCRIPT",
      `Analytics adapter ${options.adapter.id} returned duplicate script ids`,
    );
  }

  return result.data;
}

export async function submitSiteForm<Input, Output>(options: {
  readonly site: SiteDefinition;
  readonly formId: string;
  readonly adapter: ServerFormAdapter<Input, Output>;
  readonly input: unknown;
}): Promise<FormSubmissionResult<Output>> {
  const configuration = options.site.integrations?.forms?.[options.formId];
  if (!configuration) {
    throw new IntegrationError(
      "FORM_NOT_CONFIGURED",
      `Form ${options.formId} is not configured for site ${options.site.id}`,
    );
  }
  if (options.adapter.id !== configuration.adapterId) {
    throw new IntegrationError(
      "FORM_ADAPTER_MISMATCH",
      `Form ${options.formId} for site ${options.site.id} requires adapter ${configuration.adapterId}`,
    );
  }

  const result = options.adapter.schema.safeParse(options.input);
  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues.map((issue) => ({
        path: issue.path.map(String),
        code: issue.code,
        message: issue.message,
      })),
    };
  }

  return {
    ok: true,
    value: await options.adapter.submit({
      site: options.site,
      formId: options.formId,
      value: result.data,
    }),
  };
}
