import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Williams Equity Capital — Credit Repair",
  description: "Professional credit repair services by Williams Equity Capital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
