
import { Suspense } from "react";
import FoundIdClient from "@/components/find-idpw/FoundIdClient";


export default function Page() {
  return (
      <Suspense fallback={<div>로딩 중...</div>}>
        <FoundIdClient />
      </Suspense>
  );
}
