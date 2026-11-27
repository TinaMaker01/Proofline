import type { IncomingMessage, ServerResponse } from 'node:http';
import { chatWithGeminiAdvisor } from '../server/geminiService.js';
import { rejectIfRateLimited } from '../server/rateLimit.js';

interface ServerlessRequest extends IncomingMessage {
  body?: unknown;
}

async function readJsonBody(req: ServerlessRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    return req.body;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf-8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: ServerlessRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  if (rejectIfRateLimited('chat', req, res)) return;

  let body: unknown = {};
  try {
    body = await readJsonBody(req);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
    return;
  }

  const result = await chatWithGeminiAdvisor(body);
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.body));
}
