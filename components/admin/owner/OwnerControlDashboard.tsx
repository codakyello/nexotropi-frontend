"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Eye,
  KeyRound,
  Loader2,
  Mail,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Workflow,
  XCircle,
} from "lucide-react";
import { useOwnerControlSnapshot } from "@/services/requests/adminOwner";

const statusStyle: Record<string, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
  done: "border-emerald-200 bg-emerald-50 text-emerald-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  attention: "border-amber-200 bg-amber-50 text-amber-800",
  degraded: "border-amber-200 bg-amber-50 text-amber-800",
  missing: "border-red-200 bg-red-50 text-red-800",
};

function pill(status: string) {
  return statusStyle[status] || statusStyle.neutral;
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function stateRows(rows: { status: string; count: number }[]) {
  if (!rows.length) return <p className="text-sm text-slate-500">No records yet.</p>;
  return rows.map((row) => (
    <div key={row.status} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2">
      <span className="text-sm capitalize text-slate-700">{formatStatus(row.status)}</span>
      <span className="font-mono text-sm font-semibold text-slate-950">{row.count}</span>
    </div>
  ));
}

export default function OwnerControlDashboard() {
  const { data, isLoading, isError, refetch, isFetching } = useOwnerControlSnapshot();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4f2ec]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading owner control panel...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[60vh] bg-[#f4f2ec] p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">Owner control panel failed to load.</p>
          <p className="mt-1 text-sm">Check admin permissions and backend availability.</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const attention = data.metrics.find((metric) => metric.label === "Needs Attention");

  return (
    <div className="min-h-screen bg-[#f4f2ec]">
      <section className="border-b border-black/10 bg-[#13231b] px-8 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/75">
                <ShieldCheck className="h-3.5 w-3.5" />
                Owner Command Center
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
                Product ownership, system health, and workflow control in one place.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Give the CEO a non-code view of who controls the product, whether launch dependencies are configured, and which procurement workflows need action.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </button>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#d7ff73] px-4 py-2 text-sm font-semibold text-[#13231b]">
                <Eye className="h-4 w-4" />
                View Site
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
            <span className="rounded-full border border-white/15 px-3 py-1">Environment: {data.environment}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Release: {data.release}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Updated: {formatDate(data.generated_at)}</span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-8 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${pill(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <p className="text-3xl font-semibold text-slate-950">{metric.value}</p>
              {metric.detail && <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                  <ClipboardCheck className="h-5 w-5 text-[#567a2f]" />
                  CEO Handover Checklist
                </h2>
                <p className="mt-1 text-sm text-slate-500">The practical ownership controls that matter before handover.</p>
              </div>
              {attention && (
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${pill(attention.status)}`}>
                  {attention.value} needs attention
                </span>
              )}
            </div>
            <div className="space-y-3">
              {data.ownership_checklist.map((item) => (
                <div key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    {item.status === "done" ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    ) : item.status === "missing" ? (
                      <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{item.label}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${pill(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                      {item.owner_action && <p className="mt-2 text-sm font-medium text-amber-800">Owner action: {item.owner_action}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
              <RadioTower className="h-5 w-5 text-[#567a2f]" />
              Provider Health
            </h2>
            <p className="mt-1 text-sm text-slate-500">Configuration status only. Secrets are never exposed here.</p>
            <div className="mt-5 space-y-3">
              {data.provider_statuses.map((provider) => (
                <div key={provider.name} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-950">{provider.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{provider.detail}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${pill(provider.status)}`}>
                    {provider.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <Database className="h-5 w-5 text-[#567a2f]" />
              Session States
            </h2>
            <div className="mt-4 space-y-2">{stateRows(data.session_statuses)}</div>
          </section>
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <Workflow className="h-5 w-5 text-[#567a2f]" />
              Negotiation States
            </h2>
            <div className="mt-4 space-y-2">{stateRows(data.negotiation_statuses)}</div>
          </section>
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <KeyRound className="h-5 w-5 text-[#567a2f]" />
              Control Links
            </h2>
            <div className="mt-4 grid gap-2">
              <Link href="/admin/users" className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Manage users and admins
              </Link>
              <Link href="/admin/permission" className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Roles and permissions
              </Link>
              <Link href="/admin/waitlist" className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Waitlist
              </Link>
              <Link href="/admin/settings" className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Admin settings
              </Link>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                <Activity className="h-5 w-5 text-[#567a2f]" />
                Recent Critical Workflow Events
              </h2>
              <p className="mt-1 text-sm text-slate-500">Buyer interventions, failures, late replies, and negative supplier signals.</p>
            </div>
            <Mail className="h-5 w-5 text-slate-400" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full bg-white text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_events.length ? data.recent_events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{event.title}</p>
                      {event.description && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{event.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs capitalize text-slate-700">
                        {formatStatus(event.event_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{event.session_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(event.created_at)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      No critical workflow events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
