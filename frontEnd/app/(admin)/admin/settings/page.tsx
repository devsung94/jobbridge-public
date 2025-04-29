"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/(lib)/utils/apiClient";

export default function AdminSettings() {
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [termsOfService, setTermsOfService] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  // 초기 데이터 불러오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get("/admin/settings");
        // console.log(data);
        if (data.result === "Y") {
          const settings = data.data;
          setSiteTitle(settings.siteTitle ?? "");
          setSiteDescription(settings.siteDescription ?? "");
          setAdminId(settings.adminId ?? "");
          setAdminEmail(settings.adminEmail ?? "");
          setMaintenanceMode(settings.maintenanceMode ?? false);
          setTermsOfService(settings.termsOfService ?? "");
          setPrivacyPolicy(settings.privacyPolicy ?? "");
        }
      } catch (err) {
        console.error("설정 불러오기 실패:", err);
      }
    };
    fetchSettings();
  }, []);
  
  const handleSave = async () => {
    try {
      if(!confirm("정말 설정을 저장하시겠습니까?"))return;
      const payload = {
        siteTitle,
        siteDescription,
        adminId,
        adminEmail,
        maintenanceMode,
        termsOfService,
        privacyPolicy,
      };

      const { data } = await apiClient.patch("/admin/settings", payload);

      if (data.result === "Y") {
        alert("설정이 저장되었습니다.");
      } else {
        alert("저장에 실패했습니다: " + data.message);
      }
    } catch (err) {
      console.error("설정 저장 오류:", err);
      alert("서버 오류로 저장에 실패했습니다.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h1 className="text-gray-600 text-2xl font-bold">관리자 설정</h1>
      <p className="text-gray-600 mt-2">사이트 및 관리자 설정을 변경할 수 있습니다.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">사이트 제목</label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">사이트 소개</label>
          <input
            type="text"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">관리자 아이디</label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">관리자 이메일</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
          />
        </div>
        
        <div className="flex items-center mb-4 gap-2">
          <button
            id="maintenanceMode"
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300
              ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
                ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <label
            htmlFor="maintenanceMode"
            className={`text-sm ${maintenanceMode ? 'text-red-600 font-semibold' : 'text-gray-600'}`}
          >
            점검 모드 {maintenanceMode ? '(활성화됨)' : '(비활성화됨)'}
          </label>
        </div>


        <div>
          <label className="block text-gray-700 font-medium">서비스 이용약관</label>
          <textarea
            value={termsOfService}
            onChange={(e) => setTermsOfService(e.target.value)}
            rows={6}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
            placeholder="이용약관 내용을 입력하세요..."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">개인정보처리방침</label>
          <textarea
            value={privacyPolicy}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            rows={6}
            className="w-full p-2 border border-gray-300 rounded-lg mt-1"
            placeholder="개인정보 처리방침 내용을 입력하세요..."
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
