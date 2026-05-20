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
  const referenceId = err?.response?.data?.reference_id || err?.response?.data?.trace_id
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return referenceId ? `${detail} (Ref: ${referenceId})` : detail
  if (Array.isArray(detail) && detail[0]?.msg) {
    const message = detail.map((e: any) => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`).join(' · ')
    return referenceId ? `${message} (Ref: ${referenceId})` : message
  }
  if (typeof detail === 'object' && detail?.message) {
    const missingAnchors = Array.isArray(detail?.missing_anchors) && detail.missing_anchors.length
      ? ` Missing: ${detail.missing_anchors.join(', ')}.`
      : ''
    const message = `${String(detail.message)}${missingAnchors}`
    return referenceId ? `${message} (Ref: ${referenceId})` : message
  }
  const msg = err?.response?.data?.message
  if (typeof msg === 'string' && msg.trim()) return referenceId ? `${msg} (Ref: ${referenceId})` : msg
  if (err?.message && err.message !== 'Network Error') return err.message
  return fallback ?? 'Something went wrong. Please try again.'
}
