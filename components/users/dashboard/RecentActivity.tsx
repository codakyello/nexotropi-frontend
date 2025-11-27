import React from 'react';
import { ArrowRight } from 'lucide-react';

const RecentActivity = () => {

    const activityData = [
        {
            activity: "CloudTech Systems – Server Infrastructure",
            details: "Negotiation completed with 12% cost reduction",
            amount: "$45,000",
            time: "1 month ago"
        },
        {
            activity: "DataFlow Inc – Analytics Package",
            details: "AI agent paused for human approval",
            amount: "$45,000",
            time: "5 months ago"
        },
        {
            activity: "SecureNet Ltd Partnership",
            details: "New cybersecurity supplier onboarded",
            amount: "-",
            time: "2 months ago"
        },
        {
            activity: "Monthly Procurement Report",
            details: "Automated report ready for review",
            amount: "-",
            time: "5 hours ago"
        }
    ];

    return (
        <div className="w-full bg-white p-6 rounded-lg">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="px-4 flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                    <button className="flex items-center text-[#1A4A7A] cursor-pointer font-medium transition-colors duration-200 group">
                        <span className="mr-2">View All Activity</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Activity</th>
                                <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Details</th>
                                <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Amount</th>
                                <th className="text-left font-medium text-gray-600 py-4 px-6 text-sm">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activityData.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="py-4 px-6">
                                        <span className="font-medium text-gray-900 text-sm">{item.activity}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-gray-600 text-sm">{item.details}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-gray-900 font-medium text-sm">{item.amount}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-gray-500 text-sm">{item.time}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;