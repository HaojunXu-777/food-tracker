"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PhotoEditor } from "@/components/diet/PhotoEditor";
import { AI_FEATURES_ENABLED } from "@/lib/ai/features";
import { blobToDataUrl } from "@/lib/image/compress";
import { isMealType, mealTypeLabel } from "@/lib/meals";
import { getPhotosByMealId } from "@/lib/photoStore";

export default function PhotoRecordPage() {
  const params = useParams<{ mealType: string }>();
  const mealType = params.mealType;
  const router = useRouter();
  const [draftId] = useState(() => crypto.randomUUID());
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const mealKey = `draft:${draftId}`;
  const countRef = useRef(0);

  if (!isMealType(mealType)) {
    notFound();
  }

  async function analyze() {
    if (!AI_FEATURES_ENABLED) {
      setError("AI 识别暂未启用。请改为手动添加");
      return;
    }
    setError("");
    const photos = await getPhotosByMealId(mealKey);
    if (photos.length === 0) {
      setError("请先拍摄或选择照片");
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("当前无网络，AI 识别需要联网。可改为手动添加");
      return;
    }
    setAnalyzing(true);
    try {
      const images = await Promise.all(photos.map((photo) => blobToDataUrl(photo.blob)));
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = (await response.json()) as {
        foods?: { nameZh: string }[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "AI 识别失败，可以改为手动添加");
        return;
      }
      const foods = data.foods ?? [];
      sessionStorage.setItem(`ai-foods:${draftId}`, JSON.stringify(foods));
      router.push(`/diet/${mealType}/confirm?draft=${draftId}`);
    } catch {
      setError(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "当前无网络，AI 识别需要联网。可改为手动添加"
          : "AI 识别失败，可以改为手动添加",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="ft-page px-2 pb-6">
      <PageHeader title={`${mealTypeLabel(mealType)}照片`} backHref={`/diet/${mealType}`} />
      <div className="px-3 pt-2 pb-8">
        <div className="ft-card p-4">
          <PhotoEditor mealKey={mealKey} onChange={(ids) => { countRef.current = ids.length; }} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        {!AI_FEATURES_ENABLED ? (
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-[1rem] bg-[var(--input-bg)] py-3.5 font-medium text-[var(--muted)]"
          >
            AI 识别（暂未启用）
          </button>
        ) : (
          <button
            type="button"
            disabled={analyzing}
            className="ft-btn-primary mt-4"
            onClick={() => void analyze()}
          >
            {analyzing ? "AI 分析中…" : "开始 AI 识别"}
          </button>
        )}
        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          可拍照保存，再用手动添加填写食物与营养
        </p>
        <Link
          href={`/diet/${mealType}/manual`}
          className="mt-2 block w-full py-3 text-center text-sm font-semibold text-[var(--accent-violet)]"
        >
          改为手动添加
        </Link>
      </div>
    </div>
  );
}
