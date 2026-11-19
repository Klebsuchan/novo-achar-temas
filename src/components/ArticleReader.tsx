import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  BookOpen,
  List,
  Clock,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  Tag,
  Gamepad2,
  Bookmark,
  MessageCircle,
} from 'lucide-react';
import {
  Post,
  Category,
  getPostHeroImage,
  getCategoryNameForPost,
  getPillarForPost,
  calculateReadingMetrics,
  formatEditorialDate,
  processArticleHtml,
  getRelatedPosts,
  stripHtmlTags,
  buildCleanArticlePath,
} from '../utils/blogLogic';
import { getArticleSeo } from '../data/articleSeo';
import AdSenseSlot from './AdSenseSlot';
import PostComments from './PostComments';
import { ParallaxImagePan } from './ParallaxMotion';
import ArticleGameSection from './games/ArticleGameSection';

interface ArticleReaderProps {
  post: Post;
  allPosts: Post[];
  categories: Category[];
  isBookmarked: boolean;
  onToggleBookmark: (postId: number) => void;
  onBack: () => void;
  onSelectPost: (post: Post) => void;
  onSelectPillar: (pillarId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export default function ArticleReader({
  post,
  allPosts,
  categories,
  isBookmarked,
  onToggleBookmark,
  onBack,
  onSelectPost,
  onSelectPillar,
  onNavigateTab,
}: ArticleReaderProps) {
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copiedLink, setCopiedLink] = useState(false);

  const heroImage = getPostHeroImage(post);
  const categoryName = getCategoryNameForPost(post, categories);
  const pillar = getPillarForPost(post);
  const seo = useMemo(() => getArticleSeo(post, categoryName), [post, categoryName]);
  const metrics = useMemo(() => calculateReadingMetrics(post.content.rendered), [post]);
  const { html: processedHtml, toc: baseToc } = useMemo(() => processArticleHtml(post), [post]);
  const relatedPosts = useMemo(() => getRelatedPosts(post, allPosts, 3), [post, allPosts]);

  const toc = useMemo(() => {
    const items = [...baseToc];
    if (seo.faqs.length > 0) {
      items.push({ id: 'faq-artigo', text: 'Perguntas Frequentes (FAQ)', level: 2 as const });
    }
    items.push({ id: 'jogo-artigo', text: 'Pausa Interativa · Jogar Mini-Game', level: 2 as const });
    return items;
  }, [baseToc, seo.faqs.length]);

  // Split HTML into clean editorial sections to insert CLS-safe In-Article AdSense slots at high-viewability checkpoints
  const { leadHtml, midHtml, tailHtml } = useMemo(() => {
    const paragraphs = processedHtml.split('</p>');
    if (paragraphs.length <= 3) {
      return { leadHtml: processedHtml, midHtml: '', tailHtml: '' };
    }
    const lead = paragraphs.slice(0, 2).join('</p>') + '</p>';
    const restParts = paragraphs.slice(2);
    if (restParts.length >= 6) {
      const midSplit = Math.floor(restParts.length / 2);
      return {
        leadHtml: lead,
        midHtml: restParts.slice(0, midSplit).join('</p>') + '</p>',
        tailHtml: restParts.slice(midSplit).join('</p>'),
      };
    }
    return {
      leadHtml: lead,
      midHtml: restParts.join('</p>'),
      tailHtml: '',
    };
  }, [processedHtml]);

  const cleanTitle = stripHtmlTags(post.title.rendered);
  const shareUrl = `${window.location.origin}${buildCleanArticlePath(seo.slug)}`;

  const handleCopyShareLink = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: cleanTitle,
          text: seo.metaDescription,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy if cancelled or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore clipboard errors
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${cleanTitle} — Achar Temas\n${shareUrl}`)}`;
  const xShareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const fontSizeClass = {
    normal: 'text-base sm:text-[17px]',
    large: 'text-lg sm:text-[19px]',
    xlarge: 'text-xl sm:text-[21px]',
  }[fontScale];

  return (
    <div className="w-full px-4 sm:px-4 lg:px-5 py-5 sm:py-12">
      {/* Top Breadcrumb & Back Bar */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 pb-3.5 sm:pb-6 mb-5 sm:mb-8 border-b border-stone-200 dark:border-[#1B3358] text-xs text-stone-500 dark:text-slate-400"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[38px] inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#081224] dark:text-[#F4F0E6] hover:text-[#B45309] dark:hover:text-[#F5B731] transition-colors cursor-pointer mr-1 sm:mr-2"
          >
            <ArrowLeft size={15} />
            <span>Voltar</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => onSelectPillar(pillar.id)}
            className="min-h-[38px] hover:text-[#B45309] dark:hover:text-[#F5B731] transition-colors cursor-pointer whitespace-nowrap"
          >
            {pillar.shortTitle}
          </button>
          <span aria-hidden="true" className="hidden sm:inline">/</span>
          <span className="hidden sm:inline text-stone-700 dark:text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
            {stripHtmlTags(post.title.rendered)}
          </span>
        </div>

        {/* Reading Accessibility Controls (Font Size A / A+ / A++) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-stone-500 dark:text-slate-400 mr-0.5 hidden sm:inline">Fonte:</span>
          <button
            type="button"
            onClick={() => setFontScale('normal')}
            aria-label="Tamanho de fonte padrão"
            className={`min-h-[36px] min-w-[36px] px-2 py-1 rounded-xl md:rounded-sm text-xs font-mono cursor-pointer border ${
              fontScale === 'normal'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224] border-[#081224] dark:border-[#F5B731]'
                : 'border-stone-200 dark:border-[#1B3358] text-stone-600 dark:text-slate-400 bg-white dark:bg-transparent'
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontScale('large')}
            aria-label="Tamanho de fonte ampliado"
            className={`min-h-[36px] min-w-[36px] px-2 py-1 rounded-xl md:rounded-sm text-xs font-mono cursor-pointer border ${
              fontScale === 'large'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224] border-[#081224] dark:border-[#F5B731]'
                : 'border-stone-200 dark:border-[#1B3358] text-stone-600 dark:text-slate-400 bg-white dark:bg-transparent'
            }`}
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontScale('xlarge')}
            aria-label="Tamanho de fonte extra grande"
            className={`min-h-[36px] min-w-[36px] px-2 py-1 rounded-xl md:rounded-sm text-xs font-mono cursor-pointer border ${
              fontScale === 'xlarge'
                ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224] border-[#081224] dark:border-[#F5B731]'
                : 'border-stone-200 dark:border-[#1B3358] text-stone-600 dark:text-slate-400 bg-white dark:bg-transparent'
            }`}
          >
            A++
          </button>
        </div>
      </nav>

      {/* Main Two-Column Asymmetric Reading Grid (70% Essay / 30% Sticky TOC & AdSense Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left/Center Article Column */}
        <article className="lg:col-span-8 min-w-0">
          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 dark:text-slate-400 mb-3 sm:mb-4">
            <span className="font-bold text-[#B45309] dark:text-[#F5B731] uppercase tracking-wider">
              {categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatEditorialDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Clock size={12} />
              {metrics.readingTimeMinutes} min ({metrics.wordCount} palavras)
            </span>
          </div>

          {/* Article Headline in Logo Typography */}
          <h1
            className="font-display text-2xl sm:text-4xl lg:text-[44px] font-black uppercase text-[#081224] dark:text-[#F4F0E6] leading-[1.08] tracking-tight mb-4 sm:mb-6"
            style={{ textWrap: 'balance' }}
          >
            {stripHtmlTags(post.title.rendered)}
          </h1>

          {/* Hero Image Container with Parallax Pan & aspect ratio reservation to prevent CLS */}
          <figure className="mb-6 sm:mb-8">
            <ParallaxImagePan
              src={heroImage}
              alt={stripHtmlTags(post.title.rendered)}
              fetchPriority="high"
              loading="eager"
              panPercent={5}
              className="w-full aspect-16/10 bg-stone-200 dark:bg-[#0B1930] rounded-2xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] shadow-xs md:shadow-none"
            />
            <figcaption className="text-xs italic text-stone-600 dark:text-slate-400 mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="line-clamp-1">Ilustração editorial — {stripHtmlTags(post.title.rendered)}</span>
              <span className="whitespace-nowrap shrink-0 font-mono text-[11px] uppercase tracking-wider">
                Acervo Achar Temas
              </span>
            </figcaption>
          </figure>

          {/* Editorial & Share Utility Strip */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3.5 sm:gap-4 p-4 sm:py-4 sm:px-5 mb-6 sm:mb-8 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm shadow-xs md:shadow-none">
            <div className="flex items-center gap-3">
              <img
                src="/logoachartemas.jpg"
                alt="Logo Achar Temas"
                loading="lazy"
                decoding="async"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#F5B731] shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-[#081224] dark:text-[#F4F0E6] flex items-center gap-1.5">
                  <span>Redação Achar Temas</span>
                  <UserCheck size={13} className="text-[#0EA5E9]" />
                </div>
                <div className="text-[11px] text-stone-500 dark:text-slate-400">
                  Curadoria Editorial · Conteúdo Verificado
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <a
                href="#jogo-artigo"
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                <Gamepad2 size={14} />
                <span>Mini-Game</span>
              </a>

              <button
                type="button"
                onClick={() => onToggleBookmark(post.id)}
                aria-pressed={isBookmarked}
                className={`min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl md:rounded-sm border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isBookmarked
                    ? 'bg-[#081224] text-[#F5B731] border-[#081224] dark:bg-[#F5B731] dark:text-[#081224] dark:border-[#F5B731]'
                    : 'border-stone-200 dark:border-[#1B3358] bg-[#F4F1E8] dark:bg-[#050C18] hover:border-[#D97706] dark:hover:border-[#F5B731] text-[#081224] dark:text-[#F4F0E6]'
                }`}
              >
                <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                <span>{isBookmarked ? 'Salvo' : 'Salvar'}</span>
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no WhatsApp"
                className="min-h-[40px] inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-[#F4F1E8] dark:bg-[#050C18] hover:border-emerald-600 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-colors whitespace-nowrap"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>

              <a
                href={xShareHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no X"
                className="min-h-[40px] inline-flex items-center justify-center px-2.5 py-2 rounded-xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-[#F4F1E8] dark:bg-[#050C18] hover:border-[#081224] dark:hover:border-white text-xs font-bold text-[#081224] dark:text-white transition-colors whitespace-nowrap"
              >
                𝕏
              </a>

              <a
                href={linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no LinkedIn"
                className="min-h-[40px] inline-flex items-center justify-center px-2.5 py-2 rounded-xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-[#F4F1E8] dark:bg-[#050C18] hover:border-[#0284C7] text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] transition-colors whitespace-nowrap"
              >
                in
              </a>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] bg-[#F4F1E8] dark:bg-[#050C18] hover:border-[#D97706] dark:hover:border-[#F5B731] text-xs font-semibold text-[#081224] dark:text-[#F4F0E6] transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-700 dark:text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Table of Contents */}
          {toc.length > 0 && (
            <div className="lg:hidden mb-6 p-4 sm:p-5 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm shadow-2xs md:shadow-none">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-wider text-[#081224] dark:text-[#F4F0E6] mb-3">
                <List size={15} className="text-[#D97706] dark:text-[#F5B731]" />
                <span>Índice do Artigo</span>
              </div>
              <ol className="space-y-2 text-sm">
                {toc.map((item, idx) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                    <a
                      href={`#${item.id}`}
                      className="text-stone-600 dark:text-slate-300 hover:text-[#B45309] dark:hover:text-[#F5B731] transition-colors flex items-baseline gap-2"
                    >
                      <span className="font-mono text-xs text-stone-400 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Speakable Key Takeaways Block (Hairline Editorial Framing) */}
          {seo.keyTakeaways.length > 0 && (
            <section
              aria-label="Pontos-Chave do Artigo"
              className="editorial-takeaways mb-8 p-5 sm:p-6 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm shadow-2xs md:shadow-none"
            >
              <div className="flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] pb-2.5 mb-3 border-b border-stone-200/80 dark:border-[#1B3358]">
                <CheckCircle2 size={15} />
                <span>Pontos-Chave Deste Artigo</span>
              </div>
              <ul className="space-y-2.5 text-sm text-[#081224] dark:text-slate-200 leading-relaxed">
                {seo.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#B45309] dark:text-[#F5B731] mt-0.5 tabular-nums">
                      0{idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Article Body Part 1 (Lead Paragraphs) */}
          <div
            className={`editorial-prose w-full ${fontSizeClass} text-[#081224] dark:text-[#F4F0E6]`}
            dangerouslySetInnerHTML={{ __html: leadHtml }}
          />

          {/* Native In-Article Google AdSense Slot 1 (Above-fold/early essay engagement) */}
          <AdSenseSlot slotId="in-article-primary-01" format="in-article" />

          {/* Article Body Part 2 (Middle Section) */}
          {midHtml && (
            <div
              className={`editorial-prose w-full ${fontSizeClass} text-[#081224] dark:text-[#F4F0E6]`}
              dangerouslySetInnerHTML={{ __html: midHtml }}
            />
          )}

          {/* Native In-Article Google AdSense Slot 2 (Mid-essay high viewability for long-form monetization) */}
          {tailHtml && (
            <>
              <AdSenseSlot slotId="in-article-mid-02" format="in-article" />
              <div
                className={`editorial-prose w-full ${fontSizeClass} text-[#081224] dark:text-[#F4F0E6]`}
                dangerouslySetInnerHTML={{ __html: tailHtml }}
              />
            </>
          )}

          {/* Semantic FAQ Section synchronized with FAQPage JSON-LD Rich Results */}
          {seo.faqs.length > 0 && (
            <section
              id="faq-artigo"
              aria-labelledby="faq-artigo-heading"
              className="mt-8 sm:mt-10 p-5 sm:p-6 bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm shadow-2xs md:shadow-none"
            >
              <div className="flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-1.5">
                <HelpCircle size={15} />
                <span>Dúvidas Comuns</span>
              </div>
              <h2
                id="faq-artigo-heading"
                className="font-display font-black text-xl sm:text-2xl uppercase text-[#081224] dark:text-white mb-4 sm:mb-5"
              >
                Perguntas Frequentes Sobre {seo.focusKeyword}
              </h2>
              <div className="divide-y divide-stone-200 dark:divide-[#1B3358]">
                {seo.faqs.map((faq, idx) => (
                  <details key={idx} open={idx === 0} className="group py-3.5">
                    <summary className="list-none flex items-center justify-between gap-4 cursor-pointer font-semibold text-sm sm:text-base text-[#081224] dark:text-white hover:text-[#B45309] dark:hover:text-[#F5B731] transition-colors">
                      <span>{faq.question}</span>
                      <span className="font-mono text-xs text-[#B45309] dark:text-[#F5B731] shrink-0">
                        +
                      </span>
                    </summary>
                    <p className="mt-2.5 text-sm text-stone-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Semantic Topic Tags for Internal Discovery */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-slate-400 mr-1">
              <Tag size={13} className="text-[#B45309] dark:text-[#F5B731]" />
              <span>Tópicos:</span>
            </span>
            {seo.keywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => onSelectPillar(pillar.id)}
                className="px-3 py-1.5 text-xs rounded-xl md:rounded-sm bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] text-stone-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Interactive Mini-Game Section Tailored to This Article */}
          <ArticleGameSection post={post} />

          {/* End-of-Article Multiplex AdSense Slot */}
          <AdSenseSlot slotId="multiplex-footer-02" format="multiplex" />

          {/* E-E-A-T Editorial Verification Box */}
          <section
            aria-label="Sobre a Redação"
            className="mt-10 sm:mt-12 p-5 sm:p-8 bg-[#081224] text-[#F4F0E6] border border-[#1B3358] rounded-2xl md:rounded-sm flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6"
          >
            <img
              src="/logoachartemas.jpg"
              alt="Logo Achar Temas"
              loading="lazy"
              decoding="async"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#F5B731] shrink-0"
            />
            <div className="text-center sm:text-left">
              <div className="text-xs text-[#F5B731] font-semibold uppercase tracking-wider mb-1">
                Produzido e Revisado por
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-white mb-2">
                Redação Achar Temas
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Curadoria editorial independente do portal <strong>Achar Temas</strong>, dedicada a traduzir
                temas complexos de história, ciência, arte e biodiversidade em leituras claras,
                confiáveis e aplicáveis ao cotidiano.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onSelectPillar(pillar.id)}
                  className="text-[#F5B731] hover:underline cursor-pointer"
                >
                  Explorar caderno {pillar.shortTitle} →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('sobre')}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  Sobre Nós
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('cookies')}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  Política Editorial
                </button>
              </div>
            </div>
          </section>

          {/* Related Articles Section */}
          <section
            aria-labelledby="related-articles-heading"
            className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-stone-200 dark:border-[#1B3358]"
          >
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div>
                <div className="text-xs text-[#B45309] dark:text-[#F5B731] font-semibold uppercase tracking-wider mb-1">
                  Continue Explorando · {pillar.shortTitle}
                </div>
                <h2
                  id="related-articles-heading"
                  className="font-display font-extrabold text-xl sm:text-2xl uppercase text-[#081224] dark:text-[#F4F0E6]"
                >
                  Artigos Relacionados Recomendados
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {relatedPosts.map((relPost) => {
                const relImg = getPostHeroImage(relPost);
                const relCat = getCategoryNameForPost(relPost, categories);
                const relMetrics = calculateReadingMetrics(relPost.content.rendered);
                return (
                  <article
                    key={relPost.id}
                    onClick={() => onSelectPost(relPost)}
                    className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-2xl md:rounded-sm overflow-hidden flex flex-col cursor-pointer group transition-colors shadow-xs md:shadow-none"
                  >
                    <div className="h-40 sm:h-36 w-full overflow-hidden bg-stone-200 dark:bg-[#050C18]">
                      <img
                        src={relImg}
                        alt={stripHtmlTags(relPost.title.rendered)}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-[11px] text-stone-500 dark:text-slate-400 mb-1.5">
                        <span className="font-semibold text-[#B45309] dark:text-[#F5B731]">{relCat}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{relMetrics.readingTimeMinutes} min</span>
                      </div>
                      <h3 className="font-display font-extrabold text-sm uppercase text-[#081224] dark:text-[#F4F0E6] group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors line-clamp-2 mb-3">
                        {stripHtmlTags(relPost.title.rendered)}
                      </h3>
                      <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
                        <span>Ler artigo</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Interactive Reader Comments with Google Auth */}
          <PostComments postId={post.id} />
        </article>

        {/* Right Sticky Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Interactive Table of Contents */}
          {toc.length > 0 && (
            <div className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 shadow-2xs md:shadow-none">
              <div className="flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-wider text-[#081224] dark:text-[#F4F0E6] pb-3 mb-3 border-b border-stone-200 dark:border-[#1B3358]">
                <BookOpen size={15} className="text-[#D97706] dark:text-[#F5B731]" />
                <span>Neste Artigo ({toc.length} tópicos)</span>
              </div>
              <ol className="space-y-2.5 text-xs">
                {toc.map((item, idx) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-3.5' : ''}>
                    <a
                      href={`#${item.id}`}
                      className="text-stone-600 dark:text-slate-300 hover:text-[#B45309] dark:hover:text-[#F5B731] transition-colors flex items-baseline gap-2 leading-relaxed"
                    >
                      <span className="font-mono text-[11px] text-stone-400 tabular-nums shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Sidebar Sticky 300x250 AdSense Slot */}
          <AdSenseSlot slotId="sidebar-sticky-300x250" format="sidebar" />

          {/* Curated Editorial Pillar Explorer Box */}
          <div className="bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 shadow-2xs md:shadow-none">
            <div className="text-xs text-[#B45309] dark:text-[#F5B731] font-semibold uppercase tracking-wider mb-1">
              Caderno Temático
            </div>
            <h3 className="font-display font-extrabold text-lg uppercase text-[#081224] dark:text-[#F4F0E6] mb-2">
              {pillar.title}
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed mb-4">
              {pillar.subtitle}
            </p>
            <button
              type="button"
              onClick={() => onSelectPillar(pillar.id)}
              className="min-h-[44px] w-full py-2.5 px-4 rounded-xl md:rounded-sm bg-[#081224] dark:bg-[#F5B731] hover:bg-[#102444] dark:hover:bg-[#E09F1F] text-[#F5B731] dark:text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Ver todos os artigos deste caderno
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
