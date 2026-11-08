# Estado del trabajo: repositorios originales y Forja autoalojada

Captura de estado: 8 de noviembre de 2026, antes de publicar la corrección de CI.

**Estado general:** la funcionalidad principal está implementada y su ejecución
real fue validada localmente. La entrega final sigue pendiente: CI en Linux falló
en el commit anterior. El parche correctivo ya pasó su validación local y debe
publicarse para verificar una nueva ejecución CI.

## Ramas y PR

| Elemento | Estado |
| --- | --- |
| PR de esta funcionalidad | [#71](https://github.com/Kirad20/forje-software-studio/pull/71), abierta y sin fusionar |
| Rama de implementación | `Kirad20/repository-runtime-tdd` |
| Rama destino de la PR | `feature/repository-runtime`, no `main` |
| Base de la nueva rama | `21cd9c76dd600af907c03284f9a7b732b2a07e0d`, con #70 integrada |
| Último commit publicado | `975c736e9af0511357ecc6b89ce2566523f9e472` |
| Worktree de implementación | `repository-runtime-tdd`, separada de `anemone` |

No se modificó la rama original de trabajo para implementar esta funcionalidad.
La PR ya está creada; no falta crear otra ni fusionarla en `main`.

## Trabajo previo terminado

| Solicitud | Resultado |
| --- | --- |
| Corregir login, menús y desajustes móviles | Implementado en #69, ya integrada |
| Consultar primero el cerebro de conocimientos desde MCP | Implementado en #69, ya integrada |
| Quitar el botón flotante de instalación PWA | Instalación opcional trasladada al menú de cuenta, en #70 |
| Conectar GitHub mediante una GitHub App y seleccionar repositorios | Onboarding por cuenta, autorización, credenciales cifradas y renovación de tokens, en #70, ya integrada |

La funcionalidad nueva extiende ese trabajo para importar repositorios originales
que no siguen la estructura de proyectos nativos de Forja.

## Implementado en esta funcionalidad

### Importación, archivos y contexto

- Modo de proyecto explícito: `native` o `repository`, con migración 014.
- Importación completa desde GitHub conservando rutas originales, binarios y
  ejecutables; no convierte el repositorio a `pages/`, `endpoints/` y `helpers/`.
- Sin escritura inicial al repositorio remoto ni inyección de un proyecto base.
- Lectura, edición, renombrado, borrado, duplicación y sincronización conscientes
  del modo del proyecto.
- Rechazo de rutas inseguras, credenciales, symlinks y submódulos; límites de tamaño
  y exclusión de archivos generados.
- Duplicaciones sin copiar cuentas, datos, secretos, despliegues ni vínculos remotos.
- Builder, MCP, conocimiento y observabilidad adaptados al modo repositorio, sin
  aplicar herramientas exclusivas del runtime nativo.

### Ejecución aislada

- Módulo `repository-runtime` y migración 015 para estado y secretos cifrados.
- Builds Docker/Node con imágenes, configuración y revisiones inmutables.
- PostgreSQL, claves, redes y volúmenes separados por proyecto y ambiente.
- Límites de recursos, procesos, tiempos y logs; ejecución no root, sin
  capabilities ni acceso al socket Docker del padre.
- Bloqueos por proyecto y dos slots globales de build respaldados por PostgreSQL.
- Configuración, build, salud, logs, preview, publicación de una revisión probada,
  rollback y parada.
- Conservación del despliegue sano cuando falla un build o un candidato.
- Proxy HTTP, streaming, SSE y WebSocket con autorización de enlaces privados.
- Tokens distintos para preview y publicación; revocación por proyecto.
- Alias de sesión del hijo para no sobrescribir ni reenviar la identidad del padre.
- Limpieza de recursos propios al eliminar proyectos y reconciliación de estado.

### Studio y permisos

- Selector de modo al importar desde GitHub.
- Controles de configuración, build, preview, publicación, logs, rollback y parada.
- Nuevos repositorios privados por defecto.
- Cambios de visibilidad, configuración y logs de producción restringidos al
  propietario según la operación.
- Protección para que un GET atrasado no sustituya un preview recién construido.
- Herramientas de apariencia/BaaS nativas ocultas o rechazadas en repositorios.
- Pruebas de controles y disposición móvil, incluyendo viewport de 320 px.
- Flujo nativo preservado.

### Forja ejecutándose dentro de Forja

La prueba real importó el código original y utilizó su `Dockerfile`. Verificó:

1. Arranque de una instancia hija con PostgreSQL, almacenamiento y clave propios.
2. Setup inicial y login por contraseña desde un iframe en el origen del padre.
3. Assets y llamadas API originales, con sesión particionada e identidad aislada.
4. Creación y edición de un proyecto nativo dentro de la instancia hija.
5. Preview nativa anidada, endpoint con secreto y handshake WebSocket.
6. Publicación del mismo digest probado con datos y claves de producción separados.
7. Reconstrucción conservando cuentas, sesión y secretos que siguen descifrándose.
8. Rollback de código, parada independiente de preview y revocación de enlaces.

Los recursos de esa prueba fueron eliminados en `finally`. Esto demuestra
autoalojamiento en el entorno de prueba, no un despliegue productivo ya configurado.

## TDD y validación realizada

Hubo plan explícito y ciclos rojo/verde para importación, permisos, privacidad,
límites nativos, ciclo de vida y UI. También se reprodujo un fallo 502 al reutilizar
una conexión upstream que se estaba cerrando: se añadió una regresión y se corrigió
sin reintentar mutaciones.

| Validación | Resultado registrado |
| --- | --- |
| Typecheck | Aprobado |
| Build de Studio | Aprobado |
| Suite unitaria local completa | 925 aprobadas, 1 omitida; 168 archivos aprobados |
| Nueve pruebas del proxy, incluida la regresión de conexión | Aprobadas |
| Parche Linux: importación, GitHub y modo repositorio | 25 pruebas aprobadas en 3 archivos; typecheck aprobado |
| `npm run test:repository` con Docker/PostgreSQL/Chromium reales | Aprobado |
| Regresiones nativas e2e y agentes | Aprobadas |
| GitHub backend/UI, PWA y controles móviles | Aprobados |
| Suite Studio | 35 pasos aprobados; un fallo de sondeo se corrigió en el test y su caso se volvió a ejecutar con bootstrap: 2 pasos aprobados |
| Actualización del grafo sin LLM | Ejecutada; watch activo al consultar el estado |
| CI Linux, job `docker` | Aprobado en el commit publicado |
| CI Linux, job `check` | Falló: 924 tests aprobados, 1 fallido, 1 omitido |

La suite completa y la prueba Docker corresponden al estado anterior al último
parche local. El parche se verificó con las 25 pruebas directamente afectadas y
typecheck; la validación Linux completa corresponde a la siguiente ejecución CI.

## Fallo actual y corrección local pendiente

Ejecución CI:
[42415584284](https://github.com/Kirad20/forje-software-studio/actions/runs/42415584284).

Falló el test
`prepares the actual tracked Forja source tree without rewriting files`,
en `test/unit/modules/integrations/imports.test.ts`.

Se identificaron dos problemas:

- El test convertía `/` a `\` al leer archivos, lo que falla en Linux.
- La captura incluye archivos no versionados, y CI instala Chromium en
  `.ms-playwright/`; ese caché generado no estaba excluido.

Ya hay cambios locales, todavía sin commit:

| Archivo | Corrección preparada |
| --- | --- |
| `test/unit/modules/integrations/imports.test.ts` | Usar `node:path.join` y añadir un caché de Chromium al caso de exclusión |
| `contracts/repository.ts` | Excluir `.ms-playwright` como contenido generado |

Se observó el test rojo que demostraba la inclusión indebida del caché. Después se
aplicó la corrección y se confirmó el verde: 25 pruebas aprobadas y typecheck.
Al tomar esta captura, la PR remota aún contenía el commit anterior; no se había
ejecutado una nueva CI con la corrección.

También hay cambios locales generados en `graphify-out/` y respaldos no
versionados en `graphify-out/2026-11-07/` y `graphify-out/2026-11-08/`.
La actualización del grafo sin LLM se volvió a ejecutar al preparar este documento.
No deben publicarse esos respaldos ni las rutas locales `.graphify_python` y
`.graphify_root`.

## Lo que falta para cerrar la entrega

1. Publicar el parche ya validado, los grafos y la documentación pertinente en
   `Kirad20/repository-runtime-tdd`, sin amend del commit anterior.
2. Validar en Linux la lectura portable y que el caché de Chromium no se importe.
   La siguiente ejecución CI debe recorrer también la prueba Docker real.
3. Actualizar los grafos correspondientes y revisar el respaldo generado antes
   de limpiarlo; no eliminar recursos o cambios ajenos.
4. Esperar y verificar ambos jobs de CI en verde para el nuevo commit; corregir
   cualquier fallo real restante.
5. Actualizar la evidencia de #71 y confirmar que sigue dirigida a
   `feature/repository-runtime`. No fusionar en `main` ni marcar la funcionalidad
   completa antes de estas verificaciones.

Comandos iniciales, desde la worktree de implementación en PowerShell:

```powershell
npx vitest run "$PWD\test\unit\modules\integrations\imports.test.ts"
npm run typecheck
```

## Límites conocidos y requisitos operativos

Estos son límites de la implementación actual, no pruebas pendientes ni
funcionalidades que se hayan prometido como terminadas:

| Límite o requisito | Implicación |
| --- | --- |
| Daemon Docker Linux dedicado y confiable, CLI y `SECRETS_KEY` estable | Debe configurarlo el operador; las apps no reciben credenciales ni socket del padre |
| DNS, reverse proxy y certificados para subdominios anidados | Un wildcard del dominio principal no cubre por sí solo todos los niveles |
| Rollback de código, no de datos ni migraciones | Requiere backups y migraciones compatibles |
| Máximo de 20 revisiones por proyecto | Builds posteriores devuelven 409; no hay poda automática |
| Runners de repositorios deshabilitados en el Forja hijo | El hijo puede trabajar con proyectos nativos, pero no recibe el daemon del padre |
| Soporte inicial Dockerfile/Node | No se ejecuta Compose arbitrario ni se habilitan mounts privilegiados |
| Parser SQL del grafo ausente | `tree_sitter_sql` genera una advertencia; no se ha instalado ni afirmado extracción semántica de documentos |

Guía técnica y operativa: [repository-runtime.md](repository-runtime.md).
