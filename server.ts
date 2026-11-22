import "dotenv/config";
import express, { type Request, type Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di environment server. Silakan atur melalui panel Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (lower.includes("gemini_api_key") || lower.includes("api_key_invalid") || lower.includes("api key")) {
    return {
      status: 401,
      message:
        "Kunci API Gemini tidak valid atau belum terpasang. Periksa konfigurasi di Settings > Secrets.",
    };
  }
  if (lower.includes("permission_denied") || lower.includes("403")) {
    return {
      status: 403,
      message:
        "Akses ke model Gemini ditolak. Pastikan kunci API Anda aktif di Settings > Secrets.",
    };
  }
  if (lower.includes("resource_exhausted") || lower.includes("429")) {
    return {
      status: 429,
      message:
        "Kuota permintaan API sedang penuh. Tunggu beberapa saat lalu coba analisis ulang.",
    };
  }
  if (lower.includes("not_found") || lower.includes("404")) {
    return {
      status: 404,
      message: "Model Gemini yang diminta tidak ditemukan atau belum tersedia.",
    };
  }

  return {
    status: 500,
    message: raw || "Terjadi kesalahan saat memproses analisis prompt.",
  };
}

const VALID_LANGUAGES = new Set(["id", "en"]);
const VALID_DETAILS = new Set(["ringkas", "standar", "mendalam"]);
const VALID_STYLES = new Set(["general", "claude", "gemini", "coding"]);
const VALID_TONES = new Set(["profesional", "kasual", "persuasif"]);
const VALID_SECTION_KEYS = new Set([
  "role",
  "task",
  "context",
  "reasoning",
  "stopConditions",
  "output",
]);

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/analyze-prompt", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const briefPrompt = typeof body.briefPrompt === "string" ? body.briefPrompt.trim() : "";
    const extraContext = typeof body.extraContext === "string" ? body.extraContext.trim() : "";
    const outputLanguage = VALID_LANGUAGES.has(body.outputLanguage) ? body.outputLanguage : "id";
    const detailLevel = VALID_DETAILS.has(body.detailLevel) ? body.detailLevel : "standar";
    const targetStyle = VALID_STYLES.has(body.targetStyle) ? body.targetStyle : "general";
    const tone = VALID_TONES.has(body.tone) ? body.tone : "profesional";

    if (briefPrompt.length < 5) {
      res.status(400).json({
        error: "Masukkan prompt singkat minimal 5 karakter agar AI dapat menganalisis maksud Anda.",
      });
      return;
    }

    if (briefPrompt.length > 4000) {
      res.status(400).json({
        error: "Prompt singkat terlalu panjang (maksimal 4000 karakter).",
      });
      return;
    }

    const ai = getGeminiClient();

    const languageInstruction =
      outputLanguage === "en"
        ? "Write ALL 6 sections of the generated master prompt (`anatomy.*`) in crisp, authoritative, natural English (matching the exact tone and style of the reference diagram). Write `title`, `detectedDomain`, `userIntentSummary`, and `inferredAssumptions` in Indonesian so the user understands the analysis clearly."
        : "Tulis KE-6 bagian master prompt (`anatomy.*`) dalam Bahasa Indonesia yang presisi, otoritatif, dan alami (tetap mempertahankan kejelasan dan struktur ala diagram referensi). Tulis juga `title`, `detectedDomain`, `userIntentSummary`, dan `inferredAssumptions` dalam Bahasa Indonesia.";

    const detailInstruction =
      detailLevel === "ringkas"
        ? "Keep each section tight and punchy (2-3 lines or 2-3 bullet items), maximizing signal per word."
        : detailLevel === "mendalam"
        ? "Make each section thorough and deeply operational (rich constraints, edge cases, multi-point verification, and granular output fields)."
        : "Use balanced, production-ready depth matching the reference anatomy density (2-4 clear sentences for prose blocks, 3-4 sharp bullet items for list blocks).";

    const styleInstruction =
      targetStyle === "claude"
        ? "Optimize phrasing for Claude's instruction-following strengths: crisp directive verbs, explicit reasoning defense, and clean bulleted constraints."
        : targetStyle === "gemini"
        ? "Optimize phrasing for Gemini's structured reasoning: clear objective boundaries, explicit context anchoring, and unambiguous schema formatting."
        : targetStyle === "coding"
        ? "Frame the master prompt with engineering rigor: technical constraints, architecture/code quality tradeoffs, verification checks, and concrete implementation deliverables."
        : "Keep the master prompt universally effective across frontier LLMs (Claude, Gemini, GPT).";

    const toneInstruction =
      tone === "kasual"
        ? "Adopt a conversational, approachable, warm, and pragmatic tone—avoid stiff corporate jargon while keeping the 6-part structure crystal clear."
        : tone === "persuasif"
        ? "Adopt a sharp, persuasive, high-conviction tone—emphasize compelling framing, strong action verbs, audience resonance, and outcome-driven persuasion."
        : "Adopt a crisp, authoritative, executive-grade professional tone—precise terminology, objective clarity, and disciplined structure.";

    const systemInstruction = `You are a Principal Prompt Architect specializing in transforming brief, underspecified user requests into precision-engineered Master Prompts following the exact 6-part "Anatomy of a Prompt" architecture:

1. Role: Define a specific senior practitioner persona with deep domain expertise AND an explicit decision-making priority/tradeoff (e.g., "Act as a senior go-to-market strategist with deep expertise launching early-stage SaaS tools. Prioritize traction speed over brand perfection.").
2. Task: State the concrete core objective, clear scope/timeframe, critical validation step, and explicit end deliverable (e.g., "Build a 90-day launch plan... Validate the core messaging, end with a launch-ready brief.").
3. Context: Ground the prompt in concrete facts. Start with "Here's what I know:" (if English) or "Berikut informasi yang diketahui:" (if Indonesian), followed by 3-5 concise hyphenated bullets ("-Label: value") covering subject/product, actors/team, resources/constraints, and key risks/challenges. If the brief prompt omitted specifics, infer realistic, editable placeholders or well-reasoned defaults and record them in \`inferredAssumptions\`.
4. Reasoning: State the quality goal and the strategic thinking mechanism required (why locking in certain fundamentals upfront and defending each step makes the output actionable and expert-grade).
5. Stop conditions: Define explicit, verifiable completion criteria. Start with "Only stop when:" (if English) or "Berhenti hanya jika:" (if Indonesian), followed by 3-4 hyphenated bullets specifying measurable deliverables, traceability requirements, and a final gate/check.
6. Output: Specify the exact presentation format and structured schema. Start with how to structure the response (e.g., "Present as a weekly sprint plan. For each action:" / "Sajikan sebagai ... Untuk setiap item:"), followed by 3-5 hyphenated field definitions ("-Field: description").

Rules:
- ${languageInstruction}
- ${detailInstruction}
- ${styleInstruction}
- ${toneInstruction}
- NEVER copy the SaaS launch example verbatim unless the user's prompt is actually about a SaaS launch; always tailor every single section deeply to the user's actual brief prompt.
- Ensure the 6 sections flow together seamlessly without redundant repetition across blocks.
- Keep bullet markers formatted cleanly with leading "-" on new lines inside the string fields.`;

    const userMessage = extraContext
      ? `Prompt singkat pengguna:\n"""${briefPrompt}"""\n\nKonteks tambahan dari pengguna:\n"""${extraContext}"""`
      : `Prompt singkat pengguna:\n"""${briefPrompt}"""`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: userMessage,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Judul singkat deskriptif untuk master prompt (maksimal 7 kata).",
            },
            detectedDomain: {
              type: Type.STRING,
              description: "Kategori/domain utama dari prompt pengguna (misal: Strategi Bisnis, Rekayasa Perangkat Lunak, Riset & Penulisan).",
            },
            userIntentSummary: {
              type: Type.STRING,
              description: "Ringkasan 1-2 kalimat mengenai tujuan inti yang ditangkap dari prompt singkat pengguna.",
            },
            inferredAssumptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar 2-4 asumsi atau detail pelengkap yang disisipkan AI karena belum tertulis di prompt singkat, agar pengguna tahu bagian mana yang dapat disesuaikan.",
            },
            anatomy: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING, description: "Blok 1: Role (persona, keahlian, dan prioritas tradeoff)." },
                task: { type: Type.STRING, description: "Blok 2: Task (tujuan utama, ruang lingkup, validasi, dan deliverable akhir)." },
                context: { type: Type.STRING, description: "Blok 3: Context (diawali kalimat pembuka lalu daftar poin fakta/batasan/risiko dengan tanda hubung -)." },
                reasoning: { type: Type.STRING, description: "Blok 4: Reasoning (tujuan kualitas dan pendekatan berpikir/validasi)." },
                stopConditions: { type: Type.STRING, description: "Blok 5: Stop conditions (diawali kalimat pembuka lalu 3-4 syarat selesai terukur dengan tanda hubung -)." },
                output: { type: Type.STRING, description: "Blok 6: Output (format penyajian dan definisi field terstruktur dengan tanda hubung -)." },
              },
              required: ["role", "task", "context", "reasoning", "stopConditions", "output"],
            },
          },
          required: ["title", "detectedDomain", "userIntentSummary", "inferredAssumptions", "anatomy"],
        },
      },
    });

    const rawText = (response.text ?? "").trim();
    if (!rawText) {
      throw new Error("Model mengembalikan respons kosong. Silakan coba lagi.");
    }

    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post("/api/refine-section", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const sectionKey = typeof body.sectionKey === "string" ? body.sectionKey : "";
    const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
    const briefPrompt = typeof body.briefPrompt === "string" ? body.briefPrompt.trim() : "";
    const outputLanguage = VALID_LANGUAGES.has(body.outputLanguage) ? body.outputLanguage : "id";
    const tone = VALID_TONES.has(body.tone) ? body.tone : "profesional";
    const anatomy = body.anatomy && typeof body.anatomy === "object" ? body.anatomy : null;

    if (!VALID_SECTION_KEYS.has(sectionKey)) {
      res.status(400).json({ error: "Bagian anatomi yang dipilih tidak valid." });
      return;
    }
    if (!anatomy) {
      res.status(400).json({ error: "Data anatomi prompt saat ini diperlukan untuk penyempurnaan." });
      return;
    }
    if (instruction.length < 3) {
      res.status(400).json({ error: "Masukkan arahan penyempurnaan minimal 3 karakter." });
      return;
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Prompt singkat awal: ${briefPrompt || "(tidak tersedia)"}

Struktur anatomi prompt saat ini:
- Role: ${anatomy.role ?? ""}
- Task: ${anatomy.task ?? ""}
- Context: ${anatomy.context ?? ""}
- Reasoning: ${anatomy.reasoning ?? ""}
- Stop conditions: ${anatomy.stopConditions ?? ""}
- Output: ${anatomy.output ?? ""}

Bagian yang harus disempurnakan: "${sectionKey}"
Arahan penyempurnaan dari pengguna: "${instruction}"
Tone / Mood yang harus dipertahankan: ${tone}
Bahasa output yang harus dipertahankan: ${outputLanguage === "en" ? "English" : "Bahasa Indonesia"}`,
      config: {
        systemInstruction:
          "You are a Principal Prompt Architect. Refine ONLY the requested section of the 6-part prompt anatomy so it obeys the user's refinement instruction while staying 100% coherent with the other 5 sections. Preserve the exact structural conventions of that section (e.g., Context bullet format, Stop conditions 'Only stop when:' / 'Berhenti hanya jika:', Output schema bullets). Return JSON with `updatedText` and a 1-sentence Indonesian `changeNote`.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedText: {
              type: Type.STRING,
              description: "Teks terbaru untuk bagian anatomi yang disempurnakan.",
            },
            changeNote: {
              type: Type.STRING,
              description: "Penjelasan singkat 1 kalimat dalam Bahasa Indonesia mengenai penyesuaian yang dilakukan.",
            },
          },
          required: ["updatedText", "changeNote"],
        },
      },
    });

    const rawText = (response.text ?? "").trim();
    if (!rawText) {
      throw new Error("Model mengembalikan respons kosong.");
    }

    res.json(JSON.parse(rawText));
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AnatomiPrompt server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
