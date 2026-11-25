import type { UtmParams } from '../types/qa';

const UTM_STORAGE_KEY = 'proofline-utm-session';

export function captureUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh: UtmParams = {
      utmSource: params.get('utm_source')?.trim() || undefined,
      utmMedium: params.get('utm_medium')?.trim() || undefined,
      utmCampaign: params.get('utm_campaign')?.trim() || undefined,
      utmContent: params.get('utm_content')?.trim() || undefined,
      utmTerm: params.get('utm_term')?.trim() || undefined,
      referrer: document.referrer || undefined,
    };

    const hasNew = Boolean(
      fresh.utmSource || fresh.utmMedium || fresh.utmCampaign || fresh.utmContent || fresh.utmTerm
    );
    if (hasNew) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const saved = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as UtmParams;
    }
    return fresh;
  } catch {
    return {};
  }
}
