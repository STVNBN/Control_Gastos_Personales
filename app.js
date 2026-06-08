// NAVEGACIÓN DEL MENÚ 
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.querySelector('.header h1');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(nav => nav.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    item.classList.add('active');
    
    const targetSection = item.getAttribute('data-section');
    document.getElementById(`section-${targetSection}`).classList.add('active');
    
    if (pageTitle) {
      pageTitle.textContent = item.querySelector('span').textContent;
    }
  });
});

// Datos de prueba por defecto
const categoriasPorDefecto = [
  { id: 'cat-alimentacion-gasto', nombre: 'Alimentación', color: '#ef4444', tipo: 'gasto' },
  { id: 'cat-transporte-gasto', nombre: 'Transporte', color: '#3b82f6', tipo: 'gasto' },
  { id: 'cat-salario-ingreso', nombre: 'Salario', color: '#10b981', tipo: 'ingreso' },
  { id: 'cat-vivienda-gasto', nombre: 'Vivienda', color: '#f59e0b', tipo: 'gasto' },
  { id: 'cat-entretenimiento-gasto', nombre: 'Entretenimiento', color: '#8b5cf6', tipo: 'gasto' },
  { id: 'cat-salud-gasto', nombre: 'Salud', color: '#ec4899', tipo: 'gasto' }
];

const movimientosPorDefecto = [
  { id: 'mov-1', tipo: 'ingreso', monto: 1500.00, categoriaId: 'cat-salario-ingreso', fecha: '2026-06-05', descripcion: 'Salario Mensual' },
  { id: 'mov-2', tipo: 'gasto', monto: 150.00, categoriaId: 'cat-alimentacion-gasto', fecha: '2026-06-05', descripcion: 'Supermercado quincenal' },
  { id: 'mov-3', tipo: 'gasto', monto: 35.50, categoriaId: 'cat-transporte-gasto', fecha: '2026-06-04', descripcion: 'Combustible semanal' },
  { id: 'mov-4', tipo: 'gasto', monto: 120.00, categoriaId: 'cat-vivienda-gasto', fecha: '2026-06-03', descripcion: 'Pago de Internet' }
];

// Variables globales para los datos del usuario activo
let categorias = [];
let movimientos = [];

// DOM
const movBody = document.getElementById('movimientosBody');
const emptyMov = document.getElementById('emptyMovimientos');
const movBadge = document.getElementById('movementBadge');
const catList = document.getElementById('categoriasList');
const catBadge = document.getElementById('categoryBadge');

let editId = null;

// FUNCIONES DE COOKIES =
function guardarCookie(nombre, valor, dias) {
  let fecha = new Date();
  fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000));
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${fecha.toUTCString()}; path=/; SameSite=Lax`;
}

function obtenerCookie(nombre) {
  let cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    let [key, value] = cookie.trim().split("=");
    if (key === nombre) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function borrarCookie(nombre) {
  document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// GESTIÓN DE DATOS POR USUARIO 
function cargarDatosUsuario() {
  const usuario = obtenerCookie("usuario");
  if (usuario) {
    // Intentar obtener los datos del usuario específico
    const userCats = localStorage.getItem(`categorias_${usuario}`);
    const userMovs = localStorage.getItem(`movimientos_${usuario}`);
    
    if (userCats && userMovs) {
      categorias = JSON.parse(userCats);
      movimientos = JSON.parse(userMovs);
    } else {
      // Si el usuario no tiene datos guardados, migrar/copiar los datos actuales
      const globalCats = localStorage.getItem('categorias');
      const globalMovs = localStorage.getItem('movimientos');
      
      categorias = globalCats ? JSON.parse(globalCats) : categoriasPorDefecto;
      movimientos = globalMovs ? JSON.parse(globalMovs) : movimientosPorDefecto;
      
      // Guardar inmediatamente la copia para el nuevo usuario
      localStorage.setItem(`categorias_${usuario}`, JSON.stringify(categorias));
      localStorage.setItem(`movimientos_${usuario}`, JSON.stringify(movimientos));
    }
  } else {
    categorias = [...categoriasPorDefecto];
    movimientos = [...movimientosPorDefecto];
  }
}

function inicializarDatos() {
  cargarDatosUsuario();
  
  // Compatibilidad con formatos de IDs antiguos en los datos del usuario
  let huboCambioMigracion = false;
  
  categorias.forEach(c => {
    if (!c.id) {
      c.id = `cat-${c.nombre.toLowerCase().replace(/\s+/g, '-')}-${c.tipo}`;
      huboCambioMigracion = true;
    }
  });
  
  movimientos.forEach((m, index) => {
    if (!m.id) {
      m.id = `mov-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
      huboCambioMigracion = true;
    }
    if (m.categoria && !m.categoriaId) {
      const catEncontrada = categorias.find(c => c.nombre.toLowerCase() === m.categoria.toLowerCase() && c.tipo === m.tipo);
      if (catEncontrada) {
        m.categoriaId = catEncontrada.id;
      } else {
        m.categoriaId = `cat-${m.categoria.toLowerCase().replace(/\s+/g, '-')}-${m.tipo}`;
      }
      delete m.categoria;
      huboCambioMigracion = true;
    }
  });
  
  if (huboCambioMigracion) {
    saveCategorias();
    saveMovimientos();
  }
}

// Render de listas y tablas
function renderMovimientos() {
  if (!movBody) return;
  
  if (movBadge) {
    movBadge.textContent = movimientos.length;
  }

  // Mostrar u ocultar 
  if (movimientos.length === 0) {
    movBody.innerHTML = '';
    if (emptyMov) emptyMov.style.display = 'block';
    return;
  }
  
  if (emptyMov) emptyMov.style.display = 'none';

  // HTML de las filas
  movBody.innerHTML = movimientos.map(m => {
    const cls = m.tipo === 'ingreso' ? 'ingreso' : 'gasto';
    const signo = m.tipo === 'ingreso' ? '+' : '-';
    const colorMonto = m.tipo === 'ingreso' ? 'var(--income)' : 'var(--expense)';
    
    // Monto formateado
    const montoFormateado = `$${m.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Buscar color y nombre de la categoría por su ID
    const cat = categorias.find(c => c.id === m.categoriaId);
    const catColor = cat ? cat.color : '#6b7280';
    const catNombre = cat ? cat.nombre : 'Sin categoría';

    return `
      <tr>
        <td><span class="type-badge ${cls}">${m.tipo}</span></td>
        <td style="font-weight:600; color:${colorMonto}">${signo}${montoFormateado}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${catColor}"></span>
            ${catNombre}
          </span>
        </td>
        <td>${m.fecha}</td>
        <td>${m.descripcion || '—'}</td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button class="btn" style="background: transparent; color: var(--primary); padding: 6px 12px; font-size: 0.82rem;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='transparent'" onclick="iniciarEdicion('${m.id}')" title="Editar movimiento">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-danger" onclick="eliminarMovimiento('${m.id}')" title="Eliminar movimiento">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderCategorias() {
  if (!catList) return;
  if (catBadge) {
    catBadge.textContent = categorias.length;
  }
  
  if (categorias.length === 0) {
    catList.innerHTML = `<p class="empty-state">No hay categorías registradas.</p>`;
    return;
  }
  
  catList.innerHTML = categorias.map(c => {
    const count = movimientos.filter(m => m.categoriaId === c.id).length;
    const tipoBadge = c.tipo === 'ingreso' 
      ? `<span class="type-badge ingreso">Ingreso</span>`
      : `<span class="type-badge gasto">Gasto</span>`;

    const actionHtml = `<button class="btn-delete-cat" onclick="eliminarCategoria('${c.id}')" title="Eliminar categoría">
           <i class="fa-solid fa-trash"></i>
         </button>`;

    return `
      <div class="category-item" style="border-left: 5px solid ${c.color};">
        <div class="category-item-info">
          <span class="category-item-name">${c.nombre}</span>
          <div class="category-item-meta">
            ${tipoBadge}
            <span class="category-usage-badge">${count} transacciones</span>
          </div>
        </div>
        <div class="category-item-actions">
          ${actionHtml}
        </div>
      </div>
    `;
  }).join('');
}

// VERIFICACIÓN DE SESIÓN
function verificarSesion() {
  const usuario = obtenerCookie("usuario");
  const appContainer = document.querySelector(".app");
  const loginScreen = document.getElementById("loginScreen");
  const headerUserName = document.querySelector(".header-user-name");
  const headerAvatar = document.querySelector(".header-avatar");

  if (usuario) {
    // Cargar y migrar datos del usuario
    inicializarDatos();
    
    // Ocultar login y mostrar dashboard
    if (loginScreen) loginScreen.style.display = "none";
    if (appContainer) appContainer.style.display = "flex";
    
    // Actualizar datos de usuario en la UI
    if (headerUserName) headerUserName.textContent = usuario;
    if (headerAvatar) {
      headerAvatar.textContent = usuario.charAt(0).toUpperCase();
    }

    // Renderizar la UI
    renderMovimientos();
    renderCategorias();
    updateCategoriaSelect(); 
    updateDashboard();
  } else {
    // Ocultar dashboard y mostrar pantalla de login
    if (appContainer) appContainer.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
  }
}

// Configuración de event listeners para el Login y Logout
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const loginUsuario = document.getElementById("loginUsuario").value.trim();
      if (loginUsuario) {
        guardarCookie("usuario", loginUsuario, 7); // Guardar por 7 días
        verificarSesion();
        document.getElementById("loginUsuario").value = "";
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        borrarCookie("usuario");
        // Forzar recarga ligera o verificación directa de sesión
        verificarSesion();
      }
    });
  }
});

// Calculo del dashboard
function updateDashboard() {
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0);
  const gastos = movimientos.filter(m => m.tipo === 'gasto').reduce((sum, m) => sum + m.monto, 0);
  const balance = ingresos - gastos;
  const totalTransacciones = movimientos.length;

  // Actualizar Balance
  const balanceAmountEl = document.querySelector('.balance-amount');
  if (balanceAmountEl) {
    const formattedBalance = `${balance < 0 ? '-' : ''}$${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    balanceAmountEl.textContent = formattedBalance;
    balanceAmountEl.style.color = balance < 0 ? '#fee2e2' : '#ffffff';
  }

  // Actualizar Ingresos
  const incomeValEl = document.querySelector('.stat-income .stat-value');
  if (incomeValEl) {
    incomeValEl.textContent = `$${ingresos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Actualizar Gastos
  const expenseValEl = document.querySelector('.stat-expense .stat-value');
  if (expenseValEl) {
    expenseValEl.textContent = `$${gastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Actualizar Transacciones Count
  const countValEl = document.querySelector('.stat-count .stat-value');
  if (countValEl) {
    countValEl.textContent = totalTransacciones.toString();
  }

  // Gastos por Categoría
  const emptyGastos = document.getElementById('emptyGastos');
  const gastosList = document.getElementById('gastosPorCategoriaList');
  const totalGastos = gastos;
  const gastosPorCat = {};

  movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
    gastosPorCat[m.categoriaId] = (gastosPorCat[m.categoriaId] || 0) + m.monto;
  });

  const gastosOrdenados = Object.keys(gastosPorCat).map(catId => {
    const cat = categorias.find(c => c.id === catId);
    const nombre = cat ? cat.nombre : 'Sin categoría';
    const color = cat ? cat.color : '#cbd5e1';
    return {
      nombre,
      monto: gastosPorCat[catId],
      color,
      pct: totalGastos > 0 ? (gastosPorCat[catId] / totalGastos) * 100 : 0
    };
  }).sort((a, b) => b.monto - a.monto);

  if (gastosOrdenados.length === 0 || !gastosList) {
    if (emptyGastos) emptyGastos.style.display = 'flex';
    if (gastosList) gastosList.style.display = 'none';
  } else {
    if (emptyGastos) emptyGastos.style.display = 'none';
    if (gastosList) {
      gastosList.style.display = 'block';
      gastosList.innerHTML = gastosOrdenados.map(item => `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem; font-weight: 500;">
            <span>${item.nombre}</span>
            <span style="font-weight: 600;">$${item.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${item.pct.toFixed(1)}%)</span>
          </div>
          <div style="background: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: ${item.color}; width: ${item.pct}%; height: 100%; border-radius: 4px;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // Movimientos Recientes
  const emptyRecent = document.getElementById('emptyRecent');
  const recentList = document.getElementById('recentMovementsList');
  const recentMovs = [...movimientos].slice(0, 5);

  if (recentMovs.length === 0 || !recentList) {
    if (emptyRecent) emptyRecent.style.display = 'flex';
    if (recentList) recentList.style.display = 'none';
  } else {
    if (emptyRecent) emptyRecent.style.display = 'none';
    if (recentList) {
      recentList.style.display = 'block';
      recentList.innerHTML = recentMovs.map(m => {
        const sign = m.tipo === 'ingreso' ? '+' : '-';
        const color = m.tipo === 'ingreso' ? 'var(--income)' : 'var(--expense)';
        const amountFormatted = `$${m.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const cat = categorias.find(c => c.id === m.categoriaId);
        const catColor = cat ? cat.color : '#6b7280';
        const catNombre = cat ? cat.nombre : 'Sin categoría';
        
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="background: ${catColor}; width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
              <div>
                <div style="font-weight: 600; font-size: 0.88rem; color: var(--text);">${m.descripcion || catNombre}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary);">${m.fecha} • ${catNombre}</div>
              </div>
            </div>
            <div style="font-weight: 700; color: ${color}; font-size: 0.88rem;">
              ${sign}${amountFormatted}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// PERSISTENCIA CON LOCAL STORAGE
function saveCategorias() {
   const usuario = obtenerCookie("usuario");
  if (usuario) {
    localStorage.setItem(`categorias_${usuario}`, JSON.stringify(categorias));
  } else {
    localStorage.setItem('categorias', JSON.stringify(categorias));
  }
}

function saveMovimientos() {
  const usuario = obtenerCookie("usuario");
  if (usuario) {
    localStorage.setItem(`movimientos_${usuario}`, JSON.stringify(movimientos));
  } else {
    localStorage.setItem('movimientos', JSON.stringify(movimientos));
  }
}

//FUNCIONES PARA EL CRUD

// Iniciar Edición de Movimiento
window.iniciarEdicion = function(id) {
  editId = id;
  const mov = movimientos.find(m => m.id === id);
  if (!mov) return;
  
  // Rellenar formulario
  document.getElementById('tipo').value = mov.tipo;
  document.getElementById('monto').value = mov.monto;
  
  // Actualiza el select de categorias
  updateCategoriaSelect();
  document.getElementById('categoria').value = mov.categoriaId;
  
  document.getElementById('fecha').value = mov.fecha;
  document.getElementById('descripcion').value = mov.descripcion;
  
  // Cambia los textos del formulario a modo edición
  const titleEl = document.getElementById('movFormTitle');
  if (titleEl) {
    titleEl.innerHTML = '<i class="fa-solid fa-pen"></i> Editar Movimiento';
  }
  
  const submitBtn = document.getElementById('movSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = 'Guardar Cambios';
  }
  
  const cancelBtn = document.getElementById('movCancelBtn');
  if (cancelBtn) {
    cancelBtn.style.display = 'inline-flex';
  }
  
  // Scroll suave al formulario
  const formCard = document.querySelector('.form-card');
  if (formCard) {
    formCard.scrollIntoView({ behavior: 'smooth' });
  }
};

// Cancela la Edición de Movimiento
window.cancelarEdicion = function() {
  editId = null;
  
  // Restaura textos por defecto 
  const titleEl = document.getElementById('movFormTitle');
  if (titleEl) {
    titleEl.innerHTML = '<i class="fa-solid fa-plus-minus"></i> Nuevo Movimiento';
  }
  
  const submitBtn = document.getElementById('movSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = 'Agregar Movimiento';
  }
  
  const cancelBtn = document.getElementById('movCancelBtn');
  if (cancelBtn) {
    cancelBtn.style.display = 'none';
  }
  
  // Limpia campos del formulario
  document.getElementById('monto').value = '';
  document.getElementById('descripcion').value = '';
  
  // Restablece la fecha de hoy
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    fechaInput.value = `${yyyy}-${mm}-${dd}`;
  }
  
  updateCategoriaSelect();
};

// Eliminar Movimiento
window.eliminarMovimiento = function(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
    movimientos = movimientos.filter(m => m.id !== id);
    saveMovimientos();
    
    // se cancela al editar si estamos editando
    if (editId === id) {
      cancelarEdicion();
    }
    
    renderMovimientos();
    renderCategorias(); // Actualiza el conteo de transacciones por categoría
    updateDashboard();
  }
};

// Eliminar Categoría
window.eliminarCategoria = function(id) {
  const cat = categorias.find(c => c.id === id);
  if (!cat) return;
  
  const count = movimientos.filter(m => m.categoriaId === id).length;
  let mensaje = `¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"?`;
  if (count > 0) {
    mensaje = `La categoría "${cat.nombre}" está en uso por ${count} movimiento(s).\n\n¿Estás seguro de que deseas eliminarla? Los movimientos asociados se mostrarán como "Sin categoría".`;
  }
  
  if (confirm(mensaje)) {
    categorias = categorias.filter(c => c.id !== id);
    saveCategorias();
    renderCategorias();
    updateCategoriaSelect(); // Actualiza el select de categorías
    renderMovimientos();    // Re-renderiza la tabla para mostrar "Sin categoría"
    updateDashboard();      // Recalcula dashboard
  }
};

// CATEGORÍAS DINÁMICO 
function updateCategoriaSelect() {
  const tipoSelect = document.getElementById('tipo');
  const categoriaSelect = document.getElementById('categoria');
  if (!tipoSelect || !categoriaSelect) return;
  
  const selectedTipo = tipoSelect.value;
  const filteredCats = categorias.filter(c => c.tipo === selectedTipo);
  
  categoriaSelect.innerHTML = filteredCats.map(c => 
    `<option value="${c.id}">${c.nombre}</option>`
  ).join('');
}

// SUBMIT DE FORMULARIOS

const movimientoForm = document.getElementById('movimientoForm');
if (movimientoForm) {
  movimientoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const tipo = document.getElementById('tipo').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const categoriaId = document.getElementById('categoria').value;
    const fecha = document.getElementById('fecha').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    
    if (isNaN(monto) || monto <= 0) {
      alert('Por favor, ingresa un monto válido mayor a 0.');
      return;
    }
    
    if (!categoriaId) {
      alert('Por favor, selecciona una categoría. Si no hay, crea una primero.');
      return;
    }
    
    const datosMovimiento = {
      tipo,
      monto,
      categoriaId,
      fecha,
      descripcion: descripcion || ''
    };
    
    if (editId !== null) {
      // Guardar edición
      const idx = movimientos.findIndex(m => m.id === editId);
      if (idx !== -1) {
        movimientos[idx] = { id: editId, ...datosMovimiento };
        saveMovimientos();
      }
      cancelarEdicion();
    } else {
      // Agregar nuevo
      const nuevoMovimiento = {
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...datosMovimiento
      };
      movimientos.unshift(nuevoMovimiento);
      saveMovimientos();
      
      // Limpiar campos del formulario
      document.getElementById('monto').value = '';
      document.getElementById('descripcion').value = '';
    }
    
    renderMovimientos();
    renderCategorias(); // Para actualizar los contadores
    updateDashboard();
  });
}

const categoriaForm = document.getElementById('categoriaForm');
if (categoriaForm) {
  categoriaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombreInput = document.getElementById('catNombre');
    const tipoInput = document.getElementById('catTipo');
    const colorInput = document.getElementById('catColor');
    
    const nombre = nombreInput.value.trim();
    const tipo = tipoInput.value;
    const color = colorInput.value;
    
    if (!nombre) {
      alert('Por favor, ingresa un nombre para la categoría.');
      return;
    }
    
    // Validar duplicado por nombre y tipo
    const existe = categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.tipo === tipo);
    if (existe) {
      alert(`Ya existe una categoría de tipo "${tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}" llamada "${nombre}".`);
      return;
    }
    
    const nuevaCategoria = {
      id: `cat-${nombre.toLowerCase().replace(/\s+/g, '-')}-${tipo}`,
      nombre,
      color,
      tipo
    };
    categorias.push(nuevaCategoria);
    saveCategorias();
    
    renderCategorias();
    updateCategoriaSelect(); 
    
    // Resetear formulario
    nombreInput.value = '';
    colorInput.value = '#3b82f6';
  });
}

// Inicializa con la fecha de hoy
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  fechaInput.value = `${yyyy}-${mm}-${dd}`;
}

// Actualizaar categorías
const tipoSelect = document.getElementById('tipo');
if (tipoSelect) {
  tipoSelect.addEventListener('change', updateCategoriaSelect);
}

// Boton Cancelar edición
const movCancelBtn = document.getElementById('movCancelBtn');
if (movCancelBtn) {
  movCancelBtn.addEventListener('click', cancelarEdicion);
}

// MODO OSCURO
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Cargar tema guardado o usar preferencia del sistema
const temaGuardado = localStorage.getItem('tema') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

if (temaGuardado === 'dark') {
  body.classList.add('dark-mode');
  if (themeToggle) {
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    themeToggle.title = 'Cambiar a modo claro';
  }
} else {
  if (themeToggle) {
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    themeToggle.title = 'Cambiar a modo oscuro';
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const esModoOscuro = body.classList.contains('dark-mode');
    localStorage.setItem('tema', esModoOscuro ? 'dark' : 'light');
    
    // Cambia icono y tooltip 
    if (esModoOscuro) {
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      themeToggle.title = 'Cambiar a modo claro';
    } else {
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      themeToggle.title = 'Cambiar a modo oscuro';
    }
  });
}

// Inicialización de la UI basada en el estado de la sesión
verificarSesion();

