import { getArticleSeo } from '../data/articleSeo.ts';

export type ActiveView =
  | 'inicio'
  | 'artigos'
  | 'jogos'
  | 'loja'
  | 'sobre'
  | 'contato'
  | 'privacidade'
  | 'termos'
  | 'cookies'
  | 'admin';

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

export interface Post {
  id: number;
  date: string;
  modified?: string;
  slug?: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  categories: number[];
  customHeroImage?: string;
  customFocusKeyword?: string;
  customMetaDescription?: string;
  isCmsArticle?: boolean;
  cmsDocId?: string;
}

export interface EditorialArticleDoc {
  docId: string;
  postId: number;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  categoryId: number;
  heroImage: string;
  published: boolean;
  focusKeyword: string;
  metaDescription: string;
  authorUid: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface WPComment {
  id: number;
  author_name: string;
  date: string;
  content: { rendered: string };
  author_avatar_urls?: { [key: string]: string };
  post: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface EditorialPillar {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  categoryIds: number[];
  coverImage: string;
}

export const EDITORIAL_PILLARS: EditorialPillar[] = [
  {
    id: 'historia-cultura',
    title: 'História, Engenharia & Cultura Pop',
    shortTitle: 'História & Cultura',
    subtitle: 'Impérios antigos, grandes obras da engenharia humana e ícones da música e cultura pop.',
    categoryIds: [49, 52, 27],
    coverImage: '/wp-images/content-685-image-4.jpg',
  },
  {
    id: 'ciencia-biodiversidade',
    title: 'Ciência & Biodiversidade',
    shortTitle: 'Ciência & Natureza',
    subtitle: 'Mentes brilhantes da física, fenômenos acústicos, fauna marinha e botânica prática.',
    categoryIds: [45, 50],
    coverImage: '/wp-images/content-666-image.jpg',
  },
  {
    id: 'arte-curiosidades',
    title: 'Arte, Tradições & Curiosidades',
    shortTitle: 'Arte & Curiosidades',
    subtitle: 'Grandes mestres da pintura, origens históricas das celebrações e mistérios culturais.',
    categoryIds: [44, 47],
    coverImage: '/wp-images/content-560-image.jpg',
  },
  {
    id: 'gastronomia-moda-mobilidade',
    title: 'Gastronomia, Moda & Mobilidade',
    shortTitle: 'Cotidiano & Mobilidade',
    subtitle: 'Sabores regionais, sustentabilidade têxtil e as máquinas que transformaram o século XX.',
    categoryIds: [51, 38, 48],
    coverImage: '/wp-images/content-497-image-4.jpg',
  },
  {
    id: 'saude-esporte',
    title: 'Saúde, Mente & Esporte',
    shortTitle: 'Saúde & Esporte',
    subtitle: 'Equilíbrio emocional, prevenção neurológica e performance física na corrida e natação.',
    categoryIds: [39, 53],
    coverImage: '/wp-images/content-639-image.jpg',
  },
  {
    id: 'arquitetura-casa',
    title: 'Arquitetura, Casa & Construção',
    shortTitle: 'Casa & Construção',
    subtitle: 'Acabamentos inteligentes, materiais econômicos, formas artesanais e cuidado residencial.',
    categoryIds: [1],
    coverImage: '/src/assets/images/acabamentos_inteligentes_casa_1795095031186.jpg',
  },
];

// Deterministic 100% local image map covering all 36 articles (Zero external Pollinations/WP calls)
export const LOCAL_POST_IMAGE_MAP: Record<number, string> = {
  154: '/src/assets/images/formas_caseiras_casa_1795095036903.jpg',
  172: '/src/assets/images/materiais_construcao_economicos_1795095050291.jpg',
  183: '/src/assets/images/acabamentos_inteligentes_casa_1795095031186.jpg',
  280: '/wp-images/content-280-image.jpg',
  294: '/src/assets/images/maravilhas_engenharia_antiga_1795095041682.jpg',
  307: '/wp-images/content-307-image-7.jpg',
  368: '/src/assets/images/prevencao_mofo_casa_1795095049129.jpg',
  400: '/wp-images/content-400-image-4.jpg',
  420: '/wp-images/content-420-image-7.jpg',
  462: '/src/assets/images/corrida_rua_esporte_1795095041679.jpg',
  475: '/wp-images/content-475-image.jpg',
  484: '/wp-images/content-484-image-2.jpg',
  497: '/wp-images/content-497-image-4.jpg',
  508: '/wp-images/content-508-image-6.jpg',
  515: '/src/assets/images/saude_neurologica_avc_1795095041242.jpg',
  529: '/src/assets/images/ansiedade_equilibrio_burnout_1795095041843.jpg',
  536: '/wp-images/content-536-image-6.jpg',
  543: '/wp-images/content-543-image-9.jpg',
  554: '/wp-images/content-554-image-11.jpg',
  560: '/wp-images/content-560-image.jpg',
  570: '/wp-images/content-570-image-2.jpg',
  574: '/wp-images/content-574-image-3.jpg',
  579: '/wp-images/content-579-image-4.jpg',
  584: '/wp-images/content-584-image.jpg',
  589: '/wp-images/content-589-image-1.jpg',
  594: '/regenerated_image_1777480657911.png',
  599: '/regenerated_image_1777480656768.png',
  639: '/wp-images/content-639-image.jpg',
  645: '/wp-images/content-645-image-1.jpg',
  650: '/wp-images/content-650-image-2.jpg',
  655: '/wp-images/content-655-image-3.jpg',
  659: '/wp-images/content-659-WhatsApp-Image-2026-01-30-at-21.00.45-1024x682.jpeg',
  666: '/wp-images/content-666-image.jpg',
  669: '/wp-images/content-669-image-1.jpg',
  678: '/wp-images/content-678-image-2.jpg',
  685: '/wp-images/content-685-image-4.jpg',
};

// Extra verified local inline images (legacy corrupted WordPress inline files are stripped cleanly)
const LOCAL_INLINE_IMAGES: Record<string, string> = {
  '678:image-2.jpg': '/wp-images/content-678-image-2.jpg',
  '685:image-4.jpg': '/wp-images/content-685-image-4.jpg',
};

export function getPostHeroImage(post: Post): string {
  if (post.customHeroImage && post.customHeroImage.trim().length > 0) {
    return post.customHeroImage.trim();
  }
  return LOCAL_POST_IMAGE_MAP[post.id] || '/wp-images/content-685-image-4.jpg';
}

export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8211;|&#8212;|&mdash;|&ndash;/gi, '—')
    .replace(/&#8217;|&#8216;/gi, "'")
    .replace(/&#8220;|&#8221;/gi, '"')
    .replace(/&#8230;|&hellip;/gi, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createSlug(text: string): string {
  return stripHtmlTags(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadingMetrics(htmlContent: string): {
  wordCount: number;
  readingTimeMinutes: number;
} {
  const plainText = stripHtmlTags(htmlContent);
  if (!plainText) {
    return { wordCount: 0, readingTimeMinutes: 1 };
  }
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 190));
  return { wordCount, readingTimeMinutes };
}

export function getPillarForPost(post: Post): EditorialPillar {
  for (const pillar of EDITORIAL_PILLARS) {
    if (post.categories.some((catId) => pillar.categoryIds.includes(catId))) {
      return pillar;
    }
  }
  return EDITORIAL_PILLARS[0];
}

export function getCategoryNameForPost(post: Post, categories: Category[]): string {
  const pillar = getPillarForPost(post);
  const matchedCat = categories.find((c) => post.categories.includes(c.id) && c.id !== 1);
  if (matchedCat) {
    return matchedCat.name;
  }
  return pillar.shortTitle;
}

export function formatEditorialDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Rewrites external WordPress image tags to local /wp-images/ paths (or removes duplicate hero images),
 * and injects deterministic section anchor IDs into <h2> and <h3> tags for Table of Contents navigation.
 */
export function processArticleHtml(post: Post): {
  html: string;
  toc: TocItem[];
} {
  let raw = post.content?.rendered || '';
  const heroSrc = getPostHeroImage(post);
  const seenImages = new Set<string>([heroSrc]);

  // Single-pass rewrite for <figure> blocks and standalone <img> tags so mapped local images are never re-processed
  raw = raw.replace(
    /(<figure[^>]*>[\s\S]*?<\/figure>|<img[^>]*src=["'][^"']+["'][^>]*>)/gi,
    (match) => {
      const imgMatch = match.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (!imgMatch) return '';
      const srcUrl = imgMatch[1];
      const fileName = srcUrl.split('/').pop() || '';
      const key = `${post.id}:${fileName}`;
      const mappedLocal = LOCAL_INLINE_IMAGES[key];

      if (mappedLocal && !seenImages.has(mappedLocal)) {
        seenImages.add(mappedLocal);
        const cleanTitle = stripHtmlTags(post.title.rendered);
        if (match.toLowerCase().startsWith('<figure')) {
          return `<figure><img src="${mappedLocal}" alt="${cleanTitle}" loading="lazy" decoding="async" /><figcaption>Ilustração editorial complementar — ${cleanTitle}</figcaption></figure>`;
        }
        return `<img src="${mappedLocal}" alt="${cleanTitle}" loading="lazy" decoding="async" />`;
      }
      return '';
    }
  );

  // Repair semantic heading hierarchy for articles lacking any <h2> (e.g. posts 280, 294, 307)
  // so every essay follows valid H1 -> H2 -> H3 outline for Google crawler indexing.
  const hasH2 = /<h2[\s>]/i.test(raw);
  if (!hasH2 && /<h3[\s>]/i.test(raw)) {
    raw = raw.replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/gi, '<h2$1>$2</h2>');
  }

  const toc: TocItem[] = [];
  let headingIndex = 0;

  const htmlWithIds = raw.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag: string, attrs: string, inner: string) => {
    const text = stripHtmlTags(inner);
    if (!text) return full;
    headingIndex += 1;
    const slug = createSlug(text) || `secao-${headingIndex}`;
    const id = `sec-${headingIndex}-${slug}`;
    const level = tag.toLowerCase() === 'h2' ? 2 : 3;
    toc.push({ id, text, level });
    // Remove existing id attribute if any
    const cleanAttrs = attrs.replace(/\s+id=["'][^"']*["']/gi, '');
    return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
  });

  return { html: htmlWithIds, toc };
}

export function filterAndSortPosts(
  posts: Post[],
  options: {
    pillarId?: string | null;
    categoryIds?: number[];
    searchQuery?: string;
    sortBy?: 'recent' | 'reading-time' | 'title';
  }
): Post[] {
  let result = [...posts];

  if (options.pillarId && options.pillarId !== 'all') {
    const pillar = EDITORIAL_PILLARS.find((p) => p.id === options.pillarId);
    if (pillar) {
      result = result.filter((post) =>
        post.categories.some((catId) => pillar.categoryIds.includes(catId))
      );
    }
  } else if (options.categoryIds && options.categoryIds.length > 0) {
    result = result.filter((post) =>
      post.categories.some((catId) => options.categoryIds!.includes(catId))
    );
  }

  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const terms = options.searchQuery
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    result = result.filter((post) => {
      const searchable = `${stripHtmlTags(post.title.rendered)} ${stripHtmlTags(post.excerpt.rendered)} ${stripHtmlTags(post.content.rendered)}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return terms.every((term) => searchable.includes(term));
    });
  }

  const sortBy = options.sortBy || 'recent';
  if (sortBy === 'recent') {
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy === 'reading-time') {
    result.sort(
      (a, b) =>
        calculateReadingMetrics(b.content.rendered).wordCount -
        calculateReadingMetrics(a.content.rendered).wordCount
    );
  } else if (sortBy === 'title') {
    result.sort((a, b) =>
      stripHtmlTags(a.title.rendered).localeCompare(stripHtmlTags(b.title.rendered), 'pt-BR')
    );
  }

  return result;
}

export function getRelatedPosts(currentPost: Post, allPosts: Post[], limit = 3): Post[] {
  const pillar = getPillarForPost(currentPost);
  const candidates = allPosts.filter((p) => p.id !== currentPost.id);

  const sameCategory = candidates.filter((p) =>
    p.categories.some((c) => currentPost.categories.includes(c))
  );

  const samePillar = candidates.filter(
    (p) =>
      !sameCategory.some((sc) => sc.id === p.id) &&
      p.categories.some((c) => pillar.categoryIds.includes(c))
  );

  const combined = [...sameCategory, ...samePillar, ...candidates];
  const unique: Post[] = [];
  const seen = new Set<number>();
  for (const item of combined) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
    if (unique.length >= limit) break;
  }
  return unique;
}

export function buildSiteSchemaJsonLd(): string {
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://achartemas.com/#website',
          url: 'https://achartemas.com/',
          name: 'Achar Temas',
          description:
            'Entenda o mundo com mais clareza. Portal editorial independente sobre história, ciência, biodiversidade, arte, saúde e cultura pop.',
          inLanguage: 'pt-BR',
          publisher: {
            '@id': 'https://achartemas.com/#organization',
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://achartemas.com/?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          '@id': 'https://achartemas.com/#organization',
          name: 'Achar Temas',
          url: 'https://achartemas.com/',
          logo: {
            '@type': 'ImageObject',
            url: 'https://achartemas.com/logoachartemas.jpg',
            width: 320,
            height: 320,
          },
          sameAs: ['https://www.instagram.com/achar.temas'],
        },
      ],
    },
    null,
    2
  );
}

export function buildArticleSchemaJsonLd(post: Post, categoryName: string): string {
  const title = stripHtmlTags(post.title.rendered);
  const seo = getArticleSeo(post, categoryName);
  const heroPath = getPostHeroImage(post);
  const imageUrl = heroPath.startsWith('http') ? heroPath : `https://achartemas.com${heroPath}`;
  const metrics = calculateReadingMetrics(post.content.rendered);
  const canonicalUrl = `https://achartemas.com/artigo/${seo.slug}`;
  const description = post.customMetaDescription?.trim() || seo.metaDescription;
  const focusKeyword = post.customFocusKeyword?.trim() || seo.focusKeyword;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      headline: seo.seoTitle,
      alternativeHeadline: title,
      description,
      keywords: seo.keywords.join(', '),
      about: {
        '@type': 'Thing',
        name: focusKeyword,
      },
      image: [
        {
          '@type': 'ImageObject',
          url: imageUrl,
          width: 1376,
          height: 768,
        },
      ],
      datePublished: post.date,
      dateModified: post.modified || post.date,
      wordCount: metrics.wordCount,
      timeRequired: `PT${metrics.readingTimeMinutes}M`,
      articleSection: categoryName,
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.editorial-takeaways'],
      },
      author: {
        '@type': 'Organization',
        name: 'Redação Achar Temas',
        url: 'https://achartemas.com/',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Achar Temas',
        logo: {
          '@type': 'ImageObject',
          url: 'https://achartemas.com/logoachartemas.jpg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    },
    {
      '@type': 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      name: `${seo.seoTitle} — Achar Temas`,
      description: seo.metaDescription,
      inLanguage: 'pt-BR',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: imageUrl,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: 'https://achartemas.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: categoryName,
          item: 'https://achartemas.com/artigos',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: canonicalUrl,
        },
      ],
    },
  ];

  if (seo.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: seo.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
    null,
    2
  );
}

// ---------- Clean Path URL Routing & CMS Merging & Bookmarks ----------

export const VALID_VIEWS: ActiveView[] = [
  'inicio',
  'artigos',
  'jogos',
  'loja',
  'sobre',
  'contato',
  'privacidade',
  'termos',
  'cookies',
  'admin',
];

export function buildCleanArticlePath(slug: string): string {
  const clean = (slug || '').replace(/^\/+|\/+$/g, '');
  return `/artigo/${clean}`;
}

export function buildCleanViewUrl(view: ActiveView, pillarId?: string): string {
  if (view === 'inicio') return '/';
  if (view === 'artigos' && pillarId && pillarId !== 'all') {
    return `/artigos?pillar=${encodeURIComponent(pillarId)}`;
  }
  return `/${view}`;
}

export interface ParsedAppRoute {
  view: ActiveView;
  articleSlug: string | null;
  articleId: string | null;
  pillarId: string | null;
}

export function parseRouteFromLocation(pathname: string, search: string): ParsedAppRoute {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search || '');
  const postIdParam = params.get('post');
  const temaParam = params.get('tema');
  const tabParam = params.get('tab') as ActiveView | null;
  const pillarParam = params.get('pillar');

  if (cleanPath.startsWith('/artigo/')) {
    const slugSegment = decodeURIComponent(cleanPath.slice('/artigo/'.length)).trim();
    if (slugSegment) {
      return {
        view: 'artigos',
        articleSlug: slugSegment,
        articleId: postIdParam,
        pillarId: null,
      };
    }
  }

  if (postIdParam || temaParam) {
    return {
      view: 'artigos',
      articleSlug: temaParam,
      articleId: postIdParam,
      pillarId: null,
    };
  }

  const pathSegment = cleanPath.slice(1) as ActiveView;
  if (VALID_VIEWS.includes(pathSegment)) {
    return {
      view: pathSegment,
      articleSlug: null,
      articleId: null,
      pillarId:
        pathSegment === 'artigos' &&
        pillarParam &&
        EDITORIAL_PILLARS.some((p) => p.id === pillarParam)
          ? pillarParam
          : null,
    };
  }

  if (pillarParam && EDITORIAL_PILLARS.some((p) => p.id === pillarParam)) {
    return {
      view: 'artigos',
      articleSlug: null,
      articleId: null,
      pillarId: pillarParam,
    };
  }

  if (tabParam && VALID_VIEWS.includes(tabParam)) {
    return {
      view: tabParam,
      articleSlug: null,
      articleId: null,
      pillarId: null,
    };
  }

  return {
    view: 'inicio',
    articleSlug: null,
    articleId: null,
    pillarId: null,
  };
}

export function mergeEditorialPosts(
  basePosts: Post[],
  cmsArticles: EditorialArticleDoc[]
): Post[] {
  const byId = new Map<number, Post>();
  for (const base of basePosts) {
    byId.set(base.id, base);
  }

  for (const docItem of cmsArticles) {
    if (!docItem.published) continue;
    byId.set(docItem.postId, {
      id: docItem.postId,
      date: docItem.createdAtIso || new Date().toISOString(),
      modified: docItem.updatedAtIso || docItem.createdAtIso,
      slug: docItem.slug,
      title: { rendered: docItem.title },
      excerpt: { rendered: `<p>${docItem.excerpt}</p>` },
      content: { rendered: docItem.contentHtml },
      categories: [docItem.categoryId || 49],
      customHeroImage: docItem.heroImage || undefined,
      customFocusKeyword: docItem.focusKeyword || undefined,
      customMetaDescription: docItem.metaDescription || undefined,
      isCmsArticle: true,
      cmsDocId: docItem.docId,
    });
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export const BOOKMARKS_STORAGE_KEY = 'achar_temas_saved_posts';

export function toggleBookmarkId(currentIds: number[], postId: number): number[] {
  if (currentIds.includes(postId)) {
    return currentIds.filter((id) => id !== postId);
  }
  return [postId, ...currentIds];
}

export function loadBookmarkedPostIds(): number[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'number' && Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
}

export function saveBookmarkedPostIds(ids: number[]): void {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

export const EDITORIAL_ADMIN_EMAIL = 'braian.kleber.camargo@gmail.com';

export function isEditorialAdminUser(
  user: { email?: string | null; emailVerified?: boolean } | null | undefined
): boolean {
  return Boolean(user && user.emailVerified === true && user.email === EDITORIAL_ADMIN_EMAIL);
}


