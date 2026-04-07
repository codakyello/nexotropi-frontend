# Nexotropi — RFQ Workflow Overhaul

**Started:** 2026-03-25
**Status:** Complete — ready to test

---

## What We're Changing & Why

### Old flow
1. User creates session (title + **description** + suppliers)
2. AI reads description → generates dynamic fields → asks clarification questions
3. User answers clarification questions
4. AI drafts full RFQ email (Celery task)
5. User reviews AI draft, edits in TipTap
6. User sets constraints (pricing, strategy, rounds)
7. User approves → PDF generated → sent to suppliers

### New flow
1. User creates session (title + suppliers only — no description)
2. User writes RFQ directly in TipTap **or** uploads their own PDF/DOCX
3. AI reads the RFQ content → extracts structured negotiation fields
4. **Confirmation screen:**
   - Section A: AI-extracted product fields (user verifies, corrects gaps)
   - Section B: Private negotiation params (target price, max price, strategy, rounds — never sent to suppliers)
5. User sends → original content sent as email body (write path) or attachment (upload path)

### Why
- AI generation produced documents users didn't write → trust issues
- PDF engine (WeasyPrint) was complex, broke on formatting edge cases
- Description field was redundant — the RFQ content IS the description
- AI is better used for extraction + negotiation analysis than document generation

---

## Task List

### Phase 1 — Backend

#### 1.1 PDF text extraction library
- [ ] Add `pdfplumber` to `pyproject.toml` / `requirements.txt`
- [ ] Test that it works inside Docker/Alpine container

#### 1.2 New AI extraction service
- [ ] Add `extract_rfq_fields()` to `backend/app/common/services/ai/rfq_builder.py`
  - Input: plain text or HTML content from the RFQ
  - Output: `RFQExtractionResult` — procurement_type, extracted fields (name/value/unit/found/expected/confidence)
  - Flags fields "expected for this procurement type" but not found in document
  - Includes safeguard: "is this actually an RFQ?" confidence signal
  - Works across variable product types (electronics, commodities, services, etc.)
- [ ] Add `RFQExtractionResult` and `ExtractedField` Pydantic schemas

#### 1.3 New extraction endpoint
- [ ] Add `POST /sessions/{session_id}/rfq/extract` to `backend/app/modules/rfq/routes/rfq.py`
  - Accepts: `{ content: str }` (TipTap HTML or plain text) OR multipart file upload
  - If file: extract text with pdfplumber, then call AI
  - Calls `extract_rfq_fields()`
  - Returns: extraction result with fields + procurement_type + is_rfq confidence
  - Does NOT create anything in DB — pure extraction call

#### 1.4 Update RFQ creation endpoint
- [ ] Update `POST /sessions/{session_id}/rfq`
  - Accept `content` (TipTap HTML) as the RFQ body — replaces `description` as AI input
  - Store content in `draft_email.user_html` immediately (user's own content)
  - Remove synchronous `inspect_rfq()` call
  - Remove `ai_questions` generation on creation
  - Set status directly to `AWAITING_APPROVAL` (skip AWAITING_CONTEXT and READY_TO_DRAFT)
- [ ] Update `RFQCreate` Pydantic schema to accept `content` field

#### 1.5 Simplify RFQ status flow
- [ ] `AWAITING_CONTEXT` and `READY_TO_DRAFT` statuses are now unused for new sessions
  - Keep in the enum for backwards compatibility with any existing sessions
  - New sessions go: `DRAFT` → `AWAITING_APPROVAL` → `SENT` → `CLOSED`
- [ ] Remove/skip `generate_rfq_draft` Celery task for new sessions
  - Task can stay in codebase for legacy sessions but won't be queued by new flow

#### 1.6 Update RFQ approve endpoint
- [ ] `POST /sessions/{session_id}/rfq/approve`
  - Write path (TipTap content): send as rich HTML email body, no PDF attachment
  - Upload path (uploaded file): attach original file + simple cover email body
  - Keep WeasyPrint PDF generation as optional (for users who explicitly want PDF output)
  - Priority: `user_html` (user-written TipTap) → `uploaded_file` → existing fallback

#### 1.7 Update Session creation
- [ ] Make `description` field optional in `NegotiationSession` model and `POST /sessions` schema
  - Field stays in DB but is no longer required or used by AI

#### 1.8 Constraints endpoint — no changes needed
- [ ] `POST /sessions/{session_id}/constraints` stays exactly as-is
  - It will now be called at end of Step 3 (confirmation screen) instead of as a separate UI step
  - Schema unchanged

---

### Phase 2 — Frontend

#### 2.1 Rewrite `NegotiationForm.tsx` — new 3-step wizard
- [ ] **Step 1 — Setup**
  - Fields: session name, supplier multi-select
  - Remove: description field
  - On submit: `POST /sessions` (creates session + pending negotiations)

- [ ] **Step 2 — Your RFQ**
  - Two tabs: "Write" (TipTap editor) / "Upload" (file input — PDF, DOCX)
  - Write tab: full TipTap editor with formatting toolbar
  - Upload tab: drag-and-drop file zone, shows filename on success
  - On continue: call `POST /sessions/{id}/rfq/extract` with content/file
  - Show loading state while AI extracts ("Analysing your RFQ...")
  - On error: show message, allow retry (don't block progress)

- [ ] **Step 3 — Confirm & Parameters**
  - Section A: "Extracted from your document"
    - List of dynamic fields returned by extraction
    - Green check for found fields, amber warning for "expected but not found"
    - All fields editable (user corrects AI)
    - "+ Add field" for custom fields
  - Section B: "Negotiation parameters" (private, never sent to suppliers)
    - target_price, max_price, min_acceptable_price, currency
    - quantity, min_quantity
    - max_rounds, strategy (aggressive/balanced/soft)
    - approval_mode, allow_counter_offers
    - delivery_deadline, payment_terms_max_days, supplier_timeout_hours
    - auto_accept_threshold, early_close_enabled/threshold
  - On submit:
    - `POST /sessions/{id}/rfq` with user content
    - `POST /sessions/{id}/constraints` with Section B values
    - Navigate to session detail page

#### 2.2 Update service hooks in `negotiation.ts`
- [ ] Add `useExtractRFQ()` — POST /sessions/{id}/rfq/extract
- [ ] Update `useCreateRFQ()` — accept `content` instead of description
- [ ] Update `useCreateSession()` — make description optional
- [ ] Add `ExtractedField` and `RFQExtractionResult` TypeScript interfaces
- [ ] Keep all existing hooks (approve, preview PDF, update draft) unchanged

#### 2.3 Remove obsolete UI
- [ ] Remove AI clarification questions step (Step 2 old) from NegotiationForm
- [ ] Remove `useSubmitRFQContext()` call from wizard (hook can stay for legacy sessions)
- [ ] Remove standalone constraints step — now embedded in Step 3

#### 2.4 Session detail page — simplify RFQ panel
- [ ] `RFQDrafting.tsx`: for new sessions (user_html present), skip draft-generation wait states
  - If RFQ already has `user_html` → go straight to approval panel
  - If RFQ is in AWAITING_APPROVAL → show preview + send button
  - Keep legacy states (AWAITING_CONTEXT, READY_TO_DRAFT) for any existing sessions

---

### Phase 3 — Polish & Edge Cases

- [ ] Handle extraction failure gracefully — if AI fails, show empty Section A, user fills manually
- [ ] File type validation on upload (PDF/DOCX only, max size)
- [ ] "Not an RFQ" warning banner when AI confidence is low (non-blocking)
- [ ] PDF preview still works for write path (user_html → WeasyPrint)
- [ ] Uploaded file path: store original bytes, attach directly without regenerating

---

## Progress Log

### 2026-03-25
- Completed full codebase exploration
- Defined new 3-step wizard structure
- Defined Section A (extracted) + Section B (private params) confirmation screen
- Clarified: dynamic fields stay but sourced from extraction not generation
- Clarified: PDF send vs email body send per path
- Created this task list
- **Completed Phase 1 & 2 (backend + frontend core changes)**
- Fixed TypeScript errors: `company_name` → `company` in NegotiationSummary + old suppliers page, `user_html` added to RFQ.draft_email interface, `useSearchParams` Suspense boundary on email settings page
- `bun run build` passes clean ✅
- `docker compose up --build` — API healthy, worker healthy ✅
- `/api/v1/sessions/{session_id}/rfq/extract` endpoint confirmed registered ✅

---

## Files Changed

| File | Change | Status |
|------|--------|--------|
| `backend/pyproject.toml` | Add pdfplumber | ✅ Done |
| `backend/app/common/services/ai/rfq_builder.py` | Add extract_rfq_fields() | ✅ Done |
| `backend/app/modules/rfq/schemas/rfq.py` | Add ExtractedField, RFQExtractionResult, RFQExtractRequest, update RFQCreate | ✅ Done |
| `backend/app/modules/rfq/routes/rfq.py` | Add POST /extract endpoint, update create_rfq new/legacy flow | ✅ Done |
| `backend/app/modules/negotiation/routes/sessions.py` | description already optional — no change needed | ✅ N/A |
| `frontend-mvp/components/users/negotiation/NegotiationForm.tsx` | Full rewrite — new 3-step wizard (Setup → RFQ → Confirm+Params) | ✅ Done |
| `frontend-mvp/services/requests/negotiation.ts` | Add ExtractedField, RFQExtractionResult interfaces + useExtractRFQ hook, update useCreateRFQ | ✅ Done |
| `frontend-mvp/components/users/negotiation/RFQDrafting.tsx` | Fix draftDataToHtml extra arg; show user_html in sent state | ✅ Done |

## Remaining Work

### PDF upload path (Phase 3)
- Currently upload tab reads TXT files directly; PDF/DOCX extraction is server-side
- Need to send actual file bytes to `/extract` endpoint (multipart form) for PDF parsing
- pdfplumber is now installed — need endpoint to accept `UploadFile` in addition to JSON `content`

### Supplier PDF reply handling (Phase 3)
- If a supplier replies with a PDF attachment (filled-in price table), system needs to extract it
- Architecture: Nylas webhook detects PDF attachment → pdfplumber extracts text → AI price extractor
- Not yet implemented but pdfplumber is installed and ready

### Multi-item negotiation AI (Phase 4)
- Per-item response parsing: extract per-item prices from supplier reply emails into `negotiation_line_item_quotes`
- Multi-item counter-offer AI: evaluate per-item, draft item-specific counter-offer prose
- Split award optimization UI: matrix view showing per-supplier per-item pricing, AI-recommended award split

---

## Completed (2026-03-26 — Session 3)

### Delivery date → lead time working days

**Why:** Delivery deadlines on RFQs are conceptually wrong. The LPO (Local Purchase Order) is issued *after* negotiation ends — so there is no fixed delivery date at RFQ time. The correct model is a lead time: "deliver within X working days of PO issuance." The actual calendar delivery date only becomes known when the LPO is issued.

**What changed:**
- `negotiation_constraints` model: added `delivery_lead_time_working_days (Integer, nullable)`. `delivery_deadline` kept as legacy nullable column.
- `ConstraintsCreate` / `ConstraintsOut` schemas: added `delivery_lead_time_working_days`.
- `EXTRACTOR_SYSTEM_PROMPT`: updated to convert working days → calendar days (×1.4, round up) when extracting supplier quotes.
- `extract_rfq_fields` prompt: now extracts `delivery_working_days` (number) instead of `delivery_deadline` (date) from buyer RFQs.
- `build_strategy_prompt`: uses lead time ("within X working days of PO") instead of an absolute date.
- `draft_rfq_email` + `negotiation_tasks`: use `delivery_lead_time_working_days` throughout.
- `NegotiationForm.tsx`: replaced `deliveryDate` (datetime-local picker) and `deliveryDeadline` states with single `deliveryWorkingDays` number input. Shown in Section A, passed to both RFQ and constraints.
- `negotiation.ts` Constraints interface: added `delivery_lead_time_working_days`.
- Alembic migration: `d4e5f6a7b8c9`.

## Completed (2026-03-25 — Session 2)
