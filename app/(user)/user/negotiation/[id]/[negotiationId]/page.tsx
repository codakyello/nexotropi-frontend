"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import {
    ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle,
    AlertTriangle, Clock, Paperclip, Sparkles, DollarSign,
    Package, Truck, CreditCard, FileText, Zap, User, Bot,
    AlertCircle, Trophy, Ban, RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    useNegotiation, useNegotiationMessages, useNegotiationEvents,
    useConstraints, useSession, useSuppliers, useRFQ, useRFQDownloadUrl,
    useApproveCounteroffer, useAcceptNegotiation,
    useEndNegotiation, useResumeNegotiation, useOverrideNegotiation,
    usePendingClarification, useResolveClarification, useNegotiationsBySession,
    useNegotiationQuoteRevisions,
    useNegotiationEscalation, useResolveNegotiationEscalation,
    subscribeToNegotiationEvents,
    downloadNegotiationAttachment, getAttachmentPresignedUrl,
    Negotiation, NegotiationMessage, NegotiationEvent, Supplier, ClarificationRequest, NegotiationEscalation, SupplierQuoteRevision,
} from '@/services/requests/negotiation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Download } from 'lucide-react'
import { buildRfqMeta, compactRfqDescription } from '@/lib/rfqDisplay'
import { getApiError } from '@/lib/utils'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, prefix = '$') {
    if (n == null) return '—'
    return `${prefix}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function relTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

function hasRenderableOffer(offer: Record<string, any> | null | undefined) {
    if (!offer || typeof offer !== 'object') return false
    if (offer.type && offer.type !== 'quote') return false

    const lineItems = Array.isArray(offer.line_items) ? offer.line_items : []
    if (lineItems.length > 0) {
        return lineItems.some((item) =>
            item && (
                item.unit_price != null ||
                item.price_per_unit != null ||
                item.quantity != null ||
                item.item_name
            )
        )
    }

    return ['unit_price', 'quantity', 'delivery_days', 'payment_days', 'conditions'].some(
        (key) => offer[key] != null
    )
}

function toNum(value: any) {
    if (value == null || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
}

function comparisonStatus(quoted: number | null, target: number | null, max: number | null): 'ok' | 'warn' | 'violation' | 'missing' {
    if (quoted == null) return 'missing'
    if (max != null && quoted > max) return 'violation'
    if (target != null && quoted > target) return 'warn'
    return 'ok'
}

function priceCls(status: string) {
    return status === 'violation' ? 'text-red-600 font-bold'
        : status === 'warn' ? 'text-amber-600 font-semibold'
        : status === 'ok' ? 'text-emerald-700 font-semibold'
        : 'text-gray-400'
}

function statusIcon(status: string) {
    if (status === 'ok') return <span className="text-emerald-500 font-bold">✓</span>
    if (status === 'warn') return <span className="text-amber-500 font-bold">↑</span>
    if (status === 'violation') return <span className="text-red-500 font-bold">✕</span>
    return <span className="text-gray-300">—</span>
}

function deltaInfo(current: number | null, previous: number | null) {
    if (current == null || previous == null || previous === 0 || current === previous) return null
    const pct = ((current - previous) / previous) * 100
    return {
        pct,
        label: `${pct < 0 ? '↓' : '↑'}${Math.abs(pct).toFixed(0)}%`,
        cls: pct < 0 ? 'text-emerald-600' : 'text-amber-600',
    }
}

function termTone(current: number | null, limit: number | null, mode: 'hard' | 'soft') {
    if (current == null || limit == null) return 'bg-gray-100 text-gray-600 border-gray-200'
    if (current <= limit) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    return mode === 'hard'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
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

// ─── round grouping ─────────────────────────────────────────────────────────

interface RoundGroup {
    round: number
    messages: NegotiationMessage[]
    events: NegotiationEvent[]
}

function groupByRound(
    messages: NegotiationMessage[],
    events: NegotiationEvent[],
): RoundGroup[] {
    const rounds = new Map<number, RoundGroup>()

    for (const m of messages) {
        const r = m.round_number
        if (!rounds.has(r)) rounds.set(r, { round: r, messages: [], events: [] })
        rounds.get(r)!.messages.push(m)
    }

    for (const e of events) {
        const r = e.round_number ?? 0
        if (!rounds.has(r)) rounds.set(r, { round: r, messages: [], events: [] })
        rounds.get(r)!.events.push(e)
    }

    return Array.from(rounds.values()).sort((a, b) => a.round - b.round)
}

// ─── outcome banner ──────────────────────────────────────────────────────────

function OutcomeBanner({ negotiation, events }: { negotiation: Negotiation; events: NegotiationEvent[] }) {
    const reason = negotiation.end_reason
    if (!reason) return null

    if (reason === 'hard_violation') {
        const explanation = violationExplanation(events)
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-semibold text-red-800 text-sm">Negotiation rejected — hard constraint violated</p>
                    {explanation && (
                        <>
                            <p className="text-red-700 text-sm mt-0.5">{explanation.summary}</p>
                            {explanation.items.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {explanation.items.map((item, i) => (
                                        <li key={i} className="text-xs text-red-700 bg-red-100 rounded px-2.5 py-1.5 font-mono">{item}</li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                    <p className="text-red-500 text-xs mt-2">The offer was automatically rejected because it exceeded your defined limits. You may contact the supplier directly or restart a new negotiation.</p>
                </div>
            </div>
        )
    }
    if (reason === 'agreement') {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
                <Trophy className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-emerald-800 text-sm">Agreement reached!</p>
                    <p className="text-emerald-700 text-sm mt-0.5">
                        Agreed price: <strong>{fmt(negotiation.agreed_price)}</strong>
                        {negotiation.agreed_quantity ? ` · Qty: ${negotiation.agreed_quantity}` : ''}
                        {negotiation.savings_percent != null ? ` · Saved ${Number(negotiation.savings_percent).toFixed(1)}%` : ''}
                    </p>
                </div>
            </div>
        )
    }
    if (reason === 'max_rounds') {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-amber-800 text-sm">Maximum rounds reached</p>
                    <p className="text-amber-700 text-sm mt-0.5">All negotiation rounds were used without reaching agreement. You can close the session or restart a new negotiation.</p>
                </div>
            </div>
        )
    }
    if (reason === 'supplier_timeout') {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex gap-3">
                <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-gray-700 text-sm">Supplier did not respond</p>
                    <p className="text-gray-500 text-sm mt-0.5">The supplier missed their response deadline. The negotiation was closed automatically.</p>
                </div>
            </div>
        )
    }
    if (reason === 'supplier_rejected') {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 flex gap-3">
                <Ban className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-red-700 text-sm">Supplier declined</p>
                    <p className="text-red-600 text-sm mt-0.5">The supplier indicated they cannot fulfil this request.</p>
                </div>
            </div>
        )
    }
    if (reason === 'manual_end') {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex gap-3">
                <XCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-gray-700 text-sm">Negotiation ended manually</p>
                </div>
            </div>
        )
    }
    return null
}

// ─── pipeline event pill ─────────────────────────────────────────────────────

const EVENT_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    email_received: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <FileText className="h-3 w-3" /> },
    email_sent: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: <FileText className="h-3 w-3" /> },
    extraction_started: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: <Sparkles className="h-3 w-3" /> },
    extraction_complete: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: <Sparkles className="h-3 w-3" /> },
    rule_check_started: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: <Zap className="h-3 w-3" /> },
    rule_check_passed: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    rule_check_failed: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <XCircle className="h-3 w-3" /> },
    strategy_started: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: <Sparkles className="h-3 w-3" /> },
    strategy_complete: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: <Sparkles className="h-3 w-3" /> },
    agreement_reached: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <Trophy className="h-3 w-3" /> },
    negotiation_failed: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <XCircle className="h-3 w-3" /> },
    approval_requested: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: <AlertCircle className="h-3 w-3" /> },
    intervention_required: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <AlertTriangle className="h-3 w-3" /> },
    clarification_needed: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <AlertTriangle className="h-3 w-3" /> },
    clarification_resolved: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
    late_supplier_response: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <Clock className="h-3 w-3" /> },
    quote_received: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <FileText className="h-3 w-3" /> },
    safety_check_started: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', icon: <Zap className="h-3 w-3" /> },
}

function eventViolationDetail(ev: NegotiationEvent): string | null {
    const d = ev.data
    if (!d) return null
    const reason = d.reason as string | undefined
    const detail = d.detail as Record<string, any> | undefined
    // Multi-item first
    if (detail?.violated_items && Array.isArray(detail.violated_items)) return (detail.violated_items as string[]).join(' · ')
    if (d.violated && Array.isArray(d.violated)) return (d.violated as string[]).join(' · ')
    if (reason === 'price_exceeds_max' && detail) return `Quoted ${fmt(detail.offered)} — max ${fmt(detail.max)}`
    if (reason === 'quantity_below_min' && detail) return `Offered ${detail.offered} units — min ${detail.min}`
    if (reason === 'payment_terms_too_long' && detail) return `${detail.offered} days — max ${detail.max}`
    if (d.proposed_price) return `Proposed ${fmt(d.proposed_price)}`
    if (d.line_items) return `${(d.line_items as any[]).length} items priced`
    return null
}

function PipelineEvent({ ev }: { ev: NegotiationEvent }) {
    const style = EVENT_STYLE[ev.event_type] ?? { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', icon: <Zap className="h-3 w-3" /> }
    const detail = eventViolationDetail(ev)
    const [open, setOpen] = useState(false)
    const hasData = ev.data && Object.keys(ev.data).length > 0

    return (
        <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${style.bg}`}>
            <span className={`mt-0.5 shrink-0 ${style.text}`}>{style.icon}</span>
            <div className="flex-1 min-w-0">
                <span className={`font-medium ${style.text}`}>{ev.title}</span>
                {detail && <span className={`ml-1.5 opacity-80 ${style.text}`}>— {detail}</span>}
                {ev.description && <span className="ml-1.5 text-gray-500">— {ev.description}</span>}
                {hasData && (
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="ml-2 text-gray-400 hover:text-gray-600 inline-flex items-center gap-0.5"
                    >
                        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                )}
                {open && ev.data && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(ev.data).map(([k, v]) => v != null ? (
                            <span key={k} className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-600">
                                <span className="text-gray-400">{k}: </span>
                                <span className="font-medium">
                                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </span>
                            </span>
                        ) : null)}
                    </div>
                )}
            </div>
            <span className="text-gray-400 shrink-0 whitespace-nowrap">{relTime(ev.created_at)}</span>
        </div>
    )
}

// ─── extracted offer card ─────────────────────────────────────────────────────

function ExtractedOfferCard({ offer, isViolation }: { offer: Record<string, any>; isViolation: boolean }) {
    const lineItems: any[] | null = Array.isArray(offer.line_items) && offer.line_items.length > 0 ? offer.line_items : null

    const accent = isViolation ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'
    const textColor = isViolation ? 'text-red-700' : 'text-purple-700'
    const headingColor = isViolation ? 'text-red-600' : 'text-purple-600'

    if (lineItems) {
        // Multi-item offer — render a compact table
        return (
            <div className={`mt-2 rounded-lg border px-3 py-2.5 ${accent}`}>
                <p className={`text-[10px] uppercase tracking-wide font-semibold mb-2 flex items-center gap-1 ${headingColor}`}>
                    <Sparkles className="h-3 w-3" /> AI-extracted offer — {lineItems.length} line items
                </p>
                {/* Top-level fields (delivery, payment, etc.) */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {offer.delivery_days != null && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${textColor}`}>
                            <Truck className="h-3.5 w-3.5" />
                            <span className="text-gray-400 font-normal">Delivery:</span> {offer.delivery_days} days
                        </span>
                    )}
                    {offer.payment_days != null && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${textColor}`}>
                            <CreditCard className="h-3.5 w-3.5" />
                            <span className="text-gray-400 font-normal">Payment:</span> {offer.payment_days} days
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className={`border-b ${isViolation ? 'border-red-200' : 'border-purple-200'} text-left`}>
                                <th className={`pb-1 font-medium pr-3 ${isViolation ? 'text-red-500' : 'text-purple-500'}`}>Item</th>
                                <th className={`pb-1 font-medium pr-3 ${isViolation ? 'text-red-500' : 'text-purple-500'}`}>Qty</th>
                                <th className={`pb-1 font-medium pr-3 ${isViolation ? 'text-red-500' : 'text-purple-500'}`}>Unit Price</th>
                                <th className={`pb-1 font-medium ${isViolation ? 'text-red-500' : 'text-purple-500'}`}>Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {lineItems.map((li: any, i: number) => {
                                const qty = li.quantity ?? li.qty
                                const price = li.unit_price ?? li.price_per_unit ?? li.price
                                const total = qty != null && price != null ? qty * price : null
                                return (
                                    <tr key={i}>
                                        <td className={`py-1 pr-3 font-medium ${textColor}`}>{li.item_name ?? li.name ?? `Item ${i + 1}`}</td>
                                        <td className={`py-1 pr-3 ${textColor}`}>{qty ?? '—'}</td>
                                        <td className={`py-1 pr-3 ${textColor}`}>{price != null ? fmt(price) : '—'}</td>
                                        <td className={`py-1 ${textColor}`}>{total != null ? fmt(total) : '—'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    // Single-item offer — flat key/value pills
    const fields = [
        { key: 'unit_price', label: 'Price/unit', icon: <DollarSign className="h-3.5 w-3.5" />, fmt: (v: any) => fmt(Number(v)) },
        { key: 'quantity', label: 'Qty', icon: <Package className="h-3.5 w-3.5" />, fmt: (v: any) => String(v) },
        { key: 'delivery_days', label: 'Delivery', icon: <Truck className="h-3.5 w-3.5" />, fmt: (v: any) => `${v} days` },
        { key: 'payment_days', label: 'Payment', icon: <CreditCard className="h-3.5 w-3.5" />, fmt: (v: any) => `${v} days` },
        { key: 'conditions', label: 'Conditions', icon: <FileText className="h-3.5 w-3.5" />, fmt: (v: any) => String(v) },
    ]
    const shown = new Set(fields.map(f => f.key))
    const extra = Object.entries(offer).filter(([k]) => !shown.has(k) && k !== 'line_items' && offer[k] != null)

    return (
        <div className={`mt-2 rounded-lg border px-3 py-2.5 ${accent}`}>
            <p className={`text-[10px] uppercase tracking-wide font-semibold mb-2 flex items-center gap-1 ${headingColor}`}>
                <Sparkles className="h-3 w-3" /> AI-extracted offer terms
            </p>
            <div className="flex flex-wrap gap-2">
                {fields.map(f => offer[f.key] != null ? (
                    <div key={f.key} className={`flex items-center gap-1 text-xs font-medium ${textColor}`}>
                        {f.icon} <span className="text-gray-400 font-normal">{f.label}:</span> {f.fmt(offer[f.key])}
                    </div>
                ) : null)}
                {extra.map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1 text-xs text-gray-600">
                        <span className="text-gray-400">{k}:</span> {String(v)}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── RFQ vs quote comparison ──────────────────────────────────────────────────

function RFQvsQuoteCard({ offer, rfq, isViolation, constraints, revision, previousRevision }: {
    offer: Record<string, any> | null
    rfq: any
    isViolation: boolean
    constraints?: any
    revision?: SupplierQuoteRevision | null
    previousRevision?: SupplierQuoteRevision | null
}) {
    const rfqItems: any[] = rfq?.line_items ?? []
    const effectiveOffer = revision?.effective_offer ?? offer ?? {}
    const offerItems: any[] = Array.isArray(effectiveOffer.line_items) ? effectiveOffer.line_items : []
    const revisionLines = revision?.lines ?? []
    const previousLines = previousRevision?.lines ?? []
    const previousByLineId = new Map(previousLines.map((line) => [String(line.rfq_line_item_id), line]))

    const rows = rfqItems.length > 0
        ? rfqItems.map((ri: any, idx: number) => {
            const revisionLine = revisionLines.find((line) => String(line.rfq_line_item_id) === String(ri.id))
            const previousLine = previousByLineId.get(String(ri.id))
            const fallbackOffer = offerItems.find((oi: any) =>
                (oi.item_name ?? '').toLowerCase() === (ri.item_name ?? '').toLowerCase()
            ) ?? offerItems[idx]

            const targetPrice = toNum(ri.target_price_per_unit)
            const maxPrice = toNum(ri.max_price_per_unit)
            const quotedPrice = revisionLine ? toNum(revisionLine.effective_unit_price) : toNum(fallbackOffer?.unit_price ?? fallbackOffer?.price_per_unit)
            const previousPrice = previousLine ? toNum(previousLine.effective_unit_price) : null
            const qty = revisionLine ? toNum(revisionLine.effective_quantity) : toNum(fallbackOffer?.quantity ?? ri.quantity)
            const total = quotedPrice != null && qty != null ? quotedPrice * qty : null
            const status = comparisonStatus(quotedPrice, targetPrice, maxPrice)

            return {
                ri,
                targetPrice,
                maxPrice,
                quotedPrice,
                previousPrice,
                qty,
                total,
                status,
                quoteState: revisionLine?.quote_state ?? null,
                quotedExplicitly: revisionLine?.quoted_explicitly ?? false,
                delta: deltaInfo(quotedPrice, previousPrice),
            }
        })
        : []

    const headCls = 'pb-1.5 font-medium text-[10px] uppercase tracking-wide text-gray-400'
    const totalQuoted = rows.reduce((sum, row) => sum + (row.total ?? 0), 0)
    const totalTarget = rows.reduce((sum, row) => sum + ((row.targetPrice != null && row.qty != null) ? row.targetPrice * row.qty : 0), 0)
    const totalMax = rows.reduce((sum, row) => sum + ((row.maxPrice != null && row.qty != null) ? row.maxPrice * row.qty : 0), 0)
    const deliveryDays = toNum(effectiveOffer.delivery_days)
    const paymentDays = toNum(effectiveOffer.payment_days)
    const singleQuoted = toNum(effectiveOffer.unit_price)
    const singlePrevious = toNum(previousRevision?.effective_offer?.unit_price)
    const singleQty = toNum(effectiveOffer.quantity) ?? toNum(rfq?.quantity) ?? toNum(constraints?.quantity)
    const singleTarget = toNum(rfq?.target_price) ?? toNum(constraints?.target_price)
    const singleMax = toNum(constraints?.max_price)
    const singleStatus = comparisonStatus(singleQuoted, singleTarget, singleMax)
    const singleDelta = deltaInfo(singleQuoted, singlePrevious)
    const showSingle = rfqItems.length === 0

    return (
        <div className={`mt-2 rounded-lg border px-3 py-2.5 ${isViolation ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
            <p className={`text-[10px] uppercase tracking-wide font-semibold mb-2 flex items-center gap-1 ${isViolation ? 'text-red-600' : 'text-purple-600'}`}>
                <Sparkles className="h-3 w-3" />
                {showSingle ? 'Supplier quote vs RFQ' : `Supplier quote vs RFQ — ${rows.length} line items`}
            </p>
            <div className="flex flex-wrap gap-3 mb-2">
                {effectiveOffer.delivery_days != null && (
                    <span className={`flex items-center gap-1 text-xs border rounded-full px-2 py-1 ${termTone(deliveryDays, toNum(constraints?.delivery_lead_time_working_days), 'soft')}`}>
                        <Truck className="h-3.5 w-3.5 text-gray-400" />
                        <span>Delivery:</span> <strong>{effectiveOffer.delivery_days} days</strong>
                    </span>
                )}
                {effectiveOffer.payment_days != null && (
                    <span className={`flex items-center gap-1 text-xs border rounded-full px-2 py-1 ${termTone(paymentDays, toNum(constraints?.payment_terms_max_days), 'hard')}`}>
                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                        <span>Payment:</span> <strong>{effectiveOffer.payment_days} days</strong>
                    </span>
                )}
            </div>
            {rfqItems.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className={`border-b ${isViolation ? 'border-red-200' : 'border-purple-200'} text-left`}>
                                <th className={headCls + ' pr-3'}>Item</th>
                                <th className={headCls + ' pr-3'}>Qty</th>
                                <th className={headCls + ' pr-3 text-blue-400'}>RFQ target</th>
                                <th className={headCls + ' pr-3 text-blue-300'}>RFQ max</th>
                                <th className={headCls + ' pr-3'}>Quoted</th>
                                <th className={headCls + ' pr-3'}>Prev</th>
                                <th className={headCls + ' pr-2'}>Total</th>
                                <th className={headCls}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(({ ri, quotedPrice, previousPrice, qty, total, targetPrice, maxPrice, status, quoteState, quotedExplicitly, delta }, i) => (
                                <tr key={i}>
                                    <td className="py-1 pr-3 font-medium text-gray-800 max-w-[130px] truncate">{ri.item_name}</td>
                                    <td className="py-1 pr-3 text-gray-600">{qty ?? '—'}{ri.unit ? ` ${ri.unit}` : ''}</td>
                                    <td className="py-1 pr-3 text-blue-500">{targetPrice != null ? fmt(targetPrice) : '—'}</td>
                                    <td className="py-1 pr-3 text-blue-400">{maxPrice != null ? fmt(maxPrice) : '—'}</td>
                                    <td className={`py-1 pr-3 ${priceCls(status)}`}>
                                        <div className="flex flex-col">
                                            <span>{quotedPrice != null ? fmt(quotedPrice) : '—'}</span>
                                            {quoteState === 'carried_forward' && (
                                                <span className="text-[10px] text-gray-400 font-normal">↩ carried</span>
                                            )}
                                            {quotedExplicitly && delta && (
                                                <span className={`text-[10px] font-medium ${delta.cls}`}>{delta.label}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-1 pr-3 text-gray-400">
                                        {previousPrice != null ? fmt(previousPrice) : '—'}
                                    </td>
                                    <td className="py-1 pr-2 text-gray-600">{total != null ? fmt(total) : '—'}</td>
                                    <td className="py-1">{statusIcon(status)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className={`border-t ${isViolation ? 'border-red-200' : 'border-purple-200'} font-semibold`}>
                                <td className="pt-2 pr-3 text-gray-700">Total</td>
                                <td className="pt-2 pr-3 text-gray-400">—</td>
                                <td className="pt-2 pr-3 text-blue-500">{totalTarget > 0 ? fmt(totalTarget) : '—'}</td>
                                <td className="pt-2 pr-3 text-blue-400">{totalMax > 0 ? fmt(totalMax) : '—'}</td>
                                <td className={`pt-2 pr-3 ${priceCls(comparisonStatus(totalQuoted > 0 ? totalQuoted : null, totalTarget > 0 ? totalTarget : null, toNum(constraints?.total_budget_ceiling) ?? (totalMax > 0 ? totalMax : null)))}`}>
                                    {totalQuoted > 0 ? fmt(totalQuoted) : '—'}
                                </td>
                                <td className="pt-2 pr-3 text-gray-400">—</td>
                                <td className="pt-2 pr-2 text-gray-600">{constraints?.total_budget_ceiling != null ? `Ceiling ${fmt(toNum(constraints.total_budget_ceiling))}` : '—'}</td>
                                <td className="pt-2">
                                    {constraints?.total_budget_ceiling != null
                                        ? statusIcon(comparisonStatus(totalQuoted > 0 ? totalQuoted : null, totalTarget > 0 ? totalTarget : null, toNum(constraints.total_budget_ceiling)))
                                        : statusIcon(comparisonStatus(totalQuoted > 0 ? totalQuoted : null, totalTarget > 0 ? totalTarget : null, totalMax > 0 ? totalMax : null))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className={`border-b ${isViolation ? 'border-red-200' : 'border-purple-200'} text-left`}>
                                <th className={headCls + ' pr-3'}>Item</th>
                                <th className={headCls + ' pr-3'}>Qty</th>
                                <th className={headCls + ' pr-3 text-blue-400'}>RFQ target</th>
                                <th className={headCls + ' pr-3 text-blue-300'}>RFQ max</th>
                                <th className={headCls + ' pr-3'}>Quoted</th>
                                <th className={headCls + ' pr-3'}>Prev</th>
                                <th className={headCls + ' pr-3'}>Total</th>
                                <th className={headCls}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-1 pr-3 font-medium text-gray-800">{rfq?.item_name ?? 'Quoted item'}</td>
                                <td className="py-1 pr-3 text-gray-600">{singleQty ?? '—'}</td>
                                <td className="py-1 pr-3 text-blue-500">{singleTarget != null ? fmt(singleTarget) : '—'}</td>
                                <td className="py-1 pr-3 text-blue-400">{singleMax != null ? fmt(singleMax) : '—'}</td>
                                <td className={`py-1 pr-3 ${priceCls(singleStatus)}`}>
                                    <div className="flex flex-col">
                                        <span>{singleQuoted != null ? fmt(singleQuoted) : '—'}</span>
                                        {singleDelta && <span className={`text-[10px] font-medium ${singleDelta.cls}`}>{singleDelta.label}</span>}
                                    </div>
                                </td>
                                <td className="py-1 pr-3 text-gray-400">{singlePrevious != null ? fmt(singlePrevious) : '—'}</td>
                                <td className="py-1 pr-3 text-gray-600">{singleQuoted != null && singleQty != null ? fmt(singleQuoted * singleQty) : '—'}</td>
                                <td className="py-1">{statusIcon(singleStatus)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// ─── attachment button ────────────────────────────────────────────────────────

function AttachmentButton({ att, negotiationId, messageId }: { att: any; negotiationId: string; messageId: string }) {
    const [loading, setLoading] = useState(false)
    const hasS3 = !!att.s3_key
    const isPdf = (att.filename || '').toLowerCase().endsWith('.pdf') || (att.content_type || '').includes('pdf')

    const handleClick = async () => {
        setLoading(true)
        try {
            if (hasS3 && isPdf) {
                // Open PDF in a new tab via pre-signed URL
                const { url } = await getAttachmentPresignedUrl(negotiationId, messageId, att.id)
                window.open(url, '_blank', 'noopener,noreferrer')
            } else {
                await downloadNegotiationAttachment(negotiationId, messageId, att.id, att.filename || 'attachment')
            }
        } catch {
            toast.error('Could not load attachment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 transition-colors border ${
                hasS3 && isPdf
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
            {att.filename || 'attachment'}
            {att.size ? <span className="opacity-60">({(att.size / 1024).toFixed(0)} KB)</span> : null}
            {hasS3 && isPdf && <span className="text-[10px] opacity-60 ml-0.5">· saved to S3</span>}
        </button>
    )
}

// ─── message bubble ──────────────────────────────────────────────────────────

function MessageBubble({
    msg, supplier, negotiationId, isViolation, roundEvents, rfq, constraints, revision, previousRevision,
}: {
    msg: NegotiationMessage
    supplier: Supplier | undefined
    negotiationId: string
    isViolation: boolean
    roundEvents: NegotiationEvent[]
    rfq: any
    constraints?: any
    revision?: SupplierQuoteRevision | null
    previousRevision?: SupplierQuoteRevision | null
}) {
    const isInbound = msg.direction === 'inbound'
    const [expanded, setExpanded] = useState(false)
    const text = msg.message || ''
    const isLong = text.length > 400
    const shownText = isLong && !expanded ? text.slice(0, 400) + '…' : text

    // Filter events relevant to this message (extraction + rule check happen after inbound)
    const relevantEvents = isInbound
        ? roundEvents.filter(e => ['extraction_started', 'extraction_complete', 'rule_check_started', 'rule_check_passed', 'rule_check_failed', 'strategy_started', 'strategy_complete', 'safety_check_started', 'agreement_reached', 'negotiation_failed'].includes(e.event_type))
        : roundEvents.filter(e => ['email_sent', 'approval_requested', 'approval_granted', 'approval_rejected'].includes(e.event_type))

    return (
        <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'} mb-1`}>
            <div className={`max-w-[90%] w-full ${isInbound ? '' : 'ml-8'}`}>
                {/* Sender label */}
                <div className={`flex items-center gap-1.5 mb-1 ${isInbound ? '' : 'justify-end'}`}>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${isInbound ? 'text-gray-700' : 'text-blue-700'}`}>
                        {isInbound ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        {isInbound ? (supplier?.name || 'Supplier') : 'AI · Nexotropi'}
                    </div>
                    {isInbound && supplier?.email && (
                        <span className="text-gray-400 text-[10px]">{supplier.email}</span>
                    )}
                    <span className="text-gray-400 text-[10px]">{relTime(msg.created_at)}</span>
                    {msg.ai_summary && isInbound && (
                        <span className="text-purple-500 text-[10px] italic flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" />{msg.ai_summary}
                        </span>
                    )}
                    {msg.was_human_overridden && (
                        <Badge variant="outline" className="text-[10px] py-0 border-orange-300 text-orange-600 ml-1">
                            human-edited
                        </Badge>
                    )}
                </div>

                {/* Bubble */}
                <div className={`rounded-xl px-4 py-3 text-sm ${
                    isViolation && isInbound
                        ? 'bg-red-50 border border-red-200'
                        : isInbound
                            ? 'bg-gray-50 border border-gray-200'
                            : 'bg-[#1A4A7A]/5 border border-[#1A4A7A]/20'
                }`}>
                    {msg.subject && (
                        <p className="text-xs text-gray-500 mb-2 pb-2 border-b border-gray-200">
                            <span className="font-medium">Subject:</span> {msg.subject}
                        </p>
                    )}
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">{shownText}</p>
                    {isLong && (
                        <button onClick={() => setExpanded(v => !v)} className="text-xs text-blue-600 mt-1 hover:underline">
                            {expanded ? 'Show less' : 'Show more'}
                        </button>
                    )}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.attachments.map((a: any) => (
                                <AttachmentButton key={a.id} att={a} negotiationId={negotiationId} messageId={msg.id} />
                            ))}
                        </div>
                    )}

                    {/* Extracted offer — side-by-side with RFQ when line items exist */}
                    {isInbound && ((revision?.effective_offer && hasRenderableOffer(revision.effective_offer)) || (msg.extracted_offer && hasRenderableOffer(msg.extracted_offer))) && (
                        <RFQvsQuoteCard
                            offer={msg.extracted_offer}
                            rfq={rfq}
                            isViolation={isViolation}
                            constraints={constraints}
                            revision={revision}
                            previousRevision={previousRevision}
                        />
                    )}
                </div>

                {/* Pipeline events that belong to this message's round */}
                {relevantEvents.length > 0 && (
                    <div className={`mt-2 space-y-1 ${isInbound ? '' : 'flex flex-col items-end'}`}>
                        {relevantEvents.map(e => (
                            <PipelineEvent key={e.id} ev={e} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── round section ────────────────────────────────────────────────────────────

function RoundSection({
    group, supplier, negotiationId, isLastRound, endReason, constraints, rfq,
    getRevisionForMessage, getPreviousRevisionForMessage,
}: {
    group: RoundGroup
    supplier: Supplier | undefined
    negotiationId: string
    isLastRound: boolean
    endReason: string | null
    constraints: any
    rfq: any
    getRevisionForMessage: (msg: NegotiationMessage) => SupplierQuoteRevision | null
    getPreviousRevisionForMessage: (msg: NegotiationMessage) => SupplierQuoteRevision | null
}) {
    const isViolation = isLastRound && endReason === 'hard_violation'

    // Events that don't belong to any specific message (pre-round events like quote_received)
    // email_received is suppressed when a real inbound message exists for this round —
    // the message bubble itself already shows who replied and when, so the pill is redundant.
    const hasInboundMessage = group.messages.some(m => m.direction === 'inbound')
    const preEvents = group.round === 0
        ? group.events.filter(e => ['quote_received', 'email_received', 'collection_threshold_met', 'late_supplier_response'].includes(e.event_type))
        : group.events.filter(e =>
            (e.event_type === 'late_supplier_response') ||
            (e.event_type === 'email_received' && !hasInboundMessage)
          )

    return (
        <div className="relative">
            {/* Round label */}
            {group.round > 0 && (
                <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        isViolation ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                        Round {group.round}
                        {isViolation && <XCircle className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 h-px bg-gray-100" />
                    {constraints?.max_price != null && (
                        <span className="text-xs text-gray-400">ceiling {fmt(constraints.max_price)}</span>
                    )}
                </div>
            )}

            {/* Pre-round events (e.g. quote_received in collection) */}
            {preEvents.length > 0 && (
                <div className="space-y-1 mb-3">
                    {preEvents.map(e => <PipelineEvent key={e.id} ev={e} />)}
                </div>
            )}

            {/* Messages */}
            <div className="space-y-4">
                {group.messages.map(msg => {
                    // Only show round-level events alongside inbound messages
                    const msgEvents = msg.direction === 'inbound' ? group.events.filter(e =>
                        !preEvents.includes(e) &&
                        !['email_sent'].includes(e.event_type)
                    ) : group.events.filter(e => e.event_type === 'email_sent')
                    const revision = getRevisionForMessage(msg)
                    const previousRevision = getPreviousRevisionForMessage(msg)

                    return (
                        <MessageBubble
                            key={msg.id}
                            msg={msg}
                            supplier={supplier}
                            negotiationId={negotiationId}
                            isViolation={isViolation && msg.direction === 'inbound'}
                            roundEvents={msgEvents}
                            rfq={rfq}
                            constraints={constraints}
                            revision={revision}
                            previousRevision={previousRevision}
                        />
                    )
                })}
            </div>

            {/* Round 0: show pre-events only (no messages expected) */}
            {group.round === 0 && group.messages.length === 0 && group.events.length > 0 && (
                <div className="space-y-1">
                    {group.events.filter(e => !preEvents.includes(e)).map(e => <PipelineEvent key={e.id} ev={e} />)}
                </div>
            )}
        </div>
    )
}

// ─── pending approval card ────────────────────────────────────────────────────

function PendingApprovalCard({
    negotiation,
    refetch,
    latestRevision,
    rfq,
    constraints,
}: {
    negotiation: Negotiation
    refetch: () => void
    latestRevision?: SupplierQuoteRevision | null
    rfq?: any
    constraints?: any
}) {
    const pending = negotiation.pending_counteroffer
    const approveCounter = useApproveCounteroffer()
    const [overrideMsg, setOverrideMsg] = useState('')
    const [overridePrice, setOverridePrice] = useState('')
    const [overrideQty, setOverrideQty] = useState('')
    const counterLineItems = Array.isArray(pending?.counter_line_items) ? pending.counter_line_items : []
    const isMultiItemCounter = counterLineItems.length > 0
    const latestLines = latestRevision?.lines ?? []
    const latestOffer = latestRevision?.effective_offer ?? {}
    const targetUnitPrice = toNum(rfq?.target_price) ?? toNum(constraints?.target_price)
    const latestUnitPrice = toNum(latestOffer.unit_price)

    if (negotiation.status !== 'awaiting_approval' || !pending) return null

    const doApprove = async (approved: boolean) => {
        try {
            await approveCounter.mutateAsync({
                id: negotiation.id,
                data: {
                    approved,
                    override_message: overrideMsg || undefined,
                    override_price: overridePrice ? parseFloat(overridePrice) : undefined,
                    override_quantity: overrideQty ? parseInt(overrideQty) : undefined,
                },
            })
            toast.success(approved ? 'Counteroffer approved and queued for delivery' : 'Rejected — AI will reconsider')
            refetch()
        } catch (err: any) {
            toast.error(getApiError(err, 'Action failed'))
        }
    }

    return (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Counteroffer — Awaiting Your Approval
            </p>
            {!isMultiItemCounter && (latestUnitPrice != null || pending.counter_price != null || targetUnitPrice != null) && (
                <div className="bg-white border border-purple-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Quote context</p>
                    <p className="text-sm text-gray-800">
                        Supplier last quote: <span className="font-semibold text-gray-900">{latestUnitPrice != null ? fmt(latestUnitPrice) : '—'}</span>
                        {' '}→ AI counter: <span className="font-semibold text-purple-700">{pending.counter_price != null ? fmt(pending.counter_price) : '—'}</span>
                        {' '}→ Your target: <span className="font-semibold text-blue-700">{targetUnitPrice != null ? fmt(targetUnitPrice) : '—'}</span>
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {pending.counter_price != null && (
                    <div className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Proposed Price</p>
                        <p className="text-xl font-bold text-purple-700">{fmt(pending.counter_price)}</p>
                    </div>
                )}
                {pending.counter_quantity != null && (
                    <div className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Proposed Qty</p>
                        <p className="text-xl font-bold text-purple-700">{pending.counter_quantity}</p>
                    </div>
                )}
                {pending.reasoning && (
                    <div className="bg-white border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">AI Reasoning</p>
                        <p className="text-xs text-gray-700">{pending.reasoning}</p>
                    </div>
                )}
            </div>
            {isMultiItemCounter && (
                <div className="bg-white border border-purple-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-2">Proposed Counter Line Items</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="pb-2 pr-3 font-medium">#</th>
                                    <th className="pb-2 pr-3 font-medium">Item</th>
                                    <th className="pb-2 pr-3 font-medium">Supplier last</th>
                                    <th className="pb-2 pr-3 font-medium">Counter Price</th>
                                    <th className="pb-2 pr-3 font-medium">Target</th>
                                    <th className="pb-2 font-medium">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {counterLineItems.map((item: any) => (
                                    <tr key={`${item.line_number}-${item.item_name}`}>
                                        <td className="py-2 pr-3 text-gray-500">{item.line_number ?? '—'}</td>
                                        <td className="py-2 pr-3 text-gray-800 font-medium">{item.item_name ?? 'Line item'}</td>
                                        <td className="py-2 pr-3 text-gray-600">
                                            {(() => {
                                                const line = latestLines.find((l) => l.line_number === item.line_number)
                                                return line?.effective_unit_price != null ? fmt(toNum(line.effective_unit_price)) : '—'
                                            })()}
                                        </td>
                                        <td className="py-2 pr-3 text-purple-700 font-semibold">
                                            {item.counter_price != null ? fmt(item.counter_price) : '—'}
                                        </td>
                                        <td className="py-2 pr-3 text-blue-600">
                                            {(() => {
                                                const rfqLine = (rfq?.line_items ?? []).find((l: any) => l.line_number === item.line_number)
                                                return rfqLine?.target_price_per_unit != null ? fmt(toNum(rfqLine.target_price_per_unit)) : '—'
                                            })()}
                                        </td>
                                        <td className="py-2 text-gray-700">{item.counter_quantity ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {pending.message && (
                <div className="bg-white border border-purple-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Draft Message</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{pending.message}</p>
                </div>
            )}
            {pending.send_error && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Delivery issue</p>
                    <p className="text-sm text-amber-900">{String(pending.send_error)}</p>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                {!isMultiItemCounter && (
                    <div>
                        <Label className="text-xs text-gray-500">Override Price (optional)</Label>
                        <Input type="number" step="0.01" placeholder={pending.counter_price != null ? String(pending.counter_price) : ''}
                            value={overridePrice} onChange={e => setOverridePrice(e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                )}
                {!isMultiItemCounter && (
                    <div>
                        <Label className="text-xs text-gray-500">Override Qty (optional)</Label>
                        <Input type="number" placeholder={pending.counter_quantity != null ? String(pending.counter_quantity) : ''}
                            value={overrideQty} onChange={e => setOverrideQty(e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                )}
                <div>
                    <Label className="text-xs text-gray-500">Override Message (optional)</Label>
                    <Input placeholder="Custom reply" value={overrideMsg} onChange={e => setOverrideMsg(e.target.value)} className="mt-1 h-8 text-sm" />
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                    disabled={approveCounter.isPending} onClick={() => doApprove(true)}>
                    {approveCounter.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Approve & Send
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200"
                    disabled={approveCounter.isPending} onClick={() => doApprove(false)}>
                    Reject
                </Button>
            </div>
        </div>
    )
}

function QuoteStateBadge({ state }: { state: string | null | undefined }) {
    if (!state) return null
    const style = state === 'quoted'
        ? 'bg-purple-100 text-purple-700 border-purple-200'
        : state === 'carried_forward'
            ? 'bg-gray-100 text-gray-600 border-gray-200'
            : 'bg-gray-50 text-gray-400 border-gray-200'
    const label = state === 'quoted'
        ? 'updated'
        : state === 'carried_forward'
            ? 'carried'
            : 'unquoted'
    return (
        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${style}`}>
            {label}
        </span>
    )
}

function QuoteHistoryPanel({
    revisions,
    rfq,
    constraints,
}: {
    revisions: SupplierQuoteRevision[]
    rfq: any
    constraints: any
}) {
    const rfqItems: any[] = rfq?.line_items ?? []
    const isMultiItem = rfqItems.length > 0
    const revisionByNumber = new Map(revisions.map((revision) => [revision.revision_number, revision]))
    const latestRevisionId = revisions[revisions.length - 1]?.id
    const [showChangedOnly, setShowChangedOnly] = useState(false)
    const [openRevisions, setOpenRevisions] = useState<Record<string, boolean>>({})

    if (!revisions.length) return null

    const isRevisionOpen = (revisionId: string) => openRevisions[revisionId] ?? revisionId === latestRevisionId
    const toggleRevision = (revisionId: string) => {
        setOpenRevisions((prev) => ({
            ...prev,
            [revisionId]: !(prev[revisionId] ?? revisionId === latestRevisionId),
        }))
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div>
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">Quote history</p>
                    <p className="text-sm text-gray-700">Every supplier quote and requote, with carried-forward lines preserved.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowChangedOnly((prev) => !prev)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                            showChangedOnly
                                ? 'bg-[#1A4A7A] text-white border-[#1A4A7A]'
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                        {showChangedOnly ? 'Showing changed only' : 'Show changed only'}
                    </button>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
                        {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {revisions.map((revision) => {
                    const previousRevision = revisionByNumber.get(revision.revision_number - 1) ?? null
                    const previousByLineId = new Map(
                        (previousRevision?.lines ?? []).map((line) => [String(line.rfq_line_item_id), line])
                    )
                    const effectiveOffer = revision.effective_offer ?? {}
                    const changedLineCount = revision.lines.filter((line) => line.quote_state === 'quoted').length
                    const revisionId = String(revision.id)
                    const isOpen = isRevisionOpen(revisionId)

                    return (
                        <div key={revision.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => toggleRevision(revisionId)}
                                        className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        Revision {revision.revision_number}
                                    </button>
                                    <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600">
                                        Round {revision.round_number}
                                    </span>
                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${revision.is_partial ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {revision.is_partial ? 'partial requote' : 'full quote'}
                                    </span>
                                    {isMultiItem && (
                                        <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-[11px] text-gray-500">
                                            {changedLineCount} changed line{changedLineCount !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-gray-400">{relTime(revision.created_at)}</span>
                            </div>

                            {isOpen && (isMultiItem ? (
                                (() => {
                                    const rows = rfqItems.map((rfqItem: any) => {
                                        const line = revision.lines.find((entry) => String(entry.rfq_line_item_id) === String(rfqItem.id))
                                        const previousLine = previousByLineId.get(String(rfqItem.id))
                                        const quoted = line ? toNum(line.effective_unit_price) : null
                                        const previous = previousLine ? toNum(previousLine.effective_unit_price) : null
                                        const qty = line ? toNum(line.effective_quantity) : toNum(rfqItem.quantity)
                                        const status = comparisonStatus(quoted, toNum(rfqItem.target_price_per_unit), toNum(rfqItem.max_price_per_unit))
                                        const delta = deltaInfo(quoted, previous)
                                        const changed = revision.revision_number === 1
                                            ? quoted != null
                                            : !!line && (line.quote_state === 'quoted' || quoted !== previous)
                                        return { rfqItem, line, previous, quoted, qty, status, delta, changed }
                                    }).filter((row) => !showChangedOnly || row.changed)

                                    const totals = rows.reduce((acc, row) => {
                                        const target = toNum(row.rfqItem.target_price_per_unit)
                                        const max = toNum(row.rfqItem.max_price_per_unit)
                                        if (row.qty != null && row.quoted != null) acc.quoted += row.qty * row.quoted
                                        if (row.qty != null && target != null) acc.target += row.qty * target
                                        if (row.qty != null && max != null) acc.max += row.qty * max
                                        return acc
                                    }, { quoted: 0, target: 0, max: 0 })

                                    const totalStatus = comparisonStatus(
                                        totals.quoted > 0 ? totals.quoted : null,
                                        totals.target > 0 ? totals.target : null,
                                        toNum(constraints?.total_budget_ceiling) ?? (totals.max > 0 ? totals.max : null)
                                    )

                                    return (
                                        <>
                                            <div className="md:hidden mt-3 space-y-2">
                                                {rows.map(({ rfqItem, line, previous, quoted, qty, status, delta }) => (
                                                    <div key={rfqItem.id} className="rounded-lg border border-gray-200 bg-white p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{rfqItem.item_name}</p>
                                                                <p className="text-[11px] text-gray-500">Qty {qty ?? '—'}{rfqItem.unit ? ` ${rfqItem.unit}` : ''}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <QuoteStateBadge state={line?.quote_state} />
                                                                {statusIcon(status)}
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                            <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                                                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Target</p>
                                                                <p className="font-semibold text-blue-600">{rfqItem.target_price_per_unit != null ? fmt(rfqItem.target_price_per_unit) : '—'}</p>
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                                                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Max</p>
                                                                <p className="font-semibold text-blue-400">{rfqItem.max_price_per_unit != null ? fmt(rfqItem.max_price_per_unit) : '—'}</p>
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                                                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Current</p>
                                                                <p className={`font-semibold ${priceCls(status)}`}>{quoted != null ? fmt(quoted) : '—'}</p>
                                                                {delta && <p className={`text-[10px] mt-0.5 ${delta.cls}`}>{delta.label}</p>}
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                                                                <p className="text-[10px] uppercase tracking-wide text-gray-400">Previous</p>
                                                                <p className="font-semibold text-gray-500">{previous != null ? fmt(previous) : '—'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="hidden md:block mt-3 max-h-[420px] overflow-auto rounded-lg border border-gray-200">
                                                <table className="w-full text-xs">
                                                    <thead className="sticky top-0 z-[1] bg-white">
                                                        <tr className="text-left text-gray-400 border-b border-gray-200">
                                                            <th className="pb-2 pt-2 font-medium pr-3 pl-3">Item</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">Qty</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">Target</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">Max</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">Current</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">Previous</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">State</th>
                                                            <th className="pb-2 pt-2 font-medium pr-3">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 bg-white">
                                                        {rows.map(({ rfqItem, line, previous, quoted, qty, status, delta }) => (
                                                            <tr key={rfqItem.id} className={line?.quote_state === 'quoted' ? 'bg-purple-50/30' : ''}>
                                                                <td className="py-2 pr-3 pl-3 font-medium text-gray-800">{rfqItem.item_name}</td>
                                                                <td className="py-2 pr-3 text-gray-600">{qty ?? '—'}{rfqItem.unit ? ` ${rfqItem.unit}` : ''}</td>
                                                                <td className="py-2 pr-3 text-blue-500">{rfqItem.target_price_per_unit != null ? fmt(rfqItem.target_price_per_unit) : '—'}</td>
                                                                <td className="py-2 pr-3 text-blue-400">{rfqItem.max_price_per_unit != null ? fmt(rfqItem.max_price_per_unit) : '—'}</td>
                                                                <td className={`py-2 pr-3 ${priceCls(status)}`}>
                                                                    <div className="flex flex-col">
                                                                        <span>{quoted != null ? fmt(quoted) : '—'}</span>
                                                                        {delta && <span className={`text-[10px] font-medium ${delta.cls}`}>{delta.label}</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 pr-3 text-gray-400">{previous != null ? fmt(previous) : '—'}</td>
                                                                <td className="py-2 pr-3">
                                                                    <QuoteStateBadge state={line?.quote_state} />
                                                                </td>
                                                                <td className="py-2 pr-3">{statusIcon(status)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="sticky bottom-0 bg-gray-50">
                                                        <tr className="border-t border-gray-200 font-semibold">
                                                            <td className="pt-2 pb-2 pr-3 pl-3 text-gray-700">Total</td>
                                                            <td className="pt-2 pb-2 pr-3 text-gray-400">—</td>
                                                            <td className="pt-2 pb-2 pr-3 text-blue-500">{totals.target > 0 ? fmt(totals.target) : '—'}</td>
                                                            <td className="pt-2 pb-2 pr-3 text-blue-400">{totals.max > 0 ? fmt(totals.max) : '—'}</td>
                                                            <td className={`pt-2 pb-2 pr-3 ${priceCls(totalStatus)}`}>{totals.quoted > 0 ? fmt(totals.quoted) : '—'}</td>
                                                            <td className="pt-2 pb-2 pr-3 text-gray-400">—</td>
                                                            <td className="pt-2 pb-2 pr-3">
                                                                {constraints?.total_budget_ceiling != null && (
                                                                    <span className="text-[10px] text-gray-500">Ceiling {fmt(toNum(constraints.total_budget_ceiling))}</span>
                                                                )}
                                                            </td>
                                                            <td className="pt-2 pb-2 pr-3">{statusIcon(totalStatus)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </>
                                    )
                                })()
                            ) : (
                                <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-gray-400 border-b border-gray-200 bg-white">
                                                <th className="pb-2 pt-2 font-medium pr-3 pl-3">Item</th>
                                                <th className="pb-2 pt-2 font-medium pr-3">Qty</th>
                                                <th className="pb-2 pt-2 font-medium pr-3">Target</th>
                                                <th className="pb-2 pt-2 font-medium pr-3">Max</th>
                                                <th className="pb-2 pt-2 font-medium pr-3">Current</th>
                                                <th className="pb-2 pt-2 font-medium pr-3">Previous</th>
                                                <th className="pb-2 pt-2 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const current = toNum(effectiveOffer.unit_price)
                                                const previous = toNum(previousRevision?.effective_offer?.unit_price)
                                                const qty = toNum(effectiveOffer.quantity) ?? toNum(rfq?.quantity) ?? toNum(constraints?.quantity)
                                                const target = toNum(rfq?.target_price) ?? toNum(constraints?.target_price)
                                                const max = toNum(constraints?.max_price)
                                                const status = comparisonStatus(current, target, max)
                                                const delta = deltaInfo(current, previous)
                                                const changed = revision.revision_number === 1 ? current != null : current !== previous
                                                if (showChangedOnly && !changed) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={7} className="px-3 py-3 text-center text-gray-400">
                                                                No commercial change in this revision.
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                                return (
                                                    <tr>
                                                        <td className="py-2 pr-3 pl-3 font-medium text-gray-800">{rfq?.item_name ?? 'Quoted item'}</td>
                                                        <td className="py-2 pr-3 text-gray-600">{qty ?? '—'}</td>
                                                        <td className="py-2 pr-3 text-blue-500">{target != null ? fmt(target) : '—'}</td>
                                                        <td className="py-2 pr-3 text-blue-400">{max != null ? fmt(max) : '—'}</td>
                                                        <td className={`py-2 pr-3 ${priceCls(status)}`}>
                                                            <div className="flex flex-col">
                                                                <span>{current != null ? fmt(current) : '—'}</span>
                                                                {delta && <span className={`text-[10px] font-medium ${delta.cls}`}>{delta.label}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 pr-3 text-gray-400">{previous != null ? fmt(previous) : '—'}</td>
                                                        <td className="py-2 pr-3">{statusIcon(status)}</td>
                                                    </tr>
                                                )
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── intervention card ────────────────────────────────────────────────────────

function InterventionCard({ negotiation, refetch }: { negotiation: Negotiation; refetch: () => void }) {
    const overrideNegotiation = useOverrideNegotiation()
    const endNegotiation = useEndNegotiation()
    const [buyerMessage, setBuyerMessage] = useState('')

    if (negotiation.status !== 'paused') return null
    const pending = negotiation.pending_counteroffer as Record<string, any> | null
    if (!pending) return null
    const reason = pending.reason as string | undefined
    if (reason !== 'intervention_required' && reason !== 'spec_deviation') return null

    const unknownParams = pending.unknown_parameters as string[] | undefined
    const specDeviation = pending.spec_deviation as string | undefined

    const proceedAnyway = async () => {
        try {
            await overrideNegotiation.mutateAsync({
                id: negotiation.id,
                data: { override_message: buyerMessage || undefined },
            })
            toast.success('Buyer override accepted — AI is preparing the next counter-offer')
            refetch()
        } catch (err: any) {
            toast.error(getApiError(err, 'Override failed'))
        }
    }

    const doEnd = async () => {
        try {
            await endNegotiation.mutateAsync(negotiation.id)
            toast.success('Negotiation ended')
            refetch()
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to end negotiation'))
        }
    }

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Negotiation Paused — Supplier Deviated from Brief
            </p>
            {unknownParams && unknownParams.length > 0 && (
                <div>
                    <p className="text-[11px] uppercase tracking-wide text-amber-600 mb-1">Terms outside your brief</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {unknownParams.map(p => (
                            <li key={p} className="text-sm text-amber-950 font-medium">{p.replace(/_/g, ' ')}</li>
                        ))}
                    </ul>
                </div>
            )}
            {specDeviation && (
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-900 whitespace-pre-wrap">{specDeviation}</p>
                </div>
            )}

            <div className="space-y-2 mt-2">
                <p className="text-[10px] uppercase tracking-wide text-amber-600">How should the AI handle this deviation?</p>
                <textarea
                    value={buyerMessage}
                    onChange={(e) => setBuyerMessage(e.target.value)}
                    placeholder="(Optional) Provide guidance to the AI on how to handle these deviations... e.g. 'Push back on the quantity but accept the payment terms'"
                    className="w-full min-h-[80px] rounded-lg border border-amber-200 bg-white p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-xs text-amber-700/80">
                    If left blank, the AI will proceed without extra buyer guidance.
                </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
                <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                    disabled={overrideNegotiation.isPending || endNegotiation.isPending}
                    onClick={proceedAnyway}
                >
                    {overrideNegotiation.isPending
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Zap className="h-3.5 w-3.5" />}
                    Proceed & Counter-Offer
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-100 gap-1.5"
                    disabled={overrideNegotiation.isPending || endNegotiation.isPending}
                    onClick={doEnd}
                >
                    {endNegotiation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    End Negotiation
                </Button>
            </div>
        </div>
    )
}

// ─── clarification banner ─────────────────────────────────────────────────────

function ClarificationBanner({
    clarification,
    negotiationId,
    sessionId,
    negotiations,
    refetch,
}: {
    clarification: ClarificationRequest
    negotiationId: string
    sessionId: string
    negotiations: Negotiation[]
    refetch: () => void
}) {
    const resolveClarification = useResolveClarification()
    const [targetId, setTargetId] = useState(negotiationId)

    const handleResolve = async () => {
        try {
            await resolveClarification.mutateAsync({
                sessionId,
                clarificationId: clarification.id,
                targetNegotiationId: targetId,
            })
            toast.success('Clarification resolved — queued emails will now be processed')
            refetch()
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to resolve clarification'))
        }
    }

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Routing Clarification Required
            </p>
            <p className="text-sm text-amber-800 mb-1">
                The AI could not automatically determine which negotiation this supplier's email belongs to.
                The queued email has been escalated to you for manual routing.
            </p>
            {clarification.question_sent && clarification.question_sent !== '(Surfaced directly to buyer for manual resolution)' && (
                <div className="bg-white border border-amber-200 rounded-lg p-3 mb-3 mt-2">
                    <p className="text-[10px] text-amber-500 uppercase tracking-wide mb-1">Question sent to supplier</p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{clarification.question_sent}</p>
                </div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-amber-700 mb-3">
                <span>Attempt {clarification.attempt_number} of 2</span>
                <span>· {clarification.queued_email_count} email(s) queued</span>
                {clarification.sent_at && <span>· Sent {relTime(clarification.sent_at)}</span>}
            </div>
            <div className="flex items-end gap-3 flex-wrap">
                {negotiations.length > 1 && (
                    <div className="flex-1 min-w-[220px]">
                        <Label className="text-xs text-gray-500">Assign queued emails to negotiation</Label>
                        <select
                            value={targetId}
                            onChange={e => setTargetId(e.target.value)}
                            className="mt-1 w-full h-8 text-sm border border-gray-200 rounded px-2 bg-white"
                        >
                            {negotiations.map(n => (
                                <option key={n.id} value={n.id}>
                                    {n.id === negotiationId ? `(this negotiation)` : n.id.slice(0, 8) + '…'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                    disabled={resolveClarification.isPending}
                    onClick={handleResolve}
                >
                    {resolveClarification.isPending
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Resolve & Process Emails
                </Button>
            </div>
        </div>
    )
}

function EscalationCard({
    escalation,
    negotiationId,
    refetch,
}: {
    escalation: NegotiationEscalation
    negotiationId: string
    refetch: () => void
}) {
    const resolveEscalation = useResolveNegotiationEscalation()
    const [strategy, setStrategy] = useState<'answer' | 'proceed_without_answer' | 'pause_negotiation' | 'end_negotiation'>('answer')
    const [buyerAnswer, setBuyerAnswer] = useState('')
    const [showEmail, setShowEmail] = useState(false)

    const handleSubmit = async () => {
        try {
            await resolveEscalation.mutateAsync({
                negotiationId,
                escalationId: escalation.id,
                data: {
                    resolution_strategy: strategy,
                    buyer_answer: buyerAnswer || undefined,
                },
            })
            toast.success('Supplier question resolved')
            refetch()
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to resolve supplier question'))
        }
    }

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Supplier has a question the AI could not answer
            </p>
            <div>
                <p className="text-[10px] uppercase tracking-wide text-amber-600 mb-1">Supplier asked</p>
                <p className="text-sm text-amber-950 font-medium">{escalation.supplier_question_summary}</p>
                <button
                    onClick={() => setShowEmail(v => !v)}
                    className="mt-2 text-xs text-amber-700 hover:underline"
                >
                    {showEmail ? 'Hide full email' : 'View full email'}
                </button>
                {showEmail && (
                    <div className="mt-2 bg-white border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{escalation.supplier_question_excerpt}</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-amber-600">How do you want to resolve this?</p>
                <label className="flex items-start gap-2 text-sm text-amber-950">
                    <input type="radio" checked={strategy === 'answer'} onChange={() => setStrategy('answer')} />
                    <span>Answer supplier directly</span>
                </label>
                {strategy === 'answer' && (
                    <textarea
                        value={buyerAnswer}
                        onChange={(e) => setBuyerAnswer(e.target.value)}
                        placeholder="Type your answer to the supplier"
                        className="w-full min-h-[110px] rounded-lg border border-amber-200 bg-white p-3 text-sm text-gray-800"
                    />
                )}
                <label className="flex items-start gap-2 text-sm text-amber-950">
                    <input type="radio" checked={strategy === 'proceed_without_answer'} onChange={() => setStrategy('proceed_without_answer')} />
                    <span>Ask supplier to proceed and clearly disclose any deviations or quantity shortfalls</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-amber-950">
                    <input type="radio" checked={strategy === 'pause_negotiation'} onChange={() => setStrategy('pause_negotiation')} />
                    <span>Pause negotiation while we review internally</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-amber-950">
                    <input type="radio" checked={strategy === 'end_negotiation'} onChange={() => setStrategy('end_negotiation')} />
                    <span>End negotiation with this supplier</span>
                </label>
            </div>

            <div className="pt-1">
                <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                    disabled={resolveEscalation.isPending || (strategy === 'answer' && !buyerAnswer.trim())}
                    onClick={handleSubmit}
                >
                    {resolveEscalation.isPending
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Send
                </Button>
            </div>
        </div>
    )
}

// ─── constraints sidebar ──────────────────────────────────────────────────────

type ParamTier = 'hard' | 'target' | 'flexible'

interface ParamRow {
    label: string
    value: string
    tier: ParamTier
    tooltip: string
}

const TIER_STYLE: Record<ParamTier, { badge: string; dot: string; row: string }> = {
    hard:     { badge: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-400',    row: '' },
    target:   { badge: 'bg-blue-100 text-[#1A4A7A] border-blue-200', dot: 'bg-blue-400',   row: '' },
    flexible: { badge: 'bg-gray-100 text-gray-500 border-gray-200',  dot: 'bg-gray-300',   row: '' },
}

const TIER_LABEL: Record<ParamTier, string> = {
    hard:     'Hard limit',
    target:   'Target',
    flexible: 'Flexible',
}

function TierBadge({ tier }: { tier: ParamTier }) {
    const s = TIER_STYLE[tier]
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded px-1.5 py-0.5 ${s.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {TIER_LABEL[tier]}
        </span>
    )
}

function ParamGroup({ title, rows }: { title: string; rows: ParamRow[] }) {
    if (rows.length === 0) return null
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">{title}</p>
            <div className="space-y-2.5">
                {rows.map(row => (
                    <div key={row.label} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 font-medium">{row.label}</p>
                            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{row.tooltip}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-xs font-bold ${row.tier === 'hard' ? 'text-red-700' : row.tier === 'target' ? 'text-[#1A4A7A]' : 'text-gray-600'}`}>
                                {row.value}
                            </span>
                            <TierBadge tier={row.tier} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ConstraintsSidebar({ constraints, rfq }: { constraints: any; rfq: any }) {
    if (!constraints) return null
    const lineItems: any[] = rfq?.line_items ?? []
    const isMultiItem = lineItems.length > 0
    const brief = constraints.brief as { parameters?: any[]; spec_requirements?: any[] } | null
    const rfqMeta = buildRfqMeta(rfq?.description)
    const rfqDescription = compactRfqDescription(rfq?.description)

    // Build structured param rows from flat constraints
    const priceRows: ParamRow[] = []
    const deliveryRows: ParamRow[] = []

    if (!isMultiItem) {
        if (constraints.max_price != null)
            priceRows.push({ label: 'Max Price/unit', value: fmt(constraints.max_price), tier: 'hard', tooltip: 'Auto-rejects any offer above this price' })
        if (constraints.total_budget_ceiling != null)
            priceRows.push({ label: 'Total Budget', value: fmt(constraints.total_budget_ceiling), tier: 'hard', tooltip: 'Auto-rejects if total cost exceeds this' })
        if (constraints.target_price != null)
            priceRows.push({ label: 'Target Price', value: fmt(constraints.target_price), tier: 'target', tooltip: 'AI aims to reach this price' })
        if (constraints.auto_accept_threshold != null)
            priceRows.push({ label: 'Auto-Accept At', value: fmt(constraints.auto_accept_threshold), tier: 'target', tooltip: 'Automatically accepts if supplier quotes at or below this' })
        if (constraints.min_acceptable_price != null)
            priceRows.push({ label: 'Counter Floor', value: fmt(constraints.min_acceptable_price), tier: 'flexible', tooltip: 'AI will not counter-offer below this price' })
        if (constraints.quantity != null)
            priceRows.push({ label: 'Quantity', value: String(constraints.quantity), tier: 'hard', tooltip: 'Required quantity — supplier must meet this' })
        if (constraints.min_quantity != null && constraints.min_quantity !== constraints.quantity)
            priceRows.push({ label: 'Min Quantity', value: String(constraints.min_quantity), tier: 'hard', tooltip: 'Auto-rejects if supplier cannot supply this many units' })
    }

    if (constraints.payment_terms_max_days != null)
        deliveryRows.push({ label: 'Max Payment Days', value: `${constraints.payment_terms_max_days}d`, tier: 'hard', tooltip: 'Auto-rejects if supplier demands longer payment terms' })
    if (constraints.delivery_lead_time_working_days != null)
        deliveryRows.push({ label: 'Delivery Lead Time', value: `${constraints.delivery_lead_time_working_days} days`, tier: 'flexible', tooltip: 'Preferred delivery window — AI will negotiate toward this' })

    // Brief parameters (AI-generated tiers)
    const briefHard = (brief?.parameters ?? []).filter((p: any) => p.tier === 'hard')
    const briefTarget = (brief?.parameters ?? []).filter((p: any) => p.tier === 'target')
    const briefFlexible = (brief?.parameters ?? []).filter((p: any) => p.tier === 'flexible')
    const specHard = (brief?.spec_requirements ?? []).filter((s: any) => s.tier === 'hard')
    const specFlexible = (brief?.spec_requirements ?? []).filter((s: any) => s.tier === 'flexible')

    return (
        <aside className="w-72 shrink-0 space-y-3">
            {/* Legend */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2.5">Parameter tiers</p>
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <TierBadge tier="hard" />
                        <p className="text-[11px] text-gray-500 leading-tight">Offer is automatically rejected if violated — no exceptions</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <TierBadge tier="target" />
                        <p className="text-[11px] text-gray-500 leading-tight">AI negotiates toward this goal but won't auto-reject</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <TierBadge tier="flexible" />
                        <p className="text-[11px] text-gray-500 leading-tight">Guidance for the AI — can be traded off during negotiation</p>
                    </div>
                </div>
            </div>

            {/* Item name */}
            {rfq?.item_name && (
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Negotiating</p>
                    <p className="font-semibold text-gray-900 text-sm">{rfq.item_name}</p>
                    {rfqDescription && <p className="text-xs text-gray-400 mt-0.5">{rfqDescription}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {rfq.line_items?.length > 0 && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                                {rfq.line_items.length} line items
                            </span>
                        )}
                        {rfqMeta.slice(0, 3).map((item) => (
                            <span
                                key={item.label}
                                className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600"
                            >
                                <span className="font-medium text-gray-700">{item.label}:</span> {item.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Single-item price params */}
            {!isMultiItem && (priceRows.length > 0 || deliveryRows.length > 0) && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                    <ParamGroup title="Price parameters" rows={priceRows} />
                    <ParamGroup title="Delivery & payment" rows={deliveryRows} />
                </div>
            )}

            {/* Multi-item: total budget + per-line hard/target */}
            {isMultiItem && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                    {constraints.total_budget_ceiling != null && (
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                            <div>
                                <p className="text-xs text-gray-700 font-medium">Total Budget</p>
                                <p className="text-[10px] text-gray-400">Auto-rejects if total exceeds this</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-bold text-red-700">{fmt(constraints.total_budget_ceiling)}</span>
                                <TierBadge tier="hard" />
                            </div>
                        </div>
                    )}
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Per-item limits</p>
                    <div className="space-y-3">
                        {lineItems.map((li: any) => (
                            <div key={li.id} className="text-xs">
                                <p className="font-medium text-gray-800 truncate mb-1.5">{li.item_name}</p>
                                <div className="space-y-1.5">
                                    {li.max_price_per_unit != null && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Max/unit</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-red-700">{fmt(li.max_price_per_unit)}</span>
                                                <TierBadge tier="hard" />
                                            </div>
                                        </div>
                                    )}
                                    {li.target_price_per_unit != null && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Target/unit</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-[#1A4A7A]">{fmt(li.target_price_per_unit)}</span>
                                                <TierBadge tier="target" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {deliveryRows.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                            <ParamGroup title="Delivery & payment" rows={deliveryRows} />
                        </div>
                    )}
                </div>
            )}

            {/* Brief parameters (AI-classified) */}
            {(briefHard.length > 0 || briefTarget.length > 0 || briefFlexible.length > 0) && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Brief parameters</p>
                    {[
                        { label: 'Hard limits', items: briefHard, tier: 'hard' as ParamTier },
                        { label: 'Targets', items: briefTarget, tier: 'target' as ParamTier },
                        { label: 'Flexible', items: briefFlexible, tier: 'flexible' as ParamTier },
                    ].filter(g => g.items.length > 0).map(group => (
                        <div key={group.label}>
                            <p className="text-[10px] text-gray-400 mb-2">{group.label}</p>
                            <div className="space-y-2">
                                {group.items.map((p: any) => (
                                    <div key={p.key} className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-700">{p.label}</p>
                                            {p.leverage_rule && <p className="text-[10px] text-gray-400 leading-tight mt-0.5 italic">{p.leverage_rule}</p>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {(p.boundary_value || p.target_value) && (
                                                <span className={`text-xs font-semibold ${group.tier === 'hard' ? 'text-red-700' : group.tier === 'target' ? 'text-[#1A4A7A]' : 'text-gray-600'}`}>
                                                    {p.boundary_value || p.target_value}{p.unit ? ` ${p.unit}` : ''}
                                                </span>
                                            )}
                                            <TierBadge tier={group.tier} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Spec requirements (hard/flexible) */}
            {(specHard.length > 0 || specFlexible.length > 0) && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">Spec requirements</p>
                    <div className="space-y-2">
                        {[...specHard, ...specFlexible].map((s: any) => (
                            <div key={s.key} className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-700">{s.label}</p>
                                    {s.value && <p className="text-[10px] text-gray-500 mt-0.5">{s.value}</p>}
                                </div>
                                <TierBadge tier={s.tier as ParamTier} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Operational settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">Settings</p>
                <div className="space-y-2">
                    {[
                        { label: 'Strategy', value: constraints.strategy || '—' },
                        { label: 'Max Rounds', value: String(constraints.max_rounds) },
                        { label: 'Approval', value: constraints.approval_mode || '—' },
                        { label: 'Timeout', value: `${constraints.supplier_timeout_hours}h` },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-semibold text-gray-800 capitalize">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}

// ─── status badge map ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    ended: 'bg-red-100 text-red-700 border-red-200',
    successful: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    paused: 'bg-orange-100 text-orange-700 border-orange-200',
    awaiting_approval: 'bg-purple-100 text-purple-700 border-purple-200',
    awaiting_clarification: 'bg-amber-100 text-amber-700 border-amber-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    timed_out: 'bg-gray-200 text-gray-500 border-gray-300',
}

const NEGOTIATION_REFRESH_EVENTS = new Set([
    'email_sent',
    'human_override',
    'intervention_required',
    'awaiting_clarification',
    'clarification_resolved',
    'agreement_reached',
    'negotiation_failed',
    'timed_out',
    'max_rounds_reached',
    'negotiation_accepted',
])

const MESSAGE_REFRESH_EVENTS = new Set([
    'extraction_complete',
    'rule_check_failed',
    'intervention_required',
    'clarification_sent',
    'clarification_received',
    'clarification_needed',
    'clarification_resolved',
    'awaiting_clarification',
    'email_sent',
    'agreement_reached',
    'negotiation_failed',
])

const QUOTE_REVISION_REFRESH_EVENTS = new Set([
    'extraction_complete',
    'rule_check_failed',
    'rule_check_passed',
    'intervention_required',
    'agreement_reached',
    'negotiation_failed',
])

const CLARIFICATION_REFRESH_EVENTS = new Set([
    'clarification_sent',
    'clarification_received',
    'clarification_needed',
    'clarification_resolved',
    'awaiting_clarification',
])

function upsertNegotiationEvent(existing: NegotiationEvent[], incoming: NegotiationEvent) {
    const next = Array.isArray(existing) ? [...existing] : []
    const idx = next.findIndex((event) => event.id === incoming.id)
    if (idx >= 0) {
        next[idx] = incoming
        return next
    }
    next.push(incoming)
    next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return next
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function NegotiationTimelinePage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const sessionId = params?.id as string
    const negotiationId = params?.negotiationId as string

    const { data: negotiation, refetch: refetchNeg } = useNegotiation(negotiationId)
    const { data: messages = [] } = useNegotiationMessages(negotiationId)
    const { data: quoteRevisions = [] } = useNegotiationQuoteRevisions(negotiationId)
    const { data: events = [] } = useNegotiationEvents(negotiationId)
    const { data: session } = useSession(sessionId)
    const { data: constraints } = useConstraints(sessionId)
    const { data: rfq } = useRFQ(sessionId)
    const hasOriginalFile = !!(rfq?.draft_email?.original_s3_key || rfq?.draft_email?.original_file_b64)
    const { data: rfqDownload } = useRFQDownloadUrl(sessionId, hasOriginalFile)
    const { data: suppliers } = useSuppliers()
    const { data: clarification, refetch: refetchClarification } = usePendingClarification(negotiationId)
    const { data: escalation, refetch: refetchEscalation } = useNegotiationEscalation(negotiationId)
    const { data: sessionNegotiations = [] } = useNegotiationsBySession(sessionId)
    const endNeg = useEndNegotiation()
    const resumeNeg = useResumeNegotiation()

    const supplier = suppliers?.find((s: Supplier) => s.id === negotiation?.supplier_id)
    const rounds = groupByRound(messages, events)
    const totalRounds = rounds.filter(r => r.round > 0).length
    const rfqMeta = buildRfqMeta(rfq?.description)
    const rfqDescription = compactRfqDescription(rfq?.description)
    const rfqLineItems: any[] = rfq?.line_items ?? []
    const latestQuoteRevision = quoteRevisions.length > 0 ? quoteRevisions[quoteRevisions.length - 1] : null

    // Build lookup indexes for revisions
    const revisionByNumber = new Map<number, SupplierQuoteRevision>()
    quoteRevisions.forEach((revision) => {
        revisionByNumber.set(revision.revision_number, revision)
    })

    // Primary key: source_negotiation_message_id (UUID FK — set on the main path)
    const revisionByMessageId = new Map<string, SupplierQuoteRevision>()
    const previousRevisionByMessageId = new Map<string, SupplierQuoteRevision | null>()
    quoteRevisions.forEach((revision) => {
        if (revision.source_message_id) {
            revisionByMessageId.set(String(revision.source_message_id), revision)
            const prev = revisionByNumber.get(revision.revision_number - 1) ?? null
            previousRevisionByMessageId.set(String(revision.source_message_id), prev)
        }
    })

    // Secondary map: only covers revisions without source_message_id (polling/replay path).
    // Revisions arrive sorted by ascending revision_number, so last write wins on duplicate
    // nylas_message_id. That is the correct tiebreak if an upstream dedupe failure ever
    // created duplicate degraded revisions for the same provider message.
    const revisionByNylasMessageId = new Map<string, SupplierQuoteRevision>()
    const previousRevisionByNylasMessageId = new Map<string, SupplierQuoteRevision | null>()
    quoteRevisions.forEach((revision) => {
        if (revision.nylas_message_id && !revision.source_message_id) {
            revisionByNylasMessageId.set(revision.nylas_message_id, revision)
            const prev = revisionByNumber.get(revision.revision_number - 1) ?? null
            previousRevisionByNylasMessageId.set(revision.nylas_message_id, prev)
        }
    })

    // Resolve revision for a message: primary key first, secondary key fallback
    const getRevisionForMessage = (msg: NegotiationMessage): SupplierQuoteRevision | null =>
        revisionByMessageId.get(msg.id) ??
        (msg.nylas_message_id ? revisionByNylasMessageId.get(msg.nylas_message_id) ?? null : null)

    const getPreviousRevisionForMessage = (msg: NegotiationMessage): SupplierQuoteRevision | null =>
        previousRevisionByMessageId.get(msg.id) ??
        (msg.nylas_message_id ? previousRevisionByNylasMessageId.get(msg.nylas_message_id) ?? null : null)

    const hasInboundExtractedOffer = messages.some(
        (msg) =>
            msg.direction === 'inbound' &&
            (hasRenderableOffer(getRevisionForMessage(msg)?.effective_offer) || hasRenderableOffer(msg.extracted_offer))
    )

    useEffect(() => {
        if (!negotiationId) return

        let refreshTimer: ReturnType<typeof setTimeout> | null = null
        let pendingRefresh = {
            negotiation: false,
            messages: false,
            quoteRevisions: false,
            clarification: false,
            sessionNegotiations: false,
        }

        const flushRefreshes = () => {
            if (pendingRefresh.negotiation) {
                void queryClient.invalidateQueries({ queryKey: ["negotiation", negotiationId] })
            }
            if (pendingRefresh.messages) {
                void queryClient.invalidateQueries({ queryKey: ["negotiation-messages", negotiationId] })
            }
            if (pendingRefresh.quoteRevisions) {
                void queryClient.invalidateQueries({ queryKey: ["negotiation-quote-revisions", negotiationId] })
            }
            if (pendingRefresh.clarification) {
                void queryClient.invalidateQueries({ queryKey: ["negotiation-clarification", negotiationId] })
                void queryClient.invalidateQueries({ queryKey: ["negotiation-escalation", negotiationId] })
            }
            if (pendingRefresh.sessionNegotiations) {
                void queryClient.invalidateQueries({ queryKey: ["negotiations", sessionId] })
            }

            pendingRefresh = {
                negotiation: false,
                messages: false,
                quoteRevisions: false,
                clarification: false,
                sessionNegotiations: false,
            }
            refreshTimer = null
        }

        const scheduleRefresh = () => {
            if (refreshTimer) return
            refreshTimer = setTimeout(flushRefreshes, 400)
        }

        const unsubscribe = subscribeToNegotiationEvents(negotiationId, (event) => {
            queryClient.setQueryData<NegotiationEvent[]>(
                ["negotiation-events", negotiationId],
                (current = []) => upsertNegotiationEvent(current, event),
            )

            if (NEGOTIATION_REFRESH_EVENTS.has(event.event_type)) {
                pendingRefresh.negotiation = true
                pendingRefresh.sessionNegotiations = true
            }
            if (MESSAGE_REFRESH_EVENTS.has(event.event_type)) {
                pendingRefresh.messages = true
            }
            if (QUOTE_REVISION_REFRESH_EVENTS.has(event.event_type)) {
                pendingRefresh.quoteRevisions = true
            }
            if (CLARIFICATION_REFRESH_EVENTS.has(event.event_type)) {
                pendingRefresh.clarification = true
            }

            if (
                pendingRefresh.negotiation ||
                pendingRefresh.messages ||
                pendingRefresh.quoteRevisions ||
                pendingRefresh.clarification ||
                pendingRefresh.sessionNegotiations
            ) {
                scheduleRefresh()
            }
        })

        return () => {
            if (refreshTimer) clearTimeout(refreshTimer)
            unsubscribe()
        }
    }, [negotiationId, queryClient, sessionId])

    if (!negotiation) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-gray-400 text-sm">
                Loading negotiation…
            </div>
        )
    }

    const isTerminal = ['ended', 'failed', 'timed_out', 'successful'].includes(negotiation.status)

    const doAction = async (fn: () => Promise<any>, label: string) => {
        try {
            await fn()
            toast.success(label)
            refetchNeg()
        } catch (err: any) {
            toast.error(getApiError(err, `Failed: ${label}`))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 flex-wrap">
                    <Link href={`/user/negotiation/${sessionId}`}>
                        <Button variant="ghost" size="sm" className="text-gray-500 gap-1.5 h-8">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to session
                        </Button>
                    </Link>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 truncate">
                            {supplier?.name || 'Supplier'}
                        </span>
                        {supplier?.company && (
                            <span className="text-gray-400 text-sm">· {supplier.company}</span>
                        )}
                        {supplier?.email && (
                            <a href={`mailto:${supplier.email}`} className="text-xs text-gray-400 hover:text-[#1A4A7A] hover:underline truncate hidden sm:block">
                                {supplier.email}
                            </a>
                        )}
                        <Badge className={`border text-xs ml-1 ${STATUS_BADGE[negotiation.status] || 'bg-gray-100 text-gray-600'}`}>
                            {negotiation.status.replace(/_/g, ' ')}
                        </Badge>
                        {negotiation.end_reason && (
                            <span className="text-xs text-gray-400">{negotiation.end_reason.replace(/_/g, ' ')}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                        <span>Round {Math.max(negotiation.current_round, totalRounds)} of {constraints?.max_rounds ?? '?'}</span>
                        {negotiation.ended_at && <span>· Ended {relTime(negotiation.ended_at)}</span>}
                    </div>
                    {!isTerminal && (
                        <div className="flex gap-2 shrink-0">
                            {negotiation.status === 'paused' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                                    onClick={() => doAction(() => resumeNeg.mutateAsync(negotiationId), 'Resumed')}>
                                    <RotateCcw className="h-3 w-3" /> Resume
                                </Button>
                            )}
                            {['active', 'paused', 'awaiting_approval'].includes(negotiation.status) && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 border-red-200"
                                    onClick={() => doAction(() => endNeg.mutateAsync(negotiationId), 'Ended')}>
                                    End
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

                {/* Main timeline */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: 'Rounds', value: totalRounds > 0 ? `${totalRounds}` : '0' },
                            { label: 'Messages', value: String(messages.length) },
                            negotiation.agreed_price != null
                                ? { label: 'Agreed Price', value: fmt(negotiation.agreed_price), accent: true }
                                : null,
                            negotiation.savings_percent != null
                                ? { label: 'Savings', value: `${Number(negotiation.savings_percent).toFixed(1)}%`, accent: true }
                                : null,
                        ].filter(Boolean).map((item: any) => (
                            <div key={item.label} className={`rounded-lg border px-4 py-2 text-center ${item.accent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                                <p className={`font-bold text-sm ${item.accent ? 'text-emerald-700' : 'text-gray-800'}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Outcome banner */}
                    <OutcomeBanner negotiation={negotiation} events={events} />

                    {/* Pending approval */}
                    <PendingApprovalCard
                        negotiation={negotiation}
                        refetch={refetchNeg}
                        latestRevision={latestQuoteRevision}
                        rfq={rfq}
                        constraints={constraints}
                    />

                    {/* Buyer intervention (unknown brief param / spec deviation) */}
                    <InterventionCard negotiation={negotiation} refetch={refetchNeg} />

                    {/* Buyer resolution for supplier questions AI could not answer */}
                    {escalation?.status === 'open' && (
                        <EscalationCard
                            escalation={escalation}
                            negotiationId={negotiationId}
                            refetch={() => { refetchNeg(); refetchEscalation(); }}
                        />
                    )}

                    {/* Clarification banner */}
                    {clarification && negotiation.status === 'awaiting_clarification' && (
                        <ClarificationBanner
                            clarification={clarification}
                            negotiationId={negotiationId}
                            sessionId={sessionId}
                            negotiations={sessionNegotiations}
                            refetch={() => { refetchNeg(); refetchClarification(); }}
                        />
                    )}

                    {/* ── RFQ summary card ── */}
                    {rfq && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-blue-600 mb-2 flex items-center gap-1">
                                <FileText className="h-3 w-3" /> RFQ commercial baseline
                            </p>
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <p className="font-semibold text-blue-900 text-sm">{rfq.item_name}</p>
                                    <p className="text-[11px] text-blue-600 mt-0.5">
                                        {rfqLineItems.length > 0
                                            ? `${rfqLineItems.length} line items priced for negotiation`
                                            : 'Single-item negotiation baseline'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {rfq.sent_at && <p className="text-[10px] text-blue-400">Sent {relTime(rfq.sent_at)}</p>}
                                    {rfqDownload?.url && (
                                        <a
                                            href={rfqDownload.url}
                                            download={rfqDownload.filename ?? 'RFQ.pdf'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 border border-blue-300 bg-white/80 hover:bg-white rounded-md px-2 py-1 transition-colors"
                                        >
                                            <Download className="h-3 w-3" />
                                            {rfqDownload.filename ?? 'Download RFQ'}
                                        </a>
                                    )}
                                </div>
                            </div>
                            {rfqLineItems.length > 0 ? (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-blue-500 border-b border-blue-200">
                                                <th className="pb-1 font-medium pr-3">#</th>
                                                <th className="pb-1 font-medium pr-3">Item</th>
                                                <th className="pb-1 font-medium pr-3">Qty</th>
                                                <th className="pb-1 font-medium pr-3">Target/unit</th>
                                                <th className="pb-1 font-medium">Max/unit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-100">
                                            {rfqLineItems.map((li: any) => (
                                                <tr key={li.id}>
                                                    <td className="py-1 pr-3 text-blue-400">{li.line_number}</td>
                                                    <td className="py-1 pr-3 font-medium text-blue-900">{li.item_name}</td>
                                                    <td className="py-1 pr-3 text-blue-700">{li.quantity ?? '—'}{li.unit ? ` ${li.unit}` : ''}</td>
                                                    <td className="py-1 pr-3 text-blue-700">{li.target_price_per_unit != null ? fmt(li.target_price_per_unit) : '—'}</td>
                                                    <td className="py-1 text-blue-700">{li.max_price_per_unit != null ? fmt(li.max_price_per_unit) : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className="rounded-lg bg-white/80 border border-blue-100 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-blue-400">Quantity</p>
                                        <p className="text-sm font-semibold text-blue-900">{rfq.quantity ?? constraints?.quantity ?? '—'}</p>
                                    </div>
                                    <div className="rounded-lg bg-white/80 border border-blue-100 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-blue-400">Target</p>
                                        <p className="text-sm font-semibold text-blue-900">
                                            {rfq.target_price != null ? fmt(rfq.target_price) : constraints?.target_price != null ? fmt(constraints.target_price) : '—'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-white/80 border border-blue-100 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-blue-400">Max</p>
                                        <p className="text-sm font-semibold text-blue-900">
                                            {constraints?.max_price != null ? fmt(constraints.max_price) : '—'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-white/80 border border-blue-100 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-blue-400">Budget Ceiling</p>
                                        <p className="text-sm font-semibold text-blue-900">
                                            {constraints?.total_budget_ceiling != null ? fmt(constraints.total_budget_ceiling) : '—'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {constraints?.award_basis && (
                                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-800">
                                        <span className="font-medium">Award basis:</span> {constraints.award_basis.replace(/_/g, ' ')}
                                    </span>
                                )}
                                {constraints?.currency && (
                                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-800">
                                        <span className="font-medium">Currency:</span> {constraints.currency}
                                    </span>
                                )}
                                {constraints?.total_budget_ceiling != null && rfqLineItems.length > 0 && (
                                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-800">
                                        <span className="font-medium">Budget ceiling:</span> {fmt(constraints.total_budget_ceiling)}
                                    </span>
                                )}
                                {rfq.response_deadline && (
                                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-800">
                                        <span className="font-medium">Quote deadline:</span> {new Date(rfq.response_deadline).toLocaleDateString()}
                                    </span>
                                )}
                                {rfq.deadline && (
                                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-800">
                                        <span className="font-medium">Delivery target:</span> {new Date(rfq.deadline).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            {rfqDescription && (
                                <details className="mt-3">
                                    <summary className="cursor-pointer text-[11px] font-medium text-blue-700">
                                        Secondary RFQ context
                                    </summary>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-xs text-blue-700">{rfqDescription}</p>
                                        {rfqMeta.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {rfqMeta.map((item) => (
                                                    <span
                                                        key={item.label}
                                                        className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-800"
                                                    >
                                                        <span className="font-medium">{item.label}:</span> {item.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}

                    <QuoteHistoryPanel
                        revisions={quoteRevisions}
                        rfq={rfq}
                        constraints={constraints}
                    />

                    {/* ── Events-based offer fallback (when Celery worker wasn't restarted in time) ── */}
                    {!hasInboundExtractedOffer && events.length > 0 && (() => {
                        const extractionEv = events.find(e => e.event_type === 'extraction_complete' && e.data?.extracted_offer)
                        if (!extractionEv) return null
                        const extracted = extractionEv.data!.extracted_offer as Record<string, any>
                        const isViolation = negotiation.end_reason === 'hard_violation'
                        return (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 mb-2 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Supplier offer — reconstructed from pipeline events
                                </p>
                                <p className="text-xs text-amber-600 mb-3">
                                    The message record wasn't saved for this negotiation (worker was restarted after processing). The offer data was captured during extraction.
                                </p>
                                <RFQvsQuoteCard offer={extracted} rfq={rfq} isViolation={isViolation} />
                                <div className="mt-3 space-y-1">
                                    {events.filter(e => ['extraction_complete','rule_check_failed','rule_check_passed','strategy_complete','agreement_reached','negotiation_failed'].includes(e.event_type)).map(e => (
                                        <PipelineEvent key={e.id} ev={e} />
                                    ))}
                                </div>
                            </div>
                        )
                    })()}

                    {/* Empty state — only shown when truly no data at all */}
                    {rounds.length === 0 && messages.length === 0 && !events.find(e => e.event_type === 'extraction_complete') && (
                        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
                            <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs mt-1">The supplier hasn't replied yet, or the negotiation is still in the collection phase.</p>
                        </div>
                    )}

                    {/* Timeline rounds */}
                    <div className="space-y-8">
                        {rounds.map((group, idx) => (
                            <RoundSection
                                key={group.round}
                                group={group}
                                supplier={supplier}
                                negotiationId={negotiationId}
                                isLastRound={idx === rounds.length - 1}
                                endReason={negotiation.end_reason}
                                constraints={constraints}
                            rfq={rfq}
                            getRevisionForMessage={getRevisionForMessage}
                            getPreviousRevisionForMessage={getPreviousRevisionForMessage}
                        />
                    ))}
                    </div>
                </div>

                {/* Sidebar */}
                <ConstraintsSidebar
                    constraints={constraints}
                    rfq={rfq}
                />
            </div>
        </div>
    )
}
