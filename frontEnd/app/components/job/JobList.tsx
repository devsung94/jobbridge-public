"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { numberFormatter } from "@/(lib)/utils/common";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import { JobSearchBar } from "./JobSearchBar";

interface Job {
  idx: number;
  companyName: string;
  title: string;
  endDate: string;
  salary: string;
  experience?: string;
  education?: string;
  companyAddress: string;
  logo?: string;
}

export default function JobListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 5;
  const initialKeyword = searchParams.get("keyword") || "";
  const initialCity = searchParams.get("city") || "";

  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const currentParams = searchParams.toString();

  const handleSearch = () => {
    const query = new URLSearchParams({ page: "1", size: pageSize.toString() });
    if (searchKeyword.trim()) query.set("keyword", searchKeyword.trim());
    if (selectedCity) query.set("city", selectedCity);
    router.push(`/jobs?${query.toString()}`);
  };

  const fetchJobs = async () => {
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });
      const keyword = searchParams.get("keyword");
      const city = searchParams.get("city");
      if (keyword?.trim()) query.set("keyword", keyword.trim());
      if (city) query.set("city", city);

      const { data } = await apiClient.get(`/jobs?${query.toString()}`);
      if (data.result === "Y") {
        setJobs(data.data.jobs);
        setTotalPages(data.data.totalPages);
      } else {
        setJobs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("채용 공고를 불러오는 중 오류 발생:", error);
      setJobs([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, pageSize, searchParams]);

  const handlePageChange = (newPage: number) => {
    router.push(`/jobs?page=${newPage}&size=${pageSize}`);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-2 mt-2 mb-6">
        <JobSearchBar
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          onSearch={handleSearch}
        />

        {role === "com" && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap"
            onClick={() => router.push(`/jobs/new`)}
          >
            + 채용 공고 등록
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="mt-6 text-center text-gray-500">등록된 채용 공고가 없습니다.</div>
      ) : (
        <>
          <ul className="space-y-3">
            {jobs.map(({ idx, logo, companyName, title, companyAddress, salary, endDate }) => (
              <li
                key={idx}
                className="border p-4 rounded hover:bg-gray-50 transition cursor-pointer"
              >
                <Link href={`/jobs/${idx}?${currentParams}`} className="block space-y-2">
                  <div className="flex items-center gap-4">
                    {logo ? (
                      <img
                        src={logo}
                        alt="회사 로고"
                        className="w-10 h-10 rounded border object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">
                        N/A
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">{companyName}</div>
                      <div className="text-base font-semibold text-gray-800 hover:underline">
                        {title}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1 mt-2">
                    <div className="flex gap-2">
                      <span className="w-14 text-gray-500">근무지</span>
                      <span>{companyAddress}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-14 text-gray-500">연봉</span>
                      <span>{numberFormatter(salary)}만원</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-14 text-gray-500">마감일</span>
                      <span>{endDate}</span>
                    </div>
                  </div>
                </Link>
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
    </>
  );
}
