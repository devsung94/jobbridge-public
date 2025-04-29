"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import apiClient from "@/(lib)/utils/apiClient";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  const [dailySignups, setDailySignups] = useState([]); // 예제 데이터
  const [totalUsers, setTotalUsers] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get("/admin/dashboard/stats");
        setDailySignups(data.dailySignups);
        setTotalUsers(data.totalUsers);
        setLabels(data.labels); // 만약 labels도 함께 받는다면
      } catch (error) {
        console.error("통계 데이터 불러오기 실패:", error);
      }
    };
    fetchData();
  }, []);
  

  const data = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "오늘 가입한 회원",
        data: dailySignups,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        fill: false,
      },
      {
        label: "누적 회원 수",
        data: totalUsers,
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        fill: false,
      },
    ],
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700">관리자 대시보드</h1>
      <p className="text-gray-600 mt-2">관리자 전용 콘텐츠</p>
      <div className="mt-6">
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold">회원 가입 현황</h2>
          <p className="text-gray-600">오늘 가입자 수: {dailySignups[dailySignups.length - 1]}명</p>
          <p className="text-gray-600">누적 가입자 수: {totalUsers[totalUsers.length - 1]}명</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">회원 가입 통계</h2>
          <Line data={data} />
        </div>
      </div>
    </div>
  );
}
