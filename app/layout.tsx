import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Williams Equity Capital | Professional Credit Repair Services",
  description:
    "Start repairing your credit today with Williams Equity Capital. Our professional credit repair program disputes inaccurate items on your behalf — fast, transparent, and effective.",
  keywords: [
    "credit repair",
    "credit score",
    "dispute letters",
    "credit bureaus",
    "financial services",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0d4a3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
