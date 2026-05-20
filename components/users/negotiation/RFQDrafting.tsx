"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    useAiEnhanceRFQ, useCreateRFQ, useRFQ, useSession, useSubmitRFQContext,
    useUpdateRFQDraft, useApproveRFQ, useRFQPreviewPDFUrl,
} from '@/services/requests/negotiation'
import { Sparkles, Send, Loader2, CheckCircle2, RefreshCw, Download, Eye, ArrowRight, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'


const RFQ_STATUS_META: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
    awaiting_context: { label: 'Needs Context', color: 'bg-amber-100 text-amber-700' },
    ready_to_draft: { label: 'AI Drafting…', color: 'bg-blue-100 text-blue-700' },
    awaiting_approval: { label: 'Ready to Send', color: 'bg-purple-100 text-purple-700' },
    sent: { label: 'Sent', color: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', color: 'bg-gray-200 text-gray-500' },
}

const escapeHtml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')

const plainTextToHtml = (value: string) => {
    if (!value.trim()) return '<p></p>'
    return `<p>${escapeHtml(value).replace(/\n/g, '<br />')}</p>`
}

const htmlToPlainText = (value: string) =>
    value
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\s{2,}/g, ' ')
        .trim()

const hasOriginalAttachment = (draftEmail: any) =>
    Boolean(draftEmail?.original_filename || draftEmail?.original_s3_key || draftEmail?.original_file_b64)

const getCoverEmailHtml = (draftEmail: any) => {
    if (!draftEmail) return '<p></p>'

    const template = draftEmail.body_html || draftEmail.user_html || draftEmail.body || ''

    if (!template) return '<p></p>'
    if (/<[a-z][\s\S]*>/i.test(template)) return template
    return plainTextToHtml(template)
}

export default function RFQDrafting({ sessionId }: { sessionId: string }) {
    const { data: rfq, isLoading: loadingRfq, refetch } = useRFQ(sessionId)
    const { data: session } = useSession(sessionId)
    const createRfq = useCreateRFQ()
    const enhanceRfq = useAiEnhanceRFQ()
    const submitContext = useSubmitRFQContext()
    const updateDraft = useUpdateRFQDraft()
    const approveRfq = useApproveRFQ()
    const {
        data: sentPdfUrl,
        isLoading: sentPdfLoading,
        error: sentPdfError,
        refetch: refetchSentPdf,
    } = useRFQPreviewPDFUrl(sessionId, rfq?.status === 'sent')

    // RFQ creation form
    const [itemName, setItemName] = useState('')
    const [description, setDescription] = useState('')
    const [quantity, setQuantity] = useState('')
    const [targetPrice, setTargetPrice] = useState('')
    const [deadline, setDeadline] = useState('')
    const [responseDeadline, setResponseDeadline] = useState('')

    // AI context answers (dynamic fields)
    const [contextAnswers, setContextAnswers] = useState<Record<string, string>>({})

    const [showDraftData, setShowDraftData] = useState(false)

    // Poll for ready_to_draft → awaiting_approval transition
    useEffect(() => {
        if (rfq?.status !== 'ready_to_draft') return
        const interval = setInterval(() => refetch(), 4000)
        return () => clearInterval(interval)
    }, [rfq?.status])

    // ── Handlers ─────────────────────────────────────────────────────────

    const handleAIEnhance = async () => {
        if (!itemName) return toast.error('Enter an item name first')
        try {
            const res = await enhanceRfq.mutateAsync({ item_name: itemName, description })
            toast.success('AI enhanced — creating RFQ with suggestions')
            await createRfq.mutateAsync({
                sessionId,
                data: {
                    item_name: itemName,
                    description,
                    quantity: res?.suggested_rfq?.target_quantity || (quantity ? parseInt(quantity) : undefined),
                    target_price: res?.suggested_rfq?.target_price || (targetPrice ? parseFloat(targetPrice) : undefined),
                    deadline: deadline || undefined,
                    response_deadline: responseDeadline || undefined,
                },
            })
            refetch()
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to generate RFQ')
        }
    }

    const handleCreateManual = async () => {
        if (!itemName) return toast.error('Item name is required')
        try {
            await createRfq.mutateAsync({
                sessionId,
                data: {
                    item_name: itemName,
                    description: description || undefined,
                    quantity: quantity ? parseInt(quantity) : undefined,
                    target_price: targetPrice ? parseFloat(targetPrice) : undefined,
                    deadline: deadline || undefined,
                    response_deadline: responseDeadline || undefined,
                },
            })
            refetch()
            toast.success('RFQ created')
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to create RFQ')
        }
    }

    const handleSubmitContext = async () => {
        const required = rfq?.ai_questions?.filter(q => q.required) || []
        const missing = required.filter(q => !contextAnswers[q.key])
        if (missing.length > 0) {
            return toast.error(`Please answer: ${missing.map(q => q.label).join(', ')}`)
        }
        try {
            await submitContext.mutateAsync({ sessionId, answers: contextAnswers })
            toast.success('Context submitted — AI is drafting the email')
            refetch()
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to submit context')
        }
    }

    const handleSend = async () => {
        try {
            await approveRfq.mutateAsync(sessionId)
            toast.success('RFQ sent to all suppliers!')
            refetch()
        } catch (e: any) {
            toast.error(e?.response?.data?.message || e?.response?.data?.detail || 'Failed to send RFQ')
        }
    }

    if (loadingRfq) return null

    const statusMeta = rfq ? RFQ_STATUS_META[rfq.status] : null

    // ── Session was started but never finished setup — resume the wizard ──
    // A session in awaiting_constraints with no RFQ on the backend means the
    // user backed out of the new-session wizard before step 3 (Activate).
    // The RFQ they "uploaded" was only in browser state and was lost — show a
    // clear path back into the wizard instead of an empty RFQ-creation form
    // that would imply they need to start over from scratch.
    if (!rfq && session?.status === 'awaiting_constraints') {
        return (
            <div className="bg-white p-6 rounded-lg mb-6 border border-amber-200 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-semibold text-gray-900">Finish setting up this session</h2>
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs">Setup incomplete</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            This session was created, but the RFQ and negotiation parameters weren't saved. Pick up where you left off — you'll re-attach your RFQ document and confirm your targets and constraints.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            If you uploaded an RFQ file in the previous step, please re-attach it. File uploads from the previous attempt weren't kept.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href={`/user/negotiation/new?session=${sessionId}`}>
                                <Button className="bg-primary hover:bg-primary-hover text-white gap-1.5">
                                    Resume Setup
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                            <Link href="/user/negotiation">
                                <Button variant="outline">Back to sessions</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── No RFQ yet — creation form ─────────────────────────────────────
    if (!rfq) {
        return (
            <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl font-bold text-gray-900">Create RFQ Email</h2>
                    <Badge className="bg-gray-100 text-gray-500 text-xs">Not started</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                    Describe what you need — the AI will inspect your inputs, ask follow-up questions if needed, and draft a professional RFQ email to send to your suppliers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div className="md:col-span-2">
                        <Label>Target Item <span className="text-red-500">*</span></Label>
                        <Input
                            value={itemName}
                            onChange={e => setItemName(e.target.value)}
                            placeholder="e.g. Cold Rolled Steel Coils — Grade SS304"
                            className="mt-1"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description & Specifications</Label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Thickness, dimensions, finish, quality certifications, delivery requirements…"
                            rows={3}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                    </div>
                    <div>
                        <Label>Quantity</Label>
                        <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1000" className="mt-1" />
                    </div>
                    <div>
                        <Label>Target Price (per unit)</Label>
                        <Input type="number" step="0.01" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="80.00" className="mt-1" />
                    </div>
                    <div>
                        <Label>Delivery Deadline</Label>
                        <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                        <Label>Response Deadline</Label>
                        <Input type="datetime-local" value={responseDeadline} onChange={e => setResponseDeadline(e.target.value)} className="mt-1" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                    <Button
                        onClick={handleAIEnhance}
                        disabled={enhanceRfq.isPending || createRfq.isPending || !itemName}
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                        {enhanceRfq.isPending || createRfq.isPending
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Sparkles className="h-4 w-4" />}
                        Generate with AI
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleCreateManual}
                        disabled={createRfq.isPending || !itemName}
                        className="gap-2"
                    >
                        {createRfq.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Draft Manually
                    </Button>
                </div>
            </div>
        )
    }

    // ── awaiting_context — AI needs answers ────────────────────────────
    if (rfq.status === 'awaiting_context' && rfq.ai_questions) {
        return (
            <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">RFQ — Context Needed</h2>
                    {statusMeta && <Badge className={statusMeta.color}>{statusMeta.label}</Badge>}
                </div>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 text-sm text-amber-800">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">The AI needs more information to write a great RFQ</p>
                        <p className="text-amber-700 mt-0.5">Answer the questions below so the AI can generate a precise, professional email tailored to your procurement.</p>
                    </div>
                </div>

                <div className="space-y-4 max-w-2xl">
                    {rfq.ai_questions.map(q => (
                        <div key={q.key}>
                            <Label className="text-sm font-medium">
                                {q.label}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {q.type === 'select' ? (
                                <select
                                    value={contextAnswers[q.key] || ''}
                                    onChange={e => setContextAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Select an option…</option>
                                </select>
                            ) : (
                                <Input
                                    value={contextAnswers[q.key] || ''}
                                    onChange={e => setContextAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                                    placeholder={`Answer for: ${q.label}`}
                                    className="mt-1"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    onClick={handleSubmitContext}
                    disabled={submitContext.isPending}
                    className="mt-5 bg-primary hover:bg-primary/90 gap-2"
                >
                    {submitContext.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Submit Answers → Draft Email
                </Button>
            </div>
        )
    }

    // ── ready_to_draft — AI is working ─────────────────────────────────
    if (rfq.status === 'ready_to_draft') {
        return (
            <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">RFQ — Generating Draft</h2>
                    {statusMeta && <Badge className={statusMeta.color}>{statusMeta.label}</Badge>}
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-5 text-blue-800">
                    <div className="relative">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <Sparkles className="h-3 w-3 text-blue-400 absolute -top-0.5 -right-0.5" />
                    </div>
                    <div>
                        <p className="font-semibold">AI is drafting your RFQ email…</p>
                        <p className="text-sm text-blue-600 mt-0.5">
                            This usually takes 10–30 seconds. The page will refresh automatically when the draft is ready.
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                    Checking every 4 seconds for draft completion…
                </p>
            </div>
        )
    }

    // ── awaiting_approval — PDF preview ───────────────────────────────
    if (rfq.status === 'awaiting_approval' && rfq.draft_email) {
        return (
            <RFQApprovalPanel
                sessionId={sessionId}
                rfq={rfq}
                statusMeta={statusMeta}
                onSend={handleSend}
                approveRfq={approveRfq}
                updateDraft={updateDraft}
            />
        )
    }

    // ── sent ────────────────────────────────────────────────────────────
    if (rfq.status === 'sent') {
        return (
            <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">RFQ</h2>
                    {statusMeta && <Badge className={statusMeta.color}>{statusMeta.label}</Badge>}
                </div>
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    <div>
                        <p className="font-semibold">RFQ sent to all suppliers</p>
                        {rfq.sent_at && (
                            <p className="text-sm text-green-600 mt-0.5">
                                Sent {new Date(rfq.sent_at).toLocaleString()}
                            </p>
                        )}
                        <p className="text-sm text-green-700 mt-1">
                            Waiting for supplier responses. The AI pipeline will automatically classify and process inbound emails.
                        </p>
                    </div>
                </div>

                {/* View sent draft */}
                {rfq.draft_email && (
                    <div className="mt-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowDraftData(v => !v)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                {showDraftData ? 'Hide sent email' : 'View sent email'}
                            </button>
                            {sentPdfUrl && (
                                <>
                                    <a
                                        href={sentPdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        Open sent PDF
                                    </a>
                                    <a
                                        href={sentPdfUrl}
                                        download="RFQ-sent.pdf"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download PDF
                                    </a>
                                </>
                            )}
                            {sentPdfLoading && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Generating sent PDF…
                                </span>
                            )}
                            {sentPdfError && (
                                <button
                                    onClick={() => refetchSentPdf()}
                                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Retry PDF preview
                                </button>
                            )}
                        </div>
                        {showDraftData && (
                            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                                    <p className="text-sm font-medium text-gray-700">{rfq.draft_email.subject}</p>
                                </div>
                                <div
                                    className="p-4 prose prose-sm max-w-none text-sm text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: getCoverEmailHtml(rfq.draft_email) }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return null
}

// ── PDF approval panel ──────────────────────────────────────────────────────

function RFQApprovalPanel({ sessionId, rfq, statusMeta, onSend, approveRfq, updateDraft }: {
    sessionId: string
    rfq: any
    statusMeta: any
    onSend: () => void
    approveRfq: any
    updateDraft: any
}) {
    const filename = rfq.draft_email?.original_filename ?? null
    const initialSubject = rfq.draft_email?.subject ?? ''
    // Resolve the initial cover-body. Prefer the explicit cover_body field; for
    // legacy drafts that only have the full body_html, derive a sensible default
    // by taking the plain-text body up to the first blank line followed by an
    // ALL-CAPS section header (or fall back to the full body).
    const deriveCoverFromLegacyBody = (draftEmail: any): string => {
        const explicit = (draftEmail?.cover_body ?? '').trim()
        if (explicit) return explicit
        const plain: string = (draftEmail?.body ?? '').toString()
        if (!plain) return ''
        // Cut at the first line that looks like a section header
        // ("Requirements:", "Items:", "Specifications:", "Please include…", etc.)
        const lines = plain.split('\n')
        const cutIdx = lines.findIndex(line =>
            /^(items?|requirements?|specifications?|please include|commercial|payment|delivery)\s*[:\-]/i.test(line.trim()),
        )
        if (cutIdx > 2) return lines.slice(0, cutIdx).join('\n').trim()
        return plain
    }
    const initialCoverBody = deriveCoverFromLegacyBody(rfq.draft_email)

    // Editable structured-term fields sourced from draft_data.
    const initialDraftData = rfq.draft_email?.draft_data ?? {}
    const initialDeliveryDate = initialDraftData.delivery_date ?? ''
    const initialDeliveryLocation = initialDraftData.delivery_location ?? ''
    const initialPaymentTerms = initialDraftData.payment_terms ?? ''
    const initialResponseDeadline = initialDraftData.response_deadline ?? ''

    const [subject, setSubject] = useState(initialSubject)
    const [coverBody, setCoverBody] = useState(initialCoverBody)
    const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate)
    const [deliveryLocation, setDeliveryLocation] = useState(initialDeliveryLocation)
    const [paymentTerms, setPaymentTerms] = useState(initialPaymentTerms)
    const [responseDeadline, setResponseDeadline] = useState(initialResponseDeadline)

    useEffect(() => {
        setSubject(initialSubject)
        setCoverBody(initialCoverBody)
        setDeliveryDate(initialDeliveryDate)
        setDeliveryLocation(initialDeliveryLocation)
        setPaymentTerms(initialPaymentTerms)
        setResponseDeadline(initialResponseDeadline)
    }, [rfq.draft_email])

    const termsDirty =
        deliveryDate !== initialDeliveryDate ||
        deliveryLocation !== initialDeliveryLocation ||
        paymentTerms !== initialPaymentTerms ||
        responseDeadline !== initialResponseDeadline

    const isDirty = subject !== initialSubject || coverBody !== initialCoverBody || termsDirty

    const persistDraft = async (silent = false) => {
        const trimmedSubject = subject.trim()
        const trimmedCover = coverBody.trim()
        if (!trimmedSubject) {
            toast.error('Email subject is required')
            throw new Error('missing_subject')
        }
        if (!trimmedCover) {
            toast.error('Cover note is required')
            throw new Error('missing_cover')
        }

        const payload: Record<string, any> = {
            subject: trimmedSubject,
            body: trimmedCover,
            cover_body: trimmedCover,
        }

        // Merge edited terms back into draft_data so the structured section stays in sync.
        if (termsDirty) {
            payload.draft_data = {
                ...initialDraftData,
                ...(deliveryDate.trim() ? { delivery_date: deliveryDate.trim() } : {}),
                ...(deliveryLocation.trim() ? { delivery_location: deliveryLocation.trim() } : {}),
                ...(paymentTerms.trim() ? { payment_terms: paymentTerms.trim() } : {}),
                ...(responseDeadline.trim() ? { response_deadline: responseDeadline.trim() } : {}),
            }
        }

        await updateDraft.mutateAsync({ sessionId, data: payload })
        if (!silent) {
            toast.success('Draft saved')
        }
    }

    const handleApproveAndSend = async () => {
        try {
            if (isDirty) {
                await persistDraft(true)
            }
            await onSend()
        } catch {
            return
        }
    }

    return (
        <div className="bg-white rounded-lg mb-6 border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">RFQ Draft</h2>
                    {statusMeta && <Badge className={statusMeta.color}>{statusMeta.label}</Badge>}
                </div>
                <Button
                    onClick={handleApproveAndSend}
                    disabled={approveRfq.isPending || updateDraft.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                    size="sm"
                >
                    {approveRfq.isPending || updateDraft.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Approve & Send
                </Button>
            </div>
            <div className="px-6 py-5 space-y-5">
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    <p className="font-medium">Cover note is editable. RFQ details below are locked and come from your RFQ.</p>
                    <p className="mt-1 text-blue-800">
                        {filename
                            ? <>Your branded RFQ document <span className="font-medium">{filename}</span> stays attached separately.</>
                            : <>A generated RFQ PDF is attached for the supplier.</>}
                    </p>
                </div>

                <div>
                    <Label htmlFor="rfq-email-subject">Email Subject</Label>
                    <Input
                        id="rfq-email-subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Request for Quotation"
                        className="mt-2"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                            <Label>Cover Note</Label>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Short personal note that appears at the top of the supplier email — greeting, intent, deadline reminder, sign-off.
                                Keep it brief; specifications and terms render below automatically.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => persistDraft()}
                            disabled={!isDirty || updateDraft.isPending || approveRfq.isPending}
                        >
                            {updateDraft.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Save
                        </Button>
                    </div>
                    <textarea
                        value={coverBody}
                        onChange={e => setCoverBody(e.target.value)}
                        rows={8}
                        placeholder={"Dear [SUPPLIER_NAME],\n\nWe're sourcing [item]. Full RFQ details are below.\n\nPlease submit your quotation by [date].\n\nWarm regards,\nProcurement Team"}
                        className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm leading-relaxed font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                        Use <span className="font-mono">[SUPPLIER_NAME]</span> as a placeholder — it's filled in per supplier when sent.
                    </p>
                </div>

                {/* Editable commercial terms — these update the structured block so buyer overrides are persisted */}
                {initialDraftData && Object.keys(initialDraftData).length > 0 && (
                    <div>
                        <div className="mb-2">
                            <Label>Commercial Terms</Label>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Override the AI-suggested terms here — these update the structured section the supplier sees.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Timeline</label>
                                <Input
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                    placeholder="e.g. 21 working days from LPO"
                                    className="bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Location</label>
                                <Input
                                    value={deliveryLocation}
                                    onChange={e => setDeliveryLocation(e.target.value)}
                                    placeholder="e.g. Apapa, Lagos"
                                    className="bg-white text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
                                <Input
                                    value={paymentTerms}
                                    onChange={e => setPaymentTerms(e.target.value)}
                                    placeholder="e.g. 40% advance on LPO, 60% within 30 days of delivery"
                                    className="bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Response Deadline</label>
                                <Input
                                    value={responseDeadline}
                                    onChange={e => setResponseDeadline(e.target.value)}
                                    placeholder="e.g. 5 business days"
                                    className="bg-white text-sm"
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-amber-700 mt-1">Changes here update the structured RFQ block — hit Save above to apply.</p>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                            <Label className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                                    Preview
                                </span>
                                Email preview
                            </Label>
                            <p className="text-xs text-gray-500 mt-0.5">
                                This is what the supplier will receive. The cover note at the top is whatever you write above; the structured RFQ section below is rendered from your RFQ data.
                            </p>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">Subject:</span> {subject || initialSubject || '(no subject)'}
                        </div>
                        <div
                            className="p-4 prose prose-sm max-w-none text-sm bg-white"
                            dangerouslySetInnerHTML={{ __html: structuredPreviewHtml }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
