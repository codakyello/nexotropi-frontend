"use client"
import React, { useState } from 'react'
import { Search, Eye, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type Severity = 'info' | 'warning' | 'critical'

interface LogEntry {
    id: string
    timestamp: string
    event: string
    actor: string
    ip: string
    severity: Severity
    details: string
}

const SAMPLE_LOGS: LogEntry[] = [
    {
        id: '1',
        timestamp: '2026-05-31 20:14:02',
        event: 'Login successful',
        actor: 'admin@nexotropi.com',
        ip: '102.89.1.45',
        severity: 'info',
        details: 'User logged in from a known IP address.',
    },
    {
        id: '2',
        timestamp: '2026-05-31 19:58:11',
        event: 'Failed login attempt',
        actor: 'unknown',
        ip: '185.220.101.12',
        severity: 'warning',
        details: 'Three consecutive failed login attempts detected.',
    },
    {
        id: '3',
        timestamp: '2026-05-31 18:30:44',
        event: 'Permission changed',
        actor: 'owner@nexotropi.com',
        ip: '102.89.1.45',
        severity: 'info',
        details: 'Role updated for user buyer@company.com: viewer → editor.',
    },
    {
        id: '4',
        timestamp: '2026-05-31 17:02:19',
        event: 'Account locked',
        actor: 'system',
        ip: '—',
        severity: 'critical',
        details: 'Account locked after 10 failed login attempts.',
    },
]

const severityStyles: Record<Severity, string> = {
    info: 'bg-blue-50 text-blue-700',
    warning: 'bg-yellow-50 text-yellow-700',
    critical: 'bg-red-50 text-red-700',
}

const LogManagement = () => {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | Severity>('all')
    const [selected, setSelected] = useState<LogEntry | null>(null)

    const filtered = SAMPLE_LOGS.filter((log) => {
        const matchesSeverity = filter === 'all' || log.severity === filter
        const matchesSearch =
            log.event.toLowerCase().includes(search.toLowerCase()) ||
            log.actor.toLowerCase().includes(search.toLowerCase()) ||
            log.ip.includes(search)
        return matchesSeverity && matchesSearch
    })

    return (
        <div className="px-8 pb-10">
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Event Log</h2>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as typeof filter)}
                                className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium">Timestamp</th>
                                <th className="px-5 py-3 font-medium">Event</th>
                                <th className="px-5 py-3 font-medium">Actor</th>
                                <th className="px-5 py-3 font-medium">IP Address</th>
                                <th className="px-5 py-3 font-medium">Severity</th>
                                <th className="px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                                        No log entries found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                                        <td className="px-5 py-4 font-medium text-gray-900">{log.event}</td>
                                        <td className="px-5 py-4 text-gray-600">{log.actor}</td>
                                        <td className="px-5 py-4 text-gray-500 font-mono">{log.ip}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${severityStyles[log.severity]}`}>
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => setSelected(log)}
                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                                title="View details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail dialog */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Details</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-gray-500">Timestamp</p>
                                    <p className="font-medium">{selected.timestamp}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Severity</p>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${severityStyles[selected.severity]}`}>
                                        {selected.severity}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500">Event</p>
                                    <p className="font-medium">{selected.event}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Actor</p>
                                    <p className="font-medium">{selected.actor}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">IP Address</p>
                                    <p className="font-medium font-mono">{selected.ip}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Details</p>
                                <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selected.details}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default LogManagement
