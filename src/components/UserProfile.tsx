interface UserProfileProps {
  user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="card fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        👤 Mi Perfil
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Nombre Completo</p>
          <p className="text-lg font-semibold text-gray-800">{user?.nombre}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Correo Electrónico</p>
          <p className="text-lg font-semibold text-gray-800">{user?.correo}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Acciones Disponibles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="card hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="font-semibold text-primary mb-2">📝 Editar Perfil</p>
            <p className="text-sm text-gray-600">Actualiza tu información personal</p>
          </button>

          <button className="card hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="font-semibold text-secondary mb-2">🔑 Cambiar Contraseña</p>
            <p className="text-sm text-gray-600">Cambia tu contraseña actual</p>
          </button>

          <button className="card hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="font-semibold text-accent mb-2">💳 Gestionar Tarjetas</p>
            <p className="text-sm text-gray-600">Agrega o elimina tarjetas</p>
          </button>

          <button className="card hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="font-semibold text-red-600 mb-2">❌ Cancelar Registro</p>
            <p className="text-sm text-gray-600">Elimina tu cuenta permanentemente</p>
          </button>
        </div>
      </div>
    </div>
  );
}
