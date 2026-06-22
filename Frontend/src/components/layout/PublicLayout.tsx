import { Outlet } from "react-router-dom";
import { Nav, Footer } from "@/components";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
