// app/notifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import apiClient from '@/(lib)/utils/apiClient';
import { decreaseNotificationCount, resetNotificationCount } from "@/(lib)/hooks/useNotificationCount";
import Pagination from '@/components/ui/Pagination';

interface Notification {
  idx: number;
  message: string;
  link: string;
  ip: string;
  isRead: string;
  isUse: string;
  regDate: string;
  editDate: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 10;

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/user/notifications', {
        params: { page, size: pageSize },
      });
      // console.log(data);

      if (data.result === "Y") {
        setNotifications(data.data.notifications);
        setTotalPages(data.data.totalPages);
      } else {
        setNotifications([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('알림 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);
  

  const handleClick = async (notification: Notification) => {
    // 읽음 처리 후 이동
    if (notification.isRead==="N") {
      await apiClient.post(`/user/notifications/${notification.idx}/read`);
      decreaseNotificationCount();
    }
    router.push(notification.link);
  };

  const handleMarkAllAsRead = async () => {
    try {
      if(!confirm("정말 모두 읽음 처리하시겠습니까?"))return;
      await apiClient.post("/user/notifications/read-all");
      resetNotificationCount(0);    // 알림 수 초기화
      fetchNotifications();        // 다시 불러오기
    } catch (error) {
      console.error("모두 읽음 처리 실패:", error);
    }
  };

  return (
   
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">알림 목록</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-gray-500 text-center py-10">알림이 없습니다.</div>
      ) : (
        <>
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.idx}
                onClick={() => handleClick(notification)}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-opacity ${
                  notification.isRead==="Y"
                    ? 'bg-white opacity-50' // 읽은 알림 → 반투명
                    : 'bg-blue-50 border-blue-300 opacity-100' // 안 읽은 알림 → 뚜렷함
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notification.regDate), { addSuffix: true, locale: ko })}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            />
        </>
      )}
    </div>
  );
}
