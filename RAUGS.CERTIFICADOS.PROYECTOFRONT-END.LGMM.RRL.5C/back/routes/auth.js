import { Router } from 'express';
import { login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/login', (req, res) => { login(req, res); });
router.post('/logout', verifyToken, (req, res) => { logout(req, res); });

export default router;
