"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { calculateAge,formatBizNumber } from "@/(lib)/utils/common";
import { industryOptions } from "@/constants/options";


export default function EditUserPage() {
  const router = useRouter();
  const { idx } = useParams();
  const [user, setUser] = useState<any>({
    userId: "",
    name: "",
    hp: "",
    email: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    role: "", // 역할 필수
  });

  const [resume, setResume] = useState<any | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idx) return;
    fetchUser();

    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, [idx]);

  const fetchUser = async () => {
    try {
      const res = await apiClient.get(`/admin/users/${idx}`);
      const userData = res.data;
      // console.log(userData);
      setUser(userData);

      // 추가 데이터 가져오기
      if (userData.role === "user") {
        const resumeRes = await apiClient.get(`/admin/resume/${userData.userId}`);
        // console.log(resumeRes);
        setResume(resumeRes.data.data);
      } else if (userData.role === "com") {
        const companyRes = await apiClient.get(`/admin/company/${userData.userId}`);
        // console.log(companyRes);
        setCompany(companyRes.data.data);
      }
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      alert("사용자 정보를 불러올 수 없습니다.");
      // router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
          if (data.bname !== "") extraAddress += data.bname;
          if (data.buildingName !== "")
            extraAddress += (extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName);
          fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setUser({
          ...user,
          zipCode: data.zonecode,
          address: fullAddress,
          addressDetail: "",
        });
      },
    }).open();
  };

  const handleUpdateUser = async () => {
    if (!user.userId || !user.name || !user.address) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      await apiClient.post(`/admin/users/update`, { idx, ...user });
      alert("사용자 정보가 수정되었습니다.");
      router.push("/admin/users");
    } catch (error) {
      console.error("사용자 정보 수정 중 오류:", error);
      alert("사용자 정보를 수정하지 못했습니다.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  return (
    
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-700">사용자 수정</h2>
    {/* <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4"></h1> */}

      {/* 기본 정보 */}
      <div className="mb-4">
        <label className="block font-semibold">아이디</label>
        <input type="text" name="userId" value={user.userId} disabled className="w-full p-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">이름</label>
        <input type="text" name="name" value={user.name} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">휴대폰 번호</label>
        <input type="text" name="hp" value={user.hp} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">이메일</label>
        <input type="text" name="email" value={user.email} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">우편번호</label>
        <div className="flex">
          <input type="text" name="zipCode" value={user.zipCode} readOnly className="flex-1 p-2 border rounded" />
          <button onClick={handleAddressSearch} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            검색
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold">주소</label>
        <input type="text" name="address" value={user.address} readOnly onClick={handleAddressSearch} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">상세주소</label>
        <input type="text" name="addressDetail" value={user.addressDetail} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleUpdateUser}>
        저장
      </button>

      {/* 이력서 요약 보기 (일반회원) */}
      {user.role === "user" && resume && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">이력서 정보</h2>
          <div className="flex gap-6 items-start">
            <div className="w-32 h-40 border rounded overflow-hidden">
              <img
                src={resume.photo || "/img/default_profile.png"}
                alt="이력서 사진"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>이름:</strong> {resume.name}</p>
              <p><strong>성별:</strong> {resume.gender === "M" ? "남성" : "여성"}</p>
              <p><strong>나이:</strong> 만 {calculateAge(resume.birthDay)}</p>
              <p><strong>이메일:</strong> {resume.email}</p>
              <p><strong>휴대폰:</strong> {resume.hp}</p>
              <p><strong>주소:</strong> {`${resume.zipCode} ${resume.address} ${resume.addressDetail}`}</p>
              <p><strong>커리어 요약:</strong> {resume.careerSummary}</p>
              <p><strong>기술 스택:</strong> {resume.skillsList?.map((s: any) => s.skillName).join(", ")}</p>
              <p><strong>경력 개수:</strong> {resume.careers?.length}개</p>
            </div>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => router.push(`/admin/resume/edit/${user.userId}`)}
          >
            이력서 수정
          </button>
        </div>
      )}


      {/* 회사 정보 보기 (기업회원) */}
      {user.role === "com" && company && (
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">회사 정보</h2>
        <div className="flex gap-6 items-start">
          <div className="w-32 h-32 border rounded overflow-hidden bg-white">
            <img
              src={company.logo || "/img/default_company.png"}
              alt="회사 로고"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>회사명:</strong> {company.companyName}</p>
            <p><strong>대표자명:</strong> {company.ceoName}</p>
            <p><strong>사업자번호:</strong> {formatBizNumber(company.bizNumber)}</p>
            <p><strong>기업 형태:</strong> {company.companyType}</p>
            <p><strong>업종:</strong> {industryOptions.find(opt => opt.value === company.industry)?.label || company.industry}</p>
            <p><strong>사원 수:</strong> {company.employeeCount}명</p>
            <p><strong>설립일:</strong> {company.foundedDate}</p>
            <p><strong>홈페이지:</strong> <a href={company.homepageUrl} target="_blank" className="text-blue-600 underline">{company.homepageUrl}</a></p>
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => router.push(`/admin/company/edit/${user.userId}`)}
        >
          회사정보 수정
        </button>
      </div>
)}

    </div>
  );
}
