"use client"
import React, { useState } from 'react';
import { ArrowLeft, Lock, Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useForgotPassword } from '@/services/requests/auth';
import Link from 'next/link';

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<ForgotPasswordForm>({
        mode: 'onBlur',
        defaultValues: {
            email: ''
        }
    });

    const { mutate: forgotPassword, isPending, isError, error } = useForgotPassword();

    const emailValue = watch('email');

    const onSubmit = (data: ForgotPasswordForm) => {
        forgotPassword(data, {
            onSuccess: () => {
                setSubmittedEmail(data.email);
                setIsSuccess(true);
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-[#2B5A8E]" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Check Your Email
                        </h1>
                        <p className="text-[#959595] text-sm mb-8">
                            We've sent a 6-digit password reset code to
                            <br />
                            <span className="font-medium text-gray-700">{submittedEmail}</span>
                        </p>
                        <button
                            onClick={() => router.push(`/auth/verify-token?email=${encodeURIComponent(submittedEmail)}`)}
                            className="w-full cursor-pointer bg-[#2B5A8E] hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
                        >
                            Enter Reset Code
                        </button>
                        <p className="text-center mt-6 text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="text-[#1A4A7A] hover:text-[#1A4A7A] font-medium transition-colors"
                            >
                                Resend code
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-[#2B5A8E]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Forgot Password?
                    </h1>
                    <p className="text-[#959595] text-sm">
                        Enter your registered email, and we'll
                        <br />
                        send you a code to reset your password.
                    </p>
                </div>

                <div className="space-y-5">
                    {isError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {(error as any)?.response?.data?.message || (error as any)?.response?.data?.detail || "Failed to send reset code. Please try again."}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Work Email Address*
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                            disabled={isPending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && emailValue && !errors.email) {
                                    handleSubmit(onSubmit)();
                                }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                }`}
                            placeholder="you@company.com"
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isPending || !emailValue || !!errors.email}
                        className="w-full bg-[#2B5A8E] cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Sending Code...</span>
                            </>
                        ) : (
                            'Send Reset Code'
                        )}
                    </button>
                </div>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link
                        href="/auth/login"
                        className="text-[#1A4A7A] hover:text-[#1A4A7A] font-medium transition-colors"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}