"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import LabeledField from "@/components/ui/LabeledField";
import LabeledSelect, { OptionType } from "@/components/ui/LabeledSelect";
import { useDaumPostcode } from "@/(lib)/hooks/useDaumPostcode";
import { formatBizNumber } from "@/(lib)/utils/common";
import { companyOptions, industryOptions } from "@/constants/options";

interface CompanyForm {
  companyType: string;
  companyName: string;
  bizNumber: string;
  ceoName: string;
  industry: string;
  employeeCount: number;
  foundedDate: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  homepageUrl: string;
  startDate: string;
  endDate: string;
}

interface CompanyEditPageProps {
  userId: string;
}

export default function AdminCompanyEditPage({userId}:CompanyEditPageProps) {
  const router = useRouter();
  // const { userId } = useParams();
  const openPostcode = useDaumPostcode();
  const detailRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CompanyForm>({
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
    homepageUrl: "",
    startDate: "",
    endDate: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await apiClient.get(`/admin/company/${userId}`);
        const { logo, ...restForm } = data.data;
        restForm.bizNumber = formatBizNumber(restForm.bizNumber);
        setForm(restForm);
        setLogoPreview(logo);
      } catch (error) {
        alert("회사 정보를 불러오지 못했습니다.");
        console.error(error);
        // router.push("/admin/users");
      }
    };
    if (userId) fetchCompany();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "bizNumber") {
      const formatted = formatBizNumber(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("5MB 이하의 이미지만 업로드 가능합니다.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddressSearch = () => {
    openPostcode(
      (result) => {
        setForm((prev) => ({
          ...prev,
          zipCode: result.zonecode,
          address: result.address,
          addressDetail: result.addressDetail || "",
        }));
      },
      () => {
        detailRef.current?.focus();
      }
    );
  };

  const handleSubmit = async () => {
    const bizNumberRegex = /^\d{3}-\d{2}-\d{5}$/;

    if (!form.companyName.trim()) return alert("회사명을 입력해주세요.");
    if (!form.bizNumber.trim()) return alert("사업자등록번호를 입력해주세요.");
    if (!bizNumberRegex.test(form.bizNumber)) return alert("사업자등록번호 형식이 올바르지 않습니다. 예: 123-45-67890");
    if (!form.ceoName.trim()) return alert("대표자명을 입력해주세요.");
    if (!form.companyType) return alert("기업 형태를 선택해주세요.");
    if (!form.industry) return alert("업종을 선택해주세요.");
    if (!form.employeeCount || form.employeeCount < 1) return alert("사원 수를 1명 이상으로 입력해주세요.");
    if (!form.foundedDate) return alert("설립일을 선택해주세요.");
    if (!form.zipCode) return alert("우편번호를 선택해주세요.");
    if (!form.address) return alert("주소를 입력해주세요.");
    if (!form.addressDetail.trim()) return alert("상세 주소를 입력해주세요.");
    if (!form.homepageUrl.trim()) return alert("홈페이지 주소를 입력해주세요.");
    if (!/^https?:\/\//.test(form.homepageUrl)) return alert("홈페이지 주소는 http:// 또는 https://로 시작해야 합니다.");
    if (new Date(form.startDate) > new Date(form.endDate)) return alert("운영 시작일은 종료일보다 빠를 수 없습니다.");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]: any) => {
      if (key === "bizNumber") {
        formData.append(key, value.replace(/-/g, ""));
      } else {
        formData.append(key, value as string);
      }
    });
    if (logoFile) formData.append("logo", logoFile);

    try {
      await apiClient.put(`/admin/company/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("회사 정보 수정 완료");
      router.push("/admin/users");
    } catch (error) {
      alert("회사 정보 수정 실패");
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">회사 정보 수정</h1>
      <form className="grid gap-4">
        <LabeledField label="회사명" id="companyName" name="companyName" value={form.companyName} onChange={handleChange} />
        <LabeledField label="사업자등록번호" id="bizNumber" name="bizNumber" value={form.bizNumber} placeholder="123-45-67890" onChange={handleChange} />
        <LabeledField label="대표자명" id="ceoName" name="ceoName" value={form.ceoName} onChange={handleChange} />

        <LabeledSelect label="기업 형태" id="companyType" name="companyType" value={form.companyType} onChange={(value) => setForm((prev) => ({ ...prev, companyType: value }))} options={companyOptions} />
        <LabeledSelect label="업종" id="industry" name="industry" value={form.industry} onChange={(value) => setForm((prev) => ({ ...prev, industry: value }))} options={industryOptions} />

        <LabeledField label="사원 수" id="employeeCount" name="employeeCount" type="number" value={String(form.employeeCount)} onChange={handleChange} />
        <LabeledField label="설립일" id="foundedDate" name="foundedDate" type="date" value={form.foundedDate} onChange={handleChange} />
        <LabeledField label="우편번호" id="zipCode" name="zipCode" value={form.zipCode} readOnly onClick={handleAddressSearch} />
        <LabeledField label="주소" id="address" name="address" value={form.address} readOnly onClick={handleAddressSearch} />
        <LabeledField label="상세 주소" id="addressDetail" name="addressDetail" value={form.addressDetail} onChange={handleChange} inputRef={detailRef} />
        <LabeledField label="홈페이지" id="homepageUrl" name="homepageUrl" value={form.homepageUrl} onChange={handleChange} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="logo">회사 로고 변경 (선택)</label>
          <input type="file" id="logo" name="logo" accept="image/*" onChange={handleFileChange} className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>

        {logoPreview && (
          <div>
            <p className="text-sm text-gray-600 mb-1">현재 로고 미리보기:</p>
            <img src={logoPreview} alt="회사 로고 미리보기" className="w-40 h-40 object-contain border rounded mb-2" />
          </div>
        )}

        <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">수정 완료</button>
      </form>
    </div>
  );
}