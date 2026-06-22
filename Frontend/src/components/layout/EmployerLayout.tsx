import { Outlet } from "react-router-dom";
import EmployerSidebar from "./EmployerSidebar";

export default function EmployerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <EmployerSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
