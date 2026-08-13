// public/sw.js
const CACHE_NAME = 'pasaporte-eloro-v3'; // aumentamos versión para forzar actualización

// Archivos que DEBEN estar precacheados para funcionar offline sin necesidad de haberlos visitado antes
const PRECACHE_URLS = [
    // Páginas principales
    '/',
    '/perfil',
    '/punto/palacio-municipal',
    '/punto/teatro-juarez',
    '/punto/tiro-norte',
    '/manifest.webmanifest',
    // Iconos
    '/icon-192.png',
    '/icon-512.png',
    // Punto de prueba - multimedia
    '/img/miniatura-palacio-municipal.png',
    '/img/insignia-palacio-municipal.png',
    '/img/miniatura-teatro-juarez.png',
    '/img/insignia-teatro-juarez.png',
    '/img/miniatura-tiro-norte.png',
    '/img/insignia-tiro-norte.png',
    '/img/test-logro.png',
    '/audio/audio-palacio-municipal.mp3',
    '/audio/audio-teatro-juarez.mp3',
    '/audio/audio-tiro-norte.mp3',
    // Datos geográficos
    '/data/paises.json',
    '/data/estados-mexico.json',
    // Lista de municipios 
    '/data/municipios/aguascalientes.json',
    '/data/municipios/baja-california-sur.json',
    '/data/municipios/baja-california.json',
    '/data/municipios/campeche.json',
    '/data/municipios/chiapas.json',
    '/data/municipios/chihuahua.json',
    '/data/municipios/ciudad-de-mexico.json',
    '/data/municipios/coahuila-de-zaragoza.json',
    '/data/municipios/colima.json',
    '/data/municipios/durango.json',
    '/data/municipios/guanajuato.json',
    '/data/municipios/guerrero.json',
    '/data/municipios/hidalgo.json',
    '/data/municipios/jalisco.json',
    '/data/municipios/mexico.json',
    '/data/municipios/michoacan-de-ocampo.json',
    '/data/municipios/morelos.json',
    '/data/municipios/nayarit.json',
    '/data/municipios/nuevo-leon.json',
    '/data/municipios/oaxaca.json',
    '/data/municipios/puebla.json',
    '/data/municipios/queretaro.json',
    '/data/municipios/quintana-roo.json',
    '/data/municipios/san-luis-potosi.json',
    '/data/municipios/sinaloa.json',
    '/data/municipios/sonora.json',
    '/data/municipios/tabasco.json',
    '/data/municipios/tamaulipas.json',
    '/data/municipios/tlaxcala.json',
    '/data/municipios/veracruz-de-ignacio-de-la-llave.json',
    '/data/municipios/yucatan.json',
    '/data/municipios/zacatecas.json'
];

// Instalación: precaching de recursos esenciales
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Precaching recursos esenciales');
            return cache.addAll(PRECACHE_URLS).catch(err => {
                console.error('[SW] Falló precaching de algunos recursos:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Estrategia de fetch: Cache First, luego red (y guardar en caché para la próxima)
self.addEventListener('fetch', event => {
    // Ignorar peticiones a Firebase
    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('identitytoolkit.googleapis.com') ||
        event.request.url.includes('securetoken.googleapis.com')) {
        return;
    }

    // Para cualquier otro recurso, intentar servir de caché, si no, ir a red y cachear
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                // Solo cachear respuestas exitosas y peticiones GET
                if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Si no hay red y no está en caché, podrías devolver una página offline (opcional)
                return new Response('Recurso no disponible sin conexión', { status: 503 });
            });
        })
    );
});