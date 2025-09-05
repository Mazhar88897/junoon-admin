"use client";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function ChapterContentLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Information */}
        <div className="max-w-sm p-4 rounded-2xl shadow-md bg-white border border-gray-200 mb-6">
          <p className="text-sm font-medium">
            <span className="font-medium text-gray-700">Track:</span>{" "}
            {typeof window !== 'undefined' ? sessionStorage.getItem("track_name") : ''}
          </p>
          <p className="text-sm mt-2 font-medium">
            <span className="font-medium text-gray-700">Subject:</span>{" "}
            {typeof window !== 'undefined' ? sessionStorage.getItem("subject_name") : ''}
          </p>
          <p className="text-sm mt-2 font-medium">
            <span className="font-medium text-gray-700">Chapter:</span>{" "}
            {typeof window !== 'undefined' ? sessionStorage.getItem("chapter_name") : ''}
          </p>
        </div>
        
        {/* Children Content */}
        {children}
      </div>
    </div>
  );
}