"use client"
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Play, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Sample data matching the image
const tableData = [
    {
        id: 1,
        company: 'CloudTech Systems',
        title: 'Security Monitoring Extension',
        time: '5:40 am',
        status: 'In progress',
        progress: 79,
        alert: 'Action required'
    },
    {
        id: 2,
        company: 'Steel Materials',
        title: 'Security Monitoring Extension',
        time: '6:45 am',
        status: 'In progress',
        progress: 73,
        alert: 'Action required'
    },
    {
        id: 3,
        company: 'CloudTech Systems',
        title: 'Security Monitoring Extension',
        time: '5:45 am',
        status: 'Completed',
        progress: 100,
        alert: null
    },
    {
        id: 4,
        company: 'CloudTech Systems',
        title: 'Security Monitoring Extension',
        time: '8:20 am',
        status: 'Completed',
        progress: 100,
        alert: null
    }
];

const NegotiationTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter()
    const itemsPerPage = 4;
    const totalEntries = 156;
    const totalPages = Math.ceil(totalEntries / itemsPerPage);

    const getStatusBadge = (status: string) => {
        if (status === 'Completed') {
            return (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                    {status}
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                {status}
            </Badge>
        );
    };

    const getAlertBadge = (alert: any) => {
        if (!alert) return <span className="text-gray-400">-</span>;
        return (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                {alert}
            </Badge>
        );
    };

    const handlePageChange = (page: any) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full bg-white">
            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-200">
                        <TableHead className="text-gray-500 font-normal text-sm">Company</TableHead>
                        <TableHead className="text-gray-500 font-normal text-sm">Title</TableHead>
                        <TableHead className="text-gray-500 font-normal text-sm">Time</TableHead>
                        <TableHead className="text-gray-500 font-normal text-sm">Status</TableHead>
                        <TableHead className="text-gray-500 font-normal text-sm">Progress</TableHead>
                        <TableHead className="text-gray-500 font-normal text-sm">Alert</TableHead>
                        <TableHead className="text-gray-500 font-normal text-sm">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tableData.map((row) => (
                        <TableRow key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{row.company}</TableCell>
                            <TableCell className="text-gray-700">{row.title}</TableCell>
                            <TableCell className="text-gray-700">{row.time}</TableCell>
                            <TableCell>{getStatusBadge(row.status)}</TableCell>
                            <TableCell className="text-gray-700">{row.progress}%</TableCell>
                            <TableCell>{getAlertBadge(row.alert)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-gray-100"
                                        >
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => router.push(`/user/negotiation/${1234}`)} className="flex items-center gap-2 text-gray-700">
                                            <Eye className="h-4 w-4" />
                                            View details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center gap-2 text-gray-700">
                                            <Play className="h-4 w-4" />
                                            Resume negotiation
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                            Delete negotiation
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    Showing 1 to 4 of {totalEntries} entries
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        Previous
                    </Button>

                    {[1, 2, 3].map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={
                                currentPage === page
                                    ? "bg-[#1A4A7A] text-white hover:bg-[#1A4A7A]/90"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NegotiationTable;