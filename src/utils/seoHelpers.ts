export interface SeoHtmlMetaPayload {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string;
  jsonLd?: string;
  rssUrl?: string;
}

export interface MinimalPostForSeo {
  id: number;
  date: string;
  modified?: string;
  slug?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  customHeroImage?: string;
}

export interface MinimalSeoEntry {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
}

export function escapeXmlText(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function escapeHtmlAttribute(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function stripHtmlPlain(html: string): string {
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

export function buildSlugPlain(text: string): string {
  return stripHtmlPlain(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function replaceMetaContent(html: string, attrName: string, attrVal: string, content: string): string {
  const escaped = escapeHtmlAttribute(content);
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attrName}=["']${attrVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
    'i'
  );
  if (pattern.test(html)) {
    return html.replace(pattern, `<meta ${attrName}="${attrVal}" content="${escaped}" />`);
  }
  return html.replace('</head>', `  <meta ${attrName}="${attrVal}" content="${escaped}" />\n  </head>`);
}

export function injectSeoMetaIntoHtml(html: string, meta: SeoHtmlMetaPayload): string {
  let out = html;

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeXmlText(meta.title)}</title>`);
  out = replaceMetaContent(out, 'name', 'description', meta.description);
  out = replaceMetaContent(out, 'name', 'keywords', meta.keywords);

  const canonicalEscaped = escapeHtmlAttribute(meta.canonicalUrl);
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonicalEscaped}" />`
    );
  }

  out = replaceMetaContent(out, 'property', 'og:type', meta.ogType);
  out = replaceMetaContent(out, 'property', 'og:url', meta.ogUrl);
  out = replaceMetaContent(out, 'property', 'og:title', meta.title);
  out = replaceMetaContent(out, 'property', 'og:description', meta.description);
  out = replaceMetaContent(out, 'property', 'og:image', meta.ogImage);
  out = replaceMetaContent(out, 'property', 'og:image:alt', meta.ogImageAlt);

  out = replaceMetaContent(out, 'property', 'article:published_time', meta.publishedTime || '');
  out = replaceMetaContent(out, 'property', 'article:modified_time', meta.modifiedTime || '');
  out = replaceMetaContent(out, 'property', 'article:section', meta.section || '');
  out = replaceMetaContent(out, 'property', 'article:tag', meta.tags || '');

  out = replaceMetaContent(out, 'name', 'twitter:title', meta.title);
  out = replaceMetaContent(out, 'name', 'twitter:description', meta.description);
  out = replaceMetaContent(out, 'name', 'twitter:image', meta.ogImage);
  out = replaceMetaContent(out, 'name', 'twitter:image:alt', meta.ogImageAlt);

  if (meta.jsonLd) {
    const safeJsonLd = meta.jsonLd.replace(/<\/script/gi, '<\\/script');
    out = out.replace(
      /<script\s+id=["']schema-jsonld["'][^>]*>[\s\S]*?<\/script>/i,
      `<script id="schema-jsonld" type="application/ld+json">\n${safeJsonLd}\n    </script>`
    );
  }

  if (meta.rssUrl && !out.includes('application/rss+xml')) {
    out = out.replace(
      '</head>',
      `  <link rel="alternate" type="application/rss+xml" title="Achar Temas — Feed RSS" href="${escapeHtmlAttribute(meta.rssUrl)}" />\n  </head>`
    );
  }

  return out;
}

export function buildRssFeedXml(
  posts: MinimalPostForSeo[],
  resolveSlugAndHero: (post: MinimalPostForSeo) => { slug: string; heroPath: string; categoryName: string },
  siteUrl = 'https://achartemas.com'
): string {
  const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastBuildDate = sorted[0] ? new Date(sorted[0].date).toUTCString() : new Date().toUTCString();

  const itemsXml = sorted
    .map((post) => {
      const title = stripHtmlPlain(post.title.rendered);
      const description = stripHtmlPlain(post.excerpt.rendered);
      const { slug, heroPath, categoryName } = resolveSlugAndHero(post);
      const link = `${cleanSiteUrl}/artigo/${slug}`;
      const imageUrl = heroPath.startsWith('http') ? heroPath : `${cleanSiteUrl}${heroPath}`;
      const pubDate = new Date(post.date).toUTCString();
      return `    <item>
      <title>${escapeXmlText(title)}</title>
      <link>${escapeXmlText(link)}</link>
      <guid isPermaLink="true">${escapeXmlText(link)}</guid>
      <pubDate>${escapeXmlText(pubDate)}</pubDate>
      <category>${escapeXmlText(categoryName)}</category>
      <description>${escapeXmlText(description)}</description>
      <enclosure url="${escapeXmlText(imageUrl)}" type="image/jpeg" />
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Achar Temas — Portal Editorial</title>
    <link>${escapeXmlText(cleanSiteUrl)}/</link>
    <atom:link href="${escapeXmlText(cleanSiteUrl)}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Reportagens e ensaios sobre história, ciência, biodiversidade, arte, saúde e cultura pop.</description>
    <language>pt-BR</language>
    <lastBuildDate>${escapeXmlText(lastBuildDate)}</lastBuildDate>
${itemsXml}
  </channel>
</rss>
`;
}

export function buildSitemapXml(
  posts: MinimalPostForSeo[],
  resolveSlugAndHero: (post: MinimalPostForSeo) => { slug: string; heroPath: string },
  siteUrl = 'https://achartemas.com'
): string {
  const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/artigos', changefreq: 'daily', priority: '0.9' },
    { path: '/jogos', changefreq: 'weekly', priority: '0.8' },
    { path: '/sobre', changefreq: 'monthly', priority: '0.7' },
    { path: '/contato', changefreq: 'monthly', priority: '0.6' },
    { path: '/loja', changefreq: 'weekly', priority: '0.7' },
    { path: '/privacidade', changefreq: 'monthly', priority: '0.4' },
    { path: '/termos', changefreq: 'monthly', priority: '0.4' },
    { path: '/cookies', changefreq: 'monthly', priority: '0.4' },
  ];

  const staticXml = staticRoutes
    .map(
      (r) =>
        `  <url><loc>${escapeXmlText(`${cleanSiteUrl}${r.path}`)}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
    )
    .join('\n');

  const postsXml = posts
    .map((post) => {
      const title = stripHtmlPlain(post.title.rendered);
      const { slug, heroPath } = resolveSlugAndHero(post);
      const loc = `${cleanSiteUrl}/artigo/${slug}`;
      const lastmod = (post.modified || post.date || '').slice(0, 10);
      const imgUrl = heroPath.startsWith('http') ? heroPath : `${cleanSiteUrl}${heroPath}`;
      return `  <url><loc>${escapeXmlText(loc)}</loc>${lastmod ? `<lastmod>${escapeXmlText(lastmod)}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.85</priority><image:image><image:loc>${escapeXmlText(imgUrl)}</image:loc><image:title>${escapeXmlText(title)}</image:title></image:image></url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${postsXml}
</urlset>
`;
}
