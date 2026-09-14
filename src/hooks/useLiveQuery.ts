"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

export function useLiveQuery<T>(
  querier: () => Promise<T> | T,
  deps: unknown[],
  initial: T,
): T {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: (nextValue) => setValue(nextValue),
      error: (error) => console.error(error),
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
