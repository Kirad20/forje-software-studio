# Desplegar Forja en Coolify

Forja se despliega como un recurso **Docker Compose** de Coolify a partir de este repositorio.
Coolify construye la imagen con el `Dockerfile`, guarda los datos en volúmenes, genera los
secretos y pone el dominio y el HTTPS con su proxy (Traefik).

## Qué se despliega

| Pieza | Dónde |
|---|---|
| Studio, API, MCP, apps publicadas y vistas previas | un solo contenedor `forja`, puerto interno 4100 |
| Base de datos de la plataforma: cuentas, proyectos, configuración, modelos | servicio `postgres`, volumen `forja-pg` (**respaldar**) |
| Bases de datos de las apps (PGlite embebido), archivos, versiones publicadas | volumen `forja-data` → `/app/data` (**respaldar**) |
| Caché de paquetes npm de las apps | volumen `forja-deps` (desechable) |

Una sola réplica de `forja`. Las bases de las apps son PGlite embebido sobre el volumen: dos
procesos escribiendo la misma carpeta la corromperían. No actives réplicas ni «rolling updates» con solapamiento.

## Requisitos

1. Un servidor con Coolify v4 y el proxy **Traefik** (el que trae por defecto). Mínimo 2 GB de
   RAM; 4 GB si usarás `browser_test` o los evals (cada uno lanza un Chromium).
2. Un dominio para el studio, por ejemplo `forja.tudominio.com`.
3. DNS en un proveedor con API compatible con el DNS challenge de Traefik (Cloudflare es la
   opción recomendada), con ambos registros apuntando a la IP del servidor:
   - `forja.tudominio.com` (registro A)
   - `*.forja.tudominio.com` (registro A comodín): las apps publicadas viven en
     `<slug>.forja.tudominio.com` y las vistas previas en `pv-<id>.forja.tudominio.com`.
4. Una clave de al menos un proveedor de modelos (Anthropic, OpenRouter u OpenAI-compatible). Se
   pone en el studio tras el primer acceso, no en variables de entorno.

## 1. DNS y certificado comodín (una vez por servidor)

Let's Encrypt solo emite `*.forja.tudominio.com` con el **DNS challenge**: el HTTP challenge no
sirve para comodines. Sin este paso el studio puede funcionar con HTTPS, pero las apps publicadas
y las vistas previas no tendrán un certificado válido.

### Cloudflare DNS

El dominio puede seguir registrado y el servidor alojado en otro proveedor; solo los nameservers
deben delegarse a Cloudflare:

1. Añade el dominio raíz (`tudominio.com`) a Cloudflare y copia todos los registros vigentes antes
   de cambiar los nameservers. Conserva especialmente los registros MX, SPF, DKIM y DMARC si hay
   correo. No copies los NS ni el SOA del proveedor anterior.
2. En el registrador, sustituye los nameservers anteriores por los dos que asigne Cloudflare. Si
   DNSSEC está activo, desactívalo antes del cambio y vuelve a activarlo en Cloudflare después.
3. Crea estos registros con **Proxy status: DNS only** (nube gris):

   ```text
   A  forja     IP_PUBLICA_DEL_SERVIDOR
   A  *.forja   IP_PUBLICA_DEL_SERVIDOR
   ```

   El proxy gratuito de Cloudflare no presenta por defecto un certificado para nombres de segundo
   nivel como `<slug>.forja.tudominio.com`; mantenlos en DNS only salvo que hayas contratado y
   configurado esa cobertura en Cloudflare.
4. Crea un API Token limitado a la zona, con `Zone / DNS / Edit` y `Zone / Zone / Read`. No uses la
   Global API Key.

### DNS challenge de Traefik

1. En Coolify abre **Servers → tu servidor → Proxy → Configuration**. Edita la configuración en la
   interfaz: Coolify puede sobrescribir cambios hechos directamente en
   `/data/coolify/proxy/docker-compose.yml`.
2. Dentro del servicio `traefik`, añade el token restringido:

   ```yaml
   environment:
     - CF_DNS_API_TOKEN=TOKEN_RESTRINGIDO
   ```

3. Elimina las dos opciones `httpchallenge` del resolver `letsencrypt` y añade:

   ```yaml
   command:
     # Conserva las demás opciones existentes.
     - '--certificatesresolvers.letsencrypt.acme.dnschallenge.provider=cloudflare'
     - '--certificatesresolvers.letsencrypt.acme.dnschallenge.delaybeforecheck=30'
     - '--certificatesresolvers.letsencrypt.acme.storage=/traefik/acme.json'
   ```

4. Guarda y pulsa **Restart Proxy**. Nunca pegues el token ni una salida completa de la
   configuración del proxy en incidencias o chats: puede aparecer en texto plano.

### Certificado y ruta de los subdominios

En **Proxy → Dynamic Configurations**, crea `wildcard-forja.yaml` (cambia el dominio):

   ```yaml
   http:
     routers:
       wildcard-forja:
         rule: 'HostRegexp(`^[a-z0-9-]+\.forja\.tudominio\.com$`)'
         entryPoints: [https]
         priority: 1
         service: forja-runtime
         tls:
           certResolver: letsencrypt
           domains:
             - main: forja.tudominio.com
               sans: ['*.forja.tudominio.com']
     services:
       forja-runtime:
         loadBalancer:
           servers:
             - url: http://forja:4100
   ```

Este router solicita el certificado y enruta los subdominios directamente al alias Docker estable
`forja` en el puerto 4100. Se usa esta ruta explícita porque algunas versiones de Coolify conservan
`${FORJA_DOMAIN:-forja.localhost}` como texto literal dentro de las etiquetas Compose; en ese caso
el router `forja-apps@docker` nunca coincide con el dominio real. `letsencrypt` debe coincidir con
el nombre del resolver configurado en el proxy.

Comprueba la conectividad desde el proxy:

```sh
docker exec coolify-proxy wget -qO- http://forja:4100/healthz
```

Debe responder `{"ok":true}`. Traefik crea temporalmente el TXT
`_acme-challenge.forja.tudominio.com`, emite un certificado con el dominio principal y el wildcard,
y elimina el TXT. Después de la primera emisión puede no haber nuevos mensajes ACME hasta la
renovación.

## 2. Crear el recurso

1. **Projects → (tu proyecto) → + New → Docker Compose** (o «Public/Private Repository» con build
   pack **Docker Compose**). Repositorio `Kirad20/forje-software-studio`, rama `main`, archivo
   `/docker-compose.yml`. Para un repositorio privado usa la GitHub App de Coolify.
2. Coolify lee el compose y muestra los servicios `forja` y `postgres`. En **Domains** del servicio
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

   Rellena tú (Coolify las guarda cifradas; no las pegues en chats ni en el repo):

   | Variable | Valor |
   |---|---|
   | `FORJA_DOMAIN` | `forja.tudominio.com` (el host del studio, sin `https://` ni puerto) **obligatoria**: de ella salen las URLs de las apps y vistas previas |
   | `PUBLIC_URL` | opcional: déjala vacía. Forja usa `SERVICE_URL_FORJA_4100`, `COOLIFY_URL` o, si Coolify no las define, `https://FORJA_DOMAIN`. El log de arranque dice cuál quedó (`plataforma en …`) |

   Nada más: proveedores y modelos, registro de cuentas, SMTP, GitHub, Langfuse, evals… se
   configuran en el studio (**Administración**) y se guardan en Postgres, con los secretos cifrados
   con `SERVICE_HEX_64_SECRETSKEY`. Las variables antiguas (`ANTHROPIC_API_KEY`, `SMTP_URL`,
   `FORJA_SIGNUP`…) ya no se leen; si siguen puestas, el log lo avisa al arrancar.
4. **Deploy**. La primera construcción tarda unos minutos (instala Chromium). El healthcheck
   (`/healthz`) marca el servicio como sano a los ~30 s del arranque.

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
  «No available server» es del proxy, no de Forja: comprueba el dominio y el puerto 4100 del
  servicio, que `forja` esté sano y que el `wget` desde `coolify-proxy` funcione. Si la etiqueta
  `traefik.http.routers.forja-apps.rule` contiene literalmente `${FORJA_DOMAIN...}`, conserva la
  ruta `forja-runtime` de la configuración dinámica anterior.
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
  setup) cuenten por IP real del cliente (`X-Forwarded-For`) y no por la del proxy. Cloudflare en
  modo DNS only no añade otro proxy; usa `2` únicamente si activas la nube naranja delante de
  Coolify y tienes cobertura TLS para los subdominios de segundo nivel.
- **Postgres y PGlite**: la plataforma vive en Postgres (servicio `postgres`). Las apps siguen
  con una base PGlite por proyecto que se duerme cuando no se usa; llevarlas a Postgres es otro
  cambio de código (esquemas por proyecto, límites), y tendrá sentido cuando haga falta más de una
  réplica.
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
