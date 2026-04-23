# Nexotropi Frontend Agent Rules

This frontend is the buyer-facing UI for Nexotropi, a B2B AI procurement negotiation platform. Buyers create RFQs, connect email, send supplier requests, watch supplier replies and AI negotiation events in real time, and approve or override negotiation actions.

## Required Reading Before Coding

Before changing frontend code, read these files when relevant:

- `../PLATFORM_WORKFLOW.md` — product workflow ground truth. Required for RFQ, negotiation, email connection, supplier management, approval, award, and live event UI changes.
- `../backend/docs/PRODUCT_ERROR_HANDLING.md` — required before changing API error display, async workflow state display, SSE/live update behavior, quote extraction UI, attachment UI, or any feature that can show failure states.
- `../patterns.md` — general coding/error-handling philosophy.
- `../backend/prd.md` — edge cases and product requirements. Required before implementing negotiation behavior or supplier reply UX.

## Product Error Display Rule

Normal users should never see vendor/internal names such as Nylas, Redis, S3, OpenRouter, Postgres, Celery, CloudWatch, SQLAlchemy, stack traces, internal URLs, tokens, or raw provider errors.

Frontend should display:

- product impact
- current workflow state
- next action
- `error_code` when useful
- `reference_id` for support-worthy or unexpected failures

Frontend should not display raw backend exception details.

## Async Workflow Rule

Many Nexotropi workflows complete through Celery and SSE after the original HTTP request has returned. Do not assume a successful API response means the workflow completed.

For negotiation/RFQ screens, make sure every long-running state can transition to:

- success
- retrying
- buyer review required
- failed with product-safe message

Never leave UI stuck indefinitely on states like "connecting email", "extracting quote", "sending RFQ", or "generating counteroffer".

## Live Event Rule

When changing live negotiation UI, verify frontend event names match backend SSE events.

Backend currently emits:

- `session_event` from `/api/v1/sessions/{session_id}/stream`
- `negotiation_step` from `/api/v1/negotiations/{negotiation_id}/stream`

Frontend may keep legacy listeners for compatibility, but new code must support the canonical backend event names.
