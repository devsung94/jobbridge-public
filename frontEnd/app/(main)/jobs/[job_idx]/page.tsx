"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { OptionType } from "@/components/ui/LabeledSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import apiClient from "@/(lib)/utils/apiClient";
import { getLabel } from "@/(lib)/utils/labelHelper";
import { numberFormatter } from "@/(lib)/utils/common";
import {Button} from "@/components/ui/Button"; // 버튼 컴포넌트 경로에 맞게 수정
import {
  companyOptions,
  industryOptions,
  experienceOptions,
  educationOptions
} from "@/constants/options";
import CompanyDetailModal from "@/components/job/CompanyDetailModal";
import { SmartButton } from "@/components/ui/SmartButton";


interface JobDetail {
  idx: number;
  userId: string;
  title: string;
  description: string;
  experience: string;
  education: string;
  salary: string;
  preferred: string;
  startDate: string;
  endDate: string;
  company: string;
  address: string;
  
  logo: string;           //기업로고
  companyType: string;    //기업유형
  companyName: string;    //기업명
  ceoName: string;        //기업CEO이름
  industry: string;       //업종
  employeeCount: number;  //사원수
  foundedDate: string;    //설립일
  companyAddress: string; //회사주소
}

export default function JobDetailPage() {
  const router = useRouter();
  const { job_idx } = useParams();
  const { userId, isLoggedIn, role } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [applicationStatus, setApplicationStatus] = useState<{
    isUse: "Y" | "N";
    isRead: "Y" | "N";
    isStatus: "W" | "Y" | "N" | "C";
  } | null>(null);

  // 상태
  const [selectedCompany, setSelectedCompany] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const mode = searchParams.get("mode");
  const backUrl = queryString ? `/jobs?${queryString}` : "/jobs";

  const backHandler = () => {
    (mode=="posts" ? router.back() : router.push(`/jobs?${queryString}`));
  }

  // 클릭 시 호출
  const handleCompanyClick = (company: JobDetail) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const { data } = await apiClient.get(`/jobs/${job_idx}`);
        setJob(data.data);
      } catch (error) {
        console.error("채용 공고 상세 정보를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkIfApplied = async () => {
      if (!isLoggedIn || role !== "user") return;
      try {
        const { data } = await apiClient.get(`/user/applications/applied/${job_idx}`);
        // console.log(data);
        if (data.result === "Y") {
          setApplicationStatus(data.data); // null이거나 객체
        }
      } catch (error) {
        console.error("지원 상태 확인 중 오류 발생:", error);
      }
    };

    if (job_idx) {
      fetchJobDetail();
      checkIfApplied();
    }
  }, [job_idx, isLoggedIn, role]);

  const handleApplication = async () => {
    if (!isLoggedIn || role !== "user") {
      alert("로그인 후 다시 시도해주세요.");
      router.replace("/login");
      return;
    }

    try {
      // 1. 이력서 존재 여부 확인
      const resumeStatusRes = await apiClient.get("/user/resume/status");
      // console.log(resumeStatusRes);
      const hasResume = resumeStatusRes.data.result;
  
      if (hasResume==='N') {
        const goToResume = confirm("이력서가 등록되어 있지 않습니다. 이력서를 작성하러 가시겠습니까?");
        if (goToResume) {
          router.push("/mypage/resume/create");
        }
        return;
      }

      if (!confirm("정말 해당 공고에 지원하시겠습니까?")) return;

      const { data } = await apiClient.post(`/user/applications/apply/${job_idx}`);
      console.log(data);
      if (data.result === "Y") {
        alert("채용 지원이 완료되었습니다.");
        setApplicationStatus({
          isUse: "Y",
          isRead: "N",
          isStatus: "W"
        });
      } else {
        
        alert(data.message);
      }
    } catch (error:any) {
      console.error("지원 오류:", error);
      alert(error.data.message);
    }
  };

  const handleCancelApplication = async () => {
    if (!isLoggedIn || role !== "user") {
      alert("로그인 후 다시 시도해주세요.");
      router.replace("/login");
      return;
    }

    if (!confirm("정말 지원 취소 하시겠습니까?")) return;

    try {
      const { data } = await apiClient.post(`/user/applications/cancel/${job_idx}`);
      if (data.result === "Y") {
        alert("채용 지원이 취소되었습니다.");
        setApplicationStatus({
          isUse: "N",
          isRead: "N",
          isStatus: "C"
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("지원 취소 오류:", error);
      alert("지원 취소 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 공고를 삭제하시겠습니까?")) return;
  
    try {
      await apiClient.delete(`/com/jobs/${job_idx}`);
      alert("공고가 삭제되었습니다.");
      if(mode=="posts"){
        router.push("/mypage/jobs"); // 마이페이지 공고 목록으로 이동
      }else{
        router.push("/jobs"); // 마이페이지 공고 목록으로 이동
      }
    } catch (error) {
      console.error("삭제 중 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };  

  if (loading) {
    return <div className="text-center text-gray-600 p-8">채용 공고 정보를 불러오는 중...</div>;
  }

  if (!job) {
    return <div className="text-center text-red-500 p-8">해당 채용 공고를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-blue-700">{job.title}</h2>
      <p className="text-gray-600 mt-2">
        {job.company}<br />
        {job.address}
      </p>
      <p className="text-sm text-gray-500 mt-1">채용 기간: {job.startDate} ~ {job.endDate}</p>
      {/* 회사 정보 요약 박스 */}
      <div 
        className="mt-8 bg-gray-50 p-4 border rounded-md cursor-pointer" 
        onClick={() => handleCompanyClick(job)} >
        <div className="flex items-center gap-4">
          {job.logo && (
            <img
              src={job.logo}
              alt="회사 로고"
              className="w-16 h-16 rounded border object-cover"
            />
          )}
          <div className="space-y-1 text-sm text-gray-800">
            <p><strong>{job.companyName}</strong></p>
            <p>{getLabel(industryOptions,job.industry)} | {getLabel(companyOptions,job.companyType)}</p>
            <p>{job.companyAddress}</p>
          </div>
        </div>
      </div>
      
      {/* 모달 렌더링 */}
      <CompanyDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        company={selectedCompany}
      />

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">상세 내용</h3>
        <div className="ProseMirror text-sm" dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">채용 조건</h3>

        <Card className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex">
              <dt className="w-24 font-medium text-gray-500">경력</dt>
              <dd className="text-gray-800">{getLabel(experienceOptions, job.experience)}</dd>
            </div>
            <div className="flex">
              <dt className="w-24 font-medium text-gray-500">학력</dt>
              <dd className="text-gray-800">{getLabel(educationOptions, job.education)}</dd>
            </div>
            <div className="flex">
              <dt className="w-24 font-medium text-gray-500">연봉</dt>
              <dd className="text-gray-800">{numberFormatter(job.salary)}만원</dd>
            </div>
            {job.preferred && (
              <div className="flex sm:col-span-2">
                <dt className="w-24 font-medium text-gray-500">우대사항</dt>
                <dd className="text-gray-800 whitespace-pre-line">{job.preferred}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>



      {/* 버튼 영역 */}
      <div className="mt-6 flex flex-wrap gap-4">
        {userId === job.userId && isLoggedIn && (
          <>
            <Button
              variant="primary"
              onClick={() => router.push(`/jobs/edit/${job.idx}?${queryString}`)}
            >
              수정하기
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              삭제하기
            </Button>
          </>
        )}

        {isLoggedIn && role === "user" && (() => {
          const { isUse, isStatus, isRead } = applicationStatus || {};

          // 이력서 열람상태
          if (isRead === "Y"){
            return (
              <Button variant="translucent" onClick={()=>{alert("이미 열람되었거나 면접제의/불합격\n처리된 지원은 취소할 수 없습니다.")}}>
                지원 취소
              </Button>
            );
          }

          // 지원하고 대기 상태
          if (isUse === "Y" && isStatus === "W") {
            return (
              <SmartButton variant="danger" onClick={handleCancelApplication}>
                지원 취소
              </SmartButton>
            );
          }

          // 지원취소 했거나 없을때 상태
          if (isUse !== "Y" || isStatus === "C") {
            return (
              <SmartButton  variant="default" onClick={handleApplication}>
                지원하기
              </SmartButton>
            );
          }

          return null; // 합격(Y), 불합격(N)은 아무것도 표시하지 않음
        })()}



        <Button 
          variant="gray" 
          onClick={backHandler}
          >
          목록으로 돌아가기
        </Button>
      </div>
  </div>
  );
}
