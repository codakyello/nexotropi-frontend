"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: true,
            staleTime: 0,
        },
    },
});

export default function MainLayout({ children }: { children: React.ReactNode }) {

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    );
}
