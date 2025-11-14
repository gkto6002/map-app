"use client";

import { useState } from "react";
import PostModal from "./PostModal";

export default function PostButton({ onSubmit }: { onSubmit?: (data: unknown) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center text-xl"
        aria-label="新規投稿"
      >
        ＋
      </button>

      <PostModal open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} />
    </>
  );
}
