"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, ChevronDown, ChevronRight, User, LogOut, Settings, Activity, UserCircle, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  label: string;
  icon: React.ReactElement;
  children?: { label: string; href: string; }[];
  href?: string;
};

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboards",
    icon: <Menu className="w-4 h-4" />,
    children: [
      { label: "Track Dashboard", href: "/dashboard/track-list" },
    ],
  },
];

function Sidebar() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Dashboards open by default
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
      <div className="flex items-center w-full justify-center text-center gap-2 h-16 px-6 border-b border-slate-800">
        <Image src="/Union.svg" alt="Logo" width={60} height={60} className="h-20 w-20" />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="text-xs font-semibold uppercase text-slate-400 px-4 mb-2">Dashboard & Panels</div>
        <ul className="space-y-1">
          {sidebarItems.map((item, idx) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    className={`flex items-center gap-3 px-4 py-2 rounded w-full hover:bg-slate-800 transition ${openIndex === idx ? "bg-slate-800" : ""}`}
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    aria-expanded={openIndex === idx}
                  >
                    {item.icon}
                    <span className="font-medium text-sm flex-1 truncate text-left">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openIndex === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openIndex === idx && (
                    <ul className="pl-8 py-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link href={child.href} className="block text-slate-300 text-sm px-2 py-1 rounded hover:bg-slate-800 cursor-pointer truncate">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : item.href ? (
                <Link href={item.href} className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-800 transition font-medium text-sm">
                  {item.icon}
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    function listener(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  return (
    <header className="fixed left-64 top-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold">Do you know the latest update of 2022?</span>
          <span className="text-slate-500 text-sm">A overview of our is now available on You...</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {/* Flag */}
        {/* <div className="flex h-2 w-4 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold"><Image src="/image.png" alt="Logo" width={10} height={10} className="h-10 w-10" /></div> */}
        {/* User Profile Dropdown */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="text-right mr-2">
              <div className="text-xs text-slate-500">Administrator</div>
              <div className="text-sm font-medium text-slate-900">Abu Bin Ishtyak</div>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">AB</AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-8 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-50 animate-fade-in">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-blue-50 rounded-t-xl">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">AB</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-900">Abu Bin Ishtiyak</div>
                  <div className="text-sm text-slate-500">info@softnio.com</div>
                </div>
              </div>
              <div className="py-2">
                <button className="flex items-center w-full gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100">
                  <UserCircle className="w-5 h-5 text-blue-500" /> View Profile
                </button>
                <button className="flex items-center w-full gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100">
                  <Settings className="w-5 h-5 text-blue-500" /> Account Setting
                </button>
                <button className="flex items-center w-full gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100">
                  <Activity className="w-5 h-5 text-blue-500" /> Login Activity
                </button>
              </div>
              <div className="border-t border-slate-100">
                <button className="flex items-center w-full gap-3 px-4 py-2 text-red-500 hover:bg-slate-100">
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Settings Icon */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main className="pl-64 pt-16 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
