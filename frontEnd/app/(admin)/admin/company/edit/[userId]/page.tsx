// /admin/company/edit/[userId] - 관리자용 회사 정보 수정 페이지
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import CompanyEditPage from "@/components/mypage/company/CompanyEditPage";

export default function AdminCompanyEditWrapper() {
  const { userId } = useParams();

  return <CompanyEditPage userId={userId as string} />; 
}
