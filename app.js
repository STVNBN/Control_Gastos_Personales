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

let movimientos = [];
let nextMovId = 1;

//  DOM
const movForm = document.getElementById('movimientoForm');
const movBody = document.getElementById('movimientosBody');
const emptyMov = document.getElementById('emptyMovimientos');
const movBadge = document.getElementById('movementBadge');
const fechaInput = document.getElementById('fecha');

// Establece la fecha 
fechaInput.value = new Date().toISOString().split('T')[0];

// Maneja el evento submit
movForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Obtener 
  const tipo = document.getElementById('tipo').value;
  const monto = parseFloat(document.getElementById('monto').value);
  const categoria = document.getElementById('categoria').value;
  const fecha = fechaInput.value;
  const descripcion = document.getElementById('descripcion').value.trim();

  // Validar 
  if (!monto || monto <= 0) return;

  // Agregar al array
  movimientos.push({
    id: `m${nextMovId++}`,
    tipo,
    monto,
    categoria,
    fecha,
    descripcion
  });

  // Limpia el formulario
  movForm.reset();
  fechaInput.value = new Date().toISOString().split('T')[0];
  
  // Actualiza la vista
  renderMovimientos();
});

function renderMovimientos() {
  movBadge.textContent = movimientos.length;

  // Ordena los movimientos
  const sorted = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Mostrar u ocultar estado vacío
  if (sorted.length === 0) {
    movBody.innerHTML = '';
    emptyMov.style.display = 'block';
    return;
  }
  
  emptyMov.style.display = 'none';

  // Genera el html de las filas
  movBody.innerHTML = sorted.map(m => {
    const cls = m.tipo === 'ingreso' ? 'ingreso' : 'gasto';
    const signo = m.tipo === 'ingreso' ? '+' : '-';
    const colorMonto = m.tipo === 'ingreso' ? 'var(--income)' : 'var(--expense)';
    
    // monto 
    const montoFormateado = `$${m.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return `
      <tr>
        <td><span class="type-badge ${cls}">${m.tipo}</span></td>
        <td style="font-weight:600; color:${colorMonto}">${signo}${montoFormateado}</td>
        <td>${m.categoria}</td>
        <td>${m.fecha}</td>
        <td>${m.descripcion || '—'}</td>
        <td>
          <button class="btn btn-danger" onclick="eliminarMovimiento('${m.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Elimina moviumiento
function eliminarMovimiento(id) {
  movimientos = movimientos.filter(m => m.id !== id);
  renderMovimientos();
}

// Render inicial
renderMovimientos();