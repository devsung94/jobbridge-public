"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { SmartButton } from "@/components/ui/SmartButton";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 토큰 인증 먼저 수행
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("잘못된 접근입니다.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.post("/auth/verify-reset-token", { token });
        if (data.result === "Y") {
          setVerified(true);
        } else {
          setError(data.message || "유효하지 않은 링크입니다.");
        }
      } catch {
        setError("서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleReset = async () => {
    if (newPassword.length < 6) {
      setMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { data } = await apiClient.post("/auth/update-password", {
        token,
        newPassword,
      });

      if (data.result === "Y") {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        router.push("/login");
      } else {
        setMessage(data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border rounded-xl shadow mt-10 text-center">
      {loading ? (
        <p className="text-gray-600">인증 중입니다...</p>
      ) : error ? (
        <p className="text-red-500 font-semibold">{error}</p>
      ) : (
        <>
          <h2 className="text-xl font-bold text-blue-600 mb-4">🔐 비밀번호 재설정</h2>
          <input
            type="password"
            placeholder="새 비밀번호 입력"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl bg-blue-50 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl bg-blue-50 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <SmartButton
            onClick={handleReset}
            className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            비밀번호 변경
          </SmartButton>
          {message && <p className="text-sm text-red-500 mt-4">{message}</p>}
        </>
      )}
    </div>
  );
}
