"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { isMealType, mealTypeLabel } from "@/lib/meals";

export default function RecordMethodPage() {
  const params = useParams<{ mealType: string }>();
  const mealType = params.mealType;

  if (!isMealType(mealType)) {
    notFound();
  }

  return (
    <div className="px-2">
      <PageHeader title={mealTypeLabel(mealType)} backHref="/diet" />
      <div className="px-2 pt-8">
        <p className="mb-4">选择记录方式</p>
        <div className="space-y-3">
          <Link
            href={`/diet/${mealType}/photo`}
            className="block rounded-xl border border-[var(--line)] px-4 py-8 text-center"
          >
            <div className="text-2xl" aria-hidden>
              📷
            </div>
            <div className="mt-3 font-medium">拍照识别</div>
            <p className="mt-2 text-sm text-[var(--muted)]">现场拍照或从相册选择</p>
          </Link>
          <Link
            href={`/diet/${mealType}/manual`}
            className="block rounded-xl border border-[var(--line)] px-4 py-8 text-center"
          >
            <div className="text-2xl" aria-hidden>
              🔍
            </div>
            <div className="mt-3 font-medium">手动添加</div>
            <p className="mt-2 text-sm text-[var(--muted)]">搜索并添加食物</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
