"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { useRouter, useSearchParams  } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import apiClient from "@/(lib)/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { calculateAge, formatDateTime } from "@/(lib)/utils/common";
import ResumePreview from "@/(main)/mypage/resume/ResumePreview";
import { ResumeResponseDTO } from "@/(types)/resume";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import { Building2, Users } from "lucide-react";
import AdminListHeader from "@/components/admin/AdminListHeader";


interface Job {
  idx: number;
  companyName: string;
  title: string;
  endDate: string;
  salary: string;
  isUse: string;
  companyAddress: string;
  applicantCount: number;
  regDate:string;
}

export default function ManageJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [applicants, setApplicants] = useState<ResumeResponseDTO[]>([]);
  const [applicantsPage, setApplicantsPage] = useState(1);
  const [applicantsTotalPages, setApplicantsTotalPages] = useState(1);
  const [applicantsTotalElements, setApplicantsTotalElements] = useState(0);


  const [selectedResume, setSelectedResume] = useState<ResumeResponseDTO | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const size = 10;

  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState({
    searchBy: "companyName",
    query: "",
  });
  const [filterValues, setFilterValues] = useState({
    searchBy: "companyName",
    query: "",
  });

  const filters = [
    {
      key: "searchBy",
      label: "검색 기준",
      options: [
        { value: "companyName", label: "회사명" },
        { value: "title", label: "공고 제목" },
      ],
    },
  ];

  // 2. 검색 실행 함수
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchInput.query) searchParams.set("query", searchInput.query);
    if (searchInput.searchBy) searchParams.set("searchBy", searchInput.searchBy);
    searchParams.set("page", "1");
  
    router.push(`/admin/jobs?${searchParams.toString()}`);
    setPage(1);
  };
  
  useEffect(() => {
    const paramQuery = searchParams.get("query") || "";
    const paramSearchBy = searchParams.get("searchBy") || "companyName";

    setSearchInput({ searchBy: paramSearchBy, query: paramQuery });
    setFilterValues({ searchBy: paramSearchBy, query: paramQuery });
    fetchJobs(page, paramSearchBy, paramQuery);
  }, [searchParams, page]);

  // 3. fetchJobs에서 쿼리 반영
  const fetchJobs = async (pageNumber: number, searchBy: string, query: string) => {
    const params: Record<string, any> = {
      page: pageNumber,
      size,
    };
    if (query && searchBy) {
      params[searchBy] = query;
    }
    // console.log("params",params);

    const { data } = await apiClient.get("/admin/jobs", { params });
    // console.log(data);
    if(data.result==='Y'){
      setJobs(data.data.jobs);
      setTotalPages(data.data.totalPages);
      setTotalElements(data.data.totalElements);
    }else{
      setJobs([]);
      setTotalPages(1);
      setTotalElements(0);
    }
  };


  const fetchApplicants = async (pageNumber: number, jobId: number) => {
    const { data } = await apiClient.get(`/admin/jobs/${jobId}/applications?page=${pageNumber}&size=5`);
    // console.log(data);
    if(data.result==="Y"){
      setApplicants(data.data.applicants || []);
      setApplicantsTotalPages(data.data.totalPages);
      setApplicantsTotalElements(data.data.totalElements);
    }else{
      setApplicants([]);
      setApplicantsTotalPages(1);
      setApplicantsTotalElements(0);
    }
  };

  const handlePageChange = async(pageNumber: number) => {
    if (selectedJobId !== null && selectedJobId !== undefined) {
      await fetchApplicants(pageNumber, selectedJobId);
      setApplicantsPage(pageNumber);
    } else {
      setApplicantsPage(1);
      console.error("지원자 목록을 불러올 채용공고가 선택되지 않았습니다.");
    }
  }
  
  const openApplicantModal = async (jobIdx: number) => {
    setSelectedJobId(jobIdx);
    await fetchApplicants(applicantsPage,jobIdx);
    setIsModalOpen(true);
  };

  const openResumeModal = async (resumeIdx: number) => {
    try {
      const { data } = await apiClient.get(`/admin/jobs/applications/${resumeIdx}`);
      setSelectedResume(data.data);
      setIsResumeModalOpen(true);
    } catch (err) {
      console.error("이력서 조회 실패", err);
    }
  };

  const cancelApplication = async (applicationIdx: number) => {
    if (!selectedJobId) return;
    const confirmed = confirm("정말로 지원을 취소하시겠습니까?");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/admin/jobs/${selectedJobId}/cancel/${applicationIdx}`);
      alert("지원 취소되었습니다.");
      fetchApplicants(applicantsPage,selectedJobId);
    } catch (err) {
      alert("취소 실패");
    }
  };

  const handleDeleteSingle = async (idx: number) => {
    if (!confirm("해당 게시글을 삭제하시겠습니까?")) return;
    await apiClient.delete(`/admin/jobs/${idx}`);
    fetchJobs(page, filterValues.searchBy, filterValues.query);
  };

  const handleDeleteSelected = async () => {
    if (selectedJobs.length === 0) return alert("삭제할 공고를 선택해주세요.");
    await apiClient.post("/admin/jobs/selectDelete", { idxs: selectedJobs });
    setSelectedJobs([]);
    fetchJobs(page, filterValues.searchBy, filterValues.query);
  };

  const handleForceDeleteSelected = async () => {
    if (selectedJobs.length === 0) return alert("삭제할 공고를 선택해주세요.");
    if (!confirm("선택한 공고를를 **완전 삭제**하시겠습니까? 이 작업은 복구되지 않습니다.")) return;
  
    try {
      await apiClient.post("/admin/jobs/forceDelete", { idxs: selectedJobs });
      alert("완전 삭제 완료");
      fetchJobs(page, filterValues.searchBy, filterValues.query);
      setSelectedJobs([]);
    } catch (error) {
      console.error("완전 삭제 오류:", error);
      alert("완전 삭제 실패");
    }
  };

  const handleSelect = (idx: number) => {
    // const selectedItem = jobs.find((item) => item.idx === idx);
    // if (selectedItem?.isUse === "N") return;
    
    setSelectedJobs((prev) =>
      prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]
    );
  };

  const handleSelectAll = () => {
    const selectable = jobs.filter((i) => i.isUse !== "N").map((i) => i.idx);
    setSelectedJobs(selectedJobs.length === selectable.length ? [] : selectable);
  };

  const handleEdit = (idx: number) => {
    window.location.href = `/admin/jobs/edit/${idx}`;
  };

  const updateApplicantStatus = async (applicationIdx: number, newStatus: string) => {
    try {
      await apiClient.patch(`/admin/jobs/applications/status/${applicationIdx}`, {
        isStatus: newStatus,
      });
  
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.idx === applicationIdx
            ? { ...applicant, isStatus: newStatus }
            : applicant
        )
      );
    } catch (err) {
      console.error("상태 변경 실패", err);
      alert("상태 변경에 실패했습니다.");
    }
  };
  
  

  const columns = [
    { header: "회사명", render: (job: Job) => job.companyName || "정보 없음" },
    {
      header: "공고 제목",
      render: (job: Job) => (
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => handleEdit(job.idx)}
        >
          {job.title || "제목 없음"}
        </span>
      )
    },
    { header: "근무지", render: (job: Job) => job.companyAddress || "주소 없음" },
    { header: "연봉", render: (job: Job) => job.salary ? `${Number(job.salary).toLocaleString()}만원` : "미입력" },
    { header: "마감일", render: (job: Job) => job.endDate || "마감일 미지정" },
    {
      header: "지원자 수",
      render: (job: Job) => (
        <button
          className="cursor-pointer text-blue-500 underline"
          onClick={() => openApplicantModal(job.idx)}
        >
          {job.applicantCount ?? 0}명
        </button>
      )
    },
    { header: "등록일", render: (job: Job) => job.regDate ? formatDateTime(job.regDate) : "날짜 없음" },
    {
      header: "관리",
      render: (job: Job) => (
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => handleEdit(job.idx)}>수정</Button>
          <Button variant="destructive" onClick={() => handleDeleteSingle(job.idx)}>삭제</Button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">채용공고 관리</h1>

        <AdminFilterBar
          filters={filters}
          values={searchInput}
          onChange={(key, value) => setSearchInput((prev) => ({ ...prev, [key]: value }))}
          onSearch={handleSearch}
        />
        
        <AdminListHeader
          totalCount={totalElements}
          selectedCount={selectedJobs.length}
          onDeleteSelected={handleDeleteSelected}
          onForceDeleteSelected={handleForceDeleteSelected}
        />

        <AdminTable
          data={jobs}
          columns={columns}
          selectedIds={selectedJobs}
          onSelectAll={handleSelectAll}
          onSelect={handleSelect}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />

        {/* 지원자 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="!max-w-[500px] w-full overflow-y-auto">
            <DialogHeader>
              <DialogTitle>지원자 목록</DialogTitle>
              <DialogDescription>
                해당 공고에 지원한 지원자들을 확인하고 관리할 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-1">
                  <Users className="w-5 h-5 text-blue-500" />
                </h2>
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                  총 {applicantsTotalElements}명
                </span>
              </div>
            </div>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto mt-2">
              {applicants.length === 0 && (
                <p className="text-gray-500 text-center">지원자가 없습니다.</p>
              )}
              {applicants.map((applicant) => {
                const getStatusLabelAndClass = (status: string) => {
                  switch (status) {
                    case "Y":
                      return { label: "면접 제의", className: "bg-blue-100 text-blue-600 border border-blue-300" };
                    case "N":
                      return { label: "불합격", className: "bg-red-100 text-red-600 border border-red-300" };
                    case "C":
                      return { label: "지원 취소", className: "bg-red-100 text-red-600 border border-red-300" };
                    default:
                      return { label: "대기중", className: "bg-yellow-100 text-yellow-600 border border-yellow-300" };
                  }
                };

                const { label: statusLabel, className: statusClass } = getStatusLabelAndClass(applicant.isStatus);

                return (
                  <li
                    key={applicant.idx}
                    className={`relative flex items-start gap-4 p-4 border rounded-xl shadow-sm bg-white ${
                      applicant.isUse === "Y" ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {/* 프로필 */}
                    <img
                      src={applicant.photo || "/images/default-profile.png"}
                      alt="지원자 사진"
                      className="w-14 h-14 rounded-full object-cover border"
                    />

                    {/* 정보 */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => openResumeModal(applicant.idx)}
                      >
                      <p className="font-semibold text-base">
                        {applicant.isExperienced === "Y" ? "경력 지원자" : "신입 지원자"}
                      </p>
                      <p className="text-sm text-gray-700">{applicant.careerSummary || ""}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        지원일: {new Date(applicant.regDate).toLocaleDateString("ko-KR")}
                      </p>
                    </div>

                    {/* 상태 뱃지 + Select */}
                    <div className="flex flex-col gap-1 items-end" onClick={(e) => e.stopPropagation()}>
                      {/* 열람 상태 */}
                      <div
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          applicant.isRead
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {applicant.isRead ? "열람 완료" : "미열람"}
                      </div>

                      {/* 상태 뱃지 */}
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                        {statusLabel}
                      </div>

                      {/* 상태 선택 */}
                      <Select
                        value={applicant.isStatus}
                        onValueChange={(newStatus) => updateApplicantStatus(applicant.idx, newStatus)}
                      >
                        <SelectTrigger className="w-24 h-7 text-xs px-2 py-1 border rounded-full">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="Y">면접 제의</SelectItem>
                          <SelectItem value="N">불합격</SelectItem>
                          <SelectItem value="W">대기</SelectItem>
                          <SelectItem value="C">지원 취소</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Pagination
              currentPage={applicantsPage}
              totalPages={applicantsTotalPages}
              onPageChange={(AppPage) => handlePageChange(AppPage)}
              size="sm"
              maxPageButtons={5}
            />

            <DialogFooter className="mt-4">
              <Button variant="gray" onClick={() => setIsModalOpen(false)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 이력서 상세 모달 */}
        <Dialog open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
          <DialogContent className="!max-w-[900px] w-full h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>이력서 상세 보기</DialogTitle>
              <DialogDescription>지원자의 상세 이력서를 확인할 수 있습니다.</DialogDescription>
            </DialogHeader>

            {selectedResume && (
              <ResumePreview
                resume={{
                  ...selectedResume,
                  careers: selectedResume.careers,
                  educationList: selectedResume.educationList,
                  skillsList: selectedResume.skillsList,
                  certificationsList: selectedResume.certificationsList,
                  careerSummary: selectedResume.careerSummary,
                  coverLetter: selectedResume.coverLetter,
                }}
                userProfile={{
                  name: selectedResume.name || "",
                  gender:
                    selectedResume.gender === "M"
                      ? "남자"
                      : selectedResume.gender === "W"
                      ? "여자"
                      : "",
                  age: calculateAge(selectedResume.birthDay || ""),
                  email: selectedResume.email || "",
                  hp: selectedResume.hp || "",
                  address: `${selectedResume.zipCode || ""} ${selectedResume.address || ""} ${selectedResume.addressDetail || ""}`,
                }}
                photoPreview={selectedResume.photo || ""}
              />
            )}

            <DialogFooter className="mt-4">
              <Button variant="gray" onClick={() => setIsResumeModalOpen(false)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
