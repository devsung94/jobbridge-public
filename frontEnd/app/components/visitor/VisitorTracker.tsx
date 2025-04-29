'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import apiClient from "@/(lib)/utils/apiClient";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const recordVisitor = async () => {
      try {
        await apiClient.post("/visitor", { path: pathname });
      } catch (err) {
        console.error("방문자 체크 실패", err);
      }
    };

    recordVisitor();
  }, [pathname]); // pathname이 바뀔 때마다 방문자 체크

  return null;
}
