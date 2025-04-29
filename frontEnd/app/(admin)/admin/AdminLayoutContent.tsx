"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import Header from "@/(admin)/admin/header";
import Sidebar from "@/(admin)/admin/sidebar";
import Footer from "@/(admin)/admin/footer";

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // 로딩 중일 때는 아무것도 하지 않음

    // console.log("관리자 체크:", { role, isLoggedIn });

    if (!isLoggedIn || role !== "admin") {
      alert("관리자만 접근할 수 있습니다.");
      router.push("/");
    }
  }, [role, isLoggedIn, isLoading, router]);

  // 인증 데이터가 로드될 때까지 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-white shadow-md">{children}</main>
      </div>
      <Footer />
    </>
  );
}
