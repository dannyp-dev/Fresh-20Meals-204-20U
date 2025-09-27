import { RequestHandler } from 'express';
import { searchIngredients } from '../data/ingredients';

export const search: RequestHandler = (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const limitParam = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam!, 1), 200) : 50;
  const results = searchIngredients(q.trim(), limit);
  res.json({ query: q, count: results.length, results });
};
