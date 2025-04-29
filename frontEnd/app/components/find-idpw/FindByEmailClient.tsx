"use client";

import { useState } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import { useSearchParams } from "next/navigation";
import { SmartButton } from "../ui/SmartButton";

export default function FindByEmailClient() {
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode");

  const validModes = ["id", "password", "reset"] as const;
  type ModeType = typeof validModes[number];

  const defaultMode: ModeType = validModes.includes(rawMode as ModeType)
    ? (rawMode as ModeType)
    : "id";

  const [mode, setMode] = useState<ModeType>(defaultMode);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      if (mode === "id") {
        const { data } = await apiClient.post("/auth/find-id", { email });
        if (data.result === "Y") {
          setMessage("입력하신 이메일로 아이디 확인 링크가 발송되었습니다.");
        } else {
          setMessage(data.message || "일치하는 계정을 찾을 수 없습니다.");
        }
      } else if (mode === "password") {
        const { data } = await apiClient.post("/auth/find-password", { email });
        if (data.result === "Y") {
          setMessage("입력하신 이메일로 비밀번호 재설정 링크가 발송되었습니다.");
        } else {
          setMessage(data.message || "메일 발송에 실패했습니다.");
        }
      }
    } catch(error:any) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-6 border border-gray-300 rounded-xl shadow-md">
      <div className="flex mb-6">
        <button
          onClick={() => setMode("id")}
          className={`w-1/2 py-2 font-semibold rounded-l-xl ${
            mode === "id" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          아이디 찾기
        </button>
        <button
          onClick={() => setMode("password")}
          className={`w-1/2 py-2 font-semibold rounded-r-xl ${
            mode === "password" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          비밀번호 찾기
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        가입 시 등록한 이메일을 입력해주세요.
        <br />
        {mode === "id"
          ? "해당 이메일로 아이디 확인 링크를 보냅니다."
          : "해당 이메일로 비밀번호 재설정 링크를 보냅니다."}
      </p>

      <input
        type="email"
        placeholder="이메일 주소를 입력해주세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border rounded-xl bg-blue-50 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <SmartButton
        onClick={handleSubmit}
        disabled={isSending}
        className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
      >
        확인
      </SmartButton>

      {message && (
        <div className="mt-4 text-center text-blue-600 text-sm font-medium">{message}</div>
      )}
    </div>
  );
}
