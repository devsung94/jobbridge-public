"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import LabeledField from "@/components/ui/LabeledField";
import TiptapEditor from "@/components/tiptap/TiptapEditorWrapper";
import LabeledSelect, { OptionType } from "@/components/ui/LabeledSelect";
import {numberFormatter} from "@/(lib)/utils/common";
import { getLabel } from "@/(lib)/utils/labelHelper";
import {
  industryOptions,
  companyOptions,
  experienceOptions,
  educationOptions
} from "@/constants/options";
import { SmartButton } from "@/components/ui/SmartButton";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/(lib)/utils/AuthContext";

export default function JobEditPage() {
  const router = useRouter();
  const { userId, role, isLoggedIn, isLoading } = useAuth();
  const { job_idx } = useParams();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    experience: "",
    education: "",
    salary: "",
    preferred: "",
    startDate: "",
    endDate: "",
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    bizNumber: "",
    ceoName: "",
    companyType: "",
    industry: "",
    employeeCount: "",
    foundedDate: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    homepageUrl: "",
    logo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditorChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsButtonLoading(true);
      await apiClient.put(`/com/jobs/${job_idx}`, formData);
      alert("수정 완료");
      router.push(`/jobs/${job_idx}`);
    } catch (err) {
      alert("수정 실패");
      console.error(err);
      setIsButtonLoading(false);
    } finally{
      setIsButtonLoading(false);
    }
  };  

  useEffect(() => {
    if (isLoading) return;
  
    if (!isLoggedIn || !role) {
      alert("로그인 후 이용이 가능합니다.");
      router.push("/login");
      return;
    }
  
    if (role !== "com") {
      alert("채용 담당자만 이용이 가능합니다.");
      router.push("/jobs");
      return;
    }
  
    if (!userId || !job_idx) return;
  
    const fetchJob = async () => {
      try {
        const { data } = await apiClient.get(`/jobs/${job_idx}`);
        const jobData = data.data;
  
        // 여기에만 작성자 검사
        if (String(jobData.userId) !== String(userId)) {
          console.warn("작성자 불일치!", jobData.userId, userId);
          alert("작성자만 접근이 가능합니다.");
          router.push("/jobs");
          return;
        }
  
        setFormData(jobData);
      } catch (err) {
        console.error("공고 불러오기 실패", err);
      }
    };
  
    const fetchCompany = async () => {
      try {
        const { data } = await apiClient.get("/com/company");
        setCompanyInfo(data.data);
      } catch (err) {
        console.error("회사 정보 불러오기 실패", err);
      }
    };
  
    fetchJob();
    fetchCompany();
  }, [isLoading, isLoggedIn, role, userId, job_idx, router]);
  
  
  

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-700">채용 공고 수정</h2>

      {/* 회사 정보 - 수정 불가 */}
      <div className="bg-gray-50 p-4 rounded border mb-6 mt-5">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">회사 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
          <div className="md:col-span-1 flex items-center space-x-3">
            {companyInfo.logo && (
              <img src={companyInfo.logo} alt="회사 로고" className="w-14 h-14 border rounded" />
            )}
            <p className="text-sm text-gray-700 font-semibold">{companyInfo.companyName}</p>
          </div>

          <LabeledField label="사업자등록번호" id="bizNumber" name="bizNumber" value={companyInfo.bizNumber} readOnly />
          <LabeledField label="대표자명" id="ceoName" name="ceoName" value={companyInfo.ceoName} readOnly />
          <LabeledField label="기업형태" id="companyType" name="companyType" value={getLabel(companyOptions,companyInfo.companyType)} readOnly />
          <LabeledField label="업종" id="industry" name="industry" value={getLabel(industryOptions,companyInfo.industry)} readOnly />
          <LabeledField label="사원 수" id="employeeCount" name="employeeCount" value={numberFormatter(companyInfo.employeeCount)} readOnly />
          <LabeledField label="설립일" id="foundedDate" name="foundedDate" value={companyInfo.foundedDate} readOnly />
          <LabeledField label="홈페이지" id="homepageUrl" name="homepageUrl" value={companyInfo.homepageUrl} readOnly />
          <LabeledField label="우편번호" id="zipCode" name="zipCode" value={companyInfo.zipCode} readOnly />
          <LabeledField label="주소" id="address" name="address" value={companyInfo.address} readOnly />
          <LabeledField label="상세주소" id="addressDetail" name="addressDetail" value={companyInfo.addressDetail} readOnly />
        </div>
      </div>

      <form className="mt-6 space-y-4" >
        <LabeledField label="공고 제목" id="title" name="title" value={formData.title} onChange={handleChange} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공고 내용</label>
          <div className="min-h-[200px] rounded bg-white shadow-sm">
            <TiptapEditor content={formData.description} onChange={handleEditorChange} />
          </div>
        </div>

        <LabeledSelect
          label="경력"
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleSelectChange("experience")}
          options={experienceOptions}
        />

        <LabeledSelect
          label="학력"
          id="education"
          name="education"
          value={formData.education}
          onChange={handleSelectChange("education")}
          options={educationOptions}
        />

        <LabeledField label="연봉 정보" id="salary" name="salary" value={formData.salary} onChange={handleChange} />
        <LabeledField label="우대사항" id="preferred" name="preferred" value={formData.preferred} onChange={handleChange} />
        <LabeledField
          as="datepicker"
          label="시작 날짜"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={(val) => setFormData((prev) => ({ ...prev, startDate: val }))}
        />
        <LabeledField
          as="datepicker"
          label="마감 날짜"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={(val) => setFormData((prev) => ({ ...prev, endDate: val }))}
        />
        
        <div className="text-center">
          <SmartButton type="button" variant="primary" className="mr-2" onClick={handleSubmit} disabled={isButtonLoading}>수정하기</SmartButton>
          <Button type="button" variant="gray" onClick={()=>router.back()}>취소하기</Button>
        </div>
      </form>
    </div>
  );
}
