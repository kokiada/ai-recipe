import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "らくらく献立 - 3秒で今日の献立が決まる",
  description: "毎日の献立決めを3秒で解決。冷蔵庫の食材から瞬時に今晩の献立を提案する主婦特化型献立支援アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-base`}
      >
        {children}
      </body>
    </html>
  );
}
