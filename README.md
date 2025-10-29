# 🛫 SkyReserva - Frontend

Sistema de Reserva de Vuelos - Interfaz de Usuario

## 🚀 Tecnologías

- **React 18** con TypeScript
- **Vite** para build ultrarrápido
- **Tailwind CSS** para estilos
- **Axios** para peticiones HTTP

## 📦 Instalación

```bash
npm install
```

## 🔧 Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

Para más detalles, consulta [ENV_SETUP.md](./ENV_SETUP.md)

## 🏃 Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## 🌐 Despliegue en Vercel

### Método 1: Desde GitHub (Recomendado)

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Click en **"Import Project"**
4. Selecciona tu repositorio de GitHub
5. Configura las variables de entorno (ver [ENV_SETUP.md](./ENV_SETUP.md))
6. Click en **"Deploy"**

### Método 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 📁 Estructura del Proyecto

```
frontend/
├── public/           # Archivos estáticos
│   ├── logo.png     # Logo de la aplicación
│   └── fondo.jpg    # Fondo del login
├── src/
│   ├── components/  # Componentes reutilizables
│   ├── pages/       # Páginas principales
│   ├── services/    # Servicios (API)
│   └── main.tsx     # Punto de entrada
└── package.json
```

## ✨ Características

- ✅ Búsqueda de vuelos con filtros
- ✅ Sistema de reservas completo
- ✅ Gestión de órdenes (carrito)
- ✅ Proceso de pago con 2FA
- ✅ Gestión de tarjetas de crédito
- ✅ Visualización de billetes
- ✅ Diseño responsivo con glassmorphism
- ✅ Modales personalizados

## 🔗 Backend

Este frontend se conecta al backend de SkyReserva:
- Repositorio: [aerolineaback](https://github.com/kevc7/aerolineaback)
- API URL: https://aerolineaback-production.up.railway.app/api

## 📄 Licencia

Proyecto académico - Universidad
