"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
// import "react-datepicker/dist/react-datepicker.css";
import { useDaumPostcode } from "@/(lib)/hooks/useDaumPostcode";
import apiClient from "@/(lib)/utils/apiClient";
import DatePicker from "@/components/ui/DatePickerInput";
import { SmartButton } from "@/components/ui/SmartButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const inputClass = "w-full p-3 border border-gray-300 rounded-lg mb-3";
const flexInputClass = "flex-1 p-3 border border-gray-300 rounded-lg";

export default function SignupPage() {
  const router = useRouter();
  const openPostcode = useDaumPostcode();

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [termsText, setTermsText] = useState("");
  const [privacyText, setPrivacyText] = useState("");

  const [formData, setFormData] = useState({
    role: "user",
    userId: "",
    password: "",
    rePassword: "",
    birthDay: "",
    gender: "M",
    name: "",
    email: "",
    hp: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    isEmailChecked: false,
    termsAgreed: false,
    privacyAgreed: false,
  });

  const refs = {
    userId: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    rePassword: useRef<HTMLInputElement>(null),
    birthDay: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    hp: useRef<HTMLInputElement>(null),
    zipCode: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
    addressDetail: useRef<HTMLInputElement>(null),
  };

  const onChange = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "");
    return v.length < 4 ? v : v.length < 8 ? v.replace(/(\d{3})(\d+)/, "$1-$2") : v.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  };

  const searchAddress = () => {
    openPostcode(
      ({ zonecode, address }) => {
        setFormData(prev => ({ ...prev, zipCode: zonecode, address, addressDetail: "" }));
      },
      () => refs.addressDetail.current?.focus()
    );
  };

  const validateAndSubmit = async () => {
    const { userId, password, rePassword, birthDay, name, email, hp, zipCode, address, addressDetail, isEmailChecked, termsAgreed , privacyAgreed} = formData;

    const required = [
      { cond: !userId, msg: "아이디를 입력해주세요.", ref: refs.userId },
      { cond: !password, msg: "비밀번호를 입력해주세요.", ref: refs.password },
      { cond: password !== rePassword, msg: "비밀번호가 일치하지 않습니다.", ref: refs.rePassword },
      { cond: password.length < 6, msg: "비밀번호는 6자 이상", ref: refs.password },
      { cond: !birthDay, msg: "생년월일을 선택해주세요.", ref: refs.birthDay },
      { cond: !/^\d{4}-\d{2}-\d{2}$/.test(birthDay), msg: "날짜 형식 오류 (YYYY-MM-DD)", ref: refs.birthDay },
      { cond: !name, msg: "이름을 입력해주세요.", ref: refs.name },
      { cond: !email, msg: "이메일을 입력해주세요.", ref: refs.email },
      { cond: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), msg: "이메일 형식 오류", ref: refs.email },
      { cond: !isEmailChecked, msg: "이메일 중복확인 필요", ref: refs.email },
      { cond: !hp, msg: "휴대폰번호를 입력해주세요.", ref: refs.hp },
      { cond: !/^01[016789]-\d{3,4}-\d{4}$/.test(hp), msg: "휴대폰 형식 오류", ref: refs.hp },
      { cond: !zipCode || !address, msg: "주소를 선택해주세요.", ref: refs.zipCode },
      { cond: !addressDetail, msg: "상세 주소를 입력해주세요.", ref: refs.addressDetail },
      { cond: !termsAgreed, msg: "서비스 이용약관 동의가 필요합니다." },
      { cond: !privacyAgreed, msg: "개인정보처리방침 동의가 필요합니다." },
    ];

    for (const { cond, msg, ref } of required) {
      if (cond) {
        alert(msg);
        ref?.current?.focus();
        return;
      }
    }

    try {
      setIsButtonLoading(true);
      const { data } = await apiClient.post("/auth/register", formData);
      data.result === "Y" ? (alert(data.message), router.push("/login")) : alert(data.message);
    } catch (err) {
      console.error(err);
      alert("회원가입 중 오류가 발생했습니다.");
      setIsButtonLoading(false);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const checkEmail = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("유효한 이메일을 입력해주세요.");
      refs.email.current?.focus();
      return;
    }

    try {
      const { data } = await apiClient.post("/auth/check-email", { email: formData.email });
      alert(data.result === "Y" ? "사용 가능한 이메일입니다." : data.message);
      setFormData({ ...formData, isEmailChecked: data.result === "Y" });
    } catch (err) {
      alert("중복 확인 중 오류 발생");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const { data } = await apiClient.get("/auth/terms");
        // console.log(data);
        if (data.result === "Y") {
          setTermsText(data.data.termsOfService || "");
          setPrivacyText(data.data.privacyPolicy || "");
        }
      } catch (err) {
        console.error("약관/정책 불러오기 실패:", err);
      }
    };
    fetchAdminSettings();
  }, []);
  
  return (
    <form className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 w-full space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">회원 유형</label>
          <select value={formData.role} onChange={onChange("role")} className={inputClass}>
            <option value="user">개인 회원</option>
            <option value="com">기업 회원</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">아이디</label>
          <input placeholder="아이디" value={formData.userId} onChange={onChange("userId")} ref={refs.userId} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input type="password" placeholder="비밀번호" value={formData.password} onChange={onChange("password")} ref={refs.password} className={inputClass} />
          <input type="password" placeholder="비밀번호 확인" value={formData.rePassword} onChange={onChange("rePassword")} ref={refs.rePassword} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">생년월일</label>
          <DatePicker value={formData.birthDay} onChange={(val) => setFormData({ ...formData, birthDay: val })} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">성별</label>
          <select value={formData.gender} onChange={onChange("gender")} className={inputClass}>
            <option value="M">남자</option>
            <option value="W">여자</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">이름</label>
          <input placeholder="이름" value={formData.name} onChange={onChange("name")} ref={refs.name} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">이메일</label>
          <div className="flex gap-2">
            <input placeholder="이메일" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value, isEmailChecked: false })} ref={refs.email} className={flexInputClass} />
            <button type="button" onClick={checkEmail} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">중복확인</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">휴대폰 번호</label>
          <input placeholder="휴대폰번호" value={formData.hp} onChange={(e) => setFormData({ ...formData, hp: formatPhone(e.target.value) })} ref={refs.hp} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">주소</label>
          <div className="flex gap-2">
            <input placeholder="우편번호" value={formData.zipCode} readOnly onClick={searchAddress} className={flexInputClass} />
            <button type="button" onClick={searchAddress} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">검색</button>
          </div>
          <input placeholder="주소" value={formData.address} readOnly onClick={searchAddress} className={inputClass} />
          <input placeholder="상세주소" value={formData.addressDetail} onChange={onChange("addressDetail")} ref={refs.addressDetail} className={inputClass} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="termsAgreed"
            checked={formData.termsAgreed}
            onChange={onChange("termsAgreed")}
            className="mt-1"
          />
          <label htmlFor="termsAgreed" className="text-sm text-gray-700 cursor-pointer" onClick={() => setShowTermsModal(true)}>
            [필수] 서비스 이용약관에 동의합니다.
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="privacyAgreed"
            checked={formData.privacyAgreed}
            onChange={onChange("privacyAgreed")}
            className="mt-1"
          />
          <label htmlFor="privacyAgreed" className="text-sm text-gray-700 cursor-pointer" onClick={() => setShowPrivacyModal(true)}>
            [필수] 개인정보처리방침에 동의합니다.
          </label>
        </div>

        <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>서비스 이용약관</DialogTitle>
              <DialogDescription className="max-h-[700px] overflow-y-auto whitespace-pre-line text-sm text-gray-700">
                {termsText || "서비스 이용약관 정보를 불러오는 중입니다..."}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>개인정보처리방침</DialogTitle>
              <DialogDescription className="max-h-[700px] overflow-y-auto whitespace-pre-line text-sm text-gray-700">
                {privacyText || "개인정보처리방침 정보를 불러오는 중입니다..."}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>


        <SmartButton type="button" variant="primary" className="w-full mt-4 py-4" onClick={validateAndSubmit} disabled={isButtonLoading}>회원가입</SmartButton>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요? <a href="/login" className="text-blue-600 hover:underline">로그인</a>
        </p>
      </div>
    </form>

  );
}
