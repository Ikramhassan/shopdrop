import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";
import QueryProvider from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopDrop — Best Deals Delivered to Sri Lanka",
  description: "Find amazing products from AliExpress at unbeatable prices, delivered fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <QueryProvider>
          <Navbar />
          <main>{children}</main>
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
