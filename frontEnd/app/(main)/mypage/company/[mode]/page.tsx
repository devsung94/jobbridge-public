"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import { useDaumPostcode } from "@/(lib)/hooks/useDaumPostcode";
import { formatBizNumber } from "@/(lib)/utils/common";
import LabeledField from "@/components/ui/LabeledField";
import LabeledSelect from "@/components/ui/LabeledSelect";
import { SmartButton } from "@/components/ui/SmartButton";
import { Button } from "@/components/ui/Button";
import { companyOptions, industryOptions } from "@/constants/options";

const defaultForm = {
  companyType: "",
  companyName: "",
  bizNumber: "",
  ceoName: "",
  industry: "",
  employeeCount: 0,
  foundedDate: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  city: "",
  homepageUrl: "",
  startDate: "",
  endDate: "",
};

export default function CompanyFormPage() {
  const { mode } = useParams();
  const router = useRouter();
  const openPostcode = useDaumPostcode();
  const detailRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(defaultForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (isEdit) {
      const fetchCompany = async () => {
        try {
          const { data } = await apiClient.get("/com/company");
          const { logo, ...restForm } = data.data;
          restForm.bizNumber = formatBizNumber(restForm.bizNumber);
          setForm(restForm);
          setLogoPreview(logo);
        } catch (err) {
          alert("회사 정보를 불러오지 못했습니다.");
          router.push("/mypage");
        }
      };
      fetchCompany();
    }
  }, [isEdit, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "bizNumber" ? formatBizNumber(value) : value }));
  };

  const handleDateChange = (key: keyof typeof form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("5MB 이하만 업로드 가능");
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddressSearch = () => {
    openPostcode(
      (result) => {
        const matchedCity = result.address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
        setForm((prev) => ({
          ...prev,
          zipCode: result.zonecode,
          address: result.address,
          addressDetail: "",
          city: matchedCity?.[0] ?? "",
        }));
      },
      () => detailRef.current?.focus()
    );
  };

  const handleSubmit = async () => {
    const bizNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (!form.companyName.trim()) return alert("회사명을 입력해주세요.");
    if (!bizNumberRegex.test(form.bizNumber)) return alert("사업자등록번호 형식 오류");
    if (!form.ceoName.trim()) return alert("대표자명을 입력해주세요.");
    if (!form.companyType) return alert("기업 형태 선택 필요");
    if (!form.industry) return alert("업종 선택 필요");
    if (!form.employeeCount) return alert("사원 수 입력 필요");
    if (!form.foundedDate) return alert("설립일 선택 필요");
    if (!form.zipCode || !form.address) return alert("주소 입력 필요");
    if (!form.addressDetail) return alert("상세주소 입력 필요");
    if (!form.homepageUrl.trim()) return alert("홈페이지 주소 입력 필요");
    if (!/^https?:\/\//.test(form.homepageUrl)) return alert("홈페이지 주소는 http/https로 시작");
    if (!isEdit && !logoFile) return alert("회사 로고는 필수입니다.");
    if (new Date(form.startDate) > new Date(form.endDate)) return alert("운영일 설정 오류");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]: any) => {
      formData.append(key, key === "bizNumber" ? value.replace(/-/g, "") : value);
    });
    if (logoFile) formData.append("logo", logoFile);

    try {
      setIsButtonLoading(true);
      isEdit
        ? await apiClient.put("/com/company", formData, { headers: { "Content-Type": "multipart/form-data" } })
        : await apiClient.post("/com/company", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert(isEdit ? "회사 정보 수정 완료" : "회사 정보 등록 완료");
      router.push("/mypage");
    } catch (err) {
      alert(isEdit ? "회사 정보 수정 실패" : "회사 정보 등록 실패");
      console.error(err);
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md border space-y-6">
      <form className="space-y-5">
        <LabeledField label="회사명" id="companyName" name="companyName" value={form.companyName} onChange={handleChange} />
        <LabeledField label="사업자등록번호" id="bizNumber" name="bizNumber" value={form.bizNumber} onChange={handleChange} />
        <LabeledField label="대표자명" id="ceoName" name="ceoName" value={form.ceoName} onChange={handleChange} />

        <LabeledSelect label="기업 형태" id="companyType" name="companyType" value={form.companyType} options={companyOptions} onChange={(v) => setForm((f) => ({ ...f, companyType: v }))} />
        <LabeledSelect label="업종" id="industry" name="industry" value={form.industry} options={industryOptions} onChange={(v) => setForm((f) => ({ ...f, industry: v }))} />

        <LabeledField label="사원 수" id="employeeCount" name="employeeCount" value={String(form.employeeCount)} type="number" onChange={handleChange} />
        <LabeledField label="설립일" id="foundedDate" name="foundedDate" value={form.foundedDate} onChange={handleDateChange("foundedDate") } as="datepicker" />

        <LabeledField label="우편번호" id="zipCode" name="zipCode" value={form.zipCode} onClick={handleAddressSearch} readOnly />
        <LabeledField label="주소" id="address" name="address" value={form.address} onClick={handleAddressSearch} readOnly />
        <LabeledField label="상세 주소" id="addressDetail" name="addressDetail" value={form.addressDetail} onChange={handleChange} inputRef={detailRef} />
        <LabeledField label="지역" id="city" name="city" value={form.city} readOnly />

        <LabeledField label="홈페이지" id="homepageUrl" name="homepageUrl" value={form.homepageUrl} onChange={handleChange} />

        <div>
          <label htmlFor="logo" className="block text-sm font-medium mb-1 text-gray-700">회사 로고 {isEdit ? "(선택)" : "(필수)"}</label>
          <input type="file" id="logo" name="logo" accept="image/*" onChange={handleFileChange} className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>

        {logoPreview && (
          <div>
            <p className="text-sm text-gray-500 mb-1">현재 로고 미리보기:</p>
            <img src={logoPreview} alt="회사 로고 미리보기" className="w-40 h-40 object-contain border rounded" />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <SmartButton type="button" variant="primary" onClick={handleSubmit} disabled={isButtonLoading}>{isEdit ? "수정하기" : "등록하기"}</SmartButton>
          <Button type="button" variant="gray" onClick={() => router.push("/mypage")}>취소하기</Button>
        </div>
      </form>
    </div>
  );
}