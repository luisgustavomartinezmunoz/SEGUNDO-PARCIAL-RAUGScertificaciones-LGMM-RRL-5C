import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import certRoutes from './routes/certifications.js';
import contactRoutes from './routes/contact.js';
import examRoutes from './routes/exam.js';

const app = express();

const ALLOWED_ORIGINS = [
  'http://10.13.163.16',
];

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || localOriginPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../front')));

//montar rutas bajp /api
app.use('/api', authRoutes);
app.use('/api', certRoutes);
app.use('/api', contactRoutes);
app.use('/api', examRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

const PORT = process.env.PORT || 3000;
//levantar servdor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
