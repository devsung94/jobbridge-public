"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Next.js의 라우터 사용
import { useAuth } from "@/(lib)/utils/AuthContext";
import apiClient from "@/(lib)/utils/apiClient";

export default function Header() {
  const router = useRouter(); // Next.js 클라이언트 라우팅
  const { userName, isLoggedIn } = useAuth();
  const { checkAuth } = useAuth(); // 로그인 상태 갱신 함수 가져오기

  const logout = async () => {
    try {
      if(!confirm('정말 로그아웃 하시겠습니까?')) return;
      const response = await apiClient.post("/auth/logout");

      if (response.data.result === "Y") {
        alert(response.data.message); // 로그아웃 성공 메시지
        await checkAuth();
        router.push("/login"); // Next.js 방식으로 로그인 페이지 이동
      } else {
        alert("로그아웃에 실패했습니다.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("로그아웃 실패:", error.response.data);
        alert(`로그아웃 실패: ${error.response.data.message || "서버 오류 발생"}`);
      } else if (error.request) {
        console.error("요청 실패:", error.request);
        alert("서버 응답이 없습니다. 네트워크 상태를 확인하세요.");
      } else {
        console.error("에러 발생:", error.message);
        alert("로그아웃 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <header className="bg-blue-600 shadow p-4 flex justify-between items-center border-b border-blue-400">
      <h1 className="text-2xl font-bold text-white">JobBridge</h1>
      <nav className="flex space-x-4">
        {isLoggedIn ? (
          <>
            <span className="text-white font-semibold">{userName}님 환영합니다 🎉</span>
            <Link href="/" className="text-white hover:text-blue-200">홈으로</Link>
            <button onClick={() => logout()} className="text-white hover:text-blue-200">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-white hover:text-blue-200">로그인</Link>
            <Link href="/signup" className="text-white hover:text-blue-200">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
