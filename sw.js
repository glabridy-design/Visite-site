const CACHE_NAME = 'Rapport-visite-chantier-v5'; // On change le nom pour forcer la mise à jour
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icon.png'
];

// Installation : Mise en cache des fichiers de base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Force l'activation immédiate
  );
});

// Activation : Nettoyage automatique des anciens caches obsolètes
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie réseau d'abord pour GitHub, sinon secours sur le cache hors-ligne
self.addEventListener('fetch', (e) => {
  // On laisse filer les requêtes vers l'API GitHub sans les bloquer dans le cache
  if (e.request.url.includes('api.github.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
