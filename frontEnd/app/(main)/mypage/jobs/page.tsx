"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { Button } from "@/components/ui/Button";
import { numberFormatter } from "@/(lib)/utils/common";
import { useAuth } from "@/(lib)/utils/AuthContext";
import Pagination from "@/components/ui/Pagination";
import { Building2 } from "lucide-react";

interface JobPost {
  idx: number;
  title: string;
  companyName: string;
  logo?: string;
  salary?: string;
  companyAddress?: string;
  applicantCount: string;
  startDate: string;
  endDate: string;
  regDate: string;
}

export default function JobPostListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = 5;

  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchMyJobPosts = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/com/jobs/mine?page=${currentPage}&size=${pageSize}`);
        if (data.result === "Y") {
          // console.log(data);
          setJobPosts(data.data.myJobs);
          setTotalPages(data.data.totalPages);
          setTotalElements(data.data.totalElements);
        }
      } catch (err) {
        console.error("공고 목록 요청 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchMyJobPosts();
  }, [userId, currentPage, pageSize]);

  const handleView = (idx: number) => router.push(`/jobs/${idx}?mode=posts`);
  const handlePageChange = (newPage: number) => router.push(`/mypage/jobs?page=${newPage}&size=${pageSize}`);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border max-w-4xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-1">
            <Building2 className="w-5 h-5 text-blue-500" />
          </h2>
          <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
            총 {totalElements}개
          </span>
        </div>
        <Button
          variant={"white"}
          size={"sm"}
          onClick={() => router.back()}
        >
          ← 뒤로가기
        </Button>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">로딩 중...</p>
      ) : jobPosts.length === 0 ? (
        <p className="text-center text-gray-500">등록한 채용공고가 없습니다.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {jobPosts.map((post) => (
              <li
                key={post.idx}
                className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:bg-gray-50 transition"
              >
                <div className="flex gap-4 items-start">
                  {post.logo ? (
                    <img
                      src={post.logo}
                      alt="회사 로고"
                      className="w-14 h-14 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400 border">
                      No Logo
                    </div>
                  )}

                  <div>
                    <button
                      onClick={() => handleView(post.idx)}
                      className="text-base font-semibold text-blue-600 hover:underline text-left cursor-pointer"
                    >
                      {post.title}
                    </button>
                    <p className="text-sm text-gray-600 mt-1">{post.companyName}</p>
                    <p className="text-sm text-gray-500 mt-1">{post.companyAddress || "근무지 정보 없음"}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      연봉: {post.salary ? `${numberFormatter(post.salary)}만원` : "협의 가능"} · 마감일: {new Date(post.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="min-w-[110px] text-center">
                  <button
                    onClick={() => router.push(`/mypage/jobs/${post.idx}/applications`)}
                    className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full border hover:bg-gray-200 cursor-pointer"
                  >
                    지원자 {numberFormatter(post.applicantCount) || 0}명
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
