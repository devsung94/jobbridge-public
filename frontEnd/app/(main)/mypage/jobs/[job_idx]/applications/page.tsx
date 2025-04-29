"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { ResumeResponseDTO } from "@/(types)/resume";
import { Users } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { numberFormatter } from "@/(lib)/utils/common";
import { Button } from "@/components/ui/Button";

export default function ApplicantsListPage() {
  const router = useRouter();
  const { job_idx } = useParams();
  const [applicants, setApplicants] = useState<ResumeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [validApplicants, setValidApplicants] = useState(0);
  const pageSize = 5;

  const fetchApplicants = async (page: number) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/com/jobs/${job_idx}/applications`, {
        params: { page: page, size: pageSize },
      });

      // console.log(data);

      if (data.result === "Y") {
        setApplicants(data.data.applicants);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
        setValidApplicants(data.data.validApplicants);
      } else {
        alert(data.message || "지원자 목록을 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("지원자 목록 요청 실패:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (job_idx) {
      fetchApplicants(currentPage);
    }
  }, [job_idx, currentPage]);

  const handleClick = async (applicant: ResumeResponseDTO) => {
    try {
      if (applicant.isRead === "N") {
        await apiClient.post(`/com/jobs/applications/read/${applicant.idx}`);
      }
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    } finally {
      router.push(`/mypage/jobs/${job_idx}/applications/${applicant.idx}`);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Y":
        return <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">면접 제의</span>;
      case "N":
        return <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">불합격</span>;
      case "C":
        return <span className="text-xs bg-gray-200 text-gray-500 font-medium px-2 py-0.5 rounded-full">지원취소</span>;
      default:
        return <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">대기중</span>;
    }
  };

  return (
    <div className="w-full mx-auto p-2">
      
      <div className="flex justify-between items-center mb-6">

        {/* 오른쪽 - 지원자 + 뒤로가기 묶기 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              누적 지원자 {numberFormatter(totalElements)}명
            </span>
          </div>

          {/* 왼쪽 - 누적 지원자 */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
              지원자 {numberFormatter(validApplicants)}명
            </span>
          </div>
        </div>
        
        {/* 왼쪽 - 누적 지원자 */}
        <div className="flex items-center gap-2">
            <Button
              variant={"white"}
              size={"sm"}
              onClick={() => router.back()}
            >
            ← 뒤로가기
          </Button>
        </div>
        
      </div>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : applicants.length === 0 ? (
        <p className="text-gray-500">지원자가 없습니다.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {applicants.map((applicant) => (
              <li
                key={applicant.idx}
                onClick={() => handleClick(applicant)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border hover:shadow-sm cursor-pointer transition ${
                  applicant.isUse === "N" || applicant.isStatus === "N" || applicant.isStatus === "C" ? "opacity-40" : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* 사진 */}
                <img
                  src={applicant.photo || "/default-profile.png"}
                  alt="지원자"
                  className="w-16 h-16 rounded-full object-cover border"
                />

                {/* 정보 */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-800">
                      {applicant.isExperienced} 지원자
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${applicant.isRead === "N" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                        {applicant.isRead === "N" ? "📬 미열람" : "✅ 열람 완료"}
                      </span>
                      {getStatusBadge(applicant.isStatus)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600  line-clamp-2">
                    {applicant.careerSummary || "자기소개 내용이 없습니다."}
                  </p>
                  <p className="text-xs text-gray-400">지원일: {new Date(applicant.regDate).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              size="sm"
              maxPageButtons={5}
            />
        </>  
      )}

    </div>
  );
}
