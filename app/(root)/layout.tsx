import Footer from "@/components/layout/Footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="p-0 m-0">
            {children}
            <Footer />
        </div>
    );
}
