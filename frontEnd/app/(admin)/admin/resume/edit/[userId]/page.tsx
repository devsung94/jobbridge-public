// /admin/company/edit/[userId] - 관리자용 회사 정보 수정 페이지
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import ResumeEditPage from "@/components/mypage/resume/ResumeEditPage";

export default function AdminResumeEditWrapper() {
  const { userId } = useParams();

  return <ResumeEditPage userId={userId as string} />; // userIdOverride로 사용자 강제 지정
}
