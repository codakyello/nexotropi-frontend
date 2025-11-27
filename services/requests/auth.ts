import { useMutation } from "@tanstack/react-query";
import Cookies from 'js-cookie';
import { api } from "../axiosInstance";
import { ApiResponse, ForgotPasswordData, LoginData, RegisterData, ResendCodeData, ResetPasswordData, VerifyEmailData, VerifyTokenData } from "../interfaces/auth";
import { useRouter } from "next/navigation";


export const useRegister = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: async (userData: RegisterData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/register', userData);

            // Store token in cookie if it exists in response
            if (response.data.data?.token) {
                Cookies.set('auth_token', response.data.data.token, {
                    expires: 7, // 7 days
                    secure: true,
                    sameSite: 'strict'
                });
            }

            return response.data;
        },
        onSuccess: (data, variables) => {
            console.log('Registration successful:', data.message);
            router.push(`/auth/verify-email?email=${encodeURIComponent(variables.email)}`);
        },
        onError: (error: any) => {
            console.error('Registration error:', error.response.data.detail);
        },
    });
};

// Login Mutation
export const useLogin = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: async (userData: LoginData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/login', userData);

            // Store token in cookie if it exists in response
            if (response.data.data?.token) {
                Cookies.set('auth_token', response.data.data.token, {
                    expires: 7, // 7 days
                    secure: true,
                    sameSite: 'strict'
                });
            }

            return response.data;
        },
        onSuccess: (data) => {
            console.log('Login successful:', data.message);
            router.push("/user/dashboard")
        },
        onError: (error: any) => {
            console.error('Login error:', error.message);
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (data: ForgotPasswordData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/forgot-password', data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Password reset email sent:', data.message);
        },
        onError: (error: any) => {
            console.error('Forgot password error:', error.response?.data?.message || error.message);
        },
    });
};

// Reset Password Mutation
export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: ResetPasswordData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/reset-password', data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Password reset successful:', data.message);
        },
        onError: (error: any) => {
            console.error('Reset password error:', error.response?.data?.message || error.message);
        },
    });
};

// Verify Token Mutation
export const useVerifyToken = () => {
    return useMutation({
        mutationFn: async (data: VerifyTokenData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/verify-token', data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Token verified:', data.message);
        },
        onError: (error: any) => {
            console.error('Token verification error:', error.response?.data?.message || error.message);
        },
    });
};

export const useVerifyEmail = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: VerifyEmailData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/verify-email', data);

            // Store token in cookie if it exists in response
            if (response.data.data?.token) {
                Cookies.set('auth_token', response.data.data.token, {
                    expires: 7, // 7 days
                    secure: true,
                    sameSite: 'strict'
                });
            }

            return response.data;
        },
        onSuccess: (data) => {
            console.log('Email verified successfully:', data.message);
            setTimeout(() => {
                router.push('/auth/sign-in');
            }, 4000);
        },
        onError: (error: any) => {
            console.error('Email verification error:', error.response?.data?.detail || error.message);
        },
    });
};

export const useResendCode = () => {
    return useMutation({
        mutationFn: async (data: ResendCodeData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/auth/user/resend-code', data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Code resent successfully:', data.message);
        },
        onError: (error: any) => {
            console.error('Resend code error:', error.response?.data?.detail || error.message);
        },
    });
};