import type { ZodType } from "zod";

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
  return schema ? schema.parse(payload) : (payload as T);
}

export class UpstreamError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`Upstream request failed with status ${status}`);
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error desconocido";
}
