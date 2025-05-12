import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CreateToastProvider from "./CreateToastProvider";

import "./globals.css";
import '@/app/docs/highlight.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo List",
  description: "A todo list app built with Supabase and Next.js using optimized pagination for 100,000 records",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CreateToastProvider>
          {children}
        </CreateToastProvider>
      </body>
    </html>
  );
}
