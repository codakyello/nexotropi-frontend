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
        <div className="w-full flex-1 flex flex-col">
            <div className="w-full flex justify-between items-center mb-8">
                <h2 className="text-lg font-serif text-foreground/80 hidden md:block">Active Feed</h2>
                
                <div className="flex flex-1 md:flex-none items-center gap-4">
                    {/* Search Input */}
                    <div className="relative group max-w-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search telemetry..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background/40 backdrop-blur-md border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300 text-sm shadow-inner"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-between px-4 py-2.5 bg-background/40 backdrop-blur-md border border-border/50 rounded-xl text-foreground hover:bg-accent/40 hover:border-border transition-all duration-300 min-w-[140px] shadow-sm"
                        >
                            <span className="text-[13px] font-mono tracking-wide">{selectedStatus}</span>
                            <ChevronDown className={`h-4 w-4 ml-2 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-foreground' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-background/95 backdrop-blur-2xl border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusSelect(status)}
                                        className={`w-full px-4 py-2.5 text-left text-[13px] font-mono tracking-wide transition-colors duration-200 ${selectedStatus === status ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View Toggle Buttons */}
                    <div className="flex bg-background/40 backdrop-blur-md border border-border/50 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={toggleMode}
                            className={`p-1.5 transition-all cursor-pointer duration-300 rounded-lg hover:bg-accent/50 ${viewMode === "grid" ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground'}`}
                        >
                            {viewMode === "grid" ? (<Image src="/table.svg" alt="table view" width={18} height={18} className="opacity-70 dark:invert" />) : (<Image src="/list.svg" alt="grid view" width={18} height={18} className="opacity-70 dark:invert" />)}
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full transition-opacity duration-500 animate-in fade-in">
                {viewMode === 'grid' ? <NegotiationsGrid /> : <NegotiationTable />}
            </div>
        </div>
    );
};

export default SearchNegotiation;