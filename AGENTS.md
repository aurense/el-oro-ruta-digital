# Pasaporte El Oro – Guía para Agentes de IA y Desarrolladores

## 🎯 Propósito del proyecto
Pasaporte turístico digital inmersivo para El Oro, Pueblo Mágico Minero del Estado de México.  
PWA offline‑first que, mediante escaneo de códigos QR en puntos turísticos, reproduce una narración en audio (bloqueando el avance rápido), desbloquea una trivia y, al acertar, otorga un sello digital coleccionable.  
Recoge origen (país, estado, municipio) y rango de edad del visitante, con fines estadísticos, y ofrece un panel de administración para gestionar los puntos.

## 🧱 Stack tecnológico definitivo
| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Framework principal | **Astro** (modo estático) | HTML mínimo, islas interactivas, excelente rendimiento. |
| Componentes interactivos | **Svelte** (compilado a JS vanilla) | Reactividad sencilla, peso mínimo (~2 KB por isla). |
| Backend / datos | **Firebase** (Auth, Firestore) | Autenticación anónima sin fricción, base de datos en tiempo real con persistencia offline. |
| Almacenamiento de archivos | **URLs públicas** (carpeta `public/` o CDN externo) | Se evita Firebase Storage para permanecer en el plan Spark gratuito. |
| PWA / Service Worker | **Workbox** (Service Worker manual en `public/sw.js`) | Precaching estático, estrategia cache‑first. Compatible con cualquier versión de Astro. |
| Multi‑idioma (preparado) | `astro‑i18next` (configurado, español activo) | Inglés y mazahua listos para activar. |
| Estilos | CSS plano (sin librerías) | Máxima velocidad, sin dependencias. |

## 📋 Requisitos previos para el desarrollo
- Node.js 18+ y npm 9+
- Cuenta de Firebase (plan Spark gratuito)
- Firebase CLI (`npm install -g firebase-tools`)
- Git (opcional)

## 🔐 Configuración de Firebase

### 1. Crear proyecto en Firebase Console
- Activar **Authentication** con proveedores:
  - Anónimo
  - Correo electrónico/contraseña
- Crear base de datos **Firestore** en modo producción (reglas actualizadas después).
- **No activar Storage** (se usan URLs públicas).

### 2. Variables de entorno
Crear archivo `.env` (o `.env.production`) con las credenciales de Firebase:
```
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
```
Nunca se incluyen en el repositorio (agregar al `.gitignore`).

### 3. Reglas de Firestore
```
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
    match /usuarios/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
Sustituir `UID_ADMIN` por el UID real del administrador creado en Authentication.

### 4. Estructura de datos en Firestore
```
puntos (colección)
  └─ {puntoId}
       ├─ orden: number
       ├─ nombre: { es: string }
       ├─ descripcionCorta: { es: string }
       ├─ imagenMiniatura: string (URL)
       ├─ audioURL: string (URL)
       ├─ duracion: number (segundos)
       ├─ trivia: {
       │    pregunta: { es: string },
       │    opciones: [ { texto: { es: string }, correcta: boolean } ]
       │  }
       ├─ insigniaURL: string (URL)
       └─ activo: boolean

usuarios (colección)
  └─ {uid}
       ├─ perfil: { pais, estado, municipio, rangoEdad }
       ├─ sellos: [ { puntoId, fecha, origen } ]
       └─ visitas (subcolección)
            └─ {puntoId}
                 ├─ fecha: Timestamp
                 ├─ selloObtenido: boolean
                 ├─ intentosTrivia: number
                 ├─ ultimoIntento: Timestamp
                 └─ origen: string ('qr' | 'sello' | 'desconocido')
```
Los puntos también pueden cargarse desde el archivo estático `src/data/puntos.ts` para máxima velocidad offline. El panel de administración escribe en Firestore, pero la PWA del turista puede leer de Firestore o del archivo local, según se configure.

### 5. Parámetros de Origen de Visita
- `?origen=qr`: Visitas iniciadas desde el escaneo de un código QR físico en un punto turístico.
- `?origen=sello`: Visitas iniciadas desde enlaces internos del pasaporte (ej. modal de sello o mapa).
- `desconocido`: Valor por defecto si no se especifica el parámetro.

## 📁 Estructura del proyecto
```
/
├── public/
│   ├── audio/               (archivos de audio)
│   ├── img/                 (imágenes de puntos e insignias)
│   ├── data/                (JSON de ubicaciones: países, estados, municipios)
│   ├── sw.js                (Service Worker manual)
│   ├── registerSW.js        (script de registro del SW)
│   ├── manifest.webmanifest (configuración de la PWA)
│   └── favicon.svg / iconos
├── src/
│   ├── components/          (componentes Svelte)
│   │   ├── AudioPlayer.svelte
│   │   ├── Trivia.svelte
│   │   ├── DataForm.svelte
│   │   ├── SelectoresUbicacion.svelte
│   │   ├── StampBadge.svelte
│   │   ├── StampCollection.svelte
│   │   ├── PerfilPage.svelte
│   │   └── admin/           (componentes del panel)
│   ├── data/
│   │   └── puntos.ts        (datos estáticos de los 8 puntos)
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── firestore-persistence.ts
│   │   ├── adminAuth.ts
│   │   └── stats.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── punto/[id].astro
│   │   ├── perfil.astro
│   │   └── admin/
│   │       ├── login.astro
│   │       ├── index.astro
│   │       └── puntos.astro
│   └── stores/
│       └── user.ts          (store Svelte: uid, perfil, sellos)
├── astro.config.mjs
├── firebase.json
├── package.json
└── .env
```

## 🔄 Flujo del usuario (turista)
1. Escanea QR físico → `/punto/{id}?origen=qr` (o accede desde el pasaporte con `?origen=sello`).
2. Inicio de sesión anónimo automático (sin interacción).
3. **Si el usuario ya tiene el sello de ese punto:**
   - Carga directamente en estado "Sello obtenido" sin obligar a escuchar el audio.
   - Opciones disponibles: "🎒 Ver mi pasaporte", "🎯 Ver trivia" (modo repaso) y "🎧 Escuchar audio".
   - En modo repaso, si ya acertó hoy se muestra la respuesta correcta bloqueada; si no, puede responder pero no genera sellos duplicados.
4. **Si el usuario aún no tiene el sello:**
   - Reproducción del audio con avance bloqueado.
   - Al terminar, se habilita trivia (1 pregunta, 4 opciones, 4 intentos diarios).
   - Al acertar:
     - Si es el primer sello → modal con aviso de privacidad y datos obligatorios (país, estado, municipio, edad).
     - Se guarda el sello en Firestore (offline si es necesario).
5. El pasaporte en `/` muestra todas las insignias (grises si no obtenidas, color si obtenidas).

## 🧩 Componentes Svelte importantes

### `AudioPlayer.svelte`
- Props: `audioURL`, `duracion`.
- Bloquea el avance rápido (barra de progreso no interactiva, evento `seeking` cancelado).
- Emite evento `ended` al finalizar.

### `Trivia.svelte`
- Props: `pregunta`, `opciones`, `puntoId`.
- 3 intentos por día (guardados en `localStorage`).
- Emite eventos `success` o `failed`.

### `SelectoresUbicacion.svelte`
- País: lista fija de países frecuentes + "Otro" con campo de texto.
- Si país = México → listas desplegables de estados y municipios (archivos JSON cacheados).
- Otro país → campos de texto para estado y ciudad.
- Emite evento `change` con `{ pais, estado, municipio }`.

### `DataForm.svelte`
- Modal que contiene `SelectoresUbicacion` y rango de edad.
- Checkbox de consentimiento de privacidad.
- Emite evento `save` con los datos del perfil.

### `PerfilPage.svelte`
- Vista/edición de los datos de perfil, con aviso de privacidad.

## 🛡️ Panel de administración
- **Ruta**: `/admin`
- **Login**: `/admin/login` (Firebase Auth email/password).
- **Verificación de administrador**: lista de UIDs en `src/lib/adminAuth.ts` (debe coincidir con las reglas de Firestore).
- **Dashboard**: estadísticas básicas (visitas totales, por punto, origen, edad).
- **Gestión de puntos**: `/admin/puntos` permite crear, editar y eliminar puntos.
  - El formulario solicita URLs de audio, imagen miniatura e insignia (sin subida de archivos).
  - Los archivos se alojan en `public/` o en un CDN externo.

## 📴 PWA y funcionamiento offline
- **Service Worker manual**: `public/sw.js` con lista de precache (`PRECACHE_URLS`) que incluye páginas, audio, imágenes y JSON de ubicaciones.
- **Registro**: `public/registerSW.js` cargado en `BaseLayout.astro`.
- **Firestore offline**: habilitado con `enableIndexedDbPersistence` (se llama en `BaseLayout.astro`).
- **Sin conexión**: los sellos y datos de perfil se guardan localmente y se sincronizan al reconectar.

## 🚀 Despliegue en Firebase Hosting
1. `firebase login`
2. `firebase init hosting` (directorio público: `dist`, SPA: No)
3. `npm run build`
4. `firebase deploy --only hosting`

El archivo `firebase.json` incluye un rewrite para SPA (opcional, pero no afecta a las rutas de la API de Firebase).

## 🧪 Comandos útiles
```bash
npm run dev            # desarrollo local
npm run build          # construcción para producción
npx serve dist         # servir la build localmente (prueba offline)
node generar-datos-mexico.mjs  # generar JSON de estados y municipios
```

## ❗ Solución de problemas comunes
| Error | Causa probable | Solución |
|-------|---------------|----------|
| `auth/configuration-not-found` | Proveedor anónimo no habilitado en Firebase Auth | Habilitar en consola Firebase |
| `[GetStaticPathsRequired]` en ruta dinámica de admin | Astro requiere `getStaticPaths()` o `prerender = false` | Cambiar a ruta con query string y componente Svelte (`/admin/puntos?edit=id`) |
| "No tienes permisos de administrador" al hacer login | Función `isAdmin()` en reglas de Firestore no reconoce el UID | Verificar que el UID esté en la lista de las reglas y en `adminAuth.ts` |
| Service Worker no se registra (404 en `sw.js`) | `vite-plugin-pwa` no compatible con Astro 7 | Usar Service Worker manual (`public/sw.js`) y registro explícito |
| Audio no se reproduce offline | Audio no incluido en precache | Añadir URL del audio en `PRECACHE_URLS` de `sw.js` |

## 🌟 Mejoras futuras (post‑MVP)
- Activar multi‑idioma (inglés, mazahua).
- Diploma descargable (canvas) y enlace público compartible.
- Dashboard de estadísticas con gráficos (Chart.js).
- Sincronización offline con `workbox-background-sync` para una cola explícita.
- Migrar a `FirestoreSettings.cache` cuando la API se estabilice.
- Generación automática de QR para cada punto.
```

Este documento concentra todo el conocimiento técnico y funcional necesario para que cualquier desarrollador (humano o agente) pueda mantener y hacer evolucionar el proyecto.