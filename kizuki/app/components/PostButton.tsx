"use client";

import { useEffect, useState } from "react";
import PostModal from "./PostModal";

export default function PostButton({ onSubmit }: { onSubmit?: (data: unknown) => void }) {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    const handler2 = () => setOpen(true);
    window.addEventListener("post-location-selected", handler as EventListener);
    window.addEventListener("open-post-modal", handler2 as EventListener);
    return () => {
      window.removeEventListener("post-location-selected", handler as EventListener);
      window.removeEventListener("open-post-modal", handler2 as EventListener);
    };
  }, []);

  const handleClick = () => {
    // instruct map to enter post-selection mode
    window.dispatchEvent(new CustomEvent("post-mode-enable"));
    setShowHint(true);
    // hide hint after 6s
    setTimeout(() => setShowHint(false), 6000);
  };

  return (
    <>
      <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-2">
        {showHint && (
          <div className="mb-1 px-3 py-2 bg-yellow-100 text-sm text-gray-800 rounded shadow">
            投稿したい場所を地図上でタップしてください
          </div>
        )}

        <button
          onClick={handleClick}
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl"
          aria-label="新規投稿"
        >
          ＋
        </button>
      </div>

      <PostModal open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} />
    </>
  );
}
