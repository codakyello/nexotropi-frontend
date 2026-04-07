"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    Play, Pause, X, Trophy, Zap, ChevronDown, ChevronUp, CheckCircle2,
    AlertCircle, TrendingUp, TrendingDown, Minus, RotateCcw, Award,
    Users, DollarSign, MessageSquare, Clock, Sparkles, Loader2,
    Settings2, Mail, Pencil, XCircle, ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { buildRfqMeta, compactRfqDescription } from '@/lib/rfqDisplay'
import { getApiError } from '@/lib/utils'
import Link from 'next/link'
import {
    useSession, useConstraints, useNegotiationsBySession, useSuppliers,
    useNegotiationMessages, useNegotiationEvents,
    usePauseSession, useResumeSession, useCancelSession, useCloseSession,
    useStartNegotiating, useStartBAFO,
    useApproveCounteroffer, useAcceptNegotiation,
    usePauseNegotiation, useResumeNegotiation, useEndNegotiation,
    useUpdateConstraints, useNylasStatus, useRFQ, useUpdateRFQLineItems,
    subscribeToSessionEvents, downloadNegotiationAttachment,
    Negotiation, NegotiationEvent, Supplier,
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
    awaiting_constraints: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-orange-100 text-orange-800 border-orange-200',
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

const EVENT_BORDER: Record<string, string> = {
    email_received: 'border-blue-400',
    email_sent: 'border-green-400',
    agreement_reached: 'border-emerald-500',
    negotiation_failed: 'border-red-400',
    approval_requested: 'border-purple-400',
    approval_granted: 'border-green-500',
    approval_rejected: 'border-red-400',
    round_complete: 'border-gray-300',
    intervention_required: 'border-amber-500',
    rule_check_failed: 'border-red-500',
}

// ── root component ─────────────────────────────────────────────────────────

const NegotiationSummary = () => {
    const params = useParams()
    const id = params?.id as string

    const { data: session, refetch: refetchSession } = useSession(id)
    const { data: constraints, refetch: refetchConstraints } = useConstraints(id)
    const { data: negotiations, refetch: refetchNegotiations } = useNegotiationsBySession(id)
    const { data: suppliers } = useSuppliers()
    const { data: nylasStatus, isLoading: isNylasLoading, isError: isNylasError } = useNylasStatus()
    const { data: rfq } = useRFQ(id)

    const pauseSession = usePauseSession()
    const resumeSession = useResumeSession()
    const cancelSession = useCancelSession()
    const closeSession = useCloseSession()
    const startNegotiating = useStartNegotiating()
    const startBAFO = useStartBAFO()

    const [liveEvents, setLiveEvents] = useState<NegotiationEvent[]>([])
    const [showEvents, setShowEvents] = useState(true)
    const [expandedNeg, setExpandedNeg] = useState<string | null>(null)
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [awardSupplier, setAwardSupplier] = useState('')
    const [showStartNegotiatingModal, setShowStartNegotiatingModal] = useState(false)

    useEffect(() => {
        if (!id) return
        const unsub = subscribeToSessionEvents(id, ev => {
            setLiveEvents(prev => [ev, ...prev].slice(0, 50))
            refetchSession()
            refetchNegotiations()
        })
        return unsub
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (!session) return null

    const supplierMap = new Map(suppliers?.map((s: Supplier) => [s.id, s]) ?? [])
    const isTerminal = ['cancelled', 'ended'].includes(session.status)
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

    // Backend returns { grant_id, status, provider } — field is "grant_id"
    const nylasConnected = Boolean(nylasStatus?.grant_id)

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            {/* ── Nylas connection banner ───────────────────────────────── */}
            {!isNylasLoading && !isNylasError && !nylasConnected && (
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
            {!isNylasLoading && isNylasError && (
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
                                    onClick={() => doSessionAction(startBAFO, id, 'BAFO phase started')}>
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
                            All active negotiations will be ended. You can optionally award a supplier.
                        </p>
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
                        <div className="flex gap-2 mt-4">
                            <Button className="bg-[#1A4A7A] flex-1" onClick={() => {
                                doSessionAction(closeSession, { id, awarded_supplier_id: awardSupplier || undefined, reason: 'Manual close' }, 'Session closed')
                                setShowCloseModal(false)
                            }}>
                                Confirm Close
                            </Button>
                            <Button variant="outline" onClick={() => setShowCloseModal(false)}>Cancel</Button>
                        </div>
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
                                    className="bg-[#1A4A7A] flex-1"
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

            {/* ── Constraints ──────────────────────────────────────────── */}
            {constraints && (
                <ConstraintsPanel sessionId={id} constraints={constraints} refetch={refetchConstraints} isTerminal={isTerminal} rfq={rfq} />
            )}
            {!constraints && session.status === 'awaiting_constraints' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3 text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    No constraints set. Set constraints to activate this session.
                </div>
            )}

            {session.status === 'active' && session.negotiation_phase === 'collection' && (
                <CollectionStatusPanel
                    session={session}
                    negotiations={negotiations ?? []}
                    supplierMap={supplierMap}
                    deadline={collectionDeadline}
                />
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

                        {isMultiItemRfq && (
                            <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <p className="text-[10px] font-semibold text-blue-600">Negotiation Scope</p>
                                    <span className="text-[11px] text-blue-700">Full comparison lives inside each supplier timeline</span>
                                </div>
                                <div className="space-y-2">
                                    {linePreview.map((item: any) => (
                                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/90 px-3 py-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item.line_number}. {item.item_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Qty {item.quantity ?? '—'}{item.unit ? ` ${item.unit}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-[11px]">
                                                {item.target_price_per_unit != null && (
                                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                                                        Target {fmt(item.target_price_per_unit)}
                                                    </span>
                                                )}
                                                {item.max_price_per_unit != null && (
                                                    <span className="rounded-full bg-red-50 px-2 py-1 text-red-700">
                                                        Max {fmt(item.max_price_per_unit)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {rfq.line_items.length > linePreview.length && (
                                        <p className="text-xs text-blue-700">
                                            +{rfq.line_items.length - linePreview.length} more items below
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <RFQLineItemsPanel sessionId={id} rfq={rfq} isTerminal={isTerminal} />
                </div>
            )}

            {/* ── Negotiations ─────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Suppliers
                        <span className="text-muted-foreground text-sm font-normal ml-1">{negotiations?.length ?? 0}</span>
                    </h3>
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

    const supplierState = (negotiation: Negotiation) => {
        const pending = negotiation.pending_counteroffer as Record<string, any> | null
        if (pending?.queued_quote) {
            return {
                label: 'Quote received',
                detail: 'Waiting for collection threshold or deadline',
                chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            }
        }
        if (negotiation.status === 'awaiting_clarification') {
            return {
                label: 'Clarification needed',
                detail: 'Supplier replied but needs manual routing',
                chip: 'bg-amber-50 text-amber-700 border-amber-200',
            }
        }
        return {
            label: 'Awaiting quote',
            detail: 'No priced quote received yet',
            chip: 'bg-gray-100 text-gray-600 border-gray-200',
        }
    }

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
                        const state = supplierState(negotiation)
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
                                        <p className="text-xs text-gray-500 mt-2">{state.detail}</p>
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
        { label: 'Early Close', value: constraints.early_close_enabled ? `Yes (${(constraints.early_close_threshold * 100).toFixed(0)}%)` : 'Off' },
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
                        <Button size="sm" className="bg-[#1A4A7A] h-7 text-xs" onClick={handleSave} disabled={updateConstraints.isPending}>
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
                        <p className={`font-bold text-sm capitalize ${accent ? 'text-[#1A4A7A]' : 'text-gray-800'}`}>{value}</p>
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
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Line Items ({rfq.line_items.length})</p>
                {!isTerminal && !editing && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 border border-gray-200" onClick={startEdit}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit Prices
                    </Button>
                )}
                {editing && (
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-[#1A4A7A] h-6 text-xs px-3" onClick={handleSave} disabled={updateLineItems.isPending}>
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

                    {/* AI message draft */}
                    {pending.message && (
                        <div className="bg-background/40 border border-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
                            <p className="text-[10px] text-muted-foreground mb-2">Message to Supplier</p>
                            <p className="text-[13px] text-foreground/90 whitespace-pre-wrap leading-relaxed font-light">{pending.message}</p>
                        </div>
                    )}

                    {/* Override fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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
                        <div>
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Override Reasoning (optional)</Label>
                            <Input
                                placeholder="Inject manual prompt"
                                value={overrideMsg} onChange={e => setOverrideMsg(e.target.value)}
                                className="h-9 text-[13px] bg-background/50 border-white/10 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-[11px]"
                            disabled={approveCounter.isPending}
                            onClick={() => do_(
                                () => approveCounter.mutateAsync({
                                    id: negotiation.id,
                                    data: {
                                        approved: true,
                                        override_message: overrideMsg || undefined,
                                        override_price: overridePrice ? parseFloat(overridePrice) : undefined,
                                        override_quantity: overrideQty ? parseInt(overrideQty) : undefined,
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
                    <Button size="sm" variant="outline" className="font-mono text-[11px] text-[#1A4A7A] border-[#1A4A7A]/30 hover:bg-[#1A4A7A]/10 hover:text-[#1A4A7A] gap-2"
                        onClick={() => do_(() => pauseNeg.mutateAsync({ id: negotiation.id }), 'Routine Paused')}>
                        <Pause className="h-3 w-3" /> Halt
                    </Button>
                )}
                {canResume && (
                    <Button size="sm" variant="outline" className="font-mono text-[11px] text-[#1A4A7A] border-[#1A4A7A]/30 hover:bg-[#1A4A7A]/10 hover:text-[#1A4A7A] gap-2"
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
