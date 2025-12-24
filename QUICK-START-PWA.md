# 🚀 Inicio Rápido - PWA

## ✅ Tu app ya es una PWA completa!

### Probar Localmente

```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. Abrir en el navegador
# http://localhost:4321

# 3. Verás un botón flotante "Instalar App" (en navegadores compatibles)
```

### ⚡ Características Activas

- ✅ **Offline**: Funciona sin Internet
- ✅ **Instalable**: Botón de instalación automático
- ✅ **LocalStorage**: Datos guardados en el dispositivo
- ✅ **Service Worker**: Cache inteligente activado
- ✅ **Responsive**: Diseño adaptable iOS/Android

### 📱 Probar Instalación

#### Chrome/Edge (Desktop)
1. Abre `http://localhost:4321`
2. Haz clic en el botón azul "Instalar App" (abajo a la derecha)
3. ¡Listo! La app se instalará como aplicación nativa

#### Chrome (Android)
1. Abre la app en Chrome móvil
2. Menú (⋮) > "Instalar aplicación"
3. Confirma la instalación

#### Safari (iOS)
1. Abre en Safari
2. Botón compartir > "Añadir a inicio"
3. Confirma el nombre

### 🧪 Probar Modo Offline

1. Abre la app online (visítala al menos una vez)
2. Presiona F12 > Network > Selecciona "Offline"
3. Recarga la página
4. ✅ **¡Debería seguir funcionando!**

### 🔍 Verificar Service Worker

1. F12 > Application > Service Workers
2. Deberías ver: `sw.js` - **Activated and is running**
3. En Cache Storage: `notas-ponderadas-v1.0.0`

### 📦 Build para Producción

```bash
# Generar build optimizado
npm run build

# Previsualizar (con Service Worker activo)
npm run preview

# El directorio dist/ está listo para deploy
```

### 🌐 Deploy (Netlify/Vercel/GitHub Pages)

```bash
# Solo necesitas subir la carpeta dist/
# El Service Worker se activará automáticamente con HTTPS
```

### 📊 Auditoría PWA (Lighthouse)

1. `npm run build && npm run preview`
2. Abre Chrome DevTools > Lighthouse
3. Selecciona "Progressive Web App"
4. Click en "Analyze"
5. ¡Debería obtener 100% en PWA!

### 🎨 Personalizar

- **Iconos**: Edita `generate-icons.js` y ejecuta `node generate-icons.js`
- **Colores**: Modifica `public/manifest.json` (theme_color, background_color)
- **Nombre**: Cambia `name` y `short_name` en manifest.json
- **Cache**: Ajusta estrategias en `public/sw.js`

### 🐛 Solución de Problemas

**El botón de instalación no aparece:**
- Verifica que estés en localhost o HTTPS
- Algunos navegadores requieren interacción del usuario primero
- Usa el menú del navegador: Menú > "Instalar [nombre]"

**Los cambios no se ven:**
- El SW cachea agresivamente
- Cambia la versión en `sw.js`: `CACHE_NAME = 'notas-ponderadas-v1.0.1'`
- O desregistra el SW en DevTools

**No funciona offline:**
- Visita la app online primero (para cachear)
- Verifica que el SW esté activo en DevTools
- Revisa Cache Storage

### 📚 Más Info

Lee `PWA-README.md` para documentación completa.

---

**¡Todo listo! 🎉**

Tu calculadora de notas es ahora una PWA instalable que funciona online y offline.
