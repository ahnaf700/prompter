import { ANATOMY_SECTIONS } from '../data/presets';
import type { ExportFormat, PromptAnatomy } from '../types/prompt';

export function compileMasterPrompt(anatomy: PromptAnatomy, format: ExportFormat): string {
  const ordered = ANATOMY_SECTIONS.map((section) => ({
    section,
    value: (anatomy[section.key] ?? '').trim(),
  })).filter((entry) => entry.value.length > 0);

  if (ordered.length === 0) {
    return '';
  }

  if (format === 'plain') {
    return ordered.map((entry) => entry.value).join('\n\n');
  }

  if (format === 'markdown') {
    return ordered
      .map((entry) => `## ${entry.section.label}\n${entry.value}`)
      .join('\n\n');
  }

  // XML tags format (ideal for Claude & structured LLM prompts)
  return ordered
    .map((entry) => `<${entry.section.xmlTag}>\n${entry.value}\n</${entry.section.xmlTag}>`)
    .join('\n\n');
}

export type PromptComplexityLevel = 'kosong' | 'ringkas' | 'seimbang' | 'mendalam' | 'padat';

export interface PromptStats {
  words: number;
  characters: number;
  lines: number;
  estimatedTokens: number;
  complexityLevel: PromptComplexityLevel;
  complexityLabel: string;
  complexityDescription: string;
}

export function getPromptStats(text: string): PromptStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      lines: 0,
      estimatedTokens: 0,
      complexityLevel: 'kosong',
      complexityLabel: 'Kosong',
      complexityDescription: 'Belum ada teks prompt.',
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = trimmed.length;
  const lines = trimmed.split(/\r?\n/).length;

  // Gabungan pendekatan karakter (~3.8 char/token untuk campuran ID/EN/tag) dan kata (~1.38 token/kata)
  const charEstimate = characters / 3.8;
  const wordEstimate = words * 1.38 + Math.max(0, lines - 1) * 0.4;
  const estimatedTokens = Math.max(1, Math.round((charEstimate + wordEstimate) / 2));

  let complexityLevel: PromptComplexityLevel;
  let complexityLabel: string;
  let complexityDescription: string;

  if (estimatedTokens <= 180) {
    complexityLevel = 'ringkas';
    complexityLabel = 'Ringkas';
    complexityDescription = 'Hemat konteks dan cepat diproses untuk tugas terfokus.';
  } else if (estimatedTokens <= 420) {
    complexityLevel = 'seimbang';
    complexityLabel = 'Seimbang';
    complexityDescription = 'Ukuran ideal untuk struktur 6 blok yang presisi tanpa bertele-tele.';
  } else if (estimatedTokens <= 800) {
    complexityLevel = 'mendalam';
    complexityLabel = 'Mendalam';
    complexityDescription = 'Kaya konteks, batasan, dan kriteria berhenti yang ketat.';
  } else {
    complexityLevel = 'padat';
    complexityLabel = 'Padat';
    complexityDescription = 'Sangat komprehensif; pastikan setiap baris memang esensial.';
  }

  return {
    words,
    characters,
    lines,
    estimatedTokens,
    complexityLevel,
    complexityLabel,
    complexityDescription,
  };
}
