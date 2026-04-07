"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/services/requests/auth';
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

    const { mutate: login, isPending, isError, error } = useLogin();

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
                        Welcome Back to Nexotropi
                    </h1>
                    <p className="text-[#959595] text-sm">
                        Your gateway to clarity, automation,
                        <br />
                        and business growth.
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

                {/* 
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6091C15.3636 13.3 14.6545 14.3591 13.5909 15.0682V17.5773H16.8182C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4" />
                        <path d="M10.2 20C12.9 20 15.1727 19.1045 16.8182 17.5773L13.5909 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59091 16.0227 5.37273 14.2636 4.58636 11.9H1.25455V14.4909C2.89091 17.7591 6.28636 20 10.2 20Z" fill="#34A853" />
                        <path d="M4.58636 11.9C4.37727 11.3 4.25909 10.6591 4.25909 10C4.25909 9.34091 4.37727 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC04" />
                        <path d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9364 2.6C15.1682 0.986364 12.8955 0 10.2 0C6.28636 0 2.89091 2.24091 1.25455 5.50909L4.58636 8.1C5.37273 5.73636 7.59091 3.97727 10.2 3.97727Z" fill="#EA4335" />
                    </svg>
                    <span className="text-gray-700 font-medium">Sign in with Google</span>
                </button> */}

                <p className="text-center mt-6 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        href="/auth/sign-up"
                        className="text-[#1A4A7A] hover:text-[#1A4A7A] font-medium transition-colors disabled:opacity-50"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
