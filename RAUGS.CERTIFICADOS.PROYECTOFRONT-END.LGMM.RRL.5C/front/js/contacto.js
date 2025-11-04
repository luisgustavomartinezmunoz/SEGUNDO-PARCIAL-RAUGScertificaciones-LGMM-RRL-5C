document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch(API_BASE + '/api/contact', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
    const out = await res.json().catch(()=>({}));
    if(res.ok){ Swal.fire('Mensaje Enviado','','success'); form.reset(); }
    else{ Swal.fire('Error', out.message || 'No se pudo enviar', 'error'); }
  });
});
