import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import type { ExportFormat, PromptAnatomy } from '../types/prompt';
import { compileMasterPrompt, getPromptStats } from '../utils/compiler';

interface CompiledPreviewProps {
  title: string;
  anatomy: PromptAnatomy | null;
  format: ExportFormat;
  onChangeFormat: (fmt: ExportFormat) => void;
}

export const CompiledPreview: React.FC<CompiledPreviewProps> = ({
  title,
  anatomy,
  format,
  onChangeFormat,
}) => {
  const [copied, setCopied] = useState(false);

  const compiledText = anatomy ? compileMasterPrompt(anatomy, format) : '';
  const stats = getPromptStats(compiledText);

  const complexityAccentClass =
    stats.complexityLevel === 'ringkas'
      ? 'text-[#2DD4BF]'
      : stats.complexityLevel === 'seimbang'
      ? 'text-[#60A5FA]'
      : stats.complexityLevel === 'mendalam'
      ? 'text-[#FB923C]'
      : stats.complexityLevel === 'padat'
      ? 'text-[#F43F5E]'
      : 'text-[#8C8F99]';

  const complexityBarColorClass =
    stats.complexityLevel === 'ringkas'
      ? 'bg-[#2DD4BF]'
      : stats.complexityLevel === 'seimbang'
      ? 'bg-[#60A5FA]'
      : stats.complexityLevel === 'mendalam'
      ? 'bg-[#FB923C]'
      : 'bg-[#F43F5E]';

  const tokenBarPercent = Math.min(100, Math.round((stats.estimatedTokens / 1000) * 100));

  const handleCopy = async () => {
    if (!compiledText) return;
    try {
      await navigator.clipboard.writeText(compiledText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard permissions
      const textarea = document.createElement('textarea');
      textarea.value = compiledText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const triggerFileDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSafeSlug = () =>
    (title || 'master-prompt')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'master-prompt';

  const handleDownloadText = () => {
    if (!anatomy || !compiledText) return;
    const textContent =
      format === 'markdown' ? compileMasterPrompt(anatomy, 'plain') : compiledText;
    triggerFileDownload(textContent, `${getSafeSlug()}.txt`, 'text/plain;charset=utf-8');
  };

  const handleDownloadMarkdown = () => {
    if (!anatomy) return;
    const markdownBody = compileMasterPrompt(anatomy, 'markdown');
    if (!markdownBody) return;
    const heading = title && title !== 'master-prompt' ? `# ${title}\n\n` : '';
    const formattedMarkdown = `${heading}${markdownBody}\n`;
    triggerFileDownload(
      formattedMarkdown,
      `${getSafeSlug()}.md`,
      'text/markdown;charset=utf-8'
    );
  };

  return (
    <aside
      aria-labelledby="compiled-heading"
      className="bg-[#18191D] border border-[#262830] rounded-xl overflow-hidden flex flex-col lg:sticky lg:top-22"
    >
      <div className="px-5 py-4 border-b border-[#262830] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="compiled-heading" className="font-display text-lg font-semibold text-[#F5F4F0]">
            3. Master Prompt Siap Pakai
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8F99] mt-0.5 tabular-nums">
            <span>~{stats.estimatedTokens.toLocaleString('id-ID')} token</span>
            <span aria-hidden="true">·</span>
            <span>{stats.words} kata</span>
            <span aria-hidden="true">·</span>
            <span>{stats.characters} karakter</span>
            <span aria-hidden="true">·</span>
            <span>{stats.lines} baris</span>
          </div>
        </div>

        {/* Format Segmented Control */}
        <div
          role="group"
          aria-label="Format ekspor prompt"
          className="flex items-center gap-1 p-1 bg-[#111214] border border-[#262830] rounded-lg"
        >
          {(
            [
              { id: 'plain', label: 'Teks Alami' },
              { id: 'markdown', label: 'Markdown' },
              { id: 'xml', label: 'XML Tags' },
            ] as { id: ExportFormat; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeFormat(opt.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                format === opt.id
                  ? 'bg-[#262932] text-[#F5F4F0]'
                  : 'text-[#8C8F99] hover:text-[#F5F4F0]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token & Complexity Indicator Strip */}
      {compiledText && (
        <div className="px-5 py-3 border-b border-[#23252C] bg-[#15161A]/60">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#9A9CA5]">Kompleksitas:</span>
              <span className={`font-semibold ${complexityAccentClass}`}>
                {stats.complexityLabel}
              </span>
            </div>
            <span className="font-mono tabular-nums text-[#D2D4DC]">
              ~{stats.estimatedTokens.toLocaleString('id-ID')} est. token
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Estimasi kepadatan token prompt"
            aria-valuenow={stats.estimatedTokens}
            aria-valuemin={0}
            aria-valuemax={1000}
            className="mt-2 h-1.5 w-full rounded-full bg-[#242730] overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-200 ${complexityBarColorClass}`}
              style={{ width: `${Math.max(4, tokenBarPercent)}%` }}
            />
          </div>

          <p className="text-[11.5px] text-[#8C8F99] mt-1.5 leading-relaxed">
            {stats.complexityDescription}
          </p>
        </div>
      )}

      {/* Prompt Output Surface */}
      <div className="p-5 flex-1">
        {compiledText ? (
          <pre className="w-full max-h-[540px] overflow-y-auto rounded-lg bg-[#111214] border border-[#262830] p-4 font-mono text-[12.5px] leading-[1.7] text-[#E6E5DF] whitespace-pre-wrap break-words">
            {compiledText}
          </pre>
        ) : (
          <div className="rounded-lg bg-[#111214] border border-[#23252C] p-6 text-center min-h-[280px] flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-[#C4C6CE]">
              Belum ada Master Prompt yang disusun
            </p>
            <p className="text-xs text-[#7D808B] mt-1.5 max-w-[30ch] leading-relaxed">
              Isi prompt singkat di atas lalu klik Analisis & Bangun Prompt untuk melihat hasil kompilasi lengkap di sini.
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-5 py-4 border-t border-[#262830] bg-[#15161A]/60 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadText}
            disabled={!compiledText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2C2F38] bg-[#111214] hover:bg-[#1E2027] disabled:opacity-40 text-xs font-medium text-[#D2D4DC] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .txt</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            disabled={!compiledText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2C2F38] bg-[#111214] hover:bg-[#1E2027] disabled:opacity-40 text-xs font-medium text-[#D2D4DC] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download as .md</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!compiledText}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F4F0] hover:bg-[#E5E3DC] disabled:bg-[#2A2D36] disabled:text-[#6E717C] text-[#111214] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Tersalin ke Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Master Prompt</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
