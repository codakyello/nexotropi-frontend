import { useMutation } from "@tanstack/react-query";
import { WaitlistData } from "../interfaces/waitlist";
import { ApiResponse } from "../interfaces/auth";
import { api } from "../axiosInstance";

export const useWaitlist = () => {
    return useMutation({
        mutationFn: async (data: WaitlistData): Promise<ApiResponse> => {
            const response = await api.post<ApiResponse>('/waitlist/join', data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Waitlist form submitted successfully:', data.message);
        },
        onError: (error: any) => {
            console.error('Waitlist form error:', error.response?.data?.detail || error.message);
        },
    });
}