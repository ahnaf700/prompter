import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ANATOMY_SECTIONS, BLUEPRINT_REFERENCE_RESULT } from '../data/presets';
import type { AnatomyKey } from '../types/prompt';
import { SunburstEmblem } from './SunburstEmblem';

interface ReferenceViewProps {
  onLoadBlueprintToStudio: () => void;
}

export const ReferenceView: React.FC<ReferenceViewProps> = ({
  onLoadBlueprintToStudio,
}) => {
  const [activeKey, setActiveKey] = useState<AnatomyKey | null>(null);
  const blueprintAnatomy = BLUEPRINT_REFERENCE_RESULT.result.anatomy;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#262830]">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#F5F4F0] tracking-tight">
            Referensi Struktur Anatomi Prompt
          </h1>
          <p className="text-sm text-[#9A9CA5] mt-2 max-w-2xl leading-relaxed">
            Setiap master prompt yang dihasilkan aplikasi ini mengikuti enam pilar berurutan pada diagram struktur di bawah. Klik bagian mana saja pada diagram untuk menyorot panduan penyusunannya.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadBlueprintToStudio}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E06D3B] hover:bg-[#EA7A49] text-[#111214] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Buka Contoh Diagram di Studio</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Code-Rendered Interactive Anatomy Diagram */}
        <div className="lg:col-span-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-[#9A9CA5]">
              Diagram Rujukan Utama
            </span>
            {activeKey && (
              <button
                type="button"
                onClick={() => setActiveKey(null)}
                className="text-xs text-[#8C8F99] hover:text-[#F5F4F0] transition-colors cursor-pointer"
              >
                Reset sorotan
              </button>
            )}
          </div>

          <figure
            aria-label="Diagram interaktif The Anatomy of a Prompt dengan 6 blok berurutan"
            className="rounded-xl bg-[#16171B] border border-[#262830] overflow-hidden"
          >
            {/* Diagram Header with Geometric Vector Emblem */}
            <figcaption className="px-6 py-5 border-b border-[#23252C] flex items-center gap-3.5">
              <SunburstEmblem size={28} />
              <span className="font-display text-xl sm:text-2xl font-semibold text-[#F5F4F0] tracking-tight">
                The Anatomy of a Prompt
              </span>
            </figcaption>

            {/* 6 Structural Rows Rendered in Code */}
            <div className="divide-y divide-[#22242B]">
              {ANATOMY_SECTIONS.map((sec) => {
                const isSelected = activeKey === sec.key;
                const sampleText = blueprintAnatomy[sec.key];

                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => setActiveKey(isSelected ? null : sec.key)}
                    aria-pressed={isSelected}
                    className={`w-full text-left grid grid-cols-1 sm:grid-cols-12 items-center transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#E06D3B] ${
                      isSelected ? 'bg-[#1D2028]' : 'hover:bg-[#1A1C22]'
                    }`}
                  >
                    {/* Left: Prompt Block Prose */}
                    <div className="sm:col-span-8 px-6 py-4">
                      <p className="text-[13px] leading-[1.62] text-[#E4E3DD] whitespace-pre-wrap font-normal">
                        {sampleText}
                      </p>
                    </div>

                    {/* Right: Structural Block Label */}
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
                  </button>
                );
              })}
            </div>
          </figure>
        </div>

        {/* 6 Pillars Breakdown */}
        <div className="lg:col-span-6 bg-[#18191D] border border-[#262830] rounded-xl divide-y divide-[#262830] overflow-hidden lg:mt-7">
          {ANATOMY_SECTIONS.map((sec) => {
            const isSelected = activeKey === sec.key;

            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveKey(isSelected ? null : sec.key)}
                aria-pressed={isSelected}
                className={`w-full text-left p-5 sm:p-6 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#E06D3B] ${
                  isSelected ? 'bg-[#20232B]' : 'hover:bg-[#1B1D23]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-xs shrink-0 ${sec.dotColor}`}
                      aria-hidden="true"
                    />
                    <h2 className={`text-base font-semibold ${sec.colorClass}`}>
                      {sec.index}. {sec.label}
                    </h2>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-medium text-[#E06D3B]">
                      Disorot
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#E6E5DF] mt-2 leading-relaxed">
                  {sec.summary}
                </p>
                <p className="text-xs text-[#9A9CA5] mt-2 leading-relaxed">
                  Panduan penyusunan: {sec.guidance}
                </p>
                <div className="mt-3 rounded-lg bg-[#111214] border border-[#262830] px-3.5 py-2.5 font-mono text-xs text-[#B8BAC2] leading-relaxed">
                  {sec.patternHint}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
