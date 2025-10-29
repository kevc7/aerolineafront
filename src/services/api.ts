import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// AUTH
// ============================================================
export const authService = {
  register: (correo: string, contrasenia: string, cedula: string, nombre: string, telefono?: string) =>
    api.post('/auth/register', { correo, contrasenia, cedula, nombre, telefono }),
  
  login: (correo: string, contrasenia: string) =>
    api.post('/auth/login', { correo, contrasenia }),
  
  listarUsuarios: () =>
    api.get('/auth/'),
};

// ============================================================
// VUELOS
// ============================================================
export const vuelosService = {
  obtenerTodos: () =>
    api.get('/vuelos/obtener'),
  
  obtenerPorId: (id: number) =>
    api.get(`/vuelos/${id}`),
  
  buscar: (origen?: number, destino?: number, fecha?: string, aerolinea?: number, categoria?: number, directo?: boolean, estado?: string, tarifa_min?: number, tarifa_max?: number) => {
    const params = new URLSearchParams();
    if (origen) params.append('origen', origen.toString());
    if (destino) params.append('destino', destino.toString());
    if (fecha) params.append('fecha', fecha);
    if (aerolinea) params.append('aerolinea', aerolinea.toString());
    if (categoria) params.append('categoria', categoria.toString());
    if (directo !== undefined) params.append('directo', directo.toString());
    if (estado) params.append('estado', estado);
    if (tarifa_min) params.append('tarifa_min', tarifa_min.toString());
    if (tarifa_max) params.append('tarifa_max', tarifa_max.toString());
    
    return api.get(`/vuelos/buscar/filtros?${params.toString()}`);
  },
  
  buscarPorHorarios: (origen: number, destino: number, fecha: string) =>
    api.get(`/vuelos/horarios?origen=${origen}&destino=${destino}&fecha=${fecha}`),
  
  buscarPorTarifas: (origen: number, destino: number, fecha: string, orden?: string) =>
    api.get(`/vuelos/tarifas?origen=${origen}&destino=${destino}&fecha=${fecha}&orden=${orden || 'asc'}`),
  
  vuelosDisponibles: (origen: number, destino: number, fecha: string) =>
    api.get(`/vuelos/disponibles?origen=${origen}&destino=${destino}&fecha=${fecha}`),
};

// ============================================================
// ÓRDENES
// ============================================================
export const ordenesService = {
  crear: (usu_id: number) =>
    api.post('/ordenes/', { usu_id }),
  
  obtenerTodas: () =>
    api.get('/ordenes/'),
  
  obtenerPorId: (id: number) =>
    api.get(`/ordenes/${id}`),
  
  obtenerPorUsuario: (usu_id: number) =>
    api.get(`/ordenes/usuario/${usu_id}`),
  
  actualizarEstado: (id: number, estado: string) =>
    api.put(`/ordenes/${id}/estado`, { estado }),
  
  actualizarTipoEntrega: (id: number, tipo_entrega: 'recoger_aeropuerto' | 'domicilio') =>
    api.put(`/ordenes/${id}/tipo-entrega`, { tipo_entrega }),
  
  eliminar: (id: number) =>
    api.delete(`/ordenes/${id}`),
};

// ============================================================
// RESERVAS
// ============================================================
export const reservasService = {
  crear: (orden_id: number, vl_id: number, cat_id: number, cantidad_asientos: number) =>
    api.post('/reservas/', { orden_id, vl_id, cat_id, cantidad_asientos }),
  
  obtenerTodas: () =>
    api.get('/reservas/'),
  
  obtenerPorId: (id: number) =>
    api.get(`/reservas/${id}`),
  
  obtenerPorUsuario: (usu_id: number) =>
    api.get(`/reservas/usuario/${usu_id}`),
  
  cancelar: (id: number) =>
    api.delete(`/reservas/${id}`),
};

// ============================================================
// PASAJEROS
// ============================================================
export const pasajerosService = {
  agregar: (res_id: number, nombre: string, cedula: string, edad?: number, tipo?: string) =>
    api.post('/pasajeros/', { res_id, nombre, cedula, edad, tipo }),
  
  obtener: (res_id: number) =>
    api.get(`/pasajeros/?res_id=${res_id}`),
  
  obtenerPorId: (id: number) =>
    api.get(`/pasajeros/${id}`),
  
  actualizar: (id: number, nombre: string, cedula: string, edad?: number, tipo?: string) =>
    api.put(`/pasajeros/${id}`, { nombre, cedula, edad, tipo }),
  
  eliminar: (id: number) =>
    api.delete(`/pasajeros/${id}`),
};

// ============================================================
// TARJETAS
// ============================================================
export const tarjetasService = {
  agregar: (usu_id: number, numero: string, titular: string, vencimiento: string, tipo: string) =>
    api.post('/tarjetas/', { usu_id, numero, titular, vencimiento, tipo }),
  
  obtenerTodas: () =>
    api.get('/tarjetas/'),
  
  obtenerPorUsuario: (usu_id: number) =>
    api.get(`/tarjetas/usuario/${usu_id}`),
  
  obtenerPorId: (id: number) =>
    api.get(`/tarjetas/${id}`),
  
  actualizar: (id: number, data: { titular?: string; vencimiento?: string; activa?: boolean }) =>
    api.put(`/tarjetas/${id}`, data),
  
  desactivar: (id: number) =>
    api.patch(`/tarjetas/${id}/desactivar`, {}),
  
  eliminar: (id: number) =>
    api.delete(`/tarjetas/${id}`),
};

// ============================================================
// PAGOS
// ============================================================
export const pagosService = {
  iniciar: (orden_id: number, tarj_id: number, tipo_entrega?: string) =>
    api.post('/pagos/iniciar', { orden_id, tarj_id, tipo_entrega }),
  
  verificar: (pago_id: number, codigo: string) =>
    api.post('/pagos/verificar', { pago_id, codigo }),
  
  iniciarMultiple: (ordenes_ids: number[], tarj_id: number, tipo_entrega?: string) =>
    api.post('/pagos/iniciar-multiple', { ordenes_ids, tarj_id, tipo_entrega }),
  
  verificarMultiple: (codigo_verificacion: string, codigo: string) =>
    api.post('/pagos/verificar-multiple', { codigo_verificacion, codigo }),
  
  obtenerTodos: () =>
    api.get('/pagos/'),
  
  obtenerPorId: (id: number) =>
    api.get(`/pagos/${id}`),
  
  actualizarEstado: (id: number, estado: string) =>
    api.put(`/pagos/${id}`, { estado }),
};

// ============================================================
// FACTURAS
// ============================================================
export const facturasService = {
  crear: (orden_id: number, pago_id: number) =>
    api.post('/facturas/', { orden_id, pago_id }),
  
  obtenerTodas: () =>
    api.get('/facturas/'),
  
  obtenerPorId: (id: number) =>
    api.get(`/facturas/${id}`),
  
  obtenerPorUsuario: (usu_id: number) =>
    api.get(`/facturas/usuario/${usu_id}`),
};

// ============================================================
// BILLETES
// ============================================================
export const billetesService = {
  crear: (res_id: number, pas_id: number, fac_id: number) =>
    api.post('/billetes/', { res_id, pas_id, fac_id }),
  
  obtenerTodos: () =>
    api.get('/billetes/'),
  
  obtenerPorId: (id: number) =>
    api.get(`/billetes/${id}`),
  
  obtenerPorUsuario: (usu_id: number) =>
    api.get(`/billetes/usuario/${usu_id}`),
  
  actualizarEstado: (id: number, estado: string) =>
    api.put(`/billetes/${id}`, { estado }),
};

// ============================================================
// CIUDADES
// ============================================================
export const ciudadesService = {
  obtenerTodas: () =>
    api.get('/ciudades/'),
};

export default api;
