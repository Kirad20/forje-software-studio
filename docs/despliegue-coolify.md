# Desplegar Forja en Coolify

Forja se despliega como un recurso **Docker Compose** de Coolify a partir de este repositorio.
Coolify construye la imagen con el `Dockerfile`, guarda los datos en volúmenes, genera los
secretos y pone el dominio y el HTTPS con su proxy (Traefik).

## Qué se despliega

| Pieza | Dónde |
|---|---|
| Studio, API y MCP | contenedor `forja`, puerto interno 4100 |
| Turnos del constructor, SSE y ejecución de tools | contenedor interno `builder`, puerto 4300 |
| Apps publicadas, vistas previas, WebSocket y propietario de PGlite | contenedor `app-runtime`, puerto 4200 |
| Base de datos de la plataforma: cuentas, proyectos, configuración, modelos | servicio `postgres`, volumen `forja-pg` (**respaldar**) |
| Bases de datos PGlite, archivos y versiones publicadas | volumen compartido `forja-data` → `/app/data` (**respaldar**); solo `app-runtime` abre las bases |
| Caché de paquetes npm de las apps | volumen `forja-deps` (desechable) |

No escales estos servicios ni actives «rolling updates» con solapamiento: `app-runtime` debe ser el
único propietario de las bases PGlite y el estado de concurrencia del constructor vive en `builder`.
Los procesos se comunican por APIs internas autenticadas, dentro de la red privada de Compose.

## Requisitos

1. Un servidor con Coolify v4 y el proxy **Traefik** (el que trae por defecto). Mínimo 2 GB de
   RAM; 4 GB si usarás `browser_test` o los evals (cada uno lanza un Chromium).
2. Un dominio para el studio, por ejemplo `forja.tudominio.com`.
3. DNS, ambos apuntando a la IP del servidor:
   - `forja.tudominio.com` (registro A)
   - `*.forja.tudominio.com` (registro A comodín): las apps publicadas viven en
     `<slug>.forja.tudominio.com` y las vistas previas en `pv-<id>.forja.tudominio.com`.
4. Una clave de al menos un proveedor de modelos (Anthropic, OpenRouter u OpenAI-compatible). Se
   pone en el studio tras el primer acceso, no en variables de entorno.

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
2. Coolify lee el compose y muestra `forja`, `builder`, `app-runtime` y `postgres`. En **Domains** del servicio
   `forja` pon `https://forja.tudominio.com:4100`. El sufijo `:4100` es el puerto interno del
   contenedor: le dice al proxy a dónde enrutar, y el navegador sigue entrando por el 443 sin
   puerto. Sin dominio en `forja`, Coolify no genera las reglas del proxy y el sitio responde
   503 «Site not available» aunque el contenedor esté sano. `postgres` no lleva dominio.
3. **Environment Variables**. Coolify ya habrá generado y guardado:
   - `SERVICE_URL_FORJA_4100` → la URL del dominio de `forja` (se usa como `PUBLIC_URL`). El compose
     la declara con el valor especial `/`; Coolify lo reemplaza por la URL generada a partir de
     **Domains**. No la edites ni copies el `/` a otra variable.
   - `SERVICE_HEX_64_SECRETSKEY` → la clave que cifra los secretos de los proyectos.
     **Cópiala a tu gestor de contraseñas**: si se pierde, los secretos guardados no se pueden
     descifrar. No la cambies nunca después del primer arranque.
   - `SERVICE_PASSWORD_BOOTSTRAP` → token para crear la primera cuenta de administrador.
   - `SERVICE_PASSWORD_POSTGRES` → contraseña del servicio `postgres` (la usa `DATABASE_URL`).
   - `SERVICE_PASSWORD_APP_DATA` → token aleatorio para las APIs internas de datos/runtime.
   - `SERVICE_PASSWORD_BUILDER` → token aleatorio para el API interno del constructor.

   Rellena tú (Coolify las guarda cifradas; no las pegues en chats ni en el repo):

   | Variable | Valor |
   |---|---|
   | `FORJA_DOMAIN` | `forja.tudominio.com` (el host del studio, sin `https://` ni puerto) **obligatoria**: de ella salen las URLs de las apps y vistas previas |
   | `PUBLIC_URL` | opcional: déjala vacía. Forja usa `SERVICE_URL_FORJA_4100`, `COOLIFY_URL` o, si Coolify no las define, `https://FORJA_DOMAIN`. El log de arranque dice cuál quedó (`plataforma en …`) |

   Para los dos tokens internos, usa valores largos y aleatorios; no los reutilices. Nada más:
   proveedores y modelos, registro de cuentas, SMTP, GitHub, Langfuse, evals… se
   configuran en el studio (**Administración**) y se guardan en Postgres, con los secretos cifrados
   con `SERVICE_HEX_64_SECRETSKEY`. Las variables antiguas (`ANTHROPIC_API_KEY`, `SMTP_URL`,
   `FORJA_SIGNUP`…) ya no se leen; si siguen puestas, el log lo avisa al arrancar.
4. **Deploy**. La primera construcción tarda unos minutos (instala Chromium). Los healthchecks
   (`/healthz`) esperan a Postgres y a `app-runtime` antes de iniciar `forja` y `builder`.

## 3. Primer acceso

1. Abre `https://forja.tudominio.com`. Pide el token de instalación.
2. Cópialo de **Environment Variables → `SERVICE_PASSWORD_BOOTSTRAP`** (también sale en los
   **Logs** del servicio). Crea el administrador con tu correo y una contraseña fuerte.
3. Desde ese momento el token deja de servir.
4. **Administración → Proveedores**: activa al menos un proveedor, pon su clave y pulsa «Probar
   conexión».
5. **Administración → General**: elige quién puede crear cuenta (con «Abierto» hace falta SMTP
   para que lleguen los códigos; si no, usa «Solo invitados»), y configura SMTP, GitHub, Langfuse o
   los evals si los usas. Luego invita al resto.

## 4. Comprobaciones

- El log de `forja` dice `plataforma en https://forja.tudominio.com`. Si dice `http://localhost:4100`,
  revisa que `SERVICE_URL_FORJA_4100` tenga la URL resuelta (no `/`), que `FORJA_DOMAIN` tenga el
  host y que `PUBLIC_URL` esté vacía; después vuelve a desplegar. En producción Forja ignora un
  `PUBLIC_URL=http://localhost:4100` si Coolify o `FORJA_DOMAIN` ofrecen una dirección pública.
- `https://forja.tudominio.com/healthz` → `{"ok":true}`. Una página «Site not available» o
  «No available server» es del proxy, no de Forja: el servicio `forja` no tiene dominio, le falta
  el `:4100` o no está sano (Coolify lo marca *unhealthy* si `/healthz` falla).
- Publica una app de prueba y ábrela en `https://<slug>.forja.tudominio.com` con candado válido.
- La vista previa dentro del studio carga (si no, revisa el certificado comodín).

## Operación

- **Actualizar**: push a `main` y **Redeploy** (o activa el webhook de despliegue automático de
  Coolify). Coolify para el contenedor viejo (SIGTERM, 30 s de gracia para que PGlite cierre) y
  arranca el nuevo sobre el mismo volumen. Las migraciones de la base de la plataforma se aplican
  solas al arrancar.
- **Respaldos**: el estado son dos piezas. La base de la plataforma:

  ```sh
  docker exec <contenedor-postgres> pg_dump -U forja forja | gzip > forja-pg-$(date +%F).sql.gz
  ```

  Y el volumen `forja-data` (bases de las apps y archivos). Coolify no respalda volúmenes de
  servicios Compose por sí solo; con el servicio parado (o en una ventana tranquila):

  ```sh
  docker run --rm -v <volumen-forja-data>:/data -v "$PWD":/backup alpine \
    tar czf /backup/forja-data-$(date +%F).tgz -C /data .
  ```

  El nombre real del volumen lo ves en **Persistent Storage** (Coolify le antepone un id).
  Guarda también `SERVICE_HEX_64_SECRETSKEY` aparte: el respaldo sin la clave no descifra los
  secretos de los proyectos ni las claves de la configuración.
- **Logs**: pestaña **Logs** del servicio.

## Notas de diseño

- **Detrás de Traefik**: `FORJA_TRUST_PROXY=1` hace que los límites de intentos (login, códigos,
  setup) cuenten por IP real del cliente (`X-Forwarded-For`) y no por la del proxy. Si pones
  Cloudflare con proxy delante de Coolify, súbelo a `2`.
- **Postgres y PGlite**: la plataforma vive en Postgres (servicio `postgres`). `app-runtime` es
  dueño exclusivo de las bases PGlite por proyecto; `forja` y `builder` usan su API interna. Los
  tres procesos comparten el volumen de archivos y la configuración de plataforma.
- **¿Langfuse autoalojado en este compose?** No. Langfuse v3 necesita Postgres, ClickHouse, Redis
  y almacenamiento S3 (varios GB de RAM). Usa Langfuse Cloud o despliégalo como recurso aparte con
  la plantilla de Coolify y pon su URL en Administración → General → Observabilidad.
- **Sin Chromium**: variable `FORJA_BROWSER=0` antes de construir. Imagen ~300 MB menor;
  `browser_test` y los evals visuales quedan desactivados.

## Local, sin Coolify

```sh
cp .env.example .env    # rellena SERVICE_HEX_64_SECRETSKEY (openssl rand -hex 32) y SERVICE_PASSWORD_POSTGRES
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Studio en <http://localhost:4100>; apps en `http://<slug>.localhost:4100`.
