# 🔧 Guía de Configuración - Frontend

## Configuración del Entorno

### 1. Variables de Entorno (`.env`)

El frontend usa variables de entorno para conectarse al backend. Crea un archivo `.env` en la raíz del proyecto `frontend/`:

```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

### 2. Ubicación Correcta

```
EXAM/
├── backend/          # Backend Express
├── frontend/
│   ├── .env          # ← Aquí va el archivo
│   ├── src/
│   ├── package.json
│   └── ...
└── ...
```

### 3. Configurar Según el Entorno

#### **Desarrollo Local**
```env
VITE_API_URL=http://localhost:3000/api
```

#### **Producción**
```env
VITE_API_URL=https://api.midominio.com/api
```

#### **Red Local (otra máquina)**
```env
VITE_API_URL=http://192.168.1.100:3000/api
```

### 4. Cómo Funciona

El archivo `.env` se carga automáticamente cuando:

```bash
npm run dev
```

La variable se accede en código via:

```typescript
import.meta.env.VITE_API_URL
```

### 5. Verificar que Funciona

Después de actualizar `.env`, **reinicia el servidor**:

```bash
# Presiona Ctrl+C en la terminal donde corre npm run dev

# Reinicia
npm run dev
```

Abre la consola del navegador (F12) y ejecuta:

```javascript
import.meta.env.VITE_API_URL
```

Debe mostrar la URL que configuraste.

### 6. Build para Producción

Las variables de entorno se incluyen en el build:

```bash
npm run build
```

El archivo `.env` se lee y se incrusta en el bundle final.

### ⚠️ Notas Importantes

1. **No subas `.env` a Git** - Usa `.gitignore`
2. **Prefijo `VITE_`** - Obligatorio en Vite para acceso desde cliente
3. **Cambios en `.env`** - Requieren reiniciar `npm run dev`
4. **Backend debe tener CORS** - Para que funcione la comunicación

---

**¡Listo para usar!** 🚀
