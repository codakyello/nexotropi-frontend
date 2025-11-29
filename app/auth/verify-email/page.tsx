"use client"
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useVerifyEmail, useResendCode } from '@/services/requests/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyEmailContent = () => {
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || 'user@company.com';

    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [email] = useState(emailFromUrl);
    const [resendSuccess, setResendSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { mutate: verifyEmail, isPending, isError, error, isSuccess } = useVerifyEmail();
    const { mutate: resendCode, isPending: isResending, isSuccess: resendCodeSuccess } = useResendCode();
    const router = useRouter()

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Show success message when code is resent
    useEffect(() => {
        if (resendCodeSuccess) {
            setResendSuccess(true);
            const timer = setTimeout(() => setResendSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [resendCodeSuccess]);

    const handleChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (value && index === 5 && newCode.every(digit => digit !== '')) {
            const fullCode = newCode.join('');
            verifyEmail({ email, code: fullCode });
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');

        if (pastedData.every(char => /^\d$/.test(char))) {
            const newCode = [...code];
            pastedData.forEach((char, idx) => {
                if (idx < 6) newCode[idx] = char;
            });
            setCode(newCode);

            const nextIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();

            if (newCode.every(digit => digit !== '')) {
                verifyEmail({ email, code: newCode.join('') });
            }
        }
    };

    const handleResendCode = () => {
        resendCode({ email });
        // Clear the current code inputs
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    const handleSubmit = () => {
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            verifyEmail({ email, code: fullCode });
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Email Verified Successfully!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your account has been verified. Redirecting you to sign in...
                    </p>
                    <button
                        onClick={() => router.push("/auth/sign-in")}
                        className="w-full bg-[#2B5A8E] cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
                    >
                        Continue to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <button
                    onClick={() => console.log('Go back')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-[#2B5A8E]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Verify Your Email
                    </h1>
                    <p className="text-[#959595] text-sm">
                        We've sent a 6-digit confirmation code to
                        <br />
                        <span className="font-medium text-gray-700">{email}</span>
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Success Message for Resend */}
                    {resendSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                            Code resent successfully! Check your email.
                        </div>
                    )}

                    {/* Error Message */}
                    {isError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {(error as any)?.response?.data?.detail || 'Verification failed. Please try again.'}
                        </div>
                    )}

                    {/* Code Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Enter Confirmation Code
                        </label>
                        <div className="flex gap-2 justify-center mb-2">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isPending || isResending}
                                    className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isError ? 'border-red-500' : 'border-gray-300'
                                        } ${isPending || isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Hint: Try code 890454
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || isResending || code.some(digit => digit === '')}
                        className="w-full bg-[#2B5A8E] justify-center flex cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className='animate-spin w-5 h-5' /> : 'Verify Email'}
                    </button>

                    {/* Resend Code */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResendCode}
                                disabled={isPending || isResending}
                                className="text-[#2B5A8E] hover:text-[#234a75] font-medium transition-colors disabled:opacity-50"
                            >
                                {isResending ? 'Resending...' : 'Resend Code'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-xs text-gray-500">
                    Make sure to check your spam folder if you don't see the email.
                </p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
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
            <VerifyEmailContent />
        </Suspense>
    );
}