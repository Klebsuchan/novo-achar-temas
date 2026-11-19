import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import {
  createEditorialApiApp,
  renderSeoHtmlForRequest,
  resolveDistIndexHtml,
} from '../src/server/app.ts';

const app = createEditorialApiApp();

// SSR Meta Injection & Clean URL fallback on Vercel Serverless
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (path.extname(req.path)) {
      next();
      return;
    }

    const rawHtml = resolveDistIndexHtml();
    const renderedHtml = renderSeoHtmlForRequest(rawHtml, req);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(renderedHtml);
  } catch (error) {
    next(error);
  }
});

export default app;
