"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";
import apiClient from "@/(lib)/utils/apiClient";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const router = useRouter();
  const { role, checkAuth } = useAuth();

  const handleLogin = async () => {
    try {
      setIsButtonLoading(true);
      const response = await apiClient.post("/auth/login", { userId, password });
      if (response.data.result === "Y") {
        if (keepLogin) {
          localStorage.setItem("savedUserId", userId); 
        } else {
          localStorage.removeItem("savedUserId");
        }
        alert(response.data.message);
        await checkAuth();
        
        // user.role 값 확인 후 이동 처리
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }, 100); // checkAuth() 후 user 값 갱신되도록 약간의 지연

      } else {
        alert(response.data.message);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "로그인 실패");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      setUserId(savedId);
      setKeepLogin(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-md border border-gray-200 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">JobBridge</h1>

        <input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border px-4 py-3 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border px-4 py-3 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        />

        <div className="flex items-center mb-4 gap-2">
          <button
            id="keepLogin"
            type="button"
            onClick={() => setKeepLogin(!keepLogin)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300
              ${keepLogin ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
                ${keepLogin ? 'translate-x-0' : 'translate-x-5'}`}
            />
          </button>
          <label 
            htmlFor="keepLogin" 
            className={`text-sm ${keepLogin ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
          >
            아이디 저장
          </label>
        </div>


        <button
          onClick={handleLogin}
          disabled={isButtonLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition"
        >
          로그인
        </button>

        <div className="mt-5 flex justify-center gap-4 text-sm text-gray-500">
          <a href="/find-idpw?mode=id" className="hover:underline hover:text-blue-600">아이디 찾기</a>
          <span>|</span>
          <a href="/find-idpw?mode=password" className="hover:underline hover:text-blue-600">비밀번호 찾기</a>
          <span>|</span>
          <a href="/signup" className="hover:underline hover:text-blue-600">회원가입</a>
        </div>

          
        {/**
        <div className="mt-6">
          <button
            type="button"
            className="w-full border border-blue-500 text-blue-500 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition"
          >
            3초만에 간편하게 로그인!
          </button>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => alert("카카오 로그인 연동 예정")}
              className="flex items-center justify-center w-14 h-14 rounded-full shadow hover:scale-105 transition bg-yellow-300"
            >
              <img
                src="/kakao-icon.png"
                alt="카카오 로그인"
                className="w-8 h-8"
              />
            </button>
          </div>
        </div>
         */}  
         
      </div>
    </div>
  );
}
