declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaLoadedId?: string;
  }
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalizedAds: boolean;
}

export function getCookiePreferences(): CookiePreferences {
  try {
    const raw = localStorage.getItem('achar_temas_cookie_prefs');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
      return {
        essential: true,
        analytics: parsed.analytics !== false,
        personalizedAds: parsed.personalizedAds !== false,
      };
    }
  } catch {
    // ignore storage errors
  }
  return { essential: true, analytics: true, personalizedAds: true };
}

function getMeasurementId(): string {
  const id = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
  return /^G-[A-Z0-9]{6,}$/i.test(id) ? id : '';
}

export function initAnalyticsIfAllowed(): void {
  const measurementId = getMeasurementId();
  if (!measurementId) return;

  const prefs = getCookiePreferences();
  if (!prefs.analytics) return;

  if (window.__gaLoadedId === measurementId) return;
  window.__gaLoadedId = measurementId;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: false,
  });

  if (!document.querySelector(`script[data-ga-id="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.gaId = measurementId;
    document.head.appendChild(script);
  }
}

export function updateAnalyticsConsent(enabled: boolean): void {
  const measurementId = getMeasurementId();
  if (!measurementId) return;
  if (enabled) {
    initAnalyticsIfAllowed();
  }
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: enabled ? 'granted' : 'denied',
    });
  }
}

export function trackPageView(pagePath: string, pageTitle: string): void {
  const measurementId = getMeasurementId();
  if (!measurementId || !getCookiePreferences().analytics) return;
  initAnalyticsIfAllowed();
  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

export function trackArticleRead(postId: number, title: string, category: string): void {
  const measurementId = getMeasurementId();
  if (!measurementId || !getCookiePreferences().analytics) return;
  window.gtag?.('event', 'article_read', {
    article_id: postId,
    article_title: title,
    article_category: category,
  });
}

export function trackGameEvent(
  gameType: string,
  action: 'start' | 'score',
  score?: number
): void {
  const measurementId = getMeasurementId();
  if (!measurementId || !getCookiePreferences().analytics) return;
  window.gtag?.('event', action === 'start' ? 'game_start' : 'post_score', {
    game_type: gameType,
    ...(typeof score === 'number' ? { score } : {}),
  });
}

export function trackStoreOutbound(collectionId: string): void {
  const measurementId = getMeasurementId();
  if (!measurementId || !getCookiePreferences().analytics) return;
  window.gtag?.('event', 'select_promotion', {
    promotion_id: collectionId,
    creative_slot: 'store_shopee',
  });
}
