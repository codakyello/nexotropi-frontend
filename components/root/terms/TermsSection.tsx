"use client"
import React, { useState } from 'react';

const TermsSection = () => {
    const [activeSection, setActiveSection] = useState('acceptance');

    const tableOfContents = [
        { id: 'acceptance', title: 'Acceptance of Terms' },
        { id: 'use', title: 'Your Use of the Services' },
        { id: 'intellectual', title: 'Intellectual Property' },
        { id: 'termination', title: 'Termination' },
        { id: 'disclaimer', title: 'Disclaimer of Warranties' },
        { id: 'limitation', title: 'Limitation of Liability' },
        { id: 'governing', title: 'Governing Law' },
        { id: 'changes', title: 'Changes to Terms' },
        { id: 'contact', title: 'Contact Us' },
    ];

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-4 gap-2">

                    {/* Table of Contents Sidebar */}
                    <div className="lg:col-span-1 h-max hidden sm:flex">
                        <div className="bg-white rounded-lg px-8 p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Table of Contents</h3>
                            <nav className="space-y-3">
                                {tableOfContents.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`block w-full text-left text-sm cursor-pointer transition-colors duration-200 hover:text-[#1A4A7A] ${activeSection === item.id
                                            ? 'text-[#1A4A7A] font-medium'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        {item.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg p-6 sm:p-8">

                            {/* Section 1 */}
                            <section id="acceptance" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    By accessing or using our Services, you agree to be bound by these Terms and our Privacy
                                    Policy. If you disagree with any part of the terms, then you may not access the Services. These
                                    Terms apply to all visitors, users, and others who access or use the Services.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section id="use" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Your Use of the Services</h2>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            <span className="font-semibold">Eligibility:</span> You must be at least 18 years of age and legally capable of entering into the
                                            Agreement to use our Services.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            <span className="font-semibold">Account Responsibility:</span> You are responsible for safeguarding the password that you use to
                                            access the Services and for any activities or actions under your password. You agree not to
                                            disclose your password to any third party.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-700 leading-relaxed mb-3">
                                            <span className="font-semibold">Prohibited Uses:</span> You agree not to use the Services for any unlawful purpose, or in any way
                                            that could harm the Services or our reputation. This includes, but is not limited to:
                                        </p>
                                        <ul className="list-disc ml-6 text-gray-700">
                                            <li>Unauthorized access to our systems, data scraping, or using the Services to facilitate illegal activities.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="intellectual" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Intellectual Property</h2>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            <span className="font-semibold">Company&apos;s IP:</span> The Services and their original content, features, and functionality are and will
                                            remain the exclusive property of NexusForge AI, Inc.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            <span className="font-semibold">User&apos;s IP (Inventions):</span> You agree that all inventions, intellectual property, and creative work
                                            (collectively, &apos;Inventions&apos;) conceived or created by you while using the Services and related to
                                            the Company's business shall be the sole property of the Company. You agree to promptly
                                            disclose and assign all rights to such Inventions to us.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            <span className="font-semibold">User&apos;s IP (Data):</span> Your proprietary enterprise data that you upload to our platform remains
                                            your intellectual property. You grant us a limited, non-exclusive license to use this data solely
                                            for the purpose of providing and improving the Services (e.g., for AI model training via
                                            federated learning).
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="termination" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Termination</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We may terminate or suspend your account and bar access to the Services immediately,
                                    without prior notice or liability, for any reason whatsoever, including without limitation if you
                                    breach the Terms. Upon termination, your right to use the Services will immediately cease.
                                </p>
                            </section>

                            {/* Section 5 */}
                            <section id="disclaimer" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Disclaimer of Warranties</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    The Services are provided on an &apos;AS IS&apos; and &apos;AS AVAILABLE&apos; basis. We make no
                                    representations or warranties of any kind, express or implied, as to the operation of their
                                    Services or the information, content, or materials included therein. You expressly agree that
                                    your use of the Services is at your sole risk.
                                </p>
                            </section>

                            {/* Section 6 */}
                            <section id="limitation" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Limitation of Liability</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    In no event shall NexusForge AI, Inc., nor its directors, employees, partners, agents, suppliers, or
                                    affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
                                    including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                                    resulting from (a) your access to or use of or inability to access or use the Services; (b) any
                                    conduct or content of any third party on the Services; (c) any content obtained from the
                                    Services; and (d) unauthorized access, use or alteration of your transmissions or content,
                                    whether based on warranty, contract, tort (including negligence) or any other legal theory,
                                    whether or not we have been informed of the possibility of such damage.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section id="governing" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Governing Law</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    These Terms shall be governed and construed in accordance with the laws of Delaware,
                                    United States, without regard to its conflict of law provisions.
                                </p>
                            </section>

                            {/* Section 8 */}
                            <section id="changes" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Changes to Terms</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We
                                    will provide at least 30 days&apos; notice prior to any new terms taking effect. By continuing to
                                    access or use our Services after those revisions become effective, you agree to be bound by
                                    the revised terms.
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section id="contact" className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Contact Us</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    If you have any questions about these Terms, please contact us at:
                                </p>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                                    <p className="text-gray-900 font-semibold mb-1">NexusForge AI, Inc.</p>
                                    <p className="text-[#1A4A7A] font-medium">nexusforge-ai@outlook.com</p>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsSection;