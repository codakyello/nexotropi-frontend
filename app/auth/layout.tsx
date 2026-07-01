import AuthHeader from "@/components/layout/AuthNavbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AuthHeader />
            {children}
        </>
    );
}
