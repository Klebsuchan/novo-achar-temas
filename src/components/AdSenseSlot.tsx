import { useEffect, useRef } from 'react';
import { getCookiePreferences } from '../utils/analytics';

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: 0 | 1 };
    __adsenseClientLoaded?: string;
  }
}

interface AdSenseSlotProps {
  slotId: string;
  format: 'leaderboard' | 'in-article' | 'sidebar' | 'multiplex';
  label?: string;
}

function getConfiguredAdSenseClient(): string {
  const raw = (import.meta.env.VITE_ADSENSE_CLIENT_ID || '').trim();
  if (/^ca-pub-\d{10,20}$/.test(raw) && raw !== 'ca-pub-0000000000000000') {
    return raw;
  }
  return '';
}

function resolveConfiguredSlotId(
  defaultSlotId: string,
  format: AdSenseSlotProps['format']
): string {
  const map: Record<AdSenseSlotProps['format'], string | undefined> = {
    leaderboard: import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD,
    'in-article': import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE,
    sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR,
    multiplex: import.meta.env.VITE_ADSENSE_SLOT_MULTIPLEX,
  };
  const override = (map[format] || '').trim();
  return override || defaultSlotId;
}

/**
 * Env-driven, CLS-safe Google AdSense container that respects LGPD cookie preferences
 * and dynamically loads adsbygoogle.js only when a real publisher ID is configured.
 */
export default function AdSenseSlot({
  slotId,
  format,
  label = 'Publicidade',
}: AdSenseSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const clientId = getConfiguredAdSenseClient();
  const resolvedSlotId = resolveConfiguredSlotId(slotId, format);

  useEffect(() => {
    if (!clientId) return;

    const prefs = getCookiePreferences();
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = prefs.personalizedAds ? 0 : 1;

    if (window.__adsenseClientLoaded !== clientId) {
      window.__adsenseClientLoaded = clientId;
      if (!document.querySelector(`script[data-adsense-client="${clientId}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
        script.dataset.adsenseClient = clientId;
        document.head.appendChild(script);
      }
    }

    if (!pushedRef.current && insRef.current) {
      try {
        pushedRef.current = true;
        window.adsbygoogle.push({});
      } catch {
        // Ignore duplicate push errors in strict mode
      }
    }
  }, [clientId, resolvedSlotId]);

  const minHeightClass = {
    leaderboard: 'min-h-[90px]',
    'in-article': 'min-h-[250px]',
    sidebar: 'min-h-[250px]',
    multiplex: 'min-h-[180px]',
  }[format];

  // When no production AdSense client ID is configured yet, keep layout clean without dummy ca-pub-0000 tags
  if (!clientId) {
    return (
      <aside
        aria-label={label}
        data-ad-slot={resolvedSlotId}
        data-ad-format={format}
        className="my-4 w-full"
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-1 font-mono">
          <span>{label}</span>
        </div>
        <div
          className={`w-full ${minHeightClass} rounded-xl md:rounded-sm border border-stone-200/70 dark:border-[#1B3358]/50 bg-[#ECE7DA]/40 dark:bg-[#09152B]/40 flex items-center justify-center`}
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 dark:text-slate-600">
            Espaço Editorial Patrocinado
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={label}
      data-ad-slot={resolvedSlotId}
      data-ad-format={format}
      className="my-5 w-full"
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-1 font-mono">
        <span>{label}</span>
      </div>
      <div
        className={`w-full ${minHeightClass} rounded-sm border border-stone-200/80 dark:border-[#1B3358]/60 bg-[#ECE7DA]/60 dark:bg-[#09152B]/60 flex items-center justify-center overflow-hidden`}
      >
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          data-ad-client={clientId}
          data-ad-slot={resolvedSlotId}
          data-ad-format={format === 'in-article' ? 'fluid' : 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
