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

// Datos de prueba
const categorias = [
  { nombre: 'Alimentación', color: '#ef4444', tipo: 'gasto' },
  { nombre: 'Transporte', color: '#3b82f6', tipo: 'gasto' },
  { nombre: 'Salario', color: '#10b981', tipo: 'ingreso' },
  { nombre: 'Vivienda', color: '#f59e0b', tipo: 'gasto' },
  { nombre: 'Entretenimiento', color: '#8b5cf6', tipo: 'gasto' },
  { nombre: 'Salud', color: '#ec4899', tipo: 'gasto' }
];

const movimientos = [
  { tipo: 'ingreso', monto: 1500.00, categoria: 'Salario', fecha: '2026-06-05', descripcion: 'Salario Mensual' },
  { tipo: 'gasto', monto: 150.00, categoria: 'Alimentación', fecha: '2026-06-05', descripcion: 'Supermercado quincenal' },
  { tipo: 'gasto', monto: 35.50, categoria: 'Transporte', fecha: '2026-06-04', descripcion: 'Combustible semanal' },
  { tipo: 'gasto', monto: 120.00, categoria: 'Vivienda', fecha: '2026-06-03', descripcion: 'Pago de Internet' }
];

// DOM
const movBody = document.getElementById('movimientosBody');
const emptyMov = document.getElementById('emptyMovimientos');
const movBadge = document.getElementById('movementBadge');
const catList = document.getElementById('categoriasList');
const catBadge = document.getElementById('categoryBadge');

// Render de tablas
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

    // Buscar color de la categoría
    const cat = categorias.find(c => c.nombre === m.categoria && c.tipo === m.tipo);
    const catColor = cat ? cat.color : '#6b7280';

    return `
      <tr>
        <td><span class="type-badge ${cls}">${m.tipo}</span></td>
        <td style="font-weight:600; color:${colorMonto}">${signo}${montoFormateado}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${catColor}"></span>
            ${m.categoria}
          </span>
        </td>
        <td>${m.fecha}</td>
        <td>${m.descripcion || '—'}</td>
      </tr>
    `;
  }).join('');
}

// render de listas
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
    const count = movimientos.filter(m => m.categoria === c.nombre && m.tipo === c.tipo).length;
    const tipoBadge = c.tipo === 'ingreso' 
      ? `<span class="type-badge ingreso">Ingreso</span>`
      : `<span class="type-badge gasto">Gasto</span>`;

    return `
      <div class="category-item" style="border-left: 5px solid ${c.color};">
        <div class="category-item-info">
          <span class="category-item-name">${c.nombre}</span>
          <div class="category-item-meta">
            ${tipoBadge}
            <span class="category-usage-badge">${count} transacciones</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

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
    gastosPorCat[m.categoria] = (gastosPorCat[m.categoria] || 0) + m.monto;
  });

  const gastosOrdenados = Object.keys(gastosPorCat).map(nombre => {
    const cat = categorias.find(c => c.nombre === nombre && c.tipo === 'gasto');
    const color = cat ? cat.color : '#cbd5e1';
    return {
      nombre,
      monto: gastosPorCat[nombre],
      color,
      pct: totalGastos > 0 ? (gastosPorCat[nombre] / totalGastos) * 100 : 0
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
          <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
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
        const cat = categorias.find(c => c.nombre === m.categoria && c.tipo === m.tipo);
        const catColor = cat ? cat.color : '#6b7280';
        
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="background: ${catColor}; width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
              <div>
                <div style="font-weight: 600; font-size: 0.88rem; color: var(--text);">${m.descripcion || m.categoria}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary);">${m.fecha} • ${m.categoria}</div>
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

// iniialización
renderMovimientos();
renderCategorias();
updateDashboard();

