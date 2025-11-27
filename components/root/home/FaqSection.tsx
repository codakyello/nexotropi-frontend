"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export default function FaqSection() {
    const [openQuestion, setOpenQuestion] = useState(0);

    const faqs = [
        {
            question: "What is Nexotropi?",
            answer: "Nexotropi is a pioneering B2B platform that creates \"living digital ecosystems\"—hyper-realistic AI replicas of entire businesses. These AI replicas can then autonomously interact with each other, simulating and negotiating complex business deals in a virtual environment before translating the outcomes into real-world actions."
        },
        {
            question: "How is Nexotropi different from a traditional digital twin or a chatbot?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        },
        {
            question: "How is Nexotropi different from a traditional digital twin or a chatbot?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        },
        {
            question: "Can the AI really negotiate on my behalf?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        },
        {
            question: "How is my company's data kept safe and private?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        },
        {
            question: "What kinds of business deals can the AI negotiate?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        },
        {
            question: "How long does a pilot program take and what's the cost?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        },
        {
            question: "Who is your target customer?",
            answer: "How is Nexotropi different from a traditional digital twin or a chatbot?"
        }
    ];

    const toggleQuestion = (index: number) => {
        setOpenQuestion(openQuestion === index ? -1 : index);
    };

    return (
        <section className="py-20 bg-[#E8EDF2]">
            <div className="bg-white py-10">
                {/* Header */}
                <div className="text-center mb-16 px-4">
                    <h2 className="text-[2rem] font-bold text-gray-900 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        These questions and answers are designed to build trust, provide clarity on our unique value proposition,
                        <br />
                        and address common concerns from potential clients.
                    </p>
                </div>
                <div className="grid container mx-auto lg:grid-cols-2 gap-12 items-start max-w-7xl px-6 lg:px-8">
                    {/* Left Side - 3D Question Mark */}
                    <div className="relative">
                        <Image src="/faq.png" alt="pioneer" width={550} height={700} />
                    </div>

                    {/* Right Side - FAQ List */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`border-b border-gray-200 overflow-hidden ${openQuestion === index ? 'bg-[#E8EDF2]' : 'bg-white'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full px-3 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-1 h-6 bg-gray-900 rounded-full flex-shrink-0 mt-1"></div>
                                        <span className="text-gray-900 font-medium text-base">
                                            {faq.question}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 ml-4">
                                        {openQuestion === index ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {openQuestion === index && faq.answer && (
                                    <div className="px-6 pb-5">
                                        <div className="ml-5 pl-4 border-l border-gray-200">
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}