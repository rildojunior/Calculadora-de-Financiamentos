/* =============================================
   SERVICE WORKER — Calculadora Financeira
   Cache dos arquivos estáticos para uso offline
   ============================================= */

// VERSÃO DO APP — incrementar a CADA atualização publicada.
// Tem que ser igual à versão exibida no index.html (o teste tests/versao.test.js confere).
// Mudar este arquivo é o que faz os apps instalados baixarem a versão nova.
const APP_VERSION = 'v2.4'
const CACHE_NAME = 'calculadora-financeira-' + APP_VERSION

const STATIC_FILES = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './juros.js',
  './ui.js',
  './pwa.js',
  './manifest.json',
  './favicon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
]

/* ── Install: guarda os estáticos e ativa já (sem esperar fechar as abas) ── */
self.addEventListener('install', event => {
  event.waitUntil(
    // cache: 'reload' ignora o cache HTTP do navegador, garantindo
    // que a versão nova guarde os arquivos novos (e não cópias antigas)
    caches
      .open(CACHE_NAME)
      .then(cache =>
        cache.addAll(STATIC_FILES.map(u => new Request(u, { cache: 'reload' })))
      )
  )
  self.skipWaiting()
})

/* ── Activate: apaga caches de versões antigas e assume as páginas abertas ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

/* ── Fetch ── */
self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Fontes Google → cache first (guardadas na primeira visita com internet)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached
        return fetch(req).then(res => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone()
            caches.open(CACHE_NAME).then(c => c.put(req, copy))
          }
          return res
        })
      })
    )
    return
  }

  if (url.origin !== self.location.origin) return

  // Estáticos do próprio site → cache first (ignorando ?query)
  event.respondWith(
    caches
      .match(req, { ignoreSearch: true })
      .then(cached => cached || fetch(req))
  )
})
