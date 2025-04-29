"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import apiClient from "@/(lib)/utils/apiClient";

export default function Sidebar() {
  const pathname = usePathname();
  const { userId, isLoggedIn } = useAuth();
  const { checkAuth } = useAuth();

  const menu: any = [
    { label: "대시보드", path: "/admin" },
    { label: "방문자 조회", path: "/admin/visitors" },
    { label: "사용자 관리", path: "/admin/users" },
    { label: "채용공고 관리", path: "/admin/jobs" },
    { label: "커뮤니티 관리", path: "/admin/community" },
    { label: "문의 관리", path: "/admin/inquiry" },
    { label: "캐시 관리", path: "/admin/cache" },
    { label: "캐시 초기화", isAction: true },
    { label: "설정", path: "/admin/settings" },
  ];

  const handleClearCache = async () => {
    if (!confirm("정말 캐시를 전부 초기화 하시겠습니까?")) {
      return;
    }

    try {
      const { data } = await apiClient.post("/admin/cache/clear-all");

      if (data.result === "Y") {
        alert("모든 캐시 초기화 완료되었습니다!");
      } else {
        alert("캐시 초기화 실패: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("캐시 초기화 중 오류가 발생했습니다.");
    }
  };

  return (
    <aside className="w-64 bg-white shadow-md p-4 border-r border-gray-200">
      <nav className="text-gray-600 space-y-4">
        {menu.map((item: any) => {
          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={handleClearCache}
                className="block w-full text-left px-2 py-1 rounded hover:text-red-400 text-gray-600 cursor-pointer"
              >
                {item.label}
              </button>
            );
          }

          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-2 py-1 rounded hover:text-blue-400 ${
                isActive ? "text-blue-600 font-semibold bg-blue-50" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
