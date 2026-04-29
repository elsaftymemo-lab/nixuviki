import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '800'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: "NIXUVIK - 📚 المكتبة الذكية",
  description: "المكتبة الذكية مع مساعد زيكو",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap" />
      </head>
      <body className={`${cairo.variable} font-cairo antialiased`}>
        {children}
      </body>
    </html>
  );
}