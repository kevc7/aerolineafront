import { useState, useRef } from 'react';
import { ordenesService, reservasService, pasajerosService } from '../services/api';
import AlertModal from './AlertModal';

interface BookingModalProps {
  flight: any;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface Pasajero {
  nombre: string;
  cedula: string;
  edad: string;
  tipo: 'adulto' | 'niño' | 'infante';
}

export default function BookingModal({ flight, user, onClose, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState(1); // 1: Selección, 2: Pasajeros, 3: Confirmación
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [cantidadAsientos, setCantidadAsientos] = useState(1);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([{
    nombre: '',
    cedula: '',
    edad: '',
    tipo: 'adulto'
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isProcessingRef = useRef(false);
  
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const handleCategoriaSelect = (categoria: any) => {
    setSelectedCategoria(categoria);
    setCantidadAsientos(1);
    // Inicializar pasajeros según cantidad
    setPasajeros([{
      nombre: '',
      cedula: '',
      edad: '',
      tipo: 'adulto'
    }]);
  };

  const handleCantidadChange = (cantidad: number) => {
    setCantidadAsientos(cantidad);
    // Ajustar array de pasajeros
    const nuevosPasajeros = Array.from({ length: cantidad }, (_, i) => 
      pasajeros[i] || {
        nombre: '',
        cedula: '',
        edad: '',
        tipo: 'adulto' as const
      }
    );
    setPasajeros(nuevosPasajeros);
  };

  const getTipoPorEdad = (edad: number): 'adulto' | 'niño' | 'infante' => {
    if (edad >= 0 && edad <= 1) return 'infante';
    if (edad >= 2 && edad <= 11) return 'niño';
    return 'adulto';
  };

  const handlePasajeroChange = (index: number, field: string, value: string) => {
    const nuevosPasajeros = [...pasajeros];
    
    // Si se cambia la edad, actualizar automáticamente el tipo
    if (field === 'edad') {
      const edadNum = parseInt(value);
      const nuevoTipo = !isNaN(edadNum) ? getTipoPorEdad(edadNum) : 'adulto';
      
      nuevosPasajeros[index] = {
        ...nuevosPasajeros[index],
        edad: value,
        tipo: nuevoTipo
      };
    } else {
      nuevosPasajeros[index] = {
        ...nuevosPasajeros[index],
        [field]: value
      };
    }
    
    setPasajeros(nuevosPasajeros);
  };

  const validatePasajeros = () => {
    for (let i = 0; i < pasajeros.length; i++) {
      const pasajero = pasajeros[i];
      
      // Validar campos obligatorios
      if (!pasajero.nombre || !pasajero.cedula || !pasajero.edad) {
        setError(`Pasajero ${i + 1}: Completa todos los campos obligatorios`);
        return false;
      }
      
      // Validar edad es un número válido
      const edad = parseInt(pasajero.edad);
      if (isNaN(edad) || edad < 0 || edad > 120) {
        setError(`Pasajero ${i + 1}: La edad debe estar entre 0 y 120 años`);
        return false;
      }
      
      // Validar que el tipo corresponda a la edad
      const tipoEsperado = getTipoPorEdad(edad);
      if (pasajero.tipo !== tipoEsperado) {
        setError(`Pasajero ${i + 1}: El tipo no coincide con la edad ingresada`);
        return false;
      }
      
      // Validar nombre (mínimo 3 caracteres)
      if (pasajero.nombre.trim().length < 3) {
        setError(`Pasajero ${i + 1}: El nombre debe tener al menos 3 caracteres`);
        return false;
      }
      
      // Validar cédula/pasaporte (mínimo 5 caracteres)
      if (pasajero.cedula.trim().length < 5) {
        setError(`Pasajero ${i + 1}: La cédula/pasaporte debe tener al menos 5 caracteres`);
        return false;
      }
    }
    
    return true;
  };

  const handleConfirmarReserva = async () => {
    // Prevenir múltiples llamadas usando ref (más confiable que useState)
    if (isProcessingRef.current) {
      console.log('⚠️ Ya se está procesando una reserva, ignorando clic duplicado');
      return;
    }

    if (!validatePasajeros()) {
      setError('Por favor completa todos los datos de los pasajeros');
      return;
    }

    setLoading(true);
    isProcessingRef.current = true;
    setError('');
    
    console.log('🔒 Flag de procesamiento activado');

    try {
      // 1. Crear orden
      console.log('📝 Creando orden...');
      const ordenResponse = await ordenesService.crear(user.id);
      const ordenId = ordenResponse.data.orden.orden_id;
      console.log('✅ Orden creada:', ordenId);

      // 2. Crear reserva
      console.log('🎫 Creando reserva...');
      const reservaResponse = await reservasService.crear(
        ordenId,
        flight.vl_id,
        selectedCategoria.cat_id,
        cantidadAsientos
      );
      const reservaId = reservaResponse.data.reserva.res_id;
      console.log('✅ Reserva creada:', reservaId);

      // 3. Crear pasajeros
      console.log('👥 Creando pasajeros...');
      for (const pasajero of pasajeros) {
        await pasajerosService.agregar(
          reservaId,
          pasajero.nombre,
          pasajero.cedula,
          parseInt(pasajero.edad),
          pasajero.tipo
        );
      }
      console.log('✅ Todos los pasajeros creados');

      // Éxito
      setAlertModal({
        isOpen: true,
        title: '¡Reserva Exitosa! 🎉',
        message: `Tu reserva ha sido creada correctamente.\n\nOrden ID: ${ordenId}\nReserva ID: ${reservaId}`,
        type: 'success'
      });
      
      // Dar tiempo para que el usuario vea el modal antes de cerrar
      setTimeout(() => {
        setAlertModal({ ...alertModal, isOpen: false });
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('❌ Error al crear reserva:', err);
      setError(err.response?.data?.message || 'Error al crear la reserva');
      isProcessingRef.current = false; // Resetear en caso de error
      console.log('🔓 Flag de procesamiento desactivado (error)');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center sticky top-0 shadow-lg">
          <h2 className="text-xl font-bold flex items-center gap-3">
            {step === 1 && (
              <>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span>Seleccionar Categoría</span>
              </>
            )}
            {step === 2 && (
              <>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span>Datos de Pasajeros</span>
              </>
            )}
            {step === 3 && (
              <>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Confirmar Reserva</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del Vuelo */}
        <div className="bg-blue-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vuelo</p>
              <p className="font-bold text-lg">{flight.vl_numero}</p>
              <p className="text-sm text-gray-600">{flight.aerolinea.aero_nom}</p>
            </div>
            <div className="text-center flex-1">
              <p className="font-bold text-lg">{flight.origen.ciu_codigo_aeropuerto} → {flight.destino.ciu_codigo_aeropuerto}</p>
              <p className="text-sm text-gray-600">{flight.origen.ciu_nom} - {flight.destino.ciu_nom}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Salida</p>
              <p className="font-semibold">{formatDate(flight.vl_fecha_salida)}</p>
              <p className="text-sm text-gray-600">{formatTime(flight.vl_hora_salida)}</p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="px-6 py-6">
          {/* PASO 1: Selección de Categoría */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Selecciona la categoría de asiento:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {flight.categorias.map((cat: any) => (
                  <button
                    key={cat.vlcat_id}
                    onClick={() => handleCategoriaSelect(cat)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedCategoria?.vlcat_id === cat.vlcat_id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <p className="font-bold text-primary text-lg">{cat.categoria.cat_nombre}</p>
                    <p className="text-2xl font-bold text-green-600 my-2">${cat.vlcat_precio_base}</p>
                    <p className="text-sm text-gray-600">{cat.vlcat_asientos_disponibles} asientos disponibles</p>
                    {cat.categoria.cat_descripcion && (
                      <p className="text-xs text-gray-500 mt-2">{cat.categoria.cat_descripcion}</p>
                    )}
                  </button>
                ))}
              </div>

              {selectedCategoria && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <label className="block font-semibold mb-2">
                    ¿Cuántos asientos deseas reservar?
                  </label>
                  <select
                    value={cantidadAsientos}
                    onChange={(e) => handleCantidadChange(Number(e.target.value))}
                    className="input-field max-w-xs"
                  >
                    {Array.from({ length: Math.min(selectedCategoria.vlcat_asientos_disponibles, 9) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'asiento' : 'asientos'}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4 p-3 bg-white rounded border">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${(Number(selectedCategoria.vlcat_precio_base) * cantidadAsientos).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {cantidadAsientos} x ${selectedCategoria.vlcat_precio_base}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedCategoria}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Datos de Pasajeros */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Ingresa los datos de los pasajeros:</h3>
              <div className="space-y-4">
                {pasajeros.map((pasajero, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3">Pasajero {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          value={pasajero.nombre}
                          onChange={(e) => handlePasajeroChange(index, 'nombre', e.target.value)}
                          className="input-field"
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cédula/Pasaporte *</label>
                        <input
                          type="text"
                          value={pasajero.cedula}
                          onChange={(e) => handlePasajeroChange(index, 'cedula', e.target.value)}
                          className="input-field"
                          placeholder="1234567890"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Edad *</label>
                        <input
                          type="number"
                          value={pasajero.edad}
                          onChange={(e) => handlePasajeroChange(index, 'edad', e.target.value)}
                          className="input-field"
                          placeholder="25"
                          min="0"
                          max="120"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          El tipo se ajustará automáticamente
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tipo * <span className="text-xs text-gray-500">(automático)</span>
                        </label>
                        <div className="input-field bg-gray-100 cursor-not-allowed flex items-center">
                          <span className="font-medium">
                            {pasajero.tipo === 'infante' && '👶 Infante (0-1 años)'}
                            {pasajero.tipo === 'niño' && '🧒 Niño (2-11 años)'}
                            {pasajero.tipo === 'adulto' && '🧑 Adulto (12+ años)'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          ✓ Basado en la edad ingresada
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Volver
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary"
                >
                  Revisar Reserva →
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Confirmación */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Confirma tu reserva:</h3>
              
              {/* Resumen */}
              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3">Detalles de la Reserva</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-semibold">{selectedCategoria.categoria.cat_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cantidad de asientos:</span>
                    <span className="font-semibold">{cantidadAsientos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio por asiento:</span>
                    <span className="font-semibold">${selectedCategoria.vlcat_precio_base}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-green-600 text-xl">
                      ${(Number(selectedCategoria.vlcat_precio_base) * cantidadAsientos).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Pasajeros */}
              <div className="border rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3">Pasajeros</h4>
                <div className="space-y-2">
                  {pasajeros.map((pasajero, index) => (
                    <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{index + 1}. {pasajero.nombre}</span>
                      <span className="text-gray-600">{pasajero.tipo} - {pasajero.edad} años</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Nota:</strong> Esta reserva se creará en estado "carrito". Para completar la compra, 
                  deberás realizar el pago desde la sección "Mis Órdenes".
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleConfirmarReserva}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar Reserva ✓'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Alerta */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
}

