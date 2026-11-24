import assert from "node:assert/strict";
import { test } from "node:test";
import {
  UserFacingError,
  createRateLimiter,
  formatGeminiError,
  normalizeAnalysis,
  readAnatomy,
} from "./server-utils.ts";

const validAnatomy = {
  role: "r",
  task: "t",
  context: "c",
  reasoning: "re",
  stopConditions: "s",
  output: "o",
};

test("formatGeminiError: status numerik dari SDK dipetakan", () => {
  const err = Object.assign(new Error("boom"), { status: 429 });
  assert.equal(formatGeminiError(err).status, 429);
  assert.equal(formatGeminiError(Object.assign(new Error("x"), { status: 403 })).status, 403);
  assert.equal(formatGeminiError(Object.assign(new Error("x"), { status: 404 })).status, 404);
});

test("formatGeminiError: kode teks Gemini dipetakan, termasuk API key tidak valid", () => {
  assert.equal(formatGeminiError(new Error('{"status":"RESOURCE_EXHAUSTED"}')).status, 429);
  assert.equal(formatGeminiError(new Error("API key not valid. Please pass a valid API key.")).status, 401);
});

test("formatGeminiError: angka acak di pesan TIDAK dianggap kode HTTP", () => {
  const out = formatGeminiError(new Error("connect failed to 10.0.4.404:443 after 429ms"));
  assert.equal(out.status, 500);
});

test("formatGeminiError: error tak dikenal tidak membocorkan pesan mentah", () => {
  const out = formatGeminiError(new Error("secret internal path /srv/app/key.json"));
  assert.equal(out.status, 500);
  assert.ok(!out.message.includes("/srv/app"));
});

test("formatGeminiError: UserFacingError diteruskan apa adanya", () => {
  const out = formatGeminiError(new UserFacingError("Respons kosong.", 502));
  assert.deepEqual(out, { status: 502, message: "Respons kosong." });
});

test("formatGeminiError: JSON rusak dari model menjadi 502 yang ramah", () => {
  let caught: unknown;
  try {
    JSON.parse("{not json");
  } catch (e) {
    caught = e;
  }
  const out = formatGeminiError(caught);
  assert.equal(out.status, 502);
  assert.ok(!out.message.includes("Unexpected"));
});

test("readAnatomy: menerima 6 string, mengisi yang hilang dengan string kosong", () => {
  assert.deepEqual(readAnatomy(validAnatomy), validAnatomy);
  assert.equal(readAnatomy({ role: "x" })?.task, "");
});

test("readAnatomy: menolak non-objek, non-string, dan teks terlalu panjang", () => {
  assert.equal(readAnatomy(null), null);
  assert.equal(readAnatomy("x"), null);
  assert.equal(readAnatomy({ ...validAnatomy, role: 123 }), null);
  assert.equal(readAnatomy({ ...validAnatomy, role: "a".repeat(8001) }), null);
});

test("normalizeAnalysis: hasil valid lolos dan asumsi non-string dibuang", () => {
  const out = normalizeAnalysis({
    title: "T",
    detectedDomain: "D",
    userIntentSummary: "S",
    inferredAssumptions: ["a", 5, "b"],
    anatomy: validAnatomy,
  });
  assert.deepEqual(out?.inferredAssumptions, ["a", "b"]);
  assert.equal(out?.anatomy.role, "r");
});

test("normalizeAnalysis: struktur cacat ditolak (mencegah crash di klien)", () => {
  assert.equal(normalizeAnalysis(null), null);
  assert.equal(normalizeAnalysis({ title: "T" }), null);
  assert.equal(
    normalizeAnalysis({
      title: "T",
      detectedDomain: "D",
      userIntentSummary: "S",
      inferredAssumptions: "bukan array",
      anatomy: validAnatomy,
    }),
    null
  );
  assert.equal(
    normalizeAnalysis({
      title: "T",
      detectedDomain: "D",
      userIntentSummary: "S",
      inferredAssumptions: [],
      anatomy: { ...validAnatomy, output: undefined },
    }),
    null
  );
});

test("createRateLimiter: blokir setelah batas, pulih setelah jendela waktu", () => {
  let now = 1000;
  const allow = createRateLimiter({ max: 2, windowMs: 60_000, now: () => now });
  assert.equal(allow("1.1.1.1"), true);
  assert.equal(allow("1.1.1.1"), true);
  assert.equal(allow("1.1.1.1"), false);
  assert.equal(allow("2.2.2.2"), true); // klien lain tidak terpengaruh
  now += 60_001;
  assert.equal(allow("1.1.1.1"), true);
});
