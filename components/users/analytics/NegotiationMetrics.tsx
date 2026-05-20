'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSessions, Session } from '@/services/requests/negotiation';

const STATUS_COLOR: Record<string, string> = {
    active: 'bg-blue-50 text-blue-700',
    paused: 'bg-orange-50 text-orange-600',
    ended: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
    awaiting_constraints: 'bg-gray-100 text-gray-500',
}

function buildMonthlyChart(sessions: Session[]) {
    const counts: Record<string, { month: string; active: number; ended: number; cancelled: number }> = {}

    sessions.forEach((s) => {
        const d = new Date(s.created_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        if (!counts[key]) counts[key] = { month: label, active: 0, ended: 0, cancelled: 0 }
        if (s.status === 'active' || s.status === 'paused' || s.status === 'awaiting_constraints') counts[key].active++
        else if (s.status === 'ended') counts[key].ended++
        else if (s.status === 'cancelled') counts[key].cancelled++
    })

    return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => v)
        .slice(-12) // last 12 months
}

const NegotiationMetrics = () => {
    const router = useRouter()
    const { data: sessions, isLoading } = useSessions()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading analytics…
            </div>
        )
    }

    const all = sessions ?? []
    const active = all.filter((s) => s.status === 'active').length
    const ended = all.filter((s) => s.status === 'ended').length
    const cancelled = all.filter((s) => s.status === 'cancelled').length
    const awaiting = all.filter((s) => s.status === 'awaiting_constraints' || s.status === 'paused').length
    const completionRate = all.length > 0 ? Math.round((ended / all.length) * 100) : 0

    const chartData = buildMonthlyChart(all)

    const recent = [...all]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

    return (
        <div className="max-w-7xl mx-auto mb-3 bg-white p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Negotiation Analytics</h1>
                <p className="text-gray-500 text-sm">Overview of your negotiation activity</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-500">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{active}</p>
                    <p className="text-xs text-gray-400 mt-1">{awaiting} awaiting setup / paused</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-500">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{ended}</p>
                    <p className="text-xs text-gray-400 mt-1">{completionRate}% completion rate</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-sm text-gray-500">Cancelled</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{cancelled}</p>
                    <p className="text-xs text-gray-400 mt-1">of {all.length} total sessions</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-500">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{all.length}</p>
                    <p className="text-xs text-gray-400 mt-1">sessions created</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sessions by month</h2>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                        No session data yet
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                                    cursor={{ fill: '#f9fafb' }}
                                />
                                <Bar dataKey="active" name="Active" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="ended" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cancelled" name="Cancelled" fill="#F87171" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Recent sessions table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Recent sessions</h2>
                </div>
                {recent.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">No sessions yet.</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Session</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Phase</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((s) => (
                                <tr
                                    key={s.id}
                                    onClick={() => router.push(`/user/negotiation/${s.id}`)}
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-3">
                                        <p className="text-sm font-medium text-gray-900">{s.title}</p>
                                        {s.description && (
                                            <p className="text-xs text-gray-400 truncate max-w-xs">{s.description}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {s.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-500 capitalize">{s.negotiation_phase}</td>
                                    <td className="px-6 py-3 text-sm text-gray-500">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default NegotiationMetrics;
