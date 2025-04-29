import {AuthProvider } from "@/(lib)/utils/AuthContext";
import AdminLayoutContent from "@/(admin)/admin/AdminLayoutContent";
import "@/(main)/globals.css"; // 글로벌 CSS (필요한 경우)

export const metadata = {
  title: "잡브릿지-관리자 페이지",
  description: "관리자 페이지 입니다.",
  icons: { icon: "/favicon.ico" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="font-sans">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <AuthProvider> {/* 최상위에서 감싸기 */}
          <AdminLayoutContent>{children}</AdminLayoutContent> {/* 별도 클라이언트 컴포넌트에서 `useAuth()` 실행 */}
        </AuthProvider>
      </body>
    </html>
  );
}
