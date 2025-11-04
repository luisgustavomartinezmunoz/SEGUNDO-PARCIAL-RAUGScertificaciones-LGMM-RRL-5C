//arreglo donde se guardaran los mensajes de contacto
const messages = [];
export function createContact(req, res){
  //guardar mensaje en el arreglo
  const { name, email, message } = req.body || {};
  const entry = { name, email, message, at: new Date().toISOString() };
  messages.push(entry);
  //imprimir en consola
  console.log('[CONTACT]', entry);
  //imprimir en el fornt mensaje recibido
  res.json({ message:'Mensaje recibido' });
}
