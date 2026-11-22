export type AnatomyKey =
  | 'role'
  | 'task'
  | 'context'
  | 'reasoning'
  | 'stopConditions'
  | 'output';

export interface PromptAnatomy {
  role: string;
  task: string;
  context: string;
  reasoning: string;
  stopConditions: string;
  output: string;
}

export interface PromptAnalysisResult {
  title: string;
  detectedDomain: string;
  userIntentSummary: string;
  inferredAssumptions: string[];
  anatomy: PromptAnatomy;
}

export type OutputLanguage = 'id' | 'en';
export type DetailLevel = 'ringkas' | 'standar' | 'mendalam';
export type TargetStyle = 'general' | 'claude' | 'gemini' | 'coding';
export type PromptTone = 'profesional' | 'kasual' | 'persuasif';
export type ExportFormat = 'plain' | 'markdown' | 'xml';

export interface PromptBuildConfig {
  outputLanguage: OutputLanguage;
  detailLevel: DetailLevel;
  targetStyle: TargetStyle;
  tone: PromptTone;
}

export interface SavedPromptItem {
  id: string;
  createdAt: string;
  briefPrompt: string;
  extraContext?: string;
  config: PromptBuildConfig;
  result: PromptAnalysisResult;
}

export interface AnatomySectionMeta {
  key: AnatomyKey;
  index: string;
  label: string;
  xmlTag: string;
  colorClass: string;
  dotColor: string;
  summary: string;
  guidance: string;
  patternHint: string;
}
