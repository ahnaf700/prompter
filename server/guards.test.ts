import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyGeminiError,
  cleanText,
  UserFacingError,
  createRateLimiter,
  parseAnalysis,
  parseRefinement,
  sanitizeAnatomy,
} from './guards.ts';

const anatomy = {
  role: 'r',
  task: 't',
  context: 'c',
  reasoning: 'q',
  stopConditions: 's',
  output: 'o',
};

test('cleanText trims, caps length, and strips triple quotes that could break the prompt fence', () => {
  assert.equal(cleanText('  hi  ', 10), 'hi');
  assert.equal(cleanText('abcdef', 3), 'abc');
  assert.equal(cleanText('a"""b', 10), 'a"b');
  assert.equal(cleanText(42, 10), '');
});

test('sanitizeAnatomy requires all six string sections and caps each one', () => {
  assert.deepEqual(sanitizeAnatomy(anatomy), anatomy);
  assert.equal(sanitizeAnatomy({ ...anatomy, role: undefined }), null);
  assert.equal(sanitizeAnatomy(null), null);
  assert.equal(sanitizeAnatomy({ ...anatomy, task: 'x'.repeat(20000) })?.task.length, 8000);
});

test('parseAnalysis rejects incomplete model output and coerces assumptions to string[]', () => {
  const good = {
    title: 'T',
    detectedDomain: 'D',
    userIntentSummary: 'U',
    inferredAssumptions: ['a', 'b'],
    anatomy,
  };
  assert.deepEqual(parseAnalysis(good), good);
  assert.equal(parseAnalysis({ ...good, anatomy: { ...anatomy, output: 5 } }), null);
  assert.equal(parseAnalysis({ ...good, title: '' }), null);
  // missing assumptions must not crash the client's .map()
  assert.deepEqual(parseAnalysis({ ...good, inferredAssumptions: undefined })?.inferredAssumptions, []);
  assert.deepEqual(parseAnalysis({ ...good, inferredAssumptions: ['a', 3, ''] })?.inferredAssumptions, ['a']);
});

test('parseRefinement needs non-empty updatedText', () => {
  assert.deepEqual(parseRefinement({ updatedText: 'x', changeNote: 'y' }), { updatedText: 'x', changeNote: 'y' });
  assert.equal(parseRefinement({ updatedText: '  ', changeNote: 'y' }), null);
  assert.equal(parseRefinement({ updatedText: 'x' })?.changeNote, '');
});

test('classifyGeminiError uses numeric status first, not substrings of unrelated text', () => {
  assert.equal(classifyGeminiError({ status: 429, message: 'x' }).status, 429);
  assert.equal(classifyGeminiError({ status: 403, message: 'x' }).status, 403);
  assert.equal(classifyGeminiError({ status: 404, message: 'x' }).status, 404);
  // "4040 tokens" and "port 4030" must not be misread as HTTP 404/403
  assert.equal(classifyGeminiError(new Error('used 4040 tokens')).status, 500);
  assert.equal(classifyGeminiError(new Error('port 4030 busy')).status, 500);
  assert.equal(classifyGeminiError(new Error('GEMINI_API_KEY belum dikonfigurasi')).status, 401);
});

test('classifyGeminiError never leaks raw internal messages on 500', () => {
  const out = classifyGeminiError(new Error('ECONNRESET at 10.0.0.5:443 secret-host'));
  assert.equal(out.status, 500);
  assert.ok(!out.message.includes('10.0.0.5'));
});

test('classifyGeminiError passes through our own user-facing validation errors', () => {
  const out = classifyGeminiError(new UserFacingError('Model mengembalikan respons kosong. Silakan coba lagi.'));
  assert.equal(out.status, 502);
  assert.match(out.message, /respons kosong/);
  // a plain Error with the same text is NOT trusted
  assert.equal(classifyGeminiError(new Error('Model mengembalikan respons kosong.')).status, 500);
});

test('rate limiter blocks after max hits per key within the window, then recovers', () => {
  let now = 0;
  const limit = createRateLimiter(2, 1000, () => now);
  assert.equal(limit('ip'), true);
  assert.equal(limit('ip'), true);
  assert.equal(limit('ip'), false);
  assert.equal(limit('other'), true);
  now = 1001;
  assert.equal(limit('ip'), true);
});
