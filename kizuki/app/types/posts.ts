// types/posts.ts
import type { Post, PostImage } from "@prisma/client";

/**
 * DB そのものの型（Prisma が生成したもの）
 */
export type DbPost = Post;
export type DbPostImage = PostImage;

/**
 * API 経由で返す Post の型（images を含めた形）
 */
export type ApiPost = DbPost & {
  images: DbPostImage[];
};

/**
 * クライアントから /api/posts に投げる画像メタ情報
 * （Supabase Storage にアップロード済み前提）
 */
export type NewPostImage = {
  path: string;
  mime: string;
  width: number;
  height: number;
  sizeBytes: number;
  sortOrder?: number;
};

/**
 * クライアントから /api/posts に POST するリクエストボディ
 */
export type NewPostRequestBody = {
  title: string;
  body: string;
  latitude: number;
  longitude: number;
  images?: NewPostImage[];
};
