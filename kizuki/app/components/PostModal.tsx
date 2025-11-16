"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type PostData = {
  title: string;
  body: string;
  lat?: number;
  lng?: number;
  image?: File | null;
};

export default function PostModal({
  open,
  onClose,
  onSubmit,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: PostData) => void;
  userId?: string;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ★ 追加: 投稿成功ポップアップ
  const [showSuccess, setShowSuccess] = useState(false);

  // ★ 追加: 投稿中フラグ
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
  }, [open]);

  useEffect(() => {
    if (!imageFile) {
      const t = setTimeout(() => setPreviewUrl(null), 0);
      return () => clearTimeout(t);
    }
    const url = URL.createObjectURL(imageFile);
    const t = setTimeout(() => setPreviewUrl(url), 0);
    return () => {
      clearTimeout(t);
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ lat: number; lng: number }>).detail;
      if (detail && typeof detail.lat === "number" && typeof detail.lng === "number") {
        setLat(detail.lat);
        setLng(detail.lng);
      }
    };
    window.addEventListener("post-location-selected", handler as EventListener);
    return () => window.removeEventListener("post-location-selected", handler as EventListener);
  }, []);

  if (!open) return null;

  const handleFile = (f?: FileList | null) => {
    if (!f || f.length === 0) return setImageFile(null);
    setImageFile(f[0]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error("camera start failed", err);
    }
  };

  const stopCamera = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {}
    }
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: blob.type });
        setImageFile(file);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopCamera();
        resolve();
      }, "image/jpeg", 0.92);
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!title || !body) {
      alert("タイトルと本文は必須です");
      return;
    }
    if (typeof lat !== "number" || typeof lng !== "number") {
      alert("地図で位置を選択してください");
      return;
    }

    setSubmitting(true); // ★投稿中に設定

    const data: PostData = {
      title,
      body,
      lat,
      lng,
      image: imageFile,
    };

    (async () => {
      try {
        const form = new FormData();
        form.append("title", String(data.title));
        form.append("body", String(data.body ?? ""));
        form.append("latitude", String(data.lat));
        form.append("longitude", String(data.lng));

        if (data.image) {
          form.append("image", data.image, (data.image as File).name);
          form.append("width", "0");
          form.append("height", "0");
        } else {
          form.append("width", "0");
          form.append("height", "0");
        }

        if (userId) form.append("user_id", userId);

        const res = await fetch("/api/spots", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("post /api/spots failed", err);
          alert("投稿に失敗しました");
          return;
        }

        try {
          window.dispatchEvent(new CustomEvent("spots-updated"));
        } catch {}

        if (onSubmit) onSubmit(data);

        // ★ 成功ポップアップを表示する
        setShowSuccess(true);

        // 入力値をリセット
        setTitle("");
        setBody("");
        setImageFile(null);
        setPreviewUrl(null);
        setLat(undefined);
        setLng(undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";

      } catch (err) {
        console.error("post submit error", err);
        alert("投稿に失敗しました");
      } finally {
        setSubmitting(false); // ★投稿中解除
      }
    })();
  };

  const handleCloseAll = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleCloseAll}
        aria-hidden
      />

      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-white rounded-lg shadow-lg w-[min(680px,92vw)] max-h-[90vh] overflow-auto p-4 text-black dark:text-black"
      >
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-lg font-medium text-black">新しい投稿</h2>
          <button
            type="button"
            onClick={handleCloseAll}
            className="text-black/70 hover:text-black"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white text-black placeholder:text-gray-400"
              placeholder="タイトルを入力"
              required
            />
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">本文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border rounded px-3 py-2 h-28 bg-white text-black placeholder:text-gray-400"
              placeholder="メッセージを入力"
              required
            />
          </div>

          {/* 画像 */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">画像（任意）</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-gray-100 rounded text-black"
              >
                画像を選択
              </button>

              {imageFile || previewUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    stopCamera();
                    setImageFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded"
                >
                  画像を削除
                </button>
              ) : null}
            </div>

            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl}
                  alt="preview"
                  width={192}
                  height={128}
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* 位置情報 */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">位置情報</label>
            <div className="text-sm text-black">
              <div>緯度: {lat ?? "未選択"}</div>
              <div>経度: {lng ?? "未選択"}</div>
              {lat == null || lng == null ? (
                <div className="text-xs text-gray-600 mt-1">
                  地図上で投稿したい場所をタップして、位置を選択してください。
                </div>
              ) : null}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseAll}
              className="px-4 py-2 rounded bg-white border text-black"
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded text-white ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600"
              }`}
            >
              {submitting ? "投稿中..." : "投稿する"}
            </button>
          </div>
        </div>

        {/* ★ 成功ポップアップ */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="rounded-lg bg-white px-5 py-4 shadow-lg w-[min(360px,80vw)]">
              <p className="mb-4 text-sm text-gray-800">投稿が完了しました。</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-1 rounded border text-sm text-gray-800 hover:bg-gray-100"
                  onClick={handleCloseAll}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
