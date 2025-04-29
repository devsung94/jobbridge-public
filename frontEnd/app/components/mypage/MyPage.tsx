"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/(lib)/utils/AuthContext";
import {
  User,
  FileText,
  Building2,
  ClipboardList,
  HelpCircle,
  LogOut,
  MessageSquare,
} from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const { userName, role, isLoggedIn, checkAuth } = useAuth();
  const [hasCompany, setHasCompany] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    if (role === "com") {
      const fetchCompanyStatus = async () => {
        try {
          const { data } = await apiClient.get("/com/company/status");
          setHasCompany(data.result === "Y");
        } catch (error) {
          console.error("회사 정보 상태 확인 오류:", error);
        }
      };
      fetchCompanyStatus();
    } else {
      const fetchResumeStatus = async () => {
        try {
          const { data } = await apiClient.get("/user/resume/status");
          setHasResume(data.result === "Y");
        } catch (error) {
          console.error("이력서 상태 확인 오류:", error);
        }
      };
      fetchResumeStatus();
    }
  }, []);

  const handleLeave = async () => {
    try {
      if (!confirm("정말 탈퇴하시겠습니까?")) return;
      const { data } = await apiClient.delete("/user/withdraw");
      if (data.result === "Y") {
        alert("회원 탈퇴가 성공적으로 처리되었습니다.");
        await checkAuth();
        router.push("/login");
      } else {
        alert("회원 탈퇴 실패: " + data.message);
      }
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const menuItemClass =
    "p-5 bg-white rounded-xl shadow hover:shadow-md transition flex items-center space-x-3 cursor-pointer";

  return (
    <div className="max-w-2xl mx-auto mt-6 grid grid-cols-1 gap-4">
      <div onClick={() => router.push("/mypage/edit-info")} className={menuItemClass}>
        <User className="w-5 h-5 text-blue-600" />
        <span>정보 수정</span>
      </div>

      {role === "com" ? (
        <>
          <div
            onClick={() =>
              hasCompany
                ? router.push("/mypage/company/edit")
                : router.push("/mypage/company/create")
            }
            className={menuItemClass}
          >
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>{hasCompany ? "회사정보 수정" : "회사정보 등록"}</span>
          </div>
          <div
            onClick={() => router.push("/mypage/jobs")}
            className={menuItemClass}
          >
            <ClipboardList className="w-5 h-5 text-green-600" />
            <span>내가 올린 공고 목록</span>
          </div>
        </>
      ) : (
        <>
          <div
            onClick={() =>
              hasResume
                ? router.push("/mypage/resume/edit")
                : router.push("/mypage/resume/create")
            }
            className={menuItemClass}
          >
            <FileText className="w-5 h-5 text-purple-600" />
            <span>{hasResume ? "이력서 수정" : "이력서 등록"}</span>
          </div>
          <div
            onClick={() => router.push("/mypage/appliedJobs")}
            className={menuItemClass}
          >
            <ClipboardList className="w-5 h-5 text-green-600" />
            <span>내가 지원한 공고 목록</span>
          </div>
        </>
      )}
      
      {/* 일반 유저만 보이는 메뉴 영역 */}
      <div
        onClick={() => router.push("/mypage/community/posts")}
        className={menuItemClass}
      >
        <MessageSquare className="w-5 h-5 text-pink-600" />
        <span>작성한 커뮤니티 목록</span>
      </div>


      <div onClick={() => router.push("/mypage/inquiry")} className={menuItemClass}>
        <HelpCircle className="w-5 h-5 text-gray-600" />
        <span>고객센터 (FAQ & 문의하기)</span>
      </div>

      <div onClick={handleLeave} className={menuItemClass}>
        <LogOut className="w-5 h-5 text-red-600" />
        <span>탈퇴하기</span>
      </div>
    </div>
  );
}
