"use client";

import { useEffect, useRef, useState } from "react";
import PostModal from "./PostModal";

export default function PostButton({
  userId,
  onSubmit,
}: {
  userId?: string;
  onSubmit?: (data: unknown) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // ヒント用タイマーIDを保持（連打されてもタイマーが増えないように）
  const hintTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    const handler2 = () => setOpen(true);
    const hintHideHandler = () => setShowHint(false);

    window.addEventListener("post-location-selected", handler as EventListener);
    window.addEventListener("open-post-modal", handler2 as EventListener);
    window.addEventListener("post-hint-hide", hintHideHandler as EventListener);

    return () => {
      window.removeEventListener("post-location-selected", handler as EventListener);
      window.removeEventListener("open-post-modal", handler2 as EventListener);
      window.removeEventListener("post-hint-hide", hintHideHandler as EventListener);

      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    // 地図に「投稿モード開始」を通知
    window.dispatchEvent(new CustomEvent("post-mode-enable"));

    // ヒント表示
    setShowHint(true);

    // 既存タイマーがあれば消してから再セット
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = window.setTimeout(() => {
      setShowHint(false);
      hintTimeoutRef.current = null;
    }, 6000);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setShowHint(false); // モーダルが閉じられたらヒントも消す

    // 念のためタイマーも消す
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
  };

  return (
    <>
      <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-2">
        {/* 常時表示ラベル */}
        <div className="px-3 py-2 rounded shadow text-xs md:text-sm bg-gray-100 text-gray-700">
          新規投稿
        </div>

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

      <PostModal open={open} onClose={handleCloseModal} onSubmit={onSubmit} userId={userId} />
    </>
  );
}
