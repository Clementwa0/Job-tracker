import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main
          className="
            flex-1
            overflow-y-auto
            px-4 py-6
            md:px-6
            bg-gray-50
            dark:bg-gray-900
            transition-colors
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;