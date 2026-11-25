import { useState, useRef, useEffect, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
  Upload,
  ScanSearch,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Info,
  Copy,
  Check,
  Send,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import type {
  BuilderTool,
  ChatMessage,
  FindingSeverity,
  ScreenshotAnalysisResult,
} from '../types/qa';

const BUILDERS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

const STARTER_PROMPTS = [
  'How do I check if my Supabase keys or tables are exposed in a Lovable app?',
  'My Bolt app works in preview but login fails after deploying to a custom domain.',
  'What 5 checks should I run before taking real Stripe payments on a Cursor MVP?',
];

/**
 * Generates a realistic demo PNG screenshot on an HTML5 canvas so visitors
 * without an app screenshot handy can test real multimodal AI image analysis.
 */
function buildDemoBrokenAppScreenshot(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Browser frame
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, 960, 600);
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, 960, 44);

  // URL bar showing http (non-https) checkout preview
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(140, 9, 640, 26);
  ctx.fillStyle = '#475569';
  ctx.font = '13px monospace';
  ctx.fillText('http://pay-beta.my-bolt-app.com/checkout?admin=true', 154, 26);

  // Main card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(72, 76, 540, 390);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(72, 76, 540, 390);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Upgrade to Pro — $49/mo', 102, 126);

  ctx.fillStyle = '#64748B';
  ctx.font = '14px sans-serif';
  ctx.fillText('Enter your billing details below to unlock workspace exports.', 102, 152);

  // Input fields
  ctx.fillStyle = '#0F172A';
  ctx.font = '13px sans-serif';
  ctx.fillText('Card Number', 102, 194);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(102, 204, 460, 40);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(102, 204, 460, 40);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px monospace';
  ctx.fillText('4242 •••• •••• 4242', 116, 229);

  // Intentionally broken overlapping CTA button + low contrast text
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(102, 272, 210, 42);
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '14px sans-serif';
  ctx.fillText('Cancel subscription', 130, 298);

  // Overlapping primary button clipping out of card border
  ctx.fillStyle = '#1E40AF';
  ctx.fillRect(285, 282, 370, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Pay $49.00 Now — Instant Access', 345, 310);

  // Unhandled runtime error toast inside UI
  ctx.fillStyle = '#FEF2F2';
  ctx.fillRect(102, 354, 480, 82);
  ctx.strokeStyle = '#FCA5A5';
  ctx.strokeRect(102, 354, 480, 82);
  ctx.fillStyle = '#991B1B';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('Uncaught TypeError: Cannot read properties of undefined (reading "id")', 116, 378);
  ctx.font = '12px monospace';
  ctx.fillText('at CheckoutForm.tsx:142 (SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...)', 116, 402);
  ctx.fillText('POST /rest/v1/users 200 OK — 1,482 rows returned to client', 116, 422);

  // Right sidebar debug panel accidentally shipped
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(638, 76, 260, 390);
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('DEBUG ENV (DEV ONLY)', 658, 108);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '12px monospace';
  ctx.fillText('STRIPE_SECRET=sk_live_98a7f...', 658, 140);
  ctx.fillText('ADMIN_BYPASS=true', 658, 166);
  ctx.fillText('RLS_ENABLED=false', 658, 192);
  ctx.fillText('WEBHOOK_SIG_CHECK=off', 658, 218);

  // Footer
  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText('Demo checkout screen — captured before launch verification', 72, 512);

  return canvas.toDataURL('image/png');
}

function renderMessageLines(text: string) {
  const segments = text.split(/(```[\s\S]*?```)/g);
  return segments.map((segment, index) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const cleaned = segment.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '');
      return (
        <pre
          key={index}
          className="my-3 p-3.5 bg-slate-900 dark:bg-[#090D16] text-slate-100 border border-slate-800 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed"
        >
          <code>{cleaned}</code>
        </pre>
      );
    }

    const lines = segment.split('\n');
    return (
      <div key={index} className="space-y-2">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <p key={lineIdx} className="pl-4 relative text-sm leading-relaxed">
                <span aria-hidden="true" className="absolute left-0 text-slate-400 dark:text-slate-500">
                  •
                </span>
                {trimmed.slice(2)}
              </p>
            );
          }
          return (
            <p key={lineIdx} className="text-sm leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  });
}

function SeverityIndicator({ severity }: { severity: FindingSeverity }) {
  if (severity === 'Critical') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>Critical</span>
      </span>
    );
  }
  if (severity === 'Warning') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Warning</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>Suggestion</span>
    </span>
  );
}

export function LiveQAStudio() {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'chat'>('screenshot');

  // Screenshot Analyzer state
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');
  const [focusNote, setFocusNote] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScreenshotAnalysisResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-turn AI Chat state
  const [chatBuilder, setChatBuilder] = useState<BuilderTool>('Lovable');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Ask me about any fragile flow, auth bug, or potential data exposure in your Lovable, Bolt, Cursor, or Replit app. I can walk you through what to check and write a repair prompt you can paste directly into your builder.',
      timestamp: 'Now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, chatSending, activeTab]);

  function processSelectedFile(file: File) {
    setAnalysisError(null);
    setAnalysisResult(null);

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setAnalysisError('Please choose a PNG, JPEG, or WebP screenshot.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAnalysisError('Screenshot must be smaller than 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewDataUrl(reader.result);
        setFileName(file.name);
      }
    };
    reader.onerror = () => {
      setAnalysisError('Could not read the selected image file.');
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  }

  function handleLoadDemoScreenshot() {
    setAnalysisError(null);
    setAnalysisResult(null);
    const dataUrl = buildDemoBrokenAppScreenshot();
    if (!dataUrl) {
      setAnalysisError('Could not generate the sample screenshot in this browser.');
      return;
    }
    setPreviewDataUrl(dataUrl);
    setFileName('demo-checkout-preview.png');
    setBuilderTool('Bolt');
    setFocusNote('Check for exposed secrets, broken checkout layout, and data leaks.');
  }

  function handleClearScreenshot() {
    setPreviewDataUrl(null);
    setFileName(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleAnalyzeScreenshot(e: FormEvent) {
    e.preventDefault();
    if (!previewDataUrl) {
      setAnalysisError('Upload a screenshot or load the demo screenshot first.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: previewDataUrl,
          builderTool,
          focusNote,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAnalysisError(data?.error || 'Could not complete the screenshot audit.');
        return;
      }
      setAnalysisResult(data as ScreenshotAnalysisResult);
    } catch {
      setAnalysisError('Network error while contacting the audit service. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCopyText(text: string, onDone: () => void) {
    try {
      await navigator.clipboard.writeText(text);
      onDone();
    } catch {
      // Clipboard blocked in some iframe contexts; fail silently without throwing
    }
  }

  async function sendChatMessage(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || chatSending) return;

    setChatError(null);
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowLabel,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setChatInput('');
    setChatSending(true);

    try {
      // Exclude the static welcome prompt from API conversation history so turns start cleanly with user
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          builderContext: chatBuilder,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setChatError(data?.error || 'Could not reach the QA advisor right now.');
        return;
      }

      const replyMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch {
      setChatError('Network error while sending your message. Please try again.');
    } finally {
      setChatSending(false);
    }
  }

  function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    void sendChatMessage(chatInput);
  }

  function handleResetChat() {
    setChatError(null);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Conversation reset. Ask anything about testing, securing, or fixing your AI-built app.',
        timestamp: 'Now',
      },
    ]);
  }

  return (
    <section
      id="live-audit"
      className="py-20 lg:py-28 border-t border-slate-200 dark:border-slate-800/90 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Try Proofline before joining
            </p>
            <h2
              className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              Run a live audit on your app right now.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Upload any screenshot from Lovable, Bolt, or Cursor to catch visible exposures and
              broken states—or chat with our QA advisor for a tailored pre-launch checklist.
            </p>
          </div>

          {/* Interactive segmented tab control */}
          <div
            role="tablist"
            aria-label="Live QA Studio modes"
            className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-[#111827] border border-transparent dark:border-slate-800 rounded-lg self-start lg:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'screenshot'}
              onClick={() => setActiveTab('screenshot')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'screenshot'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-xs dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ScanSearch className="w-4 h-4 shrink-0" />
              <span>Screenshot Audit</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-xs dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>QA & Security Advisor</span>
            </button>
          </div>
        </div>

        {/* Tab Panel 1: Screenshot QA & Security Analyzer */}
        {activeTab === 'screenshot' && (
          <div className="mt-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Left: Upload & Controls */}
              <form
                onSubmit={handleAnalyzeScreenshot}
                className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6"
              >
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        App screenshot
                      </label>
                      {!previewDataUrl ? (
                        <button
                          type="button"
                          onClick={handleLoadDemoScreenshot}
                          className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                        >
                          Load demo app screenshot
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleClearScreenshot}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                      id="screenshot-file-input"
                    />

                    {!previewDataUrl ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`p-8 border border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                          isDragging
                            ? 'border-[#1E40AF] dark:border-[#3B82F6] bg-[#1E40AF]/5 dark:bg-[#3B82F6]/10'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-[#F8FAFC] dark:bg-[#090D16]'
                        }`}
                      >
                        <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                          Drop a screenshot here, or browse files
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          PNG, JPEG, or WebP up to 8 MB · Analyzed in memory, never stored
                        </p>
                      </div>
                    ) : (
                      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-[#090D16]">
                        <img
                          src={previewDataUrl}
                          alt={fileName || 'Uploaded application screenshot'}
                          className="w-full max-h-60 object-contain bg-slate-100 dark:bg-[#090D16]"
                        />
                        <div className="px-3.5 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="truncate font-mono">{fileName}</span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="audit-builder-select"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Built with
                      </label>
                      <select
                        id="audit-builder-select"
                        value={builderTool}
                        onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 cursor-pointer"
                      >
                        {BUILDERS.map((tool) => (
                          <option key={tool} value={tool}>
                            {tool}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="audit-focus-input"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Focus area (optional)
                      </label>
                      <input
                        id="audit-focus-input"
                        type="text"
                        value={focusNote}
                        onChange={(e) => setFocusNote(e.target.value)}
                        placeholder="e.g., Auth screen or Stripe checkout"
                        maxLength={200}
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {analysisError && (
                    <div
                      role="alert"
                      className="p-3.5 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/70 rounded-lg flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={analyzing || !previewDataUrl}
                    className="w-full px-5 py-3 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {analyzing ? 'Inspecting screenshot...' : 'Run QA & Security Audit'}
                  </button>
                </div>
              </form>

              {/* Right: Structured Diagnostic Output */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col">
                {analyzing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-[#1E40AF] dark:border-t-[#3B82F6] animate-spin mb-4" />
                    <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      Checking flows, layout integrity, and visible exposures
                    </p>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      Reviewing your {builderTool} screenshot and drafting copy-ready repair
                      prompts...
                    </p>
                  </div>
                ) : !analysisResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-14 text-center">
                    <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      Your diagnostic report appears here
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                      Upload a screenshot of any login page, dashboard, or checkout modal—or click{' '}
                      <button
                        type="button"
                        onClick={handleLoadDemoScreenshot}
                        className="font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer"
                      >
                        Load demo app screenshot
                      </button>{' '}
                      to see how Proofline surfaces hidden risks and writes ready-to-paste fix
                      prompts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span>{analysisResult.checkedArea}</span>
                          <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
                            ·
                          </span>
                          <span>{builderTool}</span>
                          <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
                            ·
                          </span>
                          <span className="tabular-nums">
                            {analysisResult.findings.length}{' '}
                            {analysisResult.findings.length === 1 ? 'finding' : 'findings'}
                          </span>
                        </p>
                        <h3 className="mt-1 font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          Audit Summary
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {analysisResult.readinessStatus === 'Ready to Ship' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Ready to Ship</span>
                          </span>
                        ) : analysisResult.readinessStatus === 'High Risk' ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                            <ShieldAlert className="w-4 h-4" />
                            <span>High Risk</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Needs Fixes</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {analysisResult.summary}
                    </p>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
                      {analysisResult.findings.map((finding, idx) => (
                        <div key={`${finding.title}-${idx}`} className="py-5 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <SeverityIndicator severity={finding.severity} />
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                                ·
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {finding.category}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                              {finding.title}
                            </h4>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {finding.detail}
                            </p>
                          </div>

                          <div className="bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Paste into {builderTool}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(finding.fixPrompt, () => {
                                    setCopiedIdx(idx);
                                    window.setTimeout(() => setCopiedIdx(null), 2000);
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#93C5FD] cursor-pointer whitespace-nowrap"
                              >
                                {copiedIdx === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy fix prompt</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              {finding.fixPrompt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Panel 2: Multi-turn AI QA & Security Advisor Chat */}
        {activeTab === 'chat' && (
          <div className="mt-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
            {/* Chat utility header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#F8FAFC] dark:bg-[#0D1321]">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  QA & Security Advisor
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <label
                  htmlFor="chat-builder-select"
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  Stack context:
                </label>
                <select
                  id="chat-builder-select"
                  value={chatBuilder}
                  onChange={(e) => setChatBuilder(e.target.value as BuilderTool)}
                  className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-[#090D16] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                >
                  {BUILDERS.map((tool) => (
                    <option key={tool} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC] cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset thread</span>
              </button>
            </div>

            {/* Scrollable conversation thread */}
            <div
              className="h-[440px] overflow-y-auto px-6 py-6 space-y-6 bg-white dark:bg-[#111827]"
              aria-live="polite"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {isUser ? 'You' : 'Proofline Advisor'}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-2xl rounded-xl px-4 py-3.5 ${
                        isUser
                          ? 'bg-[#1E40AF] dark:bg-[#2563EB] text-white'
                          : 'bg-[#F8FAFC] dark:bg-[#161F33] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div>{renderMessageLines(msg.text)}</div>
                      )}
                    </div>

                    {!isUser && msg.id !== 'welcome' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(msg.text, () => {
                            setCopiedMsgId(msg.id);
                            window.setTimeout(() => setCopiedMsgId(null), 2000);
                          })
                        }
                        className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            <span>Copied response</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {chatSending && (
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Proofline Advisor
                  </span>
                  <div className="bg-[#F8FAFC] dark:bg-[#161F33] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    Reviewing your question and preparing checks...
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>

            {/* Starter quick-prompts when conversation is fresh */}
            {messages.length <= 1 && (
              <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-[#F8FAFC]/60 dark:bg-[#0D1321]/70 flex flex-wrap gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendChatMessage(prompt)}
                    disabled={chatSending}
                    className="text-left text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:border-[#1E40AF] dark:hover:border-[#3B82F6] hover:text-[#1E40AF] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Chat error + input bar */}
            <div className="p-4 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1321]">
              {chatError && (
                <p
                  role="alert"
                  className="mb-3 flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{chatError}</span>
                </p>
              )}

              <form onSubmit={handleChatSubmit} className="flex items-center gap-2.5">
                <label htmlFor="advisor-chat-input" className="sr-only">
                  Ask Proofline Advisor a QA or security question
                </label>
                <input
                  id="advisor-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about testing, auth, or security in your ${chatBuilder} app...`}
                  maxLength={2000}
                  disabled={chatSending}
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25"
                />
                <button
                  type="submit"
                  disabled={chatSending || !chatInput.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
