"use client"
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Check, Users, Settings2, FileText, Loader2, ChevronRight,
    AlertTriangle, CheckCircle, HelpCircle, Upload, X,
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
    useCreateRFQ, useExtractRFQFile, useExtractBrief, useSession,
    useNegotiationsBySession, useRFQ, useAddSuppliersToSession, useRemoveSupplierFromSession,
    Supplier, ExtractedField, RFQExtractionResult, RFQLineItemCreate, BriefParameter, NegotiationBrief, SpecRequirement, DocumentGoverningFields,
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
                                ${done ? 'bg-green-500 text-white' : active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {done ? <Check className="h-4 w-4" /> : s.id}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block ${active ? 'text-primary' : done ? 'text-green-600' : 'text-gray-400'}`}>
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

const REQUIRED_RFQ_FIELDS = [
    { label: 'Currency', hint: 'The pricing currency shown in the RFQ, such as NGN or USD' },
    { label: 'Quantity / Scope', hint: 'How many units or what volume of service is being requested' },
    { label: 'Delivery lead time or date', hint: 'When goods or services must be delivered' },
    { label: 'Submission deadline', hint: 'The date by which suppliers must submit their quote — an acknowledgment is not enough' },
    { label: 'Delivery location', hint: 'Where goods should be shipped or performed' },
    { label: 'Payment terms', hint: 'The payment basis suppliers should quote against, such as Net 30' },
    { label: 'Tax basis', hint: 'Whether quoted prices should be tax-inclusive or tax-exclusive' },
]

const normalizeCurrencyCode = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const raw = value.trim()
    if (!raw) return null
    const upper = raw.toUpperCase()
    if (['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'].includes(upper)) return upper

    const aliases: Record<string, string> = {
        '$': 'USD',
        'US DOLLAR': 'USD',
        'US DOLLARS': 'USD',
        'UNITED STATES DOLLAR': 'USD',
        '€': 'EUR',
        'EURO': 'EUR',
        'EUROS': 'EUR',
        '£': 'GBP',
        'POUND': 'GBP',
        'POUNDS': 'GBP',
        'STERLING': 'GBP',
        '₦': 'NGN',
        'NAIRA': 'NGN',
        'NIGERIAN NAIRA': 'NGN',
        'NIGERIAN NAIRA ₦': 'NGN',
        'NIGERIAN NAIRA (₦)': 'NGN',
    }
    const normalized = raw.replace(/[()/-]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase()
    return aliases[normalized] || aliases[upper] || null
}

// Known non-standard timezone abbreviations JS Date can't parse, mapped to UTC offset strings.
const _TZ_OFFSETS: Record<string, string> = {
    WAT: '+01:00', CAT: '+02:00', EAT: '+03:00',
    IST: '+05:30', PKT: '+05:00', BST: '+06:00',
    ICT: '+07:00', WIB: '+07:00', CST: '+08:00',
    SGT: '+08:00', PHT: '+08:00', JST: '+09:00',
    AEST: '+10:00', AEDT: '+11:00', NZST: '+12:00',
}

const parseDocumentDeadlineToIso = (value: unknown): string | undefined => {
    if (value == null) return undefined
    const text = String(value).trim()
    if (!text) return undefined

    let parsed = new Date(text)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()

    // Strip trailing timezone abbreviation (e.g. "WAT", "EAT") and retry.
    const tzMatch = text.match(/\b([A-Z]{2,5})$/)
    if (tzMatch) {
        const offset = _TZ_OFFSETS[tzMatch[1]]
        const withoutTz = text.slice(0, -tzMatch[0].length).trim().replace(/,?\s*$/, '')
        // Try with explicit UTC offset first, then bare (treat as local).
        for (const candidate of offset ? [`${withoutTz} ${offset}`, withoutTz] : [withoutTz]) {
            parsed = new Date(candidate)
            if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
        }
    }

    return undefined
}

const parsePositiveInt = (value: unknown): number | undefined => {
    if (value == null) return undefined
    const match = String(value).match(/\d+/)
    if (!match) return undefined
    const parsed = Number(match[0])
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const findExtractedFieldValue = (result: RFQExtractionResult | null, key: string): string | null => {
    if (!result) return null
    const field = result.fields.find(f => f.key === key)
    if (!field || field.value == null) return null
    const value = String(field.value).trim()
    return value || null
}

const buildDocumentGoverningFields = (result: RFQExtractionResult | null, fieldValues: Record<string, string>): DocumentGoverningFields | undefined => {
    if (!result) return undefined
    const rawCurrency = fieldValues.currency?.trim() || findExtractedFieldValue(result, 'currency') || undefined
    const rawResponseDeadline = fieldValues.response_deadline?.trim() || findExtractedFieldValue(result, 'response_deadline') || undefined
    const rawDeliveryLocation = fieldValues.delivery_location?.trim() || findExtractedFieldValue(result, 'delivery_location') || undefined
    const rawDeliveryWorkingDays = fieldValues.delivery_working_days?.trim() || findExtractedFieldValue(result, 'delivery_working_days') || undefined
    const rawDeliveryDate = fieldValues.delivery_date?.trim() || findExtractedFieldValue(result, 'delivery_date') || undefined
    const rawPaymentTerms = fieldValues.payment_terms?.trim() || findExtractedFieldValue(result, 'payment_terms') || undefined
    const rawQuantity = fieldValues.quantity?.trim() || findExtractedFieldValue(result, 'quantity') || undefined
    const rawTaxBasis = fieldValues.tax_basis?.trim() || findExtractedFieldValue(result, 'tax_basis') || undefined

    const governingFields: DocumentGoverningFields = {}
    const normalizedCurrency = normalizeCurrencyCode(rawCurrency)
    if (normalizedCurrency) governingFields.currency = normalizedCurrency
    const responseDeadlineIso = parseDocumentDeadlineToIso(rawResponseDeadline)
    if (responseDeadlineIso) governingFields.response_deadline = responseDeadlineIso
    if (rawResponseDeadline) governingFields.response_deadline_text = rawResponseDeadline
    if (rawDeliveryLocation) governingFields.delivery_location = rawDeliveryLocation
    const deliveryWorkingDays = parsePositiveInt(rawDeliveryWorkingDays)
    if (deliveryWorkingDays) governingFields.delivery_working_days = deliveryWorkingDays
    const deliveryDateIso = parseDocumentDeadlineToIso(rawDeliveryDate)
    if (deliveryDateIso) governingFields.delivery_date = deliveryDateIso
    if (rawDeliveryDate) governingFields.delivery_date_text = rawDeliveryDate
    if (rawPaymentTerms) governingFields.payment_terms = rawPaymentTerms
    const paymentTermsDays = parsePositiveInt(rawPaymentTerms)
    if (paymentTermsDays) governingFields.payment_terms_days = paymentTermsDays
    const quantity = parsePositiveInt(rawQuantity)
    if (quantity) governingFields.quantity = quantity
    if (rawTaxBasis) governingFields.tax_basis = rawTaxBasis

    return Object.keys(governingFields).length > 0 ? governingFields : undefined
}

const normalizeStoredDocumentGoverningFields = (value: DocumentGoverningFields | undefined): DocumentGoverningFields | undefined => {
    if (!value) return undefined
    const normalized: DocumentGoverningFields = {}
    const currency = normalizeCurrencyCode(value.currency)
    if (currency) normalized.currency = currency
    const responseDeadline = parseDocumentDeadlineToIso(value.response_deadline || value.response_deadline_text)
    if (responseDeadline) normalized.response_deadline = responseDeadline
    if (value.response_deadline_text) normalized.response_deadline_text = value.response_deadline_text
    if (value.delivery_location) normalized.delivery_location = value.delivery_location
    if (value.delivery_working_days) normalized.delivery_working_days = value.delivery_working_days
    const deliveryDate = parseDocumentDeadlineToIso(value.delivery_date || value.delivery_date_text)
    if (deliveryDate) normalized.delivery_date = deliveryDate
    if (value.delivery_date_text) normalized.delivery_date_text = value.delivery_date_text
    if (value.payment_terms) normalized.payment_terms = value.payment_terms
    if (value.payment_terms_days) normalized.payment_terms_days = value.payment_terms_days
    if (value.quantity) normalized.quantity = value.quantity
    if (value.tax_basis) normalized.tax_basis = value.tax_basis
    return Object.keys(normalized).length > 0 ? normalized : undefined
}

const buildInitialFieldValues = (result: RFQExtractionResult | null): Record<string, string> => {
    if (!result) return {}
    const initial: Record<string, string> = {}
    result.fields.forEach(f => {
        if (f.value !== null && f.value !== undefined) {
            initial[f.key] = String(f.value)
        }
    })
    return initial
}

const buildInitialSpecTiers = (result: RFQExtractionResult | null): Record<string, 'hard' | 'flexible'> => {
    if (!result) return {}
    const initialTiers: Record<string, 'hard' | 'flexible'> = {}
    result.fields.filter(f => !BRIEF_FIELD_KEYS.has(f.key)).forEach(f => {
        initialTiers[f.key] = 'flexible'
    })
    return initialTiers
}

const validateRequiredRfqFields = (result: RFQExtractionResult, fieldValues: Record<string, string>) => {
    const missing: string[] = []
    const governingFields = buildDocumentGoverningFields(result, fieldValues)
    const fieldValue = (key: string) => fieldValues[key]?.trim() || findExtractedFieldValue(result, key)

    if (!governingFields?.currency) missing.push('Currency')
    if (!governingFields?.response_deadline) missing.push('Submission deadline')
    if (!governingFields?.delivery_location) missing.push('Delivery location')
    if (!fieldValue('delivery_working_days') && !fieldValue('delivery_date')) {
        missing.push('Delivery lead time or date')
    }
    const hasLineItems = result.line_items && result.line_items.length > 0
    if (!hasLineItems && !fieldValue('quantity')) {
        missing.push('Quantity / Scope')
    }

    if (missing.length === 0) return null
    return `The following required fields could not be found or parsed: ${missing.join(', ')}.`
}

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
    const searchParams = useSearchParams()
    const resumeSessionId = searchParams?.get('session') ?? null
    const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers()
    const createSession = useCreateSession()
    const createRFQ = useCreateRFQ()
    const setConstraints = useSetConstraints()
    const extractRFQFile = useExtractRFQFile()
    const extractBrief = useExtractBrief()
    const addSuppliersToSession = useAddSuppliersToSession()
    const removeSupplierFromSession = useRemoveSupplierFromSession()
    const {
        data: resumeSession,
        isError: resumeSessionIsError,
        error: resumeSessionError,
        refetch: refetchResumeSession,
    } = useSession(resumeSessionId ?? '')
    const {
        data: resumeRfq,
        isError: resumeRfqIsError,
        error: resumeRfqError,
    } = useRFQ(resumeSessionId ?? '')

    const [step, setStep] = useState(1)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [hasHydratedFromResume, setHasHydratedFromResume] = useState(false)
    const activeDraftSessionId = sessionId ?? resumeSessionId ?? ''
    const {
        data: resumeNegotiations,
        isError: resumeNegotiationsIsError,
        error: resumeNegotiationsError,
        refetch: refetchResumeNegotiations,
    } = useNegotiationsBySession(activeDraftSessionId)

    // ── Step 1 ──────────────────────────────────────────────────────────────
    const [title, setTitle] = useState('')
    const [minResponses, setMinResponses] = useState(1)
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
    const selectedSupplierCount = selectedSuppliers.length
    const minResponsesTooHigh = selectedSupplierCount > 0 && minResponses > selectedSupplierCount

    // ── Step 2 ──────────────────────────────────────────────────────────────
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadedText, setUploadedText] = useState('')
    const [savedRfqFilename, setSavedRfqFilename] = useState<string | null>(null)
    const [extractionFieldError, setExtractionFieldError] = useState<string | null>(null)
    const [step2Processing, setStep2Processing] = useState(false)
    const [step2ProcessingLabel, setStep2ProcessingLabel] = useState('Analysing RFQ…')

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
    const [currencyTouched, setCurrencyTouched] = useState(false)
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

    useEffect(() => {
        if (currencyTouched) return
        const extractedCurrency =
            normalizeCurrencyCode(findExtractedFieldValue(extraction, 'currency'))
            || normalizeCurrencyCode(resumeRfq?.draft_email?.document_governing_fields?.currency)
        if (extractedCurrency) {
            setCurrency(extractedCurrency)
        }
    }, [currencyTouched, extraction, resumeRfq?.draft_email?.document_governing_fields?.currency])

    // ── Resume from ?session=<id> ──────────────────────────────────────────
    // Resume draft sessions from the correct stage:
    // - awaiting_rfq: supplier/session shell exists, but no RFQ was saved
    // - awaiting_constraints: RFQ exists, buyer still needs to confirm rules
    useEffect(() => {
        if (hasHydratedFromResume) return
        if (!resumeSessionId) return
        if (!resumeSession || !resumeNegotiations) return
        const resumeRfqStatus = (resumeRfqError as any)?.response?.status
        const resumeRfqMissing = resumeRfqIsError && resumeRfqStatus === 404
        const resumeRfqFailed = resumeRfqIsError && resumeRfqStatus !== 404
        if (resumeRfqFailed) return
        if (!resumeRfq && !resumeRfqMissing) return
        if (resumeSession.status !== 'awaiting_rfq' && resumeSession.status !== 'awaiting_constraints') {
            // Session has already moved past setup — don't hijack the wizard,
            // bounce the user to the session detail page instead.
            toast('This session is already set up — taking you to its detail page.')
            router.replace(`/user/negotiation/${resumeSession.id}`)
            return
        }
        setSessionId(resumeSession.id)
        setTitle(resumeSession.title || '')
        setMinResponses(resumeSession.min_responses_required || 1)
        const supplierIds = Array.from(new Set(resumeNegotiations.map(n => n.supplier_id)))
        if (supplierIds.length > 0) setSelectedSuppliers(supplierIds)
        if (resumeRfq) {
            setUploadedText(resumeRfq.description || `[Uploaded file: ${resumeRfq.draft_email?.original_filename || 'saved RFQ'}]`)
            setSavedRfqFilename(resumeRfq.draft_email?.original_filename || 'Saved RFQ')
            const savedExtraction = resumeRfq.draft_email?.setup_state?.extraction_result ?? null
            if (savedExtraction) {
                setExtraction(savedExtraction)
                setFieldValues(buildInitialFieldValues(savedExtraction))
                setSpecTiers(buildInitialSpecTiers(savedExtraction))
            }
            const savedBrief = resumeRfq.draft_email?.setup_state?.brief ?? null
            if (savedBrief) {
                setBrief(savedBrief)
            }
            if (resumeRfq.line_items?.length) {
                setLineItems(resumeRfq.line_items.map((li, idx) => ({
                    line_number: li.line_number ?? idx + 1,
                    item_name: li.item_name,
                    description: li.description ?? null,
                    specification: li.specification ?? null,
                    quantity: li.quantity ?? null,
                    unit: li.unit ?? null,
                    target_price_per_unit: li.target_price_per_unit != null ? Number(li.target_price_per_unit) : null,
                    max_price_per_unit: li.max_price_per_unit != null ? Number(li.max_price_per_unit) : null,
                })))
            }
            setStep(3)
            setHasHydratedFromResume(true)
            toast.success('Resumed saved RFQ draft — review parameters and activate when ready.')
            return
        }

        setStep(resumeSession.status === 'awaiting_rfq' ? 2 : 3)
        setHasHydratedFromResume(true)
        toast.success(
            resumeSession.status === 'awaiting_rfq'
                ? 'Resumed where you left off — upload your RFQ to continue.'
                : 'Resumed saved setup — confirm your negotiation parameters and activate when ready.',
        )
    }, [hasHydratedFromResume, resumeSessionId, resumeSession, resumeNegotiations, resumeRfq, resumeRfqIsError, resumeRfqError, router])

    const toggleSupplier = (id: string) =>
        setSelectedSuppliers(prev => {
            const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
            if (next.length > 0 && minResponses > next.length) {
                setMinResponses(next.length)
            }
            return next
        })

    const updateFieldValue = (key: string, value: string) =>
        setFieldValues(prev => ({ ...prev, [key]: value }))

    const updateSpecTier = (key: string, tier: 'hard' | 'flexible') =>
        setSpecTiers(prev => ({ ...prev, [key]: tier }))

    // ── Step 1 → 2: create session ─────────────────────────────────────────
    const handleContinueToStep2 = async () => {
        if (!title.trim()) return toast.error('Session name is required')
        if (selectedSuppliers.length === 0) return toast.error('Select at least one supplier')
        if (minResponses > selectedSuppliers.length) {
            return toast.error('Minimum responses cannot exceed the number of selected suppliers')
        }
        if (sessionId) {
            try {
                const currentSupplierIds = new Set((resumeNegotiations ?? []).map(n => n.supplier_id))
                const selectedSupplierIds = new Set(selectedSuppliers)
                const toAdd = selectedSuppliers.filter(id => !currentSupplierIds.has(id))
                const toRemove = Array.from(currentSupplierIds).filter(id => !selectedSupplierIds.has(id))

                if (toAdd.length > 0) {
                    await addSuppliersToSession.mutateAsync({ id: sessionId, supplier_ids: toAdd })
                }
                for (const supplierId of toRemove) {
                    await removeSupplierFromSession.mutateAsync({ id: sessionId, supplier_id: supplierId })
                }
                await refetchResumeNegotiations()
                setStep(2)
                return
            } catch (err: any) {
                toast.error(getApiError(err, 'Failed to update suppliers for this draft session'))
                return
            }
        }
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
        setExtractionFieldError(null)
        const allowedMimeTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/tiff',
        ]
        const allowedExtensions = /\.(pdf|docx|txt|csv|xls|xlsx|png|jpe?g|webp|tiff?)$/i
        const typeOk = allowedMimeTypes.includes(file.type)
        const extOk = allowedExtensions.test(file.name)
        if (!typeOk && !extOk) {
            toast.error('Please upload a PDF, DOCX, TXT, CSV, XLS/XLSX, or image file (PNG/JPG/WEBP/TIFF)')
            return
        }
        setUploadedFile(file)
        if (file.type === 'text/plain' || /\.txt$/i.test(file.name)) {
            const reader = new FileReader()
            reader.onload = e => setUploadedText((e.target?.result as string) || '')
            reader.readAsText(file)
        } else {
            setUploadedText(`[File: ${file.name}]`)
        }
    }

    // ── Step 2 → 3: extract fields ─────────────────────────────────────────
    const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = e => {
                const result = e.target?.result as string
                resolve(result.includes(',') ? result.split(',')[1] : result)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })

    const handleContinueToStep3 = async () => {
        if (!sessionId) return

        if (!uploadedFile) return toast.error('Please upload your RFQ document first')
        if (step2Processing) return

        setStep2Processing(true)
        setStep2ProcessingLabel('Analysing RFQ…')
        try {
            const result = await extractRFQFile.mutateAsync({ sessionId, file: uploadedFile })
            setStep2ProcessingLabel('Checking required RFQ fields…')
            // Store extracted text so we can pass it to createRFQ in the next step
            // (the backend extracted the text; we use fields to reconstruct a summary)
            const sourceText = uploadedFile.name
            setUploadedText(sourceText)

            setExtraction(result)
            // Seed fieldValues from extracted values (for the Procurement Requirements display)
            const initial = buildInitialFieldValues(result)
            setFieldValues(initial)
            const requiredFieldError = validateRequiredRfqFields(result, initial)
            if (requiredFieldError) {
                setExtractionFieldError(requiredFieldError)
                toast.error('Your RFQ is missing required supplier-facing fields')
                return
            }
            // Default all qualitative spec tiers to 'flexible'
            const initialTiers = buildInitialSpecTiers(result)
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

            const extractedLineItems = result.line_items && result.line_items.length > 0
                ? result.line_items.map((li, idx) => ({
                    line_number: li.line_number ?? idx + 1,
                    item_name: li.item_name,
                    description: li.description ?? null,
                    specification: li.specification ?? null,
                    quantity: li.quantity ?? null,
                    unit: li.unit ?? null,
                    target_price_per_unit: null,
                    max_price_per_unit: null,
                }))
                : []

            let savedRfqData: any = null
            try {
                setStep2ProcessingLabel('Saving RFQ draft…')
                const originalFileB64 = await fileToBase64(uploadedFile)
                const documentGoverningFields = buildDocumentGoverningFields(result, initial)
                savedRfqData = await createRFQ.mutateAsync({
                    sessionId,
                    data: {
                        item_name: title,
                        response_deadline: documentGoverningFields?.response_deadline,
                        line_items: extractedLineItems.length > 0 ? extractedLineItems : undefined,
                        original_file_b64: originalFileB64,
                        original_filename: uploadedFile.name,
                        document_governing_fields: documentGoverningFields,
                        extraction_result: result,
                    },
                })
                setSavedRfqFilename(uploadedFile.name)
                toast.success('RFQ draft saved. You can leave and resume without reuploading.')
            } catch (saveErr: any) {
                toast.error(getApiError(saveErr, 'RFQ was extracted, but saving the draft failed'))
                return
            }

            // The backend extracts and persists the brief atomically with the RFQ save.
            // Read it from the response; fall back to a separate AI call only if it's absent.
            const persistedBrief = savedRfqData?.draft_email?.setup_state?.brief ?? null
            if (persistedBrief) {
                setBrief(prev => ({
                    ...prev,
                    procurement_type: persistedBrief.procurement_type ?? prev.procurement_type,
                    parameters: prev.parameters.map(prevParam => {
                        const aiParam = (persistedBrief.parameters ?? []).find((p: any) => p.key === prevParam.key)
                        if (!aiParam) return prevParam
                        return {
                            ...prevParam,
                            tier: aiParam.tier,
                            leverage_rule: aiParam.leverage_rule ?? prevParam.leverage_rule,
                            extracted_value: aiParam.extracted_value,
                            target_value: prevParam.target_value ?? aiParam.target_value,
                            boundary_value: prevParam.boundary_value ?? aiParam.boundary_value,
                        }
                    }),
                }))
            } else if (sessionId) {
                // Brief not in response (server-side extraction failed) — fall back to separate call.
                extractBrief.mutateAsync({ sessionId, extractionResult: result })
                    .then(aiBreef => {
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
                                    target_value: prevParam.target_value ?? aiParam.target_value,
                                    boundary_value: prevParam.boundary_value ?? aiParam.boundary_value,
                                }
                            }),
                        }))
                    })
                    .catch(() => { /* AI failed — user fills manually, default cards already shown */ })
            }

            setStep2ProcessingLabel('Preparing confirmation step…')
            setStep(3)
        } catch (err: any) {
            const status = err?.response?.status

            if (status === 422 || status === 400) {
                setExtractionFieldError(getApiError(err))
                return
            }

            toast.error(getApiError(err, 'AI extraction failed. Please retry or upload a corrected RFQ document.'))
        } finally {
            setStep2Processing(false)
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
        if (resumeSession && resumeSession.status !== 'awaiting_rfq' && resumeSession.status !== 'awaiting_constraints') {
            toast.success('This session is already set up — taking you to its detail page.')
            router.replace(`/user/negotiation/${sessionId}`)
            return
        }
        const documentGoverningFields =
            buildDocumentGoverningFields(extraction, fieldValues)
            || normalizeStoredDocumentGoverningFields(resumeRfq?.draft_email?.document_governing_fields)

        // Single-item: require price target + ceiling from brief cards
        if (!isMultiItem) {
            const priceTarget = briefParam('unit_price')?.target_value
            const priceCeiling = briefParam('unit_price')?.boundary_value
            if (!priceTarget || !priceCeiling) {
                return toast.error('Enter your target price and max price ceiling in the Negotiation Brief above')
            }
        }
        if (!documentGoverningFields?.currency) {
            return toast.error('Your uploaded RFQ must clearly state the pricing currency before this session can be activated')
        }
        if (!documentGoverningFields?.response_deadline) {
            return toast.error('Your uploaded RFQ must clearly state the submission deadline before this session can be activated')
        }
        if (!documentGoverningFields?.delivery_location) {
            return toast.error('Your uploaded RFQ must clearly state the delivery location before this session can be activated')
        }

        try {
            // Persist any final edits made after extraction before constraints activate
            // the session. The backend preserves the original uploaded RFQ attachment
            // when no replacement file is supplied here.
            await createRFQ.mutateAsync({
                sessionId,
                data: {
                    item_name: title,
                    content: uploadedText || `[Uploaded file: ${savedRfqFilename || 'RFQ'}]`,
                    description: uploadedText || `[Uploaded file: ${savedRfqFilename || 'RFQ'}]`,
                    response_deadline: documentGoverningFields.response_deadline,
                    line_items: isMultiItem ? lineItems : undefined,
                    document_governing_fields: documentGoverningFields,
                },
            })

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
    const isExtracting = step2Processing || extractRFQFile.isPending || createRFQ.isPending
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

    // ── Session context strip ──────────────────────────────────────────────
    // Visible on step 2 and step 3 so the buyer always sees the session they're
    // configuring — especially important on the Resume Setup flow where step 1
    // was skipped. Without it the wizard feels like it lost the buyer's context.
    const selectedSupplierObjects = useMemo(() => {
        if (!suppliers) return []
        return suppliers.filter(s => selectedSuppliers.includes(s.id))
    }, [suppliers, selectedSuppliers])

    // IDs that are still in `selectedSuppliers` but no longer exist in the buyer's
    // ecosystem — typically because the supplier was deleted after this session
    // was started. Tracked separately so step 1 can show them and allow pruning.
    const missingSupplierIds = useMemo(() => {
        if (loadingSuppliers || !suppliers) return [] as string[]
        const known = new Set(suppliers.map(s => s.id))
        return selectedSuppliers.filter(id => !known.has(id))
    }, [loadingSuppliers, suppliers, selectedSuppliers])

    const pruneMissingSuppliers = () => {
        if (missingSupplierIds.length === 0) return
        setSelectedSuppliers(prev => prev.filter(id => !missingSupplierIds.includes(id)))
        toast.success(
            missingSupplierIds.length === 1
                ? 'Removed 1 unavailable supplier from this session'
                : `Removed ${missingSupplierIds.length} unavailable suppliers from this session`,
        )
    }

    const SessionContextStrip = () => {
        if (!sessionId) return null
        const supplierNames = selectedSupplierObjects.map(s => s.name).filter(Boolean)
        const knownCount = supplierNames.length
        const missingCount = missingSupplierIds.length
        // Only show "loading…" while the ecosystem query is genuinely in flight.
        const stillLoading = loadingSuppliers || !suppliers
        const detailLine = (() => {
            if (selectedSuppliers.length === 0) return 'No suppliers selected — go back to step 1'
            if (stillLoading) return 'Loading supplier details…'
            if (knownCount === 0 && missingCount > 0) {
                return `${missingCount} supplier${missingCount === 1 ? '' : 's'} no longer in your ecosystem`
            }
            const head = supplierNames.slice(0, 3).join(', ')
            const more = knownCount > 3 ? ` +${knownCount - 3} more` : ''
            const missing = missingCount > 0 ? ` · ${missingCount} unavailable` : ''
            return `${head}${more}${missing}`
        })()
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 mb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">Session</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{title || 'Untitled session'}</p>
                    </div>
                    <div className="min-w-0 text-right">
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">
                            {selectedSuppliers.length} supplier{selectedSuppliers.length === 1 ? '' : 's'} selected
                        </p>
                        <p className={`text-xs truncate max-w-md ${missingCount > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                            {detailLine}
                        </p>
                    </div>
                </div>
                {missingCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-[11px] text-amber-700">
                            Some suppliers selected for this session aren't in your ecosystem anymore. Remove them before continuing.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-300 text-amber-800 hover:bg-amber-100 h-7 text-xs"
                            onClick={pruneMissingSuppliers}
                        >
                            Remove {missingCount} unavailable
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    // ── Render ──────────────────────────────────────────────────────────────

    // Brief loading gate while we hydrate from ?session=<id>. Without this the
    // user sees the empty step-1 form flash before being jumped to step 2.
    if (
        resumeSessionId
        && !hasHydratedFromResume
        && (
            resumeSessionIsError
            || resumeNegotiationsIsError
            || (resumeRfqIsError && (resumeRfqError as any)?.response?.status !== 404)
        )
    ) {
        const error = resumeSessionError || resumeNegotiationsError || resumeRfqError
        return (
            <div className="w-full max-w-2xl mx-auto py-16">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <h2 className="text-base font-semibold text-red-900">Could not load this negotiation session</h2>
                            <p className="text-sm text-red-700 mt-1">
                                {getApiError(error, 'The session setup data failed to load. This is usually caused by a backend error or expired session state.')}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => {
                                        refetchResumeSession()
                                        refetchResumeNegotiations()
                                    }}
                                >
                                    Retry
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-700 hover:bg-red-100"
                                    onClick={() => router.push('/user/negotiation')}
                                >
                                    Back to Negotiations
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (resumeSessionId && !hasHydratedFromResume) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your session…
                </div>
            </div>
        )
    }

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
                                    type="number"
                                    min={1}
                                    max={selectedSupplierCount || undefined}
                                    value={minResponses}
                                    onChange={e => {
                                        const rawValue = parseInt(e.target.value) || 1
                                        const maxAllowed = selectedSupplierCount || rawValue
                                        setMinResponses(Math.min(Math.max(rawValue, 1), maxAllowed))
                                    }}
                                    className={`mt-1 w-32 ${minResponsesTooHigh ? 'border-red-300 focus-visible:ring-red-400' : ''}`}
                                />
                                <p className={`text-xs mt-1 ${minResponsesTooHigh ? 'text-red-500' : 'text-gray-400'}`}>
                                    {selectedSupplierCount > 0
                                        ? `Collect this many quotes before negotiating begins. Max: ${selectedSupplierCount} selected supplier${selectedSupplierCount !== 1 ? 's' : ''}.`
                                        : 'Collect this many quotes before negotiating begins'}
                                </p>
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

                        {missingSupplierIds.length > 0 && (
                            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-amber-800">
                                            {missingSupplierIds.length} selected supplier{missingSupplierIds.length === 1 ? '' : 's'} no longer in your ecosystem
                                        </p>
                                        <p className="text-[11px] text-amber-700 mt-0.5">
                                            They were deleted from <Link href="/user/ecosystem/suppliers" className="underline">Ecosystem → Suppliers</Link> after this session was started.
                                            They won't receive the RFQ. Remove them before continuing.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-amber-300 text-amber-800 hover:bg-amber-100 h-7 text-xs shrink-0"
                                        onClick={pruneMissingSuppliers}
                                    >
                                        Remove {missingSupplierIds.length}
                                    </Button>
                                </div>
                            </div>
                        )}
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
                            disabled={isPending || !title.trim() || selectedSuppliers.length === 0 || minResponsesTooHigh || missingSupplierIds.length > 0}
                            className="bg-primary hover:bg-primary/90 gap-2"
                            title={missingSupplierIds.length > 0 ? 'Remove unavailable suppliers above before continuing' : undefined}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isPending ? 'Creating session…' : 'Continue'}
                            {!isPending && <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Upload RFQ ── */}
            {step === 2 && (
                <div className="space-y-5">
                    <SessionContextStrip />
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload your RFQ</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Upload the branded RFQ document your suppliers should receive. Nexotropi will send this original file unchanged and only extract negotiation parameters from it.
                        </p>

                        {/* Required-fields guide */}
                        <div className="mb-5 bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Before upload, confirm the RFQ includes these details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {REQUIRED_RFQ_FIELDS.map(f => (
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
                                The AI will scan the uploaded document for these fields and alert you to anything missing before you can activate the session.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {extractionFieldError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm font-semibold text-red-700 mb-1">Required fields missing from your RFQ</p>
                                    <p className="text-sm text-red-700">{extractionFieldError}</p>
                                    <p className="text-xs text-red-500 mt-2">Add the missing fields to your RFQ document and upload it again.</p>
                                </div>
                            )}
                            {savedRfqFilename && !uploadedFile && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                    Saved draft RFQ: <span className="font-semibold">{savedRfqFilename}</span>. Upload a replacement file only if you want to rerun extraction.
                                </div>
                            )}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-colors"
                            >
                                {uploadedFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation()
                                                setUploadedFile(null)
                                                setUploadedText('')
                                                setExtractionFieldError(null)
                                            }}
                                            className="ml-2 text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">Click to upload your branded RFQ</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, CSV, XLS/XLSX, or image (PNG/JPG/WEBP/TIFF) — max 10MB. Scanned PDFs and photos are OCR'd automatically.</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.tif,.tiff,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg,image/webp,image/tiff"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-gray-400">
                                The AI reads the document to extract negotiation parameters. Suppliers receive your uploaded RFQ file, not a generated text version.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button
                            onClick={() => {
                                if (savedRfqFilename && !uploadedFile) {
                                    setStep(3)
                                    return
                                }
                                handleContinueToStep3()
                            }}
                            disabled={isExtracting}
                            className="bg-primary hover:bg-primary/90 gap-2"
                        >
                            {isExtracting
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> {step2ProcessingLabel}</>
                                : savedRfqFilename && !uploadedFile
                                    ? <>Saved draft ready <ChevronRight className="h-4 w-4" /></>
                                    : <>Continue <ChevronRight className="h-4 w-4" /></>}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Confirmation + Parameters ── */}
            {step === 3 && (
                <div className="space-y-5">
                    <SessionContextStrip />

                    {/* ── SECTION A: What suppliers will see ── */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                            <h2 className="text-base font-semibold text-blue-900">What suppliers will see</h2>
                            <p className="text-xs text-blue-600 mt-0.5">
                                These terms come from your RFQ and will be visible to suppliers.
                                Set each as <strong>Hard</strong> (AI escalates if breached) or <strong>Flexible</strong> (AI can negotiate).
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <div className="flex flex-wrap gap-2 text-[11px] mb-4">
                                <span className="border rounded-full px-2.5 py-0.5 font-semibold bg-green-50 text-green-700 border-green-200">Flexible — AI can concede here</span>
                                <span className="border rounded-full px-2.5 py-0.5 font-semibold bg-red-50 text-red-700 border-red-200">Hard — AI escalates or rejects if breached</span>
                            </div>
                            {(() => {
                                const specFields = (extraction?.fields ?? []).filter(f => !BRIEF_FIELD_KEYS.has(f.key))
                                if (!specFields.length) return (
                                    <p className="text-sm text-gray-400 py-2">
                                        No specific terms were extracted from your RFQ. You can activate without them, or go back and add delivery dates, payment terms, or other requirements to your RFQ.
                                    </p>
                                )
                                return specFields.map(f => (
                                    <FieldRow
                                        key={f.key}
                                        field={{ ...f, value: fieldValues[f.key] ?? f.value }}
                                        tier={specTiers[f.key] ?? 'flexible'}
                                        onTierChange={updateSpecTier}
                                        onChange={updateFieldValue}
                                    />
                                ))
                            })()}
                        </div>
                    </div>

                    {/* ── SECTION B: Your private AI rules ── */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Your private AI rules</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Never sent to suppliers. These guide what the AI can and cannot agree to.</p>
                            </div>
                            {isExtractingBrief && (
                                <div className="flex items-center gap-1.5 text-xs text-blue-500 shrink-0">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI filling in values…
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-5 space-y-6">

                            {/* Currency */}
                            <div>
                                <Label>Currency</Label>
                                <select value={currency} onChange={e => { setCurrencyTouched(true); setCurrency(e.target.value) }} className="mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm">
                                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Price & quantity — single-item */}
                            {!isMultiItem && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price & Quantity targets</p>
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

                            {/* Price & quantity — multi-item */}
                            {isMultiItem && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price & Quantity targets per line item</p>
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
                                        className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        + Add item
                                    </button>
                                </div>
                            )}

                            {/* Strategy */}
                            <div className="border-t border-gray-100 pt-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Strategy</p>
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
                                            <option value="auto">Auto — AI counteroffers send automatically</option>
                                            <option value="manual">Manual — review counteroffers before send</option>
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Applies to AI-generated counteroffers. Manual mode lets you edit the outgoing message, price, or quantity before sending.
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Max Rounds (1–20)</Label>
                                        <Input type="number" min={1} max={20} value={maxRounds} onChange={e => setMaxRounds(parseInt(e.target.value) || 5)} className={`mt-1 ${errors.maxRounds ? 'border-red-400 focus-visible:ring-red-400' : ''}`} />
                                        {errors.maxRounds && <p className="text-xs text-red-500 mt-1">{errors.maxRounds}</p>}
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Allow Counter Offers</p>
                                            <p className="text-xs text-gray-400">Let suppliers propose modifications to quantity/terms</p>
                                        </div>
                                        <Switch checked={allowCounterOffers} onCheckedChange={setAllowCounterOffers} />
                                    </div>
                                    {isMultiItem && (
                                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Allow Partial Quantity</p>
                                                <p className="text-xs text-gray-400">If off, any supplier quoting less than the requested quantity pauses for your review.</p>
                                            </div>
                                            <Switch checked={allowPartialQuantity} onCheckedChange={setAllowPartialQuantity} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Auto-accept & timing */}
                            <div className="border-t border-gray-100 pt-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Auto-Accept & Timing</p>
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
                                        <div className="pr-4">
                                            <p className="text-sm font-medium text-gray-800">Auto-accept when close to target</p>
                                            <p className="text-xs text-gray-400">If a supplier's offer is within the percentage below of your target price, AI accepts immediately instead of countering.</p>
                                        </div>
                                        <Switch checked={earlyCloseEnabled} onCheckedChange={setEarlyCloseEnabled} />
                                    </div>
                                    {earlyCloseEnabled && (() => {
                                        const fraction = Math.max(0, Math.min(0.5, parseFloat(earlyCloseThreshold || '0') || 0))
                                        const displayPercent = (fraction * 100).toFixed(fraction * 100 < 10 ? 1 : 0)
                                        const onPercentChange = (raw: string) => {
                                            if (raw === '' || raw === '.') {
                                                setEarlyCloseThreshold('')
                                                return
                                            }
                                            const pct = parseFloat(raw)
                                            if (Number.isNaN(pct)) return
                                            const clamped = Math.max(0, Math.min(50, pct))
                                            setEarlyCloseThreshold((clamped / 100).toString())
                                        }
                                        return (
                                            <div className="pl-4">
                                                <Label className="text-xs">Tolerance (%)</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="relative w-32">
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="50"
                                                            value={earlyCloseThreshold === '' ? '' : displayPercent}
                                                            onChange={e => onPercentChange(e.target.value)}
                                                            className="pr-7"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        e.g. with a target of $100/unit, AI accepts up to ${(100 * (1 + fraction)).toFixed(2)}/unit.
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                        <Button
                            onClick={handleActivate}
                            disabled={isActivating || !canActivate}
                            className="bg-primary hover:bg-primary/90 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
