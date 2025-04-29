"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { JobDTO, CommunityDTO } from "@/(types)/searchTypes"; // ✨ 타입 정의 따로 분리 추천
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { communityTypeOptions } from "@/constants/options";
import { getLabel } from "@/(lib)/utils/labelHelper";

const PAGE_SIZE = 5;

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  // 검색 결과 상태
  const [jobResults, setJobResults] = useState<JobDTO[]>([]);
  const [jobTotalPages, setJobTotalPages] = useState(0);
  const [jobPage, setJobPage] = useState(1);

  const [communityResults, setCommunityResults] = useState<CommunityDTO[]>([]);
  const [commTotalPages, setCommTotalPages] = useState(0);
  const [commPage, setCommPage] = useState(1);

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults();
    }
  }, [query, jobPage, commPage]);

  const fetchSearchResults = async () => {
    try {
      const [jobRes, commRes] = await Promise.all([
        apiClient.get("/search/jobs", {
          params: { query, page: jobPage, size: PAGE_SIZE },
        }),
        apiClient.get("/search/community", {
          params: { query, page: commPage, size: PAGE_SIZE },
        }),
      ]);
      // console.log(jobRes);

      setJobResults(jobRes.data.content);
      setJobTotalPages(jobRes.data.totalPages);

      setCommunityResults(commRes.data.content);
      setCommTotalPages(commRes.data.totalPages);
    } catch (err) {
      console.error("검색 오류", err);
    }
  };

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">‘{query}’ 검색 결과</h1>

      {/* 채용공고 결과 */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-2">채용공고</h2>
        {jobResults?.length > 0 ? (
          <>
            <ul className="space-y-3">
              {jobResults.map((job) => (
                <li
                  key={job.idx}
                  className="border p-4 rounded hover:bg-gray-50 transition cursor-pointer"
                >
                  <Link href={`/jobs/${job.idx}`} className="block space-y-2">
                    {/* 상단 - 로고 + 회사명 + 제목 */}
                    <div className="flex items-center gap-4">
                      {job.logo ? (
                        <img
                          src={job.logo}
                          alt="회사 로고"
                          className="w-10 h-10 rounded border object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">
                          N/A
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-gray-500">{job.companyName}</div>
                        <div className="text-base font-semibold text-gray-800 hover:underline">{job.title}</div>
                      </div>
                    </div>

                    {/* 하단 - 추가 정보 */}
                    <div className="text-sm text-gray-700 space-y-1 mt-2">
                      <div className="flex gap-2">
                        <span className="w-14 text-gray-500">근무지</span>
                        <span>{job.companyAddress}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-14 text-gray-500">연봉</span>
                        <span>{Number(job.salary).toLocaleString()}만원</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-14 text-gray-500">마감일</span>
                        <span>{job.endDate}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination
              currentPage={jobPage}
              totalPages={jobTotalPages}
              onPageChange={setJobPage}
            />
          </>
        ) : (
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        )}
      </div>

      {/* 커뮤니티 결과 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">커뮤니티 게시글</h2>
        {communityResults.length > 0 ? (
          <>
            <ul className="space-y-3">
              {communityResults.map((post) => (
                <li
                  key={post.idx}
                  className="border p-4 rounded hover:bg-gray-50 transition cursor-pointer"
                >
                  <Link href={`/community/${post.idx}`} className="block space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span className="text-blue-600">[{getLabel(communityTypeOptions,post.category)}]</span>
                      <span>
                        조회 {post.views} | 댓글 {post.commentsCount}
                      </span>
                    </div>
                    <div className="text-base font-semibold text-gray-800 hover:underline">
                      {post.title}
                    </div>
                    <p className="text-sm text-gray-500">
                      작성자: {post.isAnonymous === "Y" ? "익명" : post.userName} |{" "}
                      {new Date(post.regDate).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>


            <Pagination
              currentPage={commPage}
              totalPages={commTotalPages}
              onPageChange={setCommPage}
            />
          </>
        ) : (
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
