const LOCAL_API = 'http://localhost:3000';
const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);
const API_BASE = location.protocol === 'file:'
  ? LOCAL_API
  : (isLocalHost && location.port && location.port !== '3000')
    ? LOCAL_API
    : location.origin;

function getToken(){ return localStorage.getItem('token'); }
function setToken(t){ localStorage.setItem('token', t); }
function clearToken(){ localStorage.removeItem('token'); localStorage.removeItem('exam_cert'); }
function authHeader(){ const t = getToken(); return t ? { 'Authorization': 'Bearer ' + t } : {}; }

function renderHeaderAuth(){
  const userInfo = document.getElementById('userInfo');
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  const account = localStorage.getItem('account');
  if(userInfo && btnLogin && btnLogout){
    if(account && getToken()){
      userInfo.textContent = account;
      btnLogin.classList.add('hidden');
      btnLogout.classList.remove('hidden');
    }else{
      userInfo.textContent = 'Invitado';
      btnLogin.classList.remove('hidden');
      btnLogout.classList.add('hidden');
    }
  }
}

async function doLogin(){
  const { value: formValues } = await Swal.fire({
    title: 'Iniciar sesión',
    html:
      '<input id="swal-account" class="swal2-input" placeholder="Cuenta">' +
      '<input id="swal-pass" class="swal2-input" type="password" placeholder="Contraseña">',
    focusConfirm: false,
    preConfirm: () => {
      return {
        account: document.getElementById('swal-account').value,
        password: document.getElementById('swal-pass').value
      };
    }
  });
  if(!formValues) return;
  const res = await fetch(API_BASE + '/api/login', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(formValues)
  });
  const data = await res.json();
  if(!res.ok){
    return Swal.fire('Error', data.message || 'Credenciales inválidas', 'error');
  }
  setToken(data.token);
  localStorage.setItem('account', data.account);
  localStorage.setItem('fullname', data.fullname);
  Swal.fire('Acceso permitido', 'Bienvenido ' + data.fullname, 'success');
  renderHeaderAuth();
}

async function doLogout(){
  await fetch(API_BASE + '/api/logout', { method:'POST', headers: { ...authHeader() } }).catch(()=>{});
  clearToken();
  localStorage.removeItem('account'); localStorage.removeItem('fullname');
  Swal.fire('Sesión cerrada','','success');
  renderHeaderAuth();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderHeaderAuth();
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  if(btnLogin) btnLogin.addEventListener('click', doLogin);
  if(btnLogout) btnLogout.addEventListener('click', doLogout);
});
