// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Assuming a global CSS file for Tailwind directives

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TikTok Creator Insight Assistant",
  description: "Generate TikTok video ideas with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
