import { Suspense } from "react";
import Auth from "@/components/auth/Auth";

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <Auth />
        </Suspense>
    );
}