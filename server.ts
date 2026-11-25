import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type, type Content } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Primary AI model (supports multimodal image understanding & multi-turn chat)
const AI_MODEL = 'gemini-4-hydrogen';

const ALLOWED_BUILDER_TOOLS = new Set([
  'Lovable',
  'Bolt',
  'Cursor',
  'Replit',
  'v0',
  'Other',
]);

const ALLOWED_IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB decoded limit

const DATA_DIR = path.resolve(process.cwd(), 'data');
const WAITLIST_FILE = path.resolve(DATA_DIR, 'waitlist.json');

interface WaitlistRecord {
  email: string;
  builderTool: string;
  appUrl: string | null;
  painPoint: string | null;
  source: string;
  createdAt: string;
}

function getGenAIClient(): GoogleGenAI {
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY)?.trim();
  if (!apiKey) {
    throw Object.assign(
      new Error(
        'AI API key is not configured. Add AI_API_KEY in your environment variables to run live audits.'
      ),
      { statusCode: 503 }
    );
  }
  return new GoogleGenAI({
    apiKey,
  });
}

function readWaitlistRecords(): WaitlistRecord[] {
  try {
    if (!fs.existsSync(WAITLIST_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(WAITLIST_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWaitlistRecords(records: WaitlistRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const resolved = path.resolve(WAITLIST_FILE);
  if (!resolved.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid storage path');
  }
  fs.writeFileSync(resolved, JSON.stringify(records, null, 2), 'utf-8');
}

function isValidEmail(email: string): boolean {
  if (email.length < 5 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function sanitizeHttpUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.length > 500) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname.includes('.')) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function formatAIError(err: unknown): { status: number; message: string } {
  const errorObj = err as { status?: number; statusCode?: number; message?: string };
  const rawMessage = typeof errorObj?.message === 'string' ? errorObj.message : '';
  const status = errorObj?.statusCode || errorObj?.status || 500;

  if (status === 503 && rawMessage.includes('AI_API_KEY')) {
    return { status: 503, message: rawMessage };
  }
  if (rawMessage.includes('API_KEY_INVALID') || status === 401 || status === 403) {
    return {
      status: 403,
      message:
        'Your API key could not be verified. Please check your AI_API_KEY configuration.',
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
    return {
      status: 429,
      message:
        'Rate limit reached for the current API key. Wait a moment and try again.',
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    message:
      'The live analysis request could not be completed right now. Please try again in a moment.',
  };
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Aggregate waitlist count only — never expose subscriber emails publicly
  app.get('/api/waitlist/stats', (_req, res) => {
    const records = readWaitlistRecords();
    const byTool: Record<string, number> = {};
    for (const r of records) {
      byTool[r.builderTool] = (byTool[r.builderTool] || 0) + 1;
    }
    res.json({
      totalCount: records.length,
      byTool,
    });
  });

  app.post('/api/waitlist', (req, res) => {
    const body = req.body ?? {};
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!isValidEmail(rawEmail)) {
      return res.status(400).json({ error: 'Please enter a valid work or personal email address.' });
    }

    const rawTool = typeof body.builderTool === 'string' ? body.builderTool.trim() : 'Lovable';
    const builderTool = ALLOWED_BUILDER_TOOLS.has(rawTool) ? rawTool : 'Other';

    let appUrl: string | null = null;
    if (typeof body.appUrl === 'string' && body.appUrl.trim().length > 0) {
      appUrl = sanitizeHttpUrl(body.appUrl);
      if (!appUrl) {
        return res.status(400).json({
          error: 'Please enter a valid http or https URL (for example, myapp.lovable.app).',
        });
      }
    }

    const painPoint =
      typeof body.painPoint === 'string' && body.painPoint.trim().length > 0
        ? body.painPoint.trim().slice(0, 240)
        : null;

    const source = body.source === 'hero' ? 'hero' : 'waitlist-section';

    const records = readWaitlistRecords();
    const existing = records.find((r) => r.email === rawEmail);
    if (existing) {
      // Update optional details if the user came back with more context
      if (appUrl && !existing.appUrl) existing.appUrl = appUrl;
      if (painPoint && !existing.painPoint) existing.painPoint = painPoint;
      if (builderTool !== 'Other') existing.builderTool = builderTool;
      writeWaitlistRecords(records);

      return res.status(200).json({
        ok: true,
        alreadyRegistered: true,
        entry: {
          email: existing.email,
          builderTool: existing.builderTool,
          createdAt: existing.createdAt,
        },
        totalCount: records.length,
      });
    }

    const newRecord: WaitlistRecord = {
      email: rawEmail,
      builderTool,
      appUrl,
      painPoint,
      source,
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    writeWaitlistRecords(records);

    return res.status(201).json({
      ok: true,
      alreadyRegistered: false,
      entry: {
        email: newRecord.email,
        builderTool: newRecord.builderTool,
        createdAt: newRecord.createdAt,
      },
      totalCount: records.length,
    });
  });

  // Multimodal Screenshot QA & Security Audit endpoint
  app.post('/api/analyze-screenshot', async (req, res) => {
    try {
      const body = req.body ?? {};
      const rawDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
      const builderTool =
        typeof body.builderTool === 'string' && ALLOWED_BUILDER_TOOLS.has(body.builderTool)
          ? body.builderTool
          : 'Lovable';
      const focusNote =
        typeof body.focusNote === 'string' ? body.focusNote.trim().slice(0, 500) : '';

      const match = rawDataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        return res.status(400).json({
          error: 'Please upload a valid PNG, JPEG, or WebP screenshot.',
        });
      }

      const mimeType = match[1];
      const base64Data = match[2];

      if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
        return res.status(400).json({ error: 'Unsupported image format. Use PNG, JPEG, or WebP.' });
      }

      const byteLength = Buffer.byteLength(base64Data, 'base64');
      if (byteLength === 0 || byteLength > MAX_IMAGE_BYTES) {
        return res.status(400).json({
          error: 'Image must be smaller than 8 MB.',
        });
      }

      const ai = getGenAIClient();

      const promptText = [
        `Inspect this screenshot of an app built with ${builderTool}.`,
        focusNote
          ? `The creator specifically asked to check: "${focusNote}".`
          : 'Identify the highest-impact security exposures, broken user flows, layout bugs, and accessibility issues visible in this screenshot.',
        'For every finding, write a concise plain-English explanation for a non-technical founder and a concrete, copy-ready fixPrompt they can paste directly into their AI coding tool.',
        'Return between 2 and 5 specific findings grounded strictly in what is actually visible in the screenshot.',
      ].join(' ');

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: promptText },
          ],
        },
        config: {
          systemInstruction:
            'You are Proofline, a senior QA and application security auditor helping non-technical founders ship reliable apps built with Lovable, Bolt, Cursor, and Replit. Be concrete, honest, calm, and directly tied to visual evidence in the uploaded image. Avoid hype or generic filler.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description:
                  'A clear 2-sentence executive summary of what was observed and the top priority before shipping.',
              },
              readinessStatus: {
                type: Type.STRING,
                description: 'Must be exactly one of: Ready to Ship, Needs Fixes, High Risk',
              },
              checkedArea: {
                type: Type.STRING,
                description:
                  'Short description of the screen type identified (e.g., Checkout Modal, Auth Form, Admin Dashboard).',
              },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: {
                      type: Type.STRING,
                      description: 'Must be exactly one of: Critical, Warning, Suggestion',
                    },
                    category: {
                      type: Type.STRING,
                      description:
                        'Must be exactly one of: Security, Broken Flow, Layout & UX, Accessibility',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Short plain-English title of the issue.',
                    },
                    detail: {
                      type: Type.STRING,
                      description:
                        'Specific explanation of why this hurts users or exposes data, referencing what is seen.',
                    },
                    fixPrompt: {
                      type: Type.STRING,
                      description:
                        'A ready-to-paste prompt instruction for Lovable, Bolt, or Cursor to fix this exact issue.',
                    },
                  },
                  required: ['severity', 'category', 'title', 'detail', 'fixPrompt'],
                },
              },
            },
            required: ['summary', 'readinessStatus', 'checkedArea', 'findings'],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        return res.status(502).json({
          error: 'No diagnostic output was returned. Please try another screenshot.',
        });
      }

      const parsed = JSON.parse(rawJson);
      return res.json(parsed);
    } catch (err) {
      const formatted = formatAIError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Multi-turn QA & Security Advisor Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const body = req.body ?? {};
      const rawMessages = Array.isArray(body.messages) ? body.messages : [];
      const builderContext =
        typeof body.builderContext === 'string' && ALLOWED_BUILDER_TOOLS.has(body.builderContext)
          ? body.builderContext
          : 'Lovable / Bolt / Cursor';

      if (rawMessages.length === 0 || rawMessages.length > 30) {
        return res.status(400).json({
          error: 'Please enter a message to start or continue the conversation.',
        });
      }

      const sanitized: Array<{ role: 'user' | 'model'; text: string }> = rawMessages
        .filter(
          (m: unknown): m is { role: 'user' | 'model'; text: string } =>
            typeof m === 'object' &&
            m !== null &&
            ((m as { role?: unknown }).role === 'user' ||
              (m as { role?: unknown }).role === 'model') &&
            typeof (m as { text?: unknown }).text === 'string' &&
            (m as { text: string }).text.trim().length > 0
        )
        .map((m: { role: 'user' | 'model'; text: string }) => ({
          role: m.role,
          text: m.text.trim().slice(0, 4000),
        }));

      if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
        return res.status(400).json({
          error: 'The latest turn must be a non-empty user message.',
        });
      }

      const history: Content[] = sanitized.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      const latestUserMessage = sanitized[sanitized.length - 1].text;

      const ai = getGenAIClient();
      const chat = ai.chats.create({
        model: AI_MODEL,
        history,
        config: {
          systemInstruction: [
            'You are Proofline’s QA & Security Advisor, helping non-technical creators and lean startup founders test, secure, and fix apps built with AI coding tools like Lovable, Bolt, Cursor, Replit, and v0.',
            `Current builder context: ${builderContext}.`,
            'Style guidelines:',
            '- Speak in clear, direct, plain English without intimidating jargon.',
            '- Give concrete step-by-step checks and, whenever helpful, include a short copy-ready prompt the creator can paste directly into their AI builder to resolve the bug or lock down exposure.',
            '- Keep responses concise (typically 3-6 short paragraphs or tight bullet points) so they are easy to act on immediately.',
            '- Never claim to have directly accessed a live URL unless the user pasted logs or details.',
          ].join('\n'),
        },
      });

      const response = await chat.sendMessage({
        message: latestUserMessage,
      });

      const reply = (response.text ?? '').trim();
      if (!reply) {
        return res.status(502).json({
          error: 'Empty response from assistant. Please ask again.',
        });
      }

      return res.json({ reply });
    } catch (err) {
      const formatted = formatAIError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (IS_PROD) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proofline server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Proofline server:', err);
  process.exit(1);
});
