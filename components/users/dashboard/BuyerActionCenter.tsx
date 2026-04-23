"use client"

import React from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BuyerActionItem, useBuyerActionCenter } from '@/services/requests/negotiation'

const PRIORITY_STYLE: Record<string, string> = {
    urgent: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-gray-50 text-gray-600 border-gray-200',
}

const ACTION_LABEL: Record<string, string> = {
    approval_required: 'Approval',
    manual_review: 'Review',
    clarification_required: 'Clarification',
    constraints_required: 'Setup',
}

function formatDate(value: string | null) {
    if (!value) return 'No timestamp'
    return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function actionTone(item: BuyerActionItem) {
    if (item.priority === 'urgent') return 'border-l-red-400'
    if (item.priority === 'high') return 'border-l-amber-400'
    if (item.action_type === 'constraints_required') return 'border-l-blue-400'
    return 'border-l-gray-300'
}

const BuyerActionCenter = () => {
    const router = useRouter()
    const { data: items = [], isLoading, isError, refetch } = useBuyerActionCenter()
    const topItems = items.slice(0, 5)
    const hiddenCount = Math.max(items.length - topItems.length, 0)

    return (
        <section className="max-w-7xl mx-auto mb-12 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-[#1A4A7A]" />
                        <h2 className="text-2xl font-bold text-gray-900">Buyer action center</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Current decisions that need your attention across active supplier threads.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/user/negotiation')}
                    className="flex items-center text-[#1A4A7A] font-medium text-sm group"
                >
                    {items.length > 5 ? `Showing 5 of ${items.length}` : 'View all sessions'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading action items...
                </div>
            ) : isError ? (
                <div className="px-6 py-8 text-center">
                    <p className="text-sm text-gray-500">Unable to load buyer actions right now.</p>
                    <button onClick={() => refetch()} className="mt-3 text-sm text-[#1A4A7A] underline">
                        Retry
                    </button>
                </div>
            ) : topItems.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">No buyer actions pending</p>
                    <p className="text-sm text-gray-500 mt-1">Nexotropi will surface approvals, clarifications, and review items here.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {topItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.cta_href)}
                            className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors border-l-4 ${actionTone(item)}`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.low}`}>
                                            {item.priority}
                                        </span>
                                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                            {ACTION_LABEL[item.action_type] ?? item.action_type.replace(/_/g, ' ')}
                                        </span>
                                        {item.supplier_name && (
                                            <span className="text-xs text-gray-400 truncate">{item.supplier_name}</span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">{item.session_title}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDate(item.created_at)}
                                    </span>
                                    <span className="text-sm font-medium text-[#1A4A7A] flex items-center">
                                        {item.cta_label}
                                        <ArrowRight className="ml-1.5 h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                    {hiddenCount > 0 && (
                        <button
                            onClick={() => router.push('/user/negotiation')}
                            className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-[#1A4A7A] font-medium"
                        >
                            {hiddenCount} more action item{hiddenCount === 1 ? '' : 's'} hidden here. Open all sessions to review the rest.
                        </button>
                    )}
                </div>
            )}
        </section>
    )
}

export default BuyerActionCenter
