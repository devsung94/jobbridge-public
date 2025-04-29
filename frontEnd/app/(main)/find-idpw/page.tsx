
import { Suspense } from "react";
import FindByEmailClient from "@/components/find-idpw/FindByEmailClient";


export default function Page() {
  return (
      <Suspense fallback={<div>로딩 중...</div>}>
        <FindByEmailClient />
      </Suspense>
  );
}
