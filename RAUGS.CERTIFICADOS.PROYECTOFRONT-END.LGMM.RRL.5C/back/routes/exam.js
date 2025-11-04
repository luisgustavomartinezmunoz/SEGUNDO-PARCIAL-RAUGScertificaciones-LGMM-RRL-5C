import { Router } from 'express';
import { authRequired } from '../middleware/authRequired.js';
import { startExam, submitExam, certificatePDF, payCert } from '../controllers/examController.js';
const router = Router();
router.post('/pay', authRequired, payCert);
router.post('/exam/start', authRequired, startExam);
router.post('/exam/submit', authRequired, submitExam);
router.get('/certificate/pdf', authRequired, certificatePDF);
export default router;
