import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Upload,
  ScanSearch,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  User,
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
  ScreenshotFinding,
} from '../types/qa';
import { analyzeScreenshotLocally, askQAAdvisor } from '../services/qaClient';
import { formatBuilderLabel, type Locale, type SiteTranslations } from '../i18n/translations';

interface LiveQAStudioProps {
  locale: Locale;
  t: SiteTranslations;
}

const BUILDERS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

/**
 * Generates a realistic demo PNG screenshot on an HTML5 canvas so visitors
 * without an app screenshot handy can test screenshot analysis.
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

const INLINE_TOKEN_RE = /(`[^`]+`|\*\*[\s\S]+?\*\*|\*(?!\s)[^*\n]+?(?<!\s)\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

function renderInlineFormatted(text: string, keyPrefix = 'in'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(INLINE_TOKEN_RE.source, 'g');
  let partIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${partIdx++}`;

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800/90 font-mono text-[12px] text-slate-900 dark:text-slate-100"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-900 dark:text-white">
          {renderInlineFormatted(token.slice(2, -2), key)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      nodes.push(
        <em key={key} className="italic text-slate-800 dark:text-slate-200">
          {renderInlineFormatted(token.slice(1, -1), key)}
        </em>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E40AF] dark:text-[#60A5FA] underline underline-offset-2 hover:text-[#1D4ED8] dark:hover:text-[#93C5FD]"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function CodeSnippetBlock({
  code,
  language,
  copyLabel,
  copiedLabel,
  defaultLabel,
  onCopied,
}: {
  code: string;
  language: string;
  copyLabel: string;
  copiedLabel: string;
  defaultLabel: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = code;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      document.body.removeChild(helper);
    }
    setCopied(true);
    onCopied?.();
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 dark:bg-[#090D16]">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-900/90 dark:bg-[#0D1321] border-b border-slate-800">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {language || defaultLabel}
        </span>
        <button
          type="button"
          onClick={() => void handleCopyCode()}
          aria-label={copied ? copiedLabel : copyLabel}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer py-0.5 px-1.5 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-emerald-300">{copiedLabel}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copyLabel}</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-slate-100 overflow-x-auto font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderMarkdownBlocks(segment: string, keyPrefix: string): ReactNode[] {
  const lines = segment.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(<hr key={`${keyPrefix}-hr-${i}`} className="my-3 border-slate-200 dark:border-slate-800" />);
      i += 1;
      continue;
    }

    // Headings (# .. ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInlineFormatted(headingMatch[2], `${keyPrefix}-h-${i}`);
      if (level <= 2) {
        blocks.push(
          <h4
            key={`${keyPrefix}-h-${i}`}
            className="pt-2 font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC] leading-snug"
          >
            {content}
          </h4>
        );
      } else {
        blocks.push(
          <h5
            key={`${keyPrefix}-h-${i}`}
            className="pt-1.5 font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] leading-snug"
          >
            {content}
          </h5>
        );
      }
      i += 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`${keyPrefix}-q-${i}`}
          className="border-l-2 border-[#1E40AF]/40 dark:border-[#60A5FA]/40 pl-3 py-0.5 text-sm text-slate-600 dark:text-slate-400 space-y-1"
        >
          {quoteLines.map((qLine, qIdx) => (
            <p key={qIdx} className="leading-relaxed">
              {renderInlineFormatted(qLine, `${keyPrefix}-ql-${i}-${qIdx}`)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = [];
      const startIdx = i;
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (cur.startsWith('- ') || cur.startsWith('* ')) {
          items.push(cur.slice(2));
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(
        <ul key={`${keyPrefix}-ul-${startIdx}`} className="space-y-1.5 pl-4 list-disc marker:text-slate-400 dark:marker:text-slate-500">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed pl-1">
              {renderInlineFormatted(item, `${keyPrefix}-uli-${startIdx}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: { num: string; text: string }[] = [];
      const startIdx = i;
      while (i < lines.length) {
        const numMatch = lines[i].trim().match(/^(\d+\.)\s+(.*)$/);
        if (numMatch) {
          items.push({ num: numMatch[1], text: numMatch[2] });
          i += 1;
        } else {
          break;
        }
      }
      blocks.push(
        <ol key={`${keyPrefix}-ol-${startIdx}`} className="space-y-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <span
                aria-hidden="true"
                className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums leading-6 shrink-0"
              >
                {item.num}
              </span>
              <span className="min-w-0">
                {renderInlineFormatted(item.text, `${keyPrefix}-oli-${startIdx}-${idx}`)}
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    blocks.push(
      <p key={`${keyPrefix}-p-${i}`} className="text-sm leading-relaxed">
        {renderInlineFormatted(trimmed, `${keyPrefix}-p-${i}`)}
      </p>
    );
    i += 1;
  }

  return blocks;
}

function renderMessageLines(
  text: string,
  snippetLabels: {
    copyLabel: string;
    copiedLabel: string;
    defaultLabel: string;
    onCopied?: () => void;
  }
) {
  const segments = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2.5">
      {segments.map((segment, index) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const langMatch = segment.match(/^```([a-zA-Z0-9_-]*)\n?/);
          const language = langMatch?.[1] ?? '';
          const cleaned = segment
            .replace(/^```[a-zA-Z0-9_-]*\n?/, '')
            .replace(/\n?```$/, '');
          return (
            <CodeSnippetBlock
              key={`code-${index}`}
              code={cleaned}
              language={language}
              copyLabel={snippetLabels.copyLabel}
              copiedLabel={snippetLabels.copiedLabel}
              defaultLabel={snippetLabels.defaultLabel}
              onCopied={snippetLabels.onCopied}
            />
          );
        }

        const blocks = renderMarkdownBlocks(segment, `seg-${index}`);
        if (blocks.length === 0) return null;
        return (
          <div key={`seg-${index}`} className="space-y-2.5">
            {blocks}
          </div>
        );
      })}
    </div>
  );
}

function SeverityIndicator({
  severity,
  label,
}: {
  severity: FindingSeverity;
  label: string;
}) {
  if (severity === 'Critical') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  if (severity === 'Warning') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
      <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function LiveQAStudio({ locale, t }: LiveQAStudioProps) {
  const [activeTab, setActiveTab] = useState<'screenshot' | 'chat'>('screenshot');

  // Shared builder selection across Screenshot Audit & Advisor tabs
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');

  // Screenshot Analyzer state
  const [focusNote, setFocusNote] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScreenshotAnalysisResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tabScreenshotRef = useRef<HTMLButtonElement | null>(null);
  const tabChatRef = useRef<HTMLButtonElement | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const copyPromptTimerRef = useRef<number | null>(null);
  const copyAllTimerRef = useRef<number | null>(null);
  const copyMsgTimerRef = useRef<number | null>(null);

  // Multi-turn AI Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text: t.studio.welcomeMessage,
      timestamp: t.studio.now,
    },
  ]);
  const [archivedMessages, setArchivedMessages] = useState<ChatMessage[] | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const prevMsgCountRef = useRef<number>(1);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'model',
            text: t.studio.welcomeMessage,
            timestamp: t.studio.now,
          },
        ];
      }
      return prev;
    });
  }, [locale, t.studio.welcomeMessage, t.studio.now]);

  useEffect(() => {
    return () => {
      if (copyPromptTimerRef.current !== null) window.clearTimeout(copyPromptTimerRef.current);
      if (copyAllTimerRef.current !== null) window.clearTimeout(copyAllTimerRef.current);
      if (copyMsgTimerRef.current !== null) window.clearTimeout(copyMsgTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && (messages.length > prevMsgCountRef.current || chatSending)) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      threadEndRef.current?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, chatSending, activeTab]);

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = activeTab === 'screenshot' ? 'chat' : 'screenshot';
      setActiveTab(next);
      (next === 'screenshot' ? tabScreenshotRef.current : tabChatRef.current)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab('screenshot');
      tabScreenshotRef.current?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab('chat');
      tabChatRef.current?.focus();
    }
  }

  function processSelectedFile(file: File) {
    setAnalysisError(null);
    setAnalysisResult(null);

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setAnalysisError(t.studio.errors.invalidFileType);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAnalysisError(t.studio.errors.fileTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewDataUrl(reader.result);
        setFileName(file.name || 'pasted-screenshot.png');
        setStatusAnnouncement(t.studio.announcements.screenshotLoaded);
      }
    };
    reader.onerror = () => {
      setAnalysisError(t.studio.errors.fileReadError);
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

  function handlePasteScreenshot(e: ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (file) {
      e.preventDefault();
      processSelectedFile(file);
    }
  }

  function handleLoadDemoScreenshot() {
    setAnalysisError(null);
    setAnalysisResult(null);
    const dataUrl = buildDemoBrokenAppScreenshot();
    if (!dataUrl) {
      setAnalysisError(t.studio.errors.demoFailed);
      return;
    }
    setPreviewDataUrl(dataUrl);
    setFileName('demo-checkout-preview.png');
    setBuilderTool('Bolt');
    if (!focusNote.trim()) {
      setFocusNote(t.studio.demoFocusDefault);
    }
    setStatusAnnouncement(t.studio.announcements.demoLoaded);
  }

  function handleClearScreenshot() {
    setPreviewDataUrl(null);
    setFileName(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatusAnnouncement(t.studio.announcements.screenshotRemoved);
  }

  async function handleAnalyzeScreenshot(e: FormEvent) {
    e.preventDefault();
    if (!previewDataUrl) {
      setAnalysisError(t.studio.errors.noScreenshot);
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const typed = await analyzeScreenshotLocally({
        imageDataUrl: previewDataUrl,
        builderTool,
        focusNote,
        isDemoScreenshot: fileName === 'demo-checkout-preview.png',
        locale,
      });
      setAnalysisResult(typed);
      setStatusAnnouncement(
        t.studio.announcements.auditComplete(
          t.studio.readinessLabels[typed.readinessStatus],
          typed.findings.length
        )
      );
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : t.studio.errors.auditFailed);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCopyText(text: string, onDone: () => void) {
    try {
      await navigator.clipboard.writeText(text);
      onDone();
      setStatusAnnouncement(t.studio.announcements.copied);
      return;
    } catch {
      // Fallback for restricted clipboard contexts
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) {
        onDone();
        setStatusAnnouncement(t.studio.announcements.copied);
      }
    } catch {
      // Ignore if clipboard is completely unavailable
    }
  }

  function handleAskAdvisorAboutFinding(finding: ScreenshotFinding) {
    const builderLabel = formatBuilderLabel(builderTool, locale);
    const categoryLabel = t.studio.categoryLabels[finding.category];
    const prompt = `${t.studio.askAdvisorPrefix} ${builderLabel}${t.studio.askAdvisorMiddle} « ${finding.title} » (${categoryLabel}) : ${finding.detail} ${t.studio.askAdvisorSuffix}`;
    setActiveTab('chat');
    setChatInput(prompt);
    window.setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  }

  async function sendChatMessage(rawText: string, isRetry = false) {
    const trimmed = rawText.trim();
    if (!trimmed || chatSending) return;

    setChatError(null);
    setFailedPrompt(null);
    setArchivedMessages(null);

    const timeLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    let nextHistory = messages;
    if (!isRetry) {
      const nowLabel = new Date().toLocaleTimeString(timeLocale, {
        hour: '2-digit',
        minute: '2-digit',
      });
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: nowLabel,
      };
      nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setChatInput('');
    }

    setChatSending(true);

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const reply = await askQAAdvisor({
        messages: apiMessages,
        builderContext: builderTool,
        locale,
      });

      const replyMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: reply.text,
        isExample: reply.isExample,
        timestamp: new Date().toLocaleTimeString(timeLocale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : t.studio.errors.chatFailed);
      setFailedPrompt(trimmed);
    } finally {
      setChatSending(false);
    }
  }

  function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    void sendChatMessage(chatInput);
  }

  function handleChatKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!chatSending && chatInput.trim()) {
        void sendChatMessage(chatInput);
      }
    }
  }

  useEffect(() => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [chatInput, activeTab]);

  function handleResetChat() {
    setChatError(null);
    setFailedPrompt(null);
    if (messages.length > 1) {
      setArchivedMessages(messages);
    }
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: t.studio.resetMessage,
        timestamp: t.studio.now,
      },
    ]);
  }

  function handleUndoResetChat() {
    if (!archivedMessages) return;
    setMessages(archivedMessages);
    setArchivedMessages(null);
    setChatError(null);
    setFailedPrompt(null);
  }

  return (
    <section
      id="live-audit"
      className="scroll-mt-20 py-20 lg:py-28 border-t border-slate-200 dark:border-slate-800/90 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-150"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.studio.heading}
            </h2>
            <p className="mt-4 max-w-[54ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.studio.subheading}
            </p>
          </div>

          {/* Interactive segmented tab control */}
          <div
            role="tablist"
            aria-label={t.studio.tablistAria}
            className="inline-flex flex-wrap items-center gap-1 p-1 max-w-full bg-slate-200/70 dark:bg-[#111827] border border-transparent dark:border-slate-800 rounded-lg self-start lg:self-auto"
          >
            <button
              ref={tabScreenshotRef}
              id="tab-screenshot"
              type="button"
              role="tab"
              aria-selected={activeTab === 'screenshot'}
              aria-controls="panel-screenshot"
              tabIndex={activeTab === 'screenshot' ? 0 : -1}
              onClick={() => setActiveTab('screenshot')}
              onKeyDown={handleTabKeyDown}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
                activeTab === 'screenshot'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-xs dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ScanSearch className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.studio.tabScreenshot}</span>
            </button>
            <button
              ref={tabChatRef}
              id="tab-chat"
              type="button"
              role="tab"
              aria-selected={activeTab === 'chat'}
              aria-controls="panel-chat"
              tabIndex={activeTab === 'chat' ? 0 : -1}
              onClick={() => setActiveTab('chat')}
              onKeyDown={handleTabKeyDown}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[40px] text-xs sm:text-sm font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-xs dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.studio.tabChat}</span>
            </button>
          </div>
        </div>

        {/* Tab Panel 1: Screenshot QA & Security Analyzer */}
        {activeTab === 'screenshot' && (
          <div
            id="panel-screenshot"
            role="tabpanel"
            aria-labelledby="tab-screenshot"
            onPaste={handlePasteScreenshot}
            className="mt-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Left: Upload & Controls */}
              <form
                onSubmit={handleAnalyzeScreenshot}
                className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6"
              >
                <div className="space-y-5">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <label
                        id="screenshot-upload-label"
                        htmlFor="screenshot-file-input"
                        className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]"
                      >
                        {t.studio.uploadLabel}
                      </label>
                      {!previewDataUrl ? (
                        <button
                          type="button"
                          onClick={handleLoadDemoScreenshot}
                          className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                        >
                          {t.studio.loadDemo}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleClearScreenshot}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer whitespace-nowrap py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.studio.remove}</span>
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      tabIndex={-1}
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
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setIsDragging(false);
                          }
                        }}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-labelledby="screenshot-upload-label"
                        aria-describedby="screenshot-upload-hint"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`p-7 border border-dashed rounded-lg text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
                          isDragging
                            ? 'border-[#1E40AF] dark:border-[#3B82F6] bg-[#1E40AF]/5 dark:bg-[#3B82F6]/10'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-[#F8FAFC] dark:bg-[#090D16]'
                        }`}
                      >
                        <Upload
                          className="w-6 h-6 text-slate-600 dark:text-slate-400 mx-auto mb-3"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                          {t.studio.dropTitle}
                        </p>
                        <p
                          id="screenshot-upload-hint"
                          className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
                        >
                          {t.studio.dropHint}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-[#090D16]">
                        <img
                          src={previewDataUrl}
                          alt={fileName || t.studio.uploadedAltFallback}
                          className="w-full max-h-60 object-contain bg-slate-100 dark:bg-[#090D16]"
                        />
                        <div className="px-3.5 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="truncate font-mono">{fileName}</span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline whitespace-nowrap shrink-0 cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                          >
                            {t.studio.replace}
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
                        {t.studio.builtWith}
                      </label>
                      <select
                        id="audit-builder-select"
                        value={builderTool}
                        onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                        className="w-full px-3 py-2.5 min-h-[42px] text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 cursor-pointer"
                      >
                        {BUILDERS.map((tool) => (
                          <option key={tool} value={tool}>
                            {formatBuilderLabel(tool, locale)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="audit-focus-input"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        {t.studio.focusArea}
                      </label>
                      <input
                        id="audit-focus-input"
                        type="text"
                        value={focusNote}
                        onChange={(e) => setFocusNote(e.target.value)}
                        placeholder={t.studio.focusPlaceholder}
                        maxLength={200}
                        className="w-full px-3 py-2.5 min-h-[42px] text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25"
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
                      <AlertTriangle
                        className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={analyzing || !previewDataUrl}
                    className="w-full px-5 py-3 min-h-[44px] text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                  >
                    {analyzing ? t.studio.inspecting : t.studio.runAudit}
                  </button>
                </div>
              </form>

              {/* Right: Structured Diagnostic Output */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col">
                {analyzing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                    <div
                      aria-hidden="true"
                      className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-[#1E40AF] dark:border-t-[#3B82F6] animate-spin mb-4"
                    />
                    <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {t.studio.checkingTitle}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                      {t.studio.checkingSubtitlePrefix}{' '}
                      {formatBuilderLabel(builderTool, locale)} {t.studio.checkingSubtitleSuffix}
                    </p>
                  </div>
                ) : !analysisResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-14 text-center">
                    <ImageIcon
                      className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-3"
                      aria-hidden="true"
                    />
                    <p
                      className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]"
                      style={{ textWrap: 'balance' }}
                    >
                      {t.studio.emptyTitle}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                      {t.studio.emptyDescBefore}{' '}
                      <button
                        type="button"
                        onClick={handleLoadDemoScreenshot}
                        className="font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                      >
                        {t.studio.loadDemo}
                      </button>{' '}
                      {t.studio.emptyDescAfter}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {analysisResult.isExample && (
                      <p className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{t.studio.exampleResultNotice}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <span>{analysisResult.checkedArea}</span>
                          <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
                            ·
                          </span>
                          <span>{formatBuilderLabel(builderTool, locale)}</span>
                          <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
                            ·
                          </span>
                          <span className="tabular-nums">
                            {analysisResult.findings.length}{' '}
                            {analysisResult.findings.length === 1
                              ? t.studio.findingSingular
                              : t.studio.findingPlural}
                          </span>
                        </p>
                        <h3 className="mt-1 font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {t.studio.auditSummary}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const bundle = analysisResult.findings
                              .map(
                                (f, idx) =>
                                  `${idx + 1}. [${t.studio.severityLabels[f.severity]} · ${t.studio.categoryLabels[f.category]}] ${f.title}\n${f.fixPrompt}`
                              )
                              .join('\n\n');
                            void handleCopyText(bundle, () => {
                              setCopiedAll(true);
                              copyAllTimerRef.current = window.setTimeout(
                                () => setCopiedAll(false),
                                2000
                              );
                            });
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                        >
                          {copiedAll ? (
                            <>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t.studio.copiedAllFixes}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t.studio.copyAllFixes}</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {analysisResult.readinessStatus === 'Ready to Ship' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                              <span>{t.studio.readinessLabels['Ready to Ship']}</span>
                            </span>
                          ) : analysisResult.readinessStatus === 'High Risk' ? (
                            <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                              <span>{t.studio.readinessLabels['High Risk']}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                              <span>{t.studio.readinessLabels['Needs Fixes']}</span>
                            </span>
                          )}
                        </div>
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
                              <SeverityIndicator
                                severity={finding.severity}
                                label={t.studio.severityLabels[finding.severity]}
                              />
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                                ·
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {t.studio.categoryLabels[finding.category]}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAskAdvisorAboutFinding(finding)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-[#1E40AF] dark:hover:text-[#60A5FA] cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t.studio.askAdvisor}</span>
                            </button>
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
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {t.studio.pasteInto} {formatBuilderLabel(builderTool, locale)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (copyPromptTimerRef.current !== null) {
                                    window.clearTimeout(copyPromptTimerRef.current);
                                  }
                                  void handleCopyText(finding.fixPrompt, () => {
                                    setCopiedIdx(idx);
                                    copyPromptTimerRef.current = window.setTimeout(
                                      () => setCopiedIdx(null),
                                      2000
                                    );
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#93C5FD] cursor-pointer whitespace-nowrap py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                              >
                                {copiedIdx === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>{t.studio.copied}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>{t.studio.copyFixPrompt}</span>
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
          <div
            id="panel-chat"
            role="tabpanel"
            aria-labelledby="tab-chat"
            className="mt-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
          >
            {/* Chat utility header */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#F8FAFC] dark:bg-[#0D1321]">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="w-7 h-7 rounded-lg bg-[#1E40AF]/10 dark:bg-[#3B82F6]/15 text-[#1E40AF] dark:text-[#60A5FA] inline-flex items-center justify-center shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {t.studio.advisorTitle}
                  </span>
                </div>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="chat-builder-select"
                    className="text-xs text-slate-600 dark:text-slate-400"
                  >
                    {t.studio.stackContext}
                  </label>
                  <select
                    id="chat-builder-select"
                    value={builderTool}
                    onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-[#090D16] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                  >
                    {BUILDERS.map((tool) => (
                      <option key={tool} value={tool}>
                        {formatBuilderLabel(tool, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {archivedMessages && (
                  <button
                    type="button"
                    onClick={handleUndoResetChat}
                    className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                  >
                    {t.studio.undoReset}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC] cursor-pointer whitespace-nowrap py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.studio.resetThread}</span>
                </button>
              </div>
            </div>

            {/* Scrollable conversation thread */}
            <div
              className="max-h-[480px] min-h-[320px] overflow-y-auto px-5 sm:px-6 py-6 space-y-6 bg-white dark:bg-[#111827]"
              aria-live="polite"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      {!isUser && (
                        <span
                          aria-hidden="true"
                          className="w-5 h-5 rounded-md bg-[#1E40AF]/10 dark:bg-[#3B82F6]/15 text-[#1E40AF] dark:text-[#60A5FA] inline-flex items-center justify-center"
                        >
                          <ShieldCheck className="w-3 h-3" />
                        </span>
                      )}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {isUser ? t.studio.you : t.studio.advisorName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                      {isUser && (
                        <span
                          aria-hidden="true"
                          className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-flex items-center justify-center"
                        >
                          <User className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {msg.isExample && (
                      <p className="mb-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        {t.studio.exampleReplyLabel}
                      </p>
                    )}

                    <div
                      className={`rounded-xl px-4 py-3.5 ${
                        isUser
                          ? 'max-w-[85%] sm:max-w-xl bg-[#1E40AF] dark:bg-[#2563EB] text-white'
                          : 'max-w-[92%] sm:max-w-2xl bg-[#F8FAFC] dark:bg-[#161F33] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        renderMessageLines(msg.text, {
                          copyLabel: t.studio.copySnippet,
                          copiedLabel: t.studio.copiedSnippet,
                          defaultLabel: t.studio.codeBlockLabel,
                          onCopied: () => setStatusAnnouncement(t.studio.copiedSnippet),
                        })
                      )}
                    </div>

                    {!isUser && msg.id !== 'welcome' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (copyMsgTimerRef.current !== null) {
                            window.clearTimeout(copyMsgTimerRef.current);
                          }
                          void handleCopyText(msg.text, () => {
                            setCopiedMsgId(msg.id);
                            setStatusAnnouncement(t.studio.copiedResponse);
                            copyMsgTimerRef.current = window.setTimeout(
                              () => setCopiedMsgId(null),
                              2000
                            );
                          });
                        }}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC] cursor-pointer py-1 px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check
                              className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                            <span>{t.studio.copiedResponse}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{t.studio.copy}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {chatSending && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-md bg-[#1E40AF]/10 dark:bg-[#3B82F6]/15 text-[#1E40AF] dark:text-[#60A5FA] inline-flex items-center justify-center"
                    >
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t.studio.advisorName}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#161F33] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-300 inline-flex items-center gap-3">
                    <span aria-hidden="true" className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] dark:bg-[#60A5FA] motion-safe:animate-pulse" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] dark:bg-[#60A5FA] motion-safe:animate-pulse"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] dark:bg-[#60A5FA] motion-safe:animate-pulse"
                        style={{ animationDelay: '300ms' }}
                      />
                    </span>
                    <span>{t.studio.preparingChecks}</span>
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>

            {/* Starter quick-prompts when conversation is fresh */}
            {messages.length <= 1 && (
              <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-[#F8FAFC]/60 dark:bg-[#0D1321]/70 flex flex-wrap gap-2">
                {t.studio.starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendChatMessage(prompt)}
                    disabled={chatSending}
                    className="text-left text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:border-[#1E40AF] dark:hover:border-[#3B82F6] hover:text-[#1E40AF] dark:hover:text-[#60A5FA] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Chat error + multiline composer */}
            <div className="p-4 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1321]">
              {chatError && (
                <div
                  role="alert"
                  className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-400"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{chatError}</span>
                  </span>
                  {failedPrompt && (
                    <button
                      type="button"
                      onClick={() => void sendChatMessage(failedPrompt, true)}
                      disabled={chatSending}
                      className="font-semibold underline underline-offset-4 hover:text-rose-900 dark:hover:text-rose-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 rounded-sm"
                    >
                      {t.studio.retryMessage}
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleChatSubmit} className="space-y-2">
                <div className="flex items-end gap-2.5">
                  <label htmlFor="advisor-chat-input" className="sr-only">
                    {t.studio.chatInputAria}
                  </label>
                  <textarea
                    ref={chatInputRef}
                    id="advisor-chat-input"
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder={`${t.studio.chatPlaceholderPrefix} ${formatBuilderLabel(
                      builderTool,
                      locale
                    )}${t.studio.chatPlaceholderSuffix}`}
                    maxLength={2000}
                    disabled={chatSending}
                    className="flex-1 min-w-0 px-4 py-2.5 min-h-[44px] max-h-36 resize-none text-sm leading-relaxed bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 overflow-y-auto"
                  />
                  <button
                    type="submit"
                    disabled={chatSending || !chatInput.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>{t.studio.send}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                  {t.studio.enterToSendHint}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                  {t.studio.chatPrivacyNote}
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
