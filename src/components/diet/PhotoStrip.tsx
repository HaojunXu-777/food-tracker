"use client";

import { useEffect, useState } from "react";
import { getPhoto } from "@/lib/photoStore";

type PhotoStripProps = {
  photoIds: string[];
};

export function PhotoStrip({ photoIds }: PhotoStripProps) {
  const [urls, setUrls] = useState<{ id: string; url: string }[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    Promise.all(
      photoIds.map(async (id) => {
        const photo = await getPhoto(id);
        if (!photo) return null;
        const url = URL.createObjectURL(photo.blob);
        created.push(url);
        return { id, url };
      }),
    ).then((items) => {
      if (cancelled) {
        created.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setUrls(items.filter((item): item is { id: string; url: string } => item != null));
    });
    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoIds]);

  if (photoIds.length === 0) return null;

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {urls.map((item) => (
          <button
            key={item.id}
            type="button"
            className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--line)]"
            onClick={() => setActive(item.url)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {active ? (
        <button
          type="button"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      ) : null}
    </>
  );
}
