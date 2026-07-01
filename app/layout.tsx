import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Nexotropi",
  description: "Enabling autonomous negotiation and strategic simulation by creating living digital ecosystems of your business.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased text-foreground bg-background"
        suppressHydrationWarning
      >
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
