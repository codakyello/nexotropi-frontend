import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract a human-readable error message from an axios error response.
 * Handles FastAPI HTTPException detail strings, Pydantic validation error arrays,
 * and plain message fields.
 */
export function getApiError(err: any, fallback?: string): string {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail) && detail[0]?.msg) {
    return detail.map((e: any) => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`).join(' · ')
  }
  if (typeof detail === 'object' && detail?.message) return String(detail.message)
  const msg = err?.response?.data?.message
  if (typeof msg === 'string' && msg.trim()) return msg
  if (err?.message && err.message !== 'Network Error') return err.message
  return fallback ?? 'Something went wrong. Please try again.'
}
