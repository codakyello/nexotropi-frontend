"use client"
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const OverviewMetricsChart = () => {
    const [activeChartTab, setActiveChartTab] = useState('savings');
    const [timeRange, setTimeRange] = useState('12months');

    // Sample data for Savings Trend
    const savingsData = [
        { month: 'Jan', value: 4500 },
        { month: 'Feb', value: 15000 },
        { month: 'Mar', value: 21000 },
        { month: 'Apr', value: 5000 },
        { month: 'May', value: 14000 },
        { month: 'Jun', value: 20500 },
        { month: 'Jul', value: 10000 },
        { month: 'Aug', value: 6000 },
        { month: 'Sep', value: 15000 },
        { month: 'Oct', value: 5500 },
        { month: 'Nov', value: 15500 },
        { month: 'Dec', value: 21000 }
    ];

    // Sample data for Negotiation Outcomes
    const outcomeData = [
        { name: 'Successful', value: 70, color: '#10B981' },
        { name: 'Partially Successful', value: 15, color: '#F59E0B' },
        { name: 'Failed', value: 10, color: '#EF4444' }
    ];

    const totalProfit = savingsData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
                    <p className="font-semibold">${payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto mb-12 p-6">
            {/* Chart Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveChartTab('savings')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeChartTab === 'savings'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Savings Trends
                </button>
                <button
                    onClick={() => setActiveChartTab('outcomes')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeChartTab === 'outcomes'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Negotiation Outcomes
                </button>
            </div>

            {/* Chart Title */}
            <h2 className="text-xl font-bold text-gray-800 mb-8">Savings Trend</h2>

            {/* Chart Content */}
            <div className="bg-white rounded-xl p-8 border border-gray-100">
                {activeChartTab === 'savings' && (
                    <>
                        {/* Time Range Filters */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-4">
                                {['12months', '30days', '7days', '24hours'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-none transition-colors ${timeRange === range
                                            ? 'bg-[#1A4A7A] text-white'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {range === '12months' ? '12 months' :
                                            range === '30days' ? '30 days' :
                                                range === '7days' ? '7 days' : '24 hours'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                <span className="text-gray-500">Total Profits</span>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={savingsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 14 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 14 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Bar
                                    dataKey="value"
                                    fill="#6366F1"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={10}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                )}

                {activeChartTab === 'outcomes' && (
                    <>
                        {/* Time Range Filters */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-4">
                                {['12months', '30days', '7days', '24hours'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-none transition-colors ${timeRange === range
                                            ? 'bg-[#1A4A7A] text-white'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {range === '12months' ? '12 months' :
                                            range === '30days' ? '30 days' :
                                                range === '7days' ? '7 days' : '24 hours'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                <span className="text-gray-500">Total Profits</span>
                            </div>
                        </div>

                        {/* Pie Chart and Legend */}
                        <div className="flex items-center justify-center gap-16">
                            <ResponsiveContainer width="40%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={outcomeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={150}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {outcomeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Custom Legend */}
                            <div className="flex flex-col gap-6">
                                {outcomeData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: item.color }}></div>
                                        <span className="text-gray-700 font-medium min-w-[200px]">{item.name}</span>
                                        <span className="text-gray-900 font-semibold text-xl">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OverviewMetricsChart;