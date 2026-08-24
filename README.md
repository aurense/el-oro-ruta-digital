# 🏔️ Pasaporte El Oro – Pueblo Mágico Minero

[![Astro](https://img.shields.io/badge/Astro-5.0-FF5D01?logo=astro)](https://astro.build)
[![Svelte](https://img.shields.io/badge/Svelte-4.0-FF3E00?logo=svelte)](https://svelte.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Spark%20(Free)-FFCA28?logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

**Pasaporte turístico digital e interactivo** para el Pueblo Mágico Minero de **El Oro, Estado de México**.  
Una experiencia gamificada tipo RPG que te guía por la historia minera, premia tu exploración con sellos digitales y **te entrega cupones de descuento y cortesías en comercios y talleres locales**.

---

## ✨ Características Destacadas

### 🎮 Experiencia Gamificada Inmersiva
- 📱 **PWA Offline-First**: Funciona al 100% sin conexión a internet después de la primera carga.
- 🧭 **Navegación RPG con Tab Bar fija**: Alterna fluidamente entre el **Mapa de Exploración** y tu **Pasaporte de Sellos** sin recargas ni scroll forzado.
- 🎧 **Audioguías con Narración Histórica**: Reproductor con avance bloqueado, visualizador de onda sonora de 9 barras y botón de cierre inteligente.
- 🎯 **Trivias Desbloqueables**: Sistema interactivo de preguntas con vidas, sacudida visual ante fallos y animación de victoria.
- 🏅 **Colección de Sellos & Insignias**: Carrusel elástico con barra de experiencia XP, niveles de explorador y modal de celebración con confetti.

### 🎟️ Monetización y Red de Aliados Comerciales
- ☕ **Vouchers de Recompensa**: Cada sello turístico desbloquea un cupón físico estilizado con beneficios en restaurantes, talleres de plata, hoteles y tours (ej. *Cafetería El Minero*, *Taller de Plata Áurea*, *Tranvía El Oro*).
- 🏷️ **Fichas de Aliados (`/aliado/[id]`)**: Información del comercio, categoría, vigencia y botón para canjear el beneficio presencialmente.

### ⚡ Carga Ultrarrápida y Cero Latencia (0 ms)
- 💾 **Hidratación Síncrona en LocalStorage**: Si ya visitaste la app, tus sellos y perfil se cargan de inmediato en 0 milisegundos sin parpadeos.
- 🔄 **Sincronización en Tiempo Real (`onSnapshot`)**: Conexión con Firestore que sincroniza silenciosamente en segundo plano sin congelar la UI.
- ⛏️ **Mining Loader Temático**: Animación ligera en CSS puro con un pico minero dorado (`⛏️ ✨`) para nuevos visitantes.
- 🚀 **Pre-carga de Activos Críticos**: Directivas `<link rel="preload">` para acelerar miniaturas e insignias en paralelo con el HTML.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Características |
|------|------------|-----------------|
| **Frontend** | [Astro](https://astro.build) (Modo Estático) | Generación estática optimizada, islas interactivas. |
| **Componentes** | [Svelte](https://svelte.dev) | Reactividad ultra-liviana sin librerías pesadas. |
| **Estilos** | CSS Plano + Flexbox Fluido | Adaptable a pantalla completa (`100dvh`), sin dependencias ni Tailwind. |
| **Backend** | [Firebase](https://firebase.google.com) | Auth anónima, Firestore con persistencia offline en IndexedDB. |
| **PWA** | Service Worker (Workbox) | Cache-first para recursos, Range Requests para audios offline en iOS/Android. |

---

## 📁 Estructura del Proyecto

```
pasaporte-eloro/
├── public/               # Archivos públicos estáticos (audios MP3, imágenes, datos)
│   ├── audio/            # Narraciones de puntos turísticos
│   ├── img/              # Insignias de sellos y miniaturas
│   ├── data/             # JSON de división política de México
│   ├── sw.js             # Service Worker manual resiliente
│   └── manifest.webmanifest
├── src/
│   ├── components/       # Componentes interactivos Svelte
│   │   ├── PasaporteApp.svelte       # Navegación principal con Tab Bar
│   │   ├── StampCollection.svelte   # Carrusel de sellos y barra XP
│   │   ├── StampBadge.svelte        # Insignia individual responsiva
│   │   ├── ModalSello.svelte        # Modal de detalle de sello con Voucher
│   │   ├── VoucherCard.svelte       # Cupón de descuento comercial interactivo
│   │   ├── RutaMapa.svelte          # Mapa SVG con modales informativos
│   │   ├── AudioPlayer.svelte       # Reproductor de audio con onda sonora
│   │   ├── Trivia.svelte            # Modal de preguntas interactivas
│   │   ├── MiningLoader.svelte      # Animación de carga con pico minero
│   │   └── admin/                   # Panel de administración
│   ├── data/
│   │   ├── puntos.ts         # Datos estáticos de puntos turísticos y enlaces a aliados
│   │   └── aliados.ts        # Catálogo de comercios aliados y beneficios
│   ├── layouts/
│   │   ├── BaseLayout.astro  # Layout con tokens de diseño globales
│   │   └── AdminLayout.astro
│   ├── lib/                  # Clientes de Firebase, Auth, base de datos y métricas
│   ├── pages/                # Rutas de Astro (/, /punto/[id], /aliado/[id], /perfil, /admin)
│   └── stores/
│       └── user.ts           # Store Svelte con caché síncrono en LocalStorage
├── astro.config.mjs
├── firebase.json
└── firestore.rules
```

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd pasaporte-aurense/pasaporte-eloro
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz con tus credenciales de Firebase:
```env
PUBLIC_FIREBASE_API_KEY=tu_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:4321](http://localhost:4321) en tu navegador.

---

## 🧪 Comandos Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Compilar para producción (modo estático)
npm run build

# Probar la PWA compilada localmente en modo offline
npx serve dist

# Desplegar a Firebase Hosting
firebase deploy --only hosting
```

---

## 🛡️ Panel de Administración

Accede a `/admin/login` con tus credenciales de administrador de Firebase para:
- Consultar métricas de visitas, origen geográfico y edades de los turistas.
- Crear, editar y dar de baja puntos turísticos y comercios aliados.

---

## 📜 Licencia y Atribución
Desarrollado para la promoción cultural y turística del **Pueblo Mágico de El Oro, Estado de México**.  
Diseñado bajo principios de accesibilidad, bajo consumo de datos y compatibilidad offline integral.
