"use client";

export default function SeedButton() {
  const seed = async () => {
    const res = await fetch("/api/seed-spots", { method: "POST" });
    const json = await res.json();
    console.log(json);
    alert("ダミーデータを投入しました");
  };

  return (
    <button onClick={seed} className="p-2 border rounded">
      ダミーデータ投入
    </button>
  );
}
