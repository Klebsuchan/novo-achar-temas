import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {
  ActiveView,
  Category,
  Post,
  buildArticleSchemaJsonLd,
  buildSiteSchemaJsonLd,
  getCategoryNameForPost,
  getPostHeroImage,
  parseRouteFromLocation,
  stripHtmlTags,
} from '../utils/blogLogic.ts';
import { getArticleSeo } from '../data/articleSeo.ts';
import {
  buildRssFeedXml,
  buildSitemapXml,
  escapeXmlText,
  injectSeoMetaIntoHtml,
} from '../utils/seoHelpers.ts';

const ADMIN_EMAIL = 'braian.kleber.camargo@gmail.com';

function resolveProjectFile(relPath: string): string {
  const candidates = [
    path.resolve(process.cwd(), relPath),
    path.resolve(import.meta.dirname, '..', '..', relPath),
    path.resolve(import.meta.dirname, '..', relPath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return candidates[0];
}

function readJsonFile<T>(relPath: string): T {
  const fullPath = resolveProjectFile(relPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
}

const basePosts = readJsonFile<Post[]>('src/data/posts.json');
const allCategories = readJsonFile<Category[]>('src/data/categories.json');
const firebaseConfig = readJsonFile<{ apiKey: string; projectId: string }>(
  'firebase-applet-config.json'
);

export function getRequestOrigin(req: express.Request): string {
  const configured = (process.env.SITE_URL || process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (configured && configured.startsWith('http') && !configured.includes('MY_APP_URL')) {
    return configured;
  }
  const protoHeader =
    (req.headers['x-forwarded-proto'] as string | undefined) || req.protocol || 'https';
  const hostHeader = (req.headers['x-forwarded-host'] as string | undefined) || req.get('host');
  if (hostHeader) {
    return `${protoHeader.split(',')[0].trim()}://${hostHeader.split(',')[0].trim()}`;
  }
  return 'https://achartemas.com';
}

function buildNewsletterDigestHtml(params: {
  articleTitle: string;
  articleUrl: string;
  articleExcerpt: string;
  heroImageUrl: string;
  categoryName: string;
}): string {
  const safeTitle = escapeXmlText(params.articleTitle);
  const safeUrl = escapeXmlText(params.articleUrl);
  const safeExcerpt = escapeXmlText(params.articleExcerpt);
  const safeImage = escapeXmlText(params.heroImageUrl);
  const safeCategory = escapeXmlText(params.categoryName);

  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><title>${safeTitle} — Achar Temas</title></head>
<body style="margin:0;padding:0;background:#F4F1E8;font-family:Arial,Helvetica,sans-serif;color:#081224;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E0D4;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#081224;padding:20px 24px;color:#F5B731;font-weight:900;font-size:20px;letter-spacing:1px;text-transform:uppercase;">
              Achar Temas
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <img src="${safeImage}" alt="${safeTitle}" style="width:100%;max-height:300px;object-fit:cover;display:block;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#B45309;letter-spacing:1px;margin-bottom:8px;">
                Novo Artigo · ${safeCategory}
              </div>
              <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.2;color:#081224;">
                ${safeTitle}
              </h1>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#334155;">
                ${safeExcerpt}
              </p>
              <a href="${safeUrl}" style="display:inline-block;background:#F5B731;color:#081224;text-decoration:none;font-weight:800;font-size:13px;text-transform:uppercase;padding:12px 22px;border-radius:6px;">
                Ler Artigo Completo
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#F8F6F0;font-size:12px;color:#64748B;border-top:1px solid #E5E0D4;">
              Você recebeu este e-mail por acompanhar o portal Achar Temas.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function verifyFirebaseAdminToken(
  idToken: string
): Promise<{ email: string; emailVerified: boolean } | null> {
  if (!idToken || !firebaseConfig.apiKey) return null;
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!resp.ok) return null;
  const data = (await resp.json()) as {
    users?: Array<{ email?: string; emailVerified?: boolean }>;
  };
  const user = data.users?.[0];
  if (!user || !user.email) return null;
  return { email: user.email, emailVerified: Boolean(user.emailVerified) };
}

export function renderSeoHtmlForRequest(rawHtml: string, req: express.Request): string {
  const url = req.originalUrl || '/';
  const origin = getRequestOrigin(req);
  const parsed = parseRouteFromLocation(
    req.path,
    url.includes('?') ? url.slice(url.indexOf('?')) : ''
  );

  let matchedPost: Post | undefined;
  if (parsed.articleId || parsed.articleSlug) {
    matchedPost = basePosts.find((p) => {
      if (parsed.articleId && String(p.id) === parsed.articleId) return true;
      if (parsed.articleSlug) {
        const seoSlug = getArticleSeo(p).slug;
        return seoSlug === parsed.articleSlug || p.slug === parsed.articleSlug;
      }
      return false;
    });
  }

  if (matchedPost) {
    const cleanTitle = stripHtmlTags(matchedPost.title.rendered);
    const catName = getCategoryNameForPost(matchedPost, allCategories);
    const seo = getArticleSeo(matchedPost, catName);
    const heroPath = getPostHeroImage(matchedPost);
    const absoluteImg = heroPath.startsWith('http') ? heroPath : `${origin}${heroPath}`;
    const canonical = `${origin}/artigo/${seo.slug}`;

    return injectSeoMetaIntoHtml(rawHtml, {
      title: `${seo.seoTitle} — Achar Temas`,
      description: seo.metaDescription,
      keywords: seo.keywords.join(', '),
      canonicalUrl: canonical,
      ogType: 'article',
      ogUrl: canonical,
      ogImage: absoluteImg,
      ogImageAlt: cleanTitle,
      publishedTime: matchedPost.date,
      modifiedTime: matchedPost.modified || matchedPost.date,
      section: catName,
      tags: seo.keywords.join(', '),
      jsonLd: buildArticleSchemaJsonLd(matchedPost, catName),
      rssUrl: `${origin}/rss.xml`,
    });
  }

  const viewTitles: Record<ActiveView, string> = {
    inicio: 'Achar Temas — Portal Editorial de História, Ciência, Arte e Cultura',
    artigos: 'Acervo Completo de Artigos — Achar Temas',
    jogos: 'Jogos Autorais — Arcade Interativo Achar Temas',
    loja: 'Vitrine Oficial Shopee — Achar Temas',
    sobre: 'Sobre Nós & Metodologia Editorial E-E-A-T — Achar Temas',
    contato: 'Contato & Redação — Achar Temas',
    privacidade: 'Política de Privacidade & LGPD — Achar Temas',
    termos: 'Termos de Uso — Achar Temas',
    cookies: 'Política Editorial, Cookies & Comentários — Achar Temas',
    admin: 'Painel Editorial — Achar Temas',
  };
  const viewDescriptions: Partial<Record<ActiveView, string>> = {
    sobre: 'Conheça a missão, equipe e padrões editoriais E-E-A-T do portal Achar Temas.',
    contato:
      'Fale com a Redação Achar Temas para sugestões de pauta, correções editoriais ou parcerias.',
    jogos:
      'Jogue nossos 5 mini-games autorais gratuitos inspirados nos cadernos de história, ciência, arte, esporte e engenharia.',
  };
  const title = viewTitles[parsed.view] || viewTitles.inicio;
  const description =
    viewDescriptions[parsed.view] ||
    'Blog editorial independente Achar Temas com artigos aprofundados sobre história, ciência, biodiversidade, arte, saúde e cultura pop.';
  const canonical = parsed.view === 'inicio' ? `${origin}/` : `${origin}/${parsed.view}`;

  return injectSeoMetaIntoHtml(rawHtml, {
    title,
    description,
    keywords:
      'Achar Temas, blog, história, ciência, biodiversidade, arte, cultura pop, curiosidades, saúde, engenharia antiga, gastronomia',
    canonicalUrl: canonical,
    ogType: 'website',
    ogUrl: canonical,
    ogImage: `${origin}/wp-images/content-685-image-4.jpg`,
    ogImageAlt: title,
    jsonLd: buildSiteSchemaJsonLd(),
    rssUrl: `${origin}/rss.xml`,
  });
}

export function createEditorialApiApp(): express.Express {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, service: 'achar-temas', runtime: process.env.VERCEL ? 'vercel' : 'node' });
  });

  // Dynamic ads.txt reflecting configured AdSense publisher ID when set
  app.get('/ads.txt', (_req, res) => {
    const rawId = (
      process.env.ADSENSE_PUBLISHER_ID ||
      process.env.VITE_ADSENSE_CLIENT_ID ||
      ''
    ).trim();
    const pubId = rawId.replace(/^ca-/, '');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    if (/^pub-\d{10,20}$/.test(pubId) && pubId !== 'pub-0000000000000000') {
      res.send(
        `# Google AdSense Authorized Digital Sellers (ads.txt)\ngoogle.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`
      );
      return;
    }
    res.send(
      '# Google AdSense Authorized Digital Sellers (ads.txt)\n# Configure ADSENSE_PUBLISHER_ID nas variáveis de ambiente para ativar o ads.txt.\n'
    );
  });

  // Dynamic RSS 2.0 feed
  app.get('/rss.xml', (req, res) => {
    const origin = getRequestOrigin(req);
    const xml = buildRssFeedXml(
      basePosts,
      (p) => {
        const post = p as Post;
        return {
          slug: getArticleSeo(post).slug,
          heroPath: getPostHeroImage(post),
          categoryName: getCategoryNameForPost(post, allCategories),
        };
      },
      origin
    );
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.send(xml);
  });

  // Dynamic XML Sitemap with clean article and institutional URLs
  app.get('/sitemap.xml', (req, res) => {
    const origin = getRequestOrigin(req);
    const xml = buildSitemapXml(
      basePosts,
      (p) => {
        const post = p as Post;
        return {
          slug: getArticleSeo(post).slug,
          heroPath: getPostHeroImage(post),
        };
      },
      origin
    );
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.send(xml);
  });

  // Protected Editorial Newsletter Broadcast API
  app.post('/api/newsletter/send', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const verifiedUser = await verifyFirebaseAdminToken(token);

      if (
        !verifiedUser ||
        !verifiedUser.emailVerified ||
        verifiedUser.email !== ADMIN_EMAIL
      ) {
        res.status(403).json({ error: 'Acesso restrito à Redação autorizada.' });
        return;
      }

      const {
        articleTitle,
        articleUrl,
        articleExcerpt,
        heroImageUrl,
        categoryName,
        recipients,
      } = req.body as {
        articleTitle?: string;
        articleUrl?: string;
        articleExcerpt?: string;
        heroImageUrl?: string;
        categoryName?: string;
        recipients?: Array<{ email: string; displayName?: string }>;
      };

      if (!articleTitle || !articleUrl || !articleExcerpt) {
        res.status(400).json({ error: 'Informe título, URL e resumo do artigo.' });
        return;
      }

      const cleanRecipients = Array.isArray(recipients)
        ? recipients.filter(
            (r) =>
              r &&
              typeof r.email === 'string' &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())
          )
        : [];

      const htmlDigest = buildNewsletterDigestHtml({
        articleTitle,
        articleUrl,
        articleExcerpt,
        heroImageUrl: heroImageUrl || 'https://achartemas.com/wp-images/content-685-image-4.jpg',
        categoryName: categoryName || 'Editorial',
      });

      const resendKey = (process.env.RESEND_API_KEY || '').trim();
      const fromEmail = (
        process.env.NEWSLETTER_FROM_EMAIL || 'Achar Temas <newsletter@achartemas.com>'
      ).trim();

      if (!resendKey) {
        res.json({
          sent: false,
          configured: false,
          recipientCount: cleanRecipients.length,
          htmlDigest,
          message:
            'RESEND_API_KEY não configurada no servidor. Baixe o digest HTML pronto ou configure a variável de ambiente no servidor para disparo automático.',
        });
        return;
      }

      if (cleanRecipients.length === 0) {
        res.status(400).json({ error: 'Nenhum assinante elegível para este tema.' });
        return;
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of cleanRecipients) {
        try {
          const emailResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [recipient.email.trim()],
              subject: `Novo artigo no Achar Temas: ${articleTitle}`,
              html: htmlDigest,
            }),
          });
          if (emailResp.ok) {
            sentCount += 1;
          } else {
            failedCount += 1;
          }
        } catch {
          failedCount += 1;
        }
      }

      res.json({
        sent: sentCount > 0,
        configured: true,
        sentCount,
        failedCount,
        htmlDigest,
        message: `Disparo concluído: ${sentCount} enviado(s), ${failedCount} falha(s).`,
      });
    } catch (error) {
      console.error('Newsletter dispatch error:', error);
      res.status(500).json({ error: 'Erro interno ao processar o disparo da newsletter.' });
    }
  });

  return app;
}

export function resolveDistIndexHtml(): string {
  const candidates = [
    path.resolve(process.cwd(), 'dist/index.html'),
    path.resolve(import.meta.dirname, '..', '..', 'dist/index.html'),
    path.resolve(process.cwd(), 'index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf-8');
    }
  }
  throw new Error('Could not locate built dist/index.html template.');
}
