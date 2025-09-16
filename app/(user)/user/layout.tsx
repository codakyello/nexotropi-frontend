import DashboardLayout from "@/components/layout/DashboardLayout";


export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <DashboardLayout>{children}</DashboardLayout>
        </body>
    );
}
