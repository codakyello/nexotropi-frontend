"use client"
import React from 'react';
import { Database, Shield, Users, FileText, Calendar, Network, TrendingUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSessions, useSuppliers, Session } from '@/services/requests/negotiation';

const DashboardMetrics = () => {
    const router = useRouter()
    const { data: sessions, isLoading: loadingSessions } = useSessions()
    const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers()

    const activeSessions = sessions?.filter((s: Session) => s.status === 'active').length ?? 0
    const endedSessions = sessions?.filter((s: Session) => s.status === 'ended').length ?? 0
    const totalSessions = sessions?.length ?? 0
    const totalSuppliers = suppliers?.length ?? 0
    const activeSuppliers = suppliers?.filter((s: any) => s.status === 'active').length ?? 0

    // Cost savings: sum of savings_amount across all ended negotiations (approximated from sessions)
    // No dedicated endpoint — show total sessions as proxy for engagement
    const loading = loadingSessions || loadingSuppliers

    const metrics = [
        {
            label: 'Active Sessions',
            value: loading ? '—' : String(activeSessions),
            sub: `${totalSessions} total sessions`,
            icon: <Image src="/negotiate.svg" width={24} height={24} alt="negotiation" />,
            iconBg: 'bg-[#E8EDF2]',
            trend: null,
        },
        {
            label: 'Completed Sessions',
            value: loading ? '—' : String(endedSessions),
            sub: totalSessions > 0 ? `${Math.round((endedSessions / totalSessions) * 100)}% completion rate` : 'No sessions yet',
            icon: <Database className="w-6 h-6 text-green-600" />,
            iconBg: 'bg-green-100',
            trend: null,
        },
        {
            label: 'Active Suppliers',
            value: loading ? '—' : String(activeSuppliers),
            sub: `${totalSuppliers} total suppliers`,
            icon: <Users className="w-6 h-6 text-gray-600" />,
            iconBg: 'bg-gray-100',
            trend: null,
        },
        {
            label: 'Supply Resilience',
            value: loading ? '—' : totalSuppliers > 0 ? `${Math.min(100, Math.round((activeSuppliers / totalSuppliers) * 100))}%` : '—',
            sub: 'Active supplier ratio',
            icon: <Shield className="w-6 h-6 text-[#F59E0B]" />,
            iconBg: 'bg-[#FEF5E7]',
            trend: null,
        },
    ]

    return (
        <div className="max-w-7xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center mb-4">
                            <div className={`w-12 h-12 ${m.iconBg} rounded-full flex items-center justify-center mr-4`}>
                                {m.icon}
                            </div>
                            <h3 className="text-gray-700 font-medium">{m.label}</h3>
                        </div>
                        <div className="mb-3">
                            {loading
                                ? <Loader2 className="h-7 w-7 animate-spin text-gray-300" />
                                : <p className="text-3xl font-bold text-gray-900">{m.value}</p>
                            }
                        </div>
                        <div className="flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-gray-500">{m.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className='bg-white p-8 rounded-lg'>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => router.push("/user/negotiation/new")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center py-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">Start new negotiation</h3>
                        </div>
                    </button>
                    <button onClick={() => router.push("/user/negotiation")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center py-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                <Calendar className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">View all sessions</h3>
                        </div>
                    </button>
                    <button onClick={() => router.push("/user/ecosystem")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center py-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                <Network className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">View Ecosystem</h3>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardMetrics;
