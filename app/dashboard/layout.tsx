"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, ChevronDown, ChevronRight, User, LogOut, Settings, Activity, UserCircle, Mail, Home, ChevronRight as ChevronRightIcon, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "sonner";

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

import {  X } from "lucide-react";


function SidebarMobile() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="sm:hidden fixed top-4 left-4 z-40 p-2 text-white"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-6 h-6 text-black" />
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200 transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 sm:static sm:z-30`}
      >
        {/* Close button for mobile */}
        <div className="sm:hidden flex justify-end p-4">
          <button onClick={() => setMobileOpen(false)} className="text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center w-full justify-center text-center gap-2 h-16 px-6 border-b border-slate-200">
          <Image src="/Union.svg" alt="Logo" width={60} height={60} className="h-20 w-20" />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="text-xs font-semibold uppercase text-slate-500 px-4 mb-2">Dashboard & Panels</div>
          <ul className="space-y-1">
            {sidebarItems.map((item, idx) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      className={`flex items-center gap-3 px-4 py-2 rounded w-full hover:bg-slate-100 transition ${
                        openIndex === idx ? "bg-slate-100" : ""
                      }`}
                      onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      aria-expanded={openIndex === idx}
                    >
                      {item.icon}
                      <span className="font-medium text-sm flex-1 truncate text-left">{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          openIndex === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openIndex === idx && (
                      <ul className="pl-8 py-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className="block text-slate-600 text-sm px-2 py-1 rounded hover:bg-slate-100 cursor-pointer truncate"
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-100 transition font-medium text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.icon}
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
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

// Breadcrumb component
function Breadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Always start with Dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      // icon: <Home className="w-4 h-4" />
    });
    
    // Build breadcrumbs based on current path
    let currentPath = '/dashboard';
    
    paths.forEach((path, index) => {
      if (index === 0) return; // Skip 'dashboard' as we already added it
      
      currentPath += `/${path}`;
      
      // Format the path label (capitalize and replace hyphens with spaces)
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
        icon: null
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // For mobile, show only the last 2 breadcrumbs to save space
  const mobileBreadcrumbs = breadcrumbs.length > 2 ? breadcrumbs.slice(-2) : breadcrumbs;
  
  return (
    <>
      {/* Desktop breadcrumbs */}
      <nav className="hidden sm:flex items-center space-x-1 text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-slate-400 mx-2" />
            )}
            {index === breadcrumbs.length - 1 ? (
              // Current page - not clickable
              <span className="flex items-center text-xs gap-1 text-slate-900 font-medium">
                {/* {breadcrumb.icon} */}
                {breadcrumb.label}
              </span>
            ) : (
              // Clickable breadcrumb
              <Link
                href={breadcrumb.href}
                className="flex items-center text-xs gap-1 text-slate-600 hover:text-blue-600 transition-colors"
              >
                {/* {breadcrumb.icon} */}
                {breadcrumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
      
      {/* Mobile breadcrumbs */}
      {/* <nav className="flex sm:hidden items-center space-x-1 text-xs">
        {mobileBreadcrumbs.length > 1 && (
          <>
            <Link
              href={breadcrumbs[breadcrumbs.length - 2]?.href || '/dashboard'}
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronRightIcon className="w-3 h-3 rotate-180" />
              <span className="truncate max-w-20">
                {breadcrumbs[breadcrumbs.length - 2]?.label || 'Dashboard'}
              </span>
            </Link>
            <ChevronRightIcon className="w-3 h-3 text-slate-400 mx-1" />
          </>
        )}
        <span className="flex items-center gap-1 text-slate-900 font-medium truncate max-w-24">
          {mobileBreadcrumbs[mobileBreadcrumbs.length - 1]?.icon}
          {mobileBreadcrumbs[mobileBreadcrumbs.length - 1]?.label}
        </span>
      </nav> */}
    </>
  );
}

function Topbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    initial: ''
  });

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  // Load user data from sessionStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userName = sessionStorage.getItem('user_name') || '';
      const userEmail = sessionStorage.getItem('user_email') || '';
      const initial = (userName || userEmail).charAt(0) || '';
      
      setUserData({
        name: userName,
        email: userEmail,
        initial: initial
      });
    }
  }, []);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      router.push('/');
    }
  };

  return (
    <header className="fixed left-64 top-0 right-0 h-16 bg-transparent sm:bg-white border-0 sm:border-b border-slate-200 flex items-center justify-between px-8 z-20">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </button>
        
        {/* Breadcrumbs - visible on both mobile and desktop */}
        <div className="flex items-center gap-2">
          <Breadcrumbs />
        </div>
      </div>
      <div className="flex items-center gap-6">
        {/* Flag */}
        {/* <div className="flex h-2 w-4 items-center justify-center rounded bg-[#1A4D2E] text-white text-xs font-bold"><Image src="/image.png" alt="Logo" width={10} height={10} className="h-10 w-10" /></div> */}
        {/* User Profile Dropdown */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="text-right mr-2">
              <div className="text-xs hidden sm:block text-slate-500">Administrator</div>
              <div className="text-xs hidden sm:block font-medium text-slate-900">{userData.name || userData.email}</div>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#1A4D2E] text-white text-md font-semibold">{userData.initial}</AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-50 animate-fade-in">
              <div className="flex items-center gap-3 p-4 pt-20 border-b border-slate-100 bg-blue-50 rounded-t-xl">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#1A4D2E] text-white text-sm font-semibold">{userData.initial}</AvatarFallback>
                </Avatar>
                <div>
                  {/* <div className="font-semibold text-slate-900">Abu Bin Ishtiyak</div> */}
                  <div className="text-sm text-slate-500">{userData.email}</div>
                </div>
              </div>
              <div className="py-2">
                <Link   href="/dashboard" className="flex items-center w-full gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100">
                  <UserCircle className="w-5 h-5 text-blue-500" /> Home
                </Link>
               
              </div>
              <div className="border-t border-slate-100">
                <button onClick={handleSignOut} className="flex items-center w-full gap-3 px-4 py-2 text-red-500 hover:bg-slate-100">
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Settings Icon */}
       
      </div>
    </header>
  );
}
function SidebarDesktop() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Dashboards open by default
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200">
      <div className="flex items-center w-full justify-center text-center gap-2 h-16 px-6 border-b border-slate-200">
        <Image src="/Union.svg" alt="Logo" width={60} height={60} className="h-20 w-20" />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="text-xs font-semibold uppercase text-slate-500 px-4 mb-2">Dashboard & Panels</div>
        <ul className="space-y-1">
          {sidebarItems.map((item, idx) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    className={`flex items-center gap-3 px-4 py-2 rounded w-full hover:bg-slate-100 transition ${openIndex === idx ? "bg-slate-100" : ""}`}
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    aria-expanded={openIndex === idx}
                  >
                    {item.icon}
                    <span className="font-medium text-sm flex-1 truncate text-left">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openIndex === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openIndex === idx && (
                    <ul className="pl-8 py-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link href={child.href} className="block text-slate-600 text-sm px-2 py-1 rounded hover:bg-slate-100 cursor-pointer truncate">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : item.href ? (
                <Link href={item.href} className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-100 transition font-medium text-sm">
                  {item.icon}
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function Sidebar() {
  return (
    <>  
    <div className="block sm:hidden">
      <SidebarMobile />
    </div>
    <div className="hidden sm:block">
      <SidebarDesktop />
    </div></>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check for authentication token on component mount
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('Authorization');
      if (!token) {
        router.push('/auth');
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      <main className="p-2 sm:pl-64  pt-16  min-h-screen">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
