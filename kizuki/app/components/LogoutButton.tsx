"use client";

import React from "react";
import { supabaseBrowser } from "@/app/lib/supabaseBrowser";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await supabaseBrowser.auth.signOut();
      // redirect to top page after sign out
      window.location.assign("/");
    } catch (err) {
      console.error("Logout error", err);
      window.location.assign("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      aria-label="ログアウト"
      className="ml-2 flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full sm:rounded-md shadow-md transition-colors"
    >
      {/* Icon (logout) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
        aria-hidden
      >
        <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* label: hidden on very small screens to keep the button compact */}
      <span className="hidden sm:inline text-sm font-medium">ログアウト</span>
    </button>
  );
}
