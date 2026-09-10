// Service Worker — Total Gest PWA
const CACHE = 'totalgest-v4-v61';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

// Hotfix v6.1: é acrescentado à resposta de app-principal.js sem substituir o ficheiro de ~3 MB.
// Assim evitamos o limite do conector e mantemos todo o código atual da aplicação intacto.
const TG_V61_HOTFIX = String.raw`

/* TG V6.1 DASHBOARD CENTRAL HOTFIX */
(function tgV61Hotfix(){
    if (window.__TG_V61_HOTFIX__) return;
    window.__TG_V61_HOTFIX__ = true;

    function rolePermitida(){
        try { return usuarioLogado && (usuarioLogado.role === 'admin' || usuarioLogado.role === 'subadmin'); }
        catch(e) { return false; }
    }

    function garantirDashboardCentral(){
        if (!rolePermitida()) return;
        if (document.querySelector('[data-secao="dashboard-central"]')) return;

        const inicio = document.querySelector('.tg-nav-item[data-secao="__inicio"], [data-secao="__inicio"]');
        if (!inicio || !inicio.parentNode) return;

        const item = document.createElement('a');
        item.className = inicio.className || 'tg-nav-item';
        item.dataset.secao = 'dashboard-central';
        item.href = 'javascript:void(0)';
        item.innerHTML = '<i class="fas fa-chart-line"></i><span>Dashboard Central</span>';
        item.addEventListener('click', function(ev){
            ev.preventDefault();
            try {
                if (typeof abrirSecao === 'function') {
                    abrirSecao('dashboard-central');
                    setTimeout(function(){
                        try {
                            if (typeof renderizarDashboardCentralSecao === 'function') {
                                renderizarDashboardCentralSecao();
                            }
                        } catch(e) {}
                    }, 60);
                }
            } catch(e) {
                console.error('Dashboard Central:', e);
            }
        });
        inicio.insertAdjacentElement('afterend', item);
    }

    function garantirVersaoMascote(){
        const launcher = document.getElementById('tgAssistenteLauncher');
        if (!launcher || launcher.querySelector('.tg-ass-versao')) return;

        if (!document.getElementById('tgV61VersionStyle')) {
            const st = document.createElement('style');
            st.id = 'tgV61VersionStyle';
            st.textContent = '.tg-ass-launcher{position:relative}.tg-ass-versao{position:absolute;top:-12px;left:50%;transform:translateX(-50%);z-index:5;background:#0c4f8e;color:#fff;border:1px solid rgba(255,255,255,.9);border-radius:999px;padding:3px 8px;font-size:11px;line-height:1;font-weight:800;letter-spacing:.2px;box-shadow:0 4px 10px rgba(2,32,72,.18);white-space:nowrap;pointer-events:none}';
            document.head.appendChild(st);
        }

        const v = document.createElement('span');
        v.className = 'tg-ass-versao';
        v.textContent = 'v6.1';
        launcher.prepend(v);
    }

    function aplicar(){
        garantirDashboardCentral();
        garantirVersaoMascote();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicar);
    } else {
        aplicar();
    }

    const obs = new MutationObserver(aplicar);
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(aplicar, 1500);
})();
`;

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
        clientsList.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      })
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    fetch(req).then(async res => {
      try {
        const url = new URL(req.url);
        const mesmaOrigem = url.origin === location.origin;

        if (mesmaOrigem && res && res.ok && /\/app-principal\.js$/.test(url.pathname)) {
          const original = await res.text();
          const marcado = original.includes('TG V6.1 DASHBOARD CENTRAL HOTFIX');
          const codigo = marcado ? original : original + TG_V61_HOTFIX;
          const headers = new Headers(res.headers);
          headers.set('content-type', 'application/javascript; charset=utf-8');
          headers.delete('content-length');
          const resposta = new Response(codigo, {
            status: res.status,
            statusText: res.statusText,
            headers
          });
          caches.open(CACHE).then(c => c.put(req, resposta.clone())).catch(() => {});
          return resposta;
        }

        if (mesmaOrigem && res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
      } catch (err) {}
      return res;
    }).catch(() => {
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
    badge: './icon-192.png',
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
