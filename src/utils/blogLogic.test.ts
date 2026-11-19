import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import allPostsData from '../data/posts.json';
import { ARTICLE_SEO_MAP, getArticleSeo } from '../data/articleSeo';
import {
  EDITORIAL_PILLARS,
  LOCAL_POST_IMAGE_MAP,
  calculateReadingMetrics,
  createSlug,
  filterAndSortPosts,
  getPillarForPost,
  getPostHeroImage,
  getRelatedPosts,
  processArticleHtml,
  stripHtmlTags,
  buildArticleSchemaJsonLd,
  buildSiteSchemaJsonLd,
  buildCleanArticlePath,
  buildCleanViewUrl,
  parseRouteFromLocation,
  mergeEditorialPosts,
  toggleBookmarkId,
  Post,
} from './blogLogic';
import {
  buildRssFeedXml,
  buildSitemapXml,
  injectSeoMetaIntoHtml,
} from './seoHelpers';

const samplePosts: Post[] = [
  {
    id: 685,
    date: '2026-04-14T15:53:38',
    title: { rendered: 'Constantino ascensão do Cristianismo no Império Romano' },
    excerpt: { rendered: '<p>Como o imperador Constantino mudou a história de Roma.</p>' },
    content: {
      rendered:
        '<p>Introdução histórica.</p><h2>O Édito de Milão</h2><p>Texto detalhado sobre o Édito.</p><img src="https://achartemas.com/wp-content/uploads/2026/04/image-4.jpg" /><img src="https://achartemas.com/wp-content/uploads/2026/04/image-5.jpg" /><h3>Consequências Políticas</h3><p>Mais detalhes.</p>',
    },
    categories: [52],
  },
  {
    id: 666,
    date: '2026-02-12T21:25:14',
    title: { rendered: 'Figuras de Chladni: som e geometria revelados' },
    excerpt: { rendered: '<p>A cimática e os padrões geométricos do som.</p>' },
    content: {
      rendered: '<p>O físico Ernst Chladni demonstrou como ondas sonoras criam figuras.</p>',
    },
    categories: [45],
  },
  {
    id: 589,
    date: '2025-12-11T09:49:44',
    title: { rendered: 'Nikola Tesla' },
    excerpt: { rendered: '<p>O gênio da corrente alternada.</p>' },
    content: {
      rendered: '<p>Nikola Tesla revolucionou a engenharia elétrica mundial.</p>',
    },
    categories: [45],
  },
  {
    id: 183,
    date: '2025-06-22T13:03:10',
    title: { rendered: 'Acabamentos Inteligentes' },
    excerpt: { rendered: '<p>Dicas de reforma e construção.</p>' },
    content: {
      rendered: '<p>Como modernizar sua casa com economia.</p>',
    },
    categories: [1],
  },
];

test('all 36 post IDs and 6 pillar covers have valid binary image files on disk', () => {
  const keys = Object.keys(LOCAL_POST_IMAGE_MAP);
  assert.equal(keys.length, 36);

  const checkValidImageAsset = (relPath: string) => {
    assert.ok(relPath.startsWith('/'), `Expected local path starting with /, got ${relPath}`);
    assert.ok(!relPath.includes('http'), `Path should not be external: ${relPath}`);
    const cleanRel = relPath.replace(/^\//, '');
    const fullPath = relPath.startsWith('/src/')
      ? path.join(process.cwd(), cleanRel)
      : path.join(process.cwd(), 'public', cleanRel);
    assert.ok(fs.existsSync(fullPath), `Missing asset file on disk: ${fullPath}`);
    const buf = fs.readFileSync(fullPath).subarray(0, 16);
    const hex = buf.toString('hex');
    const isJpg = hex.startsWith('ffd8ff');
    const isPng = hex.startsWith('89504e47');
    const isWebp = buf.toString('ascii', 0, 4) === 'RIFF';
    const isAvif = buf.toString('ascii', 4, 12) === 'ftypavif';
    assert.ok(isJpg || isPng || isWebp || isAvif, `Corrupted or non-image file: ${relPath} (header=${hex})`);
  };

  for (const [, imgPath] of Object.entries(LOCAL_POST_IMAGE_MAP)) {
    checkValidImageAsset(imgPath);
  }
  for (const pillar of EDITORIAL_PILLARS) {
    checkValidImageAsset(pillar.coverImage);
  }
});

test('stripHtmlTags and createSlug normalize Portuguese text cleanly', () => {
  assert.equal(stripHtmlTags('<p>Olá, <strong>Mundo</strong> &amp; Ciência!</p>'), 'Olá, Mundo & Ciência!');
  assert.equal(createSlug('Construções ao longo dos séculos!'), 'construcoes-ao-longo-dos-seculos');
});

test('calculateReadingMetrics computes word count and minimum 1 min reading time', () => {
  const shortMetrics = calculateReadingMetrics('<p>Texto curto com cinco palavras.</p>');
  assert.equal(shortMetrics.wordCount, 5);
  assert.equal(shortMetrics.readingTimeMinutes, 1);

  const fourHundredWords = `<p>${new Array(400).fill('palavra').join(' ')}</p>`;
  const longMetrics = calculateReadingMetrics(fourHundredWords);
  assert.equal(longMetrics.wordCount, 400);
  assert.equal(longMetrics.readingTimeMinutes, 3);
});

test('processArticleHtml strips duplicate hero figure+figcaption, maps secondary local image, and extracts TOC', () => {
  const postWithFigure: Post = {
    ...samplePosts[0],
    content: {
      rendered:
        '<figure class="wp-block-image"><img src="https://achartemas.com/wp-content/uploads/2026/04/image-4.jpg" /><figcaption>Foto: Ilustrativa gerada por IA</figcaption></figure><p>Introdução histórica.</p><h2>O Édito de Milão</h2><p>Texto detalhado sobre o Édito.</p><figure class="wp-block-image"><img src="https://achartemas.com/wp-content/uploads/2026/04/image-5.jpg" /><figcaption>Foto: Ilustrativa gerada por IA</figcaption></figure><h3>Consequências Políticas</h3><p>Mais detalhes.</p>',
    },
  };
  const processed = processArticleHtml(postWithFigure);
  // image-4.jpg, orphan figcaption, and unmapped external inline images must all be removed cleanly
  assert.ok(!processed.html.includes('content-685-image-4.jpg'));
  assert.ok(!processed.html.includes('Ilustrativa gerada por IA'));
  assert.ok(!processed.html.includes('content-685-image-5.jpg'));
  // No external achartemas.com URLs remain
  assert.ok(!processed.html.includes('https://achartemas.com'));

  assert.equal(processed.toc.length, 2);
  assert.equal(processed.toc[0].text, 'O Édito de Milão');
  assert.equal(processed.toc[0].level, 2);
  assert.equal(processed.toc[1].text, 'Consequências Políticas');
  assert.equal(processed.toc[1].level, 3);
});

test('filterAndSortPosts filters by pillar, search query with accents, and sorts correctly', () => {
  const sciencePosts = filterAndSortPosts(samplePosts, { pillarId: 'ciencia-biodiversidade' });
  assert.equal(sciencePosts.length, 2);

  const searchResult = filterAndSortPosts(samplePosts, { searchQuery: 'imperio cristianismo' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 685);

  const uncategorizedPillar = getPillarForPost(samplePosts[3]);
  assert.equal(uncategorizedPillar.id, 'arquitetura-casa');
  assert.equal(EDITORIAL_PILLARS.length, 6);
});

test('getRelatedPosts and buildArticleSchemaJsonLd return valid outputs with FAQPage and Speakable', () => {
  const related = getRelatedPosts(samplePosts[1], samplePosts, 2);
  assert.equal(related.length, 2);
  // First related post for 666 (cat 45) should be 589 (also cat 45)
  assert.equal(related[0].id, 589);

  const schemaStr = buildArticleSchemaJsonLd(samplePosts[0], 'História');
  const parsed = JSON.parse(schemaStr);
  assert.equal(parsed['@graph'][0]['@type'], 'BlogPosting');
  assert.equal(parsed['@graph'][0].author.name, 'Redação Achar Temas');
  assert.equal(parsed['@graph'][0].isAccessibleForFree, true);
  assert.ok(parsed['@graph'][0].timeRequired.startsWith('PT'));
  assert.ok(parsed['@graph'][0].speakable);
  assert.ok(!schemaStr.toLowerCase().includes('neverson'));
  assert.ok(!schemaStr.toLowerCase().includes('quem-somos'));
  assert.equal(parsed['@graph'][1]['@type'], 'WebPage');
  assert.equal(parsed['@graph'][2]['@type'], 'BreadcrumbList');
  assert.equal(parsed['@graph'][3]['@type'], 'FAQPage');
  assert.equal(parsed['@graph'][3].mainEntity.length, 3);
  assert.ok(getPostHeroImage(samplePosts[0]).includes('content-685-image-4.jpg'));

  const siteSchema = JSON.parse(buildSiteSchemaJsonLd());
  assert.equal(siteSchema['@graph'][0]['@type'], 'WebSite');
  assert.equal(siteSchema['@graph'][1]['@type'], 'Organization');
});

test('all 36 articles have complete unique SEO profiles and valid heading hierarchy', () => {
  assert.equal(allPostsData.length, 36);
  const slugs = new Set<string>();
  const titles = new Set<string>();

  for (const post of allPostsData as Post[]) {
    const seo = ARTICLE_SEO_MAP[post.id];
    assert.ok(seo, `Missing ARTICLE_SEO_MAP entry for post ${post.id}`);
    assert.ok(seo.seoTitle.length >= 35 && seo.seoTitle.length <= 72, `SEO title out of range for ${post.id}: ${seo.seoTitle}`);
    assert.ok(
      seo.metaDescription.length >= 115 && seo.metaDescription.length <= 165,
      `Meta description out of range (${seo.metaDescription.length}) for ${post.id}`
    );
    assert.ok(seo.keywords.length >= 5, `Expected >= 5 keywords for post ${post.id}`);
    assert.ok(seo.keyTakeaways.length >= 3, `Expected >= 3 keyTakeaways for post ${post.id}`);
    assert.equal(seo.faqs.length, 3, `Expected 3 FAQs for post ${post.id}`);

    assert.ok(!slugs.has(seo.slug), `Duplicate slug: ${seo.slug}`);
    slugs.add(seo.slug);
    assert.ok(!titles.has(seo.seoTitle), `Duplicate seoTitle: ${seo.seoTitle}`);
    titles.add(seo.seoTitle);

    const processed = processArticleHtml(post);
    // Every article with headings must now start at h2 (no orphan h3 without h2)
    if (processed.toc.length > 0) {
      assert.ok(
        processed.toc.some((item) => item.level === 2),
        `Post ${post.id} has TOC items but no level 2 (H2) heading`
      );
    }
    const resolved = getArticleSeo(post);
    assert.equal(resolved.slug, seo.slug);
  }
});

test('clean URL router, CMS post merger, bookmarks, RSS 2.0, Sitemap, and SSR HTML injector work accurately', () => {
  assert.equal(buildCleanArticlePath('constantino'), '/artigo/constantino');
  assert.equal(buildCleanViewUrl('sobre'), '/sobre');
  assert.equal(buildCleanViewUrl('artigos', 'historia-cultura'), '/artigos?pillar=historia-cultura');

  const cleanArticleRoute = parseRouteFromLocation(
    '/artigo/constantino-ascensao-cristianismo-imperio-romano',
    ''
  );
  assert.equal(cleanArticleRoute.view, 'artigos');
  assert.equal(cleanArticleRoute.articleSlug, 'constantino-ascensao-cristianismo-imperio-romano');

  const legacyRoute = parseRouteFromLocation('/', '?post=685&tema=constantino-ascensao-cristianismo-imperio-romano');
  assert.equal(legacyRoute.articleId, '685');

  const sobreRoute = parseRouteFromLocation('/sobre', '');
  assert.equal(sobreRoute.view, 'sobre');

  const merged = mergeEditorialPosts(samplePosts, [
    {
      docId: 'cms_1001',
      postId: 1001,
      slug: 'artigo-novo-teste',
      title: 'Artigo Novo Publicado',
      excerpt: 'Resumo editorial novo.',
      contentHtml: '<p>Conteúdo publicado via CMS.</p>',
      categoryId: 49,
      heroImage: '/wp-images/content-685-image-4.jpg',
      published: true,
      focusKeyword: 'Teste CMS',
      metaDescription: 'Descrição CMS',
      authorUid: 'admin_1',
      createdAtIso: '2026-11-18T12:00:00Z',
      updatedAtIso: '2026-11-18T12:00:00Z',
    },
    {
      docId: 'cms_1002',
      postId: 1002,
      slug: 'rascunho-oculto',
      title: 'Rascunho Privado',
      excerpt: 'Não deve aparecer.',
      contentHtml: '<p>Conteúdo privado.</p>',
      categoryId: 49,
      heroImage: '',
      published: false,
      focusKeyword: '',
      metaDescription: '',
      authorUid: 'admin_1',
      createdAtIso: '2026-11-19T12:00:00Z',
      updatedAtIso: '2026-11-19T12:00:00Z',
    },
  ]);
  assert.equal(merged.length, samplePosts.length + 1);
  assert.equal(merged[0].id, 1001);

  assert.deepEqual(toggleBookmarkId([685], 666), [666, 685]);
  assert.deepEqual(toggleBookmarkId([666, 685], 666), [685]);

  const rssXml = buildRssFeedXml(
    samplePosts,
    (p) => ({
      slug: getArticleSeo(p as Post).slug,
      heroPath: getPostHeroImage(p as Post),
      categoryName: 'História',
    }),
    'https://achartemas.com'
  );
  assert.ok(rssXml.includes('<rss version="2.0"'));
  assert.ok(rssXml.includes('https://achartemas.com/artigo/constantino-ascensao-cristianismo-imperio-romano'));

  const sitemapXml = buildSitemapXml(
    samplePosts,
    (p) => ({
      slug: getArticleSeo(p as Post).slug,
      heroPath: getPostHeroImage(p as Post),
    }),
    'https://achartemas.com'
  );
  assert.ok(sitemapXml.includes('https://achartemas.com/sobre'));
  assert.ok(sitemapXml.includes('https://achartemas.com/jogos'));
  assert.ok(sitemapXml.includes('https://achartemas.com/artigo/constantino-ascensao-cristianismo-imperio-romano'));

  const templateHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
  const injected = injectSeoMetaIntoHtml(templateHtml, {
    title: 'Constantino — Teste SSR',
    description: 'Descrição SSR única do artigo.',
    keywords: 'Constantino, Roma',
    canonicalUrl: 'https://achartemas.com/artigo/constantino-ascensao-cristianismo-imperio-romano',
    ogType: 'article',
    ogUrl: 'https://achartemas.com/artigo/constantino-ascensao-cristianismo-imperio-romano',
    ogImage: 'https://achartemas.com/wp-images/content-685-image-4.jpg',
    ogImageAlt: 'Constantino',
    rssUrl: 'https://achartemas.com/rss.xml',
  });
  assert.ok(injected.includes('<title>Constantino — Teste SSR</title>'));
  assert.ok(injected.includes('property="og:image" content="https://achartemas.com/wp-images/content-685-image-4.jpg"'));
  assert.ok(injected.includes('application/rss+xml'));
});

