// app/hoc/withAuth.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/(lib)/utils/AuthContext";

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const ProtectedComponent = (props: P) => {
        const { isLoggedIn, checkAuth } = useAuth();
        const router = useRouter();

        useEffect(() => {
            const verify = async () => {
                checkAuth();
                if (!isLoggedIn) {
                    alert("로그인이 필요합니다.");
                    router.replace("/login");
                }
            };
            verify();
        }, [isLoggedIn]);
        return <WrappedComponent {...props} />;
    };

    return ProtectedComponent;
};

export default withAuth;
