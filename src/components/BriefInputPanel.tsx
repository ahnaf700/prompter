import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { STARTER_BRIEFS } from '../data/presets';
import type {
  DetailLevel,
  OutputLanguage,
  PromptAnalysisResult,
  PromptBuildConfig,
  PromptTone,
  TargetStyle,
} from '../types/prompt';

interface BriefInputPanelProps {
  briefPrompt: string;
  onChangeBrief: (val: string) => void;
  extraContext: string;
  onChangeExtraContext: (val: string) => void;
  config: PromptBuildConfig;
  onChangeConfig: (next: PromptBuildConfig) => void;
  onAnalyze: () => void;
  onLoadStarter: (brief: string, recommendedConfig: PromptBuildConfig) => void;
  onLoadBlueprint: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  analysisResult: PromptAnalysisResult | null;
}

export const BriefInputPanel: React.FC<BriefInputPanelProps> = ({
  briefPrompt,
  onChangeBrief,
  extraContext,
  onChangeExtraContext,
  config,
  onChangeConfig,
  onAnalyze,
  onLoadStarter,
  onLoadBlueprint,
  isLoading,
  errorMessage,
  analysisResult,
}) => {
  const [showExtraContext, setShowExtraContext] = useState(false);

  useEffect(() => {
    if (extraContext.trim().length > 0) {
      setShowExtraContext(true);
    }
  }, [extraContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && briefPrompt.trim().length >= 5) {
        onAnalyze();
      }
    }
  };

  return (
    <section
      aria-labelledby="brief-heading"
      className="bg-[#18191D] border border-[#262830] rounded-xl p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-5">
        <div>
          <h2 id="brief-heading" className="font-display text-xl font-semibold text-[#F5F4F0]">
            1. Prompt Singkat Anda
          </h2>
          <p className="text-sm text-[#9A9CA5] mt-1">
            Tulis kebutuhan Anda secara singkat. AI akan memecah dan menyusunnya ke dalam 6 blok anatomi master prompt.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadBlueprint}
          className="text-xs font-medium text-[#9A9CA5] hover:text-[#F5F4F0] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Muat contoh persis diagram
        </button>
      </div>

      {/* Main Brief Input */}
      <div>
        <label htmlFor="brief-textarea" className="sr-only">
          Prompt singkat
        </label>
        <textarea
          id="brief-textarea"
          rows={4}
          maxLength={4000}
          value={briefPrompt}
          onChange={(e) => onChangeBrief(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Contoh: Buatkan strategi peluncuran aplikasi task manager AI untuk founder selama 90 hari dengan tim 2 orang dan budget terbatas..."
          className="w-full rounded-lg bg-[#111214] border border-[#2C2F38] px-4 py-3.5 text-[15px] leading-relaxed text-[#F5F4F0] placeholder:text-[#5F626D] focus:outline-none focus:border-[#E06D3B] transition-colors resize-y min-h-[116px]"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-[#7D808B]">
          <span>Tekan Ctrl/Cmd + Enter untuk langsung menganalisis</span>
          <span className="tabular-nums">{briefPrompt.length} / 4000 karakter</span>
        </div>
      </div>

      {/* Optional Extra Context Disclosure */}
      <div className="mt-4 pt-4 border-t border-[#23252C]">
        <button
          type="button"
          onClick={() => setShowExtraContext((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A3A6B0] hover:text-[#F5F4F0] transition-colors cursor-pointer"
        >
          {showExtraContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>Tambah fakta/batasan spesifik (opsional)</span>
        </button>

        {showExtraContext && (
          <div className="mt-3">
            <textarea
              rows={2}
              maxLength={2000}
              aria-label="Fakta atau batasan tambahan"
              value={extraContext}
              onChange={(e) => onChangeExtraContext(e.target.value)}
              placeholder="Misal: Target audiens UMKM kuliner, deadline 2 minggu, format akhir harus siap presentasi ke investor..."
              className="w-full rounded-lg bg-[#111214] border border-[#2C2F38] px-3.5 py-2.5 text-sm text-[#F5F4F0] placeholder:text-[#5F626D] focus:outline-none focus:border-[#E06D3B] transition-colors resize-y"
            />
          </div>
        )}
      </div>

      {/* Configuration Controls */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div>
          <span className="block text-xs font-medium text-[#9A9CA5] mb-1.5">
            Bahasa Master Prompt
          </span>
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#111214] border border-[#262830] rounded-lg">
            {(
              [
                { id: 'id', label: 'Indonesia' },
                { id: 'en', label: 'English' },
              ] as { id: OutputLanguage; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeConfig({ ...config, outputLanguage: opt.id })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.outputLanguage === opt.id
                    ? 'bg-[#262932] text-[#F5F4F0]'
                    : 'text-[#8C8F99] hover:text-[#F5F4F0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-[#9A9CA5] mb-1.5">
            Tingkat Kedalaman
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#111214] border border-[#262830] rounded-lg">
            {(
              [
                { id: 'ringkas', label: 'Ringkas' },
                { id: 'standar', label: 'Standar' },
                { id: 'mendalam', label: 'Detail' },
              ] as { id: DetailLevel; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeConfig({ ...config, detailLevel: opt.id })}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.detailLevel === opt.id
                    ? 'bg-[#262932] text-[#F5F4F0]'
                    : 'text-[#8C8F99] hover:text-[#F5F4F0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-[#9A9CA5] mb-1.5">
            Tone / Mood
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#111214] border border-[#262830] rounded-lg">
            {(
              [
                { id: 'profesional', label: 'Profesional' },
                { id: 'kasual', label: 'Kasual' },
                { id: 'persuasif', label: 'Persuasif' },
              ] as { id: PromptTone; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeConfig({ ...config, tone: opt.id })}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.tone === opt.id
                    ? 'bg-[#262932] text-[#F5F4F0]'
                    : 'text-[#8C8F99] hover:text-[#F5F4F0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="target-style-select" className="block text-xs font-medium text-[#9A9CA5] mb-1.5">
            Optimasi Gaya
          </label>
          <select
            id="target-style-select"
            value={config.targetStyle}
            onChange={(e) =>
              onChangeConfig({ ...config, targetStyle: e.target.value as TargetStyle })
            }
            className="w-full h-[38px] px-3 rounded-lg bg-[#111214] border border-[#262830] text-xs font-medium text-[#F5F4F0] focus:outline-none focus:border-[#E06D3B] cursor-pointer"
          >
            <option value="general">Umum (Semua Model AI)</option>
            <option value="claude">Gaya Claude (Direktif & Tegas)</option>
            <option value="gemini">Gaya Gemini (Terstruktur)</option>
            <option value="coding">Rekayasa Kode & Teknis</option>
          </select>
        </div>
      </div>

      {/* Starter Chips & Submit CTA */}
      <div className="mt-5 pt-5 border-t border-[#23252C] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <span className="text-[#7D808B] shrink-0">Coba cepat:</span>
          {STARTER_BRIEFS.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <span aria-hidden="true" className="text-[#3C404B]">·</span>}
              <button
                type="button"
                onClick={() => onLoadStarter(item.brief, item.recommendedConfig)}
                className="text-[#B8BAC2] hover:text-[#E06D3B] underline-offset-4 hover:underline transition-colors text-left cursor-pointer"
              >
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || briefPrompt.trim().length < 5}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#E06D3B] hover:bg-[#EA7A49] disabled:bg-[#2A2D36] disabled:text-[#6E717C] text-[#111214] font-semibold text-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F4F0]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menganalisis Struktur...</span>
            </>
          ) : (
            <>
              <span>Analisis & Bangun Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#F43F5E]/40 bg-[#F43F5E]/10 px-4 py-3 text-sm text-[#FDA4AF]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#F43F5E]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Analysis Summary Banner (Only shown when analysisResult exists) */}
      {analysisResult && !isLoading && (
        <div className="mt-5 pt-5 border-t border-[#23252C] grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 text-xs text-[#9A9CA5]">
              <span>Hasil Analisis</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#E06D3B] font-medium">{analysisResult.detectedDomain}</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-[#F5F4F0] mt-1">
              {analysisResult.title}
            </h3>
            <p className="text-sm text-[#C4C6CE] leading-relaxed mt-1.5">
              {analysisResult.userIntentSummary}
            </p>
          </div>

          <div className="lg:col-span-6">
            <span className="block text-xs font-medium text-[#9A9CA5] mb-2">
              Asumsi & Detail yang Dilengkapi AI (dapat Anda edit di bawah)
            </span>
            <ul className="space-y-1.5 text-xs text-[#C4C6CE] leading-relaxed">
              {analysisResult.inferredAssumptions.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#E06D3B] font-mono tabular-nums shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
