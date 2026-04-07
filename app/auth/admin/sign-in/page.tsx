"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminLogin, useLogin } from '@/services/requests/auth';
import Link from 'next/link';

function getAuthErrorMessage(error: any) {
    return (
        error?.response?.data?.errors?.[0]?.message
        || error?.response?.data?.message
        || error?.response?.data?.detail
        || error?.message
        || "Invalid credentials"
    )
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const { mutate: login, isPending, isError, error } = useAdminLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            return;
        }

        login({ email, password });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Admin Portal
                    </h1>
                    <p className="text-[#959595] text-sm">
                        Secure access to manage and monitor
                        <br />
                        your platform operations.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Message */}
                    {isError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {getAuthErrorMessage(error)}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Work Email Address*
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isPending}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password*
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isPending}
                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isPending}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={isPending}
                                className="w-4 h-4 accent-[#1A4A7A] border-gray-300 rounded focus:ring-2 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Remember me</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => router.push("/auth/forgot-password")}
                            disabled={isPending}
                            className="text-sm cursor-pointer text-[#1A4A7A] hover:text-[#1A4A7A] font-medium transition-colors disabled:opacity-50"
                        >
                            Forgot Password
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || !email || !password}
                        className="w-full bg-[#2B5A8E] cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}
