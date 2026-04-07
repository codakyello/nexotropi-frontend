"use client"
import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSessions, Session } from '@/services/requests/negotiation';

const STATUS_LABEL: Record<string, string> = {
    active: 'Active — AI negotiating',
    paused: 'Paused',
    ended: 'Completed',
    cancelled: 'Cancelled',
    awaiting_constraints: 'Awaiting setup',
}

const RecentActivity = () => {
    const router = useRouter()
    const { data: sessions, isLoading } = useSessions()

    // Show the 5 most recently updated sessions
    const recent = sessions
        ?.slice()
        .sort((a: Session, b: Session) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5) ?? []

    return (
        <div className="w-full bg-white p-6 rounded-lg">
            <div className="max-w-7xl mx-auto">
                <div className="px-4 flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <button
                        onClick={() => router.push('/user/negotiation')}
                        className="flex items-center text-[#1A4A7A] cursor-pointer font-medium transition-colors duration-200 group"
                    >
                        <span className="mr-2">View All</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                </div>

                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                            <Loader2 className="h-5 w-5 animate-spin" /> Loading activity…
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No sessions yet.{' '}
                            <button onClick={() => router.push('/user/negotiation/new')} className="text-[#1A4A7A] underline">
                                Start your first negotiation
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Session</th>
                                    <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Status</th>
                                    <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Phase</th>
                                    <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((s: Session) => (
                                    <tr
                                        key={s.id}
                                        onClick={() => router.push(`/user/negotiation/${s.id}`)}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    >
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-gray-900 text-sm">{s.title}</span>
                                            {s.description && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{s.description}</p>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-600 text-sm">{STATUS_LABEL[s.status] ?? s.status}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-500 text-sm capitalize">{s.negotiation_phase}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-500 text-sm">
                                                {new Date(s.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;
