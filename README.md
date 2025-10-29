# ✈️ SkyReserva - Frontend

Sistema de Reserva de Vuelos - Aplicación web moderna construida con React, TypeScript y Tailwind CSS.

## 🚀 Tecnologías

- **React 18** + **TypeScript**
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos modernos
- **Axios** - Cliente HTTP
- **React Router** - Navegación (si se implementa)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Backend corriendo (ver repositorio `aerolineaback`)

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/aerolineafront.git
cd aerolineafront
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con la URL de tu backend
# VITE_API_URL=http://localhost:3000
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   ├── logo.png           # Logo de la aplicación
│   └── fondo.jpg          # Imagen de fondo para login
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── AlertModal.tsx
│   │   ├── BookingModal.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── FlightResults.tsx
│   │   ├── MyCards.tsx
│   │   ├── MyOrders.tsx
│   │   ├── MyTickets.tsx
│   │   ├── PaymentModal.tsx
│   │   ├── PaymentMultipleModal.tsx
│   │   ├── SearchFlights.tsx
│   │   └── UserProfile.tsx
│   ├── pages/             # Páginas principales
│   │   ├── Home.tsx
│   │   └── Login.tsx
│   ├── services/          # Servicios de API
│   │   └── api.ts
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── .env.example           # Ejemplo de variables de entorno
├── tailwind.config.js     # Configuración de Tailwind
├── vite.config.ts         # Configuración de Vite
└── package.json
```

## 🎨 Características

### ✅ Autenticación
- Registro de usuarios
- Inicio de sesión
- Persistencia de sesión

### ✅ Búsqueda de Vuelos
- Filtros avanzados (origen, destino, fechas, tarifas)
- Listado de vuelos disponibles
- Vista detallada de cada vuelo

### ✅ Sistema de Reservas
- Selección de categoría de asiento
- Registro de pasajeros con validación automática de tipo (infante/niño/adulto)
- Confirmación de reserva

### ✅ Gestión de Órdenes
- Visualización de todas las órdenes
- Detalle de reservas y pasajeros
- Cancelación de órdenes
- Pago individual o múltiple (carrito completo)

### ✅ Gestión de Tarjetas
- Agregar tarjetas de crédito
- Activar/desactivar tarjetas
- Eliminar tarjetas
- Validaciones de número y fecha de vencimiento

### ✅ Proceso de Pago
- Selección de tarjeta y tipo de entrega
- Sistema 2FA con código por email
- Confirmación de pago
- Generación automática de facturas y billetes

### ✅ Mis Billetes
- Visualización de todos los billetes emitidos
- Información detallada de vuelo y pasajero
- Estado del billete

### ✅ UI/UX Moderna
- Diseño glassmorphism
- Gradientes y sombras elegantes
- Animaciones suaves
- Modales personalizados
- Iconos SVG (Heroicons)
- Responsive design

## 🚀 Despliegue en Vercel

### 1. Crear cuenta en Vercel
Visita [vercel.com](https://vercel.com) y crea una cuenta con GitHub.

### 2. Importar proyecto
- Click en "New Project"
- Selecciona el repositorio `aerolineafront`
- Vercel detectará automáticamente que es un proyecto Vite

### 3. Configurar proyecto
- **Framework Preset**: Vite
- **Root Directory**: `./` (o déjalo vacío si es la raíz)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Agregar variables de entorno
En la configuración del proyecto en Vercel, agrega:
- `VITE_API_URL` - URL de tu backend en Railway (ej: `https://tu-proyecto.railway.app`)

### 5. Deploy
Click en "Deploy" y Vercel construirá y desplegará tu aplicación.

Tu app estará disponible en: `https://tu-proyecto.vercel.app`

### 6. Configurar dominio personalizado (Opcional)
En el dashboard de Vercel puedes agregar tu propio dominio.

## 🔗 Conectar con el Backend

Asegúrate de que el backend esté configurado para aceptar requests desde tu dominio de Vercel:

```typescript
// En el backend: src/server.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tu-proyecto.vercel.app'
  ]
}));
```

## 🎨 Personalización

### Colores Principales
Edita `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',    // Azul principal
        secondary: '#1e40af',  // Azul secundario
      }
    }
  }
}
```

### Logo y Fondo
Reemplaza los archivos en `public/`:
- `logo.png` - Logo de la aplicación
- `fondo.jpg` - Imagen de fondo del login

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Móviles (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktop (1024px+)

## 🧪 Testing

```bash
# Ejecutar tests (si están configurados)
npm run test

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Preview del build de producción
npm run lint         # Ejecuta el linter
```

## 🎯 Flujo de Usuario

1. **Login/Registro** → Usuario crea cuenta o inicia sesión
2. **Buscar Vuelos** → Filtra por origen, destino, fechas
3. **Reservar** → Selecciona categoría y registra pasajeros
4. **Mis Órdenes** → Visualiza todas sus reservas
5. **Agregar Tarjeta** → Registra método de pago
6. **Pagar** → Selecciona tarjeta, tipo de entrega, verifica código
7. **Mis Billetes** → Descarga o visualiza billetes emitidos

## 🐛 Solución de Problemas

### Error de conexión con el backend
Verifica que `VITE_API_URL` en `.env` apunte al backend correcto.

### Imágenes no se muestran
Asegúrate de que los archivos estén en `public/` y no en `src/assets/`.

### Estilos de Tailwind no aparecen
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 👥 Autor

Desarrollado como proyecto académico de Sistema de Reserva de Vuelos.

---

**¡Disfruta explorando SkyReserva!** ✈️
