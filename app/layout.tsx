import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "wearshare — 의상 대여 플랫폼",
  description: "특별한 날의 의상을 이웃과 나눠요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1C1007] font-sans antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-sm text-stone-400 border-t border-[#E8DDD0] bg-[#FFFCF9]">
          © 2024 wearshare
        </footer>
      </body>
    </html>
  );
}
