import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: string;
  code?: string;
  issues?: Array<{ path: string; message: string }>;
};

export function apiError(
  status: number,
  error: string,
  options?: {
    code?: string;
    issues?: Array<{ path: string; message: string }>;
    headers?: HeadersInit;
  }
) {
  const body: ApiErrorBody = { error };
  if (options?.code) body.code = options.code;
  if (options?.issues?.length) body.issues = options.issues;
  return NextResponse.json(body, {
    status,
    headers: options?.headers,
  });
}
