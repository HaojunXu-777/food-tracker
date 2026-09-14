"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "@/lib/image/compress";
import {
  deletePhoto,
  getPhotosByMealId,
  savePhoto,
} from "@/lib/photoStore";

type PhotoEditorProps = {
  mealKey: string;
  onChange?: (ids: string[]) => void;
};

export function PhotoEditor({ mealKey, onChange }: PhotoEditorProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<{ id: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    const photos = await getPhotosByMealId(mealKey);
    const next = photos.map((photo) => ({
      id: photo.id,
      url: URL.createObjectURL(photo.blob),
    }));
    setItems((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return next;
    });
    onChange?.(next.map((item) => item.id));
  }

  useEffect(() => {
    void reload();
    return () => {
      setItems((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealKey]);

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    setError("");
    try {
      for (const file of Array.from(fileList)) {
        const compressed = await compressImage(file);
        await savePhoto(mealKey, compressed);
      }
      await reload();
    } catch {
      setError("图片处理失败，请换一张再试");
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (albumRef.current) albumRef.current.value = "";
    }
  }

  async function remove(id: string) {
    await deletePhoto(id);
    await reload();
  }

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">已选择 {items.length} 张照片</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="relative overflow-hidden rounded-xl border border-[var(--line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={`照片 ${index + 1}`} className="h-32 w-full object-cover" />
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2 text-white"
              onClick={() => void remove(item.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {busy ? <p className="mt-3 text-sm text-[var(--muted)]">正在压缩图片…</p> : null}

      <button
        type="button"
        className="mt-4 w-full py-2 text-sm"
        onClick={() => albumRef.current?.click()}
      >
        ＋ 添加更多照片
      </button>
      <button
        type="button"
        className="mt-2 w-full rounded-xl border border-[var(--line)] py-3"
        onClick={() => cameraRef.current?.click()}
      >
        拍摄照片
      </button>
      <button
        type="button"
        className="mt-2 w-full rounded-xl border border-[var(--line)] py-3"
        onClick={() => albumRef.current?.click()}
      >
        从相册选择
      </button>
    </div>
  );
}
