import type { PromptAnalysisResult, PromptAnatomy } from "./src/types/prompt.ts";

export const LIMITS = {
  brief: 4000,
  extraContext: 2000,
  instruction: 500,
  anatomySection: 8000,
} as const;

const SECTION_KEYS = ["role", "task", "context", "reasoning", "stopConditions", "output"] as const;

/** Error yang pesannya aman ditampilkan langsung ke pengguna. */
export class UserFacingError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

const HTTP_MESSAGES: Record<number, string> = {
  401: "Kunci API Gemini tidak valid atau belum terpasang. Periksa konfigurasi di Settings > Secrets.",
  403: "Akses ke model Gemini ditolak. Pastikan kunci API Anda aktif di Settings > Secrets.",
  404: "Model Gemini yang diminta tidak ditemukan atau belum tersedia.",
  429: "Kuota permintaan API sedang penuh. Tunggu beberapa saat lalu coba analisis ulang.",
};

export function formatGeminiError(error: unknown): { status: number; message: string } {
  if (error instanceof UserFacingError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof SyntaxError) {
    return { status: 502, message: "Model mengembalikan format yang tidak valid. Silakan coba lagi." };
  }

  const raw = error instanceof Error ? error.message : String(error);
  const upper = raw.toUpperCase();
  const sdkStatus = (error as { status?: unknown } | null)?.status;

  // Status numerik dari SDK lebih tepercaya daripada mencocokkan angka di dalam teks pesan.
  if (typeof sdkStatus === "number" && HTTP_MESSAGES[sdkStatus]) {
    return { status: sdkStatus, message: HTTP_MESSAGES[sdkStatus] };
  }
  if (upper.includes("GEMINI_API_KEY") || upper.includes("API_KEY_INVALID") || upper.includes("API KEY")) {
    return { status: 401, message: HTTP_MESSAGES[401] };
  }
  if (upper.includes("PERMISSION_DENIED")) return { status: 403, message: HTTP_MESSAGES[403] };
  if (upper.includes("RESOURCE_EXHAUSTED")) return { status: 429, message: HTTP_MESSAGES[429] };
  if (upper.includes("NOT_FOUND")) return { status: 404, message: HTTP_MESSAGES[404] };

  // Pesan mentah bisa memuat detail internal; cukup dicatat di log server.
  console.error("Gemini request failed:", raw);
  return { status: 500, message: "Terjadi kesalahan saat memproses permintaan. Silakan coba lagi." };
}

const isString = (v: unknown): v is string => typeof v === "string";

/** Membaca anatomi dari body request; null jika bukan objek berisi string yang wajar. */
export function readAnatomy(value: unknown): PromptAnatomy | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const out = {} as PromptAnatomy;
  for (const key of SECTION_KEYS) {
    const v = source[key] ?? "";
    if (!isString(v) || v.length > LIMITS.anatomySection) return null;
    out[key] = v;
  }
  return out;
}

/** Memastikan keluaran model sesuai skema yang dipakai klien, agar UI tidak crash. */
export function normalizeAnalysis(value: unknown): PromptAnalysisResult | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isString(v.title) || !isString(v.detectedDomain) || !isString(v.userIntentSummary)) return null;
  if (!Array.isArray(v.inferredAssumptions)) return null;

  const anatomy = v.anatomy && typeof v.anatomy === "object" ? (v.anatomy as Record<string, unknown>) : null;
  if (!anatomy || !SECTION_KEYS.every((key) => isString(anatomy[key]))) return null;

  return {
    title: v.title,
    detectedDomain: v.detectedDomain,
    userIntentSummary: v.userIntentSummary,
    inferredAssumptions: v.inferredAssumptions.filter(isString),
    anatomy: readAnatomy(anatomy) as PromptAnatomy,
  };
}

/** Pembatas laju sederhana di memori (per kunci, mis. IP). Mengembalikan true jika diizinkan. */
// shortcut: state di memori satu proses, ganti ke store bersama (mis. Redis) bila server di-scale ke banyak instans.
export function createRateLimiter(opts: { max: number; windowMs: number; now?: () => number }) {
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();

  return (key: string): boolean => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((ts) => t - ts < opts.windowMs);
    if (recent.length >= opts.max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(t);
    hits.set(key, recent);

    // Cegah Map tumbuh tanpa batas oleh banyak klien unik.
    if (hits.size > 10_000) {
      for (const [k, stamps] of hits) {
        if (stamps.every((ts) => t - ts >= opts.windowMs)) hits.delete(k);
      }
    }
    return true;
  };
}
