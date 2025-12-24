// Registro e inicialización del Service Worker para PWA
(function() {
  'use strict';

  // Verificar si el navegador soporta Service Workers
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados en este navegador');
    return;
  }

  // Estado de la instalación
  let deferredPrompt;
  let isInstalled = false;

  // Registrar Service Worker cuando la página carga
  window.addEventListener('load', () => {
    registerServiceWorker();
    checkInstallation();
    setupInstallPrompt();
    setupOnlineOfflineListeners();
  });

  // Registrar el Service Worker
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Verificar actualizaciones cada 60 segundos
      setInterval(() => {
        registration.update();
      }, 60000);

      // Manejar actualizaciones del SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });

    } catch (error) {
      console.error('❌ Error al registrar Service Worker:', error);
    }
  }

  // Mostrar notificación de actualización disponible
  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update-content">
        <p>🎉 Nueva versión disponible</p>
        <button id="pwa-reload-btn">Actualizar</button>
      </div>
    `;
    
    document.body.appendChild(notification);

    document.getElementById('pwa-reload-btn').addEventListener('click', () => {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });

    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
      notification.remove();
    }, 10000);
  }

  // Verificar si la app ya está instalada
  function checkInstallation() {
    // Verificar si está en modo standalone (instalada)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled = true;
      console.log('📱 App ejecutándose como PWA instalada');
      document.body.classList.add('pwa-installed');
    }

    // Para iOS
    if (window.navigator.standalone) {
      isInstalled = true;
      console.log('📱 App ejecutándose en iOS standalone');
      document.body.classList.add('pwa-installed');
    }
  }

  // Configurar el prompt de instalación
  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('💾 Prompt de instalación disponible');
      e.preventDefault();
      deferredPrompt = e;
      showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada exitosamente');
      isInstalled = true;
      deferredPrompt = null;
      hideInstallButton();
      showInstalledMessage();
    });
  }

  // Mostrar botón de instalación
  function showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'pwa-install-button';
    installBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Instalar App</span>
    `;
    
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      deferredPrompt = null;
      
      if (outcome === 'accepted') {
        hideInstallButton();
      }
    });

    document.body.appendChild(installBtn);
  }

  // Ocultar botón de instalación
  function hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.remove();
    }
  }

  // Mostrar mensaje de instalación exitosa
  function showInstalledMessage() {
    const message = document.createElement('div');
    message.className = 'pwa-success-message';
    message.innerHTML = `
      <div class="pwa-success-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>¡App instalada correctamente!</span>
      </div>
    `;
    
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // Configurar listeners para estado online/offline
  function setupOnlineOfflineListeners() {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar estado inicial
    if (!navigator.onLine) {
      handleOffline();
    }
  }

  function handleOnline() {
    console.log('🌐 Conexión restaurada');
    document.body.classList.remove('offline-mode');
    showConnectionStatus('online');
  }

  function handleOffline() {
    console.log('📵 Sin conexión - Modo offline');
    document.body.classList.add('offline-mode');
    showConnectionStatus('offline');
  }

  function showConnectionStatus(status) {
    const existing = document.querySelector('.connection-status');
    if (existing) existing.remove();

    const statusBar = document.createElement('div');
    statusBar.className = `connection-status ${status}`;
    statusBar.innerHTML = status === 'online' 
      ? '<span>🌐 Conexión restaurada</span>'
      : '<span>📵 Modo offline - Los datos se guardan localmente</span>';
    
    document.body.appendChild(statusBar);

    setTimeout(() => {
      statusBar.remove();
    }, 3000);
  }

  // Exponer API pública
  window.PWA = {
    isInstalled: () => isInstalled,
    isOnline: () => navigator.onLine,
    canInstall: () => !!deferredPrompt,
    promptInstall: () => {
      if (deferredPrompt) {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.click();
      }
    }
  };

  console.log('🚀 PWA Manager inicializado');
})();
