import { users } from '../data/users.js';
import { createSession, deleteSession } from '../middleware/auth.middleware.js';

// Función controladora para manejar el login
export const login = (req, res) => {
  // Extrae 'cuenta' o 'account' del body de la petición
  const cuenta = req.body?.cuenta ?? req.body?.account;
  // Acepta 'contrasena' o 'contraseña' o 'password'
  const contrasena = req.body?.contrasena ?? req.body?.['contraseña'] ?? req.body?.password;

  // Valida que vengan ambos campos requeridos
  if (!cuenta || !contrasena) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: 'cuenta' y 'contrasena'.",
      ejemplo: { cuenta: 'gina', contrasena: '1234' }
    });
  }

  // Busca un usuario que coincida exactamente con cuenta Y contraseña
  const match = users.find(u => (u.account === cuenta || u.cuenta === cuenta) && (u.password === contrasena || u.contrasena === contrasena));

  // Si no encuentra coincidencia, credenciales incorrectas
  if (!match) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // Login exitoso: generar token de sesión
  const token = createSession(match.account || match.cuenta || String(match.id)); // Usamos 'account' (o 'cuenta') como userId si existe

  // Información para logs: usuario, token, timestamp e IP
  const account = match.account || match.cuenta || String(match.id);
  const fullname = match.fullname || match.nombreCompleto || '';
  const ip = req.ip || req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || 'unknown';
  console.log(`[LOGIN] ${new Date().toISOString()} - Usuario: ${account} ${fullname ? `(${fullname})` : ''} - IP: ${ip} - Token: ${token}`);

  return res.status(200).json({
    mensaje: 'Acceso permitido',
    message: 'Acceso permitido',
    usuario: { cuenta: account },
    account,
    fullname,
    token
  });
};

// Función controladora para manejar el logout
export const logout = (req, res) => {
  const token = req.token; // El token viene del middleware verifyToken
  const userId = req.userId; // El userId viene del middleware verifyToken

  const ip = req.ip || req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || 'unknown';
  console.log(`[LOGOUT] ${new Date().toISOString()} - Usuario en sesión: ${userId} - IP: ${ip} - Token: ${token} | Procede el logout`);

  // Eliminar la sesión
  const deleted = deleteSession(token);

  if (deleted) {
    return res.status(200).json({
      mensaje: 'Sesión cerrada correctamente'
    });
  } else {
    return res.status(404).json({
      error: 'Sesión no encontrada'
    });
  }
};

// Función controladora para obtener el perfil del usuario autenticado
export const getProfile = (req, res) => {
  const userId = req.userId; // El userId viene del middleware verifyToken

  // Buscar el usuario en la base de datos
  const user = users.find(u => u.account === userId || u.cuenta === userId || String(u.id) === String(userId));

  if (!user) {
    return res.status(404).json({
      error: 'Usuario no encontrado'
    });
  }

  // Devolver información del usuario (sin contraseña)
  return res.status(200).json({
    usuario: {
      cuenta: user.account || user.cuenta
    }
  });
};
