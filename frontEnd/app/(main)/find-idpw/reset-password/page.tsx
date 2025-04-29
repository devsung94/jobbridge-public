
import { Suspense } from "react";
import ResetPasswordClient from "@/components/find-idpw/ResetPasswordClient";


export default function Page() {
  return (
      <Suspense fallback={<div>로딩 중...</div>}>
        <ResetPasswordClient />
      </Suspense>
  );
}
