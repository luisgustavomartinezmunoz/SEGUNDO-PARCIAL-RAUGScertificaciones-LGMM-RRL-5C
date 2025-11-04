import { Router } from 'express';
import { listCerts } from '../controllers/certController.js';
const router = Router();
router.get('/certifications', listCerts);
export default router;
