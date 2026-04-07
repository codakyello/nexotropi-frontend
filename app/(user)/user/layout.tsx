import UserDashboardLayout from "@/components/layout/UserDashboardLayout";


export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body suppressHydrationWarning>
            <UserDashboardLayout>{children}</UserDashboardLayout>
        </body>
    );
}
