import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import UserPrivateRoute from "@/components/layout/UserPrivateRoute";


export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body suppressHydrationWarning>
            <UserPrivateRoute>
                <UserDashboardLayout>{children}</UserDashboardLayout>
            </UserPrivateRoute>
        </body>
    );
}
