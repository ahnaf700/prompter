import React, { useState } from 'react';
import { Pencil, Check, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { ANATOMY_SECTIONS } from '../data/presets';
import type { AnatomyKey, PromptAnatomy } from '../types/prompt';
import { SunburstEmblem } from './SunburstEmblem';

interface AnatomyInspectorProps {
  anatomy: PromptAnatomy | null;
  isLoading: boolean;
  refiningKey: AnatomyKey | null;
  refineFeedback: { key: AnatomyKey; note: string } | null;
  onUpdateSection: (key: AnatomyKey, value: string) => void;
  /** Resolves true only when the section was actually updated. */
  onRefineSection: (key: AnatomyKey, instruction: string) => Promise<boolean>;
  onLoadBlueprint: () => void;
}

const QUICK_REFINEMENTS: { label: string; instruction: string }[] = [
  { label: 'Lebih spesifik', instruction: 'Buat lebih spesifik dan operasional dengan detail konkret.' },
  { label: 'Tambahkan metrik', instruction: 'Sertakan angka, batasan, atau indikator keberhasilan yang terukur.' },
  { label: 'Lebih ringkas', instruction: 'Padatkan kalimatnya agar lebih tajam tanpa mengurangi kejelasan.' },
];

export const AnatomyInspector: React.FC<AnatomyInspectorProps> = ({
  anatomy,
  isLoading,
  refiningKey,
  refineFeedback,
  onUpdateSection,
  onRefineSection,
  onLoadBlueprint,
}) => {
  const [editingKey, setEditingKey] = useState<AnatomyKey | null>(null);
  const [activeRefinePanel, setActiveRefinePanel] = useState<AnatomyKey | null>(null);
  const [refineInput, setRefineInput] = useState('');

  const handleTriggerRefine = async (key: AnatomyKey, customInstruction?: string) => {
    const instr = (customInstruction ?? refineInput).trim();
    if (instr.length < 3 || refiningKey) return; // Enter key bypasses the disabled button
    const ok = await onRefineSection(key, instr);
    // On failure keep the panel and the typed instruction so the user can retry without retyping.
    if (!ok) return;
    setRefineInput('');
    setActiveRefinePanel(null);
  };

  return (
    <section aria-labelledby="anatomy-heading">
      {/* Quiet Section Kicker Above Diagram (mirrors ReferenceView) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs text-[#9A9CA5]">
          <span id="anatomy-heading" className="font-medium text-[#D2D4DC]">
            2. Anatomi Master Prompt
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {isLoading
              ? 'Menyusun 6 blok struktur...'
              : anatomy
              ? 'Klik Edit atau Pertajam pada blok mana saja'
              : 'Pratinjau struktur 6 blok'}
          </span>
        </div>

        {!anatomy && !isLoading && (
          <button
            type="button"
            onClick={onLoadBlueprint}
            className="text-xs font-medium text-[#E06D3B] hover:text-[#F28E62] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tampilkan contoh blueprint diagram
          </button>
        )}
      </div>

      {/* Code-Rendered Interactive Diagram Sheet (identical visual language to ReferenceView) */}
      <figure
        aria-label="Diagram interaktif Anatomi Master Prompt 6 blok"
        className="rounded-xl bg-[#16171B] border border-[#262830] overflow-hidden"
      >
        {/* Diagram Header with Geometric Vector Emblem */}
        <figcaption className="px-6 py-5 border-b border-[#23252C] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <SunburstEmblem size={28} />
            <span className="font-display text-xl sm:text-2xl font-semibold text-[#F5F4F0] tracking-tight truncate">
              The Anatomy of Your Prompt
            </span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[#7D808B] whitespace-nowrap shrink-0">
            6 Blok
          </span>
        </figcaption>

        {/* Loading State */}
        {isLoading && (
          <div className="divide-y divide-[#22242B]">
            {ANATOMY_SECTIONS.map((sec) => (
              <div key={sec.key} className="grid grid-cols-1 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8 px-6 py-4 space-y-2">
                  <div className="h-3.5 w-3/4 bg-[#20232B] rounded animate-pulse" />
                  <div className="h-3.5 w-full bg-[#20232B] rounded animate-pulse" />
                  <div className="h-3.5 w-2/3 bg-[#20232B] rounded animate-pulse" />
                </div>
                <div className="sm:col-span-4 px-6 pb-4 sm:py-4 flex items-center gap-3">
                  <svg
                    width="3"
                    height="34"
                    viewBox="0 0 3 34"
                    aria-hidden="true"
                    className={`shrink-0 ${sec.colorClass}`}
                  >
                    <line
                      x1="1.5"
                      y1="1"
                      x2="1.5"
                      y2="33"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <span className={`block text-sm font-semibold ${sec.colorClass}`}>
                      {sec.label}
                    </span>
                    <span className="block text-[11px] font-mono tabular-nums text-[#7D808B]">
                      Blok {sec.index}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Pattern Preview State */}
        {!isLoading && !anatomy && (
          <div className="divide-y divide-[#22242B]">
            {ANATOMY_SECTIONS.map((sec) => (
              <div key={sec.key} className="grid grid-cols-1 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8 px-6 py-4">
                  <p className="text-[13px] leading-[1.62] text-[#7D808B]">
                    {sec.patternHint}
                  </p>
                </div>
                <div className="sm:col-span-4 px-6 pb-4 sm:py-4 flex items-center gap-3">
                  <svg
                    width="3"
                    height="34"
                    viewBox="0 0 3 34"
                    aria-hidden="true"
                    className={`shrink-0 ${sec.colorClass}`}
                  >
                    <line
                      x1="1.5"
                      y1="1"
                      x2="1.5"
                      y2="33"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="min-w-0">
                    <span className={`block text-sm font-semibold ${sec.colorClass}`}>
                      {sec.label}
                    </span>
                    <span className="block text-[11px] font-mono tabular-nums text-[#7D808B]">
                      Blok {sec.index}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Populated Interactive Diagram Rows */}
        {!isLoading && anatomy && (
          <div className="divide-y divide-[#22242B]">
            {ANATOMY_SECTIONS.map((sec) => {
              const value = anatomy[sec.key] ?? '';
              const isEditing = editingKey === sec.key;
              const isRefiningThis = refiningKey === sec.key;
              const isRefinePanelOpen = activeRefinePanel === sec.key;
              const hasFeedback = refineFeedback?.key === sec.key;
              const isFocusedRow = isEditing || isRefinePanelOpen;

              return (
                <div
                  key={sec.key}
                  className={`grid grid-cols-1 sm:grid-cols-12 items-start transition-colors duration-150 ${
                    isFocusedRow ? 'bg-[#1D2028]' : 'hover:bg-[#1A1C22]'
                  }`}
                >
                  {/* Left: Prompt Block Prose */}
                  <div className="sm:col-span-8 px-6 py-4">
                    {isEditing ? (
                      <div>
                        <textarea
                          rows={Math.max(3, Math.min(9, value.split('\n').length + 1))}
                          value={value}
                          onChange={(e) => onUpdateSection(sec.key, e.target.value)}
                          aria-label={`Edit bagian ${sec.label}`}
                          className="w-full rounded-lg bg-[#111214] border border-[#E06D3B]/70 px-3.5 py-2.5 text-[13.5px] leading-[1.65] text-[#F5F4F0] focus:outline-none focus:border-[#E06D3B] resize-y"
                        />
                        <div className="mt-2.5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingKey(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#F5F4F0] text-[#111214] hover:bg-[#E5E3DC] transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Selesai Edit</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13.5px] leading-[1.66] text-[#E4E3DD] whitespace-pre-wrap">
                        {value}
                      </p>
                    )}

                    {hasFeedback && !isRefiningThis && (
                      <p className="mt-2 text-xs text-[#2DD4BF]">
                        Pembaruan AI: {refineFeedback.note}
                      </p>
                    )}

                    {/* Inline AI Section Refine Drawer */}
                    {isRefinePanelOpen && (
                      <div className="mt-3.5 pt-3.5 border-t border-[#262830]">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-medium text-[#A3A6B0]">
                            Arahan penyempurnaan untuk {sec.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveRefinePanel(null)}
                            aria-label="Tutup panel pertajam"
                            className="text-[#7D808B] hover:text-[#F5F4F0] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2.5">
                          {QUICK_REFINEMENTS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              disabled={isRefiningThis}
                              onClick={() => handleTriggerRefine(sec.key, preset.instruction)}
                              className="px-2.5 py-1 text-xs rounded-md bg-[#111214] border border-[#2C2F38] text-[#C4C6CE] hover:text-[#F5F4F0] hover:border-[#454956] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={refineInput}
                            maxLength={500}
                            aria-label={`Arahan penyempurnaan untuk ${sec.label}`}
                            onChange={(e) => setRefineInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleTriggerRefine(sec.key);
                              }
                            }}
                            placeholder={`Contoh: Sesuaikan ${sec.label} untuk konteks tim solo...`}
                            className="flex-1 rounded-lg bg-[#111214] border border-[#2C2F38] px-3 py-1.5 text-xs text-[#F5F4F0] placeholder:text-[#5F626D] focus:outline-none focus:border-[#E06D3B]"
                          />
                          <button
                            type="button"
                            disabled={isRefiningThis || refineInput.trim().length < 3}
                            onClick={() => handleTriggerRefine(sec.key)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#E06D3B] hover:bg-[#EA7A49] disabled:bg-[#2A2D36] disabled:text-[#6E717C] text-[#111214] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {isRefiningThis ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Terapkan'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Diagram Label Stem + Compact Row Actions */}
                  <div className="sm:col-span-4 px-6 pb-4 sm:py-4 flex flex-col justify-center gap-2.5">
                    <div className="flex items-center gap-3">
                      <svg
                        width="3"
                        height="34"
                        viewBox="0 0 3 34"
                        aria-hidden="true"
                        className={`shrink-0 ${sec.colorClass}`}
                      >
                        <line
                          x1="1.5"
                          y1="1"
                          x2="1.5"
                          y2="33"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="min-w-0">
                        <span className={`block text-sm font-semibold ${sec.colorClass}`}>
                          {sec.label}
                        </span>
                        <span className="block text-[11px] font-mono tabular-nums text-[#7D808B]">
                          Blok {sec.index}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pl-[15px] text-[11.5px]">
                      <button
                        type="button"
                        onClick={() => setEditingKey(isEditing ? null : sec.key)}
                        className="inline-flex items-center gap-1 font-medium text-[#8C8F99] hover:text-[#F5F4F0] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>{isEditing ? 'Selesai' : 'Edit'}</span>
                      </button>

                      <span aria-hidden="true" className="text-[#343742]">·</span>

                      <button
                        type="button"
                        disabled={isRefiningThis}
                        onClick={() =>
                          setActiveRefinePanel(isRefinePanelOpen ? null : sec.key)
                        }
                        className="inline-flex items-center gap-1 font-medium text-[#8C8F99] hover:text-[#E06D3B] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isRefiningThis ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <SlidersHorizontal className="w-3 h-3" />
                        )}
                        <span>{isRefiningThis ? 'Proses...' : 'Pertajam'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </figure>
    </section>
  );
};
