# Pasaporte El Oro – Guía Integral para Agentes de IA y Desarrolladores

## 🎯 Propósito del Proyecto
**Pasaporte El Oro** es una Progressive Web App (PWA) offline-first y gamificada diseñada para el Pueblo Mágico Minero de El Oro, Estado de México.

Transforma la visita turística en una aventura inmersiva tipo videojuego RPG:
1. **Ruta & Mapa**: El usuario explora el mapa interactivo vectorial de puntos turísticos y comercios aliados.
2. **Escaneo QR & Audio**: Al llegar a un punto y escanear el QR físico, escucha una narración histórica con avance bloqueado.
3. **Trivia Desbloqueable**: Al finalizar el audio, responde una trivia con sistema de vidas y retroalimentación inmediata.
4. **Sellos Digitales & Vouchers**: Al acertar, desbloquea una insignia para su pasaporte y **gana un voucher de cortesía/descuento** con un aliado comercial local (fomentando la derrama económica y monetización).
5. **Cero Fricción Offline**: Funciona al 100% sin conexión a internet tras la primera carga, con persistencia local y sincronización en tiempo real.

---

## 🧱 Stack Tecnológico y Decisiones de Arquitectura

| Capa | Tecnología | Justificación y Reglas |
|------|------------|------------------------|
| **Framework Principal** | **Astro (Static Mode)** | Arquitectura de islas, HTML estático ultra-rápido, cero overhead de JS en el cascarón principal. |
| **Componentes Reactivos** | **Svelte 4/5** | Compilado a JavaScript vanilla liviano (~2 KB por isla), reactividad nativa mediante stores. |
| **Diseño & Layout** | **Vanilla CSS + Flexbox Fluido** | Cero dependencias externas (sin Tailwind). Diseñado para **100% de altura de pantalla (`100dvh` / `overflow: hidden`)** sin scroll vertical forzado en móviles. |
| **Base de Datos & Auth** | **Firebase (Spark Free)** | Autenticación anónima transparente, Firestore en tiempo real con persistencia IndexedDB habilitada. |
| **Caché y Zero-Latency** | **LocalStorage + Svelte Store** | Hidratación síncrona en 0 ms (`pasaporte_user_cache_v1`) y revalidación en segundo plano (*Stale-While-Revalidate* con `onSnapshot`). |
| **PWA & Offline** | **Workbox / Service Worker (`public/sw.js`)** | Pre-cacheo de HTML, audios, imágenes y datos geográficos. Soporte de *HTTP 206 Range Requests* para audios en iOS Safari offline. |
| **Multimedia & CDN** | **`public/` (Audio, SVG, WebP)** | Cero costos de Firebase Storage; todos los activos residen en la carpeta pública o CDN estático. |

---

## 📁 Estructura del Repositorio

```
pasaporte-eloro/
├── public/
│   ├── audio/                 # Audios de las narraciones históricas (MP3)
│   ├── img/                   # Miniaturas de puntos e insignias de sellos
│   ├── data/                  # JSON de países, estados y municipios de México
│   ├── sw.js                  # Service Worker manual resiliente con Range Requests
│   ├── registerSW.js          # Script de registro del Service Worker
│   └── manifest.webmanifest   # Manifiesto PWA (iconos, colores, display standalone)
├── src/
│   ├── components/
│   │   ├── PasaporteApp.svelte       # Orquestador principal (RutaMapa ⇄ Pasaporte con Tab Bar RPG)
│   │   ├── StampCollection.svelte   # Carrusel horizontal de sellos, XP y medallón de rango
│   │   ├── StampBadge.svelte        # Insignia individual responsiva con anillo orbital
│   │   ├── ModalSello.svelte        # Modal de celebración e inspección de sello con Voucher
│   │   ├── VoucherCard.svelte       # Ticket de recompensa comercial (variantes modal y celebración)
│   │   ├── RutaMapa.svelte          # Mapa SVG interactivo con modales contextuales
│   │   ├── AudioPlayer.svelte       # Reproductor con avance bloqueado, onda sonora y botón de cierre
│   │   ├── Trivia.svelte            # Sistema de preguntas, vidas e insignias interactivas
│   │   ├── DataForm.svelte          # Modal overlay para registro obligatorio del 1er sello
│   │   ├── SelectoresUbicacion.svelte # Selectores encadenados país/estado/municipio
│   │   ├── PerfilPage.svelte        # Consulta y edición del perfil del turista
│   │   ├── MiningLoader.svelte      # Animación de carga temática (pico minero dorado)
│   │   └── admin/                   # Componentes del panel administrativo
│   │       ├── LoginForm.svelte
│   │       ├── DashboardStats.svelte
│   │       └── PuntoForm.svelte
│   ├── data/
│   │   ├── puntos.ts          # Datos de los puntos patrimoniales y vínculos con aliados
│   │   └── aliados.ts         # Datos de comercios aliados, categorías y beneficios
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Layout base con tokens CSS, astro-island contents y listeners
│   │   └── AdminLayout.astro  # Layout para el panel de administración
│   ├── lib/
│   │   ├── firebase.ts        # Inicialización del SDK de Firebase
│   │   ├── auth.ts            # Autenticación anónima
│   │   ├── db.ts              # Operaciones Firestore (escucharUsuario, guardarSello, visitas)
│   │   ├── firestore-persistence.ts # Activación de persistencia IndexedDB
│   │   ├── adminAuth.ts       # Lista de administradores autorizados
│   │   └── stats.ts           # Agregación de métricas de visitas
│   ├── pages/
│   │   ├── index.astro        # Punto de entrada principal (<PasaporteApp />)
│   │   ├── punto/[id].astro   # Página del punto turístico con pre-carga de assets
│   │   ├── aliado/[id].astro  # Ficha de aliado comercial y canje de voucher
│   │   ├── perfil.astro       # Página de perfil del usuario
│   │   └── admin/             # Rutas administrativas (/admin, /admin/login, /admin/puntos)
│   └── stores/
│       └── user.ts            # Store reactivo con sincronización instantánea en LocalStorage
├── astro.config.mjs
├── firebase.json
└── firestore.rules
```

---

## 🎮 Arquitectura de Componentes y Flujos de Juego

### 1. Orquestador Principal (`PasaporteApp.svelte`)
- Mantiene vivas en el DOM las dos vistas esenciales: **Explorar (RutaMapa)** y **Pasaporte (StampCollection)**.
- Alterna entre ellas usando `opacity`, `transform` y `pointer-events`, preservando el estado de scroll horizontal y marcadores sin re-montar componentes.
- Tab Bar inferior fija de `56px` con micro-animaciones e iconos vectoriales iluminados con oro metálico.

### 2. Carrusel de Sellos (`StampCollection.svelte` & `StampBadge.svelte`)
- Layout basado en **Flexbox elástico**: Header compacto (`46px`), barra de experiencia XP (`8px`), y carrusel central con scroll snap horizontal.
- Insignia (`StampBadge.svelte`) con `flex: 1; min-height: 0;` y `max-height: 100%`, asegurando el máximo tamaño visual posible sin desbordar el alto de la pantalla en móviles pequeños.

### 3. Monetización y Recompensas (`VoucherCard.svelte`)
- Cada punto turístico cuenta con un `voucherAliadoId` en `src/data/puntos.ts`.
- Al ganar un sello (o al inspeccionarlo en el pasaporte), se entrega un cupón físico estilizado con línea de puntos perforada, estado en vivo pulsante (`status-dot`), vigencia y botón directo a `/aliado/[id]`.

### 4. Mapa Interactivo Contextual (`RutaMapa.svelte`)
- **Punto ya obtenido**: Al tocarlo en el mapa, abre directamente `ModalSello.svelte` con su confetti, estado y voucher.
- **Punto bloqueado**: Abre un modal Flexbox con la descripción y el botón de acción **`🗺️ Cómo llegar`**, el cual abre la aplicación de mapas nativa offline (`geo:` en Android, `maps:` en iOS).

### 5. Narración & Trivia (`PuntoPage.svelte`, `AudioPlayer.svelte`, `Trivia.svelte`)
- Pre-carga de imágenes y audios mediante directivas `<link rel="preload">` en `punto/[id].astro`.
- Determinación síncrona de fase: Si el usuario ya cuenta con el sello, la vista inicia inmediatamente en `selloGanado`.
- `AudioPlayer` previene el avance manual y expone un botón `✕` de cierre si el usuario ya cuenta con el sello o ya escuchó la narración completa.
- Guardado optimista (*fire-and-forget*): La UI otorga el sello y activa la celebración al instante sin congelar la pantalla esperando respuestas de red.

---

## ⚡ Estrategia de Rendimiento y Carga Instantánea (0 ms)

1. **Hidratación Síncrona (`src/stores/user.ts`)**:
   - `userStore` se inicializa de forma síncrona leyendo `localStorage` antes del primer render en el cliente.
   - Si el usuario ya tenía sellos o perfil, aparecen en 0 ms sin destellos.
2. **Escucha en Tiempo Real con `onSnapshot` (`src/lib/db.ts`)**:
   - Reemplaza las consultas secuenciales por un listener que lee directamente de IndexedDB en <10 ms y sincroniza con Firestore en segundo plano.
3. **Animación Temática de Carga (`MiningLoader.svelte`)**:
   - En la primera visita de un nuevo usuario, se despliega un loader ligero en CSS puro con un pico minero dorado animado (`⛏️ ✨`).
4. **Aceleración por Hardware en CSS**:
   - `transform: translateZ(0);` y `will-change: opacity, transform;` en transiciones de vistas.

---

## 🔐 Modelo de Seguridad y Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.uid in ['UID_ADMIN'];
    }
    match /puntos/{puntoId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /aliados/{aliadoId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /visitas_aliados/{id} {
      allow read: if isAdmin();
      allow write: if request.auth != null;
    }
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && (request.auth.uid == uid || isAdmin());
    }
  }
}
```

---

## 🛠️ Comandos de Desarrollo y Verificación

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar producción estática
npm run build

# Validar funcionamiento PWA / offline localmente
npx serve dist

# Desplegar a Firebase Hosting
firebase deploy --only hosting
```

---

## 💡 Guía para Nuevas Funcionalidades

1. **Añadir nuevos Puntos Turísticos**:
   - Registrar en `src/data/puntos.ts`.
   - Asignar audio en `public/audio/[id].mp3`, miniatura en `public/img/[id].webp`, e insignia en `public/img/sello-[id].webp`.
   - Vincular opcionalmente a un comercio aliado con `voucherAliadoId`.
2. **Añadir nuevos Comercios Aliados**:
   - Registrar en `src/data/aliados.ts`.
   - Definir categoría (`"sabores"`, `"artesanias"`, `"descanso"`, `"aventura"`) y beneficio.
3. **Mantener Reglas de Estilo**:
   - Mantener el contenedor principal con `100%` de altura sin scroll vertical forzado en móvil.
   - Utilizar la paleta oficial (Dorado `#F2C94C`, `#D4A017`, Fondo `#12090A`, `#1E1008`, Tipografías `Cinzel` e `Inter`).