"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { ResumeResponseDTO } from "@/(types)/resume";
import { calculateAge,ProfileImage } from "@/(lib)/utils/common";
import { Button } from "@/components/ui/Button";

const DEFAULT_IMAGE = "/img/default_profile.png";

export default function ApplicantsPage() {
  const { application_idx } = useParams();
  const router = useRouter();
  const [resume, setResume] = useState<ResumeResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplicant = async () => {
    try {
      const { data } = await apiClient.get(`/com/jobs/applications/${application_idx}`);
      // console.log(data);
      if (data.result === "Y") {
        // console.log(data.data);
        setResume(data.data);
        if(data.data.isRead==="N" && data.data.isUse==="Y"){
          // 열람 처리 API 호출 (resume 받아온 후)
          await apiClient.post(`/com/jobs/applications/read/${application_idx}`);
        }
      } else {
        alert(data.message || "지원자 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("지원자 정보 요청 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (application_idx) fetchApplicant();
  }, [application_idx]);

  
  const handleStatusChange = async (status: "Y" | "N") => {
    const confirmMsg = status === "Y" ? "해당 지원자에게 면접 제의를 하시겠습니까?" : "해당 지원자를 불합격 처리하시겠습니까?";
    const alertMsg = status === "Y" ? "면접 제의 완료" : "불합격 처리 완료";

    if (!confirm(confirmMsg)) return;

    try {
      await apiClient.post(`/com/jobs/applications/status/${application_idx}`, {
        isStatus: status,
      });
      alert(alertMsg);
      await fetchApplicant(); // 상태 변경 후 데이터 갱신
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("처리에 실패했습니다.");
    }
  };

  if (loading) return <p className="p-6 text-center">로딩 중...</p>;
  if (!resume) return <p className="p-6 text-center">지원자가 없습니다.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg pt-2">
      <Button
        variant={"white"}
        size={"sm"}
        onClick={() => router.back()}
        className="mb-3"
      >
        ← 뒤로가기
      </Button>

      <div className="mb-6 border-b"></div>
      {/* <h2 className="text-3xl font-bold mb-6 border-b pb-2 text-center">지원자 이력서</h2> */}

      {/* 기본 정보 */}
      <section className="mb-6 flex gap-6 items-start">
        <div className="w-32 h-40 border rounded overflow-hidden bg-gray-100">          
           <ProfileImage photoUrl={resume.photo || DEFAULT_IMAGE} />
        </div>
        <div className="text-sm text-gray-800 space-y-1">
          <p><strong>이름:</strong> {resume.name}</p>
          <p><strong>성별:</strong> {resume.gender === "M" ? "남성" : "여성"}</p>
          <p><strong>나이:</strong> 만 {calculateAge(resume.birthDay)}</p>
          <p><strong>이메일:</strong> {resume.email}</p>
          <p><strong>휴대폰:</strong> {resume.hp}</p>
          <p><strong>주소:</strong> ({resume.zipCode}) {resume.address} {resume.addressDetail}</p>
        </div>
      </section>

      {/* 커리어 요약 */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">커리어 요약</h3>
        <p className="whitespace-pre-wrap leading-relaxed">{resume.careerSummary || "-"}</p>
      </section>

      {/* 경력사항 */}
      {resume.careers.length > 0 && (
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">경력사항</h3>
        {resume.careers.map((career, index) => (
          <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
            <div className="flex justify-between items-center mb-1">
              <p className="text-lg font-bold text-gray-800">{career.company}</p>
              <p className="text-sm text-gray-500">{career.startDate} ~ {(career.isWorking==="재직" ? "재직중" : career.endDate)}</p>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>재직상태:</strong> {career.isWorking}</p>
              <p><strong>계약유형:</strong> {career.contractType}</p>
              <p><strong>부서:</strong> {career.department}</p>
              <p><strong>직급:</strong> {career.position}</p>
              <p><strong>직무:</strong> {career.role}</p>
              <p><strong>담당 업무:</strong> <span className="whitespace-pre-wrap">{career.description}</span></p>
            </div>
          </div>
        ))}
      </section>
    )}


      {/* 학력 */}
      {resume.educationList.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">학력</h3>
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 border">학교명</th>
                <th className="p-2 border">졸업 상태</th>
                <th className="p-2 border">재학 기간</th>
              </tr>
            </thead>
            <tbody>
              {resume.educationList.map((edu, i) => (
                <tr key={edu.idx} className="text-center">
                  <td className="p-2 border">{edu.schoolName}</td>
                  <td className="p-2 border">{edu.graduationStatus || "-"}</td>
                  <td className="p-2 border">{edu.startDate + " ~ " + (edu.graduationStatus==="재학" ? "재학중" : edu.endDate) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}


      {/* 기술 스택 */}
      {resume.skillsList.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">기술 스택</h3>
          <div className="flex flex-wrap gap-2">
            {resume.skillsList.map((skill) => (
              <span
                key={skill.idx}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full border border-blue-300"
              >
                {skill.skillName}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 포트폴리오 */} 
      {resume.portfolioList.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">포트폴리오</h3>
          <ul className="space-y-4">
            {resume.portfolioList.map((portfolio, i) => (
              <li
                key={i}
                className="p-4 bg-gray-50 border rounded shadow-sm text-sm flex flex-col gap-1"
              >
                <div>
                  <strong>URL: </strong>
                  {portfolio.portfolioUrl ? (
                    <a 
                      href={portfolio.portfolioUrl.startsWith("http") ? portfolio.portfolioUrl : `https://${portfolio.portfolioUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {portfolio.portfolioUrl}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  <strong>설명: </strong>
                  <span className="whitespace-pre-wrap">{portfolio.portfolioContents || "-"}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 자격 / 어학 / 수상 */}
      {resume.certificationsList.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">자격 / 어학 / 수상</h3>
          <ul className="space-y-2">
            {resume.certificationsList.map((cert) => (
              <li
                key={cert.idx}
                className="p-3 bg-gray-50 border rounded shadow-sm text-sm"
              >
                {cert.certificationName}
              </li>
            ))}
          </ul>
        </section>
      )}


      {/* 자기소개서 */}
      <section>
        <h3 className="text-xl font-semibold mb-2">자기소개서</h3>
        <p className="whitespace-pre-wrap leading-relaxed">{resume.coverLetter || "-"}</p>
      </section>

      {/* 상태 변경 버튼 */}
      { resume.isUse=="Y" && resume.isStatus=="W"  && (
        <section className="mt-8 flex gap-4 justify-center">
          <button
            onClick={()=>handleStatusChange("Y")}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            면접 제의
          </button>
          <button
            onClick={()=>handleStatusChange("N")}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
          >
            불합격
          </button>
        </section>
        )
      }
    </div>
  );
}
