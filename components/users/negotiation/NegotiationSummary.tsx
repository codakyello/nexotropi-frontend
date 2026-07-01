"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Play, Pause, X, Trophy, Zap, ChevronDown, ChevronUp, CheckCircle2,
    AlertCircle, TrendingUp, TrendingDown, Minus, RotateCcw, Award,
    Users, DollarSign, MessageSquare, Clock, Sparkles, Loader2,
    Settings2, Mail, Pencil, XCircle, ExternalLink, Paperclip, Trash2,
    Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { buildRfqMeta, compactRfqDescription } from '@/lib/rfqDisplay'
import { getApiError } from '@/lib/utils'
import Link from 'next/link'
import {
    useSession, useConstraints, useNegotiationsBySession, useSuppliers,
    useSessionBAFOBoard, useSessionCompetitiveIntelligence,
    useSessionAwardSummary,
    useNegotiationMessages, useNegotiationEvents,
    usePauseSession, useResumeSession, useCancelSession, useCloseSession,
    useDeleteSession, useAddSuppliersToSession,
    useStartNegotiating, useStartBAFO,
    useApproveCounteroffer, useAcceptNegotiation,
    usePauseNegotiation, useResumeNegotiation, useEndNegotiation,
    useUpdateConstraints, useNylasConnection, useRFQ, useUpdateRFQLineItems,
    subscribeToSessionEvents, downloadNegotiationAttachment,
    BAFOBoard, CompetitiveIntelligence, Constraints, Negotiation, NegotiationEvent, RFQ, Session, SessionAwardSummary, Supplier,
} from '@/services/requests/negotiation'

// ── Message display helpers ────────────────────────────────────────────────

/** Decode common HTML entities that email clients sometimes leave encoded. */
function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
}

/**
 * Split an email body into [freshPart, quotedPart].
 * Recognises Gmail/Outlook "On <date> <name> wrote:" headers,
 * Outlook "--- Original Message ---" dividers, and plain "> " quote prefixes.
 */
function splitQuotedReply(text: string): [string, string | null] {
    const decoded = decodeHtmlEntities(text)
    // Gmail / Outlook threaded-reply header: "On Tue, Apr 1, 2026 at …  wrote:"
    const gmailPattern = /\n?On\s+\w{3},?\s+\w{3}\s+\d{1,2},?\s+\d{4}[\s\S]*?wrote:/
    // Outlook divider
    const outlookPattern = /\n?---+\s*Original Message\s*---+/i
    // Plain "> " prefix at start of a line
    const plainQuotePattern = /\n>[ \t]/

    for (const pattern of [gmailPattern, outlookPattern, plainQuotePattern]) {
        const match = decoded.match(pattern)
        if (match && match.index !== undefined) {
            const fresh = decoded.slice(0, match.index).trim()
            const quoted = decoded.slice(match.index).trim()
            return [fresh || decoded, quoted]
        }
    }
    return [decoded, null]
}

// ── colour maps ────────────────────────────────────────────────────────────

const SESSION_STATUS_COLOR: Record<string, string> = {
    awaiting_rfq: 'bg-sky-100 text-sky-800 border-sky-200',
    awaiting_constraints: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-orange-100 text-orange-800 border-orange-200',
    awarded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ended: 'bg-gray-200 text-gray-700 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const PHASE_LABEL: Record<string, string> = {
    collection: 'Collecting Quotes',
    negotiating: 'AI Negotiating',
    bafo: 'Best & Final Offer',
}

const PHASE_COLOR: Record<string, string> = {
    collection: 'bg-blue-50 text-blue-700 border-blue-200',
    negotiating: 'bg-purple-50 text-purple-700 border-purple-200',
    bafo: 'bg-amber-50 text-amber-700 border-amber-200',
}

const NEG_STATUS_COLOR: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-orange-100 text-orange-700',
    awaiting_approval: 'bg-purple-100 text-purple-700',
    awaiting_clarification: 'bg-blue-100 text-blue-700',
    successful: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    timed_out: 'bg-gray-200 text-gray-500',
    ended: 'bg-gray-200 text-gray-500',
}

const LIFECYCLE_COLOR: Record<string, string> = {
    invited: 'bg-gray-100 text-gray-600 border-gray-200',
    rfq_sent: 'bg-blue-50 text-blue-700 border-blue-200',
    acknowledged: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    quote_received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    extracting_quote: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    needs_buyer_review: 'bg-amber-50 text-amber-700 border-amber-200',
    waiting_on_buyer: 'bg-purple-50 text-purple-700 border-purple-200',
    counter_sent: 'bg-sky-50 text-sky-700 border-sky-200',
    waiting_on_supplier: 'bg-slate-100 text-slate-700 border-slate-200',
    clarification_pending: 'bg-orange-50 text-orange-700 border-orange-200',
    bafo_requested: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    bafo_received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    awarded: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    timed_out: 'bg-gray-200 text-gray-600 border-gray-300',
    ghosted: 'bg-stone-100 text-stone-700 border-stone-200',
}

function relTimeShort(iso: string | null | undefined): string {
    if (!iso) return '—'
    const ms = Date.now() - new Date(iso).getTime()
    if (Number.isNaN(ms)) return '—'
    const min = Math.floor(ms / 60000)
    if (min < 1) return 'just now'
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const day = Math.floor(hr / 24)
    if (day < 30) return `${day}d ago`
    return new Date(iso).toLocaleDateString()
}

function SupplierLanesGrid({
    negotiations,
    supplierMap,
    sessionId,
}: {
    negotiations: Negotiation[]
    supplierMap: Map<string, any>
    sessionId: string
}) {
    if (!negotiations.length) return null
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Supplier Lanes
                    <span className="text-muted-foreground text-sm font-normal ml-1">{negotiations.length}</span>
                </h3>
                <span className="text-xs text-muted-foreground">At-a-glance status across all suppliers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                {negotiations.map((neg) => {
                    const supplier = supplierMap.get(neg.supplier_id)
                    const lifecycle = lifecycleMeta(neg)
                    const lastActivity = neg.last_activity_at || (neg as any).updated_at || neg.created_at
                    const currentPrice = (neg as any).current_price as number | null | undefined
                    return (
                        <Link
                            key={neg.id}
                            href={`/user/negotiation/${sessionId}/${neg.id}`}
                            className={`block rounded-lg border bg-white p-3 hover:shadow-sm transition ${
                                lifecycle.requiresAction ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {supplier?.name || `Supplier ${neg.supplier_id.slice(0, 8)}`}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{supplier?.email ?? ''}</p>
                                </div>
                                {lifecycle.requiresAction && (
                                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                                        Action
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className={`text-[11px] rounded-full border px-2 py-0.5 font-medium ${lifecycle.chip}`}>
                                    {lifecycle.label}
                                </span>
                                {neg.current_round != null && neg.current_round > 0 && (
                                    <span className="text-[11px] text-gray-500">Round {neg.current_round}</span>
                                )}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {relTimeShort(lastActivity)}
                                </span>
                                {currentPrice != null && (
                                    <span className="font-medium text-gray-700">
                                        ${Number(currentPrice).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

const BAFO_STATUS_CHIP: Record<string, string> = {
    requesting: 'bg-slate-100 text-slate-700 border-slate-200',
    awaiting_supplier: 'bg-amber-50 text-amber-700 border-amber-200',
    received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    awarded: 'bg-green-50 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
    pre_bafo: 'bg-slate-100 text-slate-700 border-slate-200',
}

function BAFOBoardPanel({
    sessionId,
    board,
    onAfterAction,
}: {
    sessionId: string
    board: BAFOBoard
    onAfterAction: () => void
}) {
    const closeSession = useCloseSession()
    const [selectedSupplier, setSelectedSupplier] = useState<string>(board.best_supplier_id || '')
    useEffect(() => {
        setSelectedSupplier(board.best_supplier_id || '')
    }, [board.best_supplier_id])

    const rankedRows = [...board.rows].sort((a, b) => {
        const av = a.total_price == null ? Number.POSITIVE_INFINITY : a.total_price
        const bv = b.total_price == null ? Number.POSITIVE_INFINITY : b.total_price
        return av - bv
    })

    const money = (n: number | null | undefined) =>
        n == null ? '—' : `${board.currency || 'USD'} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const awardSelected = async () => {
        if (!selectedSupplier) return
        try {
            await closeSession.mutateAsync({
                id: sessionId,
                awarded_supplier_id: selectedSupplier,
                reason: 'BAFO closeout',
            })
            toast.success('BAFO winner awarded and session closed')
            onAfterAction()
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to award BAFO winner'))
        }
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border">
                <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        BAFO Comparison
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {board.responses_received} of {board.requests_sent || board.supplier_count} supplier{board.supplier_count === 1 ? '' : 's'} submitted a final offer.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {board.best_total_price != null && (
                        <div className="text-right">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Best current total</p>
                            <p className="text-sm font-semibold text-foreground">{money(board.best_total_price)}</p>
                        </div>
                    )}
                    <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                        disabled={!selectedSupplier || closeSession.isPending}
                        onClick={awardSelected}
                    >
                        {closeSession.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Award className="h-3.5 w-3.5 mr-1" />}
                        Award Selected
                    </Button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {rankedRows.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No suppliers available for BAFO comparison yet.</div>
                ) : rankedRows.map((row, idx) => {
                    const delta = row.total_price != null && row.baseline_total_price != null
                        ? row.total_price - row.baseline_total_price
                        : null
                    const isBest = board.best_supplier_id === row.supplier_id
                    return (
                        <div
                            key={row.negotiation_id}
                            className={`rounded-xl border p-4 transition ${
                                selectedSupplier === row.supplier_id
                                    ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/40'
                                    : row.requires_buyer_action
                                        ? 'border-amber-200 bg-amber-50/30'
                                        : isBest
                                            ? 'border-emerald-200 bg-emerald-50/30'
                                            : 'border-gray-200 bg-white'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            className="text-left"
                                            onClick={() => setSelectedSupplier(row.supplier_id)}
                                        >
                                            <p className="text-sm font-semibold text-gray-900">{row.supplier_name || row.supplier_email || row.supplier_id}</p>
                                        </button>
                                        <span className="text-[11px] rounded-full border px-2 py-0.5 font-medium text-gray-500 border-gray-200">
                                            Rank #{idx + 1}
                                        </span>
                                        <span className={`text-[11px] rounded-full border px-2 py-0.5 font-medium ${BAFO_STATUS_CHIP[row.bafo_status] || BAFO_STATUS_CHIP.requesting}`}>
                                            {row.bafo_status.replace(/_/g, ' ')}
                                        </span>
                                        {row.requires_buyer_action && (
                                            <span className="text-[11px] rounded-full border px-2 py-0.5 font-medium bg-amber-100 text-amber-800 border-amber-200">
                                                Needs review
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {row.supplier_email || 'No email'} · Last activity {relTimeShort(row.last_activity_at)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Final quote</p>
                                        <p className="text-sm font-semibold text-gray-900">{money(row.total_price)}</p>
                                        {delta != null && (
                                            <p className={`text-xs font-medium ${delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                                {delta < 0 ? 'Improved' : delta > 0 ? 'Higher' : 'Unchanged'} vs pre-BAFO {money(Math.abs(delta))}
                                            </p>
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name="bafo-award-supplier"
                                        className="h-4 w-4"
                                        checked={selectedSupplier === row.supplier_id}
                                        onChange={() => setSelectedSupplier(row.supplier_id)}
                                    />
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                <div>
                                    <p className="text-gray-500">Baseline</p>
                                    <p className="font-medium text-gray-800">{money(row.baseline_total_price)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Delivery</p>
                                    <p className="font-medium text-gray-800">{row.delivery_days != null ? `${row.delivery_days} days` : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Payment</p>
                                    <p className="font-medium text-gray-800">{row.payment_days != null ? `${row.payment_days} days` : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Quoted items</p>
                                    <p className="font-medium text-gray-800">{row.line_items.length > 0 ? row.quoted_item_count : (row.unit_price != null ? 1 : 0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Revision</p>
                                    <p className="font-medium text-gray-800">
                                        {row.submitted_revision_number != null ? `Rev ${row.submitted_revision_number}` : '—'}
                                    </p>
                                </div>
                            </div>

                            {row.line_items.length > 0 && (
                                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Line items</p>
                                    <div className="space-y-1.5">
                                        {row.line_items.map((line) => (
                                            <div key={`${row.negotiation_id}-${line.line_number}`} className="flex items-center justify-between gap-3 text-xs">
                                                <span className="text-gray-700 truncate">
                                                    {line.line_number}. {line.item_name}
                                                </span>
                                                <span className="font-medium text-gray-900 whitespace-nowrap">
                                                    {money(line.total_price)}{line.quantity != null && line.unit_price != null ? ` (${money(line.unit_price)} x ${line.quantity})` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {row.conditions && (
                                <p className="mt-3 text-xs text-gray-600">
                                    <span className="font-medium text-gray-700">Conditions:</span> {row.conditions}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function SplitAwardSummaryPanel({ summary }: { summary: SessionAwardSummary }) {
    if (!summary.rows.length) return null
    const grouped = new Map<string, { supplierName: string; supplierEmail: string | null; rows: SessionAwardSummary['rows'] }>()
    for (const row of summary.rows) {
        const key = row.supplier_id
        const current = grouped.get(key) || {
            supplierName: row.supplier_name || row.supplier_email || row.supplier_id,
            supplierEmail: row.supplier_email,
            rows: [],
        }
        current.rows.push(row)
        grouped.set(key, current)
    }
    const money = (n: number | null | undefined) =>
        n == null ? '—' : `${summary.currency || 'USD'} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border">
                <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-600" />
                        Split Award Summary
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {summary.line_count} line items awarded across {summary.supplier_count} supplier{summary.supplier_count === 1 ? '' : 's'}.
                    </p>
                </div>
                {summary.total_value != null && (
                    <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total awarded value</p>
                        <p className="text-sm font-semibold text-foreground">{money(summary.total_value)}</p>
                    </div>
                )}
            </div>
            <div className="p-4 space-y-4">
                {Array.from(grouped.values()).map((group) => {
                    const supplierTotal = group.rows.reduce((sum, row) => sum + (row.total_price ?? 0), 0)
                    return (
                        <div key={group.supplierName} className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{group.supplierName}</p>
                                    {group.supplierEmail && <p className="text-xs text-gray-500">{group.supplierEmail}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Awarded value</p>
                                    <p className="text-sm font-semibold text-gray-900">{money(supplierTotal)}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {group.rows
                                    .slice()
                                    .sort((a, b) => a.line_number - b.line_number)
                                    .map((row) => (
                                        <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                                            <div>
                                                <p className="font-medium text-gray-800">{row.line_number}. {row.item_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Qty {row.quantity ?? '—'} · Unit {money(row.unit_price)}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{money(row.total_price)}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function lifecycleMeta(negotiation: Negotiation) {
    const state = negotiation.lifecycle_state || negotiation.status
    return {
        state,
        label: negotiation.lifecycle_label || state.replace(/_/g, ' '),
        description: negotiation.lifecycle_description || 'Supplier status will update as the workflow progresses.',
        chip: LIFECYCLE_COLOR[state] || 'bg-muted text-muted-foreground border-border',
        requiresAction: Boolean(negotiation.requires_buyer_action),
    }
}

function prettyJson(value: unknown) {
    try {
        return JSON.stringify(value, null, 2)
    } catch {
        return String(value)
    }
}

function WorkflowInspectorSection({
    title,
    subtitle,
    defaultOpen = false,
    children,
}: {
    title: string
    subtitle?: string
    defaultOpen?: boolean
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="rounded-xl border border-slate-200 bg-white">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {open && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
        </div>
    )
}

function sessionNextStep(session: Session, constraints: Constraints | undefined, bafoBoard: BAFOBoard | undefined) {
    if (session.status === 'awaiting_rfq') {
        return 'Backend is waiting for the uploaded RFQ document before it can extract supplier-facing terms and unlock the rest of setup.'
    }
    if (session.status === 'awaiting_constraints') {
        return 'Backend is waiting for commercial constraints before it can activate suppliers or send RFQ-driven automation.'
    }
    if (session.status === 'paused') {
        return `Session-level orchestration is paused. Reason: ${session.pause_reason || 'not specified'}. Supplier lanes keep their own lane state, but top-level automation should be stopped.`
    }
    if (session.negotiation_phase === 'collection') {
        return `Backend is collecting supplier quotes until the threshold (${session.min_responses_required}) or submission deadline is met, then it can transition into live negotiation.`
    }
    if (session.negotiation_phase === 'negotiating') {
        return constraints?.approval_mode === 'manual'
            ? 'Session is in live negotiation. Each supplier lane can auto-process inbound offers, but outbound counters should stop for buyer approval.'
            : 'Session is in live negotiation. Supplier lanes should run end to end automatically unless a rule violation, provider failure, or buyer-review pause occurs.'
    }
    if (session.negotiation_phase === 'bafo') {
        return `Session is in BAFO closeout. ${bafoBoard?.responses_received ?? 0} of ${bafoBoard?.supplier_count ?? 0} suppliers have submitted final offers.`
    }
    return 'Session orchestration is in a non-standard state and should be reviewed.'
}

function SessionWorkflowInspector({
    session,
    constraints,
    negotiations,
    bafoBoard,
    awardSummary,
    rfq,
}: {
    session: Session
    constraints?: Constraints
    negotiations: Negotiation[]
    bafoBoard?: BAFOBoard
    awardSummary?: SessionAwardSummary
    rfq?: RFQ
}) {
    const lifecycleCounts = negotiations.reduce<Record<string, number>>((acc, neg) => {
        const key = neg.lifecycle_state || neg.status || 'unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {})
    const buyerActionCount = negotiations.filter((neg) => neg.requires_buyer_action).length
    const tiles = [
        { label: 'Session status', value: session.status },
        { label: 'Negotiation phase', value: session.negotiation_phase },
        { label: 'Approval mode', value: constraints?.approval_mode || '—' },
        { label: 'Award basis', value: constraints?.award_basis || '—' },
        { label: 'Supplier timeout', value: constraints ? `${constraints.supplier_timeout_hours}h` : '—' },
        { label: 'Threshold', value: `${session.quote_count}/${session.min_responses_required}` },
        { label: 'Buyer action lanes', value: String(buyerActionCount) },
        { label: 'RFQ lines', value: String(rfq?.line_items?.length || 0) },
    ]

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500">Session orchestration inspector</p>
                    <p className="text-sm text-slate-700 mt-1 max-w-3xl">
                        {sessionNextStep(session, constraints, bafoBoard)}
                    </p>
                </div>
                <Badge className="border border-slate-300 bg-white text-slate-700 text-xs">
                    Backend session view
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tiles.map((tile) => (
                    <div key={tile.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">{tile.label}</p>
                        <p className="text-sm font-semibold text-slate-800 capitalize break-words">{tile.value}</p>
                    </div>
                ))}
            </div>

            <WorkflowInspectorSection
                title="Lane state distribution"
                subtitle="How the backend currently classifies supplier lanes."
                defaultOpen
            >
                <div className="flex flex-wrap gap-2">
                    {Object.entries(lifecycleCounts).length === 0 ? (
                        <p className="text-sm text-slate-500">No supplier lanes exist yet.</p>
                    ) : Object.entries(lifecycleCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([state, count]) => (
                            <span key={state} className={`rounded-full border px-3 py-1 text-xs font-medium ${LIFECYCLE_COLOR[state] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                {state.replace(/_/g, ' ')} · {count}
                            </span>
                        ))}
                </div>
            </WorkflowInspectorSection>

            <WorkflowInspectorSection
                title="Commercial rules in force"
                subtitle="These settings decide how buyer review, comparison, and closeout behave."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                        <p className="font-semibold text-slate-800 mb-2">Negotiation controls</p>
                        <div className="space-y-1.5 text-slate-600">
                            <p>Strategy: <span className="font-medium text-slate-800 capitalize">{constraints?.strategy || '—'}</span></p>
                            <p>Approval mode: <span className="font-medium text-slate-800 capitalize">{constraints?.approval_mode || '—'}</span></p>
                            <p>Max rounds: <span className="font-medium text-slate-800">{constraints?.max_rounds ?? '—'}</span></p>
                            <p>Auto-accept: <span className="font-medium text-slate-800">{constraints?.auto_accept_threshold != null ? `${constraints.currency} ${constraints.auto_accept_threshold}` : 'Off'}</span></p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                        <p className="font-semibold text-slate-800 mb-2">Commercial review policies</p>
                        <div className="space-y-1.5 text-slate-600">
                            <p>Partial quote policy: <span className="font-medium text-slate-800">{constraints?.partial_quote_policy || '—'}</span></p>
                            <p>Price violation scope: <span className="font-medium text-slate-800">{constraints?.price_violation_scope || '—'}</span></p>
                            <p>Commercial basis mode: <span className="font-medium text-slate-800">{constraints?.commercial_basis_mode || '—'}</span></p>
                            <p>Award basis: <span className="font-medium text-slate-800">{constraints?.award_basis || '—'}</span></p>
                        </div>
                    </div>
                </div>
            </WorkflowInspectorSection>

            <WorkflowInspectorSection
                title="Stored payloads"
                subtitle="Session, constraints, BAFO board, and award summary as currently returned by the backend."
            >
                <div className="space-y-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">session</p>
                        <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-3 text-[11px] text-slate-100">{prettyJson(session)}</pre>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">constraints</p>
                        <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-3 text-[11px] text-slate-100">{prettyJson(constraints)}</pre>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">bafo / award state</p>
                        <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-3 text-[11px] text-slate-100">{prettyJson({ bafoBoard, awardSummary })}</pre>
                    </div>
                </div>
            </WorkflowInspectorSection>
        </div>
    )
}

function metricLabel(metricKind: string) {
    return metricKind === 'basket_total' ? 'Basket Total' : 'Unit Price'
}

function CompetitiveIntelligencePanel({
    intelligence,
}: {
    intelligence?: CompetitiveIntelligence
}) {
    if (!intelligence || intelligence.supplier_count === 0) return null

    const label = metricLabel(intelligence.metric_kind)
    const money = (value: number | null | undefined) => value == null
        ? '—'
        : `${intelligence.currency || 'USD'} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const deltaMoney = (value: number | null | undefined) => value == null
        ? '—'
        : `${value > 0 ? '+' : ''}${intelligence.currency || 'USD'} ${Math.abs(Number(value)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500">Competitive intelligence</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Latest supplier ranking, average, spread, and target gap for this sourcing event.
                    </p>
                </div>
                <Badge className="border border-slate-300 bg-slate-50 text-slate-700 text-xs">
                    {label}
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                    { label: 'Best', value: money(intelligence.best_metric) },
                    { label: 'Average', value: money(intelligence.average_metric) },
                    { label: 'Spread', value: money(intelligence.spread) },
                    { label: 'Target', value: money(intelligence.target_metric) },
                    { label: 'Ranked suppliers', value: `${intelligence.ranked_supplier_count}/${intelligence.supplier_count}` },
                ].map((tile) => (
                    <div key={tile.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">{tile.label}</p>
                        <p className="text-sm font-semibold text-slate-800">{tile.value}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                            <th className="py-2 pr-3">Rank</th>
                            <th className="py-2 pr-3">Supplier</th>
                            <th className="py-2 pr-3">{label}</th>
                            <th className="py-2 pr-3">Delta</th>
                            <th className="py-2 pr-3">Target Gap</th>
                            <th className="py-2 pr-3">State</th>
                        </tr>
                    </thead>
                    <tbody>
                        {intelligence.rows.map((row) => (
                            <tr key={row.negotiation_id} className="border-b border-slate-100 last:border-0">
                                <td className="py-3 pr-3">
                                    <span className={`inline-flex min-w-8 justify-center rounded-full border px-2 py-0.5 text-xs font-semibold ${row.is_best ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                                        {row.rank ?? '—'}
                                    </span>
                                </td>
                                <td className="py-3 pr-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{row.supplier_name || 'Supplier'}</p>
                                        <p className="text-xs text-slate-500">{row.supplier_email || row.negotiation_status}</p>
                                    </div>
                                </td>
                                <td className="py-3 pr-3 font-medium text-slate-900">{money(row.current_metric)}</td>
                                <td className={`py-3 pr-3 ${row.metric_delta != null && row.metric_delta <= 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                                    {deltaMoney(row.metric_delta)}
                                </td>
                                <td className={`py-3 pr-3 ${row.target_gap != null && row.target_gap <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {deltaMoney(row.target_gap)}
                                </td>
                                <td className="py-3 pr-3 text-slate-600">
                                    {row.lifecycle_label || row.lifecycle_state || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const EVENT_BORDER: Record<string, string> = {
    email_received: 'border-blue-400',
    email_sent: 'border-green-400',
    agreement_reached: 'border-emerald-500',
    negotiation_accepted: 'border-emerald-500',
    negotiation_failed: 'border-red-400',
    approval_requested: 'border-purple-400',
    approval_granted: 'border-green-500',
    approval_rejected: 'border-red-400',
    round_complete: 'border-gray-300',
    intervention_required: 'border-amber-500',
    rule_check_failed: 'border-red-500',
    bafo_requested: 'border-amber-400',
    bafo_received: 'border-emerald-400',
    timed_out: 'border-red-400',
    max_rounds_reached: 'border-amber-500',
    hard_violation: 'border-red-500',
    negative_signal: 'border-red-400',
    paused: 'border-gray-400',
    resumed: 'border-blue-400',
    human_override: 'border-purple-400',
}

function upsertSessionActivityEvent(existing: NegotiationEvent[], incoming: NegotiationEvent) {
    const deduped = existing.filter((event) => event.id !== incoming.id)
    const next = [incoming, ...deduped]
    next.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return next.slice(0, 50)
}

// ── root component ─────────────────────────────────────────────────────────

const NegotiationSummary = () => {
    const params = useParams()
    const id = params?.id as string

    const { data: session, refetch: refetchSession } = useSession(id)
    const { data: bafoBoard, refetch: refetchBAFOBoard } = useSessionBAFOBoard(id)
    const { data: competitiveIntelligence, refetch: refetchCompetitiveIntelligence } = useSessionCompetitiveIntelligence(id)
    const { data: awardSummary, refetch: refetchAwardSummary } = useSessionAwardSummary(id)
    const { data: constraints, refetch: refetchConstraints } = useConstraints(id)
    const { data: negotiations, refetch: refetchNegotiations } = useNegotiationsBySession(id)
    const { data: suppliers } = useSuppliers()
    const { isChecking: isNylasChecking, isError: isNylasError, shouldShowDisconnected: shouldShowNylasDisconnected } = useNylasConnection()
    const { data: rfq } = useRFQ(id)

    const pauseSession = usePauseSession()
    const resumeSession = useResumeSession()
    const cancelSession = useCancelSession()
    const closeSession = useCloseSession()
    const deleteSession = useDeleteSession()
    const addSuppliersToSession = useAddSuppliersToSession()
    const startNegotiating = useStartNegotiating()
    const startBAFO = useStartBAFO()

    const router = useRouter()

    const [liveEvents, setLiveEvents] = useState<NegotiationEvent[]>([])
    const [showEvents, setShowEvents] = useState(true)
    const [expandedNeg, setExpandedNeg] = useState<string | null>(null)
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [awardSupplier, setAwardSupplier] = useState('')
    const [splitAwardSelections, setSplitAwardSelections] = useState<Record<string, string>>({})
    const [showStartNegotiatingModal, setShowStartNegotiatingModal] = useState(false)
    const [showStartBAFOModal, setShowStartBAFOModal] = useState(false)
    const [bafoSelections, setBAFOSelections] = useState<Set<string>>(new Set())
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showAddSuppliersModal, setShowAddSuppliersModal] = useState(false)
    const [addSupplierSelections, setAddSupplierSelections] = useState<Set<string>>(new Set())

    // Debounced refetch refs — each resource has its own timer so they don't all
    // fire together when multiple events arrive in a burst.
    const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const negotiationsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const bafoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const intelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const awardTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const scheduleRefetch = useCallback((
        timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
        fn: () => void,
        delay: number,
    ) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(fn, delay)
    }, [])

    // Event types that affect each resource — only refetch what actually changed.
    const NEGOTIATION_EVENTS = new Set([
        'email_received', 'quote_received', 'counteroffer_sent', 'agreement_reached',
        'negotiation_ended', 'timed_out', 'supplier_rejected', 'rule_check_started',
        'late_supplier_response', 'collection_threshold_met', 'bafo_requested',
    ])
    const BAFO_EVENTS = new Set([
        'bafo_requested', 'bafo_received', 'quote_received', 'agreement_reached',
        'collection_threshold_met',
    ])
    const INTEL_EVENTS = new Set([
        'quote_received', 'counteroffer_sent', 'bafo_received', 'agreement_reached',
        'collection_threshold_met',
    ])
    const AWARD_EVENTS = new Set([
        'agreement_reached', 'negotiation_ended', 'award_issued', 'bafo_received',
    ])

    useEffect(() => {
        if (!id) return
        const unsub = subscribeToSessionEvents(id, ev => {
            setLiveEvents(prev => upsertSessionActivityEvent(prev, ev))
            const type = ev.event_type as string

            // Session metadata — debounce to 2 s, fire on any event.
            scheduleRefetch(sessionTimer, refetchSession, 2000)

            // Supplier lanes — only for events that mutate negotiation state.
            if (NEGOTIATION_EVENTS.has(type))
                scheduleRefetch(negotiationsTimer, refetchNegotiations, 2000)

            // BAFO board — only for quote/agreement events.
            if (BAFO_EVENTS.has(type))
                scheduleRefetch(bafoTimer, refetchBAFOBoard, 3000)

            // Competitive intel — only when offers change.
            if (INTEL_EVENTS.has(type))
                scheduleRefetch(intelTimer, refetchCompetitiveIntelligence, 3000)

            // Award summary — only on terminal events.
            if (AWARD_EVENTS.has(type))
                scheduleRefetch(awardTimer, refetchAwardSummary, 3000)
        })
        return unsub
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    useEffect(() => {
        const splitAwardEnabled = constraints?.award_basis === 'line_item_split' && Boolean(rfq?.line_items?.length)
        if (!splitAwardEnabled || !rfq?.line_items?.length || !bafoBoard?.rows?.length) return
        setSplitAwardSelections((prev) => {
            const next = { ...prev }
            for (const line of rfq.line_items) {
                if (next[line.id]) continue
                let bestSupplierId = ''
                let bestTotal = Number.POSITIVE_INFINITY
                for (const row of bafoBoard.rows) {
                    const match = row.line_items.find((entry) => entry.line_number === line.line_number)
                    if (match?.total_price != null && match.total_price < bestTotal) {
                        bestTotal = match.total_price
                        bestSupplierId = row.supplier_id
                    }
                }
                if (bestSupplierId) next[line.id] = bestSupplierId
            }
            return next
        })
    }, [constraints?.award_basis, rfq?.line_items, bafoBoard?.rows])

    if (!session) return null

    const supplierMap = new Map(suppliers?.map((s: Supplier) => [s.id, s]) ?? [])
    const activeNegotiations = (negotiations ?? []).filter((neg: Negotiation) => neg.status === 'active')
    const isTerminal = ['awarded', 'cancelled', 'ended'].includes(session.status)
    const rfqMeta = buildRfqMeta(rfq?.description)
    const rfqDescription = compactRfqDescription(rfq?.description)
    const isMultiItemRfq = Boolean(rfq?.line_items?.length)
    const linePreview = (rfq?.line_items ?? []).slice(0, 3)
    const quotesReceived = session.quote_count ?? 0
    const minRequired = session.min_responses_required
    const collectionDeadline = rfq?.response_deadline || session.quote_deadline || session.response_deadline
    const awardBasisLabel = constraints?.award_basis === 'line_item_split'
        ? 'Split award'
        : constraints?.award_basis === 'lot_based'
            ? 'Lot based'
            : 'Single supplier'
    const isSplitAwardSession = constraints?.award_basis === 'line_item_split' && Boolean(rfq?.line_items?.length)
    const scopeTiles = [
        rfq?.response_deadline
            ? { label: 'Quote Deadline', value: new Date(rfq.response_deadline).toLocaleDateString() }
            : null,
        rfq?.deadline
            ? { label: 'Delivery Target', value: new Date(rfq.deadline).toLocaleDateString() }
            : null,
        constraints?.payment_terms_max_days != null
            ? { label: 'Payment Terms', value: `${constraints.payment_terms_max_days} days max` }
            : null,
        constraints?.currency
            ? { label: 'Currency', value: constraints.currency }
            : null,
        isMultiItemRfq
            ? { label: 'Scope', value: `${rfq?.line_items?.length ?? 0} line items` }
            : rfq?.quantity != null
                ? { label: 'Quantity', value: String(rfq.quantity) }
                : null,
        isMultiItemRfq
            ? { label: 'Award Basis', value: awardBasisLabel }
            : null,
        !isMultiItemRfq && constraints?.target_price != null
            ? { label: 'Target Price', value: fmt(constraints.target_price) }
            : null,
        !isMultiItemRfq && constraints?.max_price != null
            ? { label: 'Max Price', value: fmt(constraints.max_price) }
            : null,
        isMultiItemRfq && constraints?.total_budget_ceiling != null
            ? { label: 'Budget Ceiling', value: fmt(constraints.total_budget_ceiling) }
            : null,
    ].filter(Boolean) as { label: string; value: string }[]

    const doSessionAction = async (action: any, args: any, label: string) => {
        try {
            await action.mutateAsync(args)
            toast.success(label)
            refetchSession()
            refetchNegotiations()
        } catch (err: any) {
            toast.error(getApiError(err, `Failed: ${label}`))
        }
    }

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            {/* ── Nylas connection banner ───────────────────────────────── */}
            {shouldShowNylasDisconnected && (
                <div className="flex items-center justify-between gap-4 bg-destructive/5 border border-destructive/20 rounded-xl px-5 py-3.5">
                    <div className="flex items-center gap-3 text-destructive">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="text-sm">Your email account is not connected. Connect it to enable automated supplier communications.</span>
                    </div>
                    <Link href="/user/settings/email">
                        <Button size="sm" className="shrink-0">Connect Email</Button>
                    </Link>
                </div>
            )}
            {!isNylasChecking && isNylasError && (
                <div className="flex items-center justify-between gap-4 bg-orange-500/5 border border-orange-500/20 rounded-xl px-5 py-3.5">
                    <div className="flex items-center gap-3 text-orange-600">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="text-sm">Unable to verify email connection status. Please check your settings.</span>
                    </div>
                    <Link href="/user/settings/email">
                        <Button size="sm" variant="outline" className="shrink-0">Check Settings</Button>
                    </Link>
                </div>
            )}
            {/* ── Session header + actions ─────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                        <div className="flex flex-col gap-2 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`border text-xs font-medium shadow-none ${session.status === 'active' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground'}`}>
                                    {session.status.replace(/_/g, ' ')}
                                </Badge>
                                {session.status === 'active' && (
                                    <Badge className={`border text-xs font-medium shadow-none border-primary/30 bg-primary/5 text-primary`}>
                                        {PHASE_LABEL[session.negotiation_phase] || session.negotiation_phase}
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">{session.title}</h2>
                        </div>
                        {session.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Started {new Date(session.created_at).toLocaleDateString()}</span>
                            <span>Min responses: {session.min_responses_required}</span>
                            {session.ended_at && <span>Ended {new Date(session.ended_at).toLocaleDateString()}</span>}
                        </div>
                    </div>

                    {!isTerminal && (
                        <div className="flex flex-wrap gap-2 shrink-0">
                            {session.status === 'active' && session.negotiation_phase === 'collection' && (
                                <Button size="sm" variant="outline"
                                    onClick={() => setShowStartNegotiatingModal(true)}>
                                    <Play className="h-3 w-3 mr-1" /> Start Negotiating
                                </Button>
                            )}
                            {session.status === 'active' && session.negotiation_phase === 'negotiating' && (
                                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                                    onClick={() => {
                                        setBAFOSelections(new Set(activeNegotiations.map((neg: Negotiation) => neg.id)))
                                        setShowStartBAFOModal(true)
                                    }}>
                                    <Trophy className="h-3 w-3 mr-1" /> Start BAFO
                                </Button>
                            )}
                            {session.status === 'active' && (
                                <Button size="sm" variant="outline"
                                    onClick={() => doSessionAction(pauseSession, { id, reason: 'Manual pause' }, 'Session paused')}>
                                    <Pause className="h-3 w-3 mr-1" /> Pause
                                </Button>
                            )}
                            {session.status === 'paused' && (
                                <Button size="sm" variant="outline"
                                    onClick={() => doSessionAction(resumeSession, id, 'Session resumed')}>
                                    <Play className="h-3 w-3 mr-1" /> Resume
                                </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-orange-600 border-orange-200"
                                onClick={() => setShowCloseModal(true)}>
                                <Award className="h-3 w-3 mr-1" /> Close Session
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-200"
                                onClick={() => doSessionAction(cancelSession, { id, reason: 'Manual cancel', force: true }, 'Session cancelled')}>
                                <X className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                            {(session.status === 'awaiting_rfq' || session.status === 'awaiting_constraints') && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Close modal ──────────────────────────────────────────── */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Close Session</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {isSplitAwardSession
                                ? 'Assign one supplier per RFQ line item to complete a split award. Any supplier without awarded lines will receive a non-award closeout.'
                                : 'All active negotiations will be ended. You can optionally award a supplier.'}
                        </p>
                        {isSplitAwardSession ? (
                            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                {rfq?.line_items?.map((line: any) => (
                                    <div key={line.id} className="rounded-lg border border-gray-200 p-3">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {line.line_number}. {line.item_name}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Qty {line.quantity ?? '—'}{line.unit ? ` ${line.unit}` : ''}
                                        </p>
                                        <select
                                            value={splitAwardSelections[line.id] || ''}
                                            onChange={e => setSplitAwardSelections(prev => ({ ...prev, [line.id]: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        >
                                            <option value="">Select awarded supplier</option>
                                            {negotiations?.map((n) => {
                                                const s = supplierMap.get(n.supplier_id)
                                                const lineQuote = bafoBoard?.rows
                                                    ?.find((row) => row.supplier_id === n.supplier_id)
                                                    ?.line_items?.find((entry) => entry.line_number === line.line_number)
                                                return (
                                                    <option key={`${line.id}-${n.supplier_id}`} value={n.supplier_id}>
                                                        {s?.name || n.supplier_id.slice(0, 8)}
                                                        {lineQuote?.total_price != null ? ` — ${bafoBoard?.currency || constraints?.currency || 'USD'} ${Number(lineQuote.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <Label className="text-xs">Award Supplier (optional)</Label>
                                <select
                                    value={awardSupplier}
                                    onChange={e => setAwardSupplier(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">No award</option>
                                    {negotiations?.map(n => {
                                        const s = supplierMap.get(n.supplier_id)
                                        return (
                                            <option key={n.supplier_id} value={n.supplier_id}>
                                                {s?.name || n.supplier_id.slice(0, 8)}
                                                {n.agreed_price ? ` — $${n.agreed_price}` : ''}
                                            </option>
                                        )
                                    })}
                                </select>
                            </>
                        )}
                        {(() => {
                            const totalLines = rfq?.line_items?.length ?? 0
                            const filledLines = isSplitAwardSession
                                ? (rfq?.line_items ?? []).filter((line: any) => splitAwardSelections[line.id]).length
                                : 0
                            const splitIncomplete = isSplitAwardSession && filledLines < totalLines
                            return (
                                <>
                                    {isSplitAwardSession && (
                                        <p className={`text-xs mt-2 ${splitIncomplete ? 'text-amber-700' : 'text-emerald-700'}`}>
                                            {filledLines} of {totalLines} line items have an awarded supplier.
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            className="bg-primary flex-1"
                                            disabled={splitIncomplete}
                                            onClick={() => {
                                                const line_awards = isSplitAwardSession
                                                    ? (rfq?.line_items ?? []).map((line: any) => ({
                                                        rfq_line_item_id: line.id,
                                                        supplier_id: splitAwardSelections[line.id],
                                                    }))
                                                    : undefined
                                                doSessionAction(
                                                    closeSession,
                                                    {
                                                        id,
                                                        awarded_supplier_id: isSplitAwardSession ? undefined : awardSupplier || undefined,
                                                        line_awards,
                                                        reason: isSplitAwardSession ? 'Split-award closeout' : 'Manual close',
                                                    },
                                                    isSplitAwardSession ? 'Split award completed' : 'Session closed'
                                                )
                                                setShowCloseModal(false)
                                            }}
                                        >
                                            {isSplitAwardSession ? 'Confirm Split Award' : 'Confirm Close'}
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowCloseModal(false)}>Cancel</Button>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            )}

            {/* ── Start Negotiating confirmation modal ─────────────────── */}
            {showStartNegotiatingModal && (() => {
                const belowMin = quotesReceived < minRequired
                return (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Start Negotiating?</h3>
                            <div className="text-sm text-gray-600 space-y-2 mb-4">
                                <p>
                                    <span className="font-medium">{quotesReceived}</span> quote{quotesReceived !== 1 ? 's' : ''} received so far.
                                    Your minimum was set to <span className="font-medium">{minRequired}</span>.
                                </p>
                                {belowMin && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800 text-xs">
                                        You haven't reached your minimum yet. Starting now means the AI will negotiate with fewer suppliers, which may reduce your leverage.
                                    </div>
                                )}
                                <p className="text-gray-500 text-xs">
                                    Once started, suppliers still in the collection phase will no longer be able to submit new quotes.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="bg-primary flex-1"
                                    onClick={() => {
                                        doSessionAction(startNegotiating, id, 'Negotiating phase started')
                                        setShowStartNegotiatingModal(false)
                                    }}
                                >
                                    Yes, Start Negotiating
                                </Button>
                                <Button variant="outline" onClick={() => setShowStartNegotiatingModal(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* ── Start BAFO supplier selection modal ──────────────────── */}
            {showStartBAFOModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full border border-gray-200">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Start BAFO</h3>
                        <div className="text-sm text-gray-600 space-y-2 mb-4">
                            <p>Select the active suppliers that should receive the best-and-final-offer request.</p>
                            <p className="text-xs text-gray-500">Leaving all selected preserves the current all-active behavior.</p>
                        </div>

                        {activeNegotiations.length === 0 ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                No active supplier lanes are available for BAFO.
                            </div>
                        ) : (
                            <div className="max-h-72 overflow-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                                {activeNegotiations.map((neg: Negotiation) => {
                                    const supplier = supplierMap.get(neg.supplier_id)
                                    const checked = bafoSelections.has(neg.id)
                                    return (
                                        <label key={neg.id} className="flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-gray-50">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(value: boolean | 'indeterminate') => {
                                                    setBAFOSelections(prev => {
                                                        const next = new Set(prev)
                                                        if (value) next.add(neg.id)
                                                        else next.delete(neg.id)
                                                        return next
                                                    })
                                                }}
                                            />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium text-gray-900 truncate">
                                                    {supplier?.name || supplier?.company || 'Supplier'}
                                                </span>
                                                <span className="block text-xs text-gray-500 truncate">
                                                    {supplier?.email || 'No email available'} · round {neg.current_round}
                                                </span>
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-gray-500">
                                {bafoSelections.size} of {activeNegotiations.length} active supplier{activeNegotiations.length === 1 ? '' : 's'} selected
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowStartBAFOModal(false)}>Cancel</Button>
                                <Button
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                    disabled={activeNegotiations.length === 0 || bafoSelections.size === 0 || startBAFO.isPending}
                                    onClick={() => {
                                        doSessionAction(
                                            startBAFO,
                                            { id, negotiation_ids: Array.from(bafoSelections) },
                                            'BAFO phase started'
                                        )
                                        setShowStartBAFOModal(false)
                                    }}
                                >
                                    {startBAFO.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                                    Request BAFO
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete session confirmation modal ─────────────────────── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            Delete session permanently?
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This permanently removes <span className="font-medium">{session.title}</span> and all of its data.
                            Only sessions that have never been activated can be deleted.
                            For active sessions, use <span className="font-medium">Cancel</span> instead.
                        </p>
                        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800 mb-4">
                            This action cannot be undone.
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                disabled={deleteSession.isPending}
                                onClick={async () => {
                                    try {
                                        await deleteSession.mutateAsync(id)
                                        toast.success('Session deleted')
                                        setShowDeleteConfirm(false)
                                        router.push('/user/negotiation')
                                    } catch (err: any) {
                                        toast.error(getApiError(err, 'Failed to delete session'))
                                    }
                                }}
                            >
                                {deleteSession.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                                Delete Permanently
                            </Button>
                            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add suppliers modal ──────────────────────────────────── */}
            {showAddSuppliersModal && (() => {
                const existingSupplierIds = new Set((negotiations ?? []).map(n => n.supplier_id))
                const available = (suppliers ?? []).filter(s => !existingSupplierIds.has(s.id))
                const toggle = (sid: string) => {
                    setAddSupplierSelections(prev => {
                        const next = new Set(prev)
                        if (next.has(sid)) next.delete(sid); else next.add(sid)
                        return next
                    })
                }
                return (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full border border-gray-200">
                            <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                Add suppliers to this session
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                New suppliers start as <span className="font-medium">Pending</span>. Once the RFQ is sent, they'll receive it on the same terms as everyone else.
                            </p>
                            {available.length === 0 ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500 text-center">
                                    All your suppliers are already in this session.
                                    <div className="mt-2">
                                        <Link href="/user/ecosystem/suppliers" className="text-primary hover:underline text-xs">
                                            Add a new supplier in Ecosystem →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1 mb-4">
                                    {available.map(s => {
                                        const checked = addSupplierSelections.has(s.id)
                                        return (
                                            <label
                                                key={s.id}
                                                className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${
                                                    checked
                                                        ? 'border-primary/40 bg-primary/5'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-primary"
                                                    checked={checked}
                                                    onChange={() => toggle(s.id)}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{s.email}</p>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    className="bg-primary hover:bg-primary-hover text-white flex-1"
                                    disabled={addSuppliersToSession.isPending || addSupplierSelections.size === 0}
                                    onClick={async () => {
                                        try {
                                            await addSuppliersToSession.mutateAsync({
                                                id,
                                                supplier_ids: Array.from(addSupplierSelections),
                                            })
                                            toast.success(`Added ${addSupplierSelections.size} supplier${addSupplierSelections.size === 1 ? '' : 's'}`)
                                            setShowAddSuppliersModal(false)
                                            setAddSupplierSelections(new Set())
                                            refetchNegotiations()
                                        } catch (err: any) {
                                            toast.error(getApiError(err, 'Failed to add suppliers'))
                                        }
                                    }}
                                >
                                    {addSuppliersToSession.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                                    Add {addSupplierSelections.size > 0 ? `(${addSupplierSelections.size})` : ''}
                                </Button>
                                <Button variant="outline" onClick={() => setShowAddSuppliersModal(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* ── Constraints ──────────────────────────────────────────── */}
            {constraints && (
                <div id="constraints" className="scroll-mt-20">
                    <ConstraintsPanel sessionId={id} constraints={constraints} refetch={refetchConstraints} isTerminal={isTerminal} rfq={rfq} />
                </div>
            )}
            {!constraints && session.status === 'awaiting_constraints' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <div>
                            <p className="font-medium">No constraints set. Set constraints to activate this session.</p>
                            <p className="text-xs text-yellow-700 mt-0.5">
                                Resume the saved setup flow to confirm pricing, currency, approval mode, timeout, late-response policy, and other buyer rules.
                            </p>
                        </div>
                    </div>
                    <Link href={`/user/negotiation/new?session=${id}`} className="shrink-0">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5">
                            Resume Setup
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            )}

            <SessionWorkflowInspector
                session={session}
                constraints={constraints}
                negotiations={negotiations ?? []}
                bafoBoard={bafoBoard}
                awardSummary={awardSummary}
                rfq={rfq}
            />

            <CompetitiveIntelligencePanel intelligence={competitiveIntelligence} />

            {session.status === 'active' && session.negotiation_phase === 'collection' && (
                <CollectionStatusPanel
                    session={session}
                    negotiations={negotiations ?? []}
                    supplierMap={supplierMap}
                    deadline={collectionDeadline}
                />
            )}

            {bafoBoard && session.negotiation_phase === 'bafo' && (
                <BAFOBoardPanel
                    sessionId={id}
                    board={bafoBoard}
                    onAfterAction={() => {
                        refetchSession()
                        refetchNegotiations()
                        refetchBAFOBoard()
                        refetchCompetitiveIntelligence()
                        refetchAwardSummary()
                    }}
                />
            )}

            {awardSummary && awardSummary.rows.length > 0 && (
                <SplitAwardSummaryPanel summary={awardSummary} />
            )}

            {/* ── RFQ / Items ───────────────────────────────────────────── */}
            {rfq && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-6 py-6 border-b border-border space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    Brief Parameters
                                    <span className="text-muted-foreground font-normal">— {rfq.item_name}</span>
                                </h3>
                                <Badge variant="outline" className="text-xs border-border/50">{rfq.status.replace(/_/g, ' ')}</Badge>
                                {isMultiItemRfq && (
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs">
                                        {rfq.line_items.length} items
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {rfqDescription && (
                            <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">{rfqDescription}</p>
                        )}

                        {scopeTiles.length > 0 && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {scopeTiles.map((tile) => (
                                    <div key={tile.label} className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                                        <p className="text-xs text-muted-foreground mb-1">{tile.label}</p>
                                        <p className="text-sm font-medium text-foreground">{tile.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {rfqMeta.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {rfqMeta.map((item) => (
                                    <span
                                        key={item.label}
                                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600"
                                    >
                                        <span className="font-medium text-gray-700">{item.label}:</span>
                                        <span className="truncate max-w-[220px]">{item.value}</span>
                                    </span>
                                ))}
                            </div>
                        )}

                    </div>

                    <RFQLineItemsPanel sessionId={id} rfq={rfq} isTerminal={isTerminal} />
                </div>
            )}

            {/* ── Supplier Lane Overview — only worth showing for 3+ suppliers,
                 below that the row list immediately below is faster to scan. */}
            {(negotiations?.length ?? 0) >= 3 && (
                <SupplierLanesGrid
                    negotiations={negotiations ?? []}
                    supplierMap={supplierMap}
                    sessionId={id}
                />
            )}

            {/* ── Negotiations ─────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Suppliers
                        <span className="text-muted-foreground text-sm font-normal ml-1">{negotiations?.length ?? 0}</span>
                    </h3>
                    {!isTerminal && session.status !== 'cancelled' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setAddSupplierSelections(new Set())
                                setShowAddSuppliersModal(true)
                            }}
                        >
                            <Plus className="h-3 w-3 mr-1" /> Add Suppliers
                        </Button>
                    )}
                </div>
                {!negotiations?.length ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No negotiations yet — send an RFQ to start.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {negotiations.map(neg => (
                            <NegotiationRow
                                key={neg.id}
                                negotiation={neg}
                                supplier={supplierMap.get(neg.supplier_id)}
                                sessionId={id}
                                isExpanded={expandedNeg === neg.id}
                                onToggle={() => setExpandedNeg(expandedNeg === neg.id ? null : neg.id)}
                                refetch={refetchNegotiations}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Live events ──────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Activity Log
                        {liveEvents.length > 0 && (
                            <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                                {liveEvents.length}
                            </span>
                        )}
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setShowEvents(v => !v)}>
                        {showEvents ? 'Collapse' : 'Expand'}
                    </Button>
                </div>
                {showEvents && (
                    <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
                        {liveEvents.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4">
                                Waiting for events — SSE connected
                            </p>
                        ) : liveEvents.map((ev, i) => (
                            <div
                                key={ev.id || i}
                                className={`flex items-start gap-2 text-sm border-l-2 pl-3 py-1.5 ${EVENT_BORDER[ev.event_type] || 'border-gray-300'}`}
                            >
                                <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                                    {new Date(ev.created_at).toLocaleTimeString()}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium text-gray-800">{ev.title}</span>
                                    {ev.description && (
                                        <span className="text-gray-500 ml-1.5 text-xs">— {ev.description}</span>
                                    )}
                                    <Badge variant="outline" className="ml-2 text-[10px] py-0">
                                        {ev.event_type.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function CollectionStatusPanel({
    session,
    negotiations,
    supplierMap,
    deadline,
}: {
    session: {
        quote_count: number
        min_responses_required: number
        quote_deadline: string | null
        response_deadline: string | null
    }
    negotiations: Negotiation[]
    supplierMap: Map<string, Supplier>
    deadline: string | null
}) {
    const quotesReceived = session.quote_count ?? 0
    const minRequired = Math.max(session.min_responses_required ?? 1, 1)
    const progress = Math.min(100, Math.round((quotesReceived / minRequired) * 100))
    const deadlineLabel = deadline ? new Date(deadline).toLocaleString() : null

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        Collection Status
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Waiting for supplier quotes before AI negotiation starts.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1">
                        {quotesReceived} of {minRequired} required
                    </span>
                    {deadlineLabel && (
                        <span className="rounded-full bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1">
                            Deadline {deadlineLabel}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-5 py-4 space-y-4">
                <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>Quote collection progress</span>
                        <span>{quotesReceived >= minRequired ? 'Threshold met' : `${Math.max(minRequired - quotesReceived, 0)} more needed`}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className={`h-full transition-all ${quotesReceived >= minRequired ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {negotiations.map((negotiation) => {
                        const supplier = supplierMap.get(negotiation.supplier_id)
                        const state = lifecycleMeta(negotiation)
                        return (
                            <div key={negotiation.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {supplier?.name || `Supplier ${negotiation.supplier_id.slice(0, 8)}`}
                                        </p>
                                        {supplier?.email && (
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{supplier.email}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">{state.description}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${state.chip}`}>
                                        {state.label}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ── Constraints Panel ──────────────────────────────────────────────────────

function ConstraintsPanel({ sessionId, constraints, refetch, isTerminal, rfq }: any) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState<Record<string, any>>({})
    const updateConstraints = useUpdateConstraints()

    const startEdit = () => {
        setForm({
            max_price: constraints.max_price,
            target_price: constraints.target_price,
            min_acceptable_price: constraints.min_acceptable_price ?? '',
            quantity: constraints.quantity,
            min_quantity: constraints.min_quantity,
            max_rounds: constraints.max_rounds,
            strategy: constraints.strategy,
            approval_mode: constraints.approval_mode,
            supplier_timeout_hours: constraints.supplier_timeout_hours,
        })
        setEditing(true)
    }

    const handleSave = async () => {
        try {
            const clean = Object.fromEntries(Object.entries(form).filter(([_, v]) => v !== '' && v !== null))
            await updateConstraints.mutateAsync({ sessionId, data: clean })
            toast.success('Constraints updated')
            setEditing(false)
            refetch()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update constraints')
        }
    }

    const fmt = (val: number | null, prefix = '') => val != null ? `${prefix}${val}` : '—'
    const fmtCurrency = (val: number | null) => val != null ? `${constraints.currency} ${val}` : '—'

    const hasLineItems = rfq?.line_items?.length > 0

    const priceTiles = hasLineItems ? [] : [
        { label: 'Max Price', value: fmtCurrency(constraints.max_price), accent: true },
        { label: 'Target Price', value: fmtCurrency(constraints.target_price) },
        { label: 'Min Acceptable', value: fmtCurrency(constraints.min_acceptable_price) },
        { label: 'Total Budget', value: fmtCurrency(constraints.total_budget_ceiling) },
        { label: 'Auto-Accept', value: constraints.auto_accept_threshold != null ? fmtCurrency(constraints.auto_accept_threshold) : 'Off' },
        { label: 'Quantity', value: fmt(constraints.quantity) },
        { label: 'Min Quantity', value: fmt(constraints.min_quantity) },
    ]

    const operationalTiles = [
        { label: 'Strategy', value: constraints.strategy },
        { label: 'Approval', value: constraints.approval_mode },
        { label: 'Max Rounds', value: String(constraints.max_rounds) },
        { label: 'Price Buffer', value: `${(constraints.max_price_buffer * 100).toFixed(0)}%` },
        { label: 'Auto-accept near target', value: constraints.early_close_enabled ? `Within ${(constraints.early_close_threshold * 100).toFixed(0)}% of target` : 'Off' },
        { label: 'Timeout', value: `${constraints.supplier_timeout_hours}h` },
        { label: 'Counter Offers', value: constraints.allow_counter_offers ? 'Allowed' : 'No' },
        { label: 'Lead Time', value: constraints.delivery_lead_time_working_days != null ? `${constraints.delivery_lead_time_working_days} days` : '—' },
        { label: 'Payment Terms', value: constraints.payment_terms_max_days != null ? `${constraints.payment_terms_max_days} days` : '—' },
    ]

    const tiles = [...priceTiles, ...operationalTiles]

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-gray-400" /> Constraints
                </h3>
                {!isTerminal && !editing && (
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={startEdit}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                )}
                {editing && (
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-primary h-7 text-xs" onClick={handleSave} disabled={updateConstraints.isPending}>
                            {updateConstraints.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                )}
            </div>
            {hasLineItems && (
                <div className="px-5 pt-3 pb-0">
                    <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-3 py-1.5 inline-block">
                        Pricing set per line item — see RFQ below
                    </p>
                </div>
            )}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {tiles.map(({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
                    <div key={label} className={`p-2.5 rounded-lg ${accent ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
                        <p className={`font-bold text-sm capitalize ${accent ? 'text-primary' : 'text-gray-800'}`}>{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── RFQ Line Items Panel ───────────────────────────────────────────────────

function RFQLineItemsPanel({ sessionId, rfq, isTerminal }: { sessionId: string; rfq: any; isTerminal: boolean }) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState<Record<string, any>>({})
    const updateLineItems = useUpdateRFQLineItems()

    const startEdit = () => {
        const initialForm: Record<string, any> = {}
        rfq.line_items.forEach((item: any) => {
            initialForm[item.id] = {
                target_price_per_unit: item.target_price_per_unit ?? '',
                max_price_per_unit: item.max_price_per_unit ?? '',
            }
        })
        setForm(initialForm)
        setEditing(true)
    }

    const handleSave = async () => {
        try {
            const updates = Object.entries(form).map(([id, vals]) => {
                const clean: any = { id }
                if (vals.target_price_per_unit !== '') clean.target_price_per_unit = Number(vals.target_price_per_unit)
                if (vals.max_price_per_unit !== '') clean.max_price_per_unit = Number(vals.max_price_per_unit)
                return clean
            })
            await updateLineItems.mutateAsync({ sessionId, data: { line_items: updates } })
            toast.success('Line items updated')
            setEditing(false)
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update line items')
        }
    }

    const handleChange = (id: string, field: string, value: string) => {
        setForm(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    }

    if (!rfq.line_items || rfq.line_items.length === 0) return null;

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                <div>
                    <p className="text-xs font-semibold text-gray-700">Line Items <span className="text-gray-400 font-normal">({rfq.line_items.length})</span></p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Negotiation scope. Per-supplier comparison lives in each supplier timeline.</p>
                </div>
                {!isTerminal && !editing && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 border border-gray-200" onClick={startEdit}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit Prices
                    </Button>
                )}
                {editing && (
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-primary h-6 text-xs px-3" onClick={handleSave} disabled={updateLineItems.isPending}>
                            {updateLineItems.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-xs px-3" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-100">
                            <th className="pb-2 font-medium pr-4">#</th>
                            <th className="pb-2 font-medium pr-4">Item</th>
                            <th className="pb-2 font-medium pr-4">Description</th>
                            <th className="pb-2 font-medium pr-4">Qty</th>
                            <th className="pb-2 font-medium pr-4">Unit</th>
                            <th className="pb-2 font-medium pr-4">Target Price/Unit</th>
                            <th className="pb-2 font-medium">Max Price/Unit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rfq.line_items.map((item: any) => (
                            <tr key={item.id} className="text-gray-700">
                                <td className="py-2 pr-4 text-gray-400">{item.line_number}</td>
                                <td className="py-2 pr-4 font-medium">{item.item_name}</td>
                                <td className="py-2 pr-4 text-gray-500 max-w-[200px] truncate" title={item.description ?? undefined}>
                                    {item.description ?? '—'}
                                </td>
                                <td className="py-2 pr-4">{item.quantity ?? '—'}</td>
                                <td className="py-2 pr-4">{item.unit ?? '—'}</td>
                                <td className="py-2 pr-4">
                                    {editing ? (
                                        <div className="relative">
                                            <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                            <Input 
                                                type="number" step="0.01" className="h-7 w-24 text-xs pl-5 pr-2" 
                                                value={form[item.id]?.target_price_per_unit ?? ''} 
                                                onChange={e => handleChange(item.id, 'target_price_per_unit', e.target.value)} 
                                            />
                                        </div>
                                    ) : (item.target_price_per_unit != null ? `$${item.target_price_per_unit}` : '—')}
                                </td>
                                <td className="py-2">
                                    {editing ? (
                                        <div className="relative">
                                            <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                            <Input 
                                                type="number" step="0.01" className="h-7 w-24 text-xs pl-5 pr-2" 
                                                value={form[item.id]?.max_price_per_unit ?? ''} 
                                                onChange={e => handleChange(item.id, 'max_price_per_unit', e.target.value)} 
                                            />
                                        </div>
                                    ) : (item.max_price_per_unit != null ? `$${item.max_price_per_unit}` : '—')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ── Violation explanation helper ──────────────────────────────────────────

function fmt(n: number | null | undefined, prefix = '$') {
    if (n == null) return '—'
    return `${prefix}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function violationExplanation(events: NegotiationEvent[]): { summary: string; items: string[] } | null {
    const ev = events.find(e => e.event_type === 'rule_check_failed')
    if (!ev) return null
    const d = ev.data
    if (!d) return { summary: ev.title, items: [] }
    const reason = d.reason as string | undefined
    const detail = d.detail as Record<string, any> | undefined
    // Multi-item violations: check violated_items FIRST (backend puts prices there, not in detail.offered/max)
    if (detail?.violated_items && Array.isArray(detail.violated_items)) {
        return { summary: 'One or more line items exceeded their maximum price:', items: detail.violated_items as string[] }
    }
    if (d.violated && Array.isArray(d.violated)) {
        return { summary: 'Hard brief parameters violated:', items: d.violated as string[] }
    }
    // Single-item violations
    if (reason === 'price_exceeds_max' && detail) {
        return { summary: `Supplier quoted ${fmt(detail.offered)}/unit — your max is ${fmt(detail.max)}.`, items: [] }
    }
    if (reason === 'quantity_below_min' && detail) {
        return { summary: `Supplier offered ${detail.offered} units — your minimum is ${detail.min}.`, items: [] }
    }
    if (reason === 'payment_terms_too_long' && detail) {
        return { summary: `Supplier requires ${detail.offered} days payment — your max is ${detail.max} days.`, items: [] }
    }
    return { summary: ev.title, items: [] }
}

// ── Negotiation Row ────────────────────────────────────────────────────────

function NegotiationRow({ negotiation, supplier, sessionId, isExpanded, onToggle, refetch }: {
    negotiation: Negotiation
    supplier: Supplier | undefined
    sessionId: string
    isExpanded: boolean
    onToggle: () => void
    refetch: () => void
}) {
    const sentimentIcon = (s?: string) => {
        if (s === 'cooperative') return <TrendingDown className="h-3 w-3 text-green-500" />
        if (s === 'resistant') return <TrendingUp className="h-3 w-3 text-orange-500" />
        return null
    }

    const neg = negotiation as any
    const isHardViolation = negotiation.end_reason === 'hard_violation'
    const isAgreement = negotiation.end_reason === 'agreement'
    const lifecycle = lifecycleMeta(negotiation)

    return (
        <div className={`transition-all duration-200 ${isExpanded ? 'bg-primary/5 border-b border-primary/10' : 'hover:bg-muted/30 border-b border-border'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 cursor-pointer gap-4" onClick={onToggle}>
                <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2.5">
                        <span className="font-medium text-foreground text-sm">
                            {supplier?.name || `Supplier ${negotiation.supplier_id.slice(0, 8)}`}
                        </span>
                        <Badge variant="secondary" className={`text-xs font-medium shadow-none border border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground`}>
                            {negotiation.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline" className={`text-xs font-medium shadow-none border ${lifecycle.chip}`}>
                            {lifecycle.label}
                        </Badge>
                        {lifecycle.requiresAction && (
                            <Badge variant="outline" className="text-xs font-medium shadow-none border border-amber-300 bg-amber-50 text-amber-700">
                                Buyer action
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {supplier?.company && (
                            <span className="text-xs text-muted-foreground">{supplier.company}</span>
                        )}
                        {supplier?.email && (
                            <span className="text-xs text-muted-foreground/70">{supplier.email}</span>
                        )}
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            Round {negotiation.current_round}
                        </span>
                        {neg.ai_sentiment && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                {sentimentIcon(neg.ai_sentiment)} {neg.ai_sentiment}
                            </span>
                        )}
                        {neg.momentum_score != null && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                Momentum {(neg.momentum_score * 100).toFixed(0)}%
                            </span>
                        )}
                        {isHardViolation && (
                            <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-0.5 animate-pulse">
                                <XCircle className="h-3 w-3" /> Parameter Breach
                            </span>
                        )}
                        {lifecycle.requiresAction && negotiation.lifecycle_description && (
                            <span className="text-xs text-muted-foreground">
                                {negotiation.lifecycle_description}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isAgreement && negotiation.agreed_price && (
                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            ${negotiation.agreed_price}
                            {negotiation.savings_percent != null && (
                                <span className="text-xs text-green-500 font-normal">
                                    ({Number(negotiation.savings_percent).toFixed(1)}% saved)
                                </span>
                            )}
                        </span>
                    )}
                    <Link
                        href={`/user/negotiation/${sessionId}/${negotiation.id}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors shrink-0 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20"
                    >
                        <ExternalLink className="h-3 w-3" /> View Timeline
                    </Link>
                    <div className="p-1.5 rounded-lg border border-border bg-muted/40">
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div onClick={e => e.stopPropagation()} className="animate-in slide-in-from-top-2 duration-300">
                    <NegotiationDetail negotiation={negotiation} supplier={supplier} refetch={refetch} />
                </div>
            )}
        </div>
    )
}

// ── Negotiation Detail ─────────────────────────────────────────────────────

function NegotiationDetail({ negotiation, supplier, refetch }: {
    negotiation: Negotiation
    supplier: Supplier | undefined
    refetch: () => void
}) {
    const { data: messages } = useNegotiationMessages(negotiation.id)
    const { data: events } = useNegotiationEvents(negotiation.id)
    const approveCounter = useApproveCounteroffer()
    const acceptNeg = useAcceptNegotiation()
    const pauseNeg = usePauseNegotiation()
    const resumeNeg = useResumeNegotiation()
    const endNeg = useEndNegotiation()

    const [tab, setTab] = useState<'messages' | 'events'>('messages')
    const [overrideMsg, setOverrideMsg] = useState('')
    const [overridePrice, setOverridePrice] = useState('')
    const [overrideQty, setOverrideQty] = useState('')
    const [approvalAttachments, setApprovalAttachments] = useState<File[]>([])
    const [showAccept, setShowAccept] = useState(false)
    const [acceptPrice, setAcceptPrice] = useState('')
    const [acceptQty, setAcceptQty] = useState('')

    const do_ = async (fn: () => Promise<any>, label: string) => {
        try {
            await fn()
            toast.success(label)
            refetch()
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || `Failed: ${label}`)
        }
    }

    const buildAttachmentPayloads = async () => {
        return Promise.all(approvalAttachments.map(file => new Promise<{
            content: string
            content_type: string
            filename: string
            size: number
        }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const value = String(reader.result || '')
                resolve({
                    content: value.includes(',') ? value.split(',')[1] : value,
                    content_type: file.type || 'application/octet-stream',
                    filename: file.name,
                    size: file.size,
                })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })))
    }

    const pending = negotiation.pending_counteroffer
    const canApprove = negotiation.status === 'awaiting_approval'
    const canAccept = ['active', 'awaiting_approval'].includes(negotiation.status)
    const canPause = negotiation.status === 'active'
    const canResume = negotiation.status === 'paused'
    const canEnd = ['active', 'paused', 'awaiting_approval'].includes(negotiation.status)
    const needsIntervention = negotiation.status === 'paused' &&
        events?.some(e => e.event_type === 'intervention_required')

    const isHardViolation = negotiation.end_reason === 'hard_violation'
    const explanation = isHardViolation ? violationExplanation(events ?? []) : null
    const lastInboundId = isHardViolation
        ? [...(messages ?? [])].filter(m => m.direction === 'inbound').at(-1)?.id
        : null

    useEffect(() => {
        if (!canApprove || !pending?.message) return
        setOverrideMsg(pending.message)
    }, [canApprove, pending?.message])

    useEffect(() => {
        if (canApprove) return
        setApprovalAttachments([])
    }, [canApprove])

    return (
        <div className="px-6 pb-6 border-t border-border bg-muted/20">

            {/* ── Hard violation banner ───────────────────────────────── */}
            {isHardViolation && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-5 flex gap-4 shadow-lg">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm uppercase font-bold text-destructive tracking-widest mb-2">Offer Rejected: Constraint Breach</p>
                        {explanation ? (
                            <>
                                <p className="text-destructive/90 text-[13px] leading-relaxed">{explanation.summary}</p>
                                {explanation.items.length > 0 && (
                                    <ul className="mt-3 flex flex-wrap gap-2">
                                        {explanation.items.map((item, i) => (
                                            <li key={i} className="text-[11px] text-destructive bg-destructive/20 border border-destructive/30 rounded-sm px-2 py-1">{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <p className="text-destructive/80 text-[13px]">The supplier's offer exceeded one or more of your defined limits.</p>
                        )}
                        <p className="text-destructive/60 text-[11px] mt-4">Action required: Manual intervention or session restart.</p>
                    </div>
                </div>
            )}

            {/* ── Intervention required alert ─────────────────────────── */}
            {needsIntervention && (
                <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-800">Buyer Input Required</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            The supplier's email contains a parameter outside the negotiation brief. The AI has paused
                            and is waiting for your guidance before continuing.
                        </p>
                        {events?.filter(e => e.event_type === 'intervention_required').slice(-1).map(e => (
                            e.description && (
                                <p key={e.id} className="text-xs text-amber-900 font-medium mt-2 bg-amber-100 rounded px-2.5 py-1.5">
                                    {e.description}
                                </p>
                            )
                        ))}
                        <p className="text-xs text-amber-600 mt-2">
                            Resume the negotiation after reviewing the supplier's terms, or end it if you cannot proceed.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Pending counteroffer approval ───────────────────────── */}
            {canApprove && pending && (
                <div className="mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-5">
                    <p className="text-[11px] font-bold text-primary tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-pulse" /> AI Subroutine: Awaiting Human Authorization
                    </p>

                    {/* AI proposed values */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        {pending.counter_price != null && (
                            <div className="bg-background/40 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                                <p className="text-[10px] text-muted-foreground mb-1.5">Target Price</p>
                                <p className="text-2xl font-bold tracking-tight text-foreground">${pending.counter_price}</p>
                            </div>
                        )}
                        {pending.counter_quantity != null && (
                            <div className="bg-background/40 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                                <p className="text-[10px] text-muted-foreground mb-1.5">Target QTY</p>
                                <p className="text-2xl font-bold tracking-tight text-foreground">{pending.counter_quantity}</p>
                            </div>
                        )}
                        {pending.reasoning && (
                            <div className="bg-background/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <p className="text-[10px] text-muted-foreground mb-1.5">AI Reasoning</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-4">{pending.reasoning}</p>
                            </div>
                        )}
                    </div>

                    {/* Editable draft */}
                    {pending.message && (
                        <div className="mb-4">
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Message to Supplier</Label>
                            <Textarea
                                value={overrideMsg}
                                onChange={e => setOverrideMsg(e.target.value)}
                                rows={8}
                                className="text-[13px] bg-background/50 border-white/10 focus-visible:ring-primary/20 leading-relaxed"
                            />
                            <p className="mt-1.5 text-[10px] text-muted-foreground">
                                Edit this draft before approving. Leave it unchanged to send the AI version.
                            </p>
                        </div>
                    )}

                    {/* Override fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Override Price (optional)</Label>
                            <Input
                                type="number" step="0.01"
                                placeholder={pending.counter_price != null ? `${pending.counter_price}` : ''}
                                value={overridePrice} onChange={e => setOverridePrice(e.target.value)}
                                className="h-9 text-[13px] bg-background/50 border-white/10 focus-visible:ring-primary/20"
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Override Quantity (optional)</Label>
                            <Input
                                type="number"
                                placeholder={pending.counter_quantity != null ? `${pending.counter_quantity}` : ''}
                                value={overrideQty} onChange={e => setOverrideQty(e.target.value)}
                                className="h-9 text-[13px] bg-background/50 border-white/10 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="mb-4 rounded-xl border border-white/10 bg-background/30 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Attachments</p>
                                <p className="text-[11px] text-muted-foreground">Attach supporting files to this supplier reply.</p>
                            </div>
                            <label className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-background/50 px-3 py-2 text-[11px] font-medium text-foreground hover:bg-background cursor-pointer">
                                <Paperclip className="h-3.5 w-3.5" />
                                Add files
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={e => {
                                        const files = Array.from(e.target.files ?? [])
                                        setApprovalAttachments(prev => [...prev, ...files])
                                        e.currentTarget.value = ''
                                    }}
                                />
                            </label>
                        </div>
                        {approvalAttachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {approvalAttachments.map((file, idx) => (
                                    <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-background/40 px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-[12px] text-foreground">{file.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setApprovalAttachments(prev => prev.filter((_, i) => i !== idx))}
                                            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-[11px]"
                            disabled={approveCounter.isPending}
                            onClick={() => do_(
                                async () => approveCounter.mutateAsync({
                                    id: negotiation.id,
                                    data: {
                                        approved: true,
                                        override_message: overrideMsg && overrideMsg !== pending.message ? overrideMsg : undefined,
                                        override_price: overridePrice ? parseFloat(overridePrice) : undefined,
                                        override_quantity: overrideQty ? parseInt(overrideQty) : undefined,
                                        attachments: approvalAttachments.length ? await buildAttachmentPayloads() : undefined,
                                    },
                                }),
                                'Authorization Confirmed'
                            )}
                        >
                            {approveCounter.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-2" />}
                            Authorize Execution
                        </Button>
                        <Button
                            size="sm" variant="outline" className="font-mono text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            disabled={approveCounter.isPending}
                            onClick={() => do_(
                                () => approveCounter.mutateAsync({ id: negotiation.id, data: { approved: false } }),
                                'Authorization Denied'
                            )}
                        >
                            Deny
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Manual accept / Quick Actions ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
                {canAccept && !showAccept && (
                    <Button size="sm" variant="outline"
                        className="font-mono text-[11px] text-green-500 border-green-500/20 hover:bg-green-500/10 hover:text-green-400 gap-2"
                        onClick={() => setShowAccept(true)}>
                        <Award className="h-3 w-3" /> Force Contract
                    </Button>
                )}
                {canPause && (
                    <Button size="sm" variant="outline" className="font-mono text-[11px] text-primary border-primary/30 hover:bg-primary/10 hover:text-primary gap-2"
                        onClick={() => do_(() => pauseNeg.mutateAsync({ id: negotiation.id }), 'Routine Paused')}>
                        <Pause className="h-3 w-3" /> Halt
                    </Button>
                )}
                {canResume && (
                    <Button size="sm" variant="outline" className="font-mono text-[11px] text-primary border-primary/30 hover:bg-primary/10 hover:text-primary gap-2"
                        onClick={() => do_(() => resumeNeg.mutateAsync(negotiation.id), 'Routine Resumed')}>
                        <RotateCcw className="h-3 w-3" /> Resume
                    </Button>
                )}
                {canEnd && (
                    <Button size="sm" variant="outline" className="font-mono text-[11px] text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2"
                        onClick={() => do_(() => endNeg.mutateAsync(negotiation.id), 'Negotiation ended')}>
                        <X className="h-3 w-3" /> Terminate
                    </Button>
                )}
            </div>

            {canAccept && showAccept && (
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-green-500 tracking-widest uppercase mb-3">Force Accept</p>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Final Price</Label>
                            <Input type="number" step="0.01" value={acceptPrice} onChange={e => setAcceptPrice(e.target.value)} className="h-9 w-32 text-[13px] bg-background/50 border-white/10" placeholder="0.00" />
                        </div>
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Final QTY</Label>
                            <Input type="number" value={acceptQty} onChange={e => setAcceptQty(e.target.value)} className="h-9 w-28 text-[13px] bg-background/50 border-white/10" placeholder="0" />
                        </div>
                        <div className="flex gap-2 ml-auto sm:ml-0">
                            <Button
                                size="sm" className="bg-green-600 hover:bg-green-700 text-white text-[11px] h-9"
                                disabled={!acceptPrice || !acceptQty || acceptNeg.isPending}
                                onClick={() => do_(
                                    () => acceptNeg.mutateAsync({ id: negotiation.id, data: { agreed_price: parseFloat(acceptPrice), agreed_quantity: parseInt(acceptQty) } }),
                                    'Contract Confirmed'
                                )}>
                                {acceptNeg.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : 'Execute'}
                            </Button>
                            <Button size="sm" variant="ghost" className="font-mono text-[11px] h-9 border border-transparent hover:border-white/10" onClick={() => setShowAccept(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tabs ────────────────────────────────────────────────── */}
            <div className="flex gap-2 mt-6 mb-4">
                {(['messages', 'events'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex items-center gap-2 text-[11px] uppercase px-4 py-2 rounded-lg transition-all duration-300
                            ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}>
                        {t === 'messages' ? <MessageSquare className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                        {t === 'messages' ? `Communications (${messages?.length ?? 0})` : `Event Log (${events?.length ?? 0})`}
                    </button>
                ))}
            </div>

            {/* ── Messages ────────────────────────────────────────────── */}
            {tab === 'messages' && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {!messages?.length ? (
                        <p className="text-muted-foreground text-[11px] text-center py-8 opacity-50">No communication records found</p>
                    ) : messages.map(msg => {
                        const isIn = msg.direction === 'inbound'
                        const isViolatingMsg = !!lastInboundId && msg.id === lastInboundId
                        return (
                            <div key={msg.id}
                                className={`rounded-2xl p-5 text-sm backdrop-blur-xl border shadow-sm transition-all duration-300 ${
                                    isViolatingMsg
                                        ? 'bg-destructive/10 border-destructive/30'
                                        : isIn ? 'bg-background/40 border-border ' : 'bg-primary/5 border-primary/20 '
                                }`}>
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className={`font-mono text-[11px] font-bold px-2 py-1 rounded-sm ${isIn ? 'bg-muted/60 text-foreground border border-border' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                                        {isIn ? (supplier?.name || 'Supplier') : `AI Engine · SEQ ${msg.round_number}`}
                                    </span>
                                    <span className="text-muted-foreground text-[10px] tracking-wider">T-{new Date(msg.created_at).toLocaleString()}</span>
                                    {msg.extracted_offer?.price != null && (
                                        <Badge variant="outline" className="text-[10px] uppercase py-0.5 border-green-500/30 text-green-500 bg-green-500/10">
                                            <DollarSign className="h-3 w-3 mr-1 inline" />{msg.extracted_offer.price}
                                        </Badge>
                                    )}
                                    {msg.extracted_offer?.quantity != null && (
                                        <Badge variant="outline" className="text-[10px] uppercase py-0.5 border-blue-500/30 text-blue-500 bg-blue-500/10">
                                            QTY {msg.extracted_offer.quantity}
                                        </Badge>
                                    )}
                                    {msg.was_human_overridden && (
                                        <Badge variant="outline" className="text-[10px] uppercase py-0.5 border-orange-500/30 text-orange-500 bg-orange-500/10">
                                            MANUAL OVERRIDE
                                        </Badge>
                                    )}
                                    {msg.subject && (
                                        <span className="text-muted-foreground/80 text-[13px] italic truncate max-w-[200px] ml-auto">{msg.subject}</span>
                                    )}
                                </div>
                                {(() => {
                                    const [fresh, quoted] = splitQuotedReply(msg.message || '')
                                    return (
                                        <div className="space-y-4">
                                            <p className="text-foreground/90 text-[13px] whitespace-pre-wrap leading-[1.8] font-light">{fresh}</p>
                                            {quoted && (
                                                <details className="mt-2 group">
                                                    <summary className="text-[10px] uppercase text-muted-foreground cursor-pointer hover:text-foreground select-none transition-colors">
                                                        [ EXPAND THREAD ]
                                                    </summary>
                                                    <p className="mt-3 text-muted-foreground/70 text-[12px] whitespace-pre-wrap leading-[1.6] border-l border-white/10 pl-4 py-1">
                                                        {quoted}
                                                    </p>
                                                </details>
                                            )}
                                        </div>
                                    )
                                })()}
                                {msg.ai_summary && (
                                    <div className="mt-4 pt-3 border-t border-border">
                                        <p className="text-purple-400 text-[11px] tracking-wide flex items-start gap-2">
                                            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />{msg.ai_summary}
                                        </p>
                                    </div>
                                )}
                                {msg.extracted_offer && Object.keys(msg.extracted_offer).length > 0 && (
                                    <details className="mt-3 group">
                                        <summary className="text-[10px] uppercase text-muted-foreground cursor-pointer hover:text-foreground select-none transition-colors border-t border-border pt-3">
                                            [ VIEW EXTRACTED TELEMETRY ]
                                        </summary>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {Object.entries(msg.extracted_offer).map(([k, v]) => v != null ? (
                                                <span key={k} className="text-[10px] bg-muted border border-white/10 rounded-sm px-2.5 py-1">
                                                    <span className="text-muted-foreground">{k}:</span>{' '}
                                                    <span className="text-foreground font-bold">{String(v)}</span>
                                                </span>
                                            ) : null)}
                                        </div>
                                    </details>
                                )}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 pt-3 flex flex-wrap gap-2 border-t border-border">
                                        {msg.attachments.map((a: any) => (
                                            <button
                                                key={a.id}
                                                onClick={() => downloadNegotiationAttachment(
                                                    negotiation.id, msg.id, a.id, a.filename || 'attachment'
                                                )}
                                                className="text-[10px] bg-muted border border-white/10 rounded-sm px-3 py-1.5 text-primary hover:bg-muted/60 hover:border-white/20 transition-all cursor-pointer flex items-center gap-2"
                                            >
                                                <span className="opacity-70">ATTACH:</span> {a.filename || 'attachment'}{a.size ? ` (${(a.size / 1024).toFixed(0)}KB)` : ''}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                     })}
                </div>
            )}

            {/* ── Events ──────────────────────────────────────────────── */}
            {tab === 'events' && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {!events?.length ? (
                        <p className="text-muted-foreground text-[11px] text-center py-8 opacity-50">No event telemetry</p>
                    ) : events.map(ev => (
                        <div key={ev.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border bg-background/50 backdrop-blur-md shadow-sm transition-all hover:bg-background/80 ${EVENT_BORDER[ev.event_type] ? EVENT_BORDER[ev.event_type].replace('border-', 'border-l-4 border-y-white/5 border-r-white/5 border-l-') : 'border-l-4 border-l-muted border-y-white/5 border-r-white/5'}`}>
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-70" />
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-mono text-[13px] tracking-wide text-foreground font-bold uppercase">{ev.title}</span>
                                    <span className="text-muted-foreground text-[10px] tracking-wider">[ T-{new Date(ev.created_at).toLocaleString()} ]</span>
                                    {ev.round_number && (
                                        <span className="ml-auto text-muted-foreground text-[10px] tracking-widest uppercase bg-muted px-2 py-0.5 rounded-sm border border-border">Round {ev.round_number}</span>
                                    )}
                                </div>
                                
                                {ev.description && <p className="text-muted-foreground/90 text-xs leading-relaxed">{ev.description}</p>}
                                
                                {ev.data && Object.keys(ev.data).length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border">
                                        {ev.data.detail && typeof ev.data.detail === 'object' && Object.entries(ev.data.detail).map(([k, v]) => v != null ? (
                                            <span key={k} className="bg-muted border border-white/10 text-muted-foreground rounded-sm px-2 py-1 text-[10px]">
                                                {k}: <strong className="text-foreground">{typeof v === 'number' ? `$${v}` : String(v)}</strong>
                                            </span>
                                        ) : null)}
                                        {ev.data.violated_items && (ev.data.violated_items as string[]).map((item, i) => (
                                            <span key={i} className="bg-destructive/10 border border-destructive/20 text-destructive rounded-sm px-2 py-1 text-[10px]">
                                                {item}
                                            </span>
                                        ))}
                                        {ev.data.proposed_price != null && (
                                            <span className="bg-primary/10 border border-primary/20 text-primary rounded-sm px-2 py-1 text-[10px]">
                                                PROPOSED: <strong>${ev.data.proposed_price}</strong>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default NegotiationSummary
