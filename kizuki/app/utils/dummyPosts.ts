// app/utils/dummyPosts.ts

export type DummyPost = {
  id: number;
  title: string;
  body: string;
  lng: number;
  lat: number;
  createdAt: string;
  imageUrl?: string; // ★ 画像URL（任意）
};

export const dummyPosts: DummyPost[] = [
  {
    id: 1,
    title: "スクランブル交差点",
    body: "人の流れを見ているだけで面白い。",
    lng: 139.7004,
    lat: 35.6595,
    createdAt: "2025-11-13T10:00:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "センター街の路地",
    body: "一本中に入ると意外と静か。",
    lng: 139.6993,
    lat: 35.659,
    createdAt: "2025-11-13T10:30:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "渋谷駅ハチ公前",
    body: "待ち合わせスポットとして定番。",
    lng: 139.701,
    lat: 35.6598,
    createdAt: "2025-11-13T11:00:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "MIYASHITA PARK 屋上",
    body: "芝生でのんびりできる場所。",
    lng: 139.699,
    lat: 35.662,
    createdAt: "2025-11-13T11:30:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80",
  },
];
