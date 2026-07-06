"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type BrowseUrlStateOptions<T> = {
  defaults: T;
  parse: (params: URLSearchParams) => Partial<T>;
  serialize: (state: T) => Record<string, string | undefined>;
};

function shallowEqualRecord(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function useBrowseUrlState<T extends Record<string, unknown>>({
  defaults,
  parse,
  serialize,
}: BrowseUrlStateOptions<T>): [T, (patch: Partial<T>) => void, () => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const skipNextUrlWrite = useRef(false);
  const pendingUrlWrite = useRef(false);

  const [state, setState] = useState<T>(() => ({
    ...defaults,
    ...parse(searchParams),
  }));

  useEffect(() => {
    if (skipNextUrlWrite.current) {
      skipNextUrlWrite.current = false;
      return;
    }
    const next = {
      ...defaults,
      ...parse(searchParams),
    } as T;
    setState((prev) => (shallowEqualRecord(prev, next) ? prev : next));
  }, [searchParams, defaults, parse]);

  const writeUrl = useCallback(
    (next: T) => {
      const params = new URLSearchParams();
      const serialized = serialize(next);
      for (const [key, value] of Object.entries(serialized)) {
        const defaultValue = defaults[key as keyof T];
        if (value != null && value !== "" && value !== String(defaultValue)) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      skipNextUrlWrite.current = true;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, defaults, serialize]
  );

  const updateState = useCallback(
    (patch: Partial<T>) => {
      pendingUrlWrite.current = true;
      setState((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const resetState = useCallback(() => {
    pendingUrlWrite.current = true;
    setState(defaults);
  }, [defaults]);

  useEffect(() => {
    if (!pendingUrlWrite.current) return;
    pendingUrlWrite.current = false;
    writeUrl(state);
  }, [state, writeUrl]);

  return [state, updateState, resetState];
}
