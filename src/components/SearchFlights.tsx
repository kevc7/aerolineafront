import { useState, useEffect } from 'react';
import { vuelosService, ciudadesService } from '../services/api';

interface SearchFlightsProps {
  onSearch: (flights: any[]) => void;
}

interface Ciudad {
  ciu_id: number;
  ciu_nom: string;
  ciu_codigo_aeropuerto: string;
}

export default function SearchFlights({ onSearch }: SearchFlightsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [searchData, setSearchData] = useState({
    origen: '',
    destino: '',
    fecha: '',
    sortBy: 'tarifas', // 'tarifas' o 'horarios'
  });

  // Cargar ciudades al montar el componente
  useEffect(() => {
    const loadCiudades = async () => {
      try {
        const response = await ciudadesService.obtenerTodas();
        setCiudades(response.data);
      } catch (err) {
        console.error('Error al cargar ciudades:', err);
      }
    };
    loadCiudades();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!searchData.origen || !searchData.destino || !searchData.fecha) {
        setError('Completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      let response;
      if (searchData.sortBy === 'tarifas') {
        response = await vuelosService.buscarPorTarifas(
          Number(searchData.origen),
          Number(searchData.destino),
          searchData.fecha,
          'asc'
        );
      } else {
        response = await vuelosService.buscarPorHorarios(
          Number(searchData.origen),
          Number(searchData.destino),
          searchData.fecha
        );
      }

      // Si hay resultados, limpiar error y pasar resultados
      if (response.data && response.data.length > 0) {
        setError('');
        onSearch(response.data);
      } else {
        setError('No se encontraron vuelos para esta búsqueda');
        onSearch([]);
      }
    } catch (err: any) {
      // Solo mostrar error si no hay respuesta con datos
      const errorMessage = err.response?.data?.message || 'Error al buscar vuelos';
      setError(errorMessage);
      onSearch([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Ciudad Origen *
          </label>
          <select
            name="origen"
            value={searchData.origen}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Selecciona una ciudad</option>
            {ciudades.map((c) => (
              <option key={c.ciu_id} value={c.ciu_id}>
                {c.ciu_nom} ({c.ciu_codigo_aeropuerto})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Ciudad Destino *
          </label>
          <select
            name="destino"
            value={searchData.destino}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Selecciona una ciudad</option>
            {ciudades.map((c) => (
              <option key={c.ciu_id} value={c.ciu_id}>
                {c.ciu_nom} ({c.ciu_codigo_aeropuerto})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Fecha de Salida *
          </label>
          <input
            type="date"
            name="fecha"
            value={searchData.fecha}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Ordenar por
          </label>
          <select
            name="sortBy"
            value={searchData.sortBy}
            onChange={handleChange}
            className="input-field"
          >
            <option value="tarifas">Tarifas (menor a mayor)</option>
            <option value="horarios">Horarios de Salida</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full md:w-auto"
      >
        {loading ? 'Buscando...' : 'Buscar Vuelos'}
      </button>
    </form>
  );
}
