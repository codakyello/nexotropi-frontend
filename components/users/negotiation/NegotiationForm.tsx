"use client"
import React, { useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Check, Users, Settings2, FileText, Loader2, ChevronRight,
    AlertTriangle, CheckCircle, HelpCircle, Upload, Pencil, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    useSuppliers, useCreateSession, useSetConstraints,
    useCreateRFQ, useExtractRFQFile, useExtractBrief,
    Supplier, ExtractedField, RFQExtractionResult, RFQLineItemCreate, BriefParameter, NegotiationBrief, SpecRequirement,
} from '@/services/requests/negotiation'
import { NegotiationBriefCard } from './NegotiationBriefCard'
import { getApiError } from '@/lib/utils'

// ── Default brief — always shown, AI fills in values after extraction ─────────

const DEFAULT_BRIEF: NegotiationBrief = {
    parameters: [
        {
            key: 'unit_price', label: 'Target Price', tier: 'flexible',
            extracted_value: null, target_value: null, boundary_value: null,
            unit: 'per unit', alternatives: null,
            leverage_rule: 'If supplier meets all qualitative requirements, push for a further price reduction.',
            confidence: 1.0,
        },
        {
            key: 'quantity', label: 'Quantity', tier: 'flexible',
            extracted_value: null, target_value: null, boundary_value: null,
            unit: 'units', alternatives: null,
            leverage_rule: 'If supplier cannot supply the full quantity, negotiate a volume discount on the reduced amount.',
            confidence: 1.0,
        },
    ],
    procurement_type: 'general',
    summary: null,
}

// ── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: 'Setup', icon: Users },
    { id: 2, label: 'Your RFQ', icon: FileText },
    { id: 3, label: 'Confirm & Parameters', icon: Settings2 },
]

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-3 mb-8">
            {STEPS.map((s, i) => {
                const done = current > s.id
                const active = current === s.id
                return (
                    <React.Fragment key={s.id}>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                ${done ? 'bg-green-500 text-white' : active ? 'bg-[#1A4A7A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {done ? <Check className="h-4 w-4" /> : s.id}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block ${active ? 'text-[#1A4A7A]' : done ? 'text-green-600' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 max-w-12 ${current > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

// ── Keys covered by numeric Brief cards — excluded from qualitative specs display ──
// Only price and quantity are truly private numeric targets.
// Delivery and payment terms are in the RFQ (suppliers see them) — handled as qualitative specs.
const BRIEF_FIELD_KEYS = new Set(['unit_price', 'quantity'])

// ── Extracted field row ─────────────────────────────────────────────────────

const TIER_BADGE: Record<'hard' | 'flexible', { label: string; className: string }> = {
    hard:     { label: 'Hard',     className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
    flexible: { label: 'Flexible', className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
}

function FieldRow({
    field,
    tier,
    onTierChange,
    onChange,
}: {
    field: ExtractedField
    tier: 'hard' | 'flexible'
    onTierChange: (key: string, tier: 'hard' | 'flexible') => void
    onChange: (key: string, value: string) => void
}) {
    const confidence = field.found ? field.confidence : 0
    const icon = !field.found
        ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        : confidence >= 0.8
            ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            : <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />

    const badge = TIER_BADGE[tier]
    const nextTier = tier === 'hard' ? 'flexible' : 'hard'

    return (
        <div className="grid grid-cols-[1fr_auto_1.5fr] items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-2">
                {icon}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-800">{field.label}</p>
                        <button
                            type="button"
                            onClick={() => onTierChange(field.key, nextTier)}
                            title={tier === 'hard' ? 'AI escalates if supplier cannot meet this' : 'AI can accept a deviation here'}
                            className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 transition-colors whitespace-nowrap ${badge.className}`}
                        >
                            {badge.label}
                        </button>
                    </div>
                    {!field.found && field.expected && (
                        <p className="text-xs text-amber-600 mt-0.5">Not found in document</p>
                    )}
                    {field.found && confidence < 0.8 && (
                        <p className="text-xs text-amber-500 mt-0.5">Low confidence — please verify</p>
                    )}
                </div>
            </div>
            <div className="text-xs text-gray-400 pt-1">{field.unit ?? ''}</div>
            <Input
                value={field.value ?? ''}
                onChange={e => onChange(field.key, e.target.value)}
                placeholder={field.found ? 'Edit extracted value…' : 'Enter value…'}
                className={`text-sm h-8 ${!field.found ? 'border-amber-300 focus-visible:ring-amber-400' : ''}`}
            />
        </div>
    )
}

// ── Main component ──────────────────────────────────────────────────────────

const NegotiationForm = () => {
    const router = useRouter()
    const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers()
    const createSession = useCreateSession()
    const createRFQ = useCreateRFQ()
    const setConstraints = useSetConstraints()
    const extractRFQFile = useExtractRFQFile()
    const extractBrief = useExtractBrief()

    const [step, setStep] = useState(1)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Step 1 ──────────────────────────────────────────────────────────────
    const [title, setTitle] = useState('')
    const [minResponses, setMinResponses] = useState(1)
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

    // ── Step 2 ──────────────────────────────────────────────────────────────
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadedText, setUploadedText] = useState('')

    // ── Step 3 — extracted fields (Section A) ──────────────────────────────
    const [extraction, setExtraction] = useState<RFQExtractionResult | null>(null)
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
    // Tier per qualitative spec (hard | flexible) — defaults to 'flexible'
    const [specTiers, setSpecTiers] = useState<Record<string, 'hard' | 'flexible'>>({})
    // Multi-item line items (populated from extraction when AI detects multiple products)
    const [lineItems, setLineItems] = useState<RFQLineItemCreate[]>([])

    // ── Step 3 — Negotiation Brief (the 4 numeric negotiation parameters) ──
    // Always shown with 4 empty cards. AI fills values after extraction.
    const [brief, setBrief] = useState<NegotiationBrief>(DEFAULT_BRIEF)

    // ── Step 3 — strategy settings ──────────────────────────────────────────
    const [currency, setCurrency] = useState('USD')
    const [maxRounds, setMaxRounds] = useState(5)
    const [strategy, setStrategy] = useState('balanced')
    const [approvalMode, setApprovalMode] = useState('auto')
    const [allowCounterOffers, setAllowCounterOffers] = useState(true)
    const [allowPartialQuantity, setAllowPartialQuantity] = useState(false)
    const [autoAcceptThreshold, setAutoAcceptThreshold] = useState('')
    const [earlyCloseEnabled, setEarlyCloseEnabled] = useState(false)
    const [earlyCloseThreshold, setEarlyCloseThreshold] = useState('0.02')
    const [timeoutHours, setTimeoutHours] = useState(48)
    const [lateSubmissionPolicy, setLateSubmissionPolicy] = useState<'notify_buyer' | 'auto_reject'>('notify_buyer')

    const toggleSupplier = (id: string) =>
        setSelectedSuppliers(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

    const updateFieldValue = (key: string, value: string) =>
        setFieldValues(prev => ({ ...prev, [key]: value }))

    const updateSpecTier = (key: string, tier: 'hard' | 'flexible') =>
        setSpecTiers(prev => ({ ...prev, [key]: tier }))

    // ── Step 1 → 2: create session ─────────────────────────────────────────
    const handleContinueToStep2 = async () => {
        if (!title.trim()) return toast.error('Session name is required')
        if (selectedSuppliers.length === 0) return toast.error('Select at least one supplier')
        try {
            const session = await createSession.mutateAsync({
                title,
                initiator_type: 'buyer',
                min_responses_required: minResponses,
                supplier_ids: selectedSuppliers,
            })
            setSessionId(session.id)
            setStep(2)
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to create session'))
        }
    }

    // ── Handle file upload ────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
            toast.error('Please upload a PDF, DOCX, or TXT file')
            return
        }
        setUploadedFile(file)
        if (file.type === 'text/plain') {
            const reader = new FileReader()
            reader.onload = e => setUploadedText((e.target?.result as string) || '')
            reader.readAsText(file)
        } else {
            setUploadedText(`[File: ${file.name}]`)
        }
    }

    // ── Step 2 → 3: extract fields ─────────────────────────────────────────
    const handleContinueToStep3 = async () => {
        if (!sessionId) return

        if (!uploadedFile) return toast.error('Please upload a file first')

        try {
            const result = await extractRFQFile.mutateAsync({ sessionId, file: uploadedFile })
            // Store extracted text so we can pass it to createRFQ in the next step
            // (the backend extracted the text; we use fields to reconstruct a summary)
            const fieldSummary = result.fields
                .filter(f => f.found && f.value != null)
                .map(f => `${f.label}: ${f.value}${f.unit ? ' ' + f.unit : ''}`)
                .join('\n')
            const lineItemSummary = result.line_items.length > 0
                ? '\n\nItems:\n' + result.line_items.map(li =>
                    `${li.line_number}. ${li.item_name}${li.quantity ? ' — Qty: ' + li.quantity : ''}${li.unit ? ' ' + li.unit : ''}`
                ).join('\n')
                : ''
            setUploadedText(fieldSummary + lineItemSummary || `[Uploaded file: ${uploadedFile.name}]`)

            setExtraction(result)
            // Seed fieldValues from extracted values (for the Procurement Requirements display)
            const initial: Record<string, string> = {}
            result.fields.forEach(f => {
                if (f.value !== null && f.value !== undefined) {
                    initial[f.key] = String(f.value)
                }
            })
            setFieldValues(initial)
            // Default all qualitative spec tiers to 'flexible'
            const initialTiers: Record<string, 'hard' | 'flexible'> = {}
            result.fields.filter(f => !BRIEF_FIELD_KEYS.has(f.key)).forEach(f => {
                initialTiers[f.key] = 'flexible'
            })
            setSpecTiers(initialTiers)
            // Seed line items from extraction (multi-item RFQs)
            if (result.line_items && result.line_items.length > 0) {
                setLineItems(result.line_items.map((li, idx) => ({
                    line_number: li.line_number ?? idx + 1,
                    item_name: li.item_name,
                    description: li.description ?? null,
                    specification: li.specification ?? null,
                    quantity: li.quantity ?? null,
                    unit: li.unit ?? null,
                    target_price_per_unit: null,
                    max_price_per_unit: null,
                })))
            } else {
                setLineItems([])
            }

            // Extract negotiation brief — non-blocking. Merges AI tier+leverage into
            // the default brief cards (which are always shown with empty values).
            if (sessionId) {
                extractBrief.mutateAsync({ sessionId, extractionResult: result })
                    .then(aiBreef => {
                        // Merge AI tier + leverage into our 2-param Brief (unit_price, quantity).
                        // Delivery and payment are now qualitative specs — ignore those AI params.
                        setBrief(prev => ({
                            ...prev,
                            procurement_type: aiBreef.procurement_type,
                            parameters: prev.parameters.map(prevParam => {
                                const aiParam = aiBreef.parameters.find(p => p.key === prevParam.key)
                                if (!aiParam) return prevParam
                                return {
                                    ...prevParam,
                                    tier: aiParam.tier,
                                    leverage_rule: aiParam.leverage_rule ?? prevParam.leverage_rule,
                                    extracted_value: aiParam.extracted_value,
                                    // Preserve user edits; fall back to AI pre-filled values
                                    target_value: prevParam.target_value ?? aiParam.target_value,
                                    boundary_value: prevParam.boundary_value ?? aiParam.boundary_value,
                                }
                            }),
                        }))
                    })
                    .catch(() => { /* AI failed — user fills manually, default cards already shown */ })
            }

            setStep(3)
        } catch (err: any) {
            const status = err?.response?.status

            if (status === 422 || status === 400) {
                // File could not be read — hard block, user must fix the file or switch to Write tab
                toast.error(getApiError(err))
                return
            }

            // AI extraction failed (5xx, timeout, etc.) — non-blocking, proceed with empty fields
            toast.warning(getApiError(err, 'AI extraction failed — you can fill in the fields manually'))
            setExtraction({ is_rfq: true, is_rfq_confidence: 0.5, procurement_type: 'other', fields: [], line_items: [], warning: null })
            setFieldValues({})
            setLineItems([])
            setStep(3)
        }
    }

    // ── Step 3: create RFQ + set constraints → activate ────────────────────
    const isMultiItem = lineItems.length > 0

    // ── Brief helpers — extract values from the 4 brief cards ────────────────
    const briefParam = (key: string) => brief.parameters.find(p => p.key === key)
    const briefVal = (key: string, field: 'target_value' | 'boundary_value') => {
        const v = briefParam(key)?.[field]
        return v ? parseFloat(v) : undefined
    }
    const briefInt = (key: string, field: 'target_value' | 'boundary_value') => {
        const v = briefParam(key)?.[field]
        return v ? parseInt(v) : undefined
    }

    const handleActivate = async () => {
        if (!sessionId) return

        // Single-item: require price target + ceiling from brief cards
        if (!isMultiItem) {
            const priceTarget = briefParam('unit_price')?.target_value
            const priceCeiling = briefParam('unit_price')?.boundary_value
            if (!priceTarget || !priceCeiling) {
                return toast.error('Enter your target price and max price ceiling in the Negotiation Brief above')
            }
        }

        const extractedSourceText = uploadedText || "[Uploaded file]"

        // Convert uploaded file to base64 so backend can attach the original
        let originalFileB64: string | undefined
        let originalFilename: string | undefined
        if (uploadedFile && uploadedFile.type !== 'text/plain') {
            try {
                originalFileB64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = e => {
                        const result = e.target?.result as string
                        // strip "data:...;base64," prefix
                        resolve(result.split(',')[1])
                    }
                    reader.onerror = reject
                    reader.readAsDataURL(uploadedFile)
                })
                originalFilename = uploadedFile.name
            } catch {
                // non-fatal — fall back to generated PDF
            }
        }

        try {
            // 1. Create RFQ — skip if one already exists (idempotent retry)
            try {
                await createRFQ.mutateAsync({
                    sessionId,
                    data: {
                        item_name: title,
                        content: extractedSourceText,
                        line_items: isMultiItem ? lineItems : undefined,
                        original_file_b64: originalFileB64,
                        original_filename: originalFilename,
                    },
                })
            } catch (rfqErr: any) {
                if (rfqErr?.response?.status !== 409) throw rfqErr
            }

            // Build qualitative spec requirements from fieldValues + tiers (exclude Brief card keys)
            const specRequirements: SpecRequirement[] = (extraction?.fields ?? [])
                .filter(f => !BRIEF_FIELD_KEYS.has(f.key))
                .map(f => ({
                    key: f.key,
                    label: f.label,
                    value: fieldValues[f.key] ?? (f.value != null ? String(f.value) : null),
                    tier: specTiers[f.key] ?? 'flexible',
                }))
                .filter(s => s.value && String(s.value).trim() !== '')

            // 2. Set constraints — skip if already set (idempotent retry)
            try {
                await setConstraints.mutateAsync({
                    sessionId,
                    data: {
                        // Single-item: price and quantity from Brief cards (private numeric targets)
                        max_price:    !isMultiItem ? briefVal('unit_price', 'boundary_value') : undefined,
                        target_price: !isMultiItem ? briefVal('unit_price', 'target_value')   : undefined,
                        quantity:     !isMultiItem ? briefInt('quantity', 'target_value')      : undefined,
                        min_quantity: !isMultiItem ? briefInt('quantity', 'boundary_value')    : undefined,
                        allow_partial_quantity: isMultiItem ? allowPartialQuantity : false,
                        // Delivery and payment are qualitative specs — no longer numeric Brief fields
                        // Multi-item: total budget ceiling only
                        total_budget_ceiling: isMultiItem && autoAcceptThreshold ? parseFloat(autoAcceptThreshold) : undefined,
                        currency,
                        max_rounds: maxRounds,
                        strategy,
                        approval_mode: approvalMode,
                        allow_counter_offers: allowCounterOffers,
                        auto_accept_threshold: !isMultiItem && autoAcceptThreshold ? parseFloat(autoAcceptThreshold) : undefined,
                        early_close_enabled: earlyCloseEnabled,
                        early_close_threshold: parseFloat(earlyCloseThreshold) || 0.02,
                        supplier_timeout_hours: timeoutHours,
                        late_submission_policy: lateSubmissionPolicy,
                        brief: {
                            ...brief,
                            spec_requirements: specRequirements.length > 0 ? specRequirements : undefined,
                        },
                    },
                })
            } catch (cErr: any) {
                if (cErr?.response?.status !== 409) throw cErr
                // 409 = constraints already set (session already active) — just navigate
            }

            toast.success('Session activated!')
            router.push(`/user/negotiation/${sessionId}`)
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to activate session'))
        }
    }

    const updateLineItem = (idx: number, field: keyof RFQLineItemCreate, value: any) =>
        setLineItems(prev => prev.map((li, i) => i === idx ? { ...li, [field]: value } : li))

    const addLineItem = () =>
        setLineItems(prev => [...prev, {
            line_number: prev.length + 1,
            item_name: '',
            description: null,
            specification: null,
            quantity: null,
            unit: null,
            target_price_per_unit: null,
            max_price_per_unit: null,
        }])

    const removeLineItem = (idx: number) =>
        setLineItems(prev => prev.filter((_, i) => i !== idx).map((li, i) => ({ ...li, line_number: i + 1 })))

    const isPending = createSession.isPending
    const isExtracting = extractRFQFile.isPending
    const isExtractingBrief = extractBrief.isPending
    const isActivating = createRFQ.isPending || setConstraints.isPending

    // ── Inline validation errors ─────────────────────────────────────────────
    const errors = useMemo(() => {
        const e: Record<string, string> = {}

        if (!isMultiItem) {
            // Validate price Brief card (unit_price only — the private numeric target)
            const priceTarget  = briefParam('unit_price')?.target_value
            const priceCeiling = briefParam('unit_price')?.boundary_value
            const pt = priceTarget  ? parseFloat(priceTarget)  : null
            const pc = priceCeiling ? parseFloat(priceCeiling) : null
            if (pt !== null && pt <= 0)  e.briefPriceTarget  = 'Must be greater than 0'
            if (pc !== null && pc <= 0)  e.briefPriceCeiling = 'Must be greater than 0'
            if (pt !== null && pc !== null && pt >= pc)
                e.briefPriceTarget = 'Target price must be less than max price ceiling'
            const aat = parseFloat(autoAcceptThreshold)
            if (autoAcceptThreshold && pt !== null && aat > pt)
                e.autoAcceptThreshold = 'Auto-accept threshold should be ≤ target price'
        } else {
            lineItems.forEach((li, idx) => {
                const liMax = li.max_price_per_unit
                const liTarget = li.target_price_per_unit
                if (liMax != null && liTarget != null && liTarget >= liMax)
                    e[`lineItem_${idx}_target`] = 'Target must be less than max price'
                if (li.quantity != null && li.quantity <= 0)
                    e[`lineItem_${idx}_qty`] = 'Must be > 0'
            })
        }

        if (maxRounds < 1 || maxRounds > 20) e.maxRounds = 'Must be between 1 and 20'

        return e
    }, [brief, autoAcceptThreshold, maxRounds, isMultiItem, lineItems])  // eslint-disable-line react-hooks/exhaustive-deps

    // Button enabled when brief has required values filled and no errors
    const briefReady = !isMultiItem
        ? Boolean(briefParam('unit_price')?.target_value && briefParam('unit_price')?.boundary_value)
        : true

    const canActivate = Object.keys(errors).length === 0 && (isMultiItem
        ? lineItems.length > 0 && lineItems.every(li =>
            li.item_name && li.quantity && li.max_price_per_unit && li.target_price_per_unit
        )
        : briefReady)

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="w-full">
            <StepIndicator current={step} />

            {/* ── STEP 1: Session name + supplier selection ── */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5">Session Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <Label>Session Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. PlayStation 5 — 50 units, Q3 Cement Supply"
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    A short internal name for this negotiation
                                </p>
                            </div>
                            <div>
                                <Label>Min responses before AI starts negotiating</Label>
                                <Input
                                    type="number" min={1} value={minResponses}
                                    onChange={e => setMinResponses(parseInt(e.target.value) || 1)}
                                    className="mt-1 w-32"
                                />
                                <p className="text-xs text-gray-400 mt-1">Collect this many quotes before negotiating begins</p>
                            </div>
                        </div>
                    </div>

                    {/* Supplier selection */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Suppliers</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedSuppliers.length === 0
                                ? 'Choose which suppliers to send the RFQ to'
                                : `${selectedSuppliers.length} supplier${selectedSuppliers.length !== 1 ? 's' : ''} selected`}
                        </p>

                        {loadingSuppliers ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading suppliers…
                            </div>
                        ) : !suppliers?.length ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                                <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm mb-3">No suppliers found</p>
                                <Button size="sm" variant="outline" onClick={() => router.push('/user/ecosystem/suppliers')}>
                                    Add Suppliers First
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {suppliers.map((s: Supplier) => (
                                    <label
                                        key={s.id}
                                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${selectedSuppliers.includes(s.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                                    >
                                        <Checkbox
                                            checked={selectedSuppliers.includes(s.id)}
                                            onCheckedChange={() => toggleSupplier(s.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm">{s.name}</span>
                                                {s.company && (
                                                    <span className="text-xs text-gray-400">· {s.company}</span>
                                                )}
                                                <Badge variant="outline" className={`text-[10px] py-0 ${s.status === 'active' ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-500'}`}>
                                                    {s.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{s.email}</p>
                                        </div>
                                        {s.reliability_score != null && (
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-gray-400">Reliability</p>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${s.reliability_score >= 0.8 ? 'bg-green-500' : s.reliability_score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${s.reliability_score * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">{(s.reliability_score * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleContinueToStep2}
                            disabled={isPending || !title.trim() || selectedSuppliers.length === 0}
                            className="bg-[#1A4A7A] hover:bg-[#1A4A7A]/90 gap-2"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isPending ? 'Creating session…' : 'Continue'}
                            {!isPending && <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Write or upload RFQ ── */}
            {step === 2 && (
                <div className="space-y-5">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Your RFQ</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            This is the document your suppliers will receive. Write it directly or upload an existing one.
                        </p>

                        {/* Required-fields guide */}
                        <div className="mb-5 bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Your RFQ must include these fields</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    { label: 'Quantity / Scope', hint: 'How many units or what volume of service' },
                                    { label: 'Required Delivery Date', hint: 'When goods/services must be delivered' },
                                    { label: 'Response Deadline', hint: 'When suppliers must reply by' },
                                    { label: 'Delivery Location', hint: 'Where goods should be shipped to' },
                                ].map(f => (
                                    <div key={f.label} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-medium text-blue-900">{f.label}</span>
                                            <p className="text-xs text-blue-600">{f.hint}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-blue-500 mt-3">
                                The AI will scan your document for these fields and alert you to anything missing before you can activate the session.
                            </p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-[#1A4A7A] hover:bg-blue-50/30 transition-colors"
                            >
                                {uploadedFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <FileText className="h-8 w-8 text-[#1A4A7A]" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={e => { e.stopPropagation(); setUploadedFile(null); setUploadedText('') }}
                                            className="ml-2 text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">Click to upload your RFQ</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT — max 10MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-gray-400">
                                The AI will read your document to extract negotiation parameters. Your original file will be sent to suppliers unchanged.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button
                            onClick={handleContinueToStep3}
                            disabled={isExtracting}
                            className="bg-[#1A4A7A] hover:bg-[#1A4A7A]/90 gap-2"
                        >
                            {isExtracting
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing RFQ…</>
                                : <>Continue <ChevronRight className="h-4 w-4" /></>}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Confirmation + Parameters ── */}
            {step === 3 && (
                <div className="space-y-5">
                    {/* ── Negotiation Parameters — numeric Brief cards + qualitative specs ── */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-lg font-semibold text-gray-900">Negotiation Parameters</h2>
                            {isExtractingBrief && (
                                <div className="flex items-center gap-1.5 text-xs text-blue-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI filling in values…
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                            {!isMultiItem
                                ? 'Set your private price and quantity targets, then configure Hard or Flexible tiers on all extracted specs.'
                                : 'Configure Hard or Flexible tiers on all extracted specs. Price and quantity are set per line item above.'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] mb-5">
                            <span className="border rounded-full px-2.5 py-0.5 font-semibold bg-green-50 text-green-700 border-green-200">Flexible — AI can concede here</span>
                            <span className="border rounded-full px-2.5 py-0.5 font-semibold bg-red-50 text-red-700 border-red-200">Hard — AI escalates or rejects if breached</span>
                        </div>

                        {/* Currency */}
                        <div className="mb-5">
                            <Label>Currency</Label>
                            <select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm">
                                {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Numeric targets — price & quantity only, single-item sessions */}
                        {!isMultiItem && (
                            <div className="mb-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Price & Quantity targets
                                    <span className="ml-2 font-normal normal-case text-gray-400">— your private negotiation limits, never shared with suppliers</span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {brief.parameters.map(p => {
                                        const globalIdx = brief.parameters.findIndex(x => x.key === p.key)
                                        return (
                                            <NegotiationBriefCard
                                                key={p.key}
                                                param={p}
                                                currency={p.key === 'unit_price' ? currency : undefined}
                                                onChange={updated => setBrief(prev => ({
                                                    ...prev,
                                                    parameters: prev.parameters.map((x, j) => j === globalIdx ? updated : x),
                                                }))}
                                            />
                                        )
                                    })}
                                </div>
                                {errors.briefPriceTarget  && <p className="text-xs text-red-500 mt-2">{errors.briefPriceTarget}</p>}
                                {errors.briefPriceCeiling && <p className="text-xs text-red-500 mt-1">{errors.briefPriceCeiling}</p>}
                            </div>
                        )}

                        {/* Multi-item pricing targets */}
                        {isMultiItem && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-5 bg-[#1A4A7A] rounded-full shrink-0" />
                                    <h3 className="text-sm font-semibold text-gray-900">Negotiation Targets</h3>
                                    <span className="text-xs text-gray-400">— the AI negotiates price within these bounds per line item</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                        <thead>
                                            <tr className="bg-[#f0f5fb] text-xs text-gray-500 uppercase tracking-wide">
                                                <th className="px-3 py-2 text-left font-medium">#</th>
                                                <th className="px-3 py-2 text-left font-medium">Item</th>
                                                <th className="px-3 py-2 text-left font-medium">Qty</th>
                                                <th className="px-3 py-2 text-left font-medium">Unit</th>
                                                <th className="px-3 py-2 text-left font-medium">Target $/unit</th>
                                                <th className="px-3 py-2 text-left font-medium">Max $/unit</th>
                                                <th className="px-3 py-2 text-left font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lineItems.map((li, idx) => (
                                                <tr key={idx} className="border-t border-gray-100">
                                                    <td className="px-3 py-2 text-gray-400 text-xs">{li.line_number}</td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            value={li.item_name}
                                                            onChange={e => updateLineItem(idx, 'item_name', e.target.value)}
                                                            placeholder="Item name"
                                                            className="h-7 text-xs min-w-[140px]"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            value={li.quantity ?? ''}
                                                            onChange={e => updateLineItem(idx, 'quantity', e.target.value ? parseInt(e.target.value) : null)}
                                                            placeholder="0"
                                                            className={`h-7 text-xs w-20 ${errors[`lineItem_${idx}_qty`] ? 'border-red-400' : ''}`}
                                                        />
                                                        {errors[`lineItem_${idx}_qty`] && <p className="text-xs text-red-500 mt-0.5">{errors[`lineItem_${idx}_qty`]}</p>}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            value={li.unit ?? ''}
                                                            onChange={e => updateLineItem(idx, 'unit', e.target.value || null)}
                                                            placeholder="pcs"
                                                            className="h-7 text-xs w-20"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={li.target_price_per_unit ?? ''}
                                                            onChange={e => updateLineItem(idx, 'target_price_per_unit', e.target.value ? parseFloat(e.target.value) : null)}
                                                            placeholder="0.00"
                                                            className={`h-7 text-xs w-24 ${errors[`lineItem_${idx}_target`] ? 'border-red-400' : ''}`}
                                                        />
                                                        {errors[`lineItem_${idx}_target`] && <p className="text-xs text-red-500 mt-0.5 w-24">{errors[`lineItem_${idx}_target`]}</p>}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={li.max_price_per_unit ?? ''}
                                                            onChange={e => updateLineItem(idx, 'max_price_per_unit', e.target.value ? parseFloat(e.target.value) : null)}
                                                            placeholder="0.00"
                                                            className="h-7 text-xs w-24"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button type="button" onClick={() => removeLineItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    type="button"
                                    onClick={addLineItem}
                                    className="mt-3 text-sm text-[#1A4A7A] hover:underline flex items-center gap-1"
                                >
                                    + Add item
                                </button>
                            </div>
                        )}

                        {/* Qualitative specs — extracted from RFQ, visible to suppliers */}
                        {(() => {
                            const specFields = (extraction?.fields ?? []).filter(f => !BRIEF_FIELD_KEYS.has(f.key))
                            if (!specFields.length) return null
                            return (
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        Qualitative specs
                                        <span className="ml-2 font-normal normal-case text-gray-400">— from your RFQ, suppliers can see these</span>
                                    </p>
                                    {specFields.map(f => (
                                        <FieldRow
                                            key={f.key}
                                            field={{ ...f, value: fieldValues[f.key] ?? f.value }}
                                            tier={specTiers[f.key] ?? 'flexible'}
                                            onTierChange={updateSpecTier}
                                            onChange={updateFieldValue}
                                        />
                                    ))}
                                </div>
                            )
                        })()}
                    </div>

                    {/* Strategy & timing settings */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Strategy & Behaviour</h2>
                        <p className="text-sm text-gray-500 mb-5">How the AI conducts the negotiation.</p>

                        {/* Strategy */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Strategy</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label>Strategy</Label>
                                    <select value={strategy} onChange={e => setStrategy(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                        <option value="aggressive">Aggressive — push hard toward target</option>
                                        <option value="balanced">Balanced — steady, measured progress</option>
                                        <option value="conservative">Conservative — preserve relationship</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Approval Mode</Label>
                                    <select value={approvalMode} onChange={e => setApprovalMode(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                        <option value="auto">Auto — AI sends replies automatically</option>
                                        <option value="manual">Manual — you approve each reply first</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Max Rounds (1–20)</Label>
                                    <Input type="number" min={1} max={20} value={maxRounds} onChange={e => setMaxRounds(parseInt(e.target.value) || 5)} className={`mt-1 ${errors.maxRounds ? 'border-red-400 focus-visible:ring-red-400' : ''}`} />
                                    {errors.maxRounds && <p className="text-xs text-red-500 mt-1">{errors.maxRounds}</p>}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Allow Counter Offers</p>
                                    <p className="text-xs text-gray-400">Let suppliers propose modifications to quantity/terms</p>
                                </div>
                                <Switch checked={allowCounterOffers} onCheckedChange={setAllowCounterOffers} />
                            </div>
                            {isMultiItem && (
                                <div className="mt-3 flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Allow Partial Quantity</p>
                                        <p className="text-xs text-gray-400">If off, any supplier quoting less than the requested quantity pauses for your review.</p>
                                    </div>
                                    <Switch checked={allowPartialQuantity} onCheckedChange={setAllowPartialQuantity} />
                                </div>
                            )}
                        </div>

                        {/* Auto-accept & timing */}
                        <div className="border-t border-gray-100 pt-5 mt-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Auto-Accept & Timing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label>{isMultiItem ? 'Total Budget Ceiling (optional)' : 'Auto-Accept Threshold (optional)'}</Label>
                                    <Input type="number" step="0.01" value={autoAcceptThreshold} onChange={e => setAutoAcceptThreshold(e.target.value)} placeholder={isMultiItem ? 'e.g. 15000.00' : 'e.g. 75.00'} className={`mt-1 ${errors.autoAcceptThreshold ? 'border-red-400 focus-visible:ring-red-400' : ''}`} />
                                    {errors.autoAcceptThreshold
                                        ? <p className="text-xs text-red-500 mt-1">{errors.autoAcceptThreshold}</p>
                                        : (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {isMultiItem
                                                    ? 'Reject basket totals above this amount across all quoted line items'
                                                    : 'Auto-accept if supplier quotes at or below this price — must be ≤ your target price'}
                                            </p>
                                        )}
                                </div>
                                <div>
                                    <Label>Supplier Timeout (hours)</Label>
                                    <Input type="number" min={1} value={timeoutHours} onChange={e => setTimeoutHours(parseInt(e.target.value) || 48)} className="mt-1" />
                                </div>
                                <div>
                                    <Label>Late Response Policy</Label>
                                    <select value={lateSubmissionPolicy} onChange={e => setLateSubmissionPolicy(e.target.value as 'notify_buyer' | 'auto_reject')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                        <option value="notify_buyer">Notify me — let me decide</option>
                                        <option value="auto_reject">Auto-reject — politely decline</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">What to do when a supplier responds after the collection deadline</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Early Close</p>
                                        <p className="text-xs text-gray-400">Close early when a supplier reaches within X% of target</p>
                                    </div>
                                    <Switch checked={earlyCloseEnabled} onCheckedChange={setEarlyCloseEnabled} />
                                </div>
                                {earlyCloseEnabled && (
                                    <div className="pl-4">
                                        <Label className="text-xs">Threshold</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input type="number" step="0.01" min="0" max="0.5" value={earlyCloseThreshold} onChange={e => setEarlyCloseThreshold(e.target.value)} className="w-32" />
                                            <span className="text-sm text-gray-500">{(parseFloat(earlyCloseThreshold || '0') * 100).toFixed(0)}% of target</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                        <Button
                            onClick={handleActivate}
                            disabled={isActivating || !canActivate}
                            className="bg-[#1A4A7A] hover:bg-[#1A4A7A]/90 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isActivating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isActivating ? 'Activating…' : 'Activate Session'}
                        </Button>
                    </div>
                </div >
            )}
        </div >
    )
}

export default NegotiationForm
