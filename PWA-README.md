# 📱 PWA - Calculadora de Notas Ponderadas

## ✨ Características PWA Implementadas

Tu aplicación ahora es una **Progressive Web App (PWA)** completa con las siguientes características:

### 🚀 Funcionalidades

- ✅ **Modo Offline**: Funciona sin conexión a Internet
- ✅ **Instalable**: Se puede instalar como app nativa en dispositivos móviles y escritorio
- ✅ **Cache Inteligente**: Los recursos se guardan localmente para acceso rápido
- ✅ **Actualizaciones Automáticas**: Notifica cuando hay una nueva versión disponible
- ✅ **Responsive**: Se adapta a cualquier tamaño de pantalla
- ✅ **Datos Locales**: Todos los datos se guardan en localStorage (funciona offline)
- ✅ **Service Worker**: Gestión avanzada de caché y estrategias de red

### 📦 Archivos Creados

```
public/
├── manifest.json          # Configuración de la PWA
├── sw.js                  # Service Worker (caché y offline)
├── pwa-manager.js         # Gestor de instalación y actualizaciones
├── pwa-styles.css         # Estilos para notificaciones PWA
└── icons/                 # Iconos en múltiples tamaños
    ├── icon-72x72.svg
    ├── icon-96x96.svg
    ├── icon-128x128.svg
    ├── icon-144x144.svg
    ├── icon-152x152.svg
    ├── icon-192x192.svg
    ├── icon-384x384.svg
    └── icon-512x512.svg
```

## 🛠️ Cómo Usar

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# La PWA estará disponible en http://localhost:4321
```

### Construcción para Producción

```bash
# Generar build optimizado
npm run build

# Previsualizar build de producción
npm run preview
```

### 📱 Instalación en Dispositivos

#### **Chrome/Edge (Windows/Mac/Linux)**
1. Abre la app en el navegador
2. Busca el icono de instalación (➕) en la barra de direcciones
3. Haz clic en "Instalar" o en el botón flotante azul "Instalar App"
4. La app se agregará a tu escritorio/menú de aplicaciones

#### **Safari (iOS)**
1. Abre la app en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma el nombre y toca "Añadir"

#### **Chrome (Android)**
1. Abre la app en Chrome
2. Toca el menú (⋮) 
3. Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"
4. La app se instalará como aplicación nativa

## 🔧 Características Técnicas

### Service Worker

El Service Worker implementa una **estrategia híbrida**:

- **Network First** para páginas HTML (siempre intenta obtener la versión más reciente)
- **Cache First** para recursos estáticos (CSS, JS, imágenes, fuentes)
- **Fallback Offline** cuando no hay conexión

### Caché

Dos niveles de caché:
- `notas-ponderadas-v1.0.0`: Cache estático (recursos esenciales)
- `runtime-cache-v1.0.0`: Cache dinámico (recursos bajo demanda)

### Almacenamiento Local

Todos los datos de evaluaciones, configuración y cálculos se guardan en **localStorage**, lo que permite:
- ✅ Uso completamente offline
- ✅ Persistencia entre sesiones
- ✅ No requiere backend ni base de datos
- ✅ Privacidad total (datos solo en el dispositivo)

## 🎨 Personalización

### Cambiar Colores del Tema

Edita `public/manifest.json`:

```json
{
  "background_color": "#F2F2F7",  // Color de fondo al abrir
  "theme_color": "#007AFF"         // Color de la barra de estado
}
```

### Modificar Iconos

Los iconos se generan desde `generate-icons.js`. Para personalizar:

1. Edita el template SVG en el script
2. Ejecuta: `node generate-icons.js`
3. Los iconos se regenerarán automáticamente

### Estrategias de Caché

Edita `public/sw.js` para cambiar la estrategia de caché:

```javascript
// Para recursos que cambian frecuentemente, usa Network First
event.respondWith(networkFirstStrategy(request));

// Para recursos estáticos, usa Cache First
event.respondWith(cacheFirstStrategy(request));
```

## 🧪 Pruebas

### Probar Modo Offline

1. Abre la app en el navegador
2. Abre DevTools (F12)
3. Ve a la pestaña "Network"
4. Selecciona "Offline" en el dropdown
5. Recarga la página - ¡debería seguir funcionando!

### Verificar Service Worker

1. Abre DevTools (F12)
2. Ve a "Application" > "Service Workers"
3. Verifica que el SW esté activo
4. Revisa el cache en "Application" > "Cache Storage"

### Lighthouse Audit

```bash
# Ejecuta una auditoría de PWA
npm run build
npm run preview

# En Chrome DevTools:
# 1. Abre Lighthouse (pestaña en DevTools)
# 2. Selecciona "Progressive Web App"
# 3. Ejecuta el análisis
```

## 📊 Métricas PWA

La app cumple con los criterios de PWA:
- ✅ Funciona offline
- ✅ Instala service worker
- ✅ Tiene manifest.json
- ✅ Usa HTTPS (en producción)
- ✅ Responsive design
- ✅ Carga rápida
- ✅ Iconos de múltiples tamaños

## 🔐 Seguridad

- Los datos se almacenan **solo en el dispositivo del usuario**
- No hay comunicación con servidores externos (excepto para assets)
- El Service Worker solo funciona bajo **HTTPS** en producción
- `localhost` está permitido para desarrollo

## 🚀 Despliegue

### Netlify / Vercel / GitHub Pages

Estas plataformas sirven automáticamente con HTTPS, lo cual activa el Service Worker:

```bash
# Build
npm run build

# El directorio dist/ contiene todo lo necesario
# Súbelo a tu plataforma de hosting favorita
```

### Requisitos de Producción

- ✅ HTTPS obligatorio (el SW no funciona en HTTP)
- ✅ Todos los archivos en `/public` deben ser servidos
- ✅ El Service Worker (`sw.js`) debe estar en la raíz

## 📱 Soporte de Navegadores

| Navegador | Soporte PWA | Instalación |
|-----------|-------------|-------------|
| Chrome (Desktop) | ✅ Completo | ✅ |
| Chrome (Android) | ✅ Completo | ✅ |
| Safari (iOS 16.4+) | ✅ Completo | ✅ |
| Safari (macOS) | ⚠️ Limitado | ❌ |
| Edge | ✅ Completo | ✅ |
| Firefox | ⚠️ Parcial | ❌ |

## 🐛 Troubleshooting

### El Service Worker no se registra

1. Verifica que estés en HTTPS o localhost
2. Limpia el cache del navegador
3. Revisa la consola de errores en DevTools

### La app no funciona offline

1. Verifica que el SW esté activo en DevTools
2. Recarga la página al menos una vez online (para cachear)
3. Revisa que los recursos estén en Cache Storage

### El botón de instalación no aparece

1. Algunos navegadores no lo muestran automáticamente
2. En Chrome: Menú (⋮) > "Instalar [nombre de la app]"
3. En iOS Safari: Botón compartir > "Añadir a inicio"

### Los cambios no se reflejan

1. El SW cachea agresivamente - actualiza la versión en `sw.js`
2. Cambia `CACHE_NAME` a una nueva versión
3. O desregistra el SW en DevTools > Application > Service Workers

## 📚 Recursos Adicionales

- [PWA Builder](https://www.pwabuilder.com/) - Herramientas para PWA
- [Workbox](https://developers.google.com/web/tools/workbox) - Librería avanzada de SW
- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)

## 🎉 ¡Listo!

Tu calculadora de notas ahora es una PWA completa que funciona:
- 📱 En cualquier dispositivo
- 🌐 Online y offline
- 💾 Sin necesidad de backend
- ⚡ Con rendimiento nativo

---

**Hecho con ❤️ usando Astro + React + Tailwind CSS**
