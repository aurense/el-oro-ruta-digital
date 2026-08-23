// public/sw.js - Service Worker Optimizado para Pasaporte El Oro
const CACHE_NAME = 'pasaporte-eloro-v5';

// Recursos esenciales para funcionamiento offline 100% autónomo
const PRECACHE_URLS = [
    // Rutas de navegación principales
    '/',
    '/perfil',
    '/punto/palacio-municipal',
    '/punto/teatro-juarez',
    '/punto/tiro-norte',
    '/aliado/tranvia-el-oro',
    '/aliado/cafeteria-el-minero',
    '/aliado/taller-plata-aurea',
    '/aliado/hotel-casa-real',
    '/manifest.webmanifest',
    '/favicon.svg',
    '/favicon.ico',

    // Iconos de la PWA
    '/icon-192.png',
    '/icon-512.png',

    // Imágenes e insignias de los puntos
    '/img/miniatura-palacio-municipal.png',
    '/img/insignia-palacio-municipal.png',
    '/img/miniatura-teatro-juarez.png',
    '/img/insignia-teatro-juarez.png',
    '/img/miniatura-tiro-norte.png',
    '/img/insignia-tiro-norte.png',

    // Logos e insignias de aliados comerciales
    '/img/aliados/tranvia.svg',
    '/img/insignias/tranvia.svg',
    '/img/aliados/cafeteria-el-minero.svg',
    '/img/insignias/cafeteria-el-minero.svg',
    '/img/aliados/taller-plata-aurea.svg',
    '/img/insignias/taller-plata-aurea.svg',
    '/img/aliados/hotel-casa-real.svg',
    '/img/insignias/hotel-casa-real.svg',

    // Audios de relatos históricos
    '/audio/audio-palacio-municipal.mp3',
    '/audio/audio-teatro-juarez.mp3',
    '/audio/audio-tiro-norte.mp3',

    // Datos geográficos offline
    '/data/estados-mexico.json',
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

// Instalación: Precaching resiliente (no falla si un asset individual tuviera problemas)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW] Precaching recursos esenciales de Pasaporte El Oro...');
            const fetchPromises = PRECACHE_URLS.map(async url => {
                try {
                    const response = await fetch(url, { cache: 'no-cache' });
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (err) {
                    console.warn(`[SW] No se pudo precachear: ${url}`, err);
                }
            });
            await Promise.all(fetchPromises);
        })
    );
    self.skipWaiting();
});

// Activación: Limpieza de versiones previas del caché
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log(`[SW] Eliminando caché obsoleto: ${key}`);
                    return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

// Manejador de Range Requests para audio en Safari iOS y navegadores móviles
async function handleRangeRequest(request, cache) {
    const cachedResponse = await cache.match(request.url, { ignoreSearch: true });
    if (!cachedResponse) {
        return fetch(request);
    }

    const rangeHeader = request.headers.get('range');
    if (!rangeHeader) {
        return cachedResponse;
    }

    const arrayBuffer = await cachedResponse.arrayBuffer();
    const bytesMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!bytesMatch) {
        return cachedResponse;
    }

    const total = arrayBuffer.byteLength;
    const start = parseInt(bytesMatch[1], 10);
    const end = bytesMatch[2] ? parseInt(bytesMatch[2], 10) : total - 1;

    if (start >= total || end >= total) {
        return new Response(null, {
            status: 416,
            statusText: 'Range Not Satisfiable',
            headers: { 'Content-Range': `bytes */${total}` }
        });
    }

    const slicedBuffer = arrayBuffer.slice(start, end + 1);
    return new Response(slicedBuffer, {
        status: 206,
        statusText: 'Partial Content',
        headers: {
            'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Content-Length': String(slicedBuffer.byteLength),
            'Accept-Ranges': 'bytes'
        }
    });
}

// Estrategia de Fetch
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Ignorar esquemas no HTTP (ej. chrome-extension://) y peticiones que no sean GET
    if (!url.protocol.startsWith('http') || request.method !== 'GET') {
        return;
    }

    // 2. Ignorar APIs dinámicas de Firebase Auth / Firestore (tienen su propia persistencia IndexedDB)
    if (
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('identitytoolkit.googleapis.com') ||
        url.hostname.includes('securetoken.googleapis.com')
    ) {
        return;
    }

    // 3. Manejo especial de audio con soporte de Range Requests
    if (url.pathname.endsWith('.mp3') || request.headers.has('range')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => handleRangeRequest(request, cache))
        );
        return;
    }

    // 4. Navegación HTML (páginas): Network First con fallback a Cache (ignoreSearch para QR)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Fallback a caché ignorando parámetros como ?origen=qr
                    const cached = await caches.match(request, { ignoreSearch: true });
                    if (cached) return cached;

                    // Probar variante con o sin barra final
                    const cleanPath = url.pathname.replace(/\/$/, '') || '/';
                    const fallback = await caches.match(cleanPath, { ignoreSearch: true });
                    if (fallback) return fallback;

                    return new Response(
                        '<h1>Sin conexión</h1><p>Estás en modo offline. Visita los puntos guardados en tu pasaporte.</p>',
                        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                })
        );
        return;
    }

    // 5. Assets estáticos (CSS, JS, imágenes, fuentes, JSON): Cache First con actualización en segundo plano
    event.respondWith(
        caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return networkResponse;
            });
        })
    );
});