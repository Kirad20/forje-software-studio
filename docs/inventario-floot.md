# Inventario de interfaz de Floot → Forja

Recorrido del 30-oct-2026 por `floot.com` con una cuenta real (gratuita). Se replica la **estructura y el flujo**, no la marca: Forja mantiene su nombre, logo, paleta (tinta + índigo) y textos propios.

Leyenda: ✅ ya estaba · 🆕 se añade en esta ronda · ⏭️ fuera de alcance (motivo)

## Barra lateral del panel

| Floot | Forja |
| --- | --- |
| Projects | ✅ Proyectos |
| Plan & usage: tarjeta de plan + 3 medidores (acciones de construcción/día, créditos IA, hosting) | 🆕 Plan y uso con medidores reales (acciones de hoy, créditos, almacenamiento) |
| Integrations: claves a nivel de cuenta (OpenAI, Anthropic, PostgreSQL, API genérica), reutilizables entre proyectos | 🆕 Integraciones de cuenta, conectables a cada proyecto |
| Account: perfil, agentes conectados, idioma, 2FA, sesiones, borrar cuenta | 🆕 Perfil (nombre), agentes conectados (= tokens MCP), tema, cerrar otras sesiones, borrar cuenta · ⏭️ 2FA, idioma |
| Refer and earn, Discord | ⏭️ sin programa de referidos ni comunidad |

## Panel de proyectos

| Floot | Forja |
| --- | --- |
| Caja superior "Build me a …" con texto animado y botón dividido (copiar prompt, conectar otra IA) | 🆕 |
| Pestañas "Your projects (n)" / "Shared with you (n)" | 🆕 pestañas · ⏭️ compartidos (sin colaboradores aún) |
| Buscar, Carpeta (todas / sin carpeta / nueva…), Favoritos (n), Estado (publicado / privado / sin publicar / archivado), Orden (abierto / editado / nombre), vista lista/cuadrícula | 🆕 todo |
| Tarjeta: estado, estrella, menú ⋯ (renombrar, duplicar, favorito, archivar, mover a carpeta, borrar), enlaces (app en vivo, abrir agente) | 🆕 todo |
| Vista lista: Nombre, Estado, Carpeta, Abierto, Dueño, Enlaces | 🆕 |

## Vista de proyecto

| Floot | Forja |
| --- | --- |
| Fila 1: menú de marca (cuenta, proyectos, tema, salir) · chip del proyecto → ajustes · Preview / Services + atajos Datos y Correo · pantalla completa · selector de página "Home • Live" · recargar · colaboradores · Edit · Publish | 🆕 misma estructura · ⏭️ colaboradores |
| Fila 2 (preview): Checkpoint, Select, Annotate, dispositivo (Escritorio, iPhone 393×852, Pixel 412×915, iPad 820×1180, Responsive) | 🆕 Checkpoint, Select, dispositivo con Responsive · ⏭️ Annotate (requiere captura del iframe de otro origen) |
| Tarjeta "Setting up preview" con pasos | 🆕 |
| Ctrl/Cmd+K: buscador de páginas y componentes | 🆕 páginas y componentes |
| Edit: abre el agente externo (Claude/ChatGPT) o copia un prompt | 🆕 Edit abre el chat del constructor integrado; además copia el prompt para un agente MCP |
| Checkpoints: línea de tiempo por cambio (creó/editó/cambió N archivos, autor, hora, restaurar), checkpoints con nombre y descripción, marca "Website published" | 🆕 registro de cambios con autor y restaurar a cualquier punto |
| Ajustes del proyecto: nombre/icono, compartir enlace de preview, duplicar, descargar código, System Prompt y Design Prompt, visibilidad, IP fija, móvil, uso (líneas de código, créditos) | 🆕 todo salvo ⏭️ IP fija y móvil |

## Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado)

| Floot | Forja |
| --- | --- |
| Data: tabla con selector, buscar, Add Row, selección, paginación, ajustes (exportar) | 🆕 buscar, añadir fila, borrar seleccionadas, paginación |
| AI: interruptor, créditos por modelo | ✅ |
| Integrations: conectar una integración guardada | 🆕 |
| Analytics: visitantes actuales, totales, vistas, top páginas/referentes/países/navegadores/dispositivos | 🆕 sin cookies; ⏭️ países (sin base GeoIP) |
| Apps (apps conectadas) | ⏭️ |
| SEO: nombre, descripción, robots.txt, sitemap.xml, prerender, dominio principal | 🆕 nombre, descripción, robots, sitemap · ⏭️ prerender, dominio |
| Docs: markdown del agente en `static/__dev/` | 🆕 (excluido de la publicación) |
| Schedules, Storage (estático/público/privado + uso), Email, Payments | ✅ (Storage gana desglose) |
| Notification (push) | ⏭️ |
| Advanced → Code | ✅ |
