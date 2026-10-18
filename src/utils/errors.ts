import axios from 'axios';
import type { ApiErrorBody } from '../types';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.mensagem ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {};
  const errors = error.response?.data?.erros;
  if (!errors) return {};
  return Object.fromEntries(Object.entries(errors).map(([field, message]) => [
    field,
    Array.isArray(message) ? message[0] : message,
  ]));
}
