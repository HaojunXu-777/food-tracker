"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { IconCamera, IconSearch } from "@/components/ui/Icons";
import { isMealType, mealTypeLabel } from "@/lib/meals";

export default function RecordMethodPage() {
  const params = useParams<{ mealType: string }>();
  const mealType = params.mealType;

  if (!isMealType(mealType)) {
    notFound();
  }

  return (
    <div className="ft-page px-2 pb-6">
      <PageHeader title={mealTypeLabel(mealType)} backHref="/diet" />
      <div className="px-3 pt-4">
        <p className="mb-4 text-sm text-[var(--muted)]">选择记录方式</p>
        <div className="space-y-3">
          <Link
            href={`/diet/${mealType}/photo`}
            className="ft-card flex items-center gap-4 px-4 py-5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(139,124,246,0.14)] text-[var(--accent-violet)]">
              <IconCamera className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">拍照识别</div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                现场拍照或从相册选择，图片本地保存
              </p>
            </div>
          </Link>
          <Link
            href={`/diet/${mealType}/manual`}
            className="ft-card flex items-center gap-4 px-4 py-5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(46,196,182,0.14)] text-[var(--accent-cyan)]">
              <IconSearch className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">手动添加</div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                搜索 USDA 营养库，或自行填写
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
