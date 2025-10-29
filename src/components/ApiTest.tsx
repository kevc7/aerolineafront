import { useState } from 'react';
import api from '../services/api';

/**
 * Componente de Prueba para Verificar Conexión con Backend
 * Úsalo durante desarrollo para debuggear problemas de conectividad
 * 
 * Importar en App.tsx:
 * import ApiTest from './components/ApiTest';
 * <ApiTest />
 */

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.get('/auth/');
      setResult({
        status: 'success',
        message: 'Conexión exitosa al backend ✅',
        data: response.data,
        url: `${import.meta.env.VITE_API_URL}/auth/`,
      });
    } catch (err: any) {
      setError(err.message);
      setResult({
        status: 'error',
        message: 'Error de conexión ❌',
        error: err.response?.data || err.message,
        url: `${import.meta.env.VITE_API_URL}/auth/`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 p-4 bg-white rounded-lg shadow-lg border-2 border-gray-300 z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">🧪 Test de Conexión API</h3>

      <div className="mb-3 p-3 bg-gray-100 rounded text-sm">
        <p className="font-semibold">URL del Backend:</p>
        <p className="text-blue-600 break-all">{import.meta.env.VITE_API_URL}</p>
      </div>

      <button
        onClick={testConnection}
        disabled={loading}
        className="btn-primary w-full mb-3"
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>

      {result && (
        <div
          className={`p-3 rounded mb-3 ${
            result.status === 'success'
              ? 'bg-green-100 border border-green-400 text-green-800'
              : 'bg-red-100 border border-red-400 text-red-800'
          }`}
        >
          <p className="font-semibold mb-2">{result.message}</p>
          {result.data && (
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto mb-2">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          {result.error && (
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(result.error, null, 2)}
            </pre>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
          <p className="font-semibold mb-1">⚠️ Error Técnico:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-600 border-t pt-3">
        <p className="font-semibold mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Backend corriendo: npm run dev</li>
          <li>.env configurado correctamente</li>
          <li>CORS habilitado en backend</li>
          <li>Base de datos conectada</li>
        </ul>
      </div>
    </div>
  );
}
