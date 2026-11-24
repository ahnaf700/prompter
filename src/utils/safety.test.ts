import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHistory } from './history.ts';
import { readApiJson } from './api.ts';

const result = {
  title: 'T',
  detectedDomain: 'D',
  userIntentSummary: 'U',
  inferredAssumptions: ['a'],
  anatomy: { role: 'r', task: 't', context: 'c', reasoning: 'q', stopConditions: 's', output: 'o' },
};
const item = (id: string, over: object = {}) => ({
  id,
  createdAt: '2026-01-01T00:00:00.000Z',
  briefPrompt: 'brief',
  config: { outputLanguage: 'id', detailLevel: 'standar', targetStyle: 'claude', tone: 'profesional' },
  result,
  ...over,
});

test('parseHistory returns [] for null, garbage, and non-arrays', () => {
  assert.deepEqual(parseHistory(null), []);
  assert.deepEqual(parseHistory('not json'), []);
  assert.deepEqual(parseHistory('{"a":1}'), []);
});

test('parseHistory keeps valid items and drops corrupted ones instead of crashing the history tab', () => {
  const raw = JSON.stringify([
    item('a'),
    item('b', { result: { ...result, anatomy: null } }),
    item('c', { result: { ...result, inferredAssumptions: 'oops' } }),
    null,
    item('d', { config: undefined }),
    item('e'),
  ]);
  assert.deepEqual(parseHistory(raw).map((x) => x.id), ['a', 'e']);
});

test('parseHistory caps to 30 items', () => {
  const raw = JSON.stringify(Array.from({ length: 40 }, (_, i) => item(`i${i}`)));
  assert.equal(parseHistory(raw).length, 30);
});

test('readApiJson returns parsed JSON on success', async () => {
  const res = new Response(JSON.stringify({ ok: 1 }), { status: 200 });
  assert.deepEqual(await readApiJson(res, 'gagal'), { ok: 1 });
});

test('readApiJson surfaces the server error message on non-2xx JSON', async () => {
  const res = new Response(JSON.stringify({ error: 'Kuota penuh' }), { status: 429 });
  await assert.rejects(() => readApiJson(res, 'gagal'), /Kuota penuh/);
});

test('readApiJson gives a readable error when a proxy returns HTML instead of JSON', async () => {
  const res = new Response('<html>502 Bad Gateway</html>', { status: 502 });
  await assert.rejects(() => readApiJson(res, 'Gagal menganalisis'), (e: Error) => {
    assert.match(e.message, /Gagal menganalisis/);
    assert.ok(!e.message.includes('Unexpected token'));
    return true;
  });
});
