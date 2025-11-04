import crypto from 'crypto';

// Central in-memory sessions store
export const sessions = new Map();

// Crea una sesión y devuelve el token
export function createSession(userId){
  const token = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  sessions.set(token, { userId, created: Date.now() });
  return token;
}

// Elimina una sesión por token, devuelve true si se eliminó
export function deleteSession(token){
  return sessions.delete(token);
}

// Middleware para verificar token Bearer e inyectar req.token y req.userId
export function verifyToken(req, res, next){
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token || !sessions.has(token)){
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.token = token;
  req.userId = sessions.get(token).userId;
  next();
}
