"use client"
import React, { useState } from 'react';
import { Search, ChevronDown, FileText, User, Settings, Lock } from 'lucide-react';

const ActivityLogs = () => {
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All types');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const logTypes = [
        'All types',
        'AI Decisions',
        'User Actions',
        'System Events',
        'Security Events',
        'Negotiations',
        'Offers'
    ];

    const logs = [
        {
            id: 1,
            type: 'ai',
            title: 'Counter Offer Generated',
            actor: 'AI Agent',
            timestamp: '2024-01-15 14:32:15',
            description: 'DataFlow Inc - Analytics Package',
            details: {
                action: 'Counter offer automatically generated',
                package: 'Analytics Package',
                vendor: 'DataFlow Inc',
                previousOffer: '$125,000',
                counterOffer: '$98,000',
                reason: 'Market analysis suggests 22% reduction achievable'
            }
        },
        {
            id: 2,
            type: 'user',
            title: 'Negotiation Paused',
            actor: 'Sarah Chen',
            timestamp: '2024-01-15 14:28:42',
            description: 'DataFlow Inc - Analytics Package',
            details: {
                action: 'Negotiation temporarily paused',
                package: 'Analytics Package',
                vendor: 'DataFlow Inc',
                reason: 'Pending stakeholder review',
                pausedBy: 'Sarah Chen'
            }
        },
        {
            id: 3,
            type: 'ai',
            title: 'Offer Received Processed',
            actor: 'AI Agent',
            timestamp: '2024-01-15 14:25:18',
            description: 'DataFlow Inc - Analytics Package',
            details: {
                action: 'Vendor offer received and processed',
                package: 'Analytics Package',
                vendor: 'DataFlow Inc',
                offerAmount: '$115,000',
                analyzed: 'true',
                recommendation: 'Counter with $98,000'
            }
        },
        {
            id: 4,
            type: 'system',
            title: 'Negotiation Started',
            actor: 'System',
            timestamp: '2024-01-15 14:15:33',
            description: 'DataFlow Inc - Analytics Package',
            details: {
                action: 'New negotiation initiated',
                package: 'Analytics Package',
                vendor: 'DataFlow Inc',
                initialBudget: '$100,000',
                targetSavings: '15%'
            }
        },
        {
            id: 5,
            type: 'ai',
            title: 'Counter Offer Generated',
            actor: 'AI Agent',
            timestamp: '2024-01-15 14:32:15',
            description: 'DataFlow Inc - Analytics Package',
            details: {
                action: 'Counter offer automatically generated',
                package: 'Analytics Package',
                vendor: 'DataFlow Inc',
                previousOffer: '$125,000',
                counterOffer: '$98,000'
            }
        },
        {
            id: 6,
            type: 'system',
            title: 'Negotiation Started',
            actor: 'System',
            timestamp: '2024-01-15 14:15:33',
            description: 'DataFlow Inc - Analytics Package',
            details: {
                action: 'New negotiation initiated',
                package: 'Analytics Package',
                vendor: 'DataFlow Inc',
                initialBudget: '$100,000'
            }
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'ai':
                return <Settings className="w-5 h-5 text-teal-600" />;
            case 'user':
                return <User className="w-5 h-5 text-blue-600" />;
            case 'system':
                return <Settings className="w-5 h-5 text-gray-600" />;
            default:
                return <FileText className="w-5 h-5 text-gray-600" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'ai':
                return 'bg-teal-50';
            case 'user':
                return 'bg-blue-50';
            case 'system':
                return 'bg-gray-50';
            default:
                return 'bg-gray-50';
        }
    };

    const filteredLogs = logs.filter(log =>
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='bg-gray-50'>
            <div className="max-w-7xl mx-auto mb-3">
                <div className=' bg-white mb-8 p-6 rounded-md'>
                    <h1 className="text-xl font-bold text-gray-900 mb-6">Search logs</h1>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                            <span className="text-gray-700">{filterType}</span>
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-6 rounded-md">
                    <div className="lg:col-span-2 rounded-lg border border-gray-200 p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
                            <p className="text-sm text-gray-600">{filteredLogs.length} entries found</p>
                        </div>

                        <div className="space-y-3">
                            {filteredLogs.map((log: any) => (
                                <div
                                    key={log.id}
                                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${getIconBg(log.type)}`}>
                                            {getIcon(log.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 mb-1">{log.title}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {log.actor} · {log.timestamp}
                                            </p>
                                            <p className="text-sm text-gray-700">{log.description}</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap ml-4">
                                        View details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Entry Details</h2>
                            <p className="text-sm text-gray-600 mb-6">Detailed information</p>

                            {selectedLog ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-3 rounded-lg ${getIconBg(selectedLog.type)}`}>
                                            {getIcon(selectedLog.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{selectedLog.title}</h3>
                                            <p className="text-sm text-gray-600">{selectedLog.timestamp}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {Object.entries(selectedLog.details).map(([key, value]) => (
                                            <div key={key} className="pb-3 border-b border-gray-100 last:border-0">
                                                <p className="text-xs text-gray-500 uppercase mb-1">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-sm text-gray-900">{value as any}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Select a log entry to view detailed information</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Log Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total entries</span>
                                    <span className="font-semibold text-gray-900">8</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">AI Decisions</span>
                                    <span className="font-semibold text-gray-900">3</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">User Actions</span>
                                    <span className="font-semibold text-gray-900">3</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Security Events</span>
                                    <span className="font-semibold text-gray-900">1</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-gray-600">High Severity</span>
                                    <span className="font-semibold text-red-600">1</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <Lock className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Compliance & Security</h3>
                                    <p className="text-sm text-gray-600">
                                        All audit logs are immutable and encrypted. Retention period: 7 years.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;