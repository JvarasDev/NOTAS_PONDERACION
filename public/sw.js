const CACHE_NAME = 'notas-ponderadas-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1.0.0';

// Recursos esenciales para cachear inmediatamente
const ESSENTIAL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Instalar Service Worker y cachear recursos esenciales
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-cacheando recursos esenciales');
        return cache.addAll(ESSENTIAL_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Error al cachear recursos:', error);
      })
  );
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Eliminando cache antiguo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estrategia de fetch: Network First con Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para recursos estáticos (CSS, JS, imágenes)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Estrategia para páginas HTML (Network First)
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estrategia por defecto para otros recursos
  event.respondWith(networkFirstStrategy(request));
});

// Estrategia: Cache First (para assets estáticos)
async function cacheFirstStrategy(request) {
  try {
    // Intentar obtener del cache primero
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Sirviendo desde cache:', request.url);
      return cachedResponse;
    }

    // Si no está en cache, obtener de la red
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cacheando recurso:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cacheFirstStrategy:', error);
    
    // Intentar servir desde cache como fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si nada funciona, retornar respuesta offline
    return new Response('Offline - Recurso no disponible', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    });
  }
}

// Estrategia: Network First (para páginas HTML)
async function networkFirstStrategy(request) {
  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Actualizando cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, sirviendo desde cache:', request.url);
    
    // Si falla la red, intentar servir desde cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, intentar servir la página principal offline
    const offlineResponse = await caches.match('/');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Última opción: mensaje de offline
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sin conexión</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #F2F2F7;
              color: #1D1D1F;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            p {
              color: #86868B;
              margin-bottom: 2rem;
            }
            button {
              background: #007AFF;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
            }
            @media (prefers-color-scheme: dark) {
              body {
                background: #000000;
                color: #FFFFFF;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 Sin conexión</h1>
            <p>No hay conexión a Internet. Tus datos están guardados localmente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/html' }),
      }
    );
  }
}

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(urlsToCache))
    );
  }
});

// Sincronización en segundo plano (opcional, para futuras mejoras)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-grades') {
    event.waitUntil(syncGrades());
  }
});

async function syncGrades() {
  // Aquí podrías implementar sincronización con un backend
  console.log('[SW] Sincronizando datos de notas...');
}

console.log('[SW] Service Worker cargado');
