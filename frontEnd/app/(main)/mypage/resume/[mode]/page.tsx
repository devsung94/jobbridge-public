// 이력서 등록 & 수정 통합 페이지
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { usePhotoUpload } from "@/(lib)/hooks/upload";
import { useResumeForm } from "@/(lib)/hooks/useResumeForm";
import { calculateAge } from "@/(lib)/utils/common";
import apiClient from "@/(lib)/utils/apiClient";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import ResumePreview from "@/(main)/mypage/resume/ResumePreview";
import { ResumeResponseDTO } from "@/(types)/resume";
import LabeledSelect from "@/components/ui/LabeledSelect";
import { contractTypeOptions, graduationStatusOptions, isWorkingOptions } from "@/constants/options";
import { SmartButton } from "@/components/ui/SmartButton";
import { Button } from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePickerInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
const DEFAULT_IMAGE = "/img/default_profile.png";

export default function ResumeFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode } = useParams();

  const { userId } = useAuth();
  const startDateRefs = useRef<(HTMLInputElement | null)[]>([]);
  const endDateRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    resume,
    setResume,
    handleChange,
    addCareer,
    updateCareer,
    removeCareer,
    addItemToList,
    updateListItem,
    removeItemFromList,
    validateResume,
    educationRefs,
    skillRefs,
    certificationRefs,
    careerRefs,
  } = useResumeForm();

  const { handlePhotoUpload, photoPreview, setPhotoPreview } = usePhotoUpload();
  const [userProfile, setUserProfile] = useState({ name: "", gender: "", age: "", email: "", hp: "", address: "" });
  const [isPreview, setIsPreview] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const previewRef = useRef(null);

  const fetchResume = async () => {
    try {
      const { data } = await apiClient.get("/user/resume/detail");
      // console.log(data);
      if (data.result === "Y") {
        const res = data.data;
        setResume({
          isExperienced: res.isExperienced || "",
          careerSummary: res.careerSummary || "",
          coverLetter: res.coverLetter || "",
          photo: null,
          educationList: res.educationList || [{ schoolName: "", graduationStatus: "", startDate: "", endDate: "" }],
          skillsList: res.skillsList || [{ skillName: "" }],
          portfolioList: res.portfolioList || [{ portfolioUrl: "", portfolioContents: "" }],
          certificationsList: res.certificationsList || [{ certificationName: "" }],
          careers: res.careers || [{ isWorking: "", company: "", startDate: "", endDate: "", contractType: "", department: "", role: "", position: "", description: "" }],
        });
        setUserProfile({
          name: res.name,
          gender: res.gender === "M" ? "남성" : "여성",
          age: calculateAge(res.birthDay) || "-",
          email: res.email,
          hp: res.hp,
          address: `${res.zipCode} ${res.address} ${res.addressDetail}`,
        });
        if (res.photo) setPhotoPreview(res.photo);
      }
    } catch (err) {
      console.error("이력서 정보 로드 실패:", err);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const { data } = await apiClient.get(`/user/${userId}`);
      if (data.result === "Y") {
        const { name, gender, birthDay, email, hp, zipCode, address, addressDetail } = data.data;
        setUserProfile({
          name,
          gender: gender === "M" ? "남성" : "여성",
          age: calculateAge(birthDay) || "-",
          email,
          hp,
          address: `${zipCode} ${address} ${addressDetail}`,
        });
      }
    } catch (err) {
      console.error("회원 정보 불러오기 실패:", err);
    }
  };

  const handleSave = async () => {
    const validation = validateResume(photoPreview);
    if (!validation.valid) return alert(validation.message);

    try {
      const formData = new FormData();
      const jsonPayload = {
        isExperienced: resume.isExperienced,
        careerSummary: resume.careerSummary,
        coverLetter: resume.coverLetter,
        careers: resume.isExperienced === "신입" ? [] : resume.careers,
        educationList: resume.educationList,
        skillsList: resume.skillsList,
        portfolioList: resume.portfolioList,
        certificationsList: resume.certificationsList,
      };
      formData.append("resume", new Blob([JSON.stringify(jsonPayload)], { type: "application/json" }));
      if (resume.photo) formData.append("photo", resume.photo);

      setIsButtonLoading(true);
      const endpoint = mode === "edit" ? "/user/resume/update" : "/user/resume/submit";
      const { data } = await apiClient[mode === "edit" ? "put" : "post"](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.result === "Y") {
        alert(`이력서가 성공적으로 ${mode === "edit" ? "수정" : "등록"}되었습니다.`);
        router.push("/mypage");
      } else {
        alert(`${mode === "edit" ? "수정" : "등록"} 실패: ` + data.message);
      }
    } catch (err) {
      console.error(`${mode === "edit" ? "수정" : "등록"} 오류:`, err);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
  
    const element = previewRef.current as HTMLElement;
  
    const canvas = await html2canvas(element, {
      scale: 2, // 고해상도 유지
      useCORS: true,
      backgroundColor: "#fff",
    });
  
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
  
    const pdfWidth = 210; // A4 폭 (mm)
    const pageHeight = 297; // A4 높이 (mm)
  
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
    let heightLeft = imgHeight;
    let position = 0;
  
    // 첫 페이지
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  
    pdf.save("이력서.pdf");
  };
  

  useEffect(() => {
    if (mode === "edit") {
      fetchResume();
    } else {
      fetchUserInfo();
    }
  }, [mode]);

    return  (
    <>
      {/* 1. ResumePreview 모달 */}
      <Dialog open={isPreview} onOpenChange={setIsPreview}>
        <DialogContent className="!max-w-[900px] w-full h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>이력서 미리보기</DialogTitle>
            <DialogDescription>지원자의 이력서를 PDF로 미리 확인할 수 있습니다.</DialogDescription>
          </DialogHeader>
          
          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div 
              ref={previewRef} 
              className="w-[794px] min-h-[1123px] text-[11px] leading-[1.4] bg-white p-6 mx-auto">
              <ResumePreview
                resume={resume}
                photoPreview={photoPreview}
                userProfile={userProfile}
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-white flex justify-end gap-2">
            <Button variant="gray" onClick={() => setIsPreview(false)}>닫기</Button>
            <Button variant="gray" onClick={handleDownloadPdf}>PDF 저장</Button>
            <SmartButton
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={isButtonLoading}
            >
              {mode === "edit" ? "수정하기" : "등록하기"}
            </SmartButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기본 정보 */}
      <div className="flex items-start gap-6 mb-6">
        <div onClick={() => document.getElementById("photoInput")?.click()} className="w-32 h-40 bg-gray-100 border rounded cursor-pointer overflow-hidden">
          <img src={photoPreview || DEFAULT_IMAGE} alt="프로필" className="w-full h-full object-cover" />
        </div>
        <input type="file" accept="image/*" id="photoInput" onChange={(e) => handlePhotoUpload(e, setResume)} className="hidden" />
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>이름:</strong> {userProfile.name}</p>
          <p><strong>성별:</strong> {userProfile.gender}</p>
          <p><strong>나이:</strong> 만 {userProfile.age}</p>
          <p><strong>이메일:</strong> {userProfile.email}</p>
          <p><strong>휴대폰:</strong> {userProfile.hp}</p>
          <p><strong>주소:</strong> {userProfile.address}</p>
        </div>
      </div>

      {/* 커리어 정보 */}
      <select name="isExperienced" value={resume.isExperienced} onChange={handleChange} className="border p-2 rounded mb-4">
        <option value="">경력유무</option>
        <option value="신입">신입</option>
        <option value="경력">경력</option>
      </select>

      <textarea name="careerSummary" placeholder="나의 커리어를 짧게 소개해 주세요" value={resume.careerSummary} onChange={handleChange} className="w-full border p-2 rounded mb-4" rows={3} />

      {/* 경력 */}
      {resume.isExperienced === "경력" && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">경력사항</h3>
          {resume.careers.map((career, index) => (
            <div key={index} className="mb-4 p-4 border rounded bg-white shadow-sm space-y-3">
              <input 
                ref={(el:any) => (careerRefs.company.current[index] = el)}
                placeholder="회사명" 
                className="w-full border p-2 rounded" 
                value={career.company} 
                onChange={(e) => 
                  updateCareer(index, { ...career, company: e.target.value })
                } />

              {/* 재직 중 여부 */}
              <LabeledSelect
                selectRef={(el:any) => (careerRefs.isWorking.current[index] = el)}
                label="재직 상태"
                id={`isWorking-${index}`}
                name="isWorking"
                value={career.isWorking || "퇴사"}
                onChange={(value) => updateCareer(index, { ...career, isWorking: value })} 
                options={isWorkingOptions} />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">시작일</label>
                  <DatePicker
                    ref={(el:any) => (startDateRefs.current[index] = el)}
                    value={career.startDate || ""}
                    onChange={(date: string) =>
                      updateCareer(index, { ...career, startDate: date })
                    }
                  />
                </div>
                {/* 종료일 (퇴사인 경우만 노출) */}
                {(!career.isWorking || career.isWorking === "퇴사") && (
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">종료일</label>
                  <DatePicker
                    ref={(el:any) => (endDateRefs.current[index] = el)}
                    value={career.endDate || ""}
                    onChange={(date: string) =>
                      updateCareer(index, { ...career, endDate: date })
                    }
                  />
                </div>
                )}
              </div>

              <LabeledSelect 
                selectRef={(el:any) => (careerRefs.contractType.current[index] = el)}
                label="계약유형" 
                id={`contractType-${index}`} 
                name="contractType" 
                value={career.contractType || "정규직"} 
                onChange={(value) => updateCareer(index, { ...career, contractType: value })} 
                options={contractTypeOptions} />

              <input ref={(el:any) => (careerRefs.department.current[index] = el)} placeholder="부서" className="w-full border p-2 rounded" value={career.department} onChange={(e) => updateCareer(index, { ...career, department: e.target.value })} />
              <input ref={(el:any) => (careerRefs.position.current[index] = el)} placeholder="직급" className="w-full border p-2 rounded" value={career.position} onChange={(e) => updateCareer(index, { ...career, position: e.target.value })} />
              <input ref={(el:any) => (careerRefs.role.current[index] = el)} placeholder="직무" className="w-full border p-2 rounded" value={career.role} onChange={(e) => updateCareer(index, { ...career, role: e.target.value })} />
              <textarea ref={(el:any) => (careerRefs.description.current[index] = el)} placeholder="담당 업무" className="w-full border p-2 rounded" rows={2} value={career.description} onChange={(e) => updateCareer(index, { ...career, description: e.target.value })} />

              {resume.careers.length > 1 && (
                <button onClick={() => removeCareer(index)} className="text-sm text-red-600 hover:underline mt-2">삭제</button>
              )}
            </div>
          ))}
          <button onClick={addCareer} className="text-sm text-blue-600 hover:underline">+ 경력 추가</button>
        </section>
      )}

      {/* 학력 */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">학력</h3>
        {resume.educationList.map((edu, idx) => (
          <div key={idx} className="space-y-2 mb-3 p-4 border rounded shadow-sm">
            <input placeholder="학교명" className="w-full border p-2 rounded" value={edu.schoolName} onChange={(e) => updateListItem("educationList", idx, { ...edu, schoolName: e.target.value })} />

            <LabeledSelect 
              label="졸업 상태" 
              id={`graduationStatus-${idx}`} 
              name="graduationStatus" 
              value={edu.graduationStatus || ""} 
              onChange={(value) => 
                updateListItem("educationList", idx, { ...edu, graduationStatus: value })
              } 
              options={graduationStatusOptions} />

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">입학일</label>
                <DatePicker
                  value={edu.startDate || ""}
                  onChange={(date: string) =>
                    updateListItem("educationList", idx, { ...edu, startDate: date })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">졸업일</label>
                <DatePicker
                  value={edu.endDate || ""}
                  onChange={(date: string) =>
                    updateListItem("educationList", idx, { ...edu, endDate: date })
                  }
                />
              </div>
            </div>

            {resume.educationList.length > 1 && (
              <button onClick={() => removeItemFromList("educationList", idx)} className="text-red-500 text-xs">삭제</button>
            )}
          </div>
        ))}
        <button onClick={() => addItemToList("educationList")} className="text-sm text-blue-600 hover:underline">+ 학력 추가</button>
      </section>

      {/* 기술 스택 */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">기술 스택</h3>
        <div className="flex flex-wrap gap-2">
          {resume.skillsList.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-blue-800">
              <input placeholder="기술" className="bg-transparent outline-none w-auto text-sm" value={skill.skillName} onChange={(e) => updateListItem("skillsList", idx, { ...skill, skillName: e.target.value })} />
              {resume.skillsList.length > 1 && (
                <button onClick={() => removeItemFromList("skillsList", idx)} className="text-red-400 text-xs">×</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => addItemToList("skillsList")} className="text-sm text-blue-600 hover:underline mt-2">+ 스킬 추가</button>
      </section>

      {/* ✅ 포트폴리오 */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">포트폴리오</h3>
        {resume.portfolioList?.map((portfolio, idx) => (
          <div key={idx} className="space-y-2 mb-3 p-4 border rounded shadow-sm">
            <input 
              placeholder="포트폴리오 URL" 
              className="w-full border p-2 rounded" 
              value={portfolio.portfolioUrl}
              onChange={(e) =>
                updateListItem("portfolioList", idx, { ...portfolio, portfolioUrl: e.target.value })
              }
            />
            <textarea 
              name="portfolioContents" 
              placeholder="포트폴리오 내용" 
              value={portfolio.portfolioContents} 
              onChange={(e) =>
                updateListItem("portfolioList", idx, { ...portfolio, portfolioContents: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-4" rows={10} />

            {resume.portfolioList.length > 1 && (
              <button
                onClick={() => removeItemFromList("portfolioList", idx)}
                className="text-red-500 text-xs"
              >
                삭제
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addItemToList("portfolioList")}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          + 포트폴리오 추가
        </button>
      </section>

      {/* 자격증 */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">자격 / 어학 / 수상</h3>
        {resume.certificationsList.map((cert, idx) => (
          <div key={idx} className="flex gap-2 items-center mb-2">
            <input placeholder="자격 / 어학 / 수상" className="w-full border p-2 rounded" value={cert.certificationName} onChange={(e) => updateListItem("certificationsList", idx, { ...cert, certificationName: e.target.value })} />
            {resume.certificationsList.length > 1 && (
              <button onClick={() => removeItemFromList("certificationsList", idx)} className="text-red-500 text-xs">삭제</button>
            )}
          </div>
        ))}
        <button onClick={() => addItemToList("certificationsList")} className="text-sm text-blue-600 hover:underline mt-2">+ 항목 추가</button>
      </section>

      {/* 자기소개서 */}
      <textarea name="coverLetter" placeholder="자기소개서" value={resume.coverLetter} onChange={handleChange} className="w-full p-3 border rounded-lg mb-4" rows={10} />

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="gray" onClick={() => setIsPreview(true)}>미리보기</Button>
        <SmartButton type="button" variant="primary" onClick={handleSave} disabled={isButtonLoading}>{mode=="create" ? "등록하기" : "수정하기"}</SmartButton>
      </div>
    </>
  );
}
