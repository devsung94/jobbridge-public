import React, { forwardRef } from "react";
import { Resume } from "@/(lib)/hooks/useResumeForm";

const DEFAULT_IMAGE = "/img/default_profile.png";

interface ResumePreviewProps {
  resume: Resume;
  userProfile?: {
    name: string;
    gender: string;
    age: string;
    email: string;
    hp: string;
    address: string;
  };
  photoPreview?: string | null;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resume, userProfile, photoPreview }, ref) => {
    // console.log("resume",resume,userProfile,photoPreview);
    return (
      <div
        ref={ref}
        className="w-full text-[12px] leading-tight"
        // className="max-w-4xl mx-auto bg-white text-[14px]"
      >

        {userProfile && (
          <section
            className="mb-6"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            {/* 사진 */}
            <div
              style={{
                width: "128px",
                height: "160px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#f3f4f6",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={photoPreview || DEFAULT_IMAGE}
                alt="프로필"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* 텍스트 */}
            <div
              style={{
                fontSize: "14px",
                color: "#333",
                lineHeight: "1.5",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <p style={{ margin: 0 }}><strong>이름:</strong> {userProfile.name}</p>
              <p style={{ margin: 0 }}><strong>성별:</strong> {userProfile.gender}</p>
              <p style={{ margin: 0 }}><strong>나이:</strong> 만 {userProfile.age}</p>
              <p style={{ margin: 0 }}><strong>이메일:</strong> {userProfile.email}</p>
              <p style={{ margin: 0 }}><strong>휴대폰:</strong> {userProfile.hp}</p>
              <p style={{ margin: 0 }}><strong>주소:</strong> {userProfile.address}</p>
            </div>
          </section>
        )}


        {/* 커리어 요약 */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">커리어 요약</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{resume.careerSummary || "-"}</p>
        </section>

        {/* 경력사항 */}
        {resume.careers.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">경력사항</h3>
            {resume.careers.map((career, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md shadow-sm bg-white">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-lg font-bold text-gray-800">{career.company}</p>
                  <p className="text-sm text-gray-500">{career.startDate} ~ {career.isWorking==='재직' ?  "재직중" : career.endDate}</p>
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
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{edu.schoolName}</td>
                    <td className="p-2 border">{edu.graduationStatus || "-"}</td>
                    <td className="p-2 border">{edu.startDate + " ~ " + (edu.graduationStatus=="재학" ? "재학중" : edu.endDate) || "-"}</td>
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
              {resume.skillsList.map((skill, i) => (
                <span
                  key={i}
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

        {/* 자격증 */}
        {resume.certificationsList.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">자격 / 어학 / 수상</h3>
            <ul className="space-y-2">
              {resume.certificationsList.map((cert, i) => (
                <li
                  key={i}
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
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{resume.coverLetter || "-"}</p>
        </section>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
export default ResumePreview;
