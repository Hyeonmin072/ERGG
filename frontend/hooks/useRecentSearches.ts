"use client";
import { useState, useEffect, useCallback } from "react";

export interface RecentSearchEntry {
  nickname: string;
  tier?: string;
  rankPoint?: number;
}

const STORAGE_KEY = "ergg_recent_searches";
const MAX_ENTRIES = 5;

function readStorage(): RecentSearchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentSearchEntry[];
  } catch {
    return [];
  }
}

function writeStorage(entries: RecentSearchEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage 쓰기 실패 무시 (private mode 등)
  }
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearchEntry[]>([]);

  useEffect(() => {
    setSearches(readStorage());
  }, []);

  const addSearch = useCallback((nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const filtered = prev.filter(
        (e) => e.nickname.toLowerCase() !== trimmed.toLowerCase()
      );
      const next = [{ nickname: trimmed }, ...filtered].slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeSearch = useCallback((nickname: string) => {
    setSearches((prev) => {
      const next = prev.filter(
        (e) => e.nickname.toLowerCase() !== nickname.toLowerCase()
      );
      writeStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    writeStorage([]);
    setSearches([]);
  }, []);

  const updateTierInfo = useCallback(
    (nickname: string, tier: string, rankPoint: number) => {
      setSearches((prev) => {
        const next = prev.map((e) =>
          e.nickname.toLowerCase() === nickname.toLowerCase()
            ? { ...e, tier, rankPoint }
            : e
        );
        writeStorage(next);
        return next;
      });
    },
    []
  );

  return { searches, addSearch, removeSearch, clearAll, updateTierInfo };
}
