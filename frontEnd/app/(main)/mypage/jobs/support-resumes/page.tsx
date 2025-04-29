"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { useAuth } from "@/(lib)/utils/AuthContext";

// 지원자 타입
interface Resume {
  idx: number;
  isExperienced: string;
  careerSummary: string;
  coverLetter: string;
  photo: string;
  careers: any[];
  educationList: any[];
  skillsList: any[];
  certificationsList: any[];
}

interface ApplicantResponse {
  idx: number;
  userId: string;
  resume: Resume;
}

interface JobPost {
  idx: number;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
}

export default function JobPostListPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<Resume[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const fetchMyJobPosts = async () => {
      try {
        const { data } = await apiClient.get("/com/jobs/mine");
        if (data.result === "Y") {
          setJobPosts(data.data.myJobs);
        } else {
          alert("공고 목록 불러오기 실패: " + data.message);
        }
      } catch (err) {
        console.error("공고 목록 요청 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchMyJobPosts();
  }, [userId]);

  const handleView = (idx: number) => router.push(`/myJobs/${idx}`);
  const handleEdit = (idx: number) => router.push(`/myJobs/edit/${idx}`);
  const handleDelete = async (idx: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const { data } = await apiClient.delete(`/com/jobs/${idx}`);
      if (data.result === "Y") {
        setJobPosts((prev) => prev.filter((post) => post.idx !== idx));
      } else {
        alert("삭제 실패: " + data.message);
      }
    } catch (err) {
      console.error("삭제 오류:", err);
    }
  };

  const handleSupportView = async (jobIdx: number) => {
    setSelectedJobId(jobIdx);
    try {
      const { data } = await apiClient.get(`/com/jobs/${jobIdx}/applications`);
      if (data.result === "Y") {
        setApplicants(data.data);
        setCurrentPage(1);
      } else {
        alert("지원자 목록 불러오기 실패: " + data.message);
      }
    } catch (err) {
      console.error("지원자 목록 요청 실패:", err);
    }
  };

  const paginatedApplicants = applicants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">내가 등록한 채용공고</h2>

      {loading ? (
        <p>로딩 중...</p>
      ) : jobPosts.length === 0 ? (
        <p>등록한 채용공고가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {jobPosts.map((post) => (
            <li key={post.idx} className="p-4 border rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    {post.company} • {new Date(post.startDate).toLocaleDateString()} ~ {new Date(post.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleView(post.idx)} className="text-blue-600 hover:underline">보기</button>
                  <button onClick={() => handleSupportView(post.idx)} className="text-gray-600 hover:underline">지원자 보기</button>
                  <button onClick={() => handleEdit(post.idx)} className="text-yellow-600 hover:underline">수정</button>
                  <button onClick={() => handleDelete(post.idx)} className="text-red-600 hover:underline">삭제</button>
                </div>
              </div>

              {selectedJobId === post.idx && (
                <div className="mt-4 bg-gray-50 p-4 border rounded">
                  <h4 className="font-semibold mb-2">지원자 목록</h4>
                  {paginatedApplicants.length === 0 ? (
                    <p className="text-sm text-gray-500">지원자가 없습니다.</p>
                  ) : (
                    <ul className="space-y-3">
                      {paginatedApplicants.map((resume, i) => (
                        <li key={resume.idx} className="p-3 border rounded bg-white">
                          <p className="text-sm font-bold">경력 요약:</p>
                          <p className="text-sm mb-1">{resume.careerSummary}</p>
                          <p className="text-xs text-gray-500">자기소개서: {resume.coverLetter.slice(0, 50)}...</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Pagination */}
                  <div className="mt-4 flex justify-center gap-2">
                    {[...Array(Math.ceil(applicants.length / pageSize)).keys()].map((p) => (
                      <button
                        key={p + 1}
                        className={`px-3 py-1 rounded text-sm border ${currentPage === p + 1 ? "bg-blue-600 text-white" : "text-gray-700"}`}
                        onClick={() => setCurrentPage(p + 1)}
                      >
                        {p + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
