import { GoogleGenAI, Type, type Content } from '@google/genai';

const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

function getCandidateModels(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured) return FALLBACK_MODELS;
  return [configured, ...FALLBACK_MODELS.filter((m) => m !== configured)];
}

async function runWithModelFallback<T>(
  fn: (model: string) => Promise<T>
): Promise<T> {
  const models = getCandidateModels();
  let lastErr: unknown;
  for (const model of models) {
    try {
      return await fn(model);
    } catch (err) {
      lastErr = err;
      const status =
        (err as { statusCode?: number; status?: number })?.statusCode ??
        (err as { statusCode?: number; status?: number })?.status;
      if (status !== 503 && status !== 404) {
        throw err;
      }
    }
  }
  throw lastErr;
}

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

export type ApiLocale = 'fr' | 'en';

export interface ApiServiceResult {
  status: number;
  body: Record<string, unknown>;
}

function getGenAIClient(apiKey?: string): GoogleGenAI {
  const trimmed = (apiKey || process.env.GEMINI_API_KEY || process.env.AI_API_KEY)?.trim();
  if (!trimmed) {
    throw Object.assign(
      new Error(
        'GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in .env.local to run live audits.'
      ),
      { statusCode: 503 }
    );
  }
  return new GoogleGenAI({ apiKey: trimmed });
}

function formatAIError(err: unknown, locale: ApiLocale): ApiServiceResult {
  const errorObj = err as { status?: number; statusCode?: number; message?: string };
  const rawMessage = typeof errorObj?.message === 'string' ? errorObj.message : '';
  const status = errorObj?.statusCode || errorObj?.status || 500;

  if (status === 503 && rawMessage.includes('GEMINI_API_KEY')) {
    return { status: 503, body: { error: rawMessage } };
  }
  if (rawMessage.includes('API_KEY_INVALID') || status === 401 || status === 403) {
    return {
      status: 403,
      body: {
        error:
          locale === 'fr'
            ? 'Ta clé API Google AI Studio n’a pas pu être vérifiée. Contrôle GEMINI_API_KEY dans .env.local.'
            : 'Your Google AI Studio API key could not be verified. Please check GEMINI_API_KEY in .env.local.',
      },
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
    return {
      status: 429,
      body: {
        error:
          locale === 'fr'
            ? 'Limite de requêtes atteinte pour ta clé API. Patiente quelques instants et réessaie.'
            : 'Rate limit reached for the current API key. Wait a moment and try again.',
      },
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    body: {
      error:
        locale === 'fr'
          ? 'La requête d’analyse en direct n’a pas pu aboutir pour le moment. Réessaie dans un instant.'
          : 'The live analysis request could not be completed right now. Please try again in a moment.',
    },
  };
}

export async function analyzeScreenshotWithGemini(
  rawBody: unknown,
  apiKey?: string
): Promise<ApiServiceResult> {
  const body = (rawBody ?? {}) as Record<string, unknown>;
  const locale: ApiLocale = body.locale === 'en' ? 'en' : 'fr';

  try {
    const rawDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
    const builderTool =
      typeof body.builderTool === 'string' && ALLOWED_BUILDER_TOOLS.has(body.builderTool)
        ? body.builderTool
        : 'Lovable';
    const focusNote =
      typeof body.focusNote === 'string' ? body.focusNote.trim().slice(0, 500) : '';

    const match = rawDataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      return {
        status: 400,
        body: {
          error:
            locale === 'fr'
              ? 'Importe une capture PNG, JPEG ou WebP valide.'
              : 'Please upload a valid PNG, JPEG, or WebP screenshot.',
        },
      };
    }

    const mimeType = match[1];
    const base64Data = match[2];

    if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
      return {
        status: 400,
        body: {
          error:
            locale === 'fr'
              ? 'Format non pris en charge. Utilisez PNG, JPEG ou WebP.'
              : 'Unsupported image format. Use PNG, JPEG, or WebP.',
        },
      };
    }

    const byteLength = Buffer.byteLength(base64Data, 'base64');
    if (byteLength === 0 || byteLength > MAX_IMAGE_BYTES) {
      return {
        status: 400,
        body: {
          error:
            locale === 'fr'
              ? 'L’image doit faire moins de 8 Mo.'
              : 'Image must be smaller than 8 MB.',
        },
      };
    }

    const ai = getGenAIClient(apiKey);
    const languageDirective =
      locale === 'fr'
        ? 'Write summary, checkedArea, title, detail, and fixPrompt in clear, natural French (keep AI tool names like Lovable, Bolt, Cursor, Replit, v0 and technical identifiers untouched). Keep readinessStatus, severity, and category strictly as the exact English enum values specified in the schema.'
        : 'Write summary, checkedArea, title, detail, and fixPrompt in clear, plain English.';

    const promptText = [
      `Inspect this screenshot of an app built with ${builderTool}.`,
      focusNote
        ? `The creator specifically asked to check: "${focusNote}".`
        : 'Identify the highest-impact security exposures, broken user flows, layout bugs, and accessibility issues visible in this screenshot.',
      'For every finding, write a concise plain-language explanation for a non-technical founder and a concrete, copy-ready fixPrompt they can paste directly into their AI coding tool.',
      'Return between 2 and 5 specific findings grounded strictly in what is actually visible in the screenshot.',
      languageDirective,
    ].join(' ');

    const response = await runWithModelFallback((model) =>
      ai.models.generateContent({
        model,
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
                      description: 'Short plain-language title of the issue.',
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
      })
    );

    const rawJson = (response.text ?? '').trim();
    if (!rawJson) {
      return {
        status: 502,
        body: {
          error:
            locale === 'fr'
              ? 'Aucun diagnostic n’a été retourné. Essayez avec une autre capture.'
              : 'No diagnostic output was returned. Please try another screenshot.',
        },
      };
    }

    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    return { status: 200, body: parsed };
  } catch (err) {
    return formatAIError(err, locale);
  }
}

export async function chatWithGeminiAdvisor(
  rawBody: unknown,
  apiKey?: string
): Promise<ApiServiceResult> {
  const body = (rawBody ?? {}) as Record<string, unknown>;
  const locale: ApiLocale = body.locale === 'en' ? 'en' : 'fr';

  try {
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const builderContext =
      typeof body.builderContext === 'string' && ALLOWED_BUILDER_TOOLS.has(body.builderContext)
        ? body.builderContext
        : 'Lovable / Bolt / Cursor';

    if (rawMessages.length === 0 || rawMessages.length > 30) {
      return {
        status: 400,
        body: {
          error:
            locale === 'fr'
              ? 'Saisis un message pour démarrer ou poursuivre l’échange.'
              : 'Please enter a message to start or continue the conversation.',
        },
      };
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
      return {
        status: 400,
        body: {
          error:
            locale === 'fr'
              ? 'Le dernier message doit être une question utilisateur non vide.'
              : 'The latest turn must be a non-empty user message.',
        },
      };
    }

    const history: Content[] = sanitized.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
    const latestUserMessage = sanitized[sanitized.length - 1].text;

    const ai = getGenAIClient(apiKey);
    const systemInstruction = [
      'You are Proofline’s QA & Security Advisor, helping non-technical creators and lean startup founders test, secure, and fix apps built with AI coding tools like Lovable, Bolt, Cursor, Replit, and v0.',
      `Current builder context: ${builderContext}.`,
      locale === 'fr'
        ? 'Respond in clear, natural French using informal "tu" (tutoiement: tu, ton, ta, tes) to match Proofline’s calm, direct voice, while keeping AI tool names (Lovable, Bolt, Cursor, Replit, v0) and code identifiers unchanged.'
        : 'Respond in clear, direct, plain English without intimidating jargon.',
      'Style guidelines:',
      '- Give concrete step-by-step checks and, whenever helpful, include a short copy-ready prompt in a fenced code block that the creator can paste directly into their AI builder.',
      '- Keep responses concise (typically 3-6 short paragraphs or tight bullet points) so they are easy to act on immediately.',
      '- Never claim to have directly accessed a live URL unless the user pasted logs or details.',
    ].join('\n');

    const response = await runWithModelFallback((model) => {
      const chat = ai.chats.create({
        model,
        history,
        config: { systemInstruction },
      });
      return chat.sendMessage({
        message: latestUserMessage,
      });
    });

    const reply = (response.text ?? '').trim();
    if (!reply) {
      return {
        status: 502,
        body: {
          error:
            locale === 'fr'
              ? 'Réponse vide du conseiller. Réessaie.'
              : 'Empty response from assistant. Please ask again.',
        },
      };
    }

    return { status: 200, body: { reply } };
  } catch (err) {
    return formatAIError(err, locale);
  }
}
