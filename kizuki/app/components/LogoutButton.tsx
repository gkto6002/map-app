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
      className="ml-4 inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
    >
      ログアウト
    </button>
  );
}
