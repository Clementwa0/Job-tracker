import { Outlet } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"

const Layout = () => {
  return (
     <div className="flex h-screen w-full overflow-hidden dark:bg-gray-900">

      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden dark:bg-gray-900">
        <Header />
        
        <main className="flex-1 overflow-y-auto px-3 py-5 md:px-5 py-1 dark:bg-gray-900">
          
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout