import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { analyzeScreenshotWithGemini, chatWithGeminiAdvisor } from './server/geminiService.ts';
import { handleLeadsGet, handleLeadsPost, type LeadsEnv } from './server/leadsService.ts';

const MAX_JSON_BODY_BYTES = 12 * 1024 * 1024;

function readJsonRequest(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on('data', (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buf.length;
      if (totalBytes > MAX_JSON_BODY_BYTES) {
        reject(new Error('Request payload too large'));
        req.destroy();
        return;
      }
      chunks.push(buf);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function prooflineDevApiPlugin(apiKey: string | undefined, leadsEnv: LeadsEnv): Plugin {
  return {
    name: 'proofline-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/leads') {
          if (req.method === 'GET') {
            const result = await handleLeadsGet(leadsEnv);
            sendJson(res, result.status, result.body);
            return;
          }
          if (req.method === 'POST') {
            let body: unknown;
            try {
              body = await readJsonRequest(req);
            } catch {
              sendJson(res, 400, { error: 'Invalid JSON request body' });
              return;
            }
            const result = await handleLeadsPost(body, leadsEnv);
            sendJson(res, result.status, result.body);
            return;
          }
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        if (url !== '/api/analyze-screenshot' && url !== '/api/chat') {
          next();
          return;
        }
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        let body: unknown;
        try {
          body = await readJsonRequest(req);
        } catch {
          sendJson(res, 400, { error: 'Invalid JSON request body' });
          return;
        }

        const result =
          url === '/api/analyze-screenshot'
            ? await analyzeScreenshotWithGemini(body, apiKey)
            : await chatWithGeminiAdvisor(body, apiKey);

        sendJson(res, result.status, result.body);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverApiKey = env.GEMINI_API_KEY || env.AI_API_KEY;
  const leadsEnv: LeadsEnv = {
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: env.RESEND_API_KEY,
    resendFromEmail: env.RESEND_FROM_EMAIL,
    resendReplyTo: env.RESEND_REPLY_TO,
  };

  return {
    plugins: [react(), tailwindcss(), prooflineDevApiPlugin(serverApiKey, leadsEnv)],
  };
});
