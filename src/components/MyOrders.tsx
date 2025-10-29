import { useState, useEffect } from 'react';
import { ordenesService, pasajerosService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';
import PaymentModal from './PaymentModal';
import PaymentMultipleModal from './PaymentMultipleModal';

interface MyOrdersProps {
  user: any;
}

export default function MyOrders({ user }: MyOrdersProps) {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [pasajerosByReserva, setPasajerosByReserva] = useState<{ [key: number]: any[] }>({});
  const [selectedOrdenForPayment, setSelectedOrdenForPayment] = useState<any | null>(null);
  const [showPaymentMultipleModal, setShowPaymentMultipleModal] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    loadOrdenes();
  }, [user]);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const response = await ordenesService.obtenerPorUsuario(user.id);
      setOrdenes(response.data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPasajeros = async (reservaId: number) => {
    try {
      const response = await pasajerosService.obtener(reservaId);
      setPasajerosByReserva(prev => ({
        ...prev,
        [reservaId]: response.data
      }));
    } catch (error) {
      console.error('Error al cargar pasajeros:', error);
    }
  };

  const toggleOrder = (ordenId: number) => {
    if (expandedOrder === ordenId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(ordenId);
      // Cargar pasajeros de todas las reservas de esta orden
      const orden = ordenes.find(o => o.orden_id === ordenId);
      if (orden && orden.reservas) {
        orden.reservas.forEach((reserva: any) => {
          if (!pasajerosByReserva[reserva.res_id]) {
            loadPasajeros(reserva.res_id);
          }
        });
      }
    }
  };

  const handleCancelarOrden = async (ordenId: number) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Cancelar orden?',
      message: '¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await ordenesService.actualizarEstado(ordenId, 'cancelada');
          setConfirmModal({ ...confirmModal, isOpen: false });
          setAlertModal({
            isOpen: true,
            title: '¡Éxito!',
            message: 'Orden cancelada exitosamente',
            type: 'success'
          });
          loadOrdenes();
        } catch (error: any) {
          setConfirmModal({ ...confirmModal, isOpen: false });
          setAlertModal({
            isOpen: true,
            title: 'Error',
            message: error.response?.data?.message || 'Error al cancelar orden',
            type: 'error'
          });
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const formatFlightDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: { [key: string]: string } = {
      carrito: 'bg-yellow-100 text-yellow-800',
      pagada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado: string) => {
    const icons: { [key: string]: string } = {
      carrito: '🛒',
      pagada: '✅',
      cancelada: '❌'
    };
    return icons[estado] || '📋';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Cargando órdenes...</p>
      </div>
    );
  }

  if (ordenes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-lg mb-2">No tienes órdenes aún</p>
        <p className="text-gray-400 text-sm">Busca un vuelo y haz tu primera reserva</p>
      </div>
    );
  }

  const ordenesEnCarrito = ordenes.filter(o => o.orden_estado === 'carrito');
  const totalCarrito = ordenesEnCarrito.reduce((sum, o) => sum + Number(o.orden_total), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Mis Órdenes ({ordenes.length})</h2>
        <div className="flex gap-3">
          {ordenesEnCarrito.length > 1 && (
            <button
              onClick={() => setShowPaymentMultipleModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
            >
              🛒 Pagar Todo ({ordenesEnCarrito.length}) - ${totalCarrito.toFixed(2)}
            </button>
          )}
          <button
            onClick={loadOrdenes}
            className="text-sm text-primary hover:text-blue-700"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {ordenes.map((orden) => (
        <div
          key={orden.orden_id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          {/* Encabezado de la Orden */}
          <div
            onClick={() => toggleOrder(orden.orden_id)}
            className="p-4 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getEstadoIcon(orden.orden_estado)}</div>
                <div>
                  <p className="font-bold text-gray-800">Orden #{orden.orden_id}</p>
                  <p className="text-sm text-gray-500">
                    Creada: {formatDate(orden.orden_fecha_creacion)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">{orden.reservas?.length || 0} reserva(s)</p>
                  <p className="font-bold text-green-600 text-lg">
                    ${Number(orden.orden_total).toFixed(2)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(orden.orden_estado)}`}>
                  {orden.orden_estado.toUpperCase()}
                </span>
                <span className="text-gray-400">
                  {expandedOrder === orden.orden_id ? '▼' : '▶'}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles Expandidos */}
          {expandedOrder === orden.orden_id && (
            <div className="border-t bg-gray-50 p-4 space-y-4">
              {/* Información de Entrega */}
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tipo de Entrega:</p>
                <p className="text-sm text-gray-600">
                  {orden.orden_tipo_entrega === 'recoger_aeropuerto'
                    ? '✈️ Recoger en aeropuerto'
                    : '🏠 Envío a domicilio'}
                </p>
              </div>

              {/* Lista de Reservas */}
              {orden.reservas && orden.reservas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Reservas:</h4>
                  {orden.reservas.map((reserva: any) => (
                    <div key={reserva.res_id} className="bg-white p-4 rounded border mb-3">
                      {/* Información del Vuelo */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b">
                        <div>
                          <p className="font-bold text-primary">
                            {reserva.vuelo?.vl_numero || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {reserva.vuelo?.aerolinea?.aero_nom || 'N/A'}
                          </p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="font-semibold">
                            {reserva.vuelo?.origen?.ciu_codigo_aeropuerto} → {reserva.vuelo?.destino?.ciu_codigo_aeropuerto}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reserva.vuelo?.origen?.ciu_nom} - {reserva.vuelo?.destino?.ciu_nom}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {formatFlightDate(reserva.vuelo?.vl_fecha_salida)}
                          </p>
                          <p className="text-sm font-semibold">
                            {formatTime(reserva.vuelo?.vl_hora_salida)}
                          </p>
                        </div>
                      </div>

                      {/* Detalles de la Reserva */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Categoría:</p>
                          <p className="font-semibold">{reserva.categoria?.cat_nombre}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Asientos:</p>
                          <p className="font-semibold">{reserva.res_cantidad_asientos}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Precio/asiento:</p>
                          <p className="font-semibold">${reserva.res_precio_unitario}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Subtotal:</p>
                          <p className="font-bold text-green-600">${reserva.res_subtotal}</p>
                        </div>
                      </div>

                      {/* Pasajeros */}
                      {pasajerosByReserva[reserva.res_id] && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Pasajeros:</p>
                          <div className="space-y-1">
                            {pasajerosByReserva[reserva.res_id].map((pasajero: any, pIdx: number) => (
                              <div key={pasajero.pas_id} className="text-sm flex justify-between">
                                <span>
                                  {pIdx + 1}. <span className="font-medium">{pasajero.pas_nombre}</span>
                                </span>
                                <span className="text-gray-600">
                                  {pasajero.pas_tipo} - {pasajero.pas_edad} años
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-sm text-gray-600">
                  {orden.orden_estado === 'carrito' && (
                    <p className="text-yellow-700">
                      ⚠️ Esta orden está en tu carrito. Completa el pago para confirmar.
                    </p>
                  )}
                  {orden.orden_estado === 'pagada' && (
                    <p className="text-green-700">
                      ✅ Orden pagada. Puedes recoger tus billetes.
                    </p>
                  )}
                  {orden.orden_estado === 'cancelada' && (
                    <p className="text-red-700">
                      ❌ Esta orden fue cancelada.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {orden.orden_estado === 'carrito' && (
                    <>
                      <button
                        onClick={() => handleCancelarOrden(orden.orden_id)}
                        className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Cancelar Orden
                      </button>
                      <button
                        onClick={() => setSelectedOrdenForPayment(orden)}
                        className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        💳 Pagar Ahora
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Modales de Confirmación y Alerta */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmColor="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />

      {/* Modal de Pago */}
      {selectedOrdenForPayment && (
        <PaymentModal
          orden={selectedOrdenForPayment}
          user={user}
          onClose={() => setSelectedOrdenForPayment(null)}
          onSuccess={() => {
            setSelectedOrdenForPayment(null);
            loadOrdenes(); // Recargar órdenes después del pago exitoso
          }}
        />
      )}

      {showPaymentMultipleModal && (
        <PaymentMultipleModal
          ordenes={ordenesEnCarrito}
          user={user}
          onClose={() => setShowPaymentMultipleModal(false)}
          onSuccess={() => {
            setShowPaymentMultipleModal(false);
            loadOrdenes(); // Recargar órdenes después del pago exitoso
          }}
        />
      )}
    </div>
  );
}

