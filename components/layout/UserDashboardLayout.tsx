"use client";
import UserNavbar from "./UserNavbar";
import UsersSidebar from "./UsersSidebar";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen bg-gray-50">
            <UsersSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <UserNavbar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
