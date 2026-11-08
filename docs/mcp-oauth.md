# Conectar Forja a Claude

El servidor MCP remoto de Forja admite OAuth 2.1 con PKCE y registro dinámico de clientes. En Claude, agrega un conector MCP personalizado con la URL pública de Forja seguida de `/mcp`; Claude descubrirá OAuth automáticamente y abrirá Forja para iniciar sesión y autorizar el acceso.

La instancia debe ser accesible desde internet mediante HTTPS y tener `PUBLIC_URL` (o `FORJA_DOMAIN`) configurada con su URL pública correcta. Cada usuario autoriza la conexión con su propia cuenta. El conector puede acceder a los proyectos a los que esa cuenta tiene acceso y usar las herramientas MCP de Forja; los tokens MCP creados desde **Cuenta → Tokens MCP** siguen disponibles para otros clientes.

La autorización usa códigos de un solo uso, PKCE `S256`, access tokens de una hora y refresh tokens rotatorios de 30 días. Claude puede desconectar o revocar la autorización desde la administración de conectores.
