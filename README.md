# map-app
# 📘 Database Design



---

## Users（認証は Supabase Auth を使用）

### profiles table  
ユーザープロフィール（表示用）。パスワードは保持しない。


---
## Posts（投稿データ）

投稿はタイトル・本文・位置情報を持つ。
### posts table

| カラム名 | 型 | 制約 | 説明 |
|---------|----|------|------|
| id | uuid | PK / default gen_random_uuid() | 投稿ID |
| user_id | uuid | FK → auth.users(id) / nullable | 投稿者（匿名のため API には返さない） |
| title | text | not null | タイトル（空文字可） |
| body | text | not null | 本文（空文字可） |
| loc | geography(Point,4326) | not null | 投稿位置（緯度・経度） |
| created_at | timestamptz | default now() | 作成日時 |
| updated_at | timestamptz | nullable | 更新日時 |

## post_images table

画像は Supabase Storage に保存し、DB には参照情報のみを保持します。  
複数画像対応のため **1画像 = 1レコード** となる正規化構造です。

| カラム名     | 型        | 制約                                         | 説明                                              |
|--------------|-----------|-----------------------------------------------|---------------------------------------------------|
| id           | uuid      | PK / default gen_random_uuid()               | 画像ID                                           |
| post_id      | uuid      | not null / FK → posts.id / on delete cascade | 紐づく投稿                                       |
| path         | text      | not null                                     | Storage の画像パス（例: `<user_id>/<uuid>.webp`）|
| mime         | text      | not null                                     | MIMEタイプ（image/webp, image/jpeg など）        |
| width        | int       | not null                                     | 画像幅                                           |
| height       | int       | not null                                     | 画像高さ                                         |
| size_bytes   | bigint    | not null                                     | ファイルサイズ（bytes）                          |
| sort_order   | int       | default 0                                    | 並び順（0 がメイン画像）                         |
| created_at   | timestamptz | default now()                              | 作成日時                                         |


