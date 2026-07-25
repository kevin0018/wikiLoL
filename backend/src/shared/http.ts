import { ZodError, type ZodType } from "zod";

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  schema?: ZodType<T>,
): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const detail = await response.text();
    throw new UpstreamError(response.status, detail);
  }

  const payload: unknown = await response.json();
  if (!schema) {
    return payload as T;
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new UpstreamPayloadError(error);
    }
    throw error;
  }
}

export class UpstreamError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`Upstream request failed with status ${status}`);
  }
}

export class UpstreamPayloadError extends Error {
  constructor(public readonly cause: ZodError) {
    super("Upstream response did not match the expected schema");
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error desconocido";
}
