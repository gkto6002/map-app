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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: PostData) => void;
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
  // loadingLocation は UI では使わないので省略

  useEffect(() => {
    if (!open) return;
    // モーダルが開いたら現在地を自動取得する
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => {
          /* noop */
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
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
    } catch {
      // noop
    }
    streamRef.current = null;
    if (videoRef.current) {
        try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {
        // noop
      }
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
        // カメラは撮影後に停止する（必要なら停止せず続ける）
        stopCamera();
        resolve();
      }, "image/jpeg", 0.92);
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const data: PostData = {
      title,
      body,
      lat,
      lng,
      image: imageFile,
    };
    if (onSubmit) onSubmit(data);
    else console.log("Post submit (UI only):", data);
    // UI only: フォームをクリアして閉じる
    setTitle("");
    setBody("");
    setImageFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-lg shadow-lg w-[min(680px,92vw)] max-h-[90vh] overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-lg font-medium">新しい投稿</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="タイトルを入力"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">本文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border rounded px-3 py-2 h-28"
              placeholder="メッセージを入力"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">画像（任意）</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files)}
              />
              <button
                type="button"
                onClick={() => {
                  // スマホではこの input に capture 属性を付けても良いが、
                  // getUserMedia ベースの撮影 UI を提供する
                  startCamera();
                }}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                カメラで撮る
              </button>
            </div>

            {cameraActive && (
              <div className="mt-2">
                <div className="relative w-full max-w-md bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-auto"
                    playsInline
                    muted
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => capturePhoto()}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    撮影
                  </button>
                  <button
                    type="button"
                    onClick={() => stopCamera()}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    カメラを閉じる
                  </button>
                </div>
              </div>
            )}

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

          <div>
            <label className="block text-sm font-medium mb-1">位置情報</label>
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div>緯度: {lat ?? "取得中..."}</div>
                <div>経度: {lng ?? "取得中..."}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-100 rounded"
                  onClick={() => {
                    navigator.geolocation?.getCurrentPosition(
                      (pos) => {
                        setLat(pos.coords.latitude);
                        setLng(pos.coords.longitude);
                      },
                      () => {
                        /* noop */
                      },
                      { enableHighAccuracy: true }
                    );
                  }}
                >
                  現在地を再取得
                </button>
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-100 rounded"
                  onClick={() => {
                    setLat(undefined);
                    setLng(undefined);
                  }}
                >
                  位置を消去
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white border"
            >
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
              投稿する
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
