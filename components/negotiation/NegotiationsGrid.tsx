import React from 'react';
import { Clock, EllipsisVertical, Eye, Play, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

const NegotiationsGrid = () => {
    const router = useRouter()
    const negotiationsData = [
        // Ongoing negotiations (top row)
        {
            status: 'Ongoing',
            statusColor: 'bg-[#FEF5E7] text-[#F59E0B]',
            progressColor: 'bg-[#E1574D]',
            company: 'CloudTech Systems',
            description: 'Security Monitoring Extension',
            duration: '5 hours',
            currentOffer: '$1,000'
        },
        {
            status: 'Ongoing',
            statusColor: 'bg-[#FEF5E7] text-[#F59E0B]',
            progressColor: 'bg-[#E1574D]',
            company: 'CloudTech Systems',
            description: 'Security Monitoring Extension',
            duration: '5 hours',
            currentOffer: '$1,000'
        },
        {
            status: 'Ongoing',
            statusColor: 'bg-[#FEF5E7] text-[#F59E0B]',
            progressColor: 'bg-[#E1574D]',
            company: 'CloudTech Systems',
            description: 'Security Monitoring Extension',
            duration: '5 hours',
            currentOffer: '$1,000'
        },
        // Completed negotiations (bottom row)
        {
            status: 'Completed',
            statusColor: 'bg-[#E7F8F2] text-[#10B981]',
            progressColor: 'bg-green-500',
            company: 'CloudTech Systems',
            description: 'Security Monitoring Extension',
            duration: '5 hours',
            currentOffer: '$1,000'
        },
        {
            status: 'Completed',
            statusColor: 'bg-[#E7F8F2] text-[#10B981]',
            progressColor: 'bg-green-500',
            company: 'CloudTech Systems',
            description: 'Security Monitoring Extension',
            duration: '5 hours',
            currentOffer: '$1,000'
        },
        {
            status: 'Completed',
            statusColor: 'bg-[#E7F8F2] text-[#10B981]',
            progressColor: 'bg-green-500',
            company: 'CloudTech Systems',
            description: 'Security Monitoring Extension',
            duration: '5 hours',
            currentOffer: '$1,000'
        }
    ];

    return (
        <div className="w-full bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {negotiationsData.map((negotiation, index) => (
                        <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                            {/* Header with Status and Menu */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-normal ${negotiation.statusColor}`}>
                                    {negotiation.status}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <EllipsisVertical className="w-5 h-5 cursor-pointer" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => router.push(`/user/negotiation/${1234}`)} className="flex cursor-pointer items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            View details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center gap-2">
                                            <Play className="w-4 h-4" />
                                            Resume negotiation
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center gap-2 text-red-600 hover:text-red-700 focus:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                            Delete negotiation
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Company Name */}
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                {negotiation.company}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4">
                                {negotiation.description}
                            </p>

                            {/* Duration */}
                            <div className="flex items-center text-sm text-gray-500 mb-6">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-sm">{negotiation.duration}</span>
                            </div>

                            {/* Current Offer Section */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600 text-sm">Current offer</span>
                                    <span className="text-sm font-semibold text-gray-900">{negotiation.currentOffer}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className={`${negotiation.progressColor} h-2 rounded-full`} style={{ width: negotiation.status === 'Ongoing' ? '35%' : '100%' }}></div>
                                </div>
                            </div>

                            {/* View Details Button */}
                            <button className="w-full py-3 cursor-pointer border rounded-md text-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 border-gray-200 mt-4">
                                View details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NegotiationsGrid;