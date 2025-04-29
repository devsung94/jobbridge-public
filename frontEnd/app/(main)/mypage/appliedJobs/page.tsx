"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Building2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { numberFormatter } from "@/(lib)/utils/common";
import { Button } from "@/components/ui/Button";

interface ApplicationItem {
  idx: number;
  jobIdx: number;
  title: string;
  logo: string;
  companyName: string;
  address: string;
  addressDetail: string;
  salary: string;
  regDate: string;
  endDate: string;
  isUse: string;
  isRead: string;
  isStatus: string;
  statusText: string;
}

export default function MySupportPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [validApplications, setValidApplications] = useState(0);

  useEffect(() => {
    const fetchMySupports = async () => {
      try {
        const { data } = await apiClient.get("/user/applications/myApplications");
        // console.log(data);
        if(data.result==='Y'){
          setApplications(data.data.applications);
          setTotalPages(data.data.totalPages);
          setTotalElements(data.data.totalElements);
          setValidApplications(data.data.validApplications);
        }else{
          setApplications([]);
          setTotalPages(1);
          setTotalElements(0);
          setValidApplications(0);
        }
      } catch (error) {
        console.error("지원 목록 불러오기 오류:", error);
      }
    };

    fetchMySupports();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Y": return "면접 제의";
      case "N": return "불합격";
      case "W": return "대기";
      case "C": return "지원 취소";
      default: return "-";
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              누적 지원 공고 {numberFormatter(totalElements)}개
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
              지원 공고 {numberFormatter(validApplications)}개
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button
              variant={"white"}
              size={"sm"}
              onClick={() => router.back()}
            >
            ← 뒤로가기
          </Button>
        </div>
      </div>

      
      
      <div className="grid gap-4">
        {applications.length === 0 ? (
          <p className="text-gray-500">아직 지원한 공고가 없습니다.</p>
        ) : (
          applications.map((item) => (
            <Card
              key={item.idx}
              className={`transition cursor-pointer hover:bg-gray-50 ${
                item.isUse === "N" ? "opacity-50" : ""
              }`}
              onClick={() => {
                router.push(`/jobs/${item.jobIdx}?mode=posts`)
              }}
              // onClick={() => router.push(`/jobs/${item.jobIdx}`)}
            >
              <CardContent className="p-4 flex gap-4">
                {/* 회사 로고 */}
                <div className="w-14 h-14 bg-gray-100 border rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={item.logo || "/default-logo.png"}
                    alt="로고"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* 텍스트 영역 */}
                <div className="flex-1 space-y-1 text-sm text-gray-700">
                  <p className="text-gray-900 font-semibold">{item.companyName}</p>
                  <p className="text-blue-700 font-bold text-base">{item.title}</p>
                  <p><strong>근무지:</strong> {item.address} {item.addressDetail}</p>
                  <p><strong>연봉:</strong> {item.salary ? `${numberFormatter(item.salary)}만원` : "협의"}</p>

                  <div className="flex gap-3 mt-2 text-xs font-medium">
                    <span className={`px-2 py-1 rounded-full ${
                      item.isRead === "N"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {item.isRead === "N" ? "미열람 📬" : "열람 ✅"}
                    </span>

                    <span className={`px-2 py-1 rounded-full ${
                      item.isStatus === "Y"
                        ? "bg-blue-100 text-blue-700"
                        : item.isStatus === "N"
                        ? "bg-red-100 text-red-700"
                        : item.isStatus === "C"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {getStatusLabel(item.isStatus)}
                    </span>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* 페이징: 목록 있을 때만 노출 */}
        {applications.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
}
