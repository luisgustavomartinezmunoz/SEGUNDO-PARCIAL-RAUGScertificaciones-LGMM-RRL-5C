import { verifyToken } from './auth.middleware.js';

export function authRequired(req, res, next){
  return verifyToken(req, res, next);
}
