import { Outlet } from "react-router";

import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import { useState } from "react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div
        className="
flex
flex-1
flex-col
overflow-hidden
transition-all
duration-300
"
      >

        {/* Header */}
        <Header collapsed={collapsed} />

        {/* Page Content */}
        <main
          className={`
flex-1
overflow-y-auto
transition-all
duration-300
${collapsed ? "px-10 py-8" : "px-8 py-8"}
`}
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}