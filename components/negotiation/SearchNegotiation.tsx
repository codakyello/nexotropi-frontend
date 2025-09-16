"use client"
import React, { useState } from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';
import Image from 'next/image';
import NegotiationsGrid from './NegotiationsGrid';
import NegotiationTable from './NegotiationTable';

const SearchNegotiation = () => {
    const [searchValue, setSearchValue] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All status');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // Default to grid view

    const statusOptions = [
        'All status',
        'Active',
        'Pending',
        'Completed',
        'Cancelled',
        'In Review'
    ];

    const handleStatusSelect = (status: string) => {
        setSelectedStatus(status);
        setIsDropdownOpen(false);
    };

    const toggleMode = () => {
        setViewMode((prev) => prev === "grid" ? "table" : "grid");
    };


    return (
        <div className="w-full">
            <div className='bg-white p-6 mb-12 rounded-lg'>
                <div className="max-w-7xl mx-auto">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-gray-900">Search negotiations</h1>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex items-center gap-8">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search negotiation"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200"
                            />
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 min-w-[140px]"
                            >
                                <span className="text-sm font-medium">{selectedStatus}</span>
                                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusSelect(status)}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${selectedStatus === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Toggle Buttons */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            {/* Grid View Button */}
                            <button
                                onClick={toggleMode}
                                className={`p-2 transition-all cursor-pointer duration-200 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200`}
                            >
                                {viewMode === "grid" ? (<Image src="/list.svg" alt="grid view" width={20} height={20} />) : (<Image src="/table.svg" alt="table view" width={20} height={20} />)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? <NegotiationsGrid /> : <NegotiationTable />}
        </div>
    );
};

export default SearchNegotiation;