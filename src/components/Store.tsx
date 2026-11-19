import { useState } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Cpu,
  Home,
} from 'lucide-react';
import { trackStoreOutbound } from '../utils/analytics';

interface CuratedCollection {
  id: string;
  category: string;
  title: string;
  description: string;
  highlightItem: string;
  image: string;
  searchQuery: string;
}

function buildShopeeAffiliateUrl(queryText: string, campaignId: string): string {
  const tag = (import.meta.env.VITE_SHOPEE_AFFILIATE_TAG || 'achartemas').trim();
  const baseUrl = `https://shopee.com.br/search?keyword=${encodeURIComponent(queryText)}`;
  const params = new URLSearchParams({
    utm_source: tag,
    utm_medium: 'vitrine_editorial',
    utm_campaign: campaignId,
  });
  return `${baseUrl}&${params.toString()}`;
}

function getMainStoreUrl(): string {
  const configured = (import.meta.env.VITE_SHOPEE_STORE_URL || '').trim();
  if (configured.startsWith('https://')) return configured;
  return buildShopeeAffiliateUrl('organizacao leitura casa iluminacao', 'vitrine_principal');
}

const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'leitura-estudo',
    category: 'Leitura & Escritório',
    title: 'Luminárias de Mesa, Suportes Ergonômicos e Organização Editorial',
    description:
      'Acessórios selecionados para transformar seu ambiente de leitura, pesquisa histórica e trabalho remoto com conforto visual e foco.',
    highlightItem: 'Luminária LED articulada + Suporte de livros em madeira',
    image: '/wp-images/content-574-image-3.jpg',
    searchQuery: 'luminaria mesa led suporte livro ergonomico escritorio',
  },
  {
    id: 'casa-acabamentos',
    category: 'Casa & Reforma Inteligente',
    title: 'Ferramentas DIY, Iluminação Ambiente e Acabamentos Econômicos',
    description:
      'Inspirado nos nossos artigos mais lidos de arquitetura e formas caseiras: itens práticos para renovar ambientes sem obras pesadas.',
    highlightItem: 'Fitas LED inteligentes, moldes decorativos e organizadores',
    image: '/src/assets/images/acabamentos_inteligentes_casa_1795095031186.jpg',
    searchQuery: 'kit ferramentas casa organizador fita led reforma',
  },
  {
    id: 'cultura-colecionaveis',
    category: 'Cultura Pop & Música',
    title: 'Itens Nostálgicos Anos 80/90, Vinil, Decoração Geek e Áudio',
    description:
      'Para fãs de He-Man, Grunge dos anos 90, heróis clássicos e acústica: peças de decoração e fones de alta fidelidade.',
    highlightItem: 'Quadros retrô, action figures e equipamentos de áudio',
    image: '/wp-images/content-400-image-4.jpg',
    searchQuery: 'fone ouvido bluetooth quadro retro colecionaveis decoracao',
  },
  {
    id: 'jardim-bem-estar',
    category: 'Jardim, Botânica & Esporte',
    title: 'Cultivo de Ervas em Casa, Jardinagem e Acessórios para Corrida',
    description:
      'Tudo para montar sua espiral de ervas aromáticas, cuidar do jardim e acompanhar seus treinos de corrida e natação.',
    highlightItem: 'Kits de cultivo orgânico, vasos autodrenantes e hidratação',
    image: '/wp-images/content-650-image-2.jpg',
    searchQuery: 'vaso autodrenante sementes temperos garrafa corrida esporte',
  },
];

export default function Store() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredCollections =
    selectedFilter === 'all'
      ? CURATED_COLLECTIONS
      : CURATED_COLLECTIONS.filter((item) => item.id === selectedFilter);

  return (
    <section className="w-full px-4 sm:px-4 lg:px-5 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#081224] text-[#081224] dark:text-[#F4F0E6] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-10 lg:p-12 mb-5 sm:mb-10 shadow-xs md:shadow-none">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-2 sm:mb-3">
            <span>Vitrine Oficial Achar Temas</span>
            <span aria-hidden="true">·</span>
            <span>Catálogo Shopee Integrado</span>
          </div>
          <h1
            className="font-display text-2xl sm:text-5xl font-black uppercase text-[#081224] dark:text-white tracking-tight mb-3 sm:mb-4 leading-[1.04]"
            style={{ textWrap: 'balance' }}
          >
            Achados Curados para Mentes Curiosas, Casa e Leitura
          </h1>
          <p className="text-sm sm:text-lg text-stone-600 dark:text-slate-300 leading-relaxed mb-5 sm:mb-8">
            Nossa vitrine na Shopee reúne seleções práticas alinhadas aos temas do portal:
            organização de escritório, iluminação, jardinagem, reforma econômica e cultura pop.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <a
              href={getMainStoreUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStoreOutbound('vitrine_principal')}
              className="min-h-[44px] inline-flex items-center justify-center gap-2.5 bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl md:rounded-sm font-display font-extrabold uppercase tracking-wider text-xs transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag size={17} />
              <span>Acessar Vitrine Oficial na Shopee</span>
              <ExternalLink size={15} />
            </a>
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-slate-300">
              <ShieldCheck size={16} className="text-[#0EA5E9] dark:text-[#38BDF8] shrink-0" />
              <span>Transação 100% processada com Garantia Shopee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter Tabs (Horizontal swipe strip on mobile) */}
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-8">
        <div
          role="tablist"
          aria-label="Filtrar coleções da loja"
          className="flex sm:flex-wrap items-center gap-1.5 p-1 bg-stone-200/80 dark:bg-[#0B1930] rounded-2xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] overflow-x-auto no-scrollbar w-full sm:w-auto max-w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
            }`}
          >
            Todas (4)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === 'leitura-estudo'}
            onClick={() => setSelectedFilter('leitura-estudo')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              selectedFilter === 'leitura-estudo'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Leitura & Estudo</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === 'casa-acabamentos'}
            onClick={() => setSelectedFilter('casa-acabamentos')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              selectedFilter === 'casa-acabamentos'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
            }`}
          >
            <Home size={13} />
            <span>Casa & Reforma</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === 'cultura-colecionaveis'}
            onClick={() => setSelectedFilter('cultura-colecionaveis')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              selectedFilter === 'cultura-colecionaveis'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
            }`}
          >
            <Cpu size={13} />
            <span>Cultura Pop & Áudio</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === 'jardim-bem-estar'}
            onClick={() => setSelectedFilter('jardim-bem-estar')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedFilter === 'jardim-bem-estar'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
            }`}
          >
            Jardim & Esporte
          </button>
        </div>
      </div>

      {/* Curated Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {filteredCollections.map((col) => {
          const collectionHref = buildShopeeAffiliateUrl(col.searchQuery, col.id);
          return (
            <article
              key={col.id}
              className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm overflow-hidden flex flex-col shadow-xs md:shadow-none"
            >
              <div className="h-48 sm:h-52 w-full overflow-hidden bg-stone-200 dark:bg-[#050C18]">
                <img
                  src={col.image}
                  alt={col.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="text-[11px] sm:text-xs text-[#B45309] dark:text-[#F5B731] font-semibold uppercase tracking-wider mb-1.5">
                  {col.category} · Curadoria Achar Temas
                </div>
                <h2 className="font-display font-extrabold text-lg sm:text-2xl uppercase text-[#081224] dark:text-[#F4F0E6] mb-2 leading-snug">
                  {col.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed mb-4 flex-1">
                  {col.description}
                </p>
                <div className="text-xs text-stone-500 dark:text-slate-400 pt-3 border-t border-stone-200 dark:border-[#1B3358] mb-4">
                  Destaque da seleção:{' '}
                  <strong className="text-[#081224] dark:text-slate-200">{col.highlightItem}</strong>
                </div>
                <a
                  href={collectionHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackStoreOutbound(col.id)}
                  className="min-h-[44px] inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl md:rounded-sm bg-[#081224] dark:bg-[#F5B731] hover:bg-[#102444] dark:hover:bg-[#E09F1F] text-[#F5B731] dark:text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider transition-colors"
                >
                  <span>Ver itens desta seleção na Shopee</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Transparency & Affiliate Disclosure */}
      <div className="bg-white/90 dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-4 sm:p-5 text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
        <strong className="text-[#081224] dark:text-[#F5B731]">
          Declaração de Transparência Editorial e Afiliados:
        </strong>{' '}
        O portal Achar Temas participa do Programa de Afiliados da Shopee. Ao adquirir produtos por meio dos links da
        nossa Vitrine Shopee, podemos receber uma pequena comissão sem nenhum custo adicional para
        você. Nossa curadoria editorial permanece 100% independente e focada na utilidade real para os leitores.
      </div>
    </section>
  );
}
