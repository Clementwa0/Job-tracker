import { Suspense } from "react";
import { EmployerLogin as Employer } from "@/features/employer/auth";

export default function login(){
    return(
        <Suspense fallback={null}>
            <Employer />
        </Suspense>
    )
}