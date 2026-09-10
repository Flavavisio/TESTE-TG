// Service Worker — Total Gest PWA
const CACHE = 'totalgest-v3';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clientsList => {
        // avisa as páginas já abertas que há uma nova versão ativa
        clientsList.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      })
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    fetch(req).then(res => {
      try {
        if (new URL(req.url).origin === location.origin && res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
      } catch (err) {}
      return res;
    }).catch(() => {
      // só usa o fallback de navegação (index.html) para pedidos de navegação (o utilizador a abrir/mudar de página).
      // Para tudo o resto (imagens, scripts, chamadas à API) tenta a cache desse recurso específico; se não houver, falha normalmente.
      if (req.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return caches.match(req);
    })
  );
});

// ===== Notificações push =====
self.addEventListener('push', e => {
  let dados = {};
  try { dados = e.data ? e.data.json() : {}; } catch (err) { dados = { titulo: 'Total Gest', corpo: e.data ? e.data.text() : '' }; }

  const titulo = dados.titulo || dados.title || 'Total Gest';
  const iconePersonalizado = dados.icone || dados.icon || dados.logo_url || '';
  const opcoes = {
    body: dados.corpo || dados.body || '',
    icon: iconePersonalizado || './icon-192.png',
    badge: './icon-192.png', // o badge (Android, monocromático) mantém-se sempre o do TotalGest
    tag: dados.tag || 'totalgest-notificacao',
    renotify: true,
    data: { url: dados.url || './index.html' },
    vibrate: [120, 60, 120]
  };

  e.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsList => {
      for (const client of clientsList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
