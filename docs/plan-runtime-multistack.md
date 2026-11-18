# Plan de runtime multi-stack: FastAPI, Go y Spring Boot

## Objetivo y limites

Permitir que Forja genere, valide, ejecute, publique y opere proyectos con backend
FastAPI, Go o Spring Boot, conservando React/TypeScript y el runtime Node actual.
Crear soporte de producto completo, no solo archivos de otro lenguaje.

Propuesta inicial:

- Sin Docker ni Kubernetes: runners en servidores Linux/VMs aisladas con procesos
  supervisados, toolchains aprobadas y artefactos versionados.
- Un backend y un frontend React por proyecto. Jobs del stack se incorporan despues.
- FastAPI primero, Go segundo y Spring Boot tercero, por dependencias operativas,
  no por una estimacion de duracion.
- No incluir Laravel, frameworks adicionales, comandos arbitrarios, plugins de
  build libres ni grafos de microservicios dentro de una app en el primer alcance.
- Separar "generar/exportar codigo" de "ejecutar/publicar": el segundo solo se
  habilita cuando pase el criterio de aislamiento del runner.

El [plan de microservicios](plan-escalado-microservicios.md) comparte runner,
artefactos, eventos y routing. Multi-stack puede implementarse manteniendo
Forja como monolito modular.

## Punto de partida

- [Bundler](../server/modules/app-runtime/infrastructure/bundler.ts):
  esbuild, archivos virtuales, React y modulos TypeScript del servidor.
- [Sandbox](../server/modules/app-runtime/infrastructure/sandbox.ts):
  proceso Node con permisos restringidos y servicios accesibles por dispatch.
- [Puertos](../server/modules/app-runtime/application/ports.ts):
  build/publicacion existentes; faltan contratos de toolchain y workloads remotos.
- [Composicion](../server/bootstrap/composition.ts): conecta jobs con compilacion,
  ejecucion y archivos; este wiring debe elegir capacidades segun stack.
- [Datos BaaS](../server/modules/app-services/infrastructure/projectDb.ts):
  PGlite local; drivers Python/JDBC/Go no pueden conectarse directamente a esa ruta.

Los permisos de Node no protegen procesos Python, JVM o binarios Go. Cambiar
el ejecutable sin reemplazar el aislamiento seria una regresion.

## Arquitectura propuesta

```text
Studio / MCP / builder
          |
  especificacion de proyecto + snapshot inmutable
          |
     casos de uso runtime
          |
     puertos de ejecucion
          |
   runner de build aislado ---- repositorio de artefactos
                                      |
                              runner de ejecucion
                                      |
                         gateway preview / publicado
                                      |
                          API BaaS / Postgres por red
```

El plano de control no ejecuta instalaciones ni codigo generado. El runner de
build no recibe secretos de produccion; el runner de ejecucion recibe solo
credenciales del proyecto y entorno autorizado.

## Contrato de proyecto y runtime

### Especificacion versionada

Introducir un descriptor validado con:

- `schemaVersion`, `stack`, `stackVersion`, version de toolchain y frontend.
- Componentes, directorios fuente, entrypoint aprobado y capabilities requeridas.
- Dependencias/lockfiles, tests, healthcheck y migraciones.
- Recursos maximos y perfil de ejecucion, referenciados por politica de plataforma.

Comenzar con stacks `node-react`, `python-fastapi`, `go-http` y `java-spring-boot`.
No deducir el stack unicamente por extension. Proyectos existentes sin descriptor
siguen como Node; esta compatibilidad es intencional y debe probarse.

El usuario/agente no puede definir comandos shell ilimitados. Cada adaptador
traduce el descriptor a ejecutables aprobados y arrays de argumentos, valida
rutas y controla la descarga de dependencias.

### Puertos propuestos

Estos nombres son contratos por implementar, no APIs disponibles:

| Puerto | Responsabilidad |
|---|---|
| StackRegistry | Capacidades, descriptor y versiones permitidas |
| BuildExecutor | Materializar snapshot, instalar, verificar, probar y producir artefacto |
| ArtifactStore | Hash, procedencia, descarga autorizada y retencion |
| WorkloadSupervisor | Arrancar, salud, estado, logs, cancelar y detener |
| AppGateway | Routing de preview/publicado y conexiones persistentes |
| AppDataProvisioner | Acceso BaaS o base por red, migraciones y backup |

Contrato comun: jobs y errores estructurados con stack, etapa, archivo, linea,
columna, severidad, exit code y correlation ID. Streaming de logs con limites y
redaccion de secretos. Resultado final durable aunque se desconecte el cliente.

Lifecycle propuesto:

```text
snapshot -> preparando -> verificando -> probando -> empaquetando
         -> artefacto listo -> arrancando -> saludable -> publicado
```

Cada etapa admite fallo/cancelacion. Solo se conmuta el trafico al nuevo artefacto
despues de healthcheck y comprobacion funcional; nunca publicar un build parcial.

## Adaptadores por stack

| Stack | Dependencias y verificacion | Artefacto y ejecucion | Primer alcance |
|---|---|---|---|
| FastAPI | Python aprobado, uv con lockfile y sincronizacion frozen; pytest, Ruff y comprobacion de tipos elegida | Bundle fuente + lockfile; entorno virtual reconstruido en runner compatible; Uvicorn supervisado | API JSON, validacion, OpenAPI, acceso a datos autorizado |
| Go | Toolchain fijada, go.mod/go.sum; go mod verify, go test, go vet | Binario para SO/arquitectura acordados; CGO deshabilitado inicialmente | net/http, API JSON, OpenAPI segun contrato |
| Spring Boot | JDK y version Spring fijados; Maven y repositorios aprobados, tests y analisis del perfil | JAR ejecutable + hash, JVM supervisada y readiness | Spring Web, Bean Validation y acceso a datos autorizado |

- Python: paquetes y builds de distribuciones fuente pueden ejecutar codigo;
  restringir origen y ejecutar incluso la instalacion en aislamiento.
- Go: dependencias y tests ejecutan codigo; no permitir `go generate` arbitrario.
- Java: plugins Maven, annotation processors y tests ejecutan codigo; usar perfiles
  aprobados. Gradle y wrappers arbitrarios quedan fuera del primer alcance.
- Lockfile no implica hermeticidad total. Maven necesita versiones exactas,
  sin SNAPSHOT/rangos, repositorio controlado y procedencia de dependencias.
- FastAPI empaqueta codigo para un interprete; Go y Java producen artefactos
  distintos. No forzar a todos al concepto de bundle esbuild.

## Compatibilidad con BaaS y SDK

### Decision inicial de datos

Recomendacion: mantener PGlite bajo un propietario Node y habilitar APIs BaaS
versionadas para las capacidades permitidas. No entregar `DATABASE_URL` de
plataforma ni acceso a las tablas de otras apps.

Alternativa para ORM nativo: provisionar Postgres por red con credenciales
limitadas por proyecto/entorno. Habilitarla como capacidad explicita despues de
backup, restore y aislamiento; no simular compatibilidad JDBC/SQLAlchemy sobre
una ruta PGlite.

- Si una app necesita SQL remoto, definir un contrato acotado y autorizado, con
  parametros, limites y transacciones; evitar SQL administrativo irrestricto.
- No hacer llamadas HTTP independientes para cada sentencia de una transaccion
  y pretender atomicidad. Usar contrato transaccional o driver de DB autorizada.
- Auth de plataforma y auth de usuarios de apps son identidades distintas.
- Mantener React y `@forja/client`; crear clientes internos de servicio para
  Python, Go y Java solo para las capacidades realmente habilitadas.
- Credenciales por workload/proyecto/entorno, rotables y revocables; tokens de
  servicio no sustituyen autorizacion del usuario de la app.
- Realtime, storage, email y jobs pasan por contratos de red; no portar todos los
  servicios a tres lenguajes. Usar OpenAPI para reducir divergencia.
- Declarar preview/publicado compartidos o separados: hoy PGlite comparte datos.
  No cambiar ese comportamiento de manera implicita durante la migracion.

## Aislamiento sin contenedores: condicion de publicacion

Para codigo generado no confiable, una cuenta de sistema o un proceso hijo no
es aislamiento suficiente por si solo.

1. Ejecutar builds y workloads fuera del host de la plataforma, preferentemente
   en VMs desechables por proyecto/workload o una frontera equivalente evaluada.
2. Usuario sin privilegios, filesystem acotado, cuotas de disco/CPU/memoria/PIDs,
   limites de tiempo y cierre de todos los procesos descendientes.
3. Restringir red/egress y acceso a metadata, servicios internos, secretos y otros
   tenants. Durante build, permitir solo repositorios aprobados.
4. Directorios nuevos por build; cache de dependencias confiable separada y
   artefactos inmutables. No reutilizar entornos mutables entre proyectos.
5. Pruebas de abuso para Python, JVM, Go y scripts de instalacion, no solo Node.
6. Si no existe esa frontera validada, habilitar generacion/exportacion pero
   rechazar ejecucion/publicacion de stacks nuevos con un error explicito.

No Docker/Kubernetes no significa renunciar al aislamiento. La provision y
supervision de VMs constituye trabajo operativo necesario, no una funcion que
ya exista en Forja.

## Cache, artefactos y publicacion

- Cache de build por snapshot, stack/toolchain, SO/arquitectura, lockfiles,
  configuracion relevante y version del adaptador.
- No cachear secretos ni reutilizar resultados de tests dependientes del entorno
  como si fueran universales.
- Evitar cache poisoning: separar escritura no confiable, validar hashes y
  procedencia, y definir si se permite compartir entre tenants.
- Especificar catalogo de runtimes instalados y actualizaciones de seguridad.
- Publicacion por artefacto y configuracion versionados; rollback reutiliza el
  artefacto anterior sin reconstruirlo.
- Migraciones expand-contract. Un rollback de codigo puede ser incompatible
  con una migracion destructiva; prohibirla en el flujo automatico inicial.
- Estado persistente fuera del artefacto: datos, uploads y secretos tienen
  lifecycle y backup propios.

## Fases de implementacion

### Fase 0. Contratos y aislamiento

1. Definir descriptor, capabilities, errores y puertos comunes.
2. Crear fixtures por stack y preservar el comportamiento Node sin descriptor.
3. Implementar runner seguro, artifacts y supervision con limites.
4. Ensayar lifecycle, cancelacion, limpieza y bloqueo de acceso cruzado.

Salida: infraestructura capaz de ejecutar una fixture aprobada, no codigo
arbitrario de usuarios. No declarar soporte de producto completo todavia.

### Fase 1. Piloto FastAPI + React

Depende de fase 0.

1. Template reproducible con API JSON, healthcheck y OpenAPI.
2. uv/pytest/Ruff/tipos; politica de dependencias y diagnosticos en Studio/MCP.
3. API de datos autorizada y autenticacion probada; CRUD por usuario de app.
4. Preview, publicacion, logs, healthcheck, cancelacion y rollback.
5. Builder genera, prueba y corrige backend Python y frontend React.

Salida: flujo completo desde chat hasta app publicada; no solo un proceso Uvicorn.

### Fase 2. Go + React

Depende de fase 0 y del contrato de producto probado en fase 1.

1. Template net/http, tests y diagnosticos de compilador/vet.
2. Binario compatible con runner, sin CGO en el primer alcance.
3. Clientes BaaS/identidad y mismo contrato funcional del piloto.
4. Repetir publicacion, restart, logs y rollback con criterios equivalentes.

### Fase 3. Spring Boot + React

Depende de fase 0 y del contrato de producto probado en fase 1; puede desarrollarse
en paralelo con Go una vez estabilizados los puertos y el aislamiento.

1. Template Spring Web, validacion, healthcheck y OpenAPI.
2. Maven/JDK aprobados, tests y diagnosticos; politica de plugins/dependencias.
3. Configuracion de JVM, memoria y readiness medidos bajo carga.
4. Integracion de datos/BaaS, empaquetado JAR y rollback.

### Fase 4. Producto y operaciones multi-stack

Depende de los adaptadores habilitados.

- Selector de stack/capabilities en Studio y MCP; defaults explicitos.
- Herramientas del builder seleccionadas por stack, no prompts que siempre
  asuman `pages/` y endpoints TypeScript.
- Indexado de simbolos/imports/rutas, ownership de archivos, checkpoints,
  exportacion GitHub y diagnosticos para los tres lenguajes.
- Evals y modelos simulados por stack; no depender de LLM real para CI basica.
- Jobs, ORM nativo o apps multi-servicio se habilitan en incrementos posteriores.
- Modificar el stack de una app existente requiere una migracion explicita;
  no reinterpretar el mismo arbol de archivos automaticamente.

## TDD y criterios de salida

| Prueba | Resultado requerido para cada stack |
|---|---|
| Proyecto Node existente | Mantiene contrato y publicacion actuales |
| Descriptor invalido/stack no habilitado | Error estructurado antes de ejecutar comandos |
| Instalacion reproducible | Versiones y procedencia verificables; cache no cambia el resultado |
| Build/test fallido | Diagnostico accionable; app publicada anterior intacta |
| Healthcheck fallido | No recibe trafico; recursos del intento se liberan |
| Reinicio/cancelacion | Estado durable, procesos descendientes terminados |
| CRUD con dos usuarios/proyectos | Sin acceso cruzado ni credenciales de plataforma |
| Red/filesystem/procesos abusivos | Acceso bloqueado y fallo observable sin afectar otra app |
| Cache entre proyectos | No filtra archivos/secretos ni acepta artefactos manipulados |
| Publicacion/rollback | Misma revision de codigo/artefacto identificable, sin reconstruccion |
| GitHub/checkpoint/restore | Preserva los archivos y metadata propios del stack |
| Builder con modelo simulado | Genera, detecta fallo, corrige, prueba y entrega cada fixture |

Aplicar RED/GREEN primero a puertos y seleccion de stack; tests reales con
toolchains aprobadas despues. Medir arranque, memoria, build, concurrencia y
latencia bajo cargas representativas; acordar umbrales antes de promocionar
un stack a disponibilidad general.

## Despliegue gradual y rollback

- Flags por stack y tenant; Node sigue como default para proyectos existentes.
- Separar permisos de generar, ejecutar y publicar.
- Canary con fixtures y proyectos autorizados antes de apertura general.
- Permitir deshabilitar nuevas ejecuciones conservando codigo y artefactos.
- Toolchains actualizadas con pruebas; no reemplazar silenciosamente runtimes
  de proyectos publicados.
- Registrar revision, toolchain, dependencias y configuracion sin secretos.
- Exponer fallos de provision/build/runtime; nunca responder exito si solo se
  genero codigo pero no se ejecuto o verifico.

## Primer incremento recomendado

Definir descriptor y puertos, probar compatibilidad Node y construir un runner
aislado que publique una fixture FastAPI + React con logs, datos autorizados
y rollback. Ese flujo constituye el contrato de referencia para Go y Spring Boot.
