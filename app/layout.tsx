import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ULIP — Unified Logistics Interface Platform",
  description:
    "Government of India's unified logistics gateway for multi-modal data exchange, verification, and tracking. Operated by NICDC Logistics Data Services Limited.",
  keywords: "ULIP, logistics, India, FASTag, Vahan, Sarathi, GSTIN, E-Way Bill, multi-modal tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
