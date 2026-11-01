# graphify

El grafo de conocimiento vive en `graphify-out/` y debe mantenerse siempre al día.

- **Watch siempre activo:** al empezar a trabajar en este repositorio, verifica que haya un watch de graphify corriendo (`/graphify . --watch`). Si no lo hay, inícialo en segundo plano. Reconstruye el grafo automáticamente al cambiar el código, sin LLM.
- **Commitear los grafos actualizados:** cuando el watch o un `/graphify . --update` cambie `graphify-out/` (`graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`, `cache/`), incluye esos cambios en el commit para que el grafo versionado coincida con el código. No hagas commit de `.graphify_python` ni `.graphify_root` (rutas locales, ya están en `.gitignore`).
- **Docs, papers e imágenes:** el watch solo cubre código. Si cambian documentos o imágenes, corre `/graphify . --update` antes de hacer commit.
- Ante preguntas de arquitectura, consulta primero el grafo (`graphify query "<pregunta>"`).
