import React, { useMemo, useState } from 'react';
import { Trash2, ArrowUpRight, Search } from 'lucide-react';
import type { SavedPromptItem } from '../types/prompt';

interface HistoryViewProps {
  items: SavedPromptItem[];
  onLoadItem: (item: SavedPromptItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onGoToStudio: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onLoadItem,
  onDeleteItem,
  onClearAll,
  onGoToStudio,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.result.title.toLowerCase().includes(q) ||
        item.result.detectedDomain.toLowerCase().includes(q) ||
        item.briefPrompt.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#262830]">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#F5F4F0] tracking-tight">
            Riwayat Master Prompt
          </h1>
          <p className="text-sm text-[#9A9CA5] mt-2">
            Semua master prompt yang pernah Anda hasilkan tersimpan secara lokal di browser ini.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-[#9A9CA5] hover:text-[#F43F5E] transition-colors cursor-pointer"
          >
            Hapus semua riwayat
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-[#18191D] border border-[#262830] rounded-xl p-10 text-center">
          <h2 className="font-display text-xl font-semibold text-[#F5F4F0]">
            Belum ada riwayat tersimpan
          </h2>
          <p className="text-sm text-[#9A9CA5] mt-2 max-w-md mx-auto">
            Begitu Anda menganalisis prompt singkat di Studio, hasilnya otomatis tercatat di sini agar bisa dibuka kembali kapan saja.
          </p>
          <button
            type="button"
            onClick={onGoToStudio}
            className="mt-5 px-4 py-2 rounded-lg bg-[#E06D3B] hover:bg-[#EA7A49] text-[#111214] text-xs font-semibold transition-colors cursor-pointer"
          >
            Buat Master Prompt Pertama
          </button>
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#7D808B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, domain, atau isi prompt singkat..."
              className="w-full rounded-lg bg-[#18191D] border border-[#262830] pl-10 pr-4 py-2 text-sm text-[#F5F4F0] placeholder:text-[#6E717C] focus:outline-none focus:border-[#E06D3B]"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#18191D] border border-[#262830] rounded-xl p-8 text-center text-sm text-[#9A9CA5]">
              Tidak ditemukan riwayat yang cocok dengan kata kunci “{query}”.
            </div>
          ) : (
            <div className="bg-[#18191D] border border-[#262830] rounded-xl divide-y divide-[#262830]">
              {filtered.map((item) => {
                const formattedDate = new Date(item.createdAt).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8F99]">
                        <span className="text-[#E06D3B] font-medium">
                          {item.result.detectedDomain}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formattedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.config.outputLanguage === 'en' ? 'English' : 'Indonesia'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.config.tone ?? 'profesional'}</span>
                      </div>

                      <h2 className="font-display text-lg font-semibold text-[#F5F4F0] mt-1 truncate">
                        {item.result.title}
                      </h2>

                      <p className="text-sm text-[#A3A6B0] mt-1 line-clamp-2">
                        {item.briefPrompt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        aria-label={`Hapus ${item.result.title}`}
                        className="p-2 rounded-lg border border-[#262830] text-[#8C8F99] hover:text-[#F43F5E] hover:border-[#F43F5E]/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onLoadItem(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F4F0] hover:bg-[#E5E3DC] text-[#111214] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Buka di Studio</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
