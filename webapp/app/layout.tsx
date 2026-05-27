import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Williams Equity Capital — Credit Repair Portal",
  description: "Professional FCRA credit repair services. Dispute inaccurate items with a licensed credit repair organization.",
  openGraph: {
    title: "Williams Equity Capital — Credit Repair",
    description: "Dispute inaccurate credit items. Fast, transparent, legally grounded.",
    siteName: "Williams Equity Capital",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
