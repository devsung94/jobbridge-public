// app/(main)/community/page.tsx
import { Suspense } from "react";
import JobListingsPage from "@/components/job/JobList";

export default function JobsPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <JobListingsPage />
    </Suspense>
  );
}
