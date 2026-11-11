# Backends en otros lenguajes (Java / Spring Boot)

Las apps generadas pueden tener el backend en Java con Spring Boot en lugar de (o además de) los
endpoints TypeScript. No usa Docker: el JDK y Maven vienen dentro de la imagen de Forja y cada
compilación y cada JVM corren aisladas con [bubblewrap](https://github.com/containers/bubblewrap).

## Cómo funciona

- **Detección.** Un `pom.xml` en la raíz que mencione `spring-boot` (parent, plugin o starter)
  activa el runtime. Gradle solo funciona si el binario
  `gradle` existe en el servidor (la imagen no lo trae).
- **Compilación.** `mvn -B -ntp package -DskipTests` en un sandbox que solo ve `/usr`, parte de
  `/etc`, el código Java del proyecto (`/work`) y su caché Maven (`/cache`). El resultado se
  identifica por el hash de `pom.xml` y `src/**`: cambiar páginas o componentes no recompila.
  Se guardan las 3 compilaciones más recientes por proyecto; las compilaciones son de una en una.
  Los errores de `javac` llegan a `check_build`, `get_problems` y al panel de problemas con
  archivo y línea.
- **Ejecución.** Una JVM por proyecto y entorno (vista previa / publicada), arrancada con la
  primera petición, con heap acotado (`FORJA_JAVA_MAX_HEAP_MB`), SerialGC, un procesador y C1
  solo en vista previa (arranque más rápido). Se detiene tras `FORJA_LANG_IDLE_MS` sin peticiones;
  como máximo `FORJA_LANG_MAX_PROCESSES` JVM a la vez (se cierra la menos usada). Al cambiar el
  código, la JVM nueva arranca antes de retirar la vieja, que termina sus peticiones en curso.
- **Rutas.** El navegador llama a `/_api/<ruta>`; si ningún endpoint TypeScript la atiende, Forja
  la reenvía a Spring como `/<ruta>`. Se quitan las cookies de Forja y se añaden:
  - `X-Forja-Proxy-Token`: secreto por proceso; la app **debe** rechazar peticiones sin él
    (cualquier proceso del host puede alcanzar el puerto de la JVM).
  - `X-Forja-User`: usuario con sesión, JSON en base64url (`id`, `email`, `name`, `role`).
  - `X-Forja-Env`: `preview` o `published`.
- **Datos.** Las bases por proyecto son PGlite embebido, así que no hay JDBC. La JVM recibe
  `FORJA_DATA_URL` y `FORJA_DATA_TOKEN`: `POST /query {sql, params}` → `{rows}` y
  `POST /exec {sql}` → `{ok}`. El token vale solo para ese proyecto y entorno y aplica las mismas
  reglas que `ctx.db` (solo datos; el esquema va en `migrations/*.sql`). Los secretos del proyecto
  llegan como variables de entorno.

El agente aprende todo esto con la skill `spring-boot`
(`server/modules/builder/infrastructure/skillLibrary.ts`).

## Configuración

| Variable | Por defecto | Qué hace |
| --- | --- | --- |
| `FORJA_LANG_SANDBOX` | `bwrap` | `bwrap` aísla con bubblewrap; `off` desactiva estos runtimes; `unsafe` corre sin aislamiento (**solo desarrollo local**). |
| `FORJA_JAVA_MAX_HEAP_MB` | `256` | `-Xmx` de cada JVM de app. |
| `FORJA_LANG_MAX_PROCESSES` | `4` | JVM vivas a la vez en el host. |
| `FORJA_LANG_IDLE_MS` | `300000` | Inactividad antes de detener una JVM. |
| `FORJA_LANG_BUILD_TIMEOUT_MS` | `600000` | Límite de una compilación. |

Los archivos viven en `DATA_DIR/runtimes/java/<hash del proyecto>/` (`builds/`, `cache/`) y se
borran con el proyecto. La caché Maven es por proyecto a propósito: compartida, un proyecto podría
envenenarla con un plugin o procesador de anotaciones para otro.

Memoria aproximada: `heap + ~150 MB` por JVM y ~600 MB durante una compilación. Con los valores
por defecto, reserva ~2 GB extra para el contenedor `app-runtime`. El resto de límites de memoria
(bases PGlite, sandboxes y heap de cada servicio) y cómo medirla están en [memory.md](memory.md).

## Imagen y despliegue

La imagen instala `openjdk-17-jdk-headless`, `maven` y `bubblewrap` (~350 MB). Para quitarlos,
construye con `--build-arg JAVA=0` (variable `FORJA_JAVA=0` en `docker-compose.yml`/Coolify); el
proyecto Spring mostrará entonces «Java no está instalado en este servidor».

bubblewrap crea *user/PID namespaces* sin privilegios y monta su propio `/proc`. Además de
seccomp y AppArmor, las rutas de sistema enmascaradas por Docker pueden bloquear ese montaje.
Por eso los servicios que compilan o ejecutan Java (`forja`, `app-runtime` y `builder`) llevan
en `docker-compose.yml` las tres opciones:

```yaml
security_opt:
  - seccomp=unconfined
  - apparmor=unconfined
  - systempaths=unconfined
```

Si el error concreto es `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`,
comprueba especialmente `systempaths=unconfined`: seccomp y AppArmor por sí solos no quitan las
máscaras de `/proc`. Esta opción retira las rutas enmascaradas y de solo lectura del contenedor
exterior; amplía su superficie de acceso al kernel, aunque bubblewrap conserva sus propios
namespaces, raíz mínima y entorno vacío. No añadas `privileged`, `SYS_ADMIN`, `pid: host` ni uses
`FORJA_LANG_SANDBOX=unsafe` como solución en producción.

Los cambios de `security_opt` requieren **recrear**, no solo reiniciar los contenedores:

```sh
docker compose up -d --force-recreate forja builder app-runtime
```

En Coolify, aplica esas opciones en el Compose del despliegue y vuelve a desplegar recreando los
servicios. Después ejecuta `check_build` otra vez. La comprobación de bubblewrap se guarda en
memoria durante la vida de cada proceso, por lo que también necesita ese reinicio.

Sin los permisos necesarios, `check_build` informa «bubblewrap no puede aislar procesos aquí» y
el backend Java no se ejecuta; el resto de Forja funciona igual. En Kubernetes, seccomp y
AppArmor deben permitir estos namespaces y la política del runtime también debe permitir el
montaje de `/proc` anidado; desactivar solo seccomp/AppArmor no garantiza esto. El host necesita
`kernel.unprivileged_userns_clone=1` (por defecto en Debian/Ubuntu recientes; en Ubuntu 24.04 con
`kernel.apparmor_restrict_unprivileged_userns=1` hay que permitirlo para el contenedor).

## Seguridad

- Sin acceso a `DATA_DIR`, al código de otros proyectos ni a las variables de la plataforma
  (`--clearenv`): solo `PATH`, `HOME=/tmp`, `LANG` y lo que Forja pasa explícitamente.
- PID, IPC, UTS y cgroup aislados; el proceso muere con Forja (`--die-with-parent`).
- La red **no** está aislada (igual que los endpoints TypeScript): la JVM puede salir a internet y
  Maven descarga dependencias de Maven Central. Por eso el filtro de `X-Forja-Proxy-Token` es
  obligatorio.
- El cuerpo de las peticiones se limita a 10 MB y cada petición a `maxRunMs`.

## Siguientes lenguajes

El diseño separa la parte pura (`domain/spring.ts`: detección, comando, parseo de errores) de la
orquestación (`infrastructure/springRuntime.ts`), el aislamiento (`languageSandbox.ts`) y el
puente de datos (`runtimeDataBridge.ts`), que ya son genéricos. Para Python (FastAPI + uvicorn) o
Rust (axum + cargo) basta un módulo de dominio nuevo con su detección/comando/parseo, un runtime
que reutilice sandbox, puente y proxy, y su paquete en la imagen.
