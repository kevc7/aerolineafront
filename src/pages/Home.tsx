import { useState, useEffect } from 'react';
import SearchFlights from '../components/SearchFlights';
import FlightResults from '../components/FlightResults';
import UserProfile from '../components/UserProfile';
import MyOrders from '../components/MyOrders';
import MyCards from '../components/MyCards';
import MyTickets from '../components/MyTickets';
import { vuelosService } from '../services/api';

interface HomeProps {
  user: any;
  onLogout: () => void;
}

type Page = 'search' | 'my-orders' | 'my-cards' | 'my-tickets' | 'profile';

export default function Home({ user, onLogout }: HomeProps) {
  const [currentPage, setCurrentPage] = useState<Page>('search');
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchForm, setShowSearchForm] = useState(false);

  // Cargar todos los vuelos al inicio
  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        const response = await vuelosService.obtenerTodos();
        setFlights(response.data);
      } catch (error) {
        console.error('Error al cargar vuelos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentPage === 'search') {
      loadFlights();
    }
  }, [currentPage]);

  const handleSearchResults = (results: any[]) => {
    setFlights(results);
    setShowSearchForm(false);
  };

  const handleReservaCreada = () => {
    // Recargar vuelos después de crear reserva
    const loadFlights = async () => {
      try {
        const response = await vuelosService.obtenerTodos();
        setFlights(response.data);
      } catch (error) {
        console.error('Error al recargar vuelos:', error);
      }
    };
    loadFlights();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Navbar con glassmorphism */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SkyReserva" className="h-12 w-auto drop-shadow-md" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SkyReserva
              </h1>
              <p className="text-xs text-gray-500">Sistema de Reserva de Vuelos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user?.nombre}</p>
              <p className="text-xs text-gray-500">{user?.correo}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-full mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Sidebar con glassmorphism */}
          <div className="md:col-span-1">
            <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl border border-white/50 p-4 sticky top-20">
              <h2 className="text-base font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                Navegación
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentPage('search');
                    setShowSearchForm(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'search'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar Vuelos
                  </span>
                </button>

                <button
                  onClick={() => setCurrentPage('my-orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'my-orders'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Mis Órdenes
                  </span>
                </button>

                <button
                  onClick={() => setCurrentPage('my-cards')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'my-cards'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Mis Tarjetas
                  </span>
                </button>

                <button
                  onClick={() => setCurrentPage('my-tickets')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'my-tickets'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Mis Billetes
                  </span>
                </button>

                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === 'profile'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-5">
            {currentPage === 'search' && showSearchForm && (
              <div className="bg-white rounded-lg shadow p-4 mb-3 fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    🔍 Buscar Vuelos
                  </h2>
                  <button
                    onClick={() => setShowSearchForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Cerrar
                  </button>
                </div>
                <SearchFlights onSearch={handleSearchResults} />
              </div>
            )}

            {currentPage === 'search' && !showSearchForm && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <img src="/logo.png" alt="" className="h-6 w-auto inline drop-shadow-sm" />
                    <span>Vuelos Disponibles</span>
                    <span className="text-sm font-normal text-gray-500">({flights.length})</span>
                  </h2>
                  <button
                    onClick={() => setShowSearchForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar con Filtros
                  </button>
                </div>
              </div>
            )}

            {currentPage === 'search' && (
              <div>
                {loading ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">Cargando vuelos...</p>
                  </div>
                ) : (
                  <FlightResults 
                    flights={flights} 
                    user={user} 
                    onReservaCreada={handleReservaCreada}
                  />
                )}
              </div>
            )}

            {currentPage === 'my-orders' && (
              <div className="fade-in">
                <MyOrders user={user} />
              </div>
            )}

            {currentPage === 'my-cards' && (
              <div className="fade-in">
                <MyCards user={user} />
              </div>
            )}

            {currentPage === 'my-tickets' && (
              <div className="fade-in">
                <MyTickets user={user} />
              </div>
            )}

            {currentPage === 'profile' && (
              <UserProfile user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
