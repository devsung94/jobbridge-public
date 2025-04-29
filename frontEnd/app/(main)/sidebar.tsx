"use client";
import React from "react";
import Link from "next/link";
import { FaHome, FaBriefcase, FaUser, FaFileAlt, FaBuilding } from "react-icons/fa";
import { useAuth } from "@/(lib)/utils/AuthContext";

export default function Sidebar() {
  const { userId, isLoggedIn } = useAuth();
  const { checkAuth } = useAuth();


  return (
    <aside className="w-64 bg-white shadow-md p-4 border-r border-gray-200">
      <nav className="space-y-4">
        <Link href="/" className="flex items-center text-gray-800 font-semibold hover:text-blue-500">
          <FaHome className="mr-2" /> 홈
        </Link>
        <Link href="/jobs" className="flex items-center text-gray-800 font-semibold hover:text-blue-500">
          <FaBriefcase className="mr-2" /> 채용 공고
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link href="/mypage" className="flex items-center text-gray-800 font-semibold hover:text-blue-500">
              <FaUser className="mr-2" /> 마이페이지
            </Link>
            <Link href="/resume" className="flex items-center text-gray-800 font-semibold hover:text-blue-500">
              <FaFileAlt className="mr-2" /> 이력서 등록
            </Link>
            <Link href="/recruiter" className="flex items-center text-gray-800 font-semibold hover:text-blue-500">
              <FaBuilding className="mr-2" /> 채용 담당자
            </Link>
          </>
        ) : (
          <></>
        )}
      </nav>
    </aside>
  );
}
