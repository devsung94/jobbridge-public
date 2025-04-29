"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border max-w-lg w-full animate-fade-in">
        <div className="flex flex-col items-center mb-4">
          <AlertTriangle className="text-yellow-500 w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">현재 점검 중입니다</h1>
          <p className="text-sm text-gray-600 mt-2">
            더 나은 서비스를 제공하기 위해 시스템 점검을 진행 중입니다.
            <br />불편을 드려 죄송합니다. 점검이 완료되면 다시 접속해주세요.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            홈으로 이동
          </Button>
          <Button
            onClick={() => router.push("/login")}
            className="w-full"
          >
            로그인 페이지로 이동
          </Button>

          <p className="text-xs text-gray-400 mt-2">
            관리자만 점검 중에도 접근 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
