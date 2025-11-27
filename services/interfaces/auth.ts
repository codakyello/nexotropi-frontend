export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ApiResponse {
    data: Record<string, any>;
    message: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    email: string;
    code: string;
    new_password: string;
}

export interface VerifyTokenData {
    token: string;
}

export interface VerifyEmailData {
    email: string;
    code: string;
}

export interface ResendCodeData {
    email: string;
}