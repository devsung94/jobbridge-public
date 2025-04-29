"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/(lib)/utils/apiClient";
import { numberFormatter } from "@/(lib)/utils/common";
import { Card, CardContent } from "@/components/ui/Card";

interface Job {
  idx: number;
  companyName: string;
  title: string;
  endDate: string;
  salary: string;
  experience?: string;       // 추가: 경력
  education?: string;        // 추가: 학력
  companyAddress: string;
  logo?: string; 
}


export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const {data} = await apiClient.get("/jobs?page=1&size=4"); // 4개만 가져옴
        // console.log(data);
        setJobs(data.data.jobs);
      } catch (error) {
        // console.error("채용 공고 불러오기 실패:", error);
        setError("목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <>
      {isLoading && <p className="text-gray-600 mt-4">로딩 중...</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        {!isLoading && !error && jobs.length > 0 ? (
          jobs.map((job) => (
            <Link
              key={job.idx}
              href={`/jobs/${job.idx}/`}
              className="block transition hover:opacity-90"
            >
              <Card className="h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-4">
                    {job.logo ? (
                      <img
                        src={job.logo}
                        alt="회사 로고"
                        className="w-10 h-10 rounded border object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500 shrink-0">
                        N/A
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500">{job.companyName}</div>
                      <h3 className="text-base font-semibold text-gray-800">{job.title}</h3>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1 mt-2">
                    <div className="flex gap-2">
                      <span className="w-14 shrink-0 font-medium text-gray-500">근무지</span>
                      <span className="text-gray-800">{job.companyAddress}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-14 shrink-0 font-medium text-gray-500">연봉</span>
                      <span className="text-gray-800">{numberFormatter(job.salary)}만원</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-14 shrink-0 font-medium text-gray-500">마감일</span>
                      <span className="text-gray-800">{job.endDate}</span>
                    </div>
                  </div>


                  {/* <div className="mt-3">
                    <span className="text-sm text-blue-600 underline">자세히 보기 →</span>
                  </div> */}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          !isLoading && !error && (
            <p className="text-gray-500">등록된 채용 공고가 없습니다.</p>
          )
        )}
      </div>
    </>
  );
}
