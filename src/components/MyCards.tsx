import { useState, useEffect } from 'react';
import { tarjetasService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

interface MyCardsProps {
  user: any;
}

interface Tarjeta {
  tarj_id: number;
  tarj_numero: string;
  tarj_titular: string;
  tarj_vencimiento: string;
  tarj_tipo: string;
  tarj_activa: boolean;
  tarj_fecha_registro: string;
}

export default function MyCards({ user }: MyCardsProps) {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmColor: 'primary' as 'primary' | 'danger' | 'success',
    onConfirm: () => {}
  });
  
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Form states
  const [formData, setFormData] = useState({
    numero: '',
    titular: '',
    vencimiento: '',
    tipo: 'Visa'
  });

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tarjetasService.obtenerPorUsuario(user.id);
      setTarjetas(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTarjetas([]);
      } else {
        setError(err.response?.data?.message || 'Error al cargar tarjetas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTarjetas();
  }, [user.id]);

  const resetForm = () => {
    setFormData({
      numero: '',
      titular: '',
      vencimiento: '',
      tipo: 'Visa'
    });
    setEditingCard(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.numero || !formData.titular || !formData.vencimiento || !formData.tipo) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    // Validar formato de número de tarjeta (16 dígitos)
    if (!/^\d{16}$/.test(formData.numero.replace(/\s/g, ''))) {
      setError('El número de tarjeta debe tener 16 dígitos');
      return false;
    }

    // Validar fecha de vencimiento
    const vencimiento = new Date(formData.vencimiento);
    const hoy = new Date();
    if (vencimiento <= hoy) {
      setError('La fecha de vencimiento debe ser futura');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await tarjetasService.agregar(
        user.id,
        formData.numero.replace(/\s/g, ''),
        formData.titular,
        formData.vencimiento,
        formData.tipo
      );

      setAlertModal({
        isOpen: true,
        title: '¡Éxito!',
        message: 'Tarjeta agregada exitosamente',
        type: 'success'
      });
      handleCloseModal();
      loadTarjetas();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiva = async (tarjetaId: number, estadoActual: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: estadoActual ? '¿Desactivar tarjeta?' : '¿Activar tarjeta?',
      message: estadoActual 
        ? 'No podrás usar esta tarjeta para pagos mientras esté desactivada.'
        : 'Esta tarjeta estará disponible para realizar pagos.',
      confirmColor: estadoActual ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          await tarjetasService.actualizar(tarjetaId, { activa: !estadoActual });
          setConfirmModal({ ...confirmModal, isOpen: false });
          setAlertModal({
            isOpen: true,
            title: '¡Éxito!',
            message: `Tarjeta ${estadoActual ? 'desactivada' : 'activada'} exitosamente`,
            type: 'success'
          });
          loadTarjetas();
        } catch (err: any) {
          setConfirmModal({ ...confirmModal, isOpen: false });
          setAlertModal({
            isOpen: true,
            title: 'Error',
            message: err.response?.data?.message || 'Error al actualizar tarjeta',
            type: 'error'
          });
        }
      }
    });
  };

  const handleDelete = async (tarjetaId: number) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar tarjeta?',
      message: '¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.',
      confirmColor: 'danger',
      onConfirm: async () => {
        try {
          await tarjetasService.eliminar(tarjetaId);
          setConfirmModal({ ...confirmModal, isOpen: false });
          setAlertModal({
            isOpen: true,
            title: '¡Éxito!',
            message: 'Tarjeta eliminada exitosamente',
            type: 'success'
          });
          loadTarjetas();
        } catch (err: any) {
          setConfirmModal({ ...confirmModal, isOpen: false });
          setAlertModal({
            isOpen: true,
            title: 'Error',
            message: err.response?.data?.message || 'Error al eliminar tarjeta',
            type: 'error'
          });
        }
      }
    });
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

  const formatVencimiento = (fecha: string) => {
    const date = new Date(fecha);
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear().toString().slice(-2);
    return `${mes}/${anio}`;
  };

  const formatNumeroTarjeta = (numero: string) => {
    return numero.replace(/(\d{4})/g, '$1 ').trim();
  };

  if (loading && tarjetas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Cargando tarjetas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Tarjetas</h2>
          <p className="text-sm text-gray-500 mt-1">Administra tus métodos de pago</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-xl">+</span>
          <span>Agregar Tarjeta</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de Tarjetas */}
      {tarjetas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-500 text-lg mb-2">No tienes tarjetas registradas</p>
          <p className="text-gray-400 text-sm mb-4">Agrega una tarjeta para poder realizar pagos</p>
          <button
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Agregar Primera Tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.tarj_id}
              className={`bg-gradient-to-br ${
                tarjeta.tarj_activa
                  ? 'from-blue-500 to-blue-700'
                  : 'from-gray-400 to-gray-600'
              } text-white rounded-lg shadow-lg p-6 relative`}
            >
              {/* Badge de estado */}
              <div className="absolute top-3 right-3">
                {tarjeta.tarj_activa ? (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Activa
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    ✗ Inactiva
                  </span>
                )}
              </div>

              {/* Tipo de tarjeta */}
              <div className="text-2xl mb-6">{getTipoIcon(tarjeta.tarj_tipo)}</div>

              {/* Número de tarjeta */}
              <div className="mb-4">
                <p className="text-xl font-mono tracking-wider">
                  {formatNumeroTarjeta(tarjeta.tarj_numero)}
                </p>
              </div>

              {/* Info de la tarjeta */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-75">TITULAR</p>
                  <p className="font-semibold uppercase">{tarjeta.tarj_titular}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">VENCE</p>
                  <p className="font-semibold">{formatVencimiento(tarjeta.tarj_vencimiento)}</p>
                </div>
              </div>

              {/* Tipo */}
              <div className="mt-3 text-xs opacity-75">
                {tarjeta.tarj_tipo}
              </div>

              {/* Acciones */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleToggleActiva(tarjeta.tarj_id, tarjeta.tarj_activa)}
                  className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs py-2 rounded transition-colors"
                >
                  {tarjeta.tarj_activa ? '🔒 Desactivar' : '✓ Activar'}
                </button>
                <button
                  onClick={() => handleDelete(tarjeta.tarj_id)}
                  className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white text-xs px-3 py-2 rounded transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Agregar Tarjeta */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h3 className="text-xl font-bold">💳 Agregar Nueva Tarjeta</h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Número de Tarjeta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Tarjeta *
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">16 dígitos</p>
              </div>

              {/* Titular */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Titular *
                </label>
                <input
                  type="text"
                  name="titular"
                  value={formData.titular}
                  onChange={handleInputChange}
                  placeholder="JUAN PÉREZ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                  required
                />
              </div>

              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  name="vencimiento"
                  value={formData.vencimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Tipo de Tarjeta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Tarjeta *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Diners Club">Diners Club</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Agregar Tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modales de Confirmación y Alerta */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmColor={confirmModal.confirmColor}
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
    </div>
  );
}

