"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import apiClient from "@/(lib)/utils/apiClient";
import LabeledField from "@/components/ui/LabeledField";
import TiptapEditor from "@/components/tiptap/TiptapEditorWrapper";
import LabeledSelect from "@/components/ui/LabeledSelect";
import { getLabel } from "@/(lib)/utils/labelHelper";
import { numberFormatter } from "@/(lib)/utils/common";
import {
  companyOptions,
  industryOptions,
  experienceOptions,
  educationOptions
} from "@/constants/options";
import { SmartButton } from "@/components/ui/SmartButton";
import { Button } from "@/components/ui/Button";

export default function JobCreatePage() {
  const router = useRouter();
  const { role, isLoggedIn, isLoading } = useAuth();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",        // 공고 제목
    description: "",  // 공고 상세내용
    experience: "",   // 필요 경력
    education: "",    // 필요 학력
    salary: "",       // 연봉 정보
    preferred: "",    // 우대 사항
    startDate: "",   // 채용 시작일
    endDate: "",     // 채용 마감일
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
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const { data } = await apiClient.post("/com/jobs", formData);
      alert("채용 공고가 등록되었습니다.");
      router.push(`/jobs/${data.data}`);
    } catch (error) {
      alert("채용 공고 등록 중 오류 발생.");
      console.error(error);
      setIsButtonLoading(false);
    } finally{
      setIsButtonLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || role !== "com")) {
      alert("채용 담당자만 접근할 수 있습니다.");
      router.push("/");
      return;
    }
  
    const fetchCompanyInfo = async () => {
      try {
        const { data } = await apiClient.get("/com/company");
        const info = data.data;
  
        // 필수 정보가 없으면 접근 차단
        if (!info || !info.companyName || !info.bizNumber) {
          alert("회사 정보를 먼저 등록해주세요.");
          router.push("/mypage/company/create"); // 회사 정보 등록 페이지로 이동
          return;
        }
  
        setCompanyInfo(info);
      } catch (error) {
        console.error("회사 정보 불러오기 실패", error);
        alert("회사 정보 조회에 실패했습니다.");
        router.push("/");
      }
    };
  
    if (!isLoading && isLoggedIn && role === "com") {
      fetchCompanyInfo();
    }
  }, [role, isLoggedIn, isLoading, router]);
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-700">채용 공고 등록</h2>
      <div className="bg-gray-50 p-4 rounded border mb-6 mt-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">회사 정보</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <div className="md:col-span-1 flex items-center space-x-3">
            {companyInfo.logo ? (
              <img src={companyInfo.logo} alt="회사 로고" className="w-14 h-14 border rounded" />
            ) : null}
              <p className="text-sm text-gray-700 font-semibold">{companyInfo.companyName}</p>
            </div>

            <LabeledField label="사업자등록번호" id="businessNumber" name="businessNumber" value={companyInfo.bizNumber} readOnly />
            <LabeledField label="대표자명" id="ceoName" name="ceoName" value={companyInfo.ceoName} readOnly />

            <LabeledField label="기업형태" id="type" name="type" value={getLabel(companyOptions,companyInfo.companyType)} readOnly />
            <LabeledField label="업종" id="industry" name="industry" value={getLabel(industryOptions,companyInfo.industry)} readOnly />
            <LabeledField label="사원 수" id="employeeCount" name="employeeCount" value={numberFormatter(companyInfo.employeeCount)} readOnly />

            <LabeledField label="설립일" id="establishedAt" name="establishedAt" value={companyInfo.foundedDate} readOnly />
            <LabeledField label="홈페이지" id="homepage" name="homepage" value={companyInfo.homepageUrl} readOnly />
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
          <SmartButton type="button" variant="primary" className="mr-2" onClick={handleSubmit} disabled={isButtonLoading}>등록하기</SmartButton>
          <Button type="button" variant="gray" onClick={()=>router.back()}>취소하기</Button>
        </div>
      </form>
    </div>
  );
}
