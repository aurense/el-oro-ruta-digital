# 🏔️ Pasaporte El Oro

[![Astro](https://img.shields.io/badge/Astro-5.0-FF5D01?logo=astro)](https://astro.build)
[![Svelte](https://img.shields.io/badge/Svelte-4.0-FF3E00?logo=svelte)](https://svelte.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Spark%20(Free)-FFCA28?logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

**Pasaporte turístico digital inmersivo** para el Pueblo Mágico Minero de El Oro, Estado de México.  
Escanea códigos QR, escucha historias, responde trivias y colecciona sellos, todo sin conexión a internet.

---

## ✨ Características principales

- 📱 **PWA offline‑first** – Funciona completa sin internet después de la primera visita.
- 🎧 **Narraciones en audio** – Reproducción inmersiva con avance bloqueado para garantizar la escucha completa.
- 🧠 **Trivias desbloqueables** – Al terminar cada audio se habilita una trivia; al acertar ganas un sello digital.
- 📊 **Estadísticas anónimas** – Recolecta origen (país, estado, municipio) y rango de edad del visitante con fines turísticos.
- 🛡️ **Panel de administración** – Crea, edita y elimina puntos turísticos, y visualiza estadísticas de visitas.
- 🌐 **Preparado para multi‑idioma** – Español, inglés y mazahua (inglés y mazahua pendientes de activar).
- 💯 **Plan gratuito de Firebase** – Firestore, Authentication y Hosting en capa Spark, sin costos adicionales.

---

## 🚀 Tecnologías

| Capa | Tecnología |
|------|------------|
| Framework | [Astro](https://astro.build) (modo estático) |
| Componentes | [Svelte](https://svelte.dev) (islas interactivas) |
| Backend | [Firebase](https://firebase.google.com) (Auth, Firestore) |
| Almacenamiento | URLs públicas en `public/` (sin Storage) |
| PWA | Service Worker manual con Workbox |

---

## 📋 Requisitos previos

- Node.js 18+ y npm 9+
- Proyecto en [Firebase Console](https://console.firebase.google.com) con:
  - Authentication (Anónimo y Email/Password habilitados)
  - Firestore creado (reglas más abajo)
- Firebase CLI (`npm install -g firebase-tools`)

---

## ⚙️ Configuración

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repo>
   cd pasaporte-eloro
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Crea el archivo `.env`** con las credenciales de tu proyecto Firebase:
   ```
   PUBLIC_FIREBASE_API_KEY=...
   PUBLIC_FIREBASE_AUTH_DOMAIN=...
   PUBLIC_FIREBASE_PROJECT_ID=...
   PUBLIC_FIREBASE_STORAGE_BUCKET=...
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   PUBLIC_FIREBASE_APP_ID=...
   ```

4. **Reglas de Firestore** – Copia las siguientes reglas en la consola de Firebase (Firestore → Reglas):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAdmin() {
         return request.auth != null && request.auth.uid in ['UID_DEL_ADMIN'];
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
   Sustituye `UID_DEL_ADMIN` por el UID del usuario administrador (creado en Authentication → Users).

5. **Administrador local** – En `src/lib/adminAuth.ts`, añade el mismo UID en el array `ADMIN_UIDS`:
   ```ts
   const ADMIN_UIDS = ['UID_DEL_ADMIN'];
   ```

---

## 🖥️ Desarrollo local

```bash
npm run dev        # Inicia el servidor de desarrollo (localhost:4321)
```

La PWA no se instala en modo desarrollo. Para probar el funcionamiento offline, genera la build y sírvela localmente:

```bash
npm run build
npx serve dist
```

---

## 📁 Estructura de carpetas

```
/
├── public/               # Archivos estáticos (audio, imágenes, JSON)
│   ├── sw.js             # Service Worker manual
│   └── registerSW.js     # Registro del SW
├── src/
│   ├── components/       # Componentes Svelte (AudioPlayer, Trivia, …)
│   ├── data/             # Datos estáticos de los puntos (puntos.ts)
│   ├── layouts/          # Layouts de Astro (BaseLayout, AdminLayout)
│   ├── lib/              # Lógica de Firebase, autenticación, DB, estadísticas
│   ├── pages/            # Páginas de Astro (index, punto/[id], perfil, admin)
│   └── stores/           # Store Svelte para el usuario
├── astro.config.mjs      # Configuración de Astro
├── firebase.json         # Configuración de Firebase Hosting
└── package.json
```

---

## 🚢 Despliegue en Firebase Hosting

1. **Inicia sesión en Firebase**
   ```bash
   firebase login
   ```

2. **Inicializa Hosting** (si no lo has hecho)
   ```bash
   firebase init hosting
   ```
   - Directorio público: `dist`
   - ¿Single-page app?: `No`

3. **Construye y despliega**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🔐 Panel de administración

Accede a `/admin/login` e inicia sesión con el email y contraseña del usuario administrador.  
Podrás:

- Ver estadísticas de visitas, origen y edad.
- Crear, editar y eliminar puntos turísticos.

Los archivos multimedia (audio, imágenes) deben alojarse en `public/` y referenciarse con URLs relativas (ej. `/audio/mi-audio.mp3`) o en un CDN externo.

---

## 🤝 Contribuir

¡Toda colaboración es bienvenida!  
Revisa el archivo [agents.md](./agents.md) para una guía completa del proyecto.  
Por favor, sigue las buenas prácticas del stack y mantén el enfoque offline‑first.

---

## 📄 Licencia

MIT © Fundación Aurense – El Oro, Estado de México.
