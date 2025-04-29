'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBox } from "@/components/ui/SearchBox";

export default function Nav() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="flex justify-between items-center py-5">
      {/* 메인 메뉴 */}
      <nav className="flex space-x-6">
        <Link href="/jobs" className="text-blue-600 font-semibold hover:underline">채용공고</Link>
        <Link href="/community" className="text-blue-600 font-semibold hover:underline">커뮤니티</Link>
      </nav>

      <div className="w-1/4 max-w-md">
        <SearchBox
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}
