import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axiosInstance";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────

export interface Industry {
  id: string;
  name: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  created_by: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  notes: string | null;
  industry_id: string;
  industry: Industry | null;
  reliability_score: number | null;
  avg_response_hours: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  status: string;
  initiator_type: string;
  negotiation_phase: string;
  min_responses_required: number;
  response_deadline: string | null;
  quote_deadline: string | null;
  quote_count: number;
  awarded_supplier_id: string | null;
  paused_at: string | null;
  pause_reason: string | null;
  resumed_at: string | null;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

export interface Constraints {
  id: string;
  session_id: string;
  max_price: number | null;
  target_price: number | null;
  min_acceptable_price: number | null;
  currency: string;
  quantity: number | null;
  min_quantity: number | null;
  allow_partial_quantity: boolean;
  total_budget_ceiling: number | null;
  award_basis: 'single_supplier' | 'line_item_split' | 'lot_based' | null;
  partial_quote_policy: 'allow_partial' | 'require_all_items';
  price_violation_scope: 'supplier_fail' | 'line_item_fail';
  bundle_pricing_policy: 'buyer_review_required' | 'standalone_line_pricing_required';
  partial_award_disclosure: 'none' | 'whole_or_part' | 'line_item_individual' | 'multi_supplier_explicit';
  commercial_basis_mode: 'basic' | 'normalized';
  delivery_lead_time_working_days: number | null;
  delivery_deadline: string | null; // legacy
  payment_terms_max_days: number | null;
  max_rounds: number;
  strategy: string;
  allow_counter_offers: boolean;
  auto_accept_threshold: number | null;
  supplier_timeout_hours: number;
  approval_mode: string;
  max_price_buffer: number;
  early_close_enabled: boolean;
  early_close_threshold: number;
  late_submission_policy: 'notify_buyer' | 'auto_reject';
  created_at: string;
  brief: NegotiationBrief | null;
}

export interface RFQ {
  id: string;
  session_id: string;
  item_name: string;
  description: string | null;
  quantity: number | null;
  target_price: number | null;
  deadline: string | null;
  response_deadline: string | null;
  status: string;
  ai_questions: Array<{ key: string; label: string; type: string; required: boolean }> | null;
  ai_context: Record<string, string> | null;
  draft_email: {
    subject: string;
    body: string;
    body_html?: string;
    user_html?: string;
    original_filename?: string;
    original_s3_key?: string;
    original_file_b64?: string;
    draft_data?: Record<string, any>;
    procurement_policy?: Record<string, any>;
    policy_validation?: {
      blocking: boolean;
      issues: Array<{ severity: string; code: string; message: string }>;
    };
  } | null;
  sent_at: string | null;
  created_at: string;
  line_items: RFQLineItem[];
}

export interface Negotiation {
  id: string;
  session_id: string;
  supplier_id: string;
  buyer_id: string;
  rfq_id: string | null;
  status: string;
  current_round: number;
  paused_at: string | null;
  pause_reason: string | null;
  pending_counteroffer: Record<string, any> | null;
  agreed_price: number | null;
  agreed_quantity: number | null;
  end_reason: string | null;
  nylas_thread_id: string | null;
  savings_amount: number | null;
  savings_percent: number | null;
  total_rounds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface NegotiationMessage {
  id: string;
  negotiation_id: string;
  sender_type: string;
  sender_id: string | null;
  round_number: number;
  direction: string;
  message: string;
  subject: string | null;
  extracted_offer: Record<string, any> | null;
  ai_reasoning: Record<string, any> | null;
  ai_summary: string | null;
  attachments: Array<Record<string, any>> | null;
  was_human_overridden: Record<string, any> | null;
  nylas_message_id: string | null;
  nylas_thread_id: string | null;
  created_at: string;
}

export interface SupplierQuoteRevisionLine {
  id: string;
  revision_id: string;
  negotiation_id: string;
  rfq_line_item_id: string;
  line_number: number;
  item_name: string;
  quote_state: "quoted" | "carried_forward" | "unquoted";
  quoted_explicitly: boolean;
  unit_price: number | null;
  quantity: number | null;
  effective_unit_price: number | null;
  effective_quantity: number | null;
  delivery_days: number | null;
  notes: string | null;
  created_at: string;
}

export interface SupplierQuoteRevision {
  id: string;
  negotiation_id: string;
  source_message_id: string | null;
  revision_number: number;
  round_number: number;
  is_partial: boolean;
  raw_email: string | null;
  extracted_offer: Record<string, any> | null;
  effective_offer: Record<string, any> | null;
  nylas_message_id: string | null;
  nylas_thread_id: string | null;
  created_at: string;
  lines: SupplierQuoteRevisionLine[];
}

export interface ClarificationRequest {
  id: string;
  negotiation_id: string;
  trigger_reason: string;
  question_sent: string;
  attempt_number: number;
  queued_email_count: number;
  sent_at: string | null;
  created_at: string;
}

export interface NegotiationEscalation {
  id: string;
  negotiation_id: string;
  session_id: string;
  source_negotiation_message_id: string | null;
  nylas_message_id: string;
  nylas_thread_id: string | null;
  round_number: number;
  supplier_question_summary: string;
  supplier_question_excerpt: string;
  status: "open" | "resolved";
  resolution_strategy: "answer" | "proceed_without_answer" | "pause_negotiation" | "end_negotiation" | null;
  buyer_answer: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface NegotiationEvent {
  id: string;
  session_id: string;
  negotiation_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  data: Record<string, any> | null;
  round_number: number | null;
  triggered_by: string | null;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  tagline: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  tax_id: string | null;
  registration_number: string | null;
  primary_color: string;
  secondary_color: string;
  default_currency: string;
  signatory_name: string | null;
  signatory_title: string | null;
  footer_disclaimer: string | null;
  stamp_url: string | null;
  terms_and_conditions: string | null;
}

export interface NylasGrantStatus {
  grant_id: string | null;
  status: string | null;
  provider: string | null;
}

interface ApiResponse<T = any> {
  message: string;
  data: T;
}

// ── Industries ───────────────────────────────────────────────────────────

export const useIndustries = () =>
  useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Industry[]>>("/industries");
      return res.data.data;
    },
  });

export const useCreateIndustry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post<ApiResponse<Industry>>("/industries", { name });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["industries"] }),
  });
};

export const useDeleteIndustry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/industries/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["industries"] }),
  });
};

// ── Suppliers ────────────────────────────────────────────────────────────

export const useSuppliers = () =>
  useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Supplier[]>>("/suppliers");
      return res.data.data;
    },
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; industry_id: string; company?: string; phone?: string; notes?: string }) => {
      const res = await api.post<ApiResponse<Supplier>>("/suppliers", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; email: string; industry_id: string; company: string; phone: string; notes: string; status: string }> }) => {
      const res = await api.patch<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/suppliers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

// ── Sessions ─────────────────────────────────────────────────────────────

export const useSessions = () =>
  useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Session[]>>("/sessions");
      return res.data.data;
    },
  });

export const useSession = (id: string) =>
  useQuery({
    queryKey: ["sessions", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Session>>(`/sessions/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      initiator_type?: string;
      min_responses_required?: number;
      response_deadline?: string;
      supplier_ids: string[];
    }) => {
      const res = await api.post<ApiResponse<Session>>("/sessions", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

// ── Constraints ──────────────────────────────────────────────────────────

export const useConstraints = (sessionId: string) =>
  useQuery({
    queryKey: ["constraints", sessionId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Constraints>>(`/sessions/${sessionId}/constraints`);
      return res.data.data;
    },
    enabled: !!sessionId,
    retry: false,
  });

export const useSetConstraints = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: Record<string, any> }) => {
      const res = await api.post<ApiResponse<Constraints>>(`/sessions/${sessionId}/constraints`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["constraints", vars.sessionId] }),
  });
};

// ── Negotiations ─────────────────────────────────────────────────────────

export const useNegotiationsBySession = (sessionId: string) =>
  useQuery({
    queryKey: ["negotiations", sessionId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Negotiation[]>>(`/negotiations/by-session/${sessionId}`);
      return res.data.data;
    },
    enabled: !!sessionId,
  });

export const useNegotiation = (id: string) =>
  useQuery({
    queryKey: ["negotiation", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Negotiation>>(`/negotiations/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useNegotiationMessages = (id: string) =>
  useQuery({
    queryKey: ["negotiation-messages", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<NegotiationMessage[]>>(`/negotiations/${id}/messages`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useNegotiationQuoteRevisions = (id: string) =>
  useQuery({
    queryKey: ["negotiation-quote-revisions", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SupplierQuoteRevision[]>>(`/negotiations/${id}/quote-revisions`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useNegotiationEvents = (id: string) =>
  useQuery({
    queryKey: ["negotiation-events", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<NegotiationEvent[]>>(`/negotiations/${id}/events`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const usePendingClarification = (negotiationId: string) =>
  useQuery({
    queryKey: ["negotiation-clarification", negotiationId],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<ClarificationRequest>>(
          `/negotiations/${negotiationId}/clarification`
        );
        return res.data.data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!negotiationId,
    retry: false,
  });

export const useResolveClarification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      clarificationId,
      targetNegotiationId,
    }: {
      sessionId: string;
      clarificationId: string;
      targetNegotiationId: string;
    }) => {
      const res = await api.post<ApiResponse<{ queued_emails_processing: number }>>(
        `/sessions/${sessionId}/clarifications/${clarificationId}/resolve`,
        { target_negotiation_id: targetNegotiationId }
      );
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["negotiation-clarification", vars.clarificationId] });
      qc.invalidateQueries({ queryKey: ["negotiation", vars.targetNegotiationId] });
    },
  });
};

export const useNegotiationEscalation = (negotiationId: string) =>
  useQuery({
    queryKey: ["negotiation-escalation", negotiationId],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<NegotiationEscalation>>(
          `/negotiations/${negotiationId}/escalation`
        );
        return res.data.data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!negotiationId,
    retry: false,
  });

export const useResolveNegotiationEscalation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      negotiationId,
      escalationId,
      data,
    }: {
      negotiationId: string;
      escalationId: string;
      data: { resolution_strategy: "answer" | "proceed_without_answer" | "pause_negotiation" | "end_negotiation"; buyer_answer?: string };
    }) => {
      const res = await api.post<ApiResponse<NegotiationEscalation>>(
        `/negotiations/${negotiationId}/escalations/${escalationId}/resolve`,
        data,
      );
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["negotiation-escalation", vars.negotiationId] });
      qc.invalidateQueries({ queryKey: ["negotiation", vars.negotiationId] });
      qc.invalidateQueries({ queryKey: ["negotiation-events", vars.negotiationId] });
      qc.invalidateQueries({ queryKey: ["negotiation-messages", vars.negotiationId] });
    },
  });
};

export const useApproveCounteroffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { approved: boolean; override_message?: string; override_price?: number; override_quantity?: number } }) => {
      const res = await api.post<ApiResponse<Negotiation>>(`/negotiations/${id}/approve`, data);
      return res.data.data;
    },
    onSuccess: (neg) => {
      qc.invalidateQueries({ queryKey: ["negotiation", neg.id] });
      qc.invalidateQueries({ queryKey: ["negotiations", neg.session_id] });
    },
  });
};

export const useAcceptNegotiation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { agreed_price: number; agreed_quantity: number } }) => {
      const res = await api.post<ApiResponse<Negotiation>>(`/negotiations/${id}/accept`, data);
      return res.data.data;
    },
    onSuccess: (neg) => {
      qc.invalidateQueries({ queryKey: ["negotiations", neg.session_id] });
    },
  });
};

export const usePauseNegotiation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.post<ApiResponse<Negotiation>>(`/negotiations/${id}/pause`, { reason });
      return res.data.data;
    },
    onSuccess: (neg) => {
      qc.invalidateQueries({ queryKey: ["negotiation", neg.id] });
      qc.invalidateQueries({ queryKey: ["negotiations", neg.session_id] });
    },
  });
};

export const useEndNegotiation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<Negotiation>>(`/negotiations/${id}/end`);
      return res.data.data;
    },
    onSuccess: (neg) => {
      qc.invalidateQueries({ queryKey: ["negotiation", neg.id] });
      qc.invalidateQueries({ queryKey: ["negotiations", neg.session_id] });
    },
  });
};

export const useResumeNegotiation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<Negotiation>>(`/negotiations/${id}/resume`);
      return res.data.data;
    },
    onSuccess: (neg) => {
      qc.invalidateQueries({ queryKey: ["negotiation", neg.id] });
      qc.invalidateQueries({ queryKey: ["negotiations", neg.session_id] });
    },
  });
};

export const useOverrideNegotiation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: { override_message?: string } }) => {
      const res = await api.post<ApiResponse<Negotiation>>(`/negotiations/${id}/override`, data || {});
      return res.data.data;
    },
    onSuccess: (neg) => {
      qc.invalidateQueries({ queryKey: ["negotiation", neg.id] });
      qc.invalidateQueries({ queryKey: ["negotiations", neg.session_id] });
    },
  });
};

// ── RFQ ──────────────────────────────────────────────────────────────────

export const useRFQ = (sessionId: string) =>
  useQuery({
    queryKey: ["rfq", sessionId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<RFQ>>(`/sessions/${sessionId}/rfq`);
      return res.data.data;
    },
    enabled: !!sessionId,
    retry: false,
  });

export const useRFQDownloadUrl = (sessionId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["rfq-download", sessionId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ url: string; filename: string | null }>>(
        `/sessions/${sessionId}/rfq/download`
      );
      return res.data.data;
    },
    enabled: !!sessionId && enabled,
    retry: false,
    staleTime: 5 * 60 * 1000, // treat as fresh for 5 min (URL is valid 15 min)
  });

export interface RFQLineItem {
  id: string;
  rfq_id: string;
  line_number: number;
  item_name: string;
  description: string | null;
  specification: string | null;
  quantity: number | null;
  unit: string | null;
  target_price_per_unit: number | null;
  max_price_per_unit: number | null;
  created_at: string;
}

export interface RFQLineItemCreate {
  line_number: number;
  item_name: string;
  description?: string | null;
  specification?: string | null;
  quantity?: number | null;
  unit?: string | null;
  target_price_per_unit?: number | null;
  max_price_per_unit?: number | null;
}

// ── Negotiation Brief ────────────────────────────────────────────────────

export type ParameterTier = "hard" | "target" | "flexible"

export interface BriefParameter {
  key: string
  label: string
  tier: ParameterTier
  extracted_value: string | null
  target_value: string | null
  boundary_value: string | null
  unit: string | null
  alternatives: string[] | null
  leverage_rule: string | null
  confidence: number
}

export interface SpecRequirement {
  key: string
  label: string
  value: string | null
  tier: 'hard' | 'flexible'
}

export interface NegotiationBrief {
  parameters: BriefParameter[]
  procurement_type: string
  summary: string | null
  spec_requirements?: SpecRequirement[] | null
}

export interface ExtractedField {
  key: string;
  label: string;
  value: any;
  unit: string | null;
  found: boolean;
  expected: boolean;
  confidence: number;
}

export interface RFQLineItemExtracted {
  line_number: number;
  item_name: string;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  specification: string | null;
}

export interface RFQExtractionResult {
  is_rfq: boolean;
  is_rfq_confidence: number;
  procurement_type: string;
  fields: ExtractedField[];
  line_items: RFQLineItemExtracted[];
  warning: string | null;
}

export const useExtractRFQ = () =>
  useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      const res = await api.post<ApiResponse<RFQExtractionResult>>(
        `/sessions/${sessionId}/rfq/extract`,
        { content },
      );
      return res.data.data;
    },
  });

export const useExtractRFQFile = () =>
  useMutation({
    mutationFn: async ({ sessionId, file }: { sessionId: string; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<ApiResponse<RFQExtractionResult>>(
        `/sessions/${sessionId}/rfq/extract/upload`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
  });

export const useExtractBrief = () =>
  useMutation({
    mutationFn: async ({ sessionId, extractionResult }: { sessionId: string; extractionResult: RFQExtractionResult }) => {
      const res = await api.post<ApiResponse<NegotiationBrief>>(
        `/sessions/${sessionId}/rfq/extract-brief`,
        extractionResult,
      );
      return res.data.data;
    },
  });

export const useCreateRFQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: { item_name: string; content?: string; description?: string; quantity?: number; target_price?: number; deadline?: string; response_deadline?: string; line_items?: RFQLineItemCreate[]; original_file_b64?: string; original_filename?: string } }) => {
      const res = await api.post<ApiResponse<RFQ>>(`/sessions/${sessionId}/rfq`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["rfq", vars.sessionId] }),
  });
};

export const useAiEnhanceRFQ = () => {
  return useMutation({
    mutationFn: async (data: { item_name: string; description?: string }) => {
      const res = await api.post<ApiResponse<any>>(`/rfqs/ai-enhance`, data);
      return res.data.data;
    },
  });
};

export const useRFQPreviewPDFUrl = (sessionId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["rfq-preview-pdf", sessionId],
    queryFn: async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}/rfq/preview-pdf`, {
          responseType: "blob",
        });
        return URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      } catch (err: any) {
        // When responseType is "blob", axios returns error body as a Blob — parse it to extract the real message
        if (err?.response?.data instanceof Blob) {
          try {
            const text = await (err.response.data as Blob).text();
            const json = JSON.parse(text);
            throw new Error(json.detail || json.message || "Failed to generate PDF preview");
          } catch (parseErr: any) {
            if (parseErr?.message && !parseErr.message.includes("JSON")) throw parseErr;
          }
        }
        throw err;
      }
    },
    enabled: !!sessionId && enabled,
    gcTime: 60_000,
  });

export const useSubmitRFQContext = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, answers }: { sessionId: string; answers: Record<string, string> }) => {
      const res = await api.post<ApiResponse<RFQ>>(`/sessions/${sessionId}/rfq/context`, { answers });
      return res.data.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["rfq", vars.sessionId] }),
  });
};

export const useUpdateRFQDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: { subject: string; body: string; body_html?: string; user_html?: string; draft_data?: Record<string, any> } }) => {
      const res = await api.patch<ApiResponse<RFQ>>(`/sessions/${sessionId}/rfq/draft`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["rfq", vars.sessionId] });
      qc.invalidateQueries({ queryKey: ["rfq-preview-pdf", vars.sessionId] });
    },
  });
};

export const useUpdateRFQLineItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: { line_items: any[] } }) => {
      const res = await api.patch<ApiResponse<RFQ>>(`/sessions/${sessionId}/rfq/line-items`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["rfq", vars.sessionId] });
    },
  });
};

export const useApproveRFQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.post<ApiResponse<RFQ>>(`/sessions/${sessionId}/rfq/approve`);
      return res.data.data;
    },
    onSuccess: (rfq) => {
      qc.invalidateQueries({ queryKey: ["rfq", rfq.session_id] });
      qc.invalidateQueries({ queryKey: ["negotiations", rfq.session_id] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onSettled: (_data, _error, sessionId) => {
      qc.invalidateQueries({ queryKey: ["rfq", sessionId] });
      qc.invalidateQueries({ queryKey: ["negotiations", sessionId] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useAIEnhanceRFQ = () =>
  useMutation({
    mutationFn: async (data: { item_name: string; description?: string; answers?: Record<string, string> }) => {
      const res = await api.post<ApiResponse>("/rfqs/ai-enhance", data);
      return res.data.data;
    },
  });

// ── Session Actions ──────────────────────────────────────────────────────

export const usePauseSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.post<ApiResponse<Session>>(`/sessions/${id}/pause`, { reason });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useResumeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<Session>>(`/sessions/${id}/resume`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useCancelSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, force }: { id: string; reason?: string; force?: boolean }) => {
      const res = await api.post<ApiResponse<Session>>(`/sessions/${id}/cancel`, { reason, force });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useCloseSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, awarded_supplier_id, reason }: { id: string; awarded_supplier_id?: string; reason?: string }) => {
      const res = await api.post<ApiResponse<Session>>(`/sessions/${id}/close`, { awarded_supplier_id, reason });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useStartNegotiating = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<Session>>(`/sessions/${id}/start-negotiating`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sessions/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useAddSuppliersToSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, supplier_ids }: { id: string; supplier_ids: string[] }) => {
      await api.post(`/sessions/${id}/suppliers`, { supplier_ids });
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["negotiations", vars.id] }),
  });
};

export const useUpdateConstraints = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: Record<string, any> }) => {
      const res = await api.patch<ApiResponse<Constraints>>(`/sessions/${sessionId}/constraints`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["constraints", vars.sessionId] }),
  });
};

export const useStartBAFO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<Session>>(`/sessions/${id}/start-bafo`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

// ── Company Profile ──────────────────────────────────────────────────────

export const useCompanyProfile = () =>
  useQuery({
    queryKey: ["company-profile"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanyProfile>>("/company-profile");
      return res.data.data;
    },
    retry: false,
  });

export const useCreateCompanyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post<ApiResponse<CompanyProfile>>("/company-profile", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-profile"] }),
  });
};

export const useUpdateCompanyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.patch<ApiResponse<CompanyProfile>>("/company-profile", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-profile"] }),
  });
};

// ── Nylas ─────────────────────────────────────────────────────────────────

export const useNylasConnect = () =>
  useMutation({
    mutationFn: async (provider: string) => {
      // Backend returns { data: { url: "..." } } — field is "url" not "auth_url"
      const res = await api.get<ApiResponse<{ url: string }>>(`/nylas/connect?provider=${provider}`);
      return res.data.data;
    },
  });

export const useNylasStatus = () =>
  useQuery<NylasGrantStatus | null>({
    queryKey: ["nylas-status"],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<NylasGrantStatus>>("/auth/user/me/nylas");
        return res.data.data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    refetchOnMount: "always",
    retry: false,
  });

export const isNylasConnected = (nylasStatus: NylasGrantStatus | null | undefined) => {
  const status = (nylasStatus?.status ?? "").toLowerCase();
  return Boolean(nylasStatus?.grant_id) && status !== "disconnected" && status !== "expired";
};

export const useNylasConnection = () => {
  const query = useNylasStatus();
  const isConnected = isNylasConnected(query.data);
  const isChecking = query.isLoading || (query.isFetching && !isConnected);

  return {
    ...query,
    isConnected,
    isChecking,
    shouldShowDisconnected: !query.isError && !isChecking && !isConnected,
  };
};

export const useNylasExchangeToken = () => {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const res = await api.post<ApiResponse<NylasGrantStatus>>("/nylas/exchange-token", { code, state });
      return res.data.data;
    },
    onSuccess: (nylasStatus) => {
      // console.log('authenticated successfully', nylasStatus)
      // console.log("[Nylas callback] ✅ token exchange succeeded");
      // router.replace("/user/settings/email?nylas_connected=true");
      qc.setQueryData(["nylas-status"], nylasStatus);
      qc.invalidateQueries({ queryKey: ["nylas-status"] });
    },
  });
};

export const useNylasDisconnect = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete<ApiResponse<NylasGrantStatus>>("/nylas/connect");
      return res.data.data;
    },
    onSuccess: (nylasStatus) => {
      qc.setQueryData(["nylas-status"], nylasStatus);
    },
  });
};

// ── User ──────────────────────────────────────────────────────────────────

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await api.get<ApiResponse>("/auth/user/me");
      return res.data.data;
    },
  });

// ── Attachment Download ───────────────────────────────────────────────────

export const downloadNegotiationAttachment = async (
  negotiationId: string,
  messageId: string,
  attachmentId: string,
  filename: string,
): Promise<void> => {
  const res = await api.get(
    `/negotiations/${negotiationId}/messages/${messageId}/attachments/${attachmentId}`,
    { responseType: "blob" },
  )
  const url = URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement("a")
  a.href = url
  a.download = filename || "attachment"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const getAttachmentPresignedUrl = async (
  negotiationId: string,
  messageId: string,
  attachmentId: string,
): Promise<{ url: string; filename: string | null; content_type: string | null }> => {
  const res = await api.get<ApiResponse<{ url: string; filename: string | null; content_type: string | null }>>(
    `/negotiations/${negotiationId}/messages/${messageId}/attachments/${attachmentId}/url`,
  )
  return res.data.data
}

// ── SSE Helper ───────────────────────────────────────────────────────────

function normalizeNegotiationEvent(raw: any): NegotiationEvent {
  return {
    ...raw,
    created_at: raw?.created_at || raw?.timestamp || new Date().toISOString(),
  };
}

export function subscribeToSessionEvents(
  sessionId: string,
  onEvent: (event: NegotiationEvent) => void,
): () => void {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const token = typeof document !== "undefined"
    ? document.cookie.split("; ").find(r => r.startsWith("access_token="))?.split("=")[1] ?? ""
    : "";
  const url = `${baseUrl}/api/v1/sessions/${sessionId}/stream?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);

  es.addEventListener("pipeline_event", (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(normalizeNegotiationEvent(data));
    } catch { }
  });

  es.onerror = () => {
    // EventSource auto-reconnects
  };

  return () => es.close();
}

export function subscribeToNegotiationEvents(
  negotiationId: string,
  onEvent: (event: NegotiationEvent) => void,
): () => void {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const token = typeof document !== "undefined"
    ? document.cookie.split("; ").find(r => r.startsWith("access_token="))?.split("=")[1] ?? ""
    : "";
  const url = `${baseUrl}/api/v1/negotiations/${negotiationId}/stream?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);

  es.addEventListener("pipeline_event", (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(normalizeNegotiationEvent(data));
    } catch { }
  });

  return () => es.close();
}
