import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Search,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Sun,
  Moon,
  Clock,
  Instagram,
  ShoppingBag,
  LogIn,
  LogOut,
  Bookmark,
  PenSquare,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { getAllCategories, getAllPosts, Post } from './services/api';
import {
  ActiveView,
  EDITORIAL_PILLARS,
  EditorialArticleDoc,
  buildCleanArticlePath,
  buildCleanViewUrl,
  calculateReadingMetrics,
  filterAndSortPosts,
  formatEditorialDate,
  getCategoryNameForPost,
  getPostHeroImage,
  isEditorialAdminUser,
  loadBookmarkedPostIds,
  mergeEditorialPosts,
  parseRouteFromLocation,
  saveBookmarkedPostIds,
  stripHtmlTags,
  toggleBookmarkId,
  buildArticleSchemaJsonLd,
  buildSiteSchemaJsonLd,
} from './utils/blogLogic';
import { getArticleSeo } from './data/articleSeo';
import { initAnalyticsIfAllowed, trackArticleRead, trackPageView } from './utils/analytics';
import AdSenseSlot from './components/AdSenseSlot';
import NewsletterBox from './components/NewsletterBox';
import {
  ParallaxHeroLayer,
  ParallaxImagePan,
  ParallaxScrollPlane,
} from './components/ParallaxMotion';
import { useFirebaseAuth } from './contexts/FirebaseAuthContext';

const ArticleReader = lazy(() => import('./components/ArticleReader'));
const SearchModal = lazy(() => import('./components/SearchModal'));
const Store = lazy(() => import('./components/Store'));
const LegalPages = lazy(() => import('./components/LegalPages'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const EditorialAdminPage = lazy(() => import('./components/EditorialAdminPage'));
const JogosAutoraisPage = lazy(() => import('./components/games/JogosAutoraisPage'));

const ViewSuspenseFallback = () => (
  <div className="w-full px-4 py-16 text-center text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-slate-400">
    Carregando seção editorial...
  </div>
);

export default function App() {
  const basePosts = useMemo(() => getAllPosts(), []);
  const allCategories = useMemo(() => getAllCategories(), []);
  const { user, signInWithGoogle, signOut } = useFirebaseAuth();
  const isAdmin = isEditorialAdminUser(user);

  const [cmsArticles, setCmsArticles] = useState<EditorialArticleDoc[]>([]);
  const allPosts = useMemo(
    () => mergeEditorialPosts(basePosts, cmsArticles),
    [basePosts, cmsArticles]
  );

  const [activeView, setActiveView] = useState<ActiveView>('inicio');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPillarId, setSelectedPillarId] = useState<string>('all');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => loadBookmarkedPostIds());
  const [sortBy, setSortBy] = useState<'recent' | 'reading-time' | 'title'>('recent');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);

  const fetchCmsArticles = useCallback(async () => {
    try {
      const colRef = collection(db, 'articles');
      const q = isAdmin ? colRef : query(colRef, where('published', '==', true));
      const snap = await getDocs(q);
      const items: EditorialArticleDoc[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          docId: docSnap.id,
          postId: Number(data.postId || 0),
          slug: String(data.slug || ''),
          title: String(data.title || ''),
          excerpt: String(data.excerpt || ''),
          contentHtml: String(data.contentHtml || ''),
          categoryId: Number(data.categoryId || 49),
          heroImage: String(data.heroImage || ''),
          published: Boolean(data.published),
          focusKeyword: String(data.focusKeyword || ''),
          metaDescription: String(data.metaDescription || ''),
          authorUid: String(data.authorUid || ''),
          createdAtIso:
            data.createdAt && typeof data.createdAt.toDate === 'function'
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString(),
          updatedAtIso:
            data.updatedAt && typeof data.updatedAt.toDate === 'function'
              ? data.updatedAt.toDate().toISOString()
              : new Date().toISOString(),
        });
      });
      setCmsArticles(items);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchCmsArticles().catch(() => {
      // Captured in handleFirestoreError
    });
  }, [fetchCmsArticles]);

  useEffect(() => {
    initAnalyticsIfAllowed();
  }, []);

  // Initialize theme from localStorage (Default: Warm Starlight Paper Light)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('achar_temas_theme');
      const shouldBeDark = savedTheme === 'dark';
      setIsDarkMode(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
      document.body.classList.toggle('dark', shouldBeDark);

      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        setShowCookieConsent(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Hydrate initial view or article from clean pathname (/artigo/:slug) and legacy query params
  useEffect(() => {
    const syncFromUrl = () => {
      const parsed = parseRouteFromLocation(window.location.pathname, window.location.search);

      if (parsed.articleId || parsed.articleSlug) {
        const found = allPosts.find((p) => {
          if (parsed.articleId && String(p.id) === parsed.articleId) return true;
          if (parsed.articleSlug) {
            const seoSlug = getArticleSeo(p).slug;
            return seoSlug === parsed.articleSlug || p.slug === parsed.articleSlug;
          }
          return false;
        });
        if (found) {
          setSelectedPost(found);
          setActiveView('artigos');
          return;
        }
      }

      setSelectedPost(null);
      if (parsed.pillarId) {
        setSelectedPillarId(parsed.pillarId);
        setShowSavedOnly(false);
        setActiveView('artigos');
        return;
      }

      setActiveView(parsed.view);
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [allPosts]);

  // Dynamic SEO Head Tags, OpenGraph Article Metadata, Twitter Cards, Schema.org JSON-LD & GA4 page_view
  useEffect(() => {
    const schemaScript = document.getElementById('schema-jsonld');
    const setMeta = (selector: string, content: string) => {
      document.querySelector(selector)?.setAttribute('content', content);
    };
    const canonical = document.querySelector('link[rel="canonical"]');
    const origin = window.location.origin;

    if (selectedPost) {
      const cleanTitle = stripHtmlTags(selectedPost.title.rendered);
      const catName = getCategoryNameForPost(selectedPost, allCategories);
      const seo = getArticleSeo(selectedPost, catName);
      const fullTitle = `${seo.seoTitle} — Achar Temas`;
      const cleanPath = buildCleanArticlePath(seo.slug);
      const canonicalUrl = `https://achartemas.com${cleanPath}`;
      const metaDesc = selectedPost.customMetaDescription?.trim() || seo.metaDescription;
      const heroPath = getPostHeroImage(selectedPost);
      const absoluteImage = heroPath.startsWith('http') ? heroPath : `${origin}${heroPath}`;

      document.title = fullTitle;
      setMeta('meta[name="description"]', metaDesc);
      setMeta('meta[name="keywords"]', seo.keywords.join(', '));
      canonical?.setAttribute('href', canonicalUrl);

      setMeta('meta[property="og:type"]', 'article');
      setMeta('meta[property="og:url"]', canonicalUrl);
      setMeta('meta[property="og:title"]', fullTitle);
      setMeta('meta[property="og:description"]', metaDesc);
      setMeta('meta[property="og:image"]', absoluteImage);
      setMeta('meta[property="og:image:alt"]', cleanTitle);

      setMeta('meta[property="article:published_time"]', selectedPost.date);
      setMeta('meta[property="article:modified_time"]', selectedPost.modified || selectedPost.date);
      setMeta('meta[property="article:section"]', catName);
      setMeta('meta[property="article:tag"]', seo.keywords.join(', '));

      setMeta('meta[name="twitter:title"]', fullTitle);
      setMeta('meta[name="twitter:description"]', metaDesc);
      setMeta('meta[name="twitter:image"]', absoluteImage);
      setMeta('meta[name="twitter:image:alt"]', cleanTitle);

      if (schemaScript) {
        schemaScript.textContent = buildArticleSchemaJsonLd(selectedPost, catName);
      }

      trackPageView(cleanPath, fullTitle);
    } else {
      const viewTitles: Record<ActiveView, string> = {
        inicio: 'Achar Temas — Portal Editorial de História, Ciência, Arte e Cultura',
        artigos: 'Acervo Completo de Artigos — Achar Temas',
        jogos: 'Jogos Autorais — Arcade Interativo Achar Temas',
        loja: 'Vitrine Oficial Shopee — Achar Temas',
        sobre: 'Sobre Nós & Política Editorial — Achar Temas',
        contato: 'Contato & Fale Conosco — Achar Temas',
        privacidade: 'Política de Privacidade & LGPD — Achar Temas',
        termos: 'Termos de Uso — Achar Temas',
        cookies: 'Política Editorial, Cookies & Comentários — Achar Temas',
        admin: 'Painel Editorial — Achar Temas',
      };
      const defaultDesc =
        'Blog editorial independente Achar Temas com artigos aprofundados sobre história, ciência, biodiversidade, arte, saúde e cultura pop, otimizado para SEO e Google AdSense.';
      const cleanPath = buildCleanViewUrl(activeView);
      const canonicalUrl = `https://achartemas.com${cleanPath}`;
      const defaultImg = `${origin}/wp-images/content-685-image-4.jpg`;

      document.title = viewTitles[activeView];
      setMeta('meta[name="description"]', defaultDesc);
      setMeta(
        'meta[name="keywords"]',
        'Achar Temas, blog, história, ciência, biodiversidade, arte, cultura pop, curiosidades, saúde, engenharia antiga, gastronomia'
      );
      canonical?.setAttribute('href', canonicalUrl);

      setMeta('meta[property="og:type"]', 'website');
      setMeta('meta[property="og:url"]', canonicalUrl);
      setMeta('meta[property="og:title"]', viewTitles[activeView]);
      setMeta('meta[property="og:description"]', defaultDesc);
      setMeta('meta[property="og:image"]', defaultImg);
      setMeta('meta[property="og:image:alt"]', viewTitles[activeView]);

      setMeta('meta[property="article:published_time"]', '');
      setMeta('meta[property="article:modified_time"]', '');
      setMeta('meta[property="article:section"]', '');
      setMeta('meta[property="article:tag"]', '');

      setMeta('meta[name="twitter:title"]', viewTitles[activeView]);
      setMeta('meta[name="twitter:description"]', defaultDesc);
      setMeta('meta[name="twitter:image"]', defaultImg);
      setMeta('meta[name="twitter:image:alt"]', viewTitles[activeView]);

      if (schemaScript) {
        schemaScript.textContent = buildSiteSchemaJsonLd();
      }

      trackPageView(cleanPath, viewTitles[activeView]);
    }
  }, [selectedPost, activeView, allCategories]);

  // Reading progress indicator while viewing an article
  useEffect(() => {
    if (!selectedPost) {
      setReadingProgress(0);
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      setReadingProgress(Math.min(1, Math.max(0, scrollTop / docHeight)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPost]);

  // Keyboard shortcut Cmd/Ctrl+K or Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextDark = !prev;
      document.documentElement.classList.toggle('dark', nextDark);
      document.body.classList.toggle('dark', nextDark);
      try {
        localStorage.setItem('achar_temas_theme', nextDark ? 'dark' : 'light');
      } catch {
        // ignore
      }
      return nextDark;
    });
  };

  const navigateToView = (view: ActiveView, pillarId?: string) => {
    setSelectedPost(null);
    setActiveView(view);
    setIsMobileMenuOpen(false);
    if (pillarId) {
      setShowSavedOnly(false);
      setSelectedPillarId(pillarId);
      setVisibleCount(12);
    } else if (view === 'artigos') {
      setShowSavedOnly(false);
      setVisibleCount(12);
    }
    const url = buildCleanViewUrl(view, pillarId);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPost = (post: Post) => {
    const seo = getArticleSeo(post);
    setSelectedPost(post);
    setActiveView('artigos');
    setIsMobileMenuOpen(false);
    window.history.pushState({}, '', buildCleanArticlePath(seo.slug));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackArticleRead(
      post.id,
      stripHtmlTags(post.title.rendered),
      getCategoryNameForPost(post, allCategories)
    );
  };

  const handleToggleBookmark = (postId: number) => {
    setBookmarkedIds((prev) => {
      const next = toggleBookmarkId(prev, postId);
      saveBookmarkedPostIds(next);
      return next;
    });
  };

  const handleAcceptCookies = () => {
    try {
      localStorage.setItem('cookieConsent', 'true');
    } catch {
      // ignore
    }
    setShowCookieConsent(false);
  };

  // Editorial Tiering on Home Page
  const leadPost = allPosts[0];
  const secondaryPosts = allPosts.slice(1, 4);
  const recentHighlightPosts = allPosts.slice(4, 10);

  // Filtered Posts for Archive View (supports Saved / Bookmarked filter)
  const archivePosts = useMemo(() => {
    const base = filterAndSortPosts(allPosts, {
      pillarId: showSavedOnly ? 'all' : selectedPillarId,
      sortBy,
    });
    return showSavedOnly ? base.filter((p) => bookmarkedIds.includes(p.id)) : base;
  }, [allPosts, selectedPillarId, sortBy, showSavedOnly, bookmarkedIds]);

  const displayedArchivePosts = archivePosts.slice(0, visibleCount);
  const totalWordCount = useMemo(
    () =>
      allPosts.reduce(
        (acc, p) => acc + calculateReadingMetrics(p.content.rendered).wordCount,
        0
      ),
    [allPosts]
  );

  const pillarStats = useMemo(
    () =>
      EDITORIAL_PILLARS.map((pillar) => {
        const count = filterAndSortPosts(allPosts, { pillarId: pillar.id }).length;
        const pct = allPosts.length > 0 ? Math.round((count / allPosts.length) * 100) : 0;
        return { pillar, count, pct };
      }),
    [allPosts]
  );

  return (
    <div
      className={`${
        isDarkMode ? 'dark' : ''
      } min-h-screen flex flex-col bg-[#F4F1E8] text-[#081224] dark:bg-[#050C18] dark:text-[#F4F0E6] transition-colors`}
    >
      {/* Reading Progress Indicator (Compositor-only scaleX) */}
      {selectedPost && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-0.5 bg-[#F5B731] origin-left z-50"
          style={{ transform: `scaleX(${readingProgress})` }}
        />
      )}

      {/* Top Bar Contract: Sleek single-row sticky header (56px mobile / 64px desktop) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#081224]/95 backdrop-blur-md text-[#081224] dark:text-[#F4F0E6] border-b border-stone-200 dark:border-[#1B3358] transition-colors">
        <div className="w-full px-3 sm:px-4 lg:px-5 h-14 md:h-16 flex items-center justify-between gap-3 md:gap-8">
          {/* Zone 1: Single Brand Lockup */}
          <button
            type="button"
            onClick={() => navigateToView('inicio')}
            className="inline-flex items-center gap-2 sm:gap-2.5 font-display font-black text-base sm:text-xl tracking-wide uppercase text-[#081224] dark:text-white whitespace-nowrap shrink-0 cursor-pointer hover:text-[#B45309] dark:hover:text-[#F5B731] transition-colors"
          >
            <img
              src="/logoachartemas.jpg"
              alt="Logo Achar Temas"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#F5B731] shrink-0"
            />
            <span>Achar Temas</span>
          </button>

          {/* Zone 2: Concise single-line navigation links (Desktop) */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-7 text-[11px] lg:text-xs font-display font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300"
          >
            <button
              type="button"
              onClick={() => navigateToView('inicio')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'inicio' && !selectedPost
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => navigateToView('artigos', 'all')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'artigos'
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Artigos
            </button>
            <button
              type="button"
              onClick={() => navigateToView('jogos')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'jogos' && !selectedPost
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Jogos Autorais
            </button>
            <button
              type="button"
              onClick={() => navigateToView('loja')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'loja'
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Loja
            </button>
            <button
              type="button"
              onClick={() => navigateToView('sobre')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'sobre' && !selectedPost
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Sobre
            </button>
            <button
              type="button"
              onClick={() => navigateToView('contato')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'contato' && !selectedPost
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Contato
            </button>
            <button
              type="button"
              onClick={() => navigateToView('privacidade')}
              className={`whitespace-nowrap shrink-0 pb-1 transition-colors cursor-pointer ${
                activeView === 'privacidade' || activeView === 'termos' || activeView === 'cookies'
                  ? 'text-[#B45309] dark:text-[#F5B731] border-b-2 border-[#B45309] dark:border-[#F5B731]'
                  : 'hover:text-[#081224] dark:hover:text-white'
              }`}
            >
              Privacidade
            </button>
          </nav>

          {/* Zone 3: Desktop CTA / Mobile Sleek Icon Toolbar */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Pesquisar artigos"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search size={14} />
              <span>Pesquisar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Pesquisar artigos"
              className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-xl text-[#081224] dark:text-[#F4F0E6] hover:bg-stone-100 dark:hover:bg-[#0D1E3A] transition-colors cursor-pointer"
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              aria-pressed={isDarkMode}
              className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-xl text-[#B45309] dark:text-[#F5B731] hover:bg-stone-100 dark:hover:bg-[#0D1E3A] transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-xl text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-[#0D1E3A] cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <nav
            aria-label="Menu móvel"
            className="md:hidden border-t border-stone-200 dark:border-[#1B3358] bg-white dark:bg-[#081224] text-[#081224] dark:text-[#F4F0E6] px-3 py-4 flex flex-col gap-1.5 shadow-xl"
          >
            <button
              type="button"
              onClick={() => navigateToView('inicio')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer ${
                activeView === 'inicio' && !selectedPost
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => navigateToView('artigos', 'all')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer flex items-center justify-between ${
                activeView === 'artigos'
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              <span>Artigos</span>
              <span className="font-mono text-xs opacity-75">{allPosts.length}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToView('jogos')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer ${
                activeView === 'jogos' && !selectedPost
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              Jogos Autorais
            </button>
            <button
              type="button"
              onClick={() => navigateToView('loja')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer ${
                activeView === 'loja'
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              Loja Shopee
            </button>
            <button
              type="button"
              onClick={() => navigateToView('sobre')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer ${
                activeView === 'sobre' && !selectedPost
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              Sobre Nós
            </button>
            <button
              type="button"
              onClick={() => navigateToView('contato')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer ${
                activeView === 'contato' && !selectedPost
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              Contato
            </button>
            <button
              type="button"
              onClick={() => navigateToView('privacidade')}
              className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer ${
                activeView === 'privacidade' || activeView === 'termos' || activeView === 'cookies'
                  ? 'bg-[#F4F1E8] dark:bg-[#0D1E3A] text-[#B45309] dark:text-[#F5B731]'
                  : 'hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
              }`}
            >
              Privacidade & Termos
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigateToView('admin')}
                className={`min-h-[46px] text-left px-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 ${
                  activeView === 'admin'
                    ? 'bg-[#081224] text-[#F5B731]'
                    : 'text-[#B45309] dark:text-[#F5B731] hover:bg-stone-100 dark:hover:bg-[#0D1E3A]'
                }`}
              >
                <PenSquare size={15} />
                <span>Painel Editorial</span>
              </button>
            )}

            <div className="mt-2 pt-3 border-t border-stone-200 dark:border-[#1B3358] flex items-center justify-between gap-3 px-1">
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signInWithGoogle();
                  }}
                  className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#081224] dark:bg-[#F5B731] text-[#F5B731] dark:text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Entrar com Google</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between gap-2 bg-[#F4F1E8] dark:bg-[#0D1E3A] px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Leitor'}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-[#F5B731] shrink-0"
                      />
                    )}
                    <span className="text-xs font-semibold truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-xs text-stone-600 dark:text-slate-300 font-semibold px-2 py-1 cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Desktop Editorial Utility Strip (Hidden on mobile to keep above-the-fold crisp & spacious) */}
      <div className="hidden md:block border-b border-stone-300 dark:border-[#1B3358] bg-[#EAE4D3] dark:bg-[#09152B] transition-colors">
        <div className="w-full px-3 sm:px-4 lg:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#081224] dark:text-[#F4F0E6]">
              Edição Digital · História, Ciência, Arte & Cultura
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums whitespace-nowrap">
              {allPosts.length} artigos
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">Redação Achar Temas</span>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-1.5 text-[#B45309] dark:text-[#F5B731] font-bold hover:underline cursor-pointer whitespace-nowrap"
              >
                <LogIn size={13} />
                <span>Entrar com Google</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Leitor'}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-[#F5B731]"
                  />
                )}
                <span className="font-semibold text-[#081224] dark:text-[#F4F0E6] truncate max-w-[130px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  aria-label="Sair da conta Google"
                  className="inline-flex items-center gap-1 text-stone-600 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
                >
                  <LogOut size={12} />
                  <span>Sair</span>
                </button>
              </div>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => navigateToView('admin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#081224] text-[#F5B731] hover:bg-[#102444] text-[11px] font-display font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                <PenSquare size={12} />
                <span>Painel Editorial</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              aria-pressed={isDarkMode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/80 dark:bg-[#0D1E3A] border border-stone-300 dark:border-[#1B3358] text-[#081224] dark:text-[#F5B731] hover:border-[#D97706] dark:hover:border-[#F5B731] font-bold cursor-pointer whitespace-nowrap transition-colors"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-clip">
        {/* VIEW 1: ARTICLE DETAIL READER */}
        {selectedPost && (
          <Suspense fallback={<ViewSuspenseFallback />}>
            <ArticleReader
              post={selectedPost}
              allPosts={allPosts}
              categories={allCategories}
              isBookmarked={bookmarkedIds.includes(selectedPost.id)}
              onToggleBookmark={handleToggleBookmark}
              onBack={() => navigateToView('artigos', selectedPillarId)}
              onSelectPost={openPost}
              onSelectPillar={(pillarId) => navigateToView('artigos', pillarId)}
              onNavigateTab={(tab) => navigateToView(tab as ActiveView)}
            />
          </Suspense>
        )}

        {/* VIEW 2: LOGO-HARMONIZED COSMIC NAVY & SOLAR GOLD PARALLAX HOME PAGE */}
        {!selectedPost && activeView === 'inicio' && (
          <div>
            {/* BAND 1: POSTER HERO WITH MULTI-PLANE SCROLL PARALLAX */}
            <section
              aria-label="Destaque Editorial"
              className="relative overflow-hidden editorial-paper-texture bg-[#F4F1E8] dark:bg-[#081224] text-[#081224] dark:text-[#F4F0E6] border-b border-stone-200 dark:border-[#1B3358] transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 py-5 sm:py-11 lg:py-12 relative">
                {/* Subtle Swiss Hairline Grid Background (Desktop) */}
                <div
                  aria-hidden="true"
                  className="hidden lg:block pointer-events-none absolute inset-y-0 left-3 right-3 sm:left-4 sm:right-4 lg:left-5 lg:right-5 border-x border-stone-300/60 dark:border-[#1B3358]/60"
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
                  {/* Left Poster Typography Column */}
                  <ParallaxHeroLayer maxShift={-24} className="lg:col-span-6">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#B45309] dark:text-[#F5B731] mb-2 sm:mb-3.5">
                      <span>Revista Digital Independente</span>
                      <span aria-hidden="true" className="opacity-50">·</span>
                      <span>{allPosts.length} Artigos</span>
                    </div>

                    <h1
                      className="font-display text-[28px] sm:text-5xl lg:text-[56px] font-black uppercase text-[#081224] dark:text-white leading-[1.04] tracking-tight mb-2.5 sm:mb-5"
                      style={{ textWrap: 'balance' }}
                    >
                      Ideias em movimento.{' '}
                      <span className="text-[#D97706] dark:text-[#F5B731]">Entenda o mundo</span> com clareza.
                    </h1>

                    <p className="text-xs sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed max-w-xl mb-4 sm:mb-6">
                      Reportagens e ensaios aprofundados sobre história, ciência, biodiversidade, arte, saúde e cultura pop — direto ao ponto, sem ruído.
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                      <button
                        type="button"
                        onClick={() => navigateToView('artigos', 'all')}
                        className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#081224] dark:bg-[#F5B731] hover:bg-[#102444] dark:hover:bg-[#E09F1F] text-[#F5B731] dark:text-[#081224] px-5 sm:px-6 py-3 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        <span>Explorar Todos os {allPosts.length} Artigos</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>

                    {/* Clean Proof Strip */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 max-w-lg">
                      <a
                        href="https://www.instagram.com/achar.temas?igsh=eTlqaGNwYnYydzB6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-xl md:rounded-sm transition-colors flex items-center gap-2.5 shadow-2xs"
                      >
                        <Instagram size={17} className="text-[#D97706] dark:text-[#F5B731] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#081224] dark:text-white truncate">
                            Instagram
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-slate-300 truncate">
                            @achar.temas
                          </div>
                        </div>
                      </a>

                      <button
                        type="button"
                        onClick={() => navigateToView('loja')}
                        className="text-left p-2.5 sm:p-3 bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-xl md:rounded-sm transition-colors flex items-center gap-2.5 cursor-pointer shadow-2xs"
                      >
                        <ShoppingBag size={17} className="text-[#0EA5E9] dark:text-[#38BDF8] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#081224] dark:text-white truncate">
                            Vitrine Shopee
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-slate-300 truncate">
                            Achados curados
                          </div>
                        </div>
                      </button>
                    </div>
                  </ParallaxHeroLayer>

                  {/* Right Multi-Plane Parallax Stage */}
                  <div className="lg:col-span-6 relative">
                    {/* Plane 1: Parallax Solar Gold & Horizon Cyan Rim Discs (Desktop only so mobile stays crisp) */}
                    <ParallaxHeroLayer
                      ariaHidden
                      maxShift={96}
                      className="hidden lg:block absolute -top-6 -right-4 w-80 h-80 rounded-full bg-gradient-to-tr from-[#D97706] via-[#F5B731] to-[#38BDF8] opacity-85 pointer-events-none"
                    />
                    <ParallaxHeroLayer
                      ariaHidden
                      maxShift={72}
                      className="hidden lg:block absolute -bottom-6 -left-3 w-44 h-28 bg-[#0EA5E9]/20 border border-[#38BDF8]/50 pointer-events-none"
                    />

                    {/* Plane 3: Floating Official Logo Emblem Seal */}
                    <ParallaxHeroLayer
                      maxShift={-88}
                      maxRotate={18}
                      className="hidden lg:flex absolute -top-5 -left-4 z-20 items-center justify-center"
                    >
                      <div className="p-1.5 rounded-full bg-[#081224] ring-2 ring-[#F5B731] shadow-2xl">
                        <img
                          src="/logoachartemas.jpg"
                          alt="Selo Oficial Achar Temas"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      </div>
                    </ParallaxHeroLayer>

                    {/* Plane 2: Lead Story Showcase Card */}
                    {leadPost && (
                      <ParallaxHeroLayer maxShift={-48} className="relative z-10">
                        <article
                          onClick={() => openPost(leadPost)}
                          className="bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-2xl md:rounded-sm overflow-hidden flex flex-col cursor-pointer group transition-colors shadow-md md:shadow-2xl"
                        >
                          <ParallaxImagePan
                            src={getPostHeroImage(leadPost)}
                            alt={stripHtmlTags(leadPost.title.rendered)}
                            fetchPriority="high"
                            loading="eager"
                            panPercent={5}
                            className="aspect-16/10 w-full bg-stone-200 dark:bg-[#050C18]"
                          />
                          <div className="p-4 sm:p-6 flex flex-col justify-between bg-white dark:bg-[#0D1E3A]">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 dark:text-slate-300 mb-1.5 sm:mb-2">
                              <span className="font-bold text-[#B45309] dark:text-[#F5B731] uppercase tracking-wider">
                                Edição de Capa · {getCategoryNameForPost(leadPost, allCategories)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {calculateReadingMetrics(leadPost.content.rendered).readingTimeMinutes} min
                              </span>
                            </div>
                            <h2 className="font-display text-lg sm:text-2xl font-black uppercase text-[#081224] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors leading-[1.14] mb-2 sm:mb-3">
                              {stripHtmlTags(leadPost.title.rendered)}
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3 sm:mb-4">
                              {stripHtmlTags(leadPost.excerpt.rendered)}
                            </p>
                            <div className="pt-3 border-t border-stone-200 dark:border-[#1B3358] flex items-center justify-between text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
                              <span>Ler reportagem completa</span>
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </article>
                      </ParallaxHeroLayer>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ADSENSE SLOT 1: CLS-SAFE LEADERBOARD IN PAPER BAND */}
            <div className="bg-[#F4F1E8] dark:bg-[#050C18] border-b border-stone-200 dark:border-[#1B3358] transition-colors">
              <div className="w-full px-4 sm:px-4 lg:px-5 py-2">
                <AdSenseSlot slotId="home-leaderboard-top" format="leaderboard" />
              </div>
            </div>

            {/* BAND 2: ARCHIVAL PAPER ASYMMETRIC SPLIT */}
            <section
              aria-labelledby="editorial-manifesto-heading"
              className="editorial-paper-texture bg-[#F4F1E8] dark:bg-[#09152B] text-[#081224] dark:text-[#F4F0E6] border-b border-stone-200 dark:border-[#1B3358] overflow-hidden transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 py-8 sm:py-14 lg:py-16">
                <div className="flex items-center justify-between pb-3 sm:pb-6 mb-5 sm:mb-10 border-b border-stone-300 dark:border-[#1B3358] text-[11px] sm:text-xs font-mono uppercase tracking-widest text-stone-600 dark:text-slate-400">
                  <span>01 / Curadoria Editorial</span>
                  <span>Acervo Achar Temas</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                  {/* Left Column */}
                  <ParallaxScrollPlane
                    offsetRange={[-20, 20]}
                    className="lg:col-span-4 flex flex-col justify-between"
                  >
                    <div>
                      <h2
                        id="editorial-manifesto-heading"
                        className="font-display text-2xl sm:text-4xl font-black uppercase leading-[1.04] tracking-tight mb-3 sm:mb-5"
                        style={{ textWrap: 'balance' }}
                      >
                        Mais do que curiosidades. Conhecimento estruturado.
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                        Cada publicação do Achar Temas reúne pesquisa histórica, rigor científico e
                        linguagem clara para responder dúvidas reais com profundidade e zero
                        sensacionalismo.
                      </p>
                      <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm mb-4 sm:mb-6 shadow-2xs md:shadow-none">
                        <img
                          src="/logoachartemas.jpg"
                          alt="Selo Editorial Achar Temas"
                          loading="lazy"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#F5B731] shrink-0"
                        />
                        <div>
                          <div className="text-xs font-display font-extrabold uppercase tracking-wider">
                            Achar Temas
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-slate-400">
                            Leitura gratuita · Revisão E-E-A-T
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateToView('artigos', 'all')}
                        className="inline-flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer"
                      >
                        <span>Explorar arquivo completo</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </ParallaxScrollPlane>

                  {/* Center Column (Desktop visual / compact 16:9 mobile frame) */}
                  <ParallaxScrollPlane
                    offsetRange={[28, -28]}
                    className="lg:col-span-4"
                  >
                    <div className="bg-white dark:bg-[#0D1E3A] p-1.5 sm:p-2 border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm shadow-xs md:shadow-none overflow-hidden">
                      <ParallaxImagePan
                        src="/wp-images/content-560-image.jpg"
                        alt="Arte, ciência e história no Achar Temas"
                        panPercent={8}
                        className="aspect-16/10 lg:aspect-4/5 w-full bg-stone-200 dark:bg-[#050C18] rounded-xl md:rounded-none overflow-hidden"
                      />
                    </div>
                  </ParallaxScrollPlane>

                  {/* Right Column: Clean 6-Pillar Directory List */}
                  <ParallaxScrollPlane
                    offsetRange={[-14, 14]}
                    className="lg:col-span-4 bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-4 sm:p-6 shadow-xs md:shadow-none"
                  >
                    <div className="font-display text-lg sm:text-xl font-black uppercase tracking-tight mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-stone-200 dark:border-[#1B3358]">
                      Cadernos Temáticos
                    </div>
                    <ul className="divide-y divide-stone-200/80 dark:divide-[#1B3358]">
                      {pillarStats.map(({ pillar, count }, idx) => (
                        <li key={pillar.id}>
                          <button
                            type="button"
                            onClick={() => navigateToView('artigos', pillar.id)}
                            className="w-full min-h-[46px] py-2.5 flex items-center justify-between gap-3 text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-xs font-bold text-[#B45309] dark:text-[#F5B731] tabular-nums shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-sm font-semibold group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors truncate">
                                {pillar.shortTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-xs text-stone-500 dark:text-slate-400 tabular-nums">
                                {count}
                              </span>
                              <ArrowRight
                                size={13}
                                className="text-stone-400 group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors"
                              />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </ParallaxScrollPlane>
                </div>
              </div>
            </section>

            {/* BAND 3: CONTRAST BAND (2x2 Mobile Bento Strip + Horizontal Swipe Featured Carousel on Mobile) */}
            <section
              aria-labelledby="secondary-stories-heading"
              className="bg-[#EAE4D3] dark:bg-[#081224] text-[#081224] dark:text-[#F4F0E6] border-b border-stone-200 dark:border-[#1B3358] overflow-hidden transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 py-8 sm:py-14 lg:py-16">
                {/* 01-04 Bento Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-0 lg:bg-white lg:dark:bg-[#050C18] lg:border lg:border-stone-300 lg:dark:border-[#1B3358] lg:divide-x lg:divide-stone-300 lg:dark:divide-[#1B3358] mb-8 sm:mb-14">
                  {EDITORIAL_PILLARS.slice(0, 4).map((pillar, index) => (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => navigateToView('artigos', pillar.id)}
                      className="p-3.5 sm:p-5 lg:p-6 text-left bg-white dark:bg-[#050C18] lg:bg-transparent border border-stone-200 dark:border-[#1B3358] lg:border-0 rounded-2xl lg:rounded-none hover:bg-[#F4F1E8] dark:hover:bg-[#0D1E3A] transition-colors group flex flex-col justify-between cursor-pointer shadow-2xs lg:shadow-none"
                    >
                      <div>
                        <div className="font-display text-2xl lg:text-3xl font-black text-[#D97706] dark:text-[#F5B731] tabular-nums mb-1.5 lg:mb-3">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <h3 className="font-display text-sm sm:text-base lg:text-lg font-extrabold uppercase text-[#081224] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors mb-1.5 lg:mb-2 leading-tight">
                          {pillar.shortTitle}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none mb-3 lg:mb-4">
                          {pillar.subtitle}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] group-hover:text-[#B45309] dark:group-hover:text-[#F5B731]">
                        <span>Abrir</span>
                        <ArrowRight size={12} />
                      </span>
                    </button>
                  ))}
                </div>

                {/* Featured Articles Row (Smooth Horizontal Swipe Carousel on Mobile) */}
                <div className="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-10">
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#B45309] dark:text-[#F5B731] mb-1">
                      02 / Leituras em Evidência
                    </div>
                    <h2
                      id="secondary-stories-heading"
                      className="font-display text-xl sm:text-4xl font-black uppercase text-[#081224] dark:text-white tracking-tight"
                    >
                      Destaques Selecionados
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToView('artigos', 'all')}
                    className="text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Ver acervo ({allPosts.length}) →
                  </button>
                </div>

                <div className="flex md:grid md:grid-cols-3 gap-3.5 md:gap-6 items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-2">
                  {secondaryPosts.map((post, idx) => {
                    const metrics = calculateReadingMetrics(post.content.rendered);
                    const staggerRange: [number, number] =
                      idx === 1 ? [22, -22] : [-18, 18];
                    return (
                      <ParallaxScrollPlane
                        key={post.id}
                        offsetRange={staggerRange}
                        className="h-full w-[82vw] max-w-[320px] md:w-auto md:max-w-none shrink-0 snap-start"
                      >
                        <article
                          onClick={() => openPost(post)}
                          className="h-full bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-2xl md:rounded-sm overflow-hidden flex flex-col cursor-pointer group transition-colors shadow-xs md:shadow-none"
                        >
                          <ParallaxImagePan
                            src={getPostHeroImage(post)}
                            alt={stripHtmlTags(post.title.rendered)}
                            panPercent={6}
                            className="aspect-16/10 w-full bg-stone-200 dark:bg-[#050C18]"
                          />
                          <div className="p-4 sm:p-5 flex-1 flex flex-col">
                            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs text-stone-500 dark:text-slate-300 mb-2">
                              <span className="font-mono text-[#B45309] dark:text-[#F5B731] font-bold tabular-nums">
                                {String(idx + 1).padStart(3, '0')}
                              </span>
                              <span className="truncate">
                                {getCategoryNameForPost(post, allCategories)} · {metrics.readingTimeMinutes} min
                              </span>
                            </div>
                            <h3 className="font-display font-extrabold text-base sm:text-lg uppercase text-[#081224] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors leading-snug mb-2 line-clamp-2">
                              {stripHtmlTags(post.title.rendered)}
                            </h3>
                            <p className="text-xs text-stone-600 dark:text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-3.5 sm:mb-4 flex-1">
                              {stripHtmlTags(post.excerpt.rendered)}
                            </p>
                            <div className="pt-3 border-t border-stone-200 dark:border-[#1B3358] flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-[#081224] dark:text-slate-200 group-hover:text-[#B45309] dark:group-hover:text-[#F5B731]">
                              <span>Ler artigo</span>
                              <span className="w-7 h-7 rounded-full border border-stone-300 dark:border-[#1B3358] group-hover:border-[#D97706] dark:group-hover:border-[#F5B731] flex items-center justify-center">
                                <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>
                        </article>
                      </ParallaxScrollPlane>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* BAND 4: PAPER + SOLAR GOLD METRICS BLOCK */}
            <section
              aria-label="Cobertura Editorial e Métricas"
              className="bg-[#F4F1E8] dark:bg-[#09152B] border-b border-stone-200 dark:border-[#1B3358] overflow-hidden transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 py-8 sm:py-14 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
                  {/* Left: Real Coverage Distribution Across 6 Editorial Pillars */}
                  <ParallaxScrollPlane
                    offsetRange={[-14, 14]}
                    className="lg:col-span-6"
                  >
                    <div className="h-full bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-5 sm:p-8 flex flex-col justify-between shadow-xs md:shadow-none">
                      <div>
                        <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#B45309] dark:text-[#F5B731] mb-1">
                          Distribuição Real do Acervo
                        </div>
                        <h2 className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight mb-4 sm:mb-6">
                          Temas em Profundidade
                        </h2>
                      </div>

                      <div className="space-y-3.5 sm:space-y-4">
                        {pillarStats.map(({ pillar, count, pct }) => (
                          <button
                            key={pillar.id}
                            type="button"
                            onClick={() => navigateToView('artigos', pillar.id)}
                            className="w-full text-left group cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                              <span className="group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors">
                                {pillar.shortTitle}
                              </span>
                              <span className="font-mono tabular-nums text-stone-600 dark:text-slate-400">
                                {count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-stone-200 dark:bg-[#050C18] rounded-full md:rounded-none overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#D97706] via-[#F5B731] to-[#0EA5E9] transition-all duration-300"
                                style={{ width: `${Math.max(12, pct * 2.5)}%` }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </ParallaxScrollPlane>

                  {/* Right: Solar Gold & Cosmic Navy Poster Block */}
                  <ParallaxScrollPlane
                    offsetRange={[14, -14]}
                    className="lg:col-span-6"
                  >
                    <div className="h-full bg-[#F5B731] text-[#081224] border border-[#D97706] rounded-2xl md:rounded-sm p-5 sm:p-8 flex flex-col justify-between shadow-xs md:shadow-none">
                      <div>
                        <div className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#081224]/80 mb-1.5 sm:mb-2">
                          Acervo Editorial Achar Temas
                        </div>
                        <h2 className="font-display text-xl sm:text-3xl font-black uppercase leading-tight mb-4 sm:mb-6">
                          Pesquisa Histórica, Ciência e Cultura com Leitura Fluida
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-[#081224]/20">
                        <div>
                          <div className="font-display text-3xl sm:text-5xl font-black tabular-nums">
                            {allPosts.length}
                          </div>
                          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#081224]/90 mt-1">
                            Artigos Publicados
                          </div>
                        </div>
                        <div>
                          <div className="font-display text-3xl sm:text-5xl font-black tabular-nums">
                            {EDITORIAL_PILLARS.length}
                          </div>
                          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#081224]/90 mt-1">
                            Cadernos Ativos
                          </div>
                        </div>
                        <div>
                          <div className="font-display text-3xl sm:text-5xl font-black tabular-nums">
                            {Math.floor(totalWordCount / 1000)}k+
                          </div>
                          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#081224]/90 mt-1">
                            Palavras Originais
                          </div>
                        </div>
                        <div>
                          <div className="font-display text-3xl sm:text-5xl font-black tabular-nums">
                            100%
                          </div>
                          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#081224]/90 mt-1">
                            Acesso Gratuito
                          </div>
                        </div>
                      </div>
                    </div>
                  </ParallaxScrollPlane>
                </div>
              </div>
            </section>

            {/* BAND 5: 6 THEMATIC PILLARS (Horizontal Swipe Showcase on Mobile) */}
            <section
              aria-labelledby="pillars-heading"
              className="editorial-paper-texture bg-[#F4F1E8] dark:bg-[#050C18] border-b border-stone-200 dark:border-[#1B3358] overflow-hidden transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 py-8 sm:py-14 lg:py-16">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-5 sm:mb-8">
                  <div>
                    <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#B45309] dark:text-[#F5B731] mb-1">
                      03 / Navegação por Editoria
                    </div>
                    <h2
                      id="pillars-heading"
                      className="font-display text-xl sm:text-4xl font-black uppercase tracking-tight"
                    >
                      Explore Nossas 6 Editorias
                    </h2>
                  </div>
                </div>

                <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
                  {EDITORIAL_PILLARS.map((pillar, idx) => {
                    const countInPillar = filterAndSortPosts(allPosts, { pillarId: pillar.id }).length;
                    return (
                      <ParallaxScrollPlane
                        key={pillar.id}
                        offsetRange={idx % 2 === 0 ? [-14, 14] : [14, -14]}
                        className="w-[76vw] max-w-[295px] sm:w-auto sm:max-w-none shrink-0 snap-start"
                      >
                        <button
                          type="button"
                          onClick={() => navigateToView('artigos', pillar.id)}
                          className="w-full h-full text-left bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-2xl sm:rounded-sm overflow-hidden group transition-colors cursor-pointer flex flex-col shadow-xs sm:shadow-none"
                        >
                          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-[#081224]">
                            <ParallaxImagePan
                              src={pillar.coverImage}
                              alt={pillar.title}
                              panPercent={7}
                              className="w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#081224]/90 via-[#081224]/40 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-3.5 right-3.5 pointer-events-none">
                              <div className="text-[11px] font-mono text-[#F5B731] font-bold mb-0.5 tabular-nums">
                                {String(idx + 1).padStart(2, '0')} · {countInPillar} artigos
                              </div>
                              <h3 className="font-display font-extrabold text-base sm:text-lg uppercase text-white leading-tight">
                                {pillar.title}
                              </h3>
                            </div>
                          </div>
                          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none mb-2.5 sm:mb-3">
                              {pillar.subtitle}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
                              <span>Abrir caderno</span>
                              <ArrowRight size={13} />
                            </span>
                          </div>
                        </button>
                      </ParallaxScrollPlane>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* BAND 6: CHRONOLOGICAL ARCHIVE LIST + GOOGLE EMAIL SUBSCRIPTION BOX */}
            <section
              aria-labelledby="archive-list-heading"
              className="bg-[#F4F1E8] dark:bg-[#09152B] border-b border-stone-200 dark:border-[#1B3358] transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 py-8 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                  <div className="lg:col-span-8 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                      <h2
                        id="archive-list-heading"
                        className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight"
                      >
                        Índice Cronológico
                      </h2>
                      <button
                        type="button"
                        onClick={() => navigateToView('artigos', 'all')}
                        className="text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Ver todos ({allPosts.length}) →
                      </button>
                    </div>

                    <div className="divide-y divide-stone-200 dark:divide-[#1B3358] border-t border-b border-stone-200 dark:border-[#1B3358]">
                      {recentHighlightPosts.map((post) => {
                        const metrics = calculateReadingMetrics(post.content.rendered);
                        return (
                          <article
                            key={post.id}
                            onClick={() => openPost(post)}
                            className="py-3.5 sm:py-4 flex items-center justify-between gap-3.5 sm:gap-4 cursor-pointer group"
                          >
                            <img
                              src={getPostHeroImage(post)}
                              alt={stripHtmlTags(post.title.rendered)}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-xl object-cover bg-stone-200 dark:bg-[#050C18] shrink-0 sm:hidden"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 dark:text-slate-400 mb-0.5 sm:mb-1">
                                <span className="font-bold text-[#B45309] dark:text-[#F5B731]">
                                  {getCategoryNameForPost(post, allCategories)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{formatEditorialDate(post.date)}</span>
                                <span aria-hidden="true" className="sm:hidden">·</span>
                                <span className="sm:hidden font-mono tabular-nums">
                                  {metrics.readingTimeMinutes} min
                                </span>
                              </div>
                              <h3 className="font-display font-extrabold text-sm sm:text-lg uppercase text-[#081224] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors line-clamp-2 sm:truncate leading-snug">
                                {stripHtmlTags(post.title.rendered)}
                              </h3>
                            </div>
                            <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs font-mono text-stone-600 dark:text-slate-400 tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} />
                                {metrics.readingTimeMinutes}m
                              </span>
                              <ArrowRight
                                size={14}
                                className="text-stone-500 group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors"
                              />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  {/* Real Google-Backed Email Subscription Box */}
                  <NewsletterBox />
                </div>
              </div>
            </section>

            {/* BAND 7: CLOSING PARALLAX STATEMENT */}
            <section
              aria-label="Convite à Leitura"
              className="relative overflow-hidden bg-[#EAE4D3] dark:bg-[#050C18] py-8 sm:py-14 lg:py-16 transition-colors"
            >
              <div className="w-full px-4 sm:px-4 lg:px-5 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <ParallaxScrollPlane
                  offsetRange={[-20, 20]}
                  className="lg:col-span-7"
                >
                  <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#B45309] dark:text-[#F5B731] mb-2 sm:mb-3">
                    Leitura Livre e Gratuita
                  </div>
                  <h2
                    className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase leading-[1.02] tracking-tight mb-4 sm:mb-5"
                    style={{ textWrap: 'balance' }}
                  >
                    Conhecimento que desperta novas perguntas todos os dias.
                  </h2>
                  <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => navigateToView('artigos', 'all')}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#081224] dark:bg-[#F5B731] text-[#F5B731] dark:text-[#081224] hover:bg-[#102444] dark:hover:bg-[#E09F1F] px-6 py-3 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <span>Acessar Todos os Artigos</span>
                      <ArrowUpRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToView('loja')}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-white/70 dark:bg-transparent border border-stone-300 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] px-5 py-3 rounded-xl md:rounded-sm text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <span>Visitar Vitrine Shopee</span>
                    </button>
                  </div>
                </ParallaxScrollPlane>

                <ParallaxScrollPlane
                  offsetRange={[24, -24]}
                  rotateRange={[-4, 4]}
                  className="lg:col-span-5 flex justify-center lg:justify-end"
                >
                  <div className="relative p-4 sm:p-6 bg-white dark:bg-[#081224] text-[#081224] dark:text-white border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm flex items-center gap-4 sm:gap-5 max-w-md w-full shadow-md md:shadow-2xl">
                    <img
                      src="/logoachartemas.jpg"
                      alt="Logo Oficial Achar Temas"
                      loading="lazy"
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-[#F5B731] shrink-0"
                    />
                    <div>
                      <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#0284C7] dark:text-[#38BDF8] mb-0.5 sm:mb-1">
                        achartemas.com
                      </div>
                      <div className="font-display text-xl sm:text-2xl font-black uppercase text-[#B45309] dark:text-[#F5B731] leading-tight mb-0.5 sm:mb-1">
                        Achar Temas
                      </div>
                      <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
                        Portal editorial independente de história, ciência, arte e cultura pop.
                      </p>
                    </div>
                  </div>
                </ParallaxScrollPlane>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 3: FULL ARTICLES ARCHIVE (All 36 Articles, Filterable & Sortable) */}
        {!selectedPost && activeView === 'artigos' && (
          <section className="w-full px-4 sm:px-4 lg:px-5 py-6 sm:py-12">
            <div className="mb-5 sm:mb-8">
              <div className="text-xs font-mono uppercase tracking-widest text-[#B45309] dark:text-[#F5B731] mb-1.5">
                Acervo Editorial Completo · {archivePosts.length} de {allPosts.length} artigos
              </div>
              <h1 className="font-display text-2xl sm:text-5xl font-black uppercase tracking-tight mb-2 sm:mb-3">
                {showSavedOnly
                  ? 'Artigos Salvos para Ler Depois'
                  : selectedPillarId === 'all'
                    ? 'Todos os Artigos Publicados'
                    : EDITORIAL_PILLARS.find((p) => p.id === selectedPillarId)?.title}
              </h1>
              <p className="text-sm text-stone-600 dark:text-slate-300 max-w-2xl">
                {showSavedOnly
                  ? 'Seus artigos favoritados neste dispositivo ficam reunidos aqui para leitura rápida.'
                  : selectedPillarId === 'all'
                    ? `Explore nossa biblioteca completa com ${totalWordCount.toLocaleString('pt-BR')} palavras de conteúdo original revisado.`
                    : EDITORIAL_PILLARS.find((p) => p.id === selectedPillarId)?.subtitle}
              </p>
            </div>

            {/* Filter Tabs & Sorting Controls (Horizontal swipe strip on mobile) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 mb-6 sm:mb-8 border-b border-stone-200 dark:border-[#1B3358]">
              <div
                role="tablist"
                aria-label="Filtrar artigos por editoria"
                className="flex sm:flex-wrap items-center gap-1.5 p-1 bg-stone-200/80 dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm overflow-x-auto no-scrollbar w-full lg:w-auto max-w-full"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!showSavedOnly && selectedPillarId === 'all'}
                  onClick={() => {
                    setShowSavedOnly(false);
                    setSelectedPillarId('all');
                    setVisibleCount(12);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    !showSavedOnly && selectedPillarId === 'all'
                      ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                      : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
                  }`}
                >
                  Todos ({allPosts.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={showSavedOnly}
                  onClick={() => {
                    setShowSavedOnly(true);
                    setSelectedPillarId('all');
                    setVisibleCount(12);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                    showSavedOnly
                      ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                      : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
                  }`}
                >
                  <Bookmark size={12} />
                  <span>Salvos ({bookmarkedIds.length})</span>
                </button>
                {EDITORIAL_PILLARS.map((pillar) => (
                  <button
                    key={pillar.id}
                    type="button"
                    role="tab"
                    aria-selected={!showSavedOnly && selectedPillarId === pillar.id}
                    onClick={() => {
                      setShowSavedOnly(false);
                      setSelectedPillarId(pillar.id);
                      setVisibleCount(12);
                    }}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider rounded-xl md:rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      !showSavedOnly && selectedPillarId === pillar.id
                        ? 'bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]'
                        : 'text-stone-700 dark:text-slate-300 hover:text-[#081224] dark:hover:text-white'
                    }`}
                  >
                    {pillar.shortTitle}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
                <label
                  htmlFor="archive-sort-select"
                  className="text-xs font-medium text-stone-600 dark:text-slate-400"
                >
                  Ordenar por:
                </label>
                <select
                  id="archive-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'reading-time' | 'title')}
                  className="min-h-[38px] bg-white dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] rounded-xl md:rounded-sm px-3 py-1.5 text-xs font-medium text-[#081224] dark:text-slate-200 cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="reading-time">Maior Profundidade (Leitura)</option>
                  <option value="title">Ordem Alfabética (A–Z)</option>
                </select>
              </div>
            </div>

            <AdSenseSlot slotId="archive-leaderboard-top" format="leaderboard" />

            {/* Articles Grid */}
            {displayedArchivePosts.length === 0 ? (
              <div className="bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] rounded-2xl md:rounded-sm p-10 text-center">
                <Bookmark size={28} className="mx-auto text-[#B45309] dark:text-[#F5B731] mb-3" />
                <h2 className="font-display text-lg font-black uppercase text-[#081224] dark:text-white mb-1">
                  Nenhum artigo salvo ainda
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 mb-5 max-w-md mx-auto">
                  Clique no botão “Salvar” dentro de qualquer reportagem para criar sua lista pessoal de leitura.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(false)}
                  className="min-h-[42px] px-5 py-2 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Explorar Todos os Artigos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {displayedArchivePosts.map((post) => {
                  const metrics = calculateReadingMetrics(post.content.rendered);
                  const saved = bookmarkedIds.includes(post.id);
                  return (
                    <article
                      key={post.id}
                      onClick={() => openPost(post)}
                      className="bg-white dark:bg-[#0D1E3A] border border-stone-200 dark:border-[#1B3358] hover:border-[#D97706] dark:hover:border-[#F5B731] rounded-2xl md:rounded-sm overflow-hidden flex flex-col cursor-pointer group transition-colors shadow-xs md:shadow-none"
                    >
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-200 dark:bg-[#050C18]">
                        <img
                          src={getPostHeroImage(post)}
                          alt={stripHtmlTags(post.title.rendered)}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                        {saved && (
                          <span
                            title="Artigo salvo"
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#081224]/90 text-[#F5B731] flex items-center justify-center shadow"
                          >
                            <Bookmark size={13} className="fill-current" />
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400 mb-2">
                          <span className="font-bold text-[#B45309] dark:text-[#F5B731]">
                            {getCategoryNameForPost(post, allCategories)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{formatEditorialDate(post.date)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{metrics.readingTimeMinutes} min</span>
                        </div>
                        <h2 className="font-display font-extrabold text-lg uppercase text-[#081224] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#F5B731] transition-colors leading-snug mb-2 line-clamp-2">
                          {stripHtmlTags(post.title.rendered)}
                        </h2>
                        <p className="text-xs text-stone-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4 flex-1">
                          {stripHtmlTags(post.excerpt.rendered)}
                        </p>
                        <div className="pt-3 border-t border-stone-200 dark:border-[#1B3358] flex items-center justify-between text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731]">
                          <span>Ler artigo completo</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {visibleCount < archivePosts.length && (
              <div className="mt-8 sm:mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="min-h-[44px] px-6 py-3 rounded-xl md:rounded-sm bg-[#081224] dark:bg-[#F5B731] text-[#F5B731] dark:text-[#081224] hover:bg-[#102444] dark:hover:bg-[#E09F1F] text-xs font-display font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Carregar Mais Artigos ({archivePosts.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </section>
        )}

        {/* VIEW 4: AUTHORED MINI-GAMES SHOWCASE */}
        {!selectedPost && activeView === 'jogos' && (
          <Suspense fallback={<ViewSuspenseFallback />}>
            <JogosAutoraisPage allPosts={allPosts} onSelectPost={openPost} />
          </Suspense>
        )}

        {/* VIEW 5: CURATED STORE (Shopee Ready) */}
        {!selectedPost && activeView === 'loja' && (
          <Suspense fallback={<ViewSuspenseFallback />}>
            <Store />
          </Suspense>
        )}

        {/* VIEW 6: ABOUT US (E-E-A-T Page) */}
        {!selectedPost && activeView === 'sobre' && (
          <Suspense fallback={<ViewSuspenseFallback />}>
            <AboutPage
              totalArticles={allPosts.length}
              totalWords={totalWordCount}
              onBackHome={() => navigateToView('inicio')}
              onNavigateContact={() => navigateToView('contato')}
              onNavigateArticles={(pillarId) => navigateToView('artigos', pillarId || 'all')}
              onNavigateGames={() => navigateToView('jogos')}
            />
          </Suspense>
        )}

        {/* VIEW 7: CONTACT PAGE (Firestore-backed Inbox) */}
        {!selectedPost && activeView === 'contato' && (
          <Suspense fallback={<ViewSuspenseFallback />}>
            <ContactPage
              onBackHome={() => navigateToView('inicio')}
              onNavigatePrivacy={() => navigateToView('privacidade')}
            />
          </Suspense>
        )}

        {/* VIEW 8: PROTECTED EDITORIAL ADMIN CMS */}
        {!selectedPost && activeView === 'admin' && (
          <Suspense fallback={<ViewSuspenseFallback />}>
            <EditorialAdminPage
              allPosts={allPosts}
              cmsArticles={cmsArticles}
              categories={allCategories}
              onRefreshCmsArticles={fetchCmsArticles}
              onBackHome={() => navigateToView('inicio')}
              onOpenPost={openPost}
            />
          </Suspense>
        )}

        {/* VIEW 9: LEGAL & COMPLIANCE PAGES (Privacy Policy, Terms, Cookies/Editorial Policy) */}
        {!selectedPost &&
          (activeView === 'privacidade' ||
            activeView === 'termos' ||
            activeView === 'cookies') && (
            <Suspense fallback={<ViewSuspenseFallback />}>
              <LegalPages
                page={activeView}
                onBackHome={() => navigateToView('inicio')}
                onNavigateLegal={(p) => navigateToView(p)}
              />
            </Suspense>
          )}
      </main>

      {/* Clean Footer with Logo + Clickable Legal & Compliance Links */}
      <footer
        className={`border-t border-stone-300 dark:border-[#1B3358] bg-white dark:bg-[#081224] text-[#081224] dark:text-[#F4F0E6] transition-colors ${
          showCookieConsent ? 'pb-28 sm:pb-14' : ''
        }`}
      >
        <div className="w-full px-3 sm:px-4 lg:px-5 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-stone-300 dark:border-[#1B3358]">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/logoachartemas.jpg"
                  alt="Logo Achar Temas"
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#F5B731] shrink-0"
                />
                <div className="font-display font-black text-2xl uppercase tracking-wide text-[#081224] dark:text-[#F5B731]">
                  Achar Temas
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed max-w-sm">
                Portal editorial independente. História, ciência, arte, biodiversidade, saúde e
                cultura com clareza e profundidade.
              </p>
            </div>

            <div className="md:col-span-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-3">
                Navegação
              </div>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('inicio')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('artigos', 'all')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
                  >
                    Acervo de Artigos
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('jogos')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
                  >
                    Jogos Autorais
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('loja')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
                  >
                    Vitrine Shopee
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('sobre')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
                  >
                    Sobre Nós
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('contato')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
                  >
                    Fale Conosco
                  </button>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/achar.temas?igsh=eTlqaGNwYnYydzB6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] inline-flex items-center gap-1.5"
                  >
                    <Instagram size={12} />
                    <span>Instagram @achar.temas</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F5B731] mb-3">
                Termos & Transparência Legal
              </div>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('privacidade')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer text-left"
                  >
                    Política de Privacidade & LGPD
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('termos')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer text-left"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToView('cookies')}
                    className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer text-left"
                  >
                    Política Editorial, Cookies & Comentários
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToView('admin')}
                      className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer text-left font-bold"
                    >
                      Painel Editorial (Admin)
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-slate-400">
            <div>© 2026 Achar Temas. Todos os direitos reservados.</div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigateToView('sobre')}
                className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
              >
                Sobre
              </button>
              <button
                type="button"
                onClick={() => navigateToView('contato')}
                className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
              >
                Contato
              </button>
              <button
                type="button"
                onClick={() => navigateToView('privacidade')}
                className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
              >
                Privacidade
              </button>
              <button
                type="button"
                onClick={() => navigateToView('termos')}
                className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
              >
                Termos de Uso
              </button>
              <button
                type="button"
                onClick={() => navigateToView('cookies')}
                className="hover:text-[#B45309] dark:hover:text-[#F5B731] cursor-pointer"
              >
                Cookies
              </button>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#081224] dark:hover:text-white"
              >
                Feed RSS
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#081224] dark:hover:text-white"
              >
                Sitemap XML
              </a>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#081224] dark:hover:text-white"
              >
                ads.txt
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Compact Floating LGPD / AdSense Cookie Consent Bar (<= 15% Sticky Cap on Mobile) */}
      {showCookieConsent && (
        <div
          role="region"
          aria-label="Aviso de Cookies e Privacidade"
          className="fixed bottom-3 left-3 right-3 sm:bottom-0 sm:left-0 sm:right-0 z-40 bg-[#081224]/95 backdrop-blur-md text-[#F4F0E6] border border-[#1B3358] sm:border-x-0 sm:border-b-0 rounded-2xl sm:rounded-none px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-2xl"
        >
          <div className="w-full flex items-center justify-between gap-2.5 sm:gap-4">
            <p className="text-[11px] sm:text-xs text-slate-200 leading-snug line-clamp-2 sm:line-clamp-none">
              Cookies de experiência e anúncios.{' '}
              <button
                type="button"
                onClick={() => navigateToView('privacidade')}
                className="text-[#F5B731] font-semibold hover:underline cursor-pointer"
              >
                Privacidade
              </button>
              {' · '}
              <button
                type="button"
                onClick={() => navigateToView('termos')}
                className="text-[#F5B731] font-semibold hover:underline cursor-pointer"
              >
                Termos
              </button>
              {' · '}
              <button
                type="button"
                onClick={() => navigateToView('cookies')}
                className="text-[#F5B731] font-semibold hover:underline cursor-pointer"
              >
                Cookies
              </button>
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCookieConsent(false);
                  navigateToView('cookies');
                }}
                className="min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl sm:rounded-sm border border-[#1B3358] text-[11px] sm:text-xs font-medium text-slate-200 hover:border-[#F5B731] cursor-pointer whitespace-nowrap"
              >
                Config.
              </button>
              <button
                type="button"
                onClick={handleAcceptCookies}
                className="min-h-[36px] px-3.5 sm:px-4 py-1 rounded-xl sm:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] text-[11px] sm:text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            allPosts={allPosts}
            categories={allCategories}
            onSelectPost={openPost}
          />
        </Suspense>
      )}
    </div>
  );
}
