// app/(main)/community/page.tsx
import { Suspense } from "react";
import CommunityClient from "@/components/community/CommunityClient";

export default function CommunityPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CommunityClient />
    </Suspense>
  );
}

