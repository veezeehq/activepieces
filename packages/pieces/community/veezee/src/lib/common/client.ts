import { randomUUID } from 'node:crypto';
import {
  AuthenticationType,
  httpClient,
  HttpMethod,
  HttpRequest,
  QueryParams,
} from '@activepieces/pieces-common';

export const BASE_URL = 'https://api.veezee.io';

type QueryValue = string | number | boolean | undefined | null;

export type VeezeeApiCallParams = {
  apiKey: string;
  method: HttpMethod;
  resourceUri: string;
  query?: Record<string, QueryValue>;
  /** Metered GET routes require a unique Idempotency-Key header; free routes (usage) do not. */
  idempotent?: boolean;
};

export async function veezeeApiCall<T>({
  apiKey,
  method,
  resourceUri,
  query,
  idempotent = true,
}: VeezeeApiCallParams): Promise<T> {
  const queryParams: QueryParams = {};

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    }
  }

  const request: HttpRequest = {
    method,
    url: `${BASE_URL}${resourceUri}`,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: apiKey,
    },
    headers: idempotent ? { 'Idempotency-Key': randomUUID() } : undefined,
    queryParams,
  };

  try {
    const response = await httpClient.sendRequest<T>(request);
    return response.body;
  } catch (error: unknown) {
    const veezeeError = error as {
      response?: { status?: number; body?: unknown };
      message?: string;
    };
    const status = veezeeError.response?.status;
    const body = veezeeError.response?.body;
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : typeof body === 'string'
        ? body
        : veezeeError.message ?? 'Unknown error';
    throw new Error(`Veezee API error${status ? ` ${status}` : ''}: ${detail}`);
  }
}
