# Contexto del Proyecto: SeL Web Pro

Este archivo contiene reglas y decisiones importantes para que la Inteligencia Artificial tenga el contexto necesario al iniciar un nuevo chat o tarea en este proyecto.

*Nota para la IA: Lee siempre este archivo antes de realizar cambios estructurales o proponer comandos de Git.*

---

## 1. Repositorio y Flujo de Git

- **Rama principal (producción):** `main` — es la rama de deploy en Vercel. Todo lo que esté aquí está en vivo.
- **No existe** la rama `master`.
- **Rama intermediaria opcional:** `dev` — se usa solo si es necesario como buffer antes de mergear a `main`.
- **Flujo de trabajo:** Para cada feature nueva se crea una rama específica (ej: `feature/biometric-login`). Una vez lista y probada, se mergea a `main`.
- **Nunca hacer cambios directos a `main`** sin haber pasado por una rama de feature.

## 2. Infraestructura

- **Hosting / Deploy:** Vercel (vinculado a la rama `main`)
- **Base de datos:** PostgreSQL serverless en **Neon** (región AWS `sa-east-1`)
- **Almacenamiento de archivos:** Cloudflare R2 (bucket: `sel-boveda`) — PDFs y audios via API compatible S3
- **CDN de imágenes:** Cloudinary (cloud: `dcwkpo1j1`)
- **Email:** Nodemailer via Gmail SMTP (`info@sanacionenluz.com`)

## 3. Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, JSX, ESM) |
| UI Library | React 19 |
| Estilos | Tailwind CSS v4 |
| ORM | Prisma 7 con `@prisma/adapter-pg` (driver adapter, `pg.Pool`) |
| Auth | NextAuth v4 — Credentials (email+pass), Google OAuth, WebAuthn/Passkeys (`@simplewebauthn`) |
| Hashing | `bcryptjs` |
| Almacenamiento | Cloudflare R2 via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` |
| Imágenes | Cloudinary (`cloudinary` npm) |
| Email | Nodemailer |
| Íconos | Lucide React |
| PDF Viewer | `react-pdf` |
| Crop imágenes | `react-easy-crop` |
| Contenido | Markdown via `remark` + `remark-html`, frontmatter via `gray-matter` |
| Integraciones | YouTube API, WhatsApp API, WordPress API |

## 4. Tono y Comunicación

- El estilo de los textos de la web es **elegante, holístico, cercano y centrado en el bienestar**.
- Tratamos al usuario de **"vos"** (español rioplatense — Argentina).
- Nunca usar "tú" ni "usted" para dirigirse al usuario.
- El nombre del sitio es **Sanación en Luz**.

## 5. Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # olvide-contrasena, reset-password
│   ├── admin/           # Panel de administración
│   ├── api/
│   │   ├── auth/        # nextauth, register, verify, forgot/reset-password, webauthn/
│   │   ├── admin/
│   │   ├── progress/
│   │   ├── resources/
│   │   ├── user/profile/
│   │   └── videos/
│   ├── dashboard/       # perfil, talleres
│   ├── login/
│   ├── registro/
│   └── ...páginas públicas
├── components/          # 21 componentes React
└── lib/
    ├── auth.js          # authOptions (NextAuth config)
    ├── db.js            # Prisma client singleton
    ├── email.js         # Nodemailer helper
    └── s3.js            # Cloudflare R2 helper
prisma/
└── schema.prisma        # Modelos: User, Authenticator, Course, Module, Lesson, Resource, Progress, etc.
```

## 6. Auth — Detalles importantes

- Sesión via **JWT** (`strategy: 'jwt'`)
- El callback de sesión **re-consulta la DB en cada request** para tener rol/perfil siempre actualizado
- El modelo `User` tiene `currentChallenge` para el flujo WebAuthn
- El modelo `Authenticator` almacena las passkeys por usuario
- Registro requiere **verificación de email** antes de poder iniciar sesión

## 7. Variables de Entorno (servicios, sin secretos)

- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `DATABASE_URL` → Neon PostgreSQL
- `GOOGLE_CLIENT_ID/SECRET` → Google OAuth
- `SMTP_*` → Gmail SMTP
- `CLOUDINARY_*` → Cloudinary
- `R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET_NAME` → Cloudflare R2
- `NEXT_PUBLIC_YOUTUBE_API_KEY`
- `WHATSAPP_API_URL/TOKEN`

---
