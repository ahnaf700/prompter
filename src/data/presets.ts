import type { AnatomySectionMeta, PromptAnalysisResult, PromptBuildConfig } from '../types/prompt';

export const ANATOMY_SECTIONS: AnatomySectionMeta[] = [
  {
    key: 'role',
    index: '01',
    label: 'Role',
    xmlTag: 'role',
    colorClass: 'text-[#60A5FA]',
    dotColor: 'bg-[#60A5FA]',
    summary: 'Menetapkan persona pakar, kedalaman pengalaman, dan prioritas pengambilan keputusan.',
    guidance: 'Gunakan peran spesifik + keahlian relevan + prinsip trade-off (prioritaskan X dibanding Y).',
    patternHint: 'Bertindaklah sebagai [peran senior] dengan keahlian mendalam di [domain]. Prioritaskan [nilai utama] daripada [hal sekunder].',
  },
  {
    key: 'task',
    index: '02',
    label: 'Task',
    xmlTag: 'task',
    colorClass: 'text-[#F97316]',
    dotColor: 'bg-[#F97316]',
    summary: 'Mendefinisikan pekerjaan inti, batasan waktu/ruang lingkup, validasi, dan hasil akhir.',
    guidance: 'Nyatakan kata kerja aksi yang tegas, apa yang harus divalidasi, dan bentuk deliverable final.',
    patternHint: 'Susun [deliverable utama] untuk [subjek/tujuan]. Validasi [asumsi kunci], dan akhiri dengan [hasil siap pakai].',
  },
  {
    key: 'context',
    index: '03',
    label: 'Context',
    xmlTag: 'context',
    colorClass: 'text-[#2DD4BF]',
    dotColor: 'bg-[#2DD4BF]',
    summary: 'Mengunci fakta lapangan, kapasitas tim, sumber daya, dan risiko utama agar AI tidak mengarang.',
    guidance: 'Awali dengan daftar fakta terstruktur memakai poin (-) untuk produk, tim, batasan, dan risiko.',
    patternHint: 'Berikut informasi yang diketahui: -Produk/Subjek: ... -Tim/Aktor: ... -Sumber Daya: ... -Risiko Utama: ...',
  },
  {
    key: 'reasoning',
    index: '04',
    label: 'Reasoning',
    xmlTag: 'reasoning',
    colorClass: 'text-[#FB923C]',
    dotColor: 'bg-[#FB923C]',
    summary: 'Mengarahkan standar kualitas dan cara berpikir kritis yang harus dipertahankan AI.',
    guidance: 'Jelaskan mengapa langkah tertentu perlu dikunci di awal dan standar kualitas apa yang dituntut.',
    patternHint: 'Tujuannya adalah [standar hasil]. Dengan mengunci [fondasi] di awal dan mempertahankan argumen tiap langkah, hasilnya akan benar-benar siap eksekusi.',
  },
  {
    key: 'stopConditions',
    index: '05',
    label: 'Stop conditions',
    xmlTag: 'stop_conditions',
    colorClass: 'text-[#F43F5E]',
    dotColor: 'bg-[#F43F5E]',
    summary: 'Menetapkan syarat selesai yang terukur agar AI tidak berhenti terlalu cepat atau melebar.',
    guidance: 'Gunakan frasa pembuka "Berhenti hanya jika:" diikuti 3–4 kriteria kuantitatif dan gerbang keputusan.',
    patternHint: 'Berhenti hanya jika: -[Jumlah/cakupan terukur] -[Keterkaitan tiap poin dengan risiko] -[Diakhiri dengan gerbang keputusan/validasi akhir].',
  },
  {
    key: 'output',
    index: '06',
    label: 'Output',
    xmlTag: 'output',
    colorClass: 'text-[#A78BFA]',
    dotColor: 'bg-[#A78BFA]',
    summary: 'Mengunci format penyajian dan skema kolom/field sehingga jawaban langsung terstruktur rapi.',
    guidance: 'Tentukan format dokumen (tabel, sprint plan, JSON, brief) beserta field wajib untuk setiap item.',
    patternHint: 'Sajikan sebagai [format]. Untuk setiap [unit]: -Aksi: ... -Penanggung Jawab: ... -Risiko: ... -Rasional + Output: ...',
  },
];

export interface StarterBriefItem {
  id: string;
  label: string;
  category: string;
  brief: string;
  recommendedConfig: PromptBuildConfig;
}

export const STARTER_BRIEFS: StarterBriefItem[] = [
  {
    id: 'saas-launch',
    label: 'Rencana Peluncuran SaaS AI 90 Hari',
    category: 'Strategi Produk & GTM',
    brief:
      'Buatkan rencana peluncuran 90 hari untuk aplikasi AI task manager bagi founder startup. Tim cuma 2 orang, budget terbatas, baru ada 15-20 pengguna beta, dan fokus utama ke adopsi serta retensi.',
    recommendedConfig: {
      outputLanguage: 'id',
      detailLevel: 'standar',
      targetStyle: 'claude',
      tone: 'profesional',
    },
  },
  {
    id: 'backend-audit',
    label: 'Audit Keamanan & Performa API Backend',
    category: 'Rekayasa Perangkat Lunak',
    brief:
      'Saya ingin AI mengaudit arsitektur REST API Node.js + PostgreSQL yang mulai lambat saat traffic naik dan rawan kebocoran otorisasi antar tenant.',
    recommendedConfig: {
      outputLanguage: 'id',
      detailLevel: 'mendalam',
      targetStyle: 'coding',
      tone: 'profesional',
    },
  },
  {
    id: 'curriculum-design',
    label: 'Kurikulum Belajar Full-Stack 6 Minggu',
    category: 'Edukasi & Pelatihan',
    brief:
      'Susun roadmap belajar TypeScript dan React dari nol sampai bisa deploy aplikasi web pertama dalam 6 minggu untuk pekerja penuh waktu yang cuma punya 90 menit per hari.',
    recommendedConfig: {
      outputLanguage: 'id',
      detailLevel: 'standar',
      targetStyle: 'general',
      tone: 'kasual',
    },
  },
  {
    id: 'b2b-content',
    label: 'Strategi Konten LinkedIn B2B',
    category: 'Pemasaran & Pertumbuhan',
    brief:
      'Bantu bikin strategi konten LinkedIn selama 30 hari untuk konsultan ERP B2B di Indonesia agar menghasilkan inbound demo call tanpa terdengar seperti hard-selling.',
    recommendedConfig: {
      outputLanguage: 'id',
      detailLevel: 'standar',
      targetStyle: 'claude',
      tone: 'persuasif',
    },
  },
];

export const BLUEPRINT_REFERENCE_RESULT: {
  briefPrompt: string;
  config: PromptBuildConfig;
  result: PromptAnalysisResult;
} = {
  briefPrompt:
    'Buatkan rencana peluncuran 90 hari untuk aplikasi AI task manager khusus founder dengan tim 2 orang, budget ramping, dan 15-20 beta user.',
  config: {
    outputLanguage: 'en',
    detailLevel: 'standar',
    targetStyle: 'claude',
    tone: 'profesional',
  },
  result: {
    title: '90-Day SaaS AI Launch Strategy',
    detectedDomain: 'Go-To-Market & SaaS Launch',
    userIntentSummary:
      'Menyusun rencana peluncuran 90 hari yang sangat taktis untuk tim super ramping agar cepat mendapatkan traksi nyata dan memvalidasi pesan inti produk.',
    inferredAssumptions: [
      'Target segmen founder difokuskan pada rentang usia produktif (25–40 tahun) dengan kebutuhan manajemen tugas berkecepatan tinggi.',
      'Risiko utama dibagi menjadi tiga pilar terukur: Adoption, Retention, dan Positioning.',
      'Format luaran dikunci sebagai weekly sprint plan 12 minggu dengan Launch Decision Gate di akhir.',
    ],
    anatomy: {
      role: 'Act as a senior go-to-market strategist with deep expertise launching early-stage SaaS tools. Prioritize traction speed over brand perfection.',
      task: 'Build a 90-day launch plan for a new AI productivity tool for founders. Validate the core messaging, end with a launch-ready brief.',
      context: `Here's what I know:
-Product: AI task manager for founders (25-40).
-Team: 2-person (Founder + Growth marketer).
-Resources: Lean budget, 15-20 beta users.
-Key Risks: Adoption, Retention, Positioning.`,
      reasoning:
        'The goal is a crisp, launch-ready strategy. By locking in ICP clarity upfront and asking you to defend each step, the output will be truly actionable and founder-grade.',
      stopConditions: `Only stop when:
-A 12-week roadmap with 3-4 actions/week.
-Every action links to the risk it addresses.
-Plan ends with a final Launch Decision Gate.`,
      output: `Present as a weekly sprint plan. For each action:
-Action: The specific task to complete.
-Owner: Founder, Growth lead, or Designer.
-Risk: Adoption, Retention, or Positioning.
-Rationale + Output: reasoning, deliverable.`,
    },
  },
};
