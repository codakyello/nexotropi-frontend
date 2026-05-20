import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useGetWaitlistEntries = () => {
    return useQuery({
        queryKey: ['waitlistEntries'],
        queryFn: async (): Promise<ApiResponse> => {
            const response = await api.get<ApiResponse>('/waitlist/admin/entries');
            return response.data;
        },
        retry: 1,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: true,
    });
};

export const useDeleteWaitlistEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entryId: number | string): Promise<ApiResponse> => {
            const response = await api.delete<ApiResponse>(`/waitlist/admin/entries/${entryId}`);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Waitlist entry deleted successfully:', data.message);
            // Invalidate and refetch waitlist entries
            queryClient.invalidateQueries({ queryKey: ['waitlistEntries'] });
        },
        onError: (error: any) => {
            console.error('Delete waitlist entry error:', error.response?.data?.detail || error.message);
        },
    });
};