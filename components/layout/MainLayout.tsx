"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: true,
            staleTime: 5 * 60 * 1000,
        },
    },
});

export default function MainLayout({ children }: { children: React.ReactNode }) {

    return (
        <QueryClientProvider client={queryClient}>
            <main className="flex-1 overflow-y-auto">{children}</main>
            <Toaster />
        </QueryClientProvider>
    );
}
