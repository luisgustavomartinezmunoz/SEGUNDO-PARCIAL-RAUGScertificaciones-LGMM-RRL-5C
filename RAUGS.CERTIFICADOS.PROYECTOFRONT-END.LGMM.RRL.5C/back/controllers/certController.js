import { certifications } from '../data/certifications.js';
export function listCerts(req, res){ res.json(certifications); }
