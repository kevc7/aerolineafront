import { useState, useEffect } from 'react';
import { tarjetasService, pagosService } from '../services/api';
import AlertModal from './AlertModal';

interface PaymentModalProps {
  orden: any;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ orden, user, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState(1); // 1: Seleccionar tarjeta, 2: Ingresar código
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [selectedTarjeta, setSelectedTarjeta] = useState<any>(null);
  const [tipoEntrega, setTipoEntrega] = useState<'recoger_aeropuerto' | 'domicilio'>('recoger_aeropuerto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para verificación de código
  const [pagoId, setPagoId] = useState<number | null>(null);
  const [codigo, setCodigo] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [codigoDesarrollo, setCodigoDesarrollo] = useState('');
  
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    loadTarjetas();
  }, [user.id]);

  const loadTarjetas = async () => {
    try {
      const response = await tarjetasService.obtenerPorUsuario(user.id);
      // Filtrar solo tarjetas activas
      const tarjetasActivas = response.data.filter((t: any) => t.tarj_activa);
      setTarjetas(tarjetasActivas);
      
      if (tarjetasActivas.length === 0) {
        setError('No tienes tarjetas activas. Por favor agrega una tarjeta en "Mis Tarjetas".');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No tienes tarjetas registradas. Por favor agrega una tarjeta en "Mis Tarjetas".');
        setTarjetas([]);
      } else {
        setError('Error al cargar tarjetas');
      }
    }
  };

  const handleIniciarPago = async () => {
    if (!selectedTarjeta) {
      setError('Por favor selecciona una tarjeta');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await pagosService.iniciar(
        orden.orden_id,
        selectedTarjeta.tarj_id,
        tipoEntrega
      );

      setPagoId(response.data.pago_id);
      setCorreoUsuario(response.data.correo);
      setCodigoDesarrollo(response.data.codigo_desarrollo || '');
      
      setStep(2); // Pasar al paso de verificación
      
      setAlertModal({
        isOpen: true,
        title: '📧 Código Enviado',
        message: `Hemos enviado un código de verificación a ${response.data.correo}. Revisa tu correo electrónico.`,
        type: 'info'
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo || codigo.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await pagosService.verificar(pagoId!, codigo);

      setAlertModal({
        isOpen: true,
        title: '✅ ¡Pago Exitoso!',
        message: `Tu pago ha sido procesado correctamente.\n\nFactura: ${response.data.factura.fac_numero}\nBilletes emitidos: ${response.data.billetes_emitidos}\n\n¡Buen viaje!`,
        type: 'success'
      });

      // Dar tiempo para ver el modal antes de cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('❌ Código incorrecto. Por favor intenta nuevamente.');
      } else {
        setError(err.response?.data?.message || 'Error al verificar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumeroTarjeta = (numero: string) => {
    return numero.replace(/(\d{4})/g, '$1 ').trim();
  };

  const getTipoIcon = (tipo: string) => {
    const icons: { [key: string]: string } = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Diners Club': '💳'
    };
    return icons[tipo] || '💳';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold">
            {step === 1 ? '💳 Procesar Pago' : '🔐 Verificar Código'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Información de la Orden */}
        <div className="bg-blue-50 px-6 py-4 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Orden</p>
              <p className="font-bold">#{orden.orden_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total a Pagar</p>
              <p className="font-bold text-2xl text-green-600">${Number(orden.orden_total).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* PASO 1: Selección de Tarjeta y Tipo de Entrega */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Selección de Tarjeta */}
              <div>
                <h3 className="text-lg font-bold mb-3">Selecciona tu tarjeta de pago</h3>
                
                {tarjetas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tienes tarjetas activas</p>
                    <button
                      onClick={onClose}
                      className="text-primary hover:underline"
                    >
                      Ir a Mis Tarjetas →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tarjetas.map((tarjeta) => (
                      <button
                        key={tarjeta.tarj_id}
                        onClick={() => setSelectedTarjeta(tarjeta)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTarjeta?.tarj_id === tarjeta.tarj_id
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{getTipoIcon(tarjeta.tarj_tipo)}</span>
                          {selectedTarjeta?.tarj_id === tarjeta.tarj_id && (
                            <span className="text-primary font-bold">✓</span>
                          )}
                        </div>
                        <p className="font-mono text-sm mb-1">
                          {formatNumeroTarjeta(tarjeta.tarj_numero)}
                        </p>
                        <p className="text-xs text-gray-600">{tarjeta.tarj_titular}</p>
                        <p className="text-xs text-gray-500 mt-1">{tarjeta.tarj_tipo}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tipo de Entrega */}
              <div>
                <h3 className="text-lg font-bold mb-3">Tipo de entrega de billetes</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setTipoEntrega('recoger_aeropuerto')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      tipoEntrega === 'recoger_aeropuerto'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✈️</span>
                        <div>
                          <p className="font-semibold">Recoger en aeropuerto</p>
                          <p className="text-sm text-gray-600">Recoge tus billetes en el mostrador</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">GRATIS</p>
                        {tipoEntrega === 'recoger_aeropuerto' && (
                          <span className="text-primary font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTipoEntrega('domicilio')}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      tipoEntrega === 'domicilio'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏠</span>
                        <div>
                          <p className="font-semibold">Envío a domicilio</p>
                          <p className="text-sm text-gray-600">Recibe tus billetes en tu hogar</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-600">+$5.00</p>
                        {tipoEntrega === 'domicilio' && (
                          <span className="text-primary font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Botón Pagar */}
              <div className="pt-4 border-t">
                <button
                  onClick={handleIniciarPago}
                  disabled={loading || !selectedTarjeta}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Procesando...' : `💳 Pagar $${Number(orden.orden_total).toFixed(2)}`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Verificación de Código */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-bold mb-2">Código de Verificación</h3>
                <p className="text-gray-600 mb-4">
                  Hemos enviado un código de 6 dígitos a:<br />
                  <strong>{correoUsuario}</strong>
                </p>

                {/* Mostrar código en desarrollo */}
                {codigoDesarrollo && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>🔨 Modo Desarrollo</strong>
                    </p>
                    <p className="text-2xl font-mono font-bold text-yellow-900">
                      {codigoDesarrollo}
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Este código solo se muestra en desarrollo
                    </p>
                  </div>
                )}
              </div>

              {/* Input de código */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Ingresa el código de 6 dígitos
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full text-center text-3xl font-mono font-bold px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  El código expira en 5 minutos
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleVerificarCodigo}
                  disabled={loading || codigo.length !== 6}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Verificando...' : '✓ Verificar y Pagar'}
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

