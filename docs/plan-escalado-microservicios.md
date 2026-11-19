# Plan de escalado a microservicios

## Objetivo y alcance

Evolucionar Forja desde el monolito modular hacia servicios independientes cuando
exista una necesidad medida de aislamiento, escalado o despliegue separado.
Conservar contratos HTTP, MCP, SDK, cookies, SSE y WebSocket durante la transicion.

Este documento es una propuesta, no una declaracion de capacidades implementadas.
No establece fechas ni requiere extraer todos los contextos DDD.

Supuestos de partida:

- Continuar sin Docker ni Kubernetes: procesos supervisados en servidores Linux
  o maquinas virtuales, con despliegues reproducibles y cuentas de servicio.
- Mantener el monolito como plano de control mientras se extraen workloads.
- Usar Postgres como fuente de verdad; Redis sera infraestructura auxiliar.
- No introducir escrituras duales sin outbox ni prometer entrega exactly-once.
- No mover bases, permisos y contabilidad al mismo tiempo que la primera extraccion.

El [plan multi-stack](plan-runtime-multistack.md) comparte runner, lifecycle,
artefactos y routing, pero no depende de convertir toda Forja en microservicios.

## Estado actual verificado

- [Composicion](../server/bootstrap/composition.ts): integra contextos mediante
  puertos y registra recursos para su cierre; las llamadas siguen siendo locales.
- [Runtime](../server/modules/app-runtime/application/ports.ts): contratos de
  build, publicacion y observacion; no son contratos remotos completos.
- [Realtime](../server/modules/app-services/application/realtime.ts): habitaciones
  y suscriptores WebSocket dentro de un proceso.
- [Datos de apps](../server/modules/app-services/infrastructure/projectDb.ts):
  PGlite por proyecto en almacenamiento local, compartido por preview y publicado.
- [Arquitectura](../README.md): contextos de negocio separados; sus transacciones
  locales no constituyen transacciones distribuidas.

Puertos e independencia del nucleo facilitan la extraccion, pero no resuelven por
si solos identidad de servicios, entrega durable, routing, datos y operacion.

## Arquitectura objetivo inicial

```text
Studio / MCP / SDK
        |
  API de plataforma -------------------- Postgres de plataforma
        |                                      |
        |                                  outbox / cola
        |                                      |
        +-- gateway de apps                 workers
        |      |                               |
        |      +-- runtime / runner -------- artefactos
        |
        +-- gateway realtime <---------- notificaciones Redis
                    |
                 clientes

Apps / runtime ---> servicios BaaS ---> propietario de datos de cada proyecto
```

Las cajas pueden comenzar como modulos del mismo proceso. Cada extraccion debe
tener un propietario, contrato, datos autorizados y procedimiento de rollback.
No compartir imports internos ni acceso SQL indiscriminado entre servicios.

## Decisiones propuestas

### Cache y estado distribuido

- Redis con cache-aside y TTL; Postgres sigue siendo la fuente de verdad.
- Claves incluyen contexto, tenant, proyecto y version del recurso.
- Invalidacion despues del commit mediante eventos; si Redis falla, leer la
  fuente con limites de concurrencia para evitar una estampida.
- TTL y versionado limitan datos obsoletos; una invalidacion asincrona no ofrece
  consistencia fuerte para revocacion de permisos.
- Operaciones sensibles verifican autorizacion en la fuente o mediante una
  version de permisos verificable; nunca confiar en permisos cacheados vencidos.
- Presencia usa claves efimeras con TTL, no registros durables de conexiones.
- No usar Redis como unica autoridad de creditos ni como bloqueo suficiente
  para impedir ejecuciones duplicadas con efectos financieros.

### Eventos, colas y transacciones

- Primer backend propuesto: cola durable en Postgres, evaluando pg-boss antes
  de agregar un broker independiente. La libreria no se instala en esta fase.
- Guardar el cambio y su outbox dentro de la misma transaccion Postgres.
- Un dispatcher publica y marca progreso de forma recuperable. Si se publica
  y se cae antes de marcar, el mensaje se repite: el consumidor debe tolerarlo.
- Envelope: `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `tenantId`,
  `projectId`, `aggregateId`, `aggregateVersion`, `correlationId`, `causationId`,
  `payload`. No incluir claves, tokens, prompts completos ni datos innecesarios.
- Cada suscripcion logica recibe su copia; sus workers compiten por esa copia.
  No usar una sola cola competidora para consumidores que todos deben reaccionar.
- Consumidores con inbox o clave idempotente; actualizar inbox y efectos locales
  en una misma transaccion cuando compartan base.
- Efectos externos usan claves idempotentes del proveedor o reconciliacion;
  marcar un evento como procesado no vuelve atomico un cobro o una llamada HTTP.
- Reintentos con backoff, limite de intentos, dead-letter y replay auditado.
- Orden solo cuando se requiera, por agregado/proyecto; controlar versiones y
  huecos. Un orden global no es requisito.
- Si se usa LISTEN/NOTIFY, solo despierta consumidores: las filas durables son
  la fuente de trabajo, con polling de respaldo.

### Realtime, SSE y recuperacion

- Gateways mantienen conexiones locales y autorizan la suscripcion por proyecto.
- Redis Pub/Sub distribuye avisos a todos los gateways; no es una cola durable.
- Eventos recuperables se almacenan con cursor por proyecto. El gateway permite
  reconectar y recuperar desde el ultimo cursor autorizado.
- Al suscribir: establecer recepcion en vivo, capturar limite durable, recuperar
  historial y deduplicar lo recibido en ambas vias para evitar huecos.
- Si el cursor expiro, responder explicitamente que debe recargarse el estado.
- Definir retencion y limites de buffer; desconectar clientes lentos con una
  instruccion de recuperacion, sin crecer memoria indefinidamente.
- "Esta escribiendo" y presencia son efimeros; finalizacion de builds, cambios
  de proyecto y estados de publicacion deben poder reconstruirse.
- No garantizar que todos los tokens de una respuesta LLM sean durables; definir
  separadamente el stream provisional y el resultado final persistido.

### Propiedad de datos y consistencia

- Inicialmente permitir un servidor Postgres comun, pero con roles/esquemas
  y repositorios de propietario; compartir servidor no significa compartir tablas.
- Las operaciones cuenta + organizacion personal y proyecto + archivos conservan
  su transaccion actual hasta disenar un reemplazo equivalente.
- Si se separan sus propietarios, usar workflows durables/sagas con estados,
  compensaciones y reconciliacion; no sustituir la transaccion por llamadas HTTP
  consecutivas sin recuperacion.
- Para PGlite: asignar un unico proceso propietario del almacenamiento de cada
  proyecto. Clientes remotos consultan ese propietario; no abrir la misma ruta
  desde varios workers ni asumir que un lease vuelve segura la concurrencia.
- Antes de migrar propietarios, detener al anterior, verificar liberacion y
  recuperar almacenamiento. Leases y fencing complementan esa exclusividad.
- Alternativa posterior: Postgres por red con aislamiento por proyecto. Exige
  pruebas de compatibilidad, backup, restauracion y migracion de datos BaaS.
- La outbox de plataforma no es atomica con PGlite ni con proveedores externos;
  esas fronteras requieren su propio mecanismo durable o reconciliacion.

## Fases y dependencias

### Fase 0. Medir y fijar contratos

Trabajo:

1. Medir concurrencia, latencia p95, duracion de builds, consumo de memoria,
   saturacion de DB y desconexiones realtime con cargas representativas.
2. Inventariar llamadas y recursos por contexto, incluidos timers y estado local.
3. Definir SLO y presupuestos de error con responsables; registrar los valores
   acordados antes de usar las metricas como criterio de extraccion.
4. Documentar contratos remotos, errores, deadlines y compatibilidad de versiones.

Salida: baseline reproducible y mapa de propiedad. No extraer por numero de carpetas.

### Fase 1. Infraestructura distribuida dentro del monolito

Depende de fase 0.

1. Implementar outbox, dispatcher, inbox y cola con puertos inyectados.
2. Incorporar Redis para cache y fan-out, sin convertirlo en fuente de verdad.
3. Persistir estados/cursors recuperables; agregar tracing y correlation IDs.
4. Probar fallos de Postgres, Redis y consumidores antes de separar procesos.

Salida: mismo producto y despliegue, con contratos distribuidos probados.

### Fase 2. Extraer runner y workloads pesados

Depende de fase 1.

1. Extraer primero build/evaluaciones; despues ejecucion, segun aislamiento requerido.
2. API conserva autenticacion, permisos y admision; worker recibe snapshot,
   version, presupuesto y deadline, no acceso administrativo a todas las tablas.
3. Jobs durables: pendiente, reservado, ejecutando, finalizado, fallido, cancelado.
   Heartbeat, leases, fencing y recuperacion de ejecuciones abandonadas.
4. Persistir resultado antes de notificar; aplicar idempotencia a publicacion
   y cargos. Cancelar el trabajo y liberar recursos de forma comprobable.
5. Publicar artefactos inmutables y conservar el backend local como rollback.

Salida: reiniciar la API no pierde trabajos ni duplica cargos/publicaciones.

### Fase 3. Gateways horizontales y datos de apps

Depende de fase 2 y de resolver propiedad de PGlite.

1. Balanceador/reverse proxy para HTTP, SSE y WebSocket con drenaje de conexiones.
2. Separar gateways de las ejecuciones; resolver proyecto a runner autorizado.
3. Extender BaaS por contratos de red y credenciales de servicio de alcance minimo.
4. Operar propietario PGlite remoto o migrar a Postgres por red antes de distribuir
   el acceso a una misma base entre maquinas.

Salida: dos gateways entregan eventos a clientes en distintas instancias y
recuperan desconexiones sin acceso cruzado entre proyectos.

### Fase 4. Extraer otros contextos solo con justificacion

Depende de fase 3 para operaciones de apps; otras extracciones pueden evaluarse
independientemente si no comparten esa dependencia.

- Evaluar integraciones y evaluaciones por carga y lifecycle.
- Mantener identidad, colaboracion y proyectos juntos mientras sus transacciones
  y la carga aconsejen esa cohesion.
- Cada nuevo servicio exige contrato, propietario de datos, SLO, supervisor,
  secretos, observabilidad, despliegue y rollback propios.

## TDD y criterios de aceptacion

| Escenario | Resultado requerido |
|---|---|
| Commit de negocio y caida antes de publicar | Evento permanece en outbox y se entrega al recuperar |
| Caida despues de publicar | Reentrega sin duplicar el efecto de negocio |
| Dos workers reservan el mismo trabajo | Solo la ejecucion vigente puede publicar/cobrar |
| Consumidor desconectado | Recupera mensajes durables pendientes |
| Redis no disponible | Operaciones durables continúan; cache/realtime degradados son visibles |
| Dos gateways WebSocket | Ambos reciben avisos para sus suscriptores locales |
| Reconexion y cursor vencido | Replay sin duplicados o instruccion explicita de resincronizacion |
| Revocacion de acceso | Nuevas operaciones/suscripciones se rechazan segun el contrato acordado |
| Worker o gateway reiniciado | Estado recuperado, conexiones drenadas y recursos liberados |
| Proyecto de otro tenant | Lectura, evento y trabajo rechazados |
| Migracion de propietario PGlite | Nunca hay dos procesos usando simultaneamente su almacenamiento |

Aplicar RED/GREEN a puertos y casos de uso, luego tests de adaptadores con
Postgres/Redis reales y pruebas de contrato entre procesos. Mantener suites
actuales de tipos, arquitectura, build, unidad, Studio, E2E, agentes y GitHub.
Las pruebas de carga verifican los SLO fijados en fase 0, no solo respuestas 200.

## Operacion, despliegue y rollback

- Supervisores, usuarios sin privilegios, TLS, identidad de servicios, firewall,
  limites de CPU/memoria/disco/procesos y secretos fuera de artefactos.
- Migraciones expand-contract; lectores compatibles antes de retirar campos.
- Canary por proyecto/tenant; no enviar un job a dos backends con efectos reales.
- Feature flags de routing y pausa de productores durante incidentes.
- Rollback compatible con esquemas/eventos existentes; restaurar datos no es
  automaticamente equivalente a revertir un binario.
- Alertas: edad de outbox, profundidad de cola, dead-letter, leases vencidos,
  fallos de fan-out, lag de replay, hit ratio y errores de autorizacion.
- Backups y restauraciones ensayados; runbooks para failover y reconciliacion.

## Primer incremento recomendado

Introducir outbox y cola durable en el monolito, con un caso de build reproducible
y pruebas de caida/reentrega. Extraer un worker solo despues de demostrar
idempotencia y recuperacion. Redis y gateways horizontales siguen cuando haya
necesidad de cache compartida y fan-out entre instancias.
