# graphify

El grafo de conocimiento vive en `graphify-out/` y debe mantenerse siempre al día.

- **Watch siempre activo:** al empezar a trabajar en este repositorio, verifica que haya un watch de graphify corriendo (`/graphify . --watch`). Si no lo hay, inícialo en segundo plano. Reconstruye el grafo automáticamente al cambiar el código, sin LLM.
- **Commitear los grafos actualizados:** cuando el watch o un `/graphify . --update` cambie `graphify-out/` (`graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`, `cache/`), incluye esos cambios en el commit para que el grafo versionado coincida con el código. No hagas commit de `.graphify_python` ni `.graphify_root` (rutas locales, ya están en `.gitignore`).
- **Docs, papers e imágenes:** el watch solo cubre código. Si cambian documentos o imágenes, corre `/graphify . --update` antes de hacer commit.
- Ante preguntas de arquitectura, consulta primero el grafo (`graphify query "<pregunta>"`).

# Ahorro de contexto

- **No leas archivos generados grandes** (`graphify-out/graph.json`, `graph.html`, `cache/`, `package-lock.json`: varios MB). Están bloqueados en `.claude/settings.json`; consúltalos con `graphify query`, `graphify explain` o `GRAPH_REPORT.md`.
- **Orienta con el grafo antes de buscar**: `graphify query "<pregunta>"` en lugar de un grep amplio o de leer carpetas enteras.
- **Búsquedas que cruzan muchos archivos** → agente `Explore` (devuelve la conclusión, no los volcados). Para lo puntual, `Grep` y `Read` con `offset`/`limit`.
- **Lee solo el rango que necesitas** de los archivos grandes (`server/modules/builder/infrastructure/BuilderTurnAdapter.ts`, `server/modules/builder/infrastructure/BuilderToolsAdapter.ts`, `README.md`).
- **Sesiones largas**: separa tareas no relacionadas en sesiones distintas y compacta (`/compact`) al terminar una fase, antes de empezar otra.
