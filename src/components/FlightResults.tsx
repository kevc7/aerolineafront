import { useState } from 'react';
import BookingModal from './BookingModal';

interface FlightResultsProps {
  flights: any[];
  user: any;
  onReservaCreada?: () => void;
}

export default function FlightResults({ flights, user, onReservaCreada }: FlightResultsProps) {
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    // Usar UTC para evitar problemas de zona horaria
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      timeZone: 'UTC' 
    });
  };

  const handleReservar = (flight: any) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedFlight(null);
  };

  const handleReservaSuccess = () => {
    if (onReservaCreada) {
      onReservaCreada();
    }
  };

  return (
    <div className="space-y-2">
      {flights.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No se encontraron vuelos</p>
        </div>
      ) : (
        flights.map((flight, index) => (
          <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-3">
            {/* Información principal del vuelo */}
            <div className="flex items-center justify-between gap-3 mb-2">
              {/* Aerolínea y número de vuelo */}
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white px-2 py-1 rounded text-xs font-bold">
                  {flight.aerolinea?.aero_codigo || 'XX'}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vuelo</p>
                  <p className="font-bold text-sm">{flight.vl_numero}</p>
                </div>
              </div>

              {/* Ruta */}
              <div className="flex items-center gap-2 flex-1">
                <div className="text-center">
                  <p className="font-bold text-sm">{flight.origen?.ciu_codigo_aeropuerto || 'XXX'}</p>
                  <p className="text-xs text-gray-500">{flight.origen?.ciu_nom}</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="border-t-2 border-primary w-full relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                      ✈️
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">{flight.destino?.ciu_codigo_aeropuerto || 'XXX'}</p>
                  <p className="text-xs text-gray-500">{flight.destino?.ciu_nom}</p>
                </div>
              </div>

              {/* Fecha y horario */}
              <div className="text-right">
                <p className="text-xs text-gray-500">Salida</p>
                <p className="font-semibold text-sm">{formatDate(flight.vl_fecha_salida)}</p>
                <p className="text-xs text-gray-600">{formatTime(flight.vl_hora_salida)}</p>
              </div>

              {/* Estado */}
              <div className="text-center">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  flight.vl_estado === 'programado' ? 'bg-green-100 text-green-700' :
                  flight.vl_estado === 'en_hora' ? 'bg-blue-100 text-blue-700' :
                  flight.vl_estado === 'abordando' ? 'bg-orange-100 text-orange-700' :
                  flight.vl_estado === 'en_vuelo' ? 'bg-purple-100 text-purple-700' :
                  flight.vl_estado === 'completado' ? 'bg-gray-100 text-gray-700' :
                  flight.vl_estado === 'retrasado' ? 'bg-yellow-100 text-yellow-700' :
                  flight.vl_estado === 'cancelado' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {flight.vl_estado === 'en_hora' ? '🕐 En hora' :
                   flight.vl_estado === 'programado' ? '📅 Programado' :
                   flight.vl_estado === 'abordando' ? '🚪 Abordando' :
                   flight.vl_estado === 'en_vuelo' ? '✈️ En vuelo' :
                   flight.vl_estado === 'completado' ? '✅ Completado' :
                   flight.vl_estado === 'retrasado' ? '⏰ Retrasado' :
                   flight.vl_estado === 'cancelado' ? '❌ Cancelado' :
                   flight.vl_estado}
                </span>
              </div>
            </div>

            {/* Categorías y precios */}
            <div className="flex items-center gap-2 flex-wrap border-t pt-2">
              <span className="text-xs text-gray-600 font-medium">Categorías:</span>
              {flight.categorias?.map((cat: any, i: number) => (
                <div key={i} className="bg-gray-50 px-3 py-1 rounded flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">{cat.categoria?.cat_nombre}</span>
                  <span className="text-xs text-gray-600">|</span>
                  <span className="text-xs font-bold text-green-600">${cat.vlcat_precio_base}</span>
                  <span className="text-xs text-gray-500">({cat.vlcat_asientos_disponibles} disp.)</span>
                </div>
              ))}
              <button 
                onClick={() => handleReservar(flight)}
                className="ml-auto bg-primary hover:bg-blue-700 text-white px-4 py-1 rounded text-xs transition-colors"
              >
                Reservar
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal de Reserva */}
      {showBookingModal && selectedFlight && (
        <BookingModal
          flight={selectedFlight}
          user={user}
          onClose={handleCloseModal}
          onSuccess={handleReservaSuccess}
        />
      )}
    </div>
  );
}
