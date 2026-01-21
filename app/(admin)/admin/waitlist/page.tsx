"use client"
import React, { useState } from 'react';
import { Search, ChevronDown, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useDeleteWaitlistEntry, useGetWaitlistEntries } from '@/services/requests/waitlist';
import AdminPrivateRoute from '@/components/layout/AdminPrivateRoute';

// TypeScript Types
type WaitlistStatus = 'waitlisted' | 'invited' | 'registered';

interface WaitlistUser {
    id: number;
    full_name: string;
    email: string;
    company: string;
    industry: string;
    created_at?: string;
    status?: WaitlistStatus;
}

const WaitlistAdminPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<WaitlistStatus | 'all'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<WaitlistUser | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Fetch waitlist entries
    const { data, isLoading, isError, error } = useGetWaitlistEntries();
    const deleteEntry = useDeleteWaitlistEntry();

    const handleDeleteClick = (user: WaitlistUser): void => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    console.log("waitlist--->", data?.data)

    const handleDeleteConfirm = (): void => {
        if (userToDelete) {
            deleteEntry.mutate(userToDelete.id, {
                onSuccess: () => {
                    toast.success('Waitlist entry deleted successfully');
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.detail || 'Failed to delete entry');
                }
            });
        }
    };

    // Get waitlist users from API response
    const waitlistUsers: any = data?.data?.entries || [];

    const filteredUsers: WaitlistUser[] = waitlistUsers?.filter((user: any) => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    const totalEntries = filteredUsers.length;

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1A4A7A]" />
                    <p className="text-gray-600">Loading waitlist entries...</p>
                </div>
            </div>
        );
    }

    // Error state
    // if (isError) {
    //     return (
    //         <div className="bg-white min-h-screen flex items-center justify-center">
    //             <div className="text-center">
    //                 <p className="text-red-600 text-lg font-semibold mb-2">Error loading waitlist</p>
    //                 <p className="text-gray-600">{error?.message || 'Something went wrong'}</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <AdminPrivateRoute>
            <div className="bg-white min-h-screen">
                {/* Header Section */}
                <div className="px-8 pt-8 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Early Access Waitlist
                    </h1>
                    <p className="text-[#9CA3AF] text-base">
                        Join our early access waitlist to stay updated on AI-driven negotiations and manage them in real-time!
                    </p>
                </div>

                {/* Search Section */}
                <div className="px-8 py-6 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Search Waitlist
                    </h2>

                    <div className="flex gap-4 items-center mb-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search waitlist"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:border-transparent text-gray-900"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative min-w-[200px]">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as WaitlistStatus | 'all')}
                                className="appearance-none w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] bg-white cursor-pointer text-gray-900"
                            >
                                <option value="all">All Users</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="invited">Invited</option>
                                <option value="registered">Registered</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                </div>

                {/* Waitlist Table */}
                <div className="px-8 pb-8">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {currentUsers.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-500 text-lg">No waitlist entries found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Full name
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Work Email Address
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Company / Organization
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Industry / Sector
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {currentUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{user.full_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{user.company}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{user.industry}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                                    <MoreVertical size={18} className="text-gray-600" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteClick(user)}
                                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                                >
                                                                    <Trash2 size={16} className="mr-2" />
                                                                    Delete Entry
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
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
                                    <div className="text-sm text-gray-600">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${currentPage === page
                                                    ? 'bg-[#1A4A7A] text-white'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete <strong>{userToDelete?.full_name}</strong> ({userToDelete?.email}) from the waitlist. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteEntry.isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                disabled={deleteEntry.isPending}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteEntry.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminPrivateRoute>
    );
};

export default WaitlistAdminPage;