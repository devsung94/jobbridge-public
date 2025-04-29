// app/(main)/community/page.tsx
import { Suspense } from "react";
import SearchClient from "@/components/search/SearchClient";

export default function SearchServer() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SearchClient />
    </Suspense>
  );
}
