import { useMutation } from "@tanstack/react-query";
import { api } from "../axiosInstance";
import { ApiResponse } from "../interfaces/auth";

// Contact form data interface
export interface ContactData {
    full_name: string;
    email: string;
    organization: string;
    message: string;
}

// Contact Mutation
export const useContact = () => {
    return useMutation({
        mutationFn: async (data: ContactData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/contact/submit', data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Contact form submitted successfully:', data.message);
        },
        onError: (error: any) => {
            console.error('Contact form error:', error.response?.data?.detail || error.message);
        },
    });
};