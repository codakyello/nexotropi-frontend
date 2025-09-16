import React from 'react';
import { Building2, User, Mail, Phone, FileText, Download } from 'lucide-react';

const NegotiationSummary = () => {
    return (
        <div className="">
            {/* Section Title */}
            <div className='bg-white p-6 rounded-lg mb-12'>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Negotiation Summary
                </h2>

                {/* Description */}
                <div className="mb-10">
                    <p className="text-gray-600 leading-relaxed text-base">
                        This negotiation pertains to the supply of premium grade steel materials for our manufacturing facility. The materials will be used for structural components and require specific quality certifications.
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Category */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                Category
                            </h3>
                            <p className="text-gray-600 text-base">
                                Raw Materials
                            </p>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                Timeline
                            </h3>
                            <p className="text-gray-600 text-base">
                                12 months contract
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Quantity */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                Quantity
                            </h3>
                            <p className="text-gray-600 text-base">
                                2 tons per month
                            </p>
                        </div>

                        {/* Delivery Date */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                Delivery Date
                            </h3>
                            <p className="text-gray-600 text-base">
                                01/09/2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Parties Involved Section */}
            <div className="bg-white p-6 rounded-lg mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Parties Involved
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Buyer */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Buyer
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center text-gray-600">
                                <Building2 className="h-5 w-5 mr-3 text-gray-400" />
                                <span>Global Manufacturing Corp</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <User className="h-5 w-5 mr-3 text-gray-400" />
                                <span>John Smith</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                                <span>john.smith@globalcom</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>

                    {/* Supplier */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Supplier
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center text-gray-600">
                                <Building2 className="h-5 w-5 mr-3 text-gray-400" />
                                <span>Premium Steel Industries</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <User className="h-5 w-5 mr-3 text-gray-400" />
                                <span>Sarah Johnson</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                                <span>sarah.j@premiumsteelcom</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                                <span>+1 (555) 987-6543</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attachments & Documents Section */}
            <div className="bg-white p-6 rounded-lg mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Attachments & Documents
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Document 1 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm text-gray-900">Initial_Proposal.pdf</h4>
                                    <p className="text-sm text-gray-500 mt-1">01/08/2025 • 2.4 MB</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                <Download className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Document 2 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm text-gray-900">Technical_Specifications.docx</h4>
                                    <p className="text-sm text-gray-500 mt-1">02/08/2025 • 1.8 MB</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                <Download className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Document 3 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm text-gray-900">Quality_Certificates.pdf</h4>
                                    <p className="text-sm text-gray-500 mt-1">03/08/2025 • 3.1 MB</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                <Download className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-16 flex flex-wrap justify-center gap-4">
                <button className="px-6 py-2 cursor-pointer bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    Download Summary
                </button>
                <button className="px-6 py-2 cursor-pointer bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors duration-200">
                    Reject offer
                </button>
                <button className="px-6 py-2 cursor-pointer bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200">
                    Accept Offer
                </button>
                <button className="px-6 py-2 cursor-pointer bg-[#1A4A7A] text-white font-medium rounded-lg transition-colors duration-200">
                    Resume Negotiation
                </button>
            </div>
        </div>
    );
};

export default NegotiationSummary;