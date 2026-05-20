"use client"
import React from 'react'
import { BriefParameter, ParameterTier } from '@/services/requests/negotiation'

// ── Per-parameter labels so the UI is human-readable ─────────────────────────

const PARAM_CONFIG: Record<string, {
    targetLabel: string
    boundaryLabel: string
    description: string
}> = {
    unit_price: {
        targetLabel: "Your target price",
        boundaryLabel: "Max price (ceiling)",
        description: "AI negotiates down toward target. Never exceeds ceiling.",
    },
    quantity: {
        targetLabel: "Desired quantity",
        boundaryLabel: "Min acceptable quantity",
        description: "AI aims for desired qty. Accepts less if tier is flexible.",
    },
    delivery_days: {
        targetLabel: "Required lead time",
        boundaryLabel: "Max acceptable lead time",
        description: "Days after PO issuance. AI can concede if tier is flexible.",
    },
    payment_days: {
        targetLabel: "Desired payment terms",
        boundaryLabel: "Max acceptable terms",
        description: "Net days. AI can offer faster payment to win on price.",
    },
}

const TIER_STYLES: Record<ParameterTier, { badge: string; label: string; description: string }> = {
    hard:     { badge: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',        label: 'Hard',     description: 'Auto-reject offers that breach this' },
    target:   { badge: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',    label: 'Target',   description: 'AI negotiates toward this value' },
    flexible: { badge: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200', label: 'Flexible', description: 'AI can concede here to gain on price' },
}

const TIER_ORDER: ParameterTier[] = ['hard', 'flexible']

interface Props {
    param: BriefParameter
    currency?: string
    onChange: (updated: BriefParameter) => void
}

export function NegotiationBriefCard({ param, currency, onChange }: Props) {
    const tier = param.tier as ParameterTier
    const style = TIER_STYLES[tier]
    const config = PARAM_CONFIG[param.key] ?? {
        targetLabel: 'Target',
        boundaryLabel: 'Max acceptable',
        description: '',
    }
    const unit = param.key === 'unit_price' && currency ? currency : param.unit

    const cycleTier = () => {
        const next = TIER_ORDER[(TIER_ORDER.indexOf(tier) + 1) % TIER_ORDER.length]
        onChange({ ...param, tier: next })
    }

    const set = (field: 'target_value' | 'boundary_value' | 'leverage_rule', value: string) =>
        onChange({ ...param, [field]: value || null })

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-gray-900">{param.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{config.description}</p>
                </div>
                <button
                    type="button"
                    onClick={cycleTier}
                    title={style.description}
                    className={`shrink-0 text-[11px] font-semibold border rounded-full px-2.5 py-0.5 transition-colors whitespace-nowrap ${style.badge}`}
                >
                    {style.label}
                </button>
            </div>

            {/* Extracted reference */}
            {param.extracted_value && (
                <p className="text-[11px] text-gray-400 bg-gray-50 rounded px-2 py-1">
                    From RFQ: <span className="font-medium text-gray-600">{param.extracted_value}{unit ? ` ${unit}` : ''}</span>
                </p>
            )}

            {/* Value inputs */}
            <div className="space-y-2">
                <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-1 block">
                        {tier === 'hard' ? config.boundaryLabel : config.targetLabel}
                        <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min={0}
                            step={param.key === 'unit_price' ? '0.01' : '1'}
                            value={param.target_value ?? ''}
                            onChange={e => set('target_value', e.target.value)}
                            placeholder="—"
                            className="flex-1 h-8 text-sm border border-gray-300 rounded-md px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {unit && <span className="text-xs text-gray-400 shrink-0">{unit}</span>}
                    </div>
                </div>

                {tier !== 'hard' && (
                    <div>
                        <label className="text-[11px] font-medium text-gray-500 mb-1 block">
                            {config.boundaryLabel}
                        </label>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                min={0}
                                step={param.key === 'unit_price' ? '0.01' : '1'}
                                value={param.boundary_value ?? ''}
                                onChange={e => set('boundary_value', e.target.value)}
                                placeholder="—"
                                className="flex-1 h-8 text-sm border border-gray-300 rounded-md px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {unit && <span className="text-xs text-gray-400 shrink-0">{unit}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Leverage rule — only for flexible */}
            {tier === 'flexible' && (
                <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-1 block">
                        AI leverage instruction
                    </label>
                    <textarea
                        value={param.leverage_rule ?? ''}
                        onChange={e => set('leverage_rule', e.target.value)}
                        rows={2}
                        className="w-full text-xs border border-gray-300 rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. Offer to extend delivery window in exchange for a lower price"
                    />
                </div>
            )}
        </div>
    )
}
