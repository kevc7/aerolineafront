import { useState, useEffect } from 'react';
import { billetesService } from '../services/api';

interface MyTicketsProps {
  user: any;
}

export default function MyTickets({ user }: MyTicketsProps) {
  const [billetes, setBilletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBillete, setSelectedBillete] = useState<any | null>(null);

  useEffect(() => {
    loadBilletes();
  }, [user.id]);

  const loadBilletes = async () => {
    try {
      setLoading(true);
      const response = await billetesService.obtenerPorUsuario(user.id);
      setBilletes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar billetes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
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
      emitido: 'bg-green-100 text-green-800',
      usado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado: string) => {
    const icons: { [key: string]: string } = {
      emitido: '✓',
      usado: '✈️',
      cancelado: '✗'
    };
    return icons[estado] || '?';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Cargando billetes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (billetes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">🎫</div>
        <p className="text-gray-500 text-lg mb-2">No tienes billetes emitidos</p>
        <p className="text-gray-400 text-sm">
          Los billetes se generan automáticamente después de completar un pago
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Billetes</h2>
          <p className="text-sm text-gray-500 mt-1">{billetes.length} billete(s) emitido(s)</p>
        </div>
        <button
          onClick={loadBilletes}
          className="text-sm text-primary hover:text-blue-700"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Lista de Billetes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {billetes.map((billete) => (
          <div
            key={billete.bill_id}
            className="relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-primary"
            onClick={() => setSelectedBillete(billete)}
          >
            {/* Header del Billete */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs opacity-75">BILLETE DE AVIÓN</p>
                  <p className="font-bold text-lg font-mono">{billete.bill_codigo}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoBadge(billete.bill_estado)}`}>
                  {getEstadoIcon(billete.bill_estado)} {billete.bill_estado.toUpperCase()}
                </span>
              </div>
              <p className="text-xs opacity-75">
                {billete.reserva.vuelo.aerolinea.aero_nom}
              </p>
            </div>

            {/* Información del Vuelo */}
            <div className="p-4">
              {/* Ruta */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{billete.reserva.vuelo.origen.ciu_codigo_aeropuerto}</p>
                  <p className="text-xs text-gray-600">{billete.reserva.vuelo.origen.ciu_nom}</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-primary text-xl">✈️</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Vuelo {billete.reserva.vuelo.vl_numero}
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{billete.reserva.vuelo.destino.ciu_codigo_aeropuerto}</p>
                  <p className="text-xs text-gray-600">{billete.reserva.vuelo.destino.ciu_nom}</p>
                </div>
              </div>

              {/* Detalles del Vuelo */}
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-600">Fecha de Salida</p>
                  <p className="font-semibold">{formatDate(billete.reserva.vuelo.vl_fecha_salida)}</p>
                  <p className="text-sm text-gray-700">{formatTime(billete.reserva.vuelo.vl_hora_salida)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Categoría</p>
                  <p className="font-semibold">{billete.reserva.categoria.cat_nombre}</p>
                </div>
              </div>

              {/* Información del Pasajero */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-1">PASAJERO</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {billete.pasajero.pas_nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{billete.pasajero.pas_nombre}</p>
                    <p className="text-xs text-gray-600">
                      {billete.pasajero.pas_tipo.toUpperCase()} • {billete.pasajero.pas_edad} años • CI: {billete.pasajero.pas_cedula}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer del Billete */}
              <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t">
                <div>
                  <p>Emitido el</p>
                  <p className="font-semibold text-gray-700">
                    {new Date(billete.bill_fecha_emision).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p>Factura</p>
                  <p className="font-semibold text-gray-700">{billete.factura.fac_numero}</p>
                </div>
              </div>
            </div>

            {/* Indicador de clic */}
            <div className="absolute top-4 right-4 text-white opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalle del Billete */}
      {selectedBillete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold">Detalle del Billete</h2>
              <button
                onClick={() => setSelectedBillete(null)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Código del Billete */}
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">CÓDIGO DEL BILLETE</p>
                <p className="text-3xl font-mono font-bold text-primary">{selectedBillete.bill_codigo}</p>
                <div className="mt-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getEstadoBadge(selectedBillete.bill_estado)}`}>
                    {getEstadoIcon(selectedBillete.bill_estado)} {selectedBillete.bill_estado.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Información del Vuelo */}
              <div>
                <h3 className="font-bold text-lg mb-3">📋 Información del Vuelo</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aerolínea:</span>
                    <span className="font-semibold">{selectedBillete.reserva.vuelo.aerolinea.aero_nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vuelo:</span>
                    <span className="font-semibold">{selectedBillete.reserva.vuelo.vl_numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ruta:</span>
                    <span className="font-semibold">
                      {selectedBillete.reserva.vuelo.origen.ciu_nom} → {selectedBillete.reserva.vuelo.destino.ciu_nom}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de Salida:</span>
                    <span className="font-semibold">{formatDate(selectedBillete.reserva.vuelo.vl_fecha_salida)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora de Salida:</span>
                    <span className="font-semibold">{formatTime(selectedBillete.reserva.vuelo.vl_hora_salida)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de Llegada:</span>
                    <span className="font-semibold">{formatDate(selectedBillete.reserva.vuelo.vl_fecha_llegada)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora de Llegada:</span>
                    <span className="font-semibold">{formatTime(selectedBillete.reserva.vuelo.vl_hora_llegada)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-semibold">{selectedBillete.reserva.categoria.cat_nombre}</span>
                  </div>
                </div>
              </div>

              {/* Información del Pasajero */}
              <div>
                <h3 className="font-bold text-lg mb-3">👤 Información del Pasajero</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-semibold">{selectedBillete.pasajero.pas_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cédula:</span>
                    <span className="font-semibold">{selectedBillete.pasajero.pas_cedula}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edad:</span>
                    <span className="font-semibold">{selectedBillete.pasajero.pas_edad} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-semibold">{selectedBillete.pasajero.pas_tipo.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Información de la Factura */}
              <div>
                <h3 className="font-bold text-lg mb-3">📄 Información de Factura</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de Factura:</span>
                    <span className="font-semibold">{selectedBillete.factura.fac_numero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de Emisión:</span>
                    <span className="font-semibold">
                      {new Date(selectedBillete.factura.fac_fecha_emision).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${Number(selectedBillete.factura.fac_subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos:</span>
                    <span className="font-semibold">${Number(selectedBillete.factura.fac_impuestos).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-bold">Total:</span>
                    <span className="font-bold text-green-600 text-lg">
                      ${Number(selectedBillete.factura.fac_total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar */}
              <button
                onClick={() => setSelectedBillete(null)}
                className="w-full bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

