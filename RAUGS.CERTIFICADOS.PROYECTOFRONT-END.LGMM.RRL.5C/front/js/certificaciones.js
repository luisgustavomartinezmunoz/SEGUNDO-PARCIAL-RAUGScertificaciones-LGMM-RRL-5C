async function loadCerts(){
  const cont = document.getElementById('cardsCerts');
  if(!cont) return;
  const res = await fetch(API_BASE + '/api/certifications');
  const certs = await res.json();
  cont.innerHTML = '';
  certs.forEach(c=>{
    const card = document.createElement('div');
    card.className = 'card cert-card';
    const disabled = !c.active;
    card.innerHTML = `
      <h3>${c.name}</h3>
      <p>${c.description}</p>
      <ul class="facts">
        <li>Puntuación mínima: <strong>${c.minScore} / 8</strong></li>
        <li>Tiempo límite: <strong>${c.timeLimit} mins</strong></li>
        <li>Costo: <strong>$${c.price} MXN</strong></li>
      </ul>
      ${disabled ? `<p class="note">Disponible: ${c.availableFrom}</p>` : ''}
      <div class="actions">
        <button class="btn pay" ${disabled ? 'disabled' : ''} data-cert="${c.id}">Pagar</button>
        <button class="btn start" ${disabled ? 'disabled' : ''} data-cert="${c.id}">Iniciar examen</button>
      </div>
    `;
    cont.appendChild(card);
  });

  cont.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    if(!getToken()) return Swal.fire('Necesitas iniciar sesión primero','','info');
    const certId = btn.getAttribute('data-cert');
    if(btn.classList.contains('pay')){
      const res = await fetch(API_BASE + '/api/pay', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...authHeader() },
        body: JSON.stringify({ certId })
      });
      const data = await res.json();
      if(res.ok){ Swal.fire('Pago exitoso','Ahora puedes iniciar el examen.','success'); }
      else { Swal.fire('Atención', data.message || 'No se pudo procesar el pago.', 'warning'); }
    }
    if(btn.classList.contains('start')){
      const res = await fetch(API_BASE + '/api/exam/start', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...authHeader() },
        body: JSON.stringify({ certId })
      });
      const data = await res.json();
      if(!res.ok){
        return Swal.fire('Atención', data.message || 'No se puede iniciar el examen', 'warning');
      }
      localStorage.setItem('exam_cert', JSON.stringify({ certId, certName: data.cert.name }));
      localStorage.setItem('exam_payload', JSON.stringify(data));
      // navegar a examen
      location.href = 'examen.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', loadCerts);
