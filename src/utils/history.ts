import type { SavedPromptItem } from '../types/prompt';

export const HISTORY_LIMIT = 30;

const isStr = (v: unknown): v is string => typeof v === 'string';

function isValidItem(v: unknown): v is SavedPromptItem {
  if (!v || typeof v !== 'object') return false;
  const item = v as Record<string, any>;
  const r = item.result;
  const a = r?.anatomy;
  return (
    isStr(item.id) &&
    isStr(item.createdAt) &&
    isStr(item.briefPrompt) &&
    !!item.config &&
    typeof item.config === 'object' &&
    !!r &&
    isStr(r.title) &&
    isStr(r.detectedDomain) &&
    isStr(r.userIntentSummary) &&
    Array.isArray(r.inferredAssumptions) &&
    !!a &&
    ['role', 'task', 'context', 'reasoning', 'stopConditions', 'output'].every((k) => isStr(a[k]))
  );
}

/** localStorage is user-editable and survives app upgrades: drop bad entries instead of crashing the History tab. */
export function parseHistory(raw: string | null): SavedPromptItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidItem).slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}
