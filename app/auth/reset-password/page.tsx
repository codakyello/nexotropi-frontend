"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useResetPassword } from '@/services/requests/auth';
import Link from 'next/link';
import { ResetPasswordData } from '@/services/interfaces/auth';

interface ResetPasswordForm {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || 'user@company.com';
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<ResetPasswordForm>({
        mode: 'onBlur',
        defaultValues: {
            email: emailFromUrl,
            newPassword: '',
            confirmPassword: ''
        }
    });

    const { mutate: resetPassword, isPending, isError, error } = useResetPassword();

    const newPassword = watch('newPassword');

    useEffect(() => {
        setValue('email', emailFromUrl);
    }, [emailFromUrl, setValue]);

    const onSubmit = (data: ResetPasswordForm) => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('resetToken');

        if (!token) {
            console.error('No reset token found');
            return;
        }

        const payload: ResetPasswordData = {
            email: data.email,
            code: token,
            new_password: data.newPassword
        };

        resetPassword(payload, {
            onSuccess: () => {
                // Clear the token from localStorage after successful reset
                localStorage.removeItem('resetToken');
                setIsSuccess(true);
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Password Reset Successful!
                        </h1>
                        <p className="text-[#959595] text-sm mb-8">
                            Your password has been successfully reset.
                            <br />
                            You can now sign in with your new password.
                        </p>
                        <button
                            onClick={() => router.push("/auth/sign-in")}
                            className="w-full cursor-pointer bg-[#2B5A8E] hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
                        >
                            Continue to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <Link
                    href="/auth/forgot-password"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-[#2B5A8E]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Reset Your Password
                    </h1>
                    <p className="text-[#959595] text-sm">
                        Create a new password for your account
                        <br />
                        <span className="font-medium text-gray-700">{emailFromUrl}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {isError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {(error as any)?.response?.data?.message || (error as any)?.response?.data?.detail || "Failed to reset password. Please try again."}
                        </div>
                    )}

                    {/* Hidden email field */}
                    <input type="hidden" {...register('email')} />

                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password*
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                {...register('newPassword', {
                                    required: 'New password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Password must contain uppercase, lowercase, and number'
                                    }
                                })}
                                disabled={isPending}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter new password"
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
                        {errors.newPassword && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.newPassword.message}</p>
                        )}
                        <p className="mt-1.5 text-xs text-gray-500">
                            Must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password*
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                        value === newPassword || 'Passwords do not match'
                                })}
                                disabled={isPending}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isPending}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#2B5A8E] cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Resetting Password...</span>
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link
                        href="/auth/login"
                        className="text-[#2B5A8E] hover:text-[#234a75] font-medium transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2B5A8E] mx-auto" />
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}