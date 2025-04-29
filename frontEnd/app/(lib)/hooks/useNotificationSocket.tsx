"use client"

import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useNotificationSocket(userIdx: number | null, onMessage: (msg: any) => void) {
  useEffect(() => {
    if (!userIdx) return;

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_PATH}/ws`); // ← API 배포 도메인에 맞게 수정
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        // console.log("🔗 WebSocket 연결 성공");

        client.subscribe(`/topic/notifications/${userIdx}`, (message) => {
          const notification = JSON.parse(message.body);
          onMessage(notification); // 수신된 알림 처리
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 오류 발생", frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userIdx, onMessage]);
}
