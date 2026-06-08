// Web Worker para procesar los datos del dashboard en segundo plano

self.onmessage = function(e) {
  const { movimientos, categorias } = e.data;
  
  if (!movimientos || !categorias) {
    self.postMessage({ error: "Datos de movimientos o categorías no definidos." });
    return;
  }
  
  try {
    // Calcular los Ingresos, Gastos y el Balance
    const ingresos = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
      
    const gastos = movimientos
      .filter(m => m.tipo === 'gasto')
      .reduce((sum, m) => sum + m.monto, 0);
      
    const balance = ingresos - gastos;
    const totalTransacciones = movimientos.length;
    
    // Calcular los Gastos por Categoría
    const totalGastos = gastos;
    const gastosPorCat = {};
    
    movimientos
      .filter(m => m.tipo === 'gasto')
      .forEach(m => {
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
    
    // Se obtiene los 5 movimientos más recientes
    const recentMovs = [...movimientos].slice(0, 5).map(m => {
      const cat = categorias.find(c => c.id === m.categoriaId);
      return {
        id: m.id,
        tipo: m.tipo,
        monto: m.monto,
        fecha: m.fecha,
        descripcion: m.descripcion,
        catNombre: cat ? cat.nombre : 'Sin categoría',
        catColor: cat ? cat.color : '#6b7280'
      };
    });
    
    // Responder con los datos procesados
    self.postMessage({
      ingresos,
      gastos,
      balance,
      totalTransacciones,
      gastosOrdenados,
      recentMovs
    });
  } catch (error) {
    self.postMessage({ error: "Error de procesamiento: " + error.message });
  }
};
