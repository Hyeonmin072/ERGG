"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { UserGame } from "@/lib/types";
import type { CharacterCatalogMap } from "@/lib/characterDisplay";
import { buildGameDetailSections } from "@/lib/gameDetailSections";
import { getEquipmentGradeBackground } from "@/lib/equipmentGradeStyle";

const BORDER = "rgba(255,255,255,0.10)";
const SUBTLE = "var(--text-secondary)";
const ACCENT = "rgba(255,255,255,0.92)";

interface GameDetailModalProps {
  game: UserGame | null;
  onClose: () => void;
  /** characterNum → Supabase character 테이블 표시명 */
  catalog?: CharacterCatalogMap | null;
}

export default function GameDetailModal({ game, onClose, catalog }: GameDetailModalProps) {
  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, onClose]);

  if (!game) return null;

  const sections = buildGameDetailSections(game, catalog);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="닫기"
      />
      <div
        className="relative w-full max-w-3xl max-h-[min(88vh,900px)] flex flex-col rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(20,29,53,0.96) 0%, rgba(15,22,41,0.98) 100%)",
          border: `1px solid ${BORDER}`,
        }}
      >
        <header
          className="flex items-center justify-between gap-3 px-4 py-3 shrink-0 border-b"
          style={{ borderColor: BORDER }}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
              게임 상세
            </h2>
            <p className="text-[11px] font-mono truncate mt-0.5" style={{ color: SUBTLE }}>
              gameId {game.gameId} · {game.startDtm || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: ACCENT }}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          {sections.map((section) => (
            <section key={section.title}>
              <h3
                className="text-[11px] font-mono uppercase tracking-wider mb-2"
                style={{ color: SUBTLE }}
              >
                {section.title}
              </h3>
              <div
                className="rounded-lg border overflow-hidden"
                style={{
                  borderColor: BORDER,
                  background: "rgba(10,18,26,0.45)",
                }}
              >
                <dl className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {section.rows.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-2 gap-y-1 px-3 py-2 text-xs"
                    >
                      <dt
                        className="font-mono text-[11px] break-all"
                        style={{ color: SUBTLE }}
                        title={row.key}
                      >
                        {row.label}
                      </dt>
                      <dd
                        className="text-[11px] break-all whitespace-pre-wrap font-mono tabular-nums"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {row.equipmentItems?.length ? (
                          <div className="grid grid-cols-1 gap-3">
                            {row.equipmentItems.map((item) => (
                              <div
                                key={`${item.slot}-${item.itemCode}`}
                                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
                                style={{ background: "rgba(255,255,255,0.04)" }}
                              >
                                <div
                                  className="relative w-[4.25rem] h-12 rounded overflow-hidden shrink-0 border border-white/28 p-[2px] shadow-[0_2px_10px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.4)]"
                                  style={{
                                    background: getEquipmentGradeBackground(item.equipmentGradeNum),
                                  }}
                                >
                                  {item.imagePath ? (
                                    <img
                                      src={encodeURI(item.imagePath)}
                                      alt={item.name}
                                      className="h-full w-full rounded-[3px] object-cover object-center"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center rounded-[3px] text-[10px]">
                                      ?
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] leading-tight font-semibold">
                                    {item.slotLabel} · {item.name}
                                  </div>
                                  <div style={{ color: SUBTLE }} className="text-[10px]">
                                    #{item.itemCode} · {item.armorType} · {item.itemGrade}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
