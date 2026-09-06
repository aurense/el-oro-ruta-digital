# 🏔️ Pasaporte El Oro – Pueblo Mágico Minero

[![Astro](https://img.shields.io/badge/Astro-5.x%20%2F%207.x-FF5D01?logo=astro)](https://astro.build)
[![Svelte](https://img.shields.io/badge/Svelte-5.x-FF3E00?logo=svelte)](https://svelte.dev)
[![Firebase](https://img.shields.io/badge/Firebase-v12%20(Spark%20Free)-FFCA28?logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**Pasaporte turístico digital e interactivo** para el Pueblo Mágico Minero de **El Oro, Estado de México**.  
Una experiencia gamificada tipo RPG que te guía por la memoria histórica minera, premia tu exploración con sellos digitales y **Monedas Áureas**, te entrega cupones de descuento y cortesías en comercios locales, y te otorga el diploma de honor oficial al completar la ruta.

---

## ✨ Características Destacadas

### 🎮 Experiencia Gamificada Inmersiva
- 📱 **PWA Offline-First**: Funciona al 100% sin conexión a internet después de la primera carga.
- 🧭 **Navegación RPG con Tab Bar fija**: Alterna instantáneamente entre el **Mapa de Exploración** y tu **Pasaporte de Sellos** sin recargas de página ni saltos de scroll.
- 🎧 **Audioguías con Narración Histórica**: Reproductor con avance bloqueado, visualizador de onda sonora reactivo (9 barras) y botón de cierre inteligente.
- 🎯 **Trivias Desbloqueables**: Sistema de preguntas con vidas, vibración háptica, sacudida visual ante fallos y animación festiva de victoria.
- 🏅 **Colección de Sellos & Insignias**: Carrusel elástico con barra de experiencia XP, niveles de explorador y modal de celebración con lluvia de confetti.
- 💰 **Economía Áurea**: Acumula **Monedas Áureas** en tu perfil (40 por cada monumento patrimonial y 20 por cada comercio aliado visitado).

### 📜 Certificado de Honor Oficial ("Gran Ciudadano Aurense")
- 🏆 **Reconocimiento por Completitud**: Al recolectar todos los sellos patrimoniales, se desbloquea el título de **Gran Ciudadano Aurense**.
- 🎨 **Diploma Exportable en Alta Resolución (1080×1920 px)**: Renderizado procedural en HTML5 Canvas con estética porfiriana, filigranas de oro, sellos lacrados y firmas oficiales.
- 📲 **Difusión Social**: Integración con la Web Share API nativa del móvil y acceso directo para compartir el logro en WhatsApp.

### 🎟️ Monetización y Red de Aliados Comerciales
- ☕ **Vouchers de Recompensa**: Cada sello turístico desbloquea un cupón físico estilizado con beneficios en restaurantes, talleres de orfebrería, hoteles y tours (ej. *Cafetería El Minero*, *Taller Plata Áurea*, *Tranvía El Oro*, *Hotel Casa Real*).
- 🏷️ **Fichas Interactivas de Aliados (`/aliado/[id]`)**: Consulta ubicación, detalles del beneficio, categoría y canje presencial con registro de sellos comerciales.
- 📍 **Parámetros de Trazabilidad QR**: Códigos QR físicos para monumentos y comercios mediante el parámetro `?origen=qr`.

### ⚡ Carga Ultrarrápida y Cero Latencia (0 ms)
- 💾 **Hidratación Síncrona en LocalStorage**: Lectura en 0 ms del estado del usuario al arrancar, evitando parpadeos visuales (*layout shift*).
- 🔄 **Sincronización en Tiempo Real (`onSnapshot` + IndexedDB)**: Conexión con Firestore con persistencia local multisesión sin congelar la interfaz.
- ⛏️ **Mining Loader Temático**: Animación ligera en CSS puro con un pico minero dorado (`⛏️ ✨`) para la primera carga.
- 🚀 **Pre-carga de Activos Críticos**: Directivas `<link rel="preload">` para acelerar miniaturas, insignias y audios en paralelo con el HTML.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación y Características |
|------|------------|---------------------------------|
| **Frontend Base** | [Astro](https://astro.build) (Modo Estático) | Arquitectura de islas, HTML estático ultra-rápido y cero JS innecesario en el cascarón. |
| **Componentes Reactivos** | [Svelte 5](https://svelte.dev) | Reactividad ligera (~2 KB por isla), stores reactivos con tipado estricto. |
| **Estilos & UI** | CSS Puro + Flexbox Elástico | Adaptable a pantalla completa (`100dvh` / `overflow: hidden`), sin scroll vertical forzado en móviles. Tokens CSS basados en paleta dorada y mineral. |
| **Backend & Base de Datos** | [Firebase 12](https://firebase.google.com) (Spark Free) | Autenticación anónima transparente, Firestore en tiempo real con persistencia IndexedDB vía SDK oficial e `idb`. |
| **PWA & Caché Offline** | Workbox + Vite PWA Plugin | Cache-first para recursos estáticos y soporte para *HTTP 206 Range Requests* (audios offline en iOS Safari y Android). |
| **Generación Gráfica** | HTML5 Canvas 2D API | Generación dinámica client-side de diplomas PNG en proporción 9:16 para historias y redes. |

---

## 📁 Estructura del Repositorio

```
pasaporte-eloro/
├── public/                    # Activos públicos estáticos precacheados
│   ├── audio/                 # Audios de narración histórica (MP3)
│   ├── data/                  # Catálogo de países, estados y municipios de México
│   │   ├── paises.json
│   │   ├── estados-mexico.json
│   │   └── municipios/        # JSON individuales de municipios por estado
│   ├── img/                   # Miniaturas de puntos e insignias de sellos (PNG/WebP/SVG)
│   │   └── aliados/           # Logotipos vectoriales de comercios aliados
│   ├── sw.js                  # Service Worker resiliente con Range Requests
│   ├── registerSW.js          # Registro del Service Worker
│   └── manifest.webmanifest   # Manifiesto PWA (iconos, colores de tema y modo standalone)
├── src/
│   ├── components/            # Componentes interactivos en Svelte y Astro
│   │   ├── PasaporteApp.svelte       # Orquestador principal (Explorar Mapa ⇄ Pasaporte RPG)
│   │   ├── RutaMapa.svelte          # Mapa SVG interactivo con modales contextuales y botón de honor
│   │   ├── StampCollection.svelte   # Carrusel horizontal elástico de sellos, barra XP y rango
│   │   ├── StampBadge.svelte        # Insignia individual responsiva con anillo orbital
│   │   ├── ModalSello.svelte        # Modal de detalle de sello con Voucher asociado
│   │   ├── VoucherCard.svelte       # Cupón de beneficio comercial (variantes modal y celebración)
│   │   ├── CertificadoHonor.svelte  # Modal y generador Canvas 2D de diploma "Gran Ciudadano Aurense"
│   │   ├── PuntoPage.svelte         # Vista de punto turístico con audio bloqueado y trivia
│   │   ├── AliadoPage.svelte        # Ficha interactiva de comercio aliado y canje de beneficio
│   │   ├── AudioPlayer.svelte       # Reproductor con onda sonora y prevención de adelanto
│   │   ├── Trivia.svelte            # Sistema de preguntas, vidas e insignias interactivas
│   │   ├── DataForm.svelte          # Modal overlay de registro para el primer sello desbloqueado
│   │   ├── SelectoresUbicacion.svelte # Selectores encadenados país/estado/municipio
│   │   ├── PerfilPage.svelte        # Consulta y edición de datos del visitante
│   │   ├── MiningLoader.svelte      # Animación de carga temática con pico minero
│   │   ├── DonationButton.astro     # Botón estático accesible de apoyo voluntario
│   │   └── admin/                   # Componentes del panel administrativo
│   │       ├── AdminLogin.svelte    # Formulario de inicio de sesión administrativo
│   │       ├── AdminPuntos.svelte   # Gestión y listado interactivo de puntos
│   │       ├── DashboardStats.svelte# Visualizador de analíticas y métricas de visitantes
│   │       ├── PuntoForm.svelte     # Formulario para crear o editar puntos turísticos
│   │       └── PuntosList.svelte    # Tabla y control de estado de puntos
│   ├── data/
│   │   ├── puntos.ts          # Definición de monumentos, coordenadas GPS, trivias y vínculos
│   │   └── aliados.ts         # Catálogo de comercios aliados, categorías y beneficios
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Layout principal con tokens CSS globales y tipografías
│   │   └── AdminLayout.astro  # Layout para las rutas del panel administrativo
│   ├── lib/
│   │   ├── firebase.ts        # Inicialización del SDK de Firebase v12
│   │   ├── auth.ts            # Autenticación anónima y estado de sesión
│   │   ├── db.ts              # Métodos Firestore (sellos, visitas, perfiles, aliados, audios)
│   │   ├── firestore-persistence.ts # Inicialización de persistencia IndexedDB
│   │   ├── adminAuth.ts       # Lista de administradores autorizados y validaciones
│   │   └── stats.ts           # Agregador de métricas y analíticas turísticas
│   ├── pages/
│   │   ├── index.astro        # Punto de entrada de la PWA (<PasaporteApp />)
│   │   ├── punto/[id].astro   # Página del atractivo turístico (pre-carga y <PuntoPage />)
│   │   ├── aliado/[id].astro  # Página del comercio aliado (<AliadoPage />)
│   │   ├── perfil.astro       # Página de perfil del turista (<PerfilPage />)
│   │   └── admin/             # Rutas administrativas
│   │       ├── index.astro    # Dashboard de métricas (/admin)
│   │       ├── login.astro    # Acceso administrativo (/admin/login)
│   │       └── puntos.astro   # Administración de puntos (/admin/puntos)
│   └── stores/
│       └── user.ts            # Store Svelte reactivo con hidratación y guardado síncrono
├── astro.config.mjs
├── firebase.json
├── firestore.rules
└── package.json
```

---

## 🚀 Inicio Rápido

### 1. Requisitos previos
- Node.js versión `>= 22.12.0`
- Cuenta de Firebase con proyecto creado (Plan Spark Gratuito)

### 2. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd pasaporte-aurense/pasaporte-eloro
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:
```env
PUBLIC_FIREBASE_API_KEY=tu_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
PUBLIC_FIREBASE_APP_ID=tu_app_id
PUBLIC_DONATION_URL=https://www.buymeacoffee.com/tu_usuario # Opcional
```

### 4. (Opcional) Generar catálogo geográfico de México
Si deseas actualizar la base de datos local de estados y municipios en `public/data/`:
```bash
node generar-datos-mexico.mjs
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:4321](http://localhost:4321).

---

## 🧪 Comandos Disponibles

```bash
# Servidor local de desarrollo
npm run dev

# Compilar proyecto para producción estática
npm run build

# Previsualizar el build estático localmente
npm run preview

# Probar la PWA en un servidor estático local con capacidades de Service Worker
npx serve dist

# Desplegar las reglas de seguridad a Cloud Firestore
firebase deploy --only firestore:rules

# Desplegar el sitio estático a Firebase Hosting
firebase deploy --only hosting
```

---

## 🏷️ Generación de Códigos QR Físicos

Para asegurar la trazabilidad analítica de los visitantes en sitio, los códigos QR impresos e instalados en los atractivos y comercios deben contener la URL con el parámetro `?origen=qr`:

- **Puntos Turísticos**:
  ```
  https://[tu-dominio]/punto/palacio-municipal?origen=qr
  https://[tu-dominio]/punto/teatro-juarez?origen=qr
  https://[tu-dominio]/punto/tiro-norte?origen=qr
  ```
- **Comercios Aliados**:
  ```
  https://[tu-dominio]/aliado/tranvia-el-oro?origen=qr
  https://[tu-dominio]/aliado/cafeteria-el-minero?origen=qr
  https://[tu-dominio]/aliado/taller-plata-aurea?origen=qr
  https://[tu-dominio]/aliado/hotel-casa-real?origen=qr
  ```

---

## 🛡️ Panel de Administración

Accede a `/admin/login` para gestionar la plataforma turística:
1. **Analíticas en Tiempo Real**: Distribución demográfica (edad, país, estado, municipio) y volumen de visitas a atractivos y aliados.
2. **Control de Puntos Turísticos**: Consulta, alta y edición de coordenadas, audios, preguntas de trivia y aliados asignados.

---

## 📜 Licencia y Atribución
Desarrollado para la difusión y fortalecimiento del patrimonio cultural del **Pueblo Mágico de El Oro, Estado de México**.  
Diseñado bajo estrictos principios de accesibilidad móvil, bajo consumo de batería y datos, y soporte offline autónomo.
