import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Limitation de requêtes en mémoire, pour protéger le quota Gemini.
 *
 * Portée : une instance serverless à la fois. Les compteurs repartent à zéro au
 * démarrage d’une instance et ne sont pas partagés entre instances : cela freine
 * les abus simples, sans remplacer une règle de pare-feu ou un stockage partagé.
 */
interface RateLimitRule {
  /** Requêtes admises par adresse IP sur la fenêtre. */
  perClient: number;
  /** Requêtes admises toutes adresses confondues sur la fenêtre. */
  total: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  chat: { perClient: 10, total: 60, windowMs: 60_000 },
  screenshot: { perClient: 4, total: 20, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

const hits = new Map<string, number[]>();

function recent(key: string, now: number, windowMs: number): number[] {
  return (hits.get(key) ?? []).filter((time) => now - time < windowMs);
}

/** Renvoie 0 si la requête passe, sinon le nombre de secondes à attendre. */
export function consumeRateLimit(
  scope: keyof typeof RATE_LIMITS,
  clientId: string,
  now = Date.now()
): number {
  const { perClient, total, windowMs } = RATE_LIMITS[scope];

  // Évite que la table grossisse sans fin avec des adresses inactives.
  if (hits.size > 1000) {
    for (const [key, times] of hits) {
      if (now - times[times.length - 1] >= windowMs) hits.delete(key);
    }
  }

  const clientKey = `${scope}:client:${clientId}`;
  const totalKey = `${scope}:total`;
  const clientHits = recent(clientKey, now, windowMs);
  const totalHits = recent(totalKey, now, windowMs);

  const blocking =
    clientHits.length >= perClient ? clientHits : totalHits.length >= total ? totalHits : null;
  if (blocking) {
    return Math.max(1, Math.ceil((blocking[0] + windowMs - now) / 1000));
  }

  hits.set(clientKey, [...clientHits, now]);
  hits.set(totalKey, [...totalHits, now]);
  return 0;
}

// Vercel réécrit ces en-têtes : le visiteur ne peut pas choisir sa propre adresse.
function readClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-real-ip'] ?? req.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

/** Répond 429 et renvoie `true` quand la requête dépasse la limite. */
export function rejectIfRateLimited(
  scope: keyof typeof RATE_LIMITS,
  req: IncomingMessage,
  res: ServerResponse
): boolean {
  const retryAfter = consumeRateLimit(scope, readClientIp(req));
  if (retryAfter === 0) return false;

  // La langue vient de l’en-tête : le corps n’est pas lu pour une requête refusée.
  const french = !req.headers['accept-language']?.toLowerCase().startsWith('en');
  res.statusCode = 429;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Retry-After', String(retryAfter));
  res.end(
    JSON.stringify({
      error: french
        ? `Trop de demandes. Réessaie dans ${retryAfter} s.`
        : `Too many requests. Try again in ${retryAfter}s.`,
    })
  );
  return true;
}
