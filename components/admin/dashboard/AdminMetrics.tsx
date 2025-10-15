"use client"
import React from 'react';
import { Database, Monitor, Shield, Users, FileText, Calendar, Network, TrendingUp, TrendingDown, Plus, UserX } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AdminMetrics = () => {
    const router = useRouter()
    return (
        <div className="max-w-7xl mx-auto mb-12 p-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Cost Savings Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Total Waitlist Sign Ups</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">2,000</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">2.3%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            <Users className="w-6 h-6 text-[#1A4A7A]" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Referral Sign Ups</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">2,000</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">2.3%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>

                {/* Supplier Relationships Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mr-4">
                            <UserX className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Pending Verifications</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">2000</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">4.3%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className='bg-white p-8 rounded-lg'>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Start new negotiation */}
                    <button onClick={() => router.push("/user/negotiation")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center justify-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 transition-colors duration-200">
                                <img src="/quick.svg" className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">Edit landing page</h3>
                        </div>
                    </button>

                    {/* Generate report */}
                    <button className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center justify-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 transition-colors duration-200">
                                <img src="/roles.svg" className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">Add roles & permission</h3>
                        </div>
                    </button>

                    {/* View Ecosystem */}
                    <button onClick={() => router.push("/user/ecosystem")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center justify-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 transition-colors duration-200">
                                <img src="/lock.svg" className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">View security logs</h3>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminMetrics;