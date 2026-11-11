# Memoria de los servicios

Forja corre en cuatro procesos Node (`forja`, `app-runtime`, `builder`, `job-worker`) más Postgres. Este documento recoge cuánta memoria usa cada uno, qué la limita y cómo consultarla. También deja por escrito si conviene reescribir alguna parte en Go o Rust.

## Dónde se va la memoria

Medido con `docker compose -f docker-compose.yml -f docker-compose.local.yml up` en Docker Desktop (Linux, Node 24).

| Servicio | RSS en reposo | Heap V8 usado |
|---|---|---|
| forja | ~105 MB | — |
| app-runtime | ~130 MB | ~36 MB |
| builder | ~130 MB | ~36 MB |
| job-worker | ~130 MB | ~36 MB |

En reposo ningún servicio pasa de unos 130 MB. La memoria crece en `app-runtime`, que es el único proceso que abre las bases PGlite de los proyectos, arranca los sandboxes de endpoints y levanta las JVM de los backends Java.

Carga de prueba: 24 proyectos, cada uno con una tabla de 2000 filas y 50 consultas. El tope estaba en 16 bases abiertas.

| `shared_buffers` | Bases abiertas | RSS app-runtime | Heap V8 usado | Reabrir 24 bases |
|---|---|---|---|---|
| 128MB (antes, valor de PGlite) | 16 | **2864 MB** | 130 MB | 13,9 s |
| 16MB (ahora) | 16 | **1186–1309 MB** | 150–190 MB | 5,7 s |

- Cada base PGlite abierta cuesta unos 70 MB con 16MB de buffers. Con los 128MB de serie costaba unos 170 MB. La primera base suma además unos 100 MB por compilar el WASM de Postgres.
- Esa memoria es *externa* a V8 (`externalMb` en el informe): es la memoria lineal del WASM. `--max-old-space-size` no la acota; la acotan el número de bases abiertas y su buffer pool.
- Las bases de las apps generadas son pequeñas, así que un buffer pool de 16MB no tiene efecto medible en la velocidad de las consultas: ~1,5 ms por consulta en ambos casos.
- Crear una base nueva (initdb) tarda unos 2 s. Reabrir una existente, ~0,1–0,25 s.

## Límites

| Variable | Por defecto | Servicio | Qué limita |
|---|---|---|---|
| `FORJA_HEAP_MB` | 1024 | forja | Heap V8 (`--max-old-space-size`) |
| `FORJA_APP_RUNTIME_HEAP_MB` | 1024 | app-runtime | Heap V8 |
| `FORJA_BUILDER_HEAP_MB` | 1536 | builder | Heap V8 (contexto de los modelos, índices de código) |
| `FORJA_JOB_WORKER_HEAP_MB` | 512 | job-worker | Heap V8 |
| `FORJA_DB_MAX_OPEN` | 16 | app-runtime | Bases PGlite abiertas a la vez |
| `FORJA_DB_SHARED_BUFFERS` | `16MB` | app-runtime | Buffer pool de cada base PGlite (`<n>kB` o `<n>MB`) |
| `FORJA_SANDBOX_MAX_PROCESSES` | 16 | app-runtime, job-worker | Procesos sandbox de endpoints vivos a la vez |
| `FORJA_SANDBOX_MAX_HEAP_MB` | 512 | app-runtime, job-worker | Heap V8 de cada sandbox |
| `FORJA_JAVA_MAX_HEAP_MB` | 256 | app-runtime | Heap de cada JVM (ver [language-runtimes.md](language-runtimes.md)) |
| `FORJA_LANG_MAX_PROCESSES` | 4 | app-runtime | Compilaciones/JVM concurrentes |

- **Heap V8.** El flag va en el `command` de cada servicio en `docker-compose.yml`, no en `NODE_OPTIONS`. Así npm, los sandboxes y las JVM no lo heredan.
- **Bases PGlite.** Al pasar del tope, Forja cierra la base menos usada recientemente que esté ociosa (LRU). Una base con consultas en curso nunca se cierra: el tope es blando y se puede rebasar momentáneamente cuando todas están ocupadas. Las bases que llevan `dbIdleMs` (60 s) ociosas se cierran solas igual que antes. Cerrar y volver a abrir la misma base está serializado, para que una consulta nunca use una instancia que se está cerrando.
- **Sandboxes.** Al arrancar uno nuevo con el tope lleno, Forja para el sandbox ocioso usado hace más tiempo. Uno con peticiones en curso o esperando a que arranque el proceso no se para. Cada sandbox se para solo tras 5 minutos sin uso.

Para estimar el tamaño de `app-runtime`: ~130 MB base + ~70 MB por base abierta + hasta `FORJA_SANDBOX_MAX_HEAP_MB` por sandbox vivo + `FORJA_JAVA_MAX_HEAP_MB` (más ~100 MB fuera del heap) por JVM. Con los valores por defecto y uso típico (pocos sandboxes, sin Java), el peor caso realista ronda 1,5 GB.

## Cómo consultarla

La herramienta `system_status` del MCP de administración incluye un bloque `memory` con el informe de cada servicio:

```json
{
  "forja": { "process": { "rssMb": 105, "heapUsedMb": 40, "heapLimitMb": 1216, "externalMb": 7 } },
  "appRuntime": {
    "process": { "rssMb": 1186, "heapUsedMb": 191, "heapLimitMb": 1216, "externalMb": 2725 },
    "projectDbs": { "open": 16, "closing": 0, "maxOpen": 16, "sharedBuffers": "16MB" },
    "sandboxes": { "processes": 1, "maxProcesses": 16, "maxHeapMb": 512, "items": [{ "projectId": "…", "env": "preview", "pid": 812, "busy": false, "rssMb": 95 }] },
    "jvms": { "processes": 1, "maxProcesses": 4, "maxHeapMb": 256, "items": [{ "projectId": "…", "pid": 845, "rssMb": 310 }] }
  },
  "builder": { "process": { "…": "…" } },
  "jobWorker": { "process": { "…": "…" } }
}
```

- `rssMb` es la memoria física real del proceso.
- `heapUsedMb`/`heapLimitMb` es la parte de V8 que acota `--max-old-space-size`. `heapLimitMb` incluye además la generación joven, por eso sale algo por encima del flag.
- `externalMb` agrupa PGlite (WASM) y los buffers.
- La RSS de sandboxes y JVM incluye sus procesos hijos (bubblewrap, Maven). Solo se mide en Linux; en otros sistemas sale `null`.
- Si un servicio no responde, su entrada es `{ "error": "…" }` y el resto del informe sigue llegando.

Cada servicio expone su informe en una ruta interna autenticada con su token de servicio:

| Servicio | Ruta | Token |
|---|---|---|
| app-runtime | `POST /internal/runtime/memory` | `APP_DATA_SERVICE_TOKEN` |
| builder | `POST /internal/builder/memory` | `BUILDER_SERVICE_TOKEN` |
| job-worker | `POST /internal/memory` | `APP_DATA_SERVICE_TOKEN` |

## ¿Reescribir algo en Go o Rust?

No, de momento. Las medidas:

- **El heap de Node no es el problema.** Con 16 bases abiertas, el heap V8 de `app-runtime` usa 150–190 MB de 1,2–2,9 GB de RSS. El resto es WASM de PGlite. Reescribir el servicio en Go o Rust no movería esa memoria, porque seguiría siendo la misma instancia de Postgres por proyecto.
- **La capa HTTP de Node sobra.** `/healthz` de `app-runtime` atiende ~9300 req/s (p50 3 ms con 50 conexiones concurrentes).
- **El cuello de botella es PGlite.** Consultas a través del servicio: ~650 req/s, ya sea contra una base o repartidas entre 8. Cada instancia PGlite ejecuta una consulta a la vez dentro del WASM, así que con 50 conexiones la p50 sube a 68 ms. Un proxy en Go no cambiaría eso.

Las palancas útiles son, en orden: los límites de este documento (ya aplicados), bajar `FORJA_DB_MAX_OPEN`/`FORJA_DB_SHARED_BUFFERS` si el host es pequeño y, si algún día hace falta más concurrencia por proyecto, mover los datos publicados a un Postgres servidor. Ese último paso es un cambio de arquitectura, no de lenguaje. Vale la pena volver a medir (`system_status`) antes de reconsiderar la reescritura, y solo si aparece un servicio cuyo heap V8, y no su memoria externa, sea el que crece.
