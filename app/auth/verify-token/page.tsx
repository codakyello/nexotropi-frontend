"use client"
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useResendCode } from '@/services/requests/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyTokenContent = () => {
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || 'user@company.com';

    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [email] = useState(emailFromUrl);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { mutate: resendCode, isPending: isResending, isSuccess: resendCodeSuccess } = useResendCode();
    const router = useRouter();

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

    const verifyToken = (token: string) => {
        setIsVerifying(true);
        setVerifyError(null);

        // Simulate loading for 2 seconds
        setTimeout(() => {
            // Store token in localStorage
            localStorage.setItem('resetToken', token);
            setIsVerifying(false);
            setIsSuccess(true);
        }, 2000);
    };

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
            verifyToken(fullCode);
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
                verifyToken(newCode.join(''));
            }
        }
    };

    const handleResendCode = () => {
        resendCode({ email });
        // Clear the current code inputs
        setCode(['', '', '', '', '', '']);
        setVerifyError(null);
        inputRefs.current[0]?.focus();
    };

    const handleSubmit = () => {
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            verifyToken(fullCode);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Code Verified Successfully!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your reset code has been verified. You can now reset your password.
                    </p>
                    <button
                        onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(emailFromUrl)}`)}
                        className="w-full bg-[#2B5A8E] cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
                    >
                        Continue to Reset Password
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm p-8 md:p-12">
                <button
                    onClick={() => router.back()}
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
                        Reset Your Password
                    </h1>
                    <p className="text-[#959595] text-sm">
                        We've sent a 6-digit verification code to
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
                    {verifyError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {verifyError}
                        </div>
                    )}

                    {/* Code Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Enter Verification Code
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
                                    disabled={isVerifying || isResending}
                                    className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${verifyError ? 'border-red-500' : 'border-gray-300'
                                        } ${isVerifying || isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        disabled={isVerifying || isResending || code.some(digit => digit === '')}
                        className="w-full bg-[#2B5A8E] justify-center flex cursor-pointer hover:bg-[#234a75] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVerifying ? <Loader2 className='animate-spin w-5 h-5' /> : 'Verify Code'}
                    </button>

                    {/* Resend Code */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResendCode}
                                disabled={isVerifying || isResending}
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

export default function VerifyTokenPage() {
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
            <VerifyTokenContent />
        </Suspense>
    );
}