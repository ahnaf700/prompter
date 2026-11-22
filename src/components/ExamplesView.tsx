import React from 'react';
import { ArrowRight } from 'lucide-react';
import { STARTER_BRIEFS } from '../data/presets';
import type { PromptBuildConfig } from '../types/prompt';

interface ExamplesViewProps {
  onSelectExample: (brief: string, config: PromptBuildConfig, autoAnalyze: boolean) => void;
}

export const ExamplesView: React.FC<ExamplesViewProps> = ({ onSelectExample }) => {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#262830]">
        <h1 className="font-display text-3xl font-semibold text-[#F5F4F0] tracking-tight">
          Contoh Kasus Prompt Singkat
        </h1>
        <p className="text-sm text-[#9A9CA5] mt-2 max-w-2xl leading-relaxed">
          Pilih salah satu skenario di bawah untuk melihat bagaimana ide singkat 1–2 kalimat langsung dianalisis AI menjadi master prompt 6 blok yang siap dieksekusi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {STARTER_BRIEFS.map((item, idx) => (
          <article
            key={item.id}
            className="bg-[#18191D] border border-[#262830] rounded-xl p-6 flex flex-col justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-[#9A9CA5]">
                <span className="tabular-nums font-mono text-[#E06D3B]">0{idx + 1}</span>
                <span aria-hidden="true">·</span>
                <span>{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>Gaya {item.recommendedConfig.targetStyle}</span>
              </div>

              <h2 className="font-display text-xl font-semibold text-[#F5F4F0] mt-2">
                {item.label}
              </h2>

              <p className="text-sm text-[#C4C6CE] leading-relaxed mt-3 bg-[#111214] border border-[#242730] rounded-lg p-3.5">
                “{item.brief}”
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#23252C]">
              <button
                type="button"
                onClick={() => onSelectExample(item.brief, item.recommendedConfig, false)}
                className="text-xs font-medium text-[#A3A6B0] hover:text-[#F5F4F0] transition-colors cursor-pointer"
              >
                Muat ke editor
              </button>

              <button
                type="button"
                onClick={() => onSelectExample(item.brief, item.recommendedConfig, true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F4F0] hover:bg-[#E5E3DC] text-[#111214] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Analisis Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
