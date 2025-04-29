"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function FoundIdPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      if (!token) {
        setError("잘못된 접근입니다.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.post("/auth/confirm-find-id", { token });

        if (data.result === "Y") {
          setUserId(data.userId);
        } else {
          setError(data.message || "유효하지 않은 링크입니다.");
        }
      } catch (err) {
        setError("서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border text-center">
        {loading ? (
          <p className="text-gray-600 text-sm">⏳ 아이디를 불러오는 중입니다...</p>
        ) : error ? (
          <div className="text-red-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10" />
            <p className="text-lg font-semibold">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-lg font-semibold">아이디 확인 완료</h2>
            </div>

            <p className="text-gray-700 mb-2">회원님의 아이디는</p>
            <p className="text-2xl font-bold text-blue-700 underline">{userId}</p>

            <Link
              href="/login"
              className="inline-block mt-6 px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              로그인 하러가기
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
