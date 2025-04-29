"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return <>
          <div className="max-w-[610px]">
            {children}
            </div>
          </>;
}
