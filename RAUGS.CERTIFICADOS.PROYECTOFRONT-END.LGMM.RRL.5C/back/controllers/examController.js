import { certifications } from '../data/certifications.js';
import { questionBank } from '../data/questions.js';
import PDFDocument from 'pdfkit';
import { users } from '../data/users.js';

const paid = new Map();
const taken = new Map();
const lastCertificate = new Map();

function ensureSet(map, key) {
  if (!map.has(key)) map.set(key, new Set());
  return map.get(key);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// pagar certificacion
export function payCert(req, res) {
  const { certId } = req.body || {};
  const cert = certifications.find(c => c.id === certId);
  if (!cert) return res.status(404).json({ message: 'Certificación no encontrada' });
  if (!cert.active) return res.status(400).json({ message: 'Esta certificación aún no está disponible' });
  const s = ensureSet(paid, req.userId);
  if (s.has(certId)) return res.status(409).json({ message: 'Ya está pagada' });
  s.add(certId);
  res.json({ message: 'Pago registrado', certId });
}
//empezar el examen
export function startExam(req, res) {
  const { certId } = req.body || {};
  const cert = certifications.find(c => c.id === certId);
  if (!cert) return res.status(404).json({ message: 'Certificación no encontrada' });
  if (!cert.active) return res.status(400).json({ message: 'Certificación no disponible' });
  if (!ensureSet(paid, req.userId).has(certId))
    return res.status(403).json({ message: 'Debes pagar antes de iniciar el examen' });
  if (ensureSet(taken, req.userId).has(certId))
    return res.status(403).json({ message: 'El examen solo se puede aplicar una vez' });

  const bank = questionBank[certId];
  const questions = shuffle(bank).slice(0, 8).map(q => ({
    id: q.id,
    text: q.text,
    options: shuffle(q.options)
  }));
  res.json({ cert, questions });
}

export async function submitExam(req, res) {
  const { certId, answers } = req.body || {};
  const cert = certifications.find(c => c.id === certId);
  if (!cert) return res.status(404).json({ message: 'Certificación no encontrada' });
  const bank = questionBank[certId];
  if (!Array.isArray(bank)) return res.status(404).json({ message: 'Banco de preguntas no encontrado' });

  const map = new Map(bank.map(q => [q.id, q]));
  let correct = 0;
  if (Array.isArray(answers)) {
    for (const a of answers) {
      // tolerate { id: '1' } or { id: 1 }
      const id = Number(a.id);
      const answer = a.answer;
      const q = map.get(id);
      if (q && answer != null && q.correct === answer) correct++;
    }
  }

  const score = correct;
  const passed = score >= cert.minScore;
  ensureSet(taken, req.userId).add(certId);
  if (passed) {
    try {
      const pdfBuffer = await generateCertificate(req.userId, cert, score);
      if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
        lastCertificate.set(req.userId, pdfBuffer);
      }
    } catch (err) {
      console.error('Error generando certificado:', err);
    }
  }
  res.json({ score, total: 8, passed });
}

export function certificatePDF(req, res) {
  const buf = lastCertificate.get(req.userId);
  if (!buf) return res.status(404).json({ message: 'No hay certificado disponible' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="certificado.pdf"');
  res.end(buf);
}

function resolveUserForCertificate(userId) {
  const user = users.find(u => {
    const sameId = String(u.id) === String(userId);
    const sameAccount = u.account && u.account === userId;
    const sameCuenta = u.cuenta && u.cuenta === userId;
    return sameId || sameAccount || sameCuenta;
  });
  if (!user) {
    return { account: 'Usuario', fullname: 'Usuario' };
  }
  const account = user.account || user.cuenta || String(user.id);
  const fullname = user.fullname || user.nombreCompleto || user.name || account;
  return { account, fullname };
}
//generate certificado y descarga
function generateCertificate(userId, cert, score) {
  return new Promise((resolve, reject) => {
    const user = resolveUserForCertificate(userId);
    const doc = new PDFDocument({ size: 'A4', margin: 60 });
    const chunks = [];
    doc.on('data', d => chunks.push(d));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    const gold = '#c6a700';
    doc.rect(40, 40, 515, 760).strokeColor(gold).lineWidth(4).stroke();
    doc.save();
    doc.roundedRect(190, 55, 160, 50, 8).fillAndStroke('#000000', '#000000');
    doc.fillColor('#facc15').font('Helvetica-Bold').fontSize(22).text('RauGS', 205, 70, { width: 80 });
    doc.fillColor('#9ca3af').font('Helvetica').fontSize(16).text('Certificaciones', 280, 74, { width: 80 });
    doc.restore();
    doc.moveDown(3);
    doc.fontSize(24).fillColor('#333').text('CONSTANCIA DE CERTIFICACIÓN', { align: 'left' });
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#000').text(`Otorgada a:`, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor(gold).text(user.fullname, { align: 'left', underline: true });
    doc.moveDown(1);
    doc.fontSize(14).fillColor('#000')
      .text(`Por haber aprobado el examen de ${cert.name}`, { align: 'left' });
    doc.moveDown(1);
    doc.text(`Puntaje obtenido: ${score} / 8`, { align: 'left' });
    doc.moveDown(2);
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, { align: 'left' });
    doc.text(`Ciudad: Aguascalientes, México`, { align: 'left' });
    doc.moveDown(3);
    doc.text(`Empresa: RauGS Certificaciones`, { align: 'left' });
    doc.moveDown(3);
  doc.image('../front/images/signatures/firma1.png', 80, 620, { width: 200 });
  doc.text('Dra. Georgina Salazar Partida', 100, 690);
  doc.text('Instructor', 140, 705);

  doc.image('../front/images/signatures/firma2.png', 360, 620, { width: 200 });
  doc.text('Luis Gustavo Martínez Muñoz', 380, 690);
  doc.text('CEO RauGS Certificaciones', 370, 705);
    doc.end();
  });
}
