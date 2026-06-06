

// ════════════════════════════════════════════════════════════
// LOCALSTORAGE — guardar y cargar datos
// ────────────────────────────────────────────────────────────
// Usamos localStorage para que los datos no se pierdan al
// recargar la pagina. Los datos se guardan por usuario usando
// su email como parte de la clave, para que cada usuario tenga
// su propia informacion separada.
//
// Por que try/catch aqui?
// localStorage.setItem puede lanzar QuotaExceededError si el
// almacenamiento esta lleno. JSON.parse puede lanzar SyntaxError
// si el valor guardado esta corrompido. Sin try/catch esos
// errores rompen toda la aplicacion.
// ════════════════════════════════════════════════════════════

const STORAGE_KEY = 'cgp_movimientos';
const USERS_KEY   = 'cgp_usuarios';

function obtenerUsuarios() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error al leer usuarios de localStorage:', e);
    return [];
  }
}

function guardarUsuarios(lista) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error('Error al guardar usuarios en localStorage:', e);
  }
}

function guardarMovimientos() {
  try {
    const email = obtenerEmailSesion();
    if (!email) return;
    localStorage.setItem(STORAGE_KEY + '_' + email, JSON.stringify(movimientos));
  } catch (e) {
    console.error('Error al guardar movimientos en localStorage:', e);
    alert('No se pudieron guardar los datos. Almacenamiento lleno o bloqueado.');
  }
}

function cargarMovimientos(email) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + '_' + email);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error al cargar movimientos (JSON invalido):', e);
    return [];
  }
}


// ════════════════════════════════════════════════════════════
// SESSIONSTORAGE — sesion activa del usuario
// ────────────────────────────────────────────────────────────
// sessionStorage dura solo mientras el tab del navegador este
// abierto. Al cerrar el tab la sesion se borra automaticamente.
// Lo usamos para saber que usuario esta logueado sin obligarlo
// a hacer login cada vez que navega dentro de la misma pestana.
// ════════════════════════════════════════════════════════════

function obtenerEmailSesion() {
  try {
    const raw = sessionStorage.getItem('cgp_sesion');
    return raw ? JSON.parse(raw).email : null;
  } catch (e) {
    console.error('Error al leer sesion de sessionStorage:', e);
    return null;
  }
}

function guardarSesion(name, email) {
  try {
    sessionStorage.setItem('cgp_sesion', JSON.stringify({ name, email }));
  } catch (e) {
    console.error('Error al guardar sesion:', e);
  }
}

function borrarSesion() {
  try {
    sessionStorage.removeItem('cgp_sesion');
  } catch (e) {
    console.error('Error al borrar sesion:', e);
  }
}

function obtenerSesion() {
  try {
    const raw = sessionStorage.getItem('cgp_sesion');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}


// ════════════════════════════════════════════════════════════
// UI DE SESION — mostrar nombre y boton de cerrar sesion
// ════════════════════════════════════════════════════════════

function actualizarHeaderUsuario() {
  try {
    const sesion    = obtenerSesion();
    const nameEl    = document.getElementById('headerUserName');
    const logoutBtn = document.getElementById('headerLogoutBtn');
    if (!nameEl) return;
    if (sesion) {
      nameEl.textContent       = sesion.name;
      logoutBtn.style.display  = 'inline-block';
    } else {
      nameEl.textContent       = '';
      logoutBtn.style.display  = 'none';
    }
  } catch (e) {
    console.error('Error al actualizar header:', e);
  }
}


// ════════════════════════════════════════════════════════════
// LOGIN — mostrar y ocultar el overlay
// ════════════════════════════════════════════════════════════

function mostrarLogin() {
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('loginError').style.display   = 'none';
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  // Resetear tabs
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="login"]').classList.add('active');
  document.getElementById('loginForm').style.display    = 'flex';
  document.getElementById('registerForm').style.display = 'none';
}

function ocultarLogin() {
  document.getElementById('loginOverlay').classList.add('hidden');
}

function loginExitoso(name, email) {
  try {
    // Guardar sesion en sessionStorage
    guardarSesion(name, email);
    // Cargar los movimientos de este usuario desde localStorage
    movimientos = cargarMovimientos(email);
    // Actualizar la interfaz
    ocultarLogin();
    actualizarHeaderUsuario();
    renderMovimientos();
  } catch (e) {
    console.error('Error al iniciar sesion:', e);
  }
}

function cerrarSesion() {
  try {
    borrarSesion();
    movimientos = [];
    renderMovimientos();
    actualizarHeaderUsuario();
    mostrarLogin();
  } catch (e) {
    console.error('Error al cerrar sesion:', e);
  }
}


// ════════════════════════════════════════════════════════════
// FORMULARIO DE LOGIN
// ════════════════════════════════════════════════════════════

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  try {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('loginError');

    if (!email || !password) throw new Error('Completa todos los campos');

    const usuarios = obtenerUsuarios();
    const usuario  = usuarios.find(function(u) {
      return u.email === email && u.password === password;
    });

    if (usuario) {
      errEl.style.display = 'none';
      loginExitoso(usuario.name, usuario.email);
    } else {
      errEl.textContent   = 'Correo o contrasena incorrectos';
      errEl.style.display = 'block';
    }
  } catch (e) {
    const errEl = document.getElementById('loginError');
    errEl.textContent   = e.message;
    errEl.style.display = 'block';
  }
});


// ════════════════════════════════════════════════════════════
// FORMULARIO DE REGISTRO
// ════════════════════════════════════════════════════════════

document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  try {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errEl    = document.getElementById('loginError');

    // Validaciones con try/catch y throw para mensajes claros
    if (!name)               throw new Error('El nombre es obligatorio');
    if (!email)              throw new Error('El correo es obligatorio');
    if (password.length < 6) throw new Error('La contrasena debe tener al menos 6 caracteres');
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) throw new Error('El correo no es valido');

    const usuarios = obtenerUsuarios();
    const existe   = usuarios.find(function(u) { return u.email === email; });
    if (existe) throw new Error('Ya existe una cuenta con ese correo');

    // Guardar nuevo usuario en localStorage
    usuarios.push({ name: name, email: email, password: password });
    guardarUsuarios(usuarios);

    errEl.style.display = 'none';
    loginExitoso(name, email);

  } catch (e) {
    const errEl = document.getElementById('loginError');
    errEl.textContent   = e.message;
    errEl.style.display = 'block';
  }
});


// ════════════════════════════════════════════════════════════
// TABS LOGIN / REGISTRO
// ════════════════════════════════════════════════════════════

document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    var tab = btn.getAttribute('data-tab');
    document.getElementById('loginForm').style.display    = tab === 'login'    ? 'flex' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
    document.getElementById('loginError').style.display   = 'none';
  });
});


// ════════════════════════════════════════════════════════════
// NAVEGACION DEL MENU 
// ════════════════════════════════════════════════════════════

const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.querySelector('.header h1');

navItems.forEach(function(item) {
  item.addEventListener('click', function() {
    navItems.forEach(function(nav) { nav.classList.remove('active'); });
    sections.forEach(function(sec) { sec.classList.remove('active'); });
    item.classList.add('active');
    var targetSection = item.getAttribute('data-section');
    document.getElementById('section-' + targetSection).classList.add('active');
    if (pageTitle) {
      pageTitle.textContent = item.querySelector('span').textContent;
    }
  });
});


// ════════════════════════════════════════════════════════════
// MOVIMIENTOS (guardar en localStorage)
// ════════════════════════════════════════════════════════════

var movimientos = [];
var nextMovId   = 1;

var movForm   = document.getElementById('movimientoForm');
var movBody   = document.getElementById('movimientosBody');
var emptyMov  = document.getElementById('emptyMovimientos');
var movBadge  = document.getElementById('movementBadge');
var fechaInput = document.getElementById('fecha');

fechaInput.value = new Date().toISOString().split('T')[0];

// ════════════════════════════════════════════════════════════
// CATEGORIAS DINAMICAS
// Cuando el usuario cambia entre Ingreso y Gasto, el select
// de categorias se actualiza automaticamente.
// ════════════════════════════════════════════════════════════
var categoriasPorTipo = {
  ingreso: [
    { value: 'Salario',        label: 'Salario'        },
    { value: 'Otros ingresos', label: 'Otros ingresos' }
  ],
  gasto: [
    { value: 'Alimentacion', label: 'Alimentacion' },
    { value: 'Transporte',   label: 'Transporte'   },
    { value: 'Salud',        label: 'Salud'        },
    { value: 'Vivienda',     label: 'Vivienda'     },
    { value: 'Otros',        label: 'Otros'        }
  ]
};
function actualizarCategorias() {
  try {
    var tipo      = document.getElementById('tipo').value;
    var catSelect = document.getElementById('categoria');
    var opciones  = categoriasPorTipo[tipo] || categoriasPorTipo.gasto;
    catSelect.innerHTML = opciones.map(function(c) {
      return '<option value="' + c.value + '">' + c.label + '</option>';
    }).join('');
  } catch (e) { console.error('Error al actualizar categorias:', e); }
}
document.getElementById('tipo').addEventListener('change', actualizarCategorias);
actualizarCategorias();

movForm.addEventListener('submit', function(e) {
  e.preventDefault();
  try {
    var tipo        = document.getElementById('tipo').value;
    var monto       = parseFloat(document.getElementById('monto').value);
    var categoria   = document.getElementById('categoria').value;
    var fecha       = fechaInput.value;
    var descripcion = document.getElementById('descripcion').value.trim();

    if (!monto || monto <= 0) throw new Error('El monto debe ser mayor a 0');
    if (!fecha)               throw new Error('La fecha es obligatoria');

    movimientos.push({
      id: 'm' + nextMovId++,
      tipo: tipo,
      monto: monto,
      categoria: categoria,
      fecha: fecha,
      descripcion: descripcion
    });

    movForm.reset();
    fechaInput.value = new Date().toISOString().split('T')[0];

    // Guardar en localStorage cada vez que se agrega un movimiento
    guardarMovimientos();
    renderMovimientos();

  } catch (e) {
    console.error('Error al agregar movimiento:', e);
    alert('Error: ' + e.message);
  }
});

function renderMovimientos() {
  movBadge.textContent = movimientos.length;
  var sorted = movimientos.slice().sort(function(a, b) {
    return b.fecha.localeCompare(a.fecha);
  });

  if (sorted.length === 0) {
    movBody.innerHTML      = '';
    emptyMov.style.display = 'block';
    return;
  }
  emptyMov.style.display = 'none';

  movBody.innerHTML = sorted.map(function(m) {
    var cls          = m.tipo === 'ingreso' ? 'ingreso' : 'gasto';
    var signo        = m.tipo === 'ingreso' ? '+' : '-';
    var colorMonto   = m.tipo === 'ingreso' ? 'var(--income)' : 'var(--expense)';
    var montoFmt     = '$' + m.monto.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    return '<tr>' +
      '<td><span class="type-badge ' + cls + '">' + m.tipo + '</span></td>' +
      '<td style="font-weight:600;color:' + colorMonto + '">' + signo + montoFmt + '</td>' +
      '<td>' + m.categoria + '</td>' +
      '<td>' + m.fecha + '</td>' +
      '<td>' + (m.descripcion || '—') + '</td>' +
      '<td><button class="btn btn-danger" onclick="eliminarMovimiento(\'' + m.id + '\')">Eliminar</button></td>' +
      '</tr>';
  }).join('');
}

function eliminarMovimiento(id) {
  try {
    movimientos = movimientos.filter(function(m) { return m.id !== id; });
    // Guardar en localStorage despues de eliminar
    guardarMovimientos();
    renderMovimientos();
  } catch (e) {
    console.error('Error al eliminar movimiento:', e);
  }
}

