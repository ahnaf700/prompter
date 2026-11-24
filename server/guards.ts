import type { PromptAnalysisResult, PromptAnatomy } from '../src/types/prompt.ts';

const SECTION_KEYS = ['role', 'task', 'context', 'reasoning', 'stopConditions', 'output'] as const;
const MAX_SECTION_CHARS = 8000;

/** Trim, cap, and drop `"""` so user text cannot close the quote fence used in our prompts. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replaceAll('"""', '"').trim().slice(0, max);
}

export function sanitizeAnatomy(value: unknown): PromptAnatomy | null {
  if (!value || typeof value !== 'object') return null;
  const src = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of SECTION_KEYS) {
    if (typeof src[key] !== 'string') return null;
    out[key] = (src[key] as string).slice(0, MAX_SECTION_CHARS);
  }
  return out as unknown as PromptAnatomy;
}

/** The model's JSON is untrusted: the client calls .map() on assumptions and renders every field. */
export function parseAnalysis(raw: unknown): PromptAnalysisResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown>;
  const anatomy = sanitizeAnatomy(src.anatomy);
  if (!anatomy) return null;
  const title = typeof src.title === 'string' ? src.title.trim() : '';
  const detectedDomain = typeof src.detectedDomain === 'string' ? src.detectedDomain.trim() : '';
  const userIntentSummary = typeof src.userIntentSummary === 'string' ? src.userIntentSummary.trim() : '';
  if (!title || !detectedDomain || !userIntentSummary) return null;
  const inferredAssumptions = Array.isArray(src.inferredAssumptions)
    ? src.inferredAssumptions.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
  return { title, detectedDomain, userIntentSummary, inferredAssumptions, anatomy };
}

export function parseRefinement(raw: unknown): { updatedText: string; changeNote: string } | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown>;
  const updatedText = typeof src.updatedText === 'string' ? src.updatedText.trim() : '';
  if (!updatedText) return null;
  return { updatedText, changeNote: typeof src.changeNote === 'string' ? src.changeNote.trim() : '' };
}

/** Errors we throw ourselves carry a user-safe message; mark them so they are passed through. */
export class UserFacingError extends Error {}

export function classifyGeminiError(error: unknown): { status: number; message: string } {
  if (error instanceof UserFacingError) return { status: 502, message: error.message };

  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();
  const code = typeof (error as { status?: unknown })?.status === 'number' ? (error as { status: number }).status : 0;

  if (code === 401 || lower.includes('gemini_api_key') || lower.includes('api_key_invalid') || lower.includes('api key')) {
    return {
      status: 401,
      message: 'Kunci API Gemini tidak valid atau belum terpasang. Periksa konfigurasi di Settings > Secrets.',
    };
  }
  if (code === 403 || lower.includes('permission_denied')) {
    return {
      status: 403,
      message: 'Akses ke model Gemini ditolak. Pastikan kunci API Anda aktif di Settings > Secrets.',
    };
  }
  if (code === 429 || lower.includes('resource_exhausted')) {
    return {
      status: 429,
      message: 'Kuota permintaan API sedang penuh. Tunggu beberapa saat lalu coba analisis ulang.',
    };
  }
  if (code === 404 || lower.includes('not_found')) {
    return { status: 404, message: 'Model Gemini yang diminta tidak ditemukan atau belum tersedia.' };
  }
  // Raw upstream text can contain hosts/paths; the caller logs it, the client gets a generic line.
  return { status: 500, message: 'Terjadi kesalahan saat memproses analisis prompt. Silakan coba lagi.' };
}

/** Fixed-window limiter. shortcut: in-memory per process, swap for a shared store if you run >1 instance. */
export function createRateLimiter(max: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string): boolean => {
    const t = now();
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}
