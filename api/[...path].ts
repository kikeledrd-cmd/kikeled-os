import { app } from '../server/index.js';

export default function handler(req: any, res: any) {
  const route = req.query?.path;
  const routePath = Array.isArray(route) ? route.join('/') : route;
  const queryIndex = req.url.indexOf('?');
  const query = queryIndex >= 0 ? req.url.slice(queryIndex) : '';

  if (routePath) {
    req.url = `/api/${routePath}${query}`;
  }

  return app(req, res);
}
