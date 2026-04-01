"use client";

import React, { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";

export default function SideBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userRole = Cookies.get("userRole") || "Management";

  const handleLogout = () => {
    Cookies.remove("isLoggedIn");
    Cookies.remove("userRole");
    router.push("/login");
  };

  const allItems = [
    { label: "Dashboard", href: "/", roles: ["Admin", "Admission Officer", "Management"] },
    { label: "Masters", href: "/mastersetup", roles: ["Admin"] },
    { label: "Seat Matrix", href: "/seat-matrix", roles: ["Admin"] },
    { label: "Applicants", href: "/applicants", roles: ["Admin", "Admission Officer"] },
    { label: "Admissions", href: "/admissions", roles: ["Admin", "Admission Officer", "Management"] },
  ];

  const sidebarItems = allItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <h2 className="text-lg font-semibold">ADM</h2>
        <button onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6
          transform transition-transform duration-300 flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64 z-50 overflow-y-auto
        `}
      >
        <div>
          <h2 className="text-xl font-bold hidden md:block tracking-tight text-white">EDU MERGE</h2>
        </div>
        <p>{userRole}</p>
        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block p-3 rounded cursor-pointer transition ${isActive ? "bg-gray-600 font-semibold" : "hover:bg-gray-700"
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout at bottom */}
        <div className="pt-6 border-t border-gray-700 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition font-medium text-rose-400"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}