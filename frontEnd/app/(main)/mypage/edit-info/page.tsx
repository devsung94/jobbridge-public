"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import { useDaumPostcode } from "@/(lib)/hooks/useDaumPostcode";
import apiClient from "@/(lib)/utils/apiClient";
import { SmartButton } from "@/components/ui/SmartButton";
import { Button } from "@/components/ui/Button";

export default function MyPage() {
  const { userId, userName } = useAuth();
  const router = useRouter();
  const openPostcode = useDaumPostcode();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [userInfo, setUserInfo] = useState({
    role: "",
    userId: "",
    name: "",
    gender: "",
    birthDay: "",
    email: "",
    hp: "",
    zipCode: "",
    address: "",
    addressDetail: ""
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const refs = {
    email: useRef<HTMLInputElement>(null),
    hp: useRef<HTMLInputElement>(null),
    zipCode: useRef<HTMLInputElement>(null),
    addressDetail: useRef<HTMLInputElement>(null),
  };

  const onChange = (key: keyof typeof userInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [key]: e.target.value });
    if (key === "email") setIsEmailChecked(false);
  };

  useEffect(() => {
    if (!userId) return router.push("/login");

    const fetchUserInfo = async () => {
      try {
        const { data } = await apiClient.get(`/user/${userId}`);
        if (data.result === "Y") {
          setUserInfo({
            role: data.data.role ?? "",
            userId: data.data.userId ?? "",
            name: data.data.name ?? "",
            gender: data.data.gender ?? "",
            birthDay: data.data.birthDay ?? "",
            email: data.data.email ?? "",
            hp: data.data.hp ?? "",
            zipCode: data.data.zipCode ?? "",
            address: data.data.address ?? "",
            addressDetail: data.data.addressDetail ?? ""
          });
          setOriginalEmail(data.data.email ?? ""); // 기존 이메일 저장
        }
      } catch (err) {
        console.error("회원 정보 불러오기 실패:", err);
      }
    };

    fetchUserInfo();
  }, [userId, router]);

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "");
    return v.length < 4 ? v : v.length < 8 ? v.replace(/(\d{3})(\d+)/, "$1-$2") : v.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  };

  const handleCheckEmailDuplicate = async () => {
    if (!userInfo.email.trim()) { refs.email.current?.focus(); return alert("이메일을 입력해주세요."); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) { refs.email.current?.focus(); return alert("이메일 형식 오류"); }

    try {
      const { data } = await apiClient.post("/auth/check-email", { email: userInfo.email, userId });
      alert(data.result === "Y" ? "사용 가능한 이메일입니다." : data.message);
      setIsEmailChecked(data.result === "Y");
    } catch (err) {
      console.error("이메일 중복 확인 실패:", err);
      alert("중복 확인 중 오류가 발생했습니다.");
      setIsEmailChecked(false);
    }
  };

  const handleAddressSearch = () => {
    openPostcode(
      ({ zonecode, address }) => {
        setUserInfo(prev => ({ ...prev, zipCode: zonecode, address, addressDetail: "" }));
      },
      () => refs.addressDetail.current?.focus()
    );
  };

  const handleUpdate = async () => {
    const validations = [
      { cond: !userInfo.email, msg: "이메일을 입력해주세요.", ref: refs.email },
      { cond: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email), msg: "이메일 형식 오류", ref: refs.email },
      { cond: userInfo.email !== originalEmail && !isEmailChecked, msg: "이메일 중복 확인 필요", ref: refs.email },
      { cond: !userInfo.hp, msg: "휴대폰번호를 입력해주세요.", ref: refs.hp },
      { cond: !/^01[016789]-\d{3,4}-\d{4}$/.test(userInfo.hp), msg: "휴대폰 번호 형식 오류", ref: refs.hp },
      { cond: !userInfo.zipCode || !userInfo.address, msg: "주소를 선택해주세요.", ref: refs.zipCode },
      { cond: !userInfo.addressDetail, msg: "상세 주소를 입력해주세요.", ref: refs.addressDetail },
    ];

    for (const { cond, msg, ref } of validations) {
      if (cond) {
        alert(msg);
        ref?.current?.focus();
        return;
      }
    }

    try {
      setIsButtonLoading(true);
      const { data } = await apiClient.put("/user/update", userInfo);
      data.result === "Y"
        ? (alert("정보가 수정되었습니다."), router.push("/mypage"))
        : alert("수정 실패: " + data.message);
    } catch (err) {
      console.error("정보 수정 오류:", err);
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleCancel = () => router.push("/mypage");

  return (
    <div className="w-full mx-auto mb-4">
      <form className="bg-white p-8 rounded-2xl shadow-md border space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="bg-gray-50 p-3 border border-gray-300 rounded-lg" value={userInfo.role === "user" ? "일반회원" : "기업회원"} readOnly />
          <input className="bg-gray-50 p-3 border border-gray-300 rounded-lg" value={userInfo.userId} readOnly />
          <input className="bg-gray-50 p-3 border border-gray-300 rounded-lg" value={userInfo.gender === "M" ? "남성" : "여성"} readOnly />
          <input className="bg-gray-50 p-3 border border-gray-300 rounded-lg" value={userInfo.name} readOnly />
          <input className="bg-gray-50 p-3 border border-gray-300 rounded-lg sm:col-span-2" value={userInfo.birthDay} readOnly />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <input className="sm:col-span-2 p-3 border border-gray-300 rounded-lg" value={userInfo.email} onChange={onChange("email")} ref={refs.email} placeholder="이메일" />
          <button type="button" className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600" onClick={handleCheckEmailDuplicate}>중복확인</button>
        </div>

        <input className="w-full p-3 border border-gray-300 rounded-lg" value={userInfo.hp} onChange={(e) => setUserInfo({ ...userInfo, hp: formatPhone(e.target.value) })} ref={refs.hp} placeholder="휴대폰 번호" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <input className="sm:col-span-2 p-3 border border-gray-300 rounded-lg" value={userInfo.zipCode} onClick={handleAddressSearch} ref={refs.zipCode} placeholder="우편번호" readOnly />
          <button type="button" onClick={handleAddressSearch} className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">검색</button>
        </div>

        <input className="w-full p-3 border border-gray-300 rounded-lg" value={userInfo.address} readOnly onClick={handleAddressSearch} placeholder="주소" />

        <input className="w-full p-3 border border-gray-300 rounded-lg" value={userInfo.addressDetail} onChange={onChange("addressDetail")} ref={refs.addressDetail} placeholder="상세 주소" />

        <div className="flex justify-end gap-2 pt-2">
          <SmartButton type="button" variant="primary" onClick={handleUpdate} disabled={isButtonLoading}>수정하기</SmartButton>
          <Button type="button" variant="gray" onClick={handleCancel}>취소하기</Button>
        </div>
      </form>
    </div>
  );
}
