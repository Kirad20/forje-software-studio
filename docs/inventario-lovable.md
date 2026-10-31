# Inventario de funciones de Lovable → Forja

Recorrido del 30-oct-2026 por la documentación pública de Lovable (`docs.lovable.dev`, índice `llms.txt`: unas 300 páginas), más ideas adaptadas del prompt y las herramientas de su agente que circulan en público. Como con Floot, se replica el **modelo de producto y los flujos**, no la marca, los textos ni el código: Forja conserva su nombre, su diseño y su redacción.

Leyenda: ✅ Forja ya lo tiene · ⚠️ lo tiene a medias · ❌ falta · ⏭️ fuera de alcance (motivo)
Prioridad de lo que falta: **P1** núcleo del constructor (más valor, se apoya en lo que ya hay) · **P2** proyecto y colaboración · **P3** backend y servicios · **P4** plataforma, crecimiento y empresa.

## Avance

| Fecha | Qué | PR |
| --- | --- | --- |
| 30-oct-2026 | Inventario y hoja de ruta | Kirad20/clone-repos#51 |
| 30-oct-2026 | Ronda 1 · 1: paquetes npm (`add_dependency`, `remove_dependency`, `package.json` por proyecto) | Kirad20/clone-repos#51 |
| 30-oct-2026 | Prompt y contexto: archivos relevantes precargados, guía de primera versión, reglas de alcance, diseño y SEO, `useHead` | Kirad20/clone-repos#51 |
| 30-oct-2026 | Ronda 1 · 2: pruebas en navegador (`browser_test`) | Kirad20/clone-repos#52 |

Siguiente: Ronda 1 · 3, escaneo de seguridad.

## 1. Chat y agente del constructor

| Lovable | Qué hace | Forja | Prio |
| --- | --- | --- | --- |
| Modos Chat / Plan / Build | Conversar sin tocar código · plan editable que se aprueba · implementar y verificar | ✅ Construir, Chat y Plan con «Implementar plan» | — |
| Plan editable | El dueño edita el plan antes de aprobarlo | ⚠️ el plan se revisa y se aprueba, pero no se edita en un formulario | P2 |
| Goal (`/goal`) | Un mensaje en el que el agente sigue trabajando hasta cumplir el objetivo (horas). No hace preguntas, hace pausas para confirmar el gasto de créditos y dedica la última media hora a cerrar y resumir | ❌ los turnos están limitados por `MAX_STEPS` | P1 |
| Seguimientos mientras trabaja | Los mensajes que se envían durante un turno lo redirigen en marcha | ⚠️ se ponen en cola para el turno siguiente | P1 |
| Preguntas del agente | El agente pregunta con una tarjeta de opciones y sigue con la respuesta | ❌ solo puede preguntar en texto | P1 |
| Design guidance | Antes del primer build, una tarjeta con hasta 4 preguntas: paleta (muestras de color), tipografía (pares de fuentes), layout (wireframes); se puede saltar | ⚠️ «Design Prompt» escrito a mano; en una app nueva el agente decide solo la dirección visual (guía de primera versión), sin preguntar | P1 |
| Subagentes | Subagentes de investigación y revisión, de solo lectura y en paralelo, que devuelven solo las conclusiones | ⚠️ equipo planificador/datos/backend/ui/QA, pero la vía rápida no delega | P2 |
| Instrucciones (workspace + proyecto) | Reglas que siempre se incluyen en el contexto | ⚠️ System/Design Prompt por proyecto; no hay instrucciones de cuenta | P2 |
| Contexto precargado | El agente recibe de entrada los archivos relevantes y no los vuelve a leer | ✅ mapa del proyecto y archivos elegidos por `selectContext`, también en el agente rápido | — |
| Primera versión cuidada | En una app nueva: decidir público, funciones y estilo, empezar por el sistema de diseño, sustituir la plantilla, datos de ejemplo | ✅ guía de primera versión (`FIRST_BUILD`), solo en la petición que crea la app | — |
| Alcance y autonomía | Hacer solo lo pedido; no pedir al dueño lo que el agente puede hacer con sus herramientas | ✅ reglas del prompt | — |
| Memoria | El agente guarda solo preferencias, enfoques descartados, decisiones de diseño y datos del negocio (precios, horarios, palabras prohibidas) y los aplica en conversaciones futuras. Hay memoria de proyecto (compartida por los editores) y memoria personal; se pueden ver, editar y apagar | ⚠️ resumen acumulado de la conversación; no son hechos estructurados ni editables | P1 |
| Skills | Playbooks en markdown (nombre, descripción, instrucciones) que se cargan bajo demanda o con `/comando`; se importan de GitHub o ZIP; incluye skills propias (accesibilidad, SEO, rediseño) | ❌ | P2 |
| Referencias entre proyectos | Reutilizar código, archivos o el chat de otro proyecto (`@proyecto`) | ❌ | P3 |
| Generar archivos y analizar datos | Ejecutar código en el chat (CSV → gráficas, PDF, XLSX) y construir a partir del resultado | ❌ | P3 |
| Herramientas extra del agente | Búsqueda web, descargar recursos a la app, generar y editar imágenes, leer PDF/DOCX/XLSX adjuntos, guías bajo demanda (sacar del prompt las secciones poco usadas), leer la analítica de la app | ⚠️ solo `fetch_url` | P2 |
| Dictado por voz | Dictar el prompt | ❌ | P4 |
| Deshacer desde el chat | Revertir el cambio de un mensaje | ✅ checkpoint por turno y restaurar | — |
| «Intentar arreglar» | Botón ante errores de compilación o de ejecución | ✅ Problemas + arreglo automático | — |
| Chats de workspace | Chat fuera de un proyecto, con conectores, que envía el trabajo a un proyecto | ❌ | P4 |

## 2. Verificación, pruebas y calidad

| Lovable | Qué hace | Forja | Prio |
| --- | --- | --- | --- |
| Browser testing | El agente abre la vista previa en un navegador remoto: hace clic, rellena formularios, navega, captura pantallas, lee consola y red, prueba móvil/tablet/escritorio y usa la sesión del usuario que tenga iniciada | ✅ `browser_test` (Chromium sin interfaz contra la vista previa: pasos, capturas que el modelo ve, consola, red, móvil/tablet/escritorio, sesión de un usuario de la app); lo usan ui, QA y el agente rápido | — |
| Pruebas escritas solas | Cuando cambia una regla (precio, límite, permiso, fecha) escribe una prueba pequeña y la ejecuta antes de dar el trabajo por terminado; no prueba textos ni estilos | ⚠️ `helpers/*.spec.ts` + `run_tests`, pero no se exige | P1 |
| Pruebas de funciones backend | Llamar la función directamente y añadir un «edge test» | ✅ `call_endpoint` · ❌ pruebas de endpoints persistentes | P2 |
| Logs y red durante la verificación | Consola, peticiones y errores de build como señales | ✅ `get_problems` / `get_logs` | — |
| Monitorización del proyecto | Revisión programada (diaria o semanal; si hubo cambios o siempre) del código y de los errores de los visitantes; avisa por correo y deja el arreglo en el chat | ❌ | P2 |

## 3. Editor y vista previa

| Lovable | Qué hace | Forja | Prio |
| --- | --- | --- | --- |
| Vista previa con tamaños | Teléfono / tableta / escritorio, enlace de vista previa compartible | ✅ | — |
| Seleccionar elementos | Clic (y Ctrl+clic para seleccionar varios) → la referencia queda adjunta al chat | ⚠️ selección de un solo elemento | P1 |
| Editar texto inline | Cambiar texto directamente en la vista previa sin gastar créditos | ❌ | P1 |
| Dibujar anotación | Dibujar sobre la vista previa; se envía como imagen con la petición | ❌ | P2 |
| Comentarios en elementos | Comentarios anclados a elementos, para uno mismo o el equipo | ❌ | P2 |
| Code mode | Explorar y buscar el código, editarlo a mano, citar líneas en el chat, descargar | ⚠️ descargar código; no hay editor | P2 |
| Historial de versiones | Cada cambio es una versión: previsualizar una antigua, revertir, marcar como estable | ✅ registro + checkpoints · ❌ previsualizar una versión antigua sin restaurarla | P2 |
| Drafts | Copia del proyecto con su propio chat y su propia vista previa; «aceptar» integra los cambios; comparte la BD real; las tablas nuevas se crean al aceptar | ❌ | P2 |
| Paleta de comandos y atajos | Buscar proyectos y acciones | ✅ Ctrl+K | — |

## 4. Proyectos

| Lovable | Forja | Prio |
| --- | --- | --- |
| Crear, carpetas, buscar, ordenar, renombrar, borrar con 60 días para restaurar | ✅ (⚠️ borrado sin periodo de gracia) | P3 |
| Remix (copia independiente; se puede permitir a otros) | ⚠️ duplicar, solo dentro de la propia cuenta | P2 |
| Importar desde Replit/Bolt/v0/ZIP (migra código, BD y usuarios) | ❌ | P3 |
| Importar una web propia desde su URL | ❌ | P3 |
| Build with URL (`?prompt=…&images=…` crea un proyecto) | ❌ | P3 |
| Plantillas de diseño y design systems reutilizables | ❌ | P2 |
| Figma (plugin, MCP, `.fig`), componentes de 21st.dev, fuentes de Google | ❌ (fuentes de Google: el agente puede enlazarlas si se permite) | P3 |
| Plantilla con SSR (TanStack Start) para SEO y vistas previas al compartir enlaces | ❌ solo SPA, sin prerender | P2 |
| Paquetes npm (gráficas, drag & drop, animaciones) | ✅ cualquier paquete de npm con versión exacta en el `package.json` del proyecto, instalado sin scripts y compartido entre proyectos; React siempre una sola copia | — |
| Build secrets / registro npm privado | ⚠️ un registro para todo el servidor (`FORJA_NPM_REGISTRY`); no hay registro ni credenciales por proyecto | P4 |

## 5. Backend incluido («Cloud»)

| Lovable | Forja | Prio |
| --- | --- | --- |
| Base de datos: vista de tablas, editar filas, SQL, cambiar estructura | ✅ Datos (tablas, SQL, exportar) · ⚠️ editar filas a mano | P3 |
| Control de acceso (RLS): revisar las políticas por tabla, pedir al agente que cambie una | ⚠️ la autorización vive en los endpoints; no hay una vista de «quién puede qué» | P2 |
| Rendimiento: avisos de carga, consultas lentas, capacidad | ❌ | P4 |
| Copias diarias, restaurar, exportar completo | ⚠️ exportar (tar) · ❌ copias y restauración | P2 |
| Pausar, reanudar o eliminar la BD | ✅ se duerme sola | — |
| Auth email: confirmación, reglas de contraseña, OTP, límites de envío | ✅ contraseña + código de 8 dígitos · ❌ confirmación de correo, enlace mágico/OTP de acceso | P2 |
| Google / Apple / Microsoft (gestionado o con credenciales propias) | ❌ | P2 |
| Teléfono (SMS OTP con proveedor propio) | ❌ | P3 |
| SAML SSO y OIDC para los usuarios de la app | ❌ | P4 |
| «Sign in with Lovable» (proveedor OIDC) y reutilizar la identidad del workspace en apps internas | ❌ → «Iniciar sesión con Forja» | P3 |
| Storage: buckets, acceso público/privado | ✅ (sin buckets ni CDN) | P3 |
| Secretos | ✅ | — |
| Jobs: historial de ejecuciones, activar/desactivar | ✅ tareas · ⚠️ historial y botón de activar | P3 |
| Funciones edge: invocaciones, tasa de éxito, logs | ✅ endpoints + logs · ⚠️ métricas por endpoint | P3 |
| Logs buscables (funciones, BD, auth, storage) | ⚠️ en memoria, 500 por proyecto | P2 |
| Uso y costes del proyecto (hosting + backend) | ✅ uso de IA · ⚠️ coste de hosting | P4 |

## 6. IA dentro de las apps

| Lovable | Forja | Prio |
| --- | --- | --- |
| Chat/texto, con razonamiento visible y prioridad | ✅ `ctx.ai.chat` / `ai.chat` | — |
| Imágenes (generar/editar, máscaras, fondo transparente) | ❌ | P2 |
| Vídeo, música | ❌ | P4 |
| Búsqueda semántica / RAG (embeddings) | ❌ (PGlite admite `vector`) | P2 |
| Decisiones tipadas (categoría, puntuación, sí/no) | ⚠️ con `tools` se puede, pero no hay helper | P3 |
| Texto a voz, voz a texto, asistente de voz en vivo | ❌ | P3 |
| Avisos de modelos retirados | ❌ | P4 |

## 7. Conectores e integraciones

| Lovable | Forja | Prio |
| --- | --- | --- |
| Conectores app + chat (Slack, HubSpot, Sheets…): se conectan una vez y los usan tanto el agente como la app publicada, a través de una pasarela que guarda las credenciales | ⚠️ integraciones de cuenta con claves; no hay OAuth gestionado ni pasarela | P2 |
| App user connectors: cada usuario final conecta su propia cuenta | ❌ | P3 |
| Conectores personalizados para cualquier REST (endpoint, auth, conocimiento) | ⚠️ «API genérica» con clave | P3 |
| Conectores de chat (MCP): el constructor lee Notion, Linear, Jira… mientras construye; MCP propio; registros de MCP | ❌ (Forja *es* servidor MCP, pero no *consume* MCP) | P2 |
| Catálogo de unos 100 conectores (datos, mensajería, CRM, pagos, CMS, mapas, analítica…) | ❌ | P3: empezar por Stripe, Resend, Google Workspace, Slack y Notion |
| Pagos incluidos (Paddle o Stripe, suscripciones) | ⚠️ Stripe con clave propia | P2 |
| Correo de marca desde dominio propio con DNS automático (SPF/DKIM/DMARC) | ⚠️ verificación manual | P3 |
| Sincronización Git en dos sentidos con GitHub / GitLab / Bitbucket | ✅ GitHub · ❌ GitLab, Bitbucket | P4 |
| Publicar la app como servidor MCP (herramientas, inicio de sesión, permisos) | ❌ | P3 |

## 8. Seguridad

| Lovable | Forja | Prio |
| --- | --- | --- |
| Quick scan al publicar (reglas de acceso de la BD, dependencias vulnerables, MCP sin auth) | ❌ | **P1** (versión Forja: endpoints sin `requireUser`, SQL concatenado, secretos en páginas o `static/`, `dangerouslySetInnerHTML`, endpoints de escritura sin zod) |
| Deep scan (lectura de todo el código por un agente: autorización, abuso sin autenticar, datos de otros) | ⚠️ QA revisa la seguridad solo en la vía de equipo | P1 |
| Vista Seguridad del proyecto (resultados, arreglar, ignorar) | ❌ | P1 |
| Trust center (`/.well-known/trust.html` y `trust.json`) | ❌ | P3 |
| Integraciones Aikido / Wiz | ⏭️ terceros | — |
| Escaneo de datos sensibles (PII) | ❌ | P4 |

## 9. Publicar, hosting y crecimiento

| Lovable | Forja | Prio |
| --- | --- | --- |
| Publicar, despublicar, quién puede ver la app, metadatos del sitio | ✅ | — |
| Dominio propio: comprar, conectar, verificar, transferir | ❌ | P3 |
| Hosting global con HTTPS | ⚠️ local (`*.localhost`) | ⏭️ depende del despliegue |
| SEO/AEO: revisión, Search Console, palabras clave | ⚠️ robots/sitemap/meta, `useHead` (título, descripción y canónica por página) y reglas de SEO en el prompt | P3 |
| Analítica (tráfico, búsqueda, anuncios) y «qué mejorar» | ✅ analítica sin cookies · ❌ países y recomendaciones | P4 |
| Anuncios en Google y Meta | ⏭️ | — |
| Salir de Lovable (código + migrar el backend) | ⚠️ descargar código y exportar la BD | P3 |

## 10. Colaboración, workspace y empresa

| Lovable | Forja | Prio |
| --- | --- | --- |
| Invitar a proyectos, roles, cambios en tiempo real | ✅ colaboradores (`platform/members.ts`) | — |
| Enlaces de vista previa protegidos para revisores externos | ✅ enlace con token | — |
| Workspace con miembros, grupos, roles, límites de créditos por miembro | ❌ cuentas individuales | P4 |
| Recargas de créditos, alertas y límites de uso | ⚠️ créditos | P4 |
| SSO / SCIM / dominios verificados / 2FA | ❌ | P4 |
| Políticas (aprobar antes de publicar), centro de acciones, auditoría exportable a SIEM, inferencia en la UE | ❌ | P4 |
| API pública (proyectos, publicar, escaneos, analítica, embed) + webhooks firmados (proyecto creado/publicado, hook antes de enviar un mensaje) | ⚠️ MCP | P3 |
| Apps de escritorio y móvil, bots de Slack y Telegram, app para ChatGPT | ⚠️ MCP para Claude/ChatGPT | P4 |

## Hoja de ruta propuesta

**Ronda 1 (P1, núcleo del constructor)**
1. ✅ **Paquetes npm** para las apps: `add_dependency` y `remove_dependency` fijan la versión exacta en el `package.json` del proyecto. Cada conjunto de dependencias se instala una vez, sin ejecutar scripts, en `node_modules/.forja-deps/<hash>`; esbuild lo empaqueta para el navegador y los endpoints lo cargan desde ahí.
2. ✅ **Pruebas en navegador** del agente: herramienta `browser_test` (Chromium sin interfaz contra la vista previa: pasos de clic/escritura/navegación, captura de pantalla que se devuelve como imagen, consola y red, tamaño de pantalla, sesión de un usuario de la app).
3. **Escaneo de seguridad**: rápido y determinista al publicar, y profundo con un agente de solo lectura. Vista Seguridad con los hallazgos y «Arreglar».
4. **Memoria de proyecto**: hechos y preferencias estructurados (herramienta `remember`, más extracción en `updateSummary`) que se inyectan en el prompt y se pueden ver y editar en Ajustes.
5. **Preguntas al dueño con opciones** (`ask_owner`), incluidas las preguntas de diseño del primer build (paleta, tipografía, layout).
6. **Objetivos largos** (`/goal`): turno sin límite de pasos fijo, con pausas por créditos y un cierre con resumen; **seguimientos en caliente** inyectados en el turno en curso.
7. **Barra de la vista previa**: multi-selección, edición de texto inline sin LLM (que se aplica como `edit_file` directo).

**Ronda 2 (P2)**: herramientas extra del agente (búsqueda web, recursos, imágenes, documentos adjuntos, guías bajo demanda), drafts, versión antigua en vista previa, comentarios y anotaciones, editor de código, skills e instrucciones de cuenta, conectores MCP para el constructor, OAuth Google/Microsoft, copias de la BD, logs persistentes, IA de imágenes y embeddings, pagos con suscripciones, monitorización programada, SSR/prerender.

**Rondas 3–4**: el resto de las tablas, según demanda.
