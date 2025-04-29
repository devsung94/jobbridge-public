"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import UserDropDown from "@/components/mypage/UserDropDown";
import { SearchBox } from "@/components/ui/SearchBox";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  const showSearchBox = ["/", "/jobs", "/community", "/search"].includes(pathname);
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    router.push(`/search?query=${searchTerm}`);
  };

  return (
    <div>
      <header className="max-w-6xl mx-auto px-4 py-3 bg-white rounded-xl shadow flex justify-between items-center mt-4 mb-5">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          JobBridge
        </Link>

        {/* 네비 */}
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/jobs" className="hover:text-blue-600 transition">채용공고</Link>
          <Link href="/community" className="hover:text-blue-600 transition">커뮤니티</Link>
        </nav>

        {/* 유저 영역 */}
        <div className="flex items-center gap-4">
          <UserDropDown />
        </div>
      </header>

      {showSearchBox && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <SearchBox
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      )}
    </div>
  );
}
