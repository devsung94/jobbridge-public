import { useState, Dispatch, SetStateAction } from "react";

// 전역에서 상태 변경할 수 있도록 저장할 setter 변수
let globalSetCount: Dispatch<SetStateAction<number>> | null = null;

// 알림 카운트를 공유하는 훅
export function useNotificationCount(): [number, Dispatch<SetStateAction<number>>] {
  const [count, setCount] = useState<number>(0);
  globalSetCount = setCount;
  return [count, setCount];
}

// 알림 카운트를 1 감소시키는 함수
export function decreaseNotificationCount(): void {
  if (globalSetCount) {
    globalSetCount((prev: number) => Math.max(0, prev - 1));
  }
}

// 알림 카운트를 지정한 값으로 초기화
export function resetNotificationCount(count: number): void {
  if (globalSetCount) {
    globalSetCount(count);
  }
}
