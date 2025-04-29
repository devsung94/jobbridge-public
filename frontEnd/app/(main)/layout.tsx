// RootLayout.tsx
import React from "react";
import "./globals.css"; // 글로벌 CSS (필요한 경우)
import Header from "@/(main)/header"; // 클라이언트 컴포넌트로 분리된 Header
import Nav from "@/(main)/nav";
import Footer from "@/(main)/footer";
import { AuthProvider } from "@/(lib)/utils/AuthContext"; // AuthProvider 추가
import PageHeader from "@/components/ui/PageHeader";
import VisitorTracker from "@/components/visitor/VisitorTracker"; // 경로 맞게

export const metadata = {
  title: "잡브릿지 - 구직자와 구인자를 위한 플랫폼",
  description: "잡브릿지는 구직자와 구인자를 연결하는 플랫폼입니다.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="font-sans">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 ">
      <VisitorTracker /> {/* 🔥 여기서 방문자 체크 */}
      <AuthProvider>
        <div className="flex flex-1">
          <main className="max-w-2xl max-w-4xl mx-auto border border-gray-200 bg-white shadow-md p-2">
            <div className=" px-4 mx-auto max-w-[610px] min-w-[610px] min-h-[900px] ">
              <Header />
              {/* <Nav /> */}
              <PageHeader/>
              
              {children}
            </div>
          </main>
        </div>
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
