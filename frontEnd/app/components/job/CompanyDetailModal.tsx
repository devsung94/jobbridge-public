"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { companyOptions, industryOptions } from "@/constants/options";
import { getLabel } from "@/(lib)/utils/labelHelper";
import { getYearsSince, numberFormatter } from "@/(lib)/utils/common";

interface CompanyDetailModalProps {
  open: boolean;
  onClose: () => void;
  company: {
    logo: string;
    companyType: string;
    companyName: string;
    ceoName: string;
    industry: string;
    employeeCount: number;
    foundedDate: string;
    companyAddress: string;
  } | null;
}

export default function CompanyDetailModal({
  open,
  onClose,
  company,
}: CompanyDetailModalProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700">회사 상세 정보</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* 로고 */}
          {company.logo && (
            <img
              src={company.logo}
              alt="회사 로고"
              className="w-24 h-24 rounded-md object-cover border"
            />
          )}

          {/* 회사 이름 + 요약 */}
          <div className="flex flex-col justify-center">
            <p className="text-lg font-bold text-gray-900">{company.companyName}</p>
            <p className="text-sm text-gray-600">
              {getLabel(industryOptions, company.industry)} ·{" "}
              {getLabel(companyOptions, company.companyType)}
            </p>
          </div>
        </div>

        {/* 상세 정보 그리드 */}
        <div className="mt-6 border-t pt-4 text-sm text-gray-700 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500 font-medium">대표자명</span>
            <span className="col-span-2">{company.ceoName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500 font-medium">설립일</span>
            <span className="col-span-2">{company.foundedDate} ({getYearsSince(company.foundedDate)})</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500 font-medium">사원수</span>
            <span className="col-span-2">{numberFormatter(company.employeeCount.toLocaleString())}명</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500 font-medium">회사 주소</span>
            <span className="col-span-2">{company.companyAddress}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
