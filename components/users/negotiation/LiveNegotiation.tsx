"use client"
import React, { useState } from 'react';
import { Send, Pause, X, Check, AlertTriangle, MoreVertical } from 'lucide-react';
import { Label } from "@/components/ui/label"
import Image from 'next/image';
import { Switch } from "@/components/ui/switch"

export default function LiveNegotiations() {
    const [inputValue, setInputValue] = useState('');
    const [isAiEnabled, setIsAiEnabled] = useState(true);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Initiating negotiation for Product X procurement. Target price range: $45,000 - $55,000',
            timestamp: '10:34 AM',
            isLeft: true
        },
        {
            id: 2,
            type: 'supplier',
            content: 'We can supply 1000 units at $58,000. Quality guaranteed with 90-day warranty.',
            timestamp: '10:34 AM',
            isLeft: false
        },
        {
            id: 3,
            type: 'ai',
            content: 'Your price is above our budget range. Can you consider $50,000 for bulk order?',
            timestamp: '10:34 AM',
            isLeft: true
        },
        {
            id: 4,
            type: 'supplier',
            content: 'Best we can do is $54,000 with extended payment terms of 60 days.',
            timestamp: '10:34 AM',
            isLeft: false
        },
        {
            id: 5,
            type: 'alert',
            content: 'ALERT: Counterparty proposal ($54,000) exceeds maximum budget. Requesting human intervention.',
            timestamp: '10:34 AM',
            isLeft: false
        }
    ]);

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            const newMessage = {
                id: messages.length + 1,
                type: 'human',
                content: inputValue,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                isLeft: true
            };
            setMessages([...messages, newMessage]);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Global Manufacturing Corp</h1>
                        <p className="text-gray-600">John Smith</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="flex items-center mt-4 space-x-3">
                    <label htmlFor="ai-agent" className="text-sm font-medium text-gray-700">
                        AI Agent
                    </label>
                    <button
                        id="ai-agent"
                        onClick={() => setIsAiEnabled(!isAiEnabled)}
                        className={`relative inline-flex h-5 cursor-pointer w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:ring-offset-2 ${isAiEnabled ? 'bg-[#1A4A7A]' : 'bg-gray-200'
                            }`}
                        role="switch"
                        aria-checked={isAiEnabled}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAiEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="h-150 overflow-y-auto p-6 space-y-6 mb-16">
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start ${message.isLeft ? '' : 'flex-row-reverse'} space-x-3`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 ${!message.isLeft ? 'ml-3' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'alert' ? 'bg-orange-100' :
                                message.isLeft ? 'bg-blue-50' : 'bg-green-50'
                                }`}>
                                {message.type === 'alert' ? (
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                ) : message.isLeft ? (
                                    <Image src="/live.svg" width={20} height={20} alt="icon" />
                                ) : (
                                    <Image src="/livetwo.svg" width={20} height={20} alt="icon" />
                                )}
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 min-w-0 ${!message.isLeft ? 'mr-3' : ''}`}>
                            <div className={`max-w-lg ${message.isLeft ? '' : 'ml-auto'}`}>
                                <div className={`px-4 py-3 rounded-2xl ${message.type === 'alert'
                                    ? 'bg-orange-50 border border-orange-200'
                                    : message.isLeft
                                        ? 'bg-gray-100'
                                        : 'bg-green-100'
                                    }`}>
                                    <p className="text-[#1F2937] leading-relaxed">{message.content}</p>
                                </div>
                                <div className={`mt-2 text-xs text-gray-500 ${message.isLeft ? '' : 'text-right'}`}>
                                    {message.timestamp}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Human-in-the-Loop Controls */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Human-in-the-Loop Controls</h3>

                <div className="flex space-x-3 mb-10">
                    <button className="flex flex-1 items-center cursor-pointer justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                    </button>

                    <button className="flex flex-1 justify-center cursor-pointer items-center text-red-500 px-6 py-3 bg-red-100 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
                        <X className="w-4 h-4 mr-2 text-[#D92D20]" />
                        <span className='text-[#D92D20]'>Reject and counter</span>
                    </button>

                    <button className="flex flex-1 cursor-pointer items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                        <Check className="w-4 h-4 mr-2" />
                        Accept offer
                    </button>
                </div>

                {/* Input Area */}
                <div className="relative">
                    <div className="border-2 border-dashed border-[#1A4A7A] rounded-lg p-1">
                        <div className="flex space-x-3">
                            <div className="flex-1">
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter text here"
                                    className="w-full px-4 py-2 border-0 bg-transparent resize-none focus:outline-none text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <button
                                onClick={handleSendMessage}
                                className="px-2 py-2 cursor-pointer bg-[#1A4A7A] text-white rounded-lg hover:bg-[#0f3660] transition-colors flex items-center justify-center self-end mb-1"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}