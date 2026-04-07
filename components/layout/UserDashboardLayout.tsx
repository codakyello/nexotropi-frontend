"use client";
import UserNavbar from "./UserNavbar";
import UsersSidebar from "./UsersSidebar";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen bg-background relative overflow-hidden">
            {/* Background Gradient Orbs for atmosphere */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
            
            <UsersSidebar />
            <div className="flex-1 flex flex-col overflow-hidden z-10">
                <UserNavbar />
                <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                    <div className="max-w-[1400px] mx-auto w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
