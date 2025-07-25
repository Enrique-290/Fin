
function login() {
  const correo = document.getElementById('correo').value.trim().toLowerCase();
  const acceso = 'enri290@gmail.com';
  if (correo === acceso) {
    document.querySelector('.login').classList.add('hidden');
    document.getElementById('control').classList.remove('hidden');
  } else {
    document.getElementById('error').innerText = '❌ Acceso denegado';
  }
}

function registrar() {
  document.getElementById('output').innerHTML = '<p style="color:#0f0;">✅ Membresía registrada correctamente</p>';
}

function verCalendario() {
  document.getElementById('output').innerHTML = '<p>📅 Vista de calendario cargada</p>';
}

function exportar() {
  document.getElementById('output').innerHTML = '<p>📤 Exportación a PDF y Excel realizada</p>';
}
