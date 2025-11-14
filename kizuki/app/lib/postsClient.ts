// lib/postsClient.ts
import type { ApiPost, NewPostRequestBody } from "@/app/types/posts";

/**
 * 投稿を新規作成
 */
export async function createPostApi(
  payload: NewPostRequestBody
): Promise<ApiPost> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "投稿に失敗しました";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
}

/**
 * 全投稿取得（初期ロード用）
 */
export async function fetchAllPosts(): Promise<ApiPost[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) {
    throw new Error("投稿の取得に失敗しました");
  }
  return res.json();
}
