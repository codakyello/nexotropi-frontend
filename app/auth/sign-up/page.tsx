"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, HelpCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegister } from '@/services/requests/auth';
import Link from 'next/link';

// Zod validation schema
const signupSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            full_name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const { mutate: registerUser, isPending: registering, isError, error, isSuccess } = useRegister();

    const onSubmit = (data: SignupFormData) => {
        // Split full name into first_name and last_name
        const nameParts = data.full_name.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name as last name if only one name provided

        registerUser({
            email: data.email,
            password: data.password,
            first_name,
            last_name
        });
    };


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Create Your Nexotropi Account
                    </h1>
                    <p className="text-[#959595] text-sm">
                        Start turning uncertainty into clarity
                        <br />
                        with AI-powered simulations.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Success Message */}
                    {isSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            Account created successfully! Please check your email.
                        </div>
                    )}

                    {/* Error Message */}
                    {isError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            {error?.response?.data?.detail}
                        </div>
                    )}

                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name*
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="full_name"
                                {...register('full_name')}
                                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.full_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your full name"
                            />
                            <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.full_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Work Email Address*
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                {...register('email')}
                                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="you@company.com"
                            />
                            <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password*
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                {...register('password')}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password*
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                {...register('confirmPassword')}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={registering}
                        className="w-full bg-[#2B5A8E] justify-center flex cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {registering ? <Loader2 className='animate-spin' /> : 'Create Account'}
                    </button>
                </form>

                {/* <div className="relative my-6">
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
                    Already have an account?{' '}
                    <Link
                        href="/auth/sign-in"
                        className="text-blue-700 hover:text-blue-800 font-medium transition-colors"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}