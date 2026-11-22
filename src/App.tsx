import { useEffect, useState } from 'react';
import { AnatomyInspector } from './components/AnatomyInspector';
import { BriefInputPanel } from './components/BriefInputPanel';
import { CompiledPreview } from './components/CompiledPreview';
import { ExamplesView } from './components/ExamplesView';
import { Header, type ActiveTab } from './components/Header';
import { HistoryView } from './components/HistoryView';
import { ReferenceView } from './components/ReferenceView';
import { BLUEPRINT_REFERENCE_RESULT } from './data/presets';
import type {
  AnatomyKey,
  ExportFormat,
  PromptAnalysisResult,
  PromptBuildConfig,
  SavedPromptItem,
} from './types/prompt';

const HISTORY_STORAGE_KEY = 'anatomi_prompt_history_v1';

const DEFAULT_CONFIG: PromptBuildConfig = {
  outputLanguage: 'id',
  detailLevel: 'standar',
  targetStyle: 'claude',
  tone: 'profesional',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [briefPrompt, setBriefPrompt] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [config, setConfig] = useState<PromptBuildConfig>(DEFAULT_CONFIG);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('plain');

  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [inspectorResetKey, setInspectorResetKey] = useState(0);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [refiningKey, setRefiningKey] = useState<AnatomyKey | null>(null);
  const [refineFeedback, setRefineFeedback] = useState<{
    key: AnatomyKey;
    note: string;
  } | null>(null);

  const [history, setHistory] = useState<SavedPromptItem[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore quota errors silently
    }
  }, [history]);

  const runAnalysis = async (
    overrideBrief?: string,
    overrideConfig?: PromptBuildConfig
  ) => {
    const targetBrief = (overrideBrief ?? briefPrompt).trim();
    const targetConfig = overrideConfig ?? config;

    if (targetBrief.length < 5) {
      setErrorMessage('Masukkan prompt singkat minimal 5 karakter terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setRefineFeedback(null);

    try {
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefPrompt: targetBrief,
          extraContext: extraContext.trim(),
          outputLanguage: targetConfig.outputLanguage,
          detailLevel: targetConfig.detailLevel,
          targetStyle: targetConfig.targetStyle,
          tone: targetConfig.tone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Gagal menganalisis prompt singkat.');
      }

      const result = data as PromptAnalysisResult;
      setAnalysisResult(result);

      const newId = `prompt_${Date.now()}`;
      const newEntry: SavedPromptItem = {
        id: newId,
        createdAt: new Date().toISOString(),
        briefPrompt: targetBrief,
        extraContext: extraContext.trim(),
        config: targetConfig,
        result,
      };
      setActiveHistoryId(newId);
      setInspectorResetKey((k) => k + 1);
      setHistory((prev) => [newEntry, ...prev].slice(0, 30));
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Terjadi gangguan jaringan saat menghubungi server.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateSection = (key: AnatomyKey, value: string) => {
    if (!analysisResult) return;
    const updated: PromptAnalysisResult = {
      ...analysisResult,
      anatomy: {
        ...analysisResult.anatomy,
        [key]: value,
      },
    };
    setAnalysisResult(updated);

    if (activeHistoryId) {
      setHistory((hist) =>
        hist.map((item) =>
          item.id === activeHistoryId ? { ...item, result: updated } : item
        )
      );
    }
  };

  const handleRefineSection = async (key: AnatomyKey, instruction: string) => {
    if (!analysisResult) return;

    setRefiningKey(key);
    setErrorMessage(null);
    setRefineFeedback(null);

    try {
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: key,
          instruction,
          briefPrompt,
          outputLanguage: config.outputLanguage,
          tone: config.tone,
          anatomy: analysisResult.anatomy,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Gagal menyempurnakan bagian prompt.');
      }

      handleUpdateSection(key, data.updatedText);
      setRefineFeedback({ key, note: data.changeNote });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menyempurnakan bagian prompt.'
      );
    } finally {
      setRefiningKey(null);
    }
  };

  const handleLoadBlueprint = () => {
    setBriefPrompt(BLUEPRINT_REFERENCE_RESULT.briefPrompt);
    setExtraContext('');
    setConfig(BLUEPRINT_REFERENCE_RESULT.config);
    setAnalysisResult(BLUEPRINT_REFERENCE_RESULT.result);
    setActiveHistoryId(null);
    setErrorMessage(null);
    setRefineFeedback(null);
    setInspectorResetKey((k) => k + 1);
    setActiveTab('studio');
  };

  const handleLoadStarter = (
    brief: string,
    recommendedConfig: PromptBuildConfig
  ) => {
    setBriefPrompt(brief);
    setConfig(recommendedConfig);
    setErrorMessage(null);
  };

  const handleSelectExample = (
    brief: string,
    recommendedConfig: PromptBuildConfig,
    autoAnalyze: boolean
  ) => {
    setBriefPrompt(brief);
    setExtraContext('');
    setConfig(recommendedConfig);
    setErrorMessage(null);
    setRefineFeedback(null);
    setInspectorResetKey((k) => k + 1);
    setActiveTab('studio');
    if (autoAnalyze) {
      void runAnalysis(brief, recommendedConfig);
    }
  };

  const handleLoadHistoryItem = (item: SavedPromptItem) => {
    setBriefPrompt(item.briefPrompt);
    setExtraContext(item.extraContext ?? '');
    setConfig({
      ...DEFAULT_CONFIG,
      ...item.config,
      tone: item.config.tone ?? 'profesional',
    });
    setAnalysisResult(item.result);
    setActiveHistoryId(item.id);
    setErrorMessage(null);
    setRefineFeedback(null);
    setInspectorResetKey((k) => k + 1);
    setActiveTab('studio');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  };

  const handleNewPrompt = () => {
    setBriefPrompt('');
    setExtraContext('');
    setAnalysisResult(null);
    setActiveHistoryId(null);
    setErrorMessage(null);
    setRefineFeedback(null);
    setInspectorResetKey((k) => k + 1);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#111214] text-[#F2F1EC]">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewPrompt={handleNewPrompt}
        historyCount={history.length}
      />

      <main className="flex-1 w-full max-w-[1320px] mx-auto px-6 py-8 sm:py-10">
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* Editorial Studio Heading */}
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F4F0] tracking-tight leading-[1.15] [text-wrap:balance]">
                Susun Master Prompt Berstruktur Enam Anatomi
              </h1>
              <p className="text-[15px] text-[#9A9CA5] mt-2.5 leading-relaxed">
                Ubah ide singkat menjadi prompt presisi yang memisahkan Role, Task, Context, Reasoning, Stop conditions, dan Output agar jawaban AI jauh lebih akurat.
              </p>
            </div>

            {/* Step 1: Brief Input */}
            <BriefInputPanel
              briefPrompt={briefPrompt}
              onChangeBrief={setBriefPrompt}
              extraContext={extraContext}
              onChangeExtraContext={setExtraContext}
              config={config}
              onChangeConfig={setConfig}
              onAnalyze={() => void runAnalysis()}
              onLoadStarter={handleLoadStarter}
              onLoadBlueprint={handleLoadBlueprint}
              isLoading={isAnalyzing}
              errorMessage={errorMessage}
              analysisResult={analysisResult}
            />

            {/* Step 2 & 3: Anatomy Inspector + Live Compiled Prompt */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <AnatomyInspector
                  key={inspectorResetKey}
                  anatomy={analysisResult?.anatomy ?? null}
                  isLoading={isAnalyzing}
                  refiningKey={refiningKey}
                  refineFeedback={refineFeedback}
                  onUpdateSection={handleUpdateSection}
                  onRefineSection={handleRefineSection}
                  onLoadBlueprint={handleLoadBlueprint}
                />
              </div>

              <div className="lg:col-span-5">
                <CompiledPreview
                  title={analysisResult?.title ?? 'master-prompt'}
                  anatomy={analysisResult?.anatomy ?? null}
                  format={exportFormat}
                  onChangeFormat={setExportFormat}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <ExamplesView onSelectExample={handleSelectExample} />
        )}

        {activeTab === 'reference' && (
          <ReferenceView onLoadBlueprintToStudio={handleLoadBlueprint} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            items={history}
            onLoadItem={handleLoadHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={() => {
              setHistory([]);
              setActiveHistoryId(null);
            }}
            onGoToStudio={() => setActiveTab('studio')}
          />
        )}
      </main>

      <footer className="border-t border-[#1F2128] mt-12">
        <div className="max-w-[1320px] mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#737682]">
          <span>AnatomiPrompt Studio</span>
          <span>Struktur: Role · Task · Context · Reasoning · Stop conditions · Output</span>
        </div>
      </footer>
    </div>
  );
}
