'use client'

import React, { useEffect } from "react";
import SideBar from "./sideBar/SideBar";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoggedIn = Cookies.get("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [pathname, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
}
