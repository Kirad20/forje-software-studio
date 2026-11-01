# Desplegar Forja en Coolify

Forja se despliega como un recurso **Docker Compose** de Coolify a partir de este repositorio.
Coolify construye la imagen con el `Dockerfile`, guarda los datos en volúmenes, genera los
secretos y pone el dominio y el HTTPS con su proxy (Traefik).

## Qué se despliega

| Pieza | Dónde |
|---|---|
| Studio, API, MCP, apps publicadas y vistas previas | un solo contenedor `forja`, puerto interno 4100 |
| Bases de datos (PGlite embebido), archivos, versiones publicadas | volumen `forja-data` → `/app/data` (**respaldar**) |
| Caché de paquetes npm de las apps | volumen `forja-deps` (desechable) |

Una sola réplica. PGlite es una base embebida sobre el volumen: dos procesos escribiendo la
misma carpeta la corromperían. No actives réplicas ni «rolling updates» con solapamiento.

## Requisitos

1. Un servidor con Coolify v4 y el proxy **Traefik** (el que trae por defecto). Mínimo 2 GB de
   RAM; 4 GB si usarás `browser_test` o los evals (cada uno lanza un Chromium).
2. Un dominio para el studio, por ejemplo `forja.tudominio.com`.
3. DNS, ambos apuntando a la IP del servidor:
   - `forja.tudominio.com` (registro A)
   - `*.forja.tudominio.com` (registro A comodín): las apps publicadas viven en
     `<slug>.forja.tudominio.com` y las vistas previas en `pv-<id>.forja.tudominio.com`.
4. Una clave de al menos un proveedor de modelos (Anthropic, OpenRouter u OpenAI-compatible).

## 1. Certificado comodín (una vez por servidor)

Let's Encrypt solo emite `*.forja.tudominio.com` con el **DNS challenge**: el HTTP challenge
no sirve para comodines. Sin este paso el studio funciona con HTTPS, pero las apps publicadas y
las vistas previas muestran un certificado inválido (y las vistas previas no cargan dentro del
studio, porque su cookie exige `Secure`).

1. En Coolify: **Servers → tu servidor → Proxy**. Configura el DNS challenge de Traefik con tu
   proveedor DNS (Cloudflare, Route 53, etc.) según
   <https://coolify.io/docs/core/networking/proxy/traefik/dns-challenge>. Las credenciales del
   proveedor DNS van ahí, en el servidor, no en Forja.
2. **Proxy → Dynamic Configurations**, crea `wildcard-forja.yaml` (cambia el dominio):

   ```yaml
   http:
     routers:
       wildcard-forja:
         rule: 'HostRegexp(`^[a-z0-9-]+\.forja\.tudominio\.com$`)'
         entryPoints: [https]
         priority: 1
         service: wildcard-placeholder
         tls:
           certResolver: letsencrypt
           domains:
             - main: forja.tudominio.com
               sans: ['*.forja.tudominio.com']
     services:
       wildcard-placeholder:
         loadBalancer:
           servers: []
   ```

   Este router solo sirve para pedir el certificado; el tráfico de los subdominios lo enruta el
   propio `docker-compose.yml` (etiquetas `forja-apps`), y Traefik le aplica el certificado que
   tiene guardado. `letsencrypt` es el nombre del resolver por defecto de Coolify.
3. Mira **Proxy → Logs** hasta que la petición ACME salga bien.

## 2. Crear el recurso

1. **Projects → (tu proyecto) → + New → Docker Compose** (o «Public/Private Repository» con build
   pack **Docker Compose**). Repositorio `Kirad20/forje-software-studio`, rama `main`, archivo
   `/docker-compose.yml`. Para un repositorio privado usa la GitHub App de Coolify.
2. Coolify lee el compose y muestra el servicio `forja`. En su **Domains** pon
   `https://forja.tudominio.com` (sin puerto: Coolify ya sabe que es el 4100 por
   `SERVICE_URL_FORJA_4100`).
3. **Environment Variables**. Coolify ya habrá generado y guardado:
   - `SERVICE_URL_FORJA_4100` → la URL del dominio (se usa como `PUBLIC_URL`).
   - `SERVICE_HEX_64_SECRETSKEY` → la clave que cifra los secretos de los proyectos.
     **Cópiala a tu gestor de contraseñas**: si se pierde, los secretos guardados no se pueden
     descifrar. No la cambies nunca después del primer arranque.
   - `SERVICE_PASSWORD_BOOTSTRAP` → token para crear la primera cuenta de administrador.

   Rellena tú (Coolify las guarda cifradas; no las pegues en chats ni en el repo):

   | Variable | Valor |
   |---|---|
   | `FORJA_DOMAIN` | `forja.tudominio.com` (el host del studio, sin `https://`) **obligatoria** |
   | `ANTHROPIC_API_KEY` y/o `OPENROUTER_API_KEY` / `OPENAI_*` | al menos un proveedor |
   | `FORJA_SIGNUP` | `invite` por defecto. `open` solo con `SMTP_URL` configurado |
   | `SMTP_URL`, `EMAIL_FROM` | para enviar códigos de acceso e invitaciones |
   | `LANGFUSE_*` | opcional, trazas de agentes |
   | `FORJA_EVALS=1` | opcional, solo si quieres evals (gastan crédito real) |
   | `GITHUB_*` | opcional, OAuth App y webhook (callback `https://forja.tudominio.com/api/github/oauth/callback`) |

   El resto tiene valores por defecto razonables (ver `.env.example`).
4. **Deploy**. La primera construcción tarda unos minutos (instala Chromium). El healthcheck
   (`/healthz`) marca el servicio como sano a los ~30 s del arranque.

## 3. Primer acceso

1. Abre `https://forja.tudominio.com`. Pide el token de instalación.
2. Cópialo de **Environment Variables → `SERVICE_PASSWORD_BOOTSTRAP`** (también sale en los
   **Logs** del servicio). Crea el administrador con tu correo y una contraseña fuerte.
3. Desde ese momento el token deja de servir. Invita al resto desde el studio.

## 4. Comprobaciones

- `https://forja.tudominio.com/healthz` → `{"ok":true}`.
- Publica una app de prueba y ábrela en `https://<slug>.forja.tudominio.com` con candado válido.
- La vista previa dentro del studio carga (si no, revisa el certificado comodín).

## Operación

- **Actualizar**: push a `main` y **Redeploy** (o activa el webhook de despliegue automático de
  Coolify). Coolify para el contenedor viejo (SIGTERM, 30 s de gracia para que PGlite cierre) y
  arranca el nuevo sobre el mismo volumen.
- **Respaldos**: el volumen `forja-data` es todo el estado. Coolify no respalda volúmenes de
  servicios Compose por sí solo; con el servicio parado (o en una ventana tranquila):

  ```sh
  docker run --rm -v <volumen-forja-data>:/data -v "$PWD":/backup alpine \
    tar czf /backup/forja-data-$(date +%F).tgz -C /data .
  ```

  El nombre real del volumen lo ves en **Persistent Storage** (Coolify le antepone un id).
  Guarda también `SERVICE_HEX_64_SECRETSKEY` aparte: el respaldo sin la clave no descifra los
  secretos de los proyectos.
- **Logs**: pestaña **Logs** del servicio.

## Notas de diseño

- **Detrás de Traefik**: `FORJA_TRUST_PROXY=1` hace que los límites de intentos (login, códigos,
  setup) cuenten por IP real del cliente (`X-Forwarded-For`) y no por la del proxy. Si pones
  Cloudflare con proxy delante de Coolify, súbelo a `2`.
- **¿Postgres en vez de PGlite?** No por ahora. Forja abre una base PGlite por proyecto y la
  duerme cuando no se usa; pasar a Postgres es un cambio de código (pool, esquemas por proyecto,
  migraciones), no de despliegue. Tiene sentido cuando haga falta más de una réplica o alta
  disponibilidad.
- **¿Langfuse autoalojado en este compose?** No. Langfuse v3 necesita Postgres, ClickHouse, Redis
  y almacenamiento S3 (varios GB de RAM). Usa Langfuse Cloud o despliégalo como recurso aparte con
  la plantilla de Coolify y apunta `LANGFUSE_BASE_URL` a él.
- **Sin Chromium**: variable `FORJA_BROWSER=0` antes de construir. Imagen ~300 MB menor;
  `browser_test` y los evals visuales quedan desactivados.

## Local, sin Coolify

```sh
cp .env.example .env    # rellena SERVICE_HEX_64_SECRETSKEY (openssl rand -hex 32) y una clave de modelo
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Studio en <http://localhost:4100>; apps en `http://<slug>.localhost:4100`.
