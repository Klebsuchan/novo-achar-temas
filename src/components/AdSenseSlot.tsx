interface AdSenseSlotProps {
  slotId: string;
  format: 'leaderboard' | 'in-article' | 'sidebar' | 'multiplex';
  label?: string;
}

/**
 * Clean, CLS-safe Google AdSense container for production readers.
 * Zero internal publisher configuration prompts or diagnostic text are exposed to readers.
 */
export default function AdSenseSlot({
  slotId,
  format,
  label = 'Publicidade',
}: AdSenseSlotProps) {
  const minHeightClass = {
    leaderboard: 'min-h-[90px]',
    'in-article': 'min-h-[250px]',
    sidebar: 'min-h-[250px]',
    multiplex: 'min-h-[180px]',
  }[format];

  return (
    <aside
      aria-label={label}
      data-ad-slot={slotId}
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
          className="adsbygoogle block w-full"
          data-ad-client="ca-pub-0000000000000000"
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
