"use client"
import React, { useState } from 'react';
import { Search, MoreVertical, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

const LogManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterUser, setFilterUser] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const itemsPerPage = 4;

    const [logs, setLogs] = useState([
        {
            id: 1,
            eventId: 'EVT-2025-00089',
            timestamp: 'Aug 17, 2025 - 08:45 PM',
            user: 'Daniel',
            role: 'Admin',
            activity: 'Updated Permissions',
            actionDetail: 'Changed permissions for Editor role',
            ipAddress: '192.168.0.1',
            location: 'Lagos, Nigeria',
            device: 'Chrome 139, Windows 10',
            status: 'Success',
            notes: 'Permission changes made to Editor role access levels'
        },
        {
            id: 2,
            eventId: 'EVT-2025-00090',
            timestamp: 'Aug 17, 2025 - 08:45 PM',
            user: 'Daniel',
            role: 'Admin',
            activity: 'Content Edit',
            actionDetail: 'Modified landing page content',
            ipAddress: '192.168.0.2',
            location: 'New York, USA',
            device: 'Chrome 139, Windows 10',
            status: 'Success',
            notes: 'Updated hero section text and images'
        },
        {
            id: 3,
            eventId: 'EVT-2025-00091',
            timestamp: 'Aug 17, 2025 - 08:45 PM',
            user: 'Sarah',
            role: 'Editor',
            activity: 'Content Edit',
            actionDetail: 'Attempted to modify restricted content',
            ipAddress: '192.168.0.3',
            location: 'London, UK',
            device: 'Firefox 120, macOS 14',
            status: 'Failed',
            notes: 'Insufficient permissions to access admin content'
        },
        {
            id: 4,
            eventId: 'EVT-2025-00092',
            timestamp: 'Aug 17, 2025 - 08:45 PM',
            user: 'Mike',
            role: 'Viewer',
            activity: 'Content Edit',
            actionDetail: 'Attempted unauthorized edit',
            ipAddress: '192.168.0.3',
            location: 'London, UK',
            device: 'Safari 17, macOS 14',
            status: 'Failed',
            notes: 'Viewer role does not have edit permissions'
        },
        {
            id: 5,
            eventId: 'EVT-2025-00093',
            timestamp: 'Aug 17, 2025 - 07:30 PM',
            user: 'Daniel',
            role: 'Admin',
            activity: 'User Login',
            actionDetail: 'Successful admin login',
            ipAddress: '192.168.0.1',
            location: 'Lagos, Nigeria',
            device: 'Chrome 139, Windows 10',
            status: 'Success',
            notes: 'Standard login procedure completed'
        },
        {
            id: 6,
            eventId: 'EVT-2025-00094',
            timestamp: 'Aug 17, 2025 - 07:15 PM',
            user: 'Sarah',
            role: 'Editor',
            activity: 'File Upload',
            actionDetail: 'Uploaded 3 images to media library',
            ipAddress: '192.168.0.3',
            location: 'London, UK',
            device: 'Firefox 120, macOS 14',
            status: 'Success',
            notes: 'Images uploaded for blog post'
        },
        {
            id: 7,
            eventId: 'EVT-2025-00095',
            timestamp: 'Aug 17, 2025 - 06:50 PM',
            user: 'Mike',
            role: 'Viewer',
            activity: 'Page View',
            actionDetail: 'Accessed dashboard analytics',
            ipAddress: '192.168.0.3',
            location: 'London, UK',
            device: 'Safari 17, macOS 14',
            status: 'Success',
            notes: 'Viewed analytics dashboard for 5 minutes'
        },
        {
            id: 8,
            eventId: 'EVT-2025-00096',
            timestamp: 'Aug 17, 2025 - 06:30 PM',
            user: 'Daniel',
            role: 'Admin',
            activity: 'Settings Update',
            actionDetail: 'Modified system notification settings',
            ipAddress: '192.168.0.1',
            location: 'Lagos, Nigeria',
            device: 'Chrome 139, Windows 10',
            status: 'Success',
            notes: 'Enabled email notifications for all users'
        }
    ]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.role.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterUser === 'all' || log.user === filterUser;

        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayLogs = filteredLogs.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (log: any) => {
        setSelectedLog(log);
        setShowDetailsDialog(true);
    };

    const handleExportLog = (log: any) => {
        console.log('Exporting log:', log);
        // Implement export functionality
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Search and Filter Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by user, role, or activity..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterUser}
                            onChange={(e) => {
                                setFilterUser(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer min-w-[150px]"
                        >
                            <option value="all">All Users</option>
                            <option value="Daniel">Daniel</option>
                            <option value="Sarah">Sarah</option>
                            <option value="Mike">Mike</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    Timestamp
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    Activity
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    IP Address / Location
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {displayLogs.map((log) => (
                                <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-700">
                                        {log.timestamp}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {log.user} - {log.role}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {log.activity}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {log.ipAddress} - {log.location}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm ${log.status === 'Success'
                                            ? 'text-gray-700'
                                            : 'text-gray-600'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => handleViewDetails(log)} className="cursor-pointer">
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                                    Delete Logs
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-4 py-2 text-sm rounded-lg ${currentPage === i + 1
                                    ? 'bg-[#1A4A7A] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Log Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-3xl bg-gray-50">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-3xl font-bold text-gray-900">Log Details</DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-6 mt-6 bg-gray-50">
                            <div className="grid grid-cols-[200px_1fr] gap-y-6">
                                <div className="text-gray-500 text-base">Event ID:</div>
                                <div className="text-gray-900 text-base">{selectedLog.eventId}</div>

                                <div className="text-gray-500 text-base">User Info:</div>
                                <div className="text-gray-900 text-base">{selectedLog.user} Wilson - {selectedLog.role}</div>

                                <div className="text-gray-500 text-base">Action Performed:</div>
                                <div className="text-gray-900 text-base">{selectedLog.actionDetail}</div>

                                <div className="text-gray-500 text-base">Timestamp:</div>
                                <div className="text-gray-900 text-base">{selectedLog.timestamp}</div>

                                <div className="text-gray-500 text-base">Device & Browser:</div>
                                <div className="text-gray-900 text-base">{selectedLog.device}</div>

                                <div className="text-gray-500 text-base">IP & Location:</div>
                                <div className="text-gray-900 text-base">{selectedLog.ipAddress}, {selectedLog.location}</div>

                                <div className="text-gray-500 text-base">Event Status:</div>
                                <div className="text-gray-900 text-base">{selectedLog.status}</div>

                                <div className="text-gray-500 text-base">Notes:</div>
                                <div className="text-gray-900 text-base">{selectedLog.notes}</div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8 pt-6">
                        <button
                            onClick={() => setShowDetailsDialog(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-[#1A4A7A] hover:bg-gray-100 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => handleExportLog(selectedLog)}
                            className="flex-1 px-6 py-3 bg-[#1A4A7A] text-white rounded-lg hover:bg-[#153a5f] transition-colors"
                        >
                            Export log
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LogManagement;