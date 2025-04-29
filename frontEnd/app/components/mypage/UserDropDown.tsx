"use client";
import { useState, useEffect } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import { useAuth } from "@/(lib)/utils/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotificationSocket } from "@/(lib)/hooks/useNotificationSocket"; // 위치 맞춰서 import
import { useNotificationCount, resetNotificationCount } from "@/(lib)/hooks/useNotificationCount";

export default function UserDropDown() {
  const { role, userIdx, userName, isLoggedIn, checkAuth } = useAuth();
  const router = useRouter();
  // 예시: 알림 개수 상태 (추후 fetch로 대체 가능)
  const [notificationCount, setNotificationCount] = useNotificationCount();

  const logout = async () => {
    try {
      if (!confirm("정말 로그아웃 하시겠습니까?")) return;
      const response = await apiClient.post("/auth/logout");

      if (response.data.result === "Y") {
        alert(response.data.message);
        await checkAuth();
        router.push("/login");
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

  
  // WebSocket 구독
  useNotificationSocket(userIdx, (notification) => {
    setNotificationCount((prev) => prev + 1); // 뱃지 증가
  });

  useEffect(() => {
    if (!isLoggedIn || !userIdx) return;
  
    const fetchNotifications = async () => {
      try {
        const { data } = await apiClient.get("/user/notifications/unread-count");
        // console.log(data);
        setNotificationCount(data.data.count);
      } catch (error) {
        console.error("알림 개수 조회 실패:", error);
      }
    };
  
    fetchNotifications();
  }, [isLoggedIn, userIdx]);
  

  return (
    <>
        {isLoggedIn ? (
          <>
            {/* 알림 */}
            <button
              className="relative"
              onClick={() => router.push("/notifications")}
              title="알림"
            >
              <Bell className="w-6 h-6 text-gray-600 hover:text-blue-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {notificationCount}
                </span>
              )}
            </button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition text-sm font-medium text-gray-800"
                    >
                        <UserCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600">{userName}님</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 mt-2">
                {role === 'admin' ? (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>관리자</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => router.push("/mypage")}>마이페이지</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </>
            ) : (
            <>
                <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition"
                    >
                    로그인
                </Link>

            </>
        )}
    </>
  );
}
