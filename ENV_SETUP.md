# Configuración de Variables de Entorno

## Desarrollo Local

Crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

## Producción (Vercel)

En el dashboard de Vercel, configura la siguiente variable de entorno:

```
VITE_API_URL=https://aerolineaback-production.up.railway.app/api
```

### Pasos para configurar en Vercel:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"**
3. Click en **"Environment Variables"**
4. Agrega la variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://aerolineaback-production.up.railway.app/api`
5. Click en **"Save"**
6. Redesplega el proyecto para aplicar los cambios

## Notas

- ⚠️ **Importante:** Las variables de Vite **DEBEN** empezar con `VITE_`
- 🔄 Después de cambiar variables de entorno en desarrollo, **reinicia** el servidor (`npm run dev`)
- 🚀 Después de cambiar variables en Vercel, **redesplega** el proyecto

