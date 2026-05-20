import { useQuery } from "@tanstack/react-query";
import { api } from "../axiosInstance";

export interface OwnerMetric {
  label: string;
  value: number | string;
  detail?: string | null;
  status: "ok" | "attention" | "neutral" | string;
}

export interface OwnerStatusCount {
  status: string;
  count: number;
}

export interface OwnerProviderStatus {
  name: string;
  status: "ok" | "degraded" | "missing" | string;
  detail: string;
  configured: boolean;
}

export interface OwnerChecklistItem {
  key: string;
  label: string;
  status: "done" | "attention" | "missing" | string;
  detail: string;
  owner_action?: string | null;
}

export interface OwnerRecentEvent {
  id: string;
  event_type: string;
  title: string;
  description?: string | null;
  session_id: string;
  negotiation_id?: string | null;
  created_at: string;
  data?: Record<string, any> | null;
}

export interface OwnerControlSnapshot {
  generated_at: string;
  environment: string;
  release: string;
  metrics: OwnerMetric[];
  session_statuses: OwnerStatusCount[];
  negotiation_statuses: OwnerStatusCount[];
  provider_statuses: OwnerProviderStatus[];
  ownership_checklist: OwnerChecklistItem[];
  recent_events: OwnerRecentEvent[];
}

export const useOwnerControlSnapshot = () =>
  useQuery({
    queryKey: ["admin-owner-control-snapshot"],
    queryFn: async (): Promise<OwnerControlSnapshot> => {
      const response = await api.get<{ data: OwnerControlSnapshot }>("/admin/owner-control/snapshot");
      return response.data.data;
    },
    retry: 1,
    refetchInterval: 60_000,
  });
