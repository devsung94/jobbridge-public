"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import apiClient from "@/(lib)/utils/apiClient";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  userId: string;
  role: string;
}

interface AuthContextType {
  userIdx: number | null;
  userId: string | null;
  userName: string | null;
  role: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userIdx, setUserIdx] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = (token: string) => {
    const { exp } = jwtDecode<DecodedToken>(token);
    const expiresIn = exp * 1000 - Date.now() - 30000; // 30초 전 Refresh

    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    refreshTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiClient.post("/auth/refresh");
        if (data.result === "Y") {
          // console.log("🔄 AccessToken 자동 갱신 성공");
          const updatedToken = data.data.accessToken;
          scheduleTokenRefresh(updatedToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error("🔴 토큰 갱신 실패:", error);
        logout();
      }
    }, expiresIn);
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/auth/loginCheck");
      // console.log(data);
      if (data.result === "Y") {

        // 점검 모드 중이고 관리자 아닌 경우
        if (data.data.maintenanceMode === true && data.data.role !== "admin") {
          console.warn("⚠️ 점검 중이므로 일반 유저는 접근할 수 없습니다.");
          logout();
          if (typeof window !== "undefined") {
            window.location.href = "/maintenance";
          }
          return;
        }
        setUserIdx(data.data.idx);
        setUserId(data.data.userId);
        setUserName(data.data.name);
        setRole(data.data.role);
        scheduleTokenRefresh(data.data.accessToken); 
        setIsLoggedIn(true);

      } else {
        setUserIdx(null);
        setUserId(null);
        setUserName(null);
        setRole(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      setUserIdx(null);
      setUserId(null);
      setUserName(null);
      setRole(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.post("/auth/logout");
    setUserId(null);
    setUserName(null);
    setRole(null);
    setIsLoggedIn(false);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  };

  useEffect(() => {
    checkAuth();
    
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ userIdx, userId, userName, role, isLoggedIn, isLoading, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};