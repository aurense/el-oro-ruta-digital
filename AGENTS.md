# Pasaporte El Oro – Guía Integral para Agentes de IA y Desarrolladores

## 🎯 Propósito del Proyecto
**Pasaporte El Oro** es una Progressive Web App (PWA) offline-first y gamificada diseñada para el Pueblo Mágico Minero de El Oro, Estado de México.

Transforma la visita turística en una aventura inmersiva tipo videojuego RPG:
1. **Ruta & Mapa**: El usuario explora el mapa interactivo vectorial de puntos turísticos y comercios aliados.
2. **Escaneo QR & Audio**: Al llegar a un punto y escanear el QR físico (`?origen=qr`), escucha una narración histórica con avance bloqueado y visualizador de onda sonoro.
3. **Trivia Desbloqueable**: Al finalizar el audio, responde una trivia con sistema de vidas, sacudida visual y retroalimentación inmediata.
4. **Onboarding Progresivo en 3 Etapas (Agnóstico a Punto o Aliado)**:
   - **1er Sello obtenido**: Dispara el **Paso 1: Credencial de Explorador** (Nombre de explorador, País y Estado, Consentimiento).
   - **2do Sello obtenido**: Dispara el **Paso 2: Censo del Gremio Aurense** (Municipio/Ciudad, Rango de edad, ¿Con quién nos visitas?: Solo/Pareja/Familia/Amigos).
   - **3er Sello obtenido**: Dispara el **Paso 3: Cédula de Honor** (Tiempo de estadía en El Oro, Confirmación de nombre para el diploma, Calificación de satisfacción).
   - **4to Sello en adelante**: Entrega directa sin interrupciones.
5. **Sellos Digitales, Monedas Áureas & Vouchers**: Al acertar y validar el paso correspondiente, desbloquea una insignia para su pasaporte, acumula **40 Monedas Áureas** (en monumentos) o **20 Monedas Áureas** (en aliados) y **gana un voucher de cortesía/descuento**.
6. **Comercios Aliados**: Al visitar un negocio aliado y registrar la visita presencial (o escanear su QR `?origen=qr`), se avanza de igual forma en los pasos del perfil y se acredita el beneficio comercial.
7. **Certificado de Honor ("Gran Ciudadano Aurense")**: Al completar todos los puntos patrimoniales de la ruta, desbloquea un diploma de honor oficial exportable en formato póster digital (Canvas 2D, 1080×1920 px) personalizado con el nombre confirmado en el Paso 3.
8. **Cero Fricción Offline**: Funciona al 100% sin conexión a internet tras la primera carga, con persistencia local en `localStorage` e IndexedDB y sincronización transparente con Firestore.

---

## 🧱 Stack Tecnológico y Decisiones de Arquitectura

| Capa | Tecnología | Justificación y Reglas |
|------|------------|------------------------|
| **Framework Principal** | **Astro (Static Mode)** | Arquitectura de islas, HTML estático ultra-rápido, cero overhead de JS en el cascarón principal. |
| **Componentes Reactivos** | **Svelte 5** | Compilado a JavaScript vanilla liviano (~2 KB por isla), reactividad nativa mediante stores fuertemente tipados. |
| **Diseño & Layout** | **Vanilla CSS + Flexbox Fluido** | Diseñado para **100% de altura de pantalla (`100dvh` / `overflow: hidden`)** sin scroll vertical forzado en móviles. Tokens CSS centrales definidos en `BaseLayout.astro`. |
| **Base de Datos & Auth** | **Firebase 12 (Spark Free)** | Autenticación anónima transparente, Firestore en tiempo real con persistencia IndexedDB habilitada (vía SDK oficial e `idb`). |
| **Caché y Zero-Latency** | **LocalStorage + Svelte Store** | Hidratación síncrona en 0 ms (`pasaporte_user_cache_v1`) y revalidación en segundo plano (*Stale-While-Revalidate* con `onSnapshot`). |
| **PWA & Offline** | **Workbox / Service Worker (`public/sw.js`)** | Pre-cacheo de HTML, audios, imágenes y datos geográficos. Soporte de *HTTP 206 Range Requests* para audios en iOS Safari offline. |
| **Generación Gráfica** | **HTML5 Canvas 2D API** | Renderizado dinámico de diplomas de alta resolución (1080×1920) sin librerías externas pesadas. |
| **Multimedia & CDN** | **`public/` (Audio, SVG, PNG, WebP)** | Cero costos de Firebase Storage; todos los activos residen en la carpeta pública o CDN estático. |

---

## 📁 Estructura del Repositorio

```
pasaporte-eloro/
├── public/
│   ├── audio/                 # Audios de las narraciones históricas (MP3)
│   ├── data/                  # Catálogo geográfico de división política
│   │   ├── paises.json
│   │   ├── estados-mexico.json
│   │   └── municipios/        # JSON por estado de municipios de México
│   ├── img/                   # Miniaturas de atractivos e insignias de sellos
│   │   └── aliados/           # Logotipos vectoriales de comercios aliados
│   ├── sw.js                  # Service Worker manual resiliente con soporte HTTP 206
│   ├── registerSW.js          # Script de registro del Service Worker
│   └── manifest.webmanifest   # Manifiesto PWA (iconos, colores, display standalone)
├── src/
│   ├── components/
│   │   ├── PasaporteApp.svelte       # Orquestador principal (RutaMapa ⇄ Pasaporte con Tab Bar RPG)
│   │   ├── RutaMapa.svelte          # Mapa SVG interactivo con modales contextuales y botón de diploma
│   │   ├── StampCollection.svelte   # Carrusel horizontal elástico de sellos, XP y medallón de rango
│   │   ├── StampBadge.svelte        # Insignia individual responsiva con anillo orbital
│   │   ├── ModalSello.svelte        # Modal de celebración e inspección de sello con Voucher
│   │   ├── VoucherCard.svelte       # Ticket de recompensa comercial (variantes modal y celebración)
│   │   ├── CertificadoHonor.svelte  # Generador en Canvas 2D de diploma "Gran Ciudadano Aurense" (9:16)
│   │   ├── PuntoPage.svelte         # Vista de punto turístico con audio bloqueado y trivia
│   │   ├── AliadoPage.svelte        # Ficha de aliado comercial y canje de beneficio
│   │   ├── AudioPlayer.svelte       # Reproductor con avance bloqueado, onda sonora y botón de cierre
│   │   ├── Trivia.svelte            # Sistema de preguntas, vidas e insignias interactivas
│   │   ├── DataForm.svelte          # Modal overlay para registro obligatorio tras el 1er sello
│   │   ├── SelectoresUbicacion.svelte # Selectores encadenados país/estado/municipio
│   │   ├── PerfilPage.svelte        # Consulta y edición del perfil del turista
│   │   ├── MiningLoader.svelte      # Animación de carga temática (pico minero dorado)
│   │   ├── DonationButton.astro     # Botón estático accesible de aportación voluntaria
│   │   └── admin/                   # Componentes del panel administrativo
│   │       ├── AdminLogin.svelte    # Inicio de sesión con credenciales de Firebase
│   │       ├── AdminPuntos.svelte   # Gestión integral de atractivos turísticos
│   │       ├── DashboardStats.svelte# Visualizador de analíticas turísticas y demográficas
│   │       ├── PuntoForm.svelte     # Formulario de alta y edición de puntos
│   │       └── PuntosList.svelte    # Listado y control de activación de puntos
│   ├── data/
│   │   ├── puntos.ts          # Datos de los puntos patrimoniales, GPS, trivias y aliados vinculados
│   │   └── aliados.ts         # Catálogo de comercios aliados, categorías y beneficios
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Layout base con tokens CSS, metas PWA y tipografías (Cinzel/Inter)
│   │   └── AdminLayout.astro  # Layout para el panel de administración
│   ├── lib/
│   │   ├── firebase.ts        # Inicialización del SDK de Firebase
│   │   ├── auth.ts            # Autenticación anónima y gestión de sesión
│   │   ├── db.ts              # Métodos Firestore (sellos, visitas, audios, perfiles, aliados)
│   │   ├── firestore-persistence.ts # Activación de persistencia IndexedDB
│   │   ├── adminAuth.ts       # Lista de administradores autorizados
│   │   └── stats.ts           # Agregación y procesamiento de métricas de visitas
│   ├── pages/
│   │   ├── index.astro        # Punto de entrada principal (<PasaporteApp />)
│   │   ├── punto/[id].astro   # Página del punto turístico con pre-carga de assets
│   │   ├── aliado/[id].astro  # Ficha de aliado comercial y canje de voucher
│   │   ├── perfil.astro       # Página de perfil del usuario
│   │   └── admin/             # Rutas administrativas
│   │       ├── index.astro    # Dashboard de analíticas (/admin)
│   │       ├── login.astro    # Acceso administrativo (/admin/login)
│   │       └── puntos.astro   # Control de puntos (/admin/puntos)
│   └── stores/
│       └── user.ts            # Store reactivo con sincronización instantánea en LocalStorage
├── astro.config.mjs
├── firebase.json
├── firestore.rules
└── package.json
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
- Medallón de nivel de explorador que escala con el avance de la ruta.

### 3. Economía Áurea y Vouchers Comerciales (`VoucherCard.svelte`, `AliadoPage.svelte`, `QRScannerModal.svelte`)
- Cada punto turístico cuenta con un `voucherAliadoId` en `src/data/puntos.ts`.
- Al ganar un sello turístico, se otorgan **40 Monedas Áureas** y se entrega un cupón estilizado con línea de puntos perforada, estado en vivo pulsante (`tag-disponible`), vigencia y enlace directo al canje.
- **Canje de Cortesía con QR en Mostrador**:
  - **Frecuencia**: 1 beneficio por día/visita por establecimiento (controlado por `ultimoCanje.fechaDia === YYYY-MM-DD`).
  - **Doble Vía**: El turista puede escanear el QR físico de caja con la cámara nativa (`/aliado/[id]?canje=qr`) o usar el visor integrado de la PWA (`QRScannerModal.svelte`).
  - **Mecánica Unificada**: Un solo escaneo valida el beneficio, otorga el sello de aliado, acredita **+20 Monedas Áureas** y dispara el paso pendiente de onboarding si existe.
  - **Comprobante Dinámico en Vivo para el Cajero**: Pantalla de alta seguridad con reloj segundero en vivo (`HH:MM:SS`) que late segundo a segundo (anti-capturas de pantalla), folio único de transacción (`#CANJE-XXXX-9999`) y registro auditable en la subcolección `canjes_aliados` de Firestore.

### 4. Certificado de Honor: Gran Ciudadano Aurense (`CertificadoHonor.svelte`)
- Se activa cuando `sellos.length >= puntos.length`.
- Al pulsar el botón flotante del certificado en el mapa o pasaporte, se despliega un modal conmemorativo.
- **Motor Gráfico en Canvas 2D**: Genera un diploma PNG vertical 9:16 (1080×1920) de alta fidelidad con:
  - Fondo mineral oscuro y resplandor radial áureo.
  - Filigranas doradas victorianas en esquinas y orla ornamental.
  - Nombre del visitante (o "Explorador Ilustre"), fecha oficial, cantidad de Monedas Áureas y sellos.
  - Sello lacrado oficial y firmas de honor.
- **Acciones de Compartir**: Web Share API nativa (`navigator.share`) para subir a Instagram/Facebook Stories, botón de WhatsApp (`api.whatsapp.com/send`) y descarga directa en PNG.

### 5. Mapa Interactivo Contextual (`RutaMapa.svelte`)
- **Punto ya obtenido**: Abre directamente `ModalSello.svelte` con su confetti, estado y voucher.
- **Punto bloqueado**: Abre un modal Flexbox con la descripción y el botón de acción **`🗺️ Cómo llegar`**, el cual invoca la aplicación de mapas nativa offline (`geo:` en Android, `maps:` en iOS).
- **Barra de Progreso y Acceso al Diploma**: Banner o botón insignia flotante cuando la ruta ha sido completada.

### 6. Narración & Trivia (`PuntoPage.svelte`, `AudioPlayer.svelte`, `Trivia.svelte`)
- Pre-carga de imágenes y audios mediante directivas `<link rel="preload">` en `punto/[id].astro`.
- Determinación síncrona de fase: Si el usuario ya cuenta con el sello, la vista inicia inmediatamente en `selloGanado`.
- `AudioPlayer` previene el avance manual y expone un botón `✕` de cierre si el usuario ya cuenta con el sello o ya escuchó la narración completa.
- Guardado optimista (*fire-and-forget*): La UI otorga el sello y activa la celebración al instante sin congelar la pantalla esperando respuestas de red.

---

## ⚡ Estrategia de Rendimiento y Carga Instantánea (0 ms)

1. **Hidratación Síncrona (`src/stores/user.ts`)**:
   - `userStore` se inicializa de forma síncrona leyendo `localStorage` (`pasaporte_user_cache_v1`) antes del primer render en el cliente.
   - Si el usuario ya tenía sellos, monedas o perfil, aparecen en 0 ms sin destellos.
2. **Escucha en Tiempo Real con `onSnapshot` (`src/lib/db.ts`)**:
   - Conexión persistente que lee inmediatamente de la caché IndexedDB en <10 ms y sincroniza silenciosamente con Firestore en segundo plano.
3. **Animación Temática de Carga (`MiningLoader.svelte`)**:
   - En la primera visita de un nuevo usuario sin caché previa, se despliega un loader ligero en CSS puro con un pico minero dorado animado (`⛏️ ✨`).
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
    match /canjes_aliados/{id} {
      allow read: if isAdmin();
      allow write: if request.auth != null;
    }
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && (request.auth.uid == uid || isAdmin());
      match /visitas/{puntoId} {
        allow read, write: if request.auth != null && (request.auth.uid == uid || isAdmin());
      }
    }
  }
}
```

---

## 🏷️ Especificación de Códigos QR Físicos

Para imprimir e instalar códigos QR en monumentos y comercios aliados:

- **Puntos Turísticos (Patrimonio)**:
  `https://[dominio-app]/punto/{id}?origen=qr`
  - Ejemplo: `https://pasaporte.eloro.gob.mx/punto/palacio-municipal?origen=qr`
- **Comercios Aliados - QR de Mostrador / Caja (Canje de Cortesía y Sello)**:
  `https://[dominio-app]/aliado/{id}?canje=qr`
  - Ejemplo: `https://pasaporte.eloro.gob.mx/aliado/tranvia-el-oro?canje=qr`
- **Comercios Aliados - QR Promocional General**:
  `https://[dominio-app]/aliado/{id}?origen=qr`

---

## 🛠️ Comandos de Desarrollo y Verificación

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar producción estática
npm run build

# Previsualizar compilación estática
npm run preview

# Validar funcionamiento PWA / offline localmente
npx serve dist

# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar a Firebase Hosting
firebase deploy --only hosting
```

---

## 💡 Guía para Nuevas Funcionalidades

1. **Añadir nuevos Puntos Turísticos**:
   - Registrar en `src/data/puntos.ts` con su ID único, coordenadas GPS reales y trivia.
   - Asignar audio en `public/audio/[id].mp3`, miniatura en `public/img/miniatura-[id].png` (o webp), e insignia en `public/img/insignia-[id].png`.
   - Vincular opcionalmente a un comercio aliado mediante `voucherAliadoId`.
2. **Añadir nuevos Comercios Aliados**:
   - Registrar en `src/data/aliados.ts`.
   - Definir categoría (`"sabores"`, `"artesanias"`, `"descanso"`, `"aventura"`), coordenadas GPS y beneficio con vigencia.
   - Colocar logotipo en `public/img/aliados/[id].svg` e insignia en `public/img/insignias/[id].svg`.
3. **Mantener Reglas de Estilo**:
   - Mantener el contenedor principal con `100%` de altura sin scroll vertical forzado en móvil (`100dvh`).
   - Utilizar la paleta oficial (Dorado `#F2C94C`, `#D4A017`, Fondo `#12090A`, `#1E1008`, Tipografías `Cinzel` e `Inter`).