import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createEditorialApiApp,
  renderSeoHtmlForRequest,
  resolveDistIndexHtml,
} from './src/server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = createEditorialApiApp();

  let viteServer: import('vite').ViteDevServer | null = null;

  if (!IS_PROD) {
    const { createServer } = await import('vite');
    viteServer = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(viteServer.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir, { index: false }));
  }

  // SPA SSR Meta Injection handler (only for non-file HTML routes)
  app.get('*', async (req, res, next) => {
    try {
      if (path.extname(req.path)) {
        next();
        return;
      }

      const url = req.originalUrl || '/';
      let rawHtml: string;
      if (viteServer) {
        const templatePath = path.resolve(__dirname, 'index.html');
        rawHtml = fs.readFileSync(templatePath, 'utf-8');
        rawHtml = await viteServer.transformIndexHtml(url, rawHtml);
      } else {
        rawHtml = resolveDistIndexHtml();
      }

      const renderedHtml = renderSeoHtmlForRequest(rawHtml, req);
      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(renderedHtml);
    } catch (err) {
      if (viteServer && err instanceof Error) {
        viteServer.ssrFixStacktrace(err);
      }
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Achar Temas server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
