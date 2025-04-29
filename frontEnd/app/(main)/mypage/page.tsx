// app/(main)/community/page.tsx
import { Suspense } from "react";
import MyPage from "@/components/mypage/MyPage";

export default function MyPageServer() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MyPage />
    </Suspense>
  );
}
