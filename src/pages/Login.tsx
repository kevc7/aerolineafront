import { useState } from 'react';
import { authService } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    correo: '',
    contrasenia: '',
    cedula: '',
    nombre: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.correo, formData.contrasenia);
      const { usuario } = response.data;
      onLoginSuccess({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(
        formData.correo,
        formData.contrasenia,
        formData.cedula,
        formData.nombre,
        formData.telefono
      );
      const { usuario } = response.data;
      onLoginSuccess({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/fondo.jpg)',
      }}
    >
      {/* Overlay oscuro para mejor contraste */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Tarjeta de login */}
      <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 backdrop-blur-sm border border-gray-100 animate-fade-in">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="SkyReserva" className="h-24 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          SkyReserva
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sistema de Reserva de Vuelos
        </p>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Juan Pérez"
                  required={!isLogin}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Cédula
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1234567890"
                  required={!isLogin}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0912345678"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="contrasenia"
              value={formData.contrasenia}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mb-4"
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600 mb-2">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                correo: '',
                contrasenia: '',
                cedula: '',
                nombre: '',
                telefono: '',
              });
            }}
            className="text-primary hover:text-blue-700 font-semibold underline"
          >
            {isLogin ? 'Registrarse aquí' : 'Iniciar sesión aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
