# Forja

Constructor de apps full-stack por chat, con su propio BaaS incluido. Es una reimplementación propia del modelo de producto de Floot (y Lovable): describes la app en un chat, un agente escribe el código, crea la base de datos y la publica. No contiene código, marca ni recursos de Floot; se reconstruyó a partir de su documentación pública (`floot.com/docs`).

## Arranque

```bash
cd forja
npm install
cp .env.example .env   # pon SECRETS_KEY y ANTHROPIC_API_KEY (u OPENAI_BASE_URL para Ollama/OpenRouter)
npm run build          # compila el studio
npm start              # http://localhost:4100
```

Desarrollo con recarga: `npm run dev` (servidor en :4100 + studio Vite en :5173). Sin SMTP, el código de acceso al studio aparece en la consola del servidor.

Pruebas: `npm run typecheck` y `npm run test:e2e`. La prueba e2e levanta su propio servidor con datos temporales y recorre el studio, todos los servicios BaaS, la vista previa, la publicación, el tiempo real y MCP (49 comprobaciones, sin LLM).

## Cómo está hecho

```
studio (React)  ──/api──▶  servidor de plataforma (Hono, Node 22+)
                              ├─ builder/   agente LLM + herramientas (archivos, SQL, build, logs, publicar…)
                              ├─ mcp/       las mismas herramientas como servidor MCP remoto (/mcp, token Bearer)
                              ├─ runtime/   bundler esbuild desde archivos en BD, servidor de apps, publicación
                              ├─ baas/      Postgres por proyecto, auth, archivos, correo, IA, tareas, tiempo real, pagos, secretos
                              └─ platform/  cuentas, proyectos, archivos, checkpoints, eventos y registros
apps generadas ──▶  pv-<id>.localhost   (vista previa, enlace con token)
                    <slug>.localhost    (publicada)
```

- **Proyecto** = árbol de archivos virtual guardado en la BD de la plataforma: `pages/`, `components/`, `helpers/`, `endpoints/<ruta>_GET|POST.ts`, `jobs/`, `static/`, `base.css`. No hay disco por proyecto; esbuild compila directo desde la BD.
- **Cada app vive en su propio origen**, así su código nunca toca la sesión del studio. Dentro del iframe del studio sus cookies van particionadas (CHIPS).
- **Base de datos**: un Postgres 18 embebido (PGlite) por proyecto, compartido por vista previa y app publicada. Se "duerme" tras 60 s sin consultas y despierta en la siguiente.
- **SDK**: el navegador usa `@forja/client` (router, `api`, `useApi`, `auth`, `storage`, `realtime`, `ai`); los endpoints y tareas reciben `ctx` (`db`, `user`, `storage`, `email`, `ai`, `jobs`, `realtime`, `payments`, `env`). El manual completo que lee el agente está en `server/builder/prompt.ts`.

## Paridad con Floot

| Floot | Forja | Estado |
| --- | --- | --- |
| Chat que construye la app, preview en vivo | Chat del studio + iframe con recarga en vivo | ✅ |
| Conector MCP para Claude/ChatGPT/Cursor | `/mcp` Streamable HTTP, token Bearer, 22 herramientas | ✅ |
| Postgres gestionado que se duerme | PGlite por proyecto, duerme a los 60 s | ✅ (embebido, no Neon) |
| Pestaña Data: navegar, SQL, exportar | Datos: tablas, consola SQL, exportar | ✅ (export = tar del data dir, no pg_dump) |
| Auth email/contraseña, bloqueo, reset con código de 8 dígitos, admin del dueño | Igual | ✅ |
| Google/Microsoft sign-in gestionado | — | ❌ falta |
| Storage con CDN, 100 MB/archivo | Disco local, 100 MB/archivo | ✅ (sin CDN) |
| Correo con sandbox hasta verificar dominio | Igual; SMTP opcional | ⚠️ la verificación DNS es manual (botón) |
| Correo entrante | Endpoint de ingreso + registro | ⚠️ sin MX real |
| Floot AI con créditos, interruptor por proyecto | Forja AI: Anthropic u OpenAI-compatible, créditos, interruptor | ✅ (sin imágenes/embeddings/voz) |
| Tareas: background, timers, cron (≥5 min, 10/proyecto, 15 min) | Igual | ✅ |
| Realtime WebSocket | Canales por proyecto, publish desde servidor y navegador | ✅ (sin presencia) |
| Pagos Stripe | `ctx.payments.checkout` con clave propia | ⚠️ sin Stripe Connect ni comisión |
| Secretos que el agente nunca ve | Cifrados AES-GCM, el agente solo pide nombres | ✅ |
| Checkpoints y restaurar | Automáticos por turno + manuales | ✅ |
| Publicar a subdominio, despublicar, app privada | `<slug>.localhost`, privada por token | ✅ |
| Dominios propios, SEO, analítica, PWA/móvil nativo, apps conectadas, colaboradores, planes y facturación | — | ❌ fuera de este corte |

## Límites conocidos

- El código de los endpoints corre **dentro del proceso** de la plataforma: sirve para uso local o de confianza, no para alojar apps de terceros. Para multi-inquilino real hace falta aislar (contenedor o `isolated-vm` por app).
- `check_build` detecta errores de sintaxis y de imports (esbuild), no errores de tipos.
- Los registros viven en memoria (500 por proyecto) y se pierden al reiniciar.
- Solo están instalados `react`, `react-dom` y `zod` para las apps generadas.
