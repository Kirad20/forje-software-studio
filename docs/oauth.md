# Inicio de sesión con redes sociales y OAuth (Better Auth)

Forja usa [Better Auth](https://better-auth.com/) como motor OAuth en dos sitios:

- **Las apps que construye**: sus usuarios pueden entrar con Google, Facebook, GitHub, Apple,
  Microsoft, X, LinkedIn, Discord, etc. (todos los proveedores que trae Better Auth) y con
  **cualquier** servicio OpenID Connect u OAuth 2.0 (Keycloak, Auth0, Okta, Entra ID, Cognito,
  el SSO de una empresa, Strava…).
- **El login del Studio**: Google y Facebook desde Administración, y cualquier otro proveedor
  con el mismo formato.

## Cómo encaja

Better Auth corre **sin base de datos**. El estado OAuth, el verificador PKCE y el resultado
del callback viajan en sus cookies cifradas, así que funciona con varios procesos o réplicas.
Forja solo lo usa para la parte del proveedor: URL de autorización, callback, intercambio del
código y lectura del perfil. Con ese perfil inicia sesión con **sus propias sesiones**:

- en una app, la tabla `_forja_users` de su base de datos (cookie `forja_s_<proyecto>`);
- en el Studio, la tabla `accounts` (cookie `forja_session`).

Por eso nada de lo que ya existía cambia: correo y contraseña, códigos, recuperación, roles,
`useUser()`, `ctx.requireUser()`, las sesiones abiertas y las pruebas del constructor. Better
Auth guarda un momento en memoria el usuario de cada callback; Forja lo borra en cuanto el
callback responde, para que no crezca ni contamine el siguiente acceso.

Reglas de cuentas (en apps y en el Studio):

- La misma cuenta del proveedor llega siempre al mismo usuario: `_forja_oauth_accounts` en
  las apps y `account_oauth_identities` en el Studio, con clave `(proveedor, id de la cuenta)`.
- Un primer acceso se une a una cuenta existente con el mismo correo **solo si el proveedor
  lo verifica**, o si es un proveedor que solo comparte correos confirmados (`trustEmail`:
  Google, Apple, Microsoft, Facebook, GitHub y GitLab por defecto). Si no, se rechaza con
  «Ya existe una cuenta con ese correo». Así nadie se apropia de una cuenta con contraseña a
  través de un proveedor que no comprueba los correos.
- Sin correo en el perfil, el acceso se rechaza con el motivo.
- Las cuentas nuevas siguen la política: en las apps, `signUp` de `forja.auth.json` (por
  defecto se crean); en el Studio, el ajuste «Quién puede crear cuenta» (open, invite o closed).

## En una app: `forja.auth.json`

```json
{
  "version": 1,
  "providers": {
    "google": {},
    "facebook": {},
    "github": { "scopes": ["user:email"] },
    "microsoft": { "options": { "tenantId": "common" } },
    "empresa": {
      "type": "oidc",
      "name": "Empresa",
      "discoveryUrl": "https://sso.empresa.com/.well-known/openid-configuration"
    },
    "strava": {
      "type": "oauth2",
      "name": "Strava",
      "authorizationUrl": "https://www.strava.com/oauth/authorize",
      "tokenUrl": "https://www.strava.com/oauth/token",
      "userInfoUrl": "https://www.strava.com/api/v3/athlete",
      "scopes": ["read"],
      "profile": { "id": "id", "email": "email", "name": "firstname", "image": "profile" }
    }
  }
}
```

| Campo | Para qué |
| --- | --- |
| id (la clave) | Un proveedor integrado por su nombre, o cualquier id con `type` |
| `type` | `oidc` (con `discoveryUrl`) u `oauth2` (con `authorizationUrl`, `tokenUrl` y `userInfoUrl`); omitido = integrado |
| `name` | Texto del botón (por defecto, el nombre del proveedor) |
| `scopes` | Permisos que se piden |
| `clientIdSecret` / `clientSecretSecret` | Secretos con las credenciales (por defecto `<ID>_CLIENT_ID` y `<ID>_CLIENT_SECRET`) |
| `public` | Cliente sin secreto (solo PKCE), para proveedores genéricos |
| `options` | Opciones del proveedor que se pasan tal cual (`tenantId`, `prompt`, `hd`…) |
| `secretOptions` | Opciones cuyo valor sale de un secreto: `{ "clientKey": "TIKTOK_CLIENT_KEY" }` |
| `pkce`, `authentication` | Genéricos: PKCE (por defecto sí) y envío del secreto (`post` o `basic`) |
| `authorizationParams` | Parámetros extra de la URL de autorización |
| `profile` | Genéricos: rutas en el perfil (`"data.user.email"`); `emailVerified` opcional |
| `trustEmail` | Unirse a una cuenta existente aunque el proveedor no marque el correo como verificado |
| `signUp` (raíz) | `false`: el acceso social no crea cuentas nuevas |

Las credenciales **nunca** van en el archivo (se rechaza). Son secretos del proyecto (pestaña
Secretos). Mientras falten, el proveedor no aparece en `auth.providers()`; la vista previa lo
indica en `missing`. Un archivo inválido no se guarda y `check_build` lo señala.

URL de redirección que se registra en cada proveedor, una por entorno:

```
https://pv-<proyecto>.<dominio>/_baas/auth/oauth/callback/<id>   (vista previa)
https://<slug>.<dominio>/_baas/auth/oauth/callback/<id>          (publicada)
```

### Rutas (`/_baas/`)

| Ruta | |
| --- | --- |
| `GET auth/providers` | `{ providers: [{ id, name }] }` (en la vista previa, también `missing`) |
| `GET auth/oauth/<id>/start?redirect=/ruta` | Lleva al proveedor |
| `GET/POST auth/oauth/callback/<id>` | Vuelta del proveedor (Better Auth) |
| `GET auth/oauth/complete` | Inicia la sesión y vuelve a `redirect`, o con `?auth_error=` |
| `POST auth/oauth/<id>/begin`, `POST auth/oauth/poll` | Solo en la vista previa: ventana emergente |

### Vista previa dentro del Studio

La vista previa vive en un iframe del Studio. Los proveedores no se dejan mostrar en iframes,
y las cookies del iframe están particionadas. Por eso `auth.signInWith` abre una **ventana
emergente**: `begin` le da una URL con un enlace de vista previa de un día y una clave
aleatoria. Al terminar, la ventana deja un *ticket* (5 minutos, un solo uso) y el iframe lo
cambia por su propia sesión con `poll`. En una app publicada se usa la redirección normal y
estas rutas responden 400.

### En el código de la app

```tsx
import { auth, type AuthProvider } from "@forja/client";

const [providers, setProviders] = useState<AuthProvider[]>([]);
useEffect(() => {
  auth.providers().then(setProviders);
  const error = auth.oauthError(); // motivo si el acceso falló
  if (error) toast.error(error);
}, []);

{providers.map((p) => (
  <Button key={p.id} onClick={() => auth.signInWith(p.id, { redirectTo: "/" })}>Continuar con {p.name}</Button>
))}
```

### Con el agente o por MCP

`setup_oauth` (solo si el dueño lo pide; por MCP siempre disponible):

```json
{ "providers": ["google", "facebook"],
  "providers_json": "{\"empresa\":{\"type\":\"oidc\",\"discoveryUrl\":\"https://sso.empresa.com/.well-known/openid-configuration\"}}" }
```

Escribe `forja.auth.json`, crea la cuenta admin del dueño, pide los secretos de cada proveedor
y devuelve las URL de redirección que hay que registrar. La skill `auth` y la guía MCP
`social-auth` explican el flujo y la página de login.

## En el Studio

Administración → «Acceso con redes sociales»:

- **Google** y **Facebook**: Client ID y secreto.
- **Otros proveedores (JSON)**: el formato de `forja.auth.json`, con `clientId` y
  `clientSecret` dentro, para GitHub, Microsoft, un SSO OIDC, un servicio OAuth 2.0…
  `FORJA_OAUTH_PROVIDERS` en el entorno da su valor inicial.

URL de redirección: `<URL pública>/api/auth/oauth/callback/<id>`. La pantalla de entrada
muestra un botón por proveedor configurado.

## Límites

- La exportación standalone no incluye los servicios de plataforma (tampoco el login con
  correo): sus rutas de acceso responden 501.
- Proveedores que solo responden con `form_post` (Apple con ciertos permisos) necesitan que
  la cookie de estado viaje en un POST entre sitios. Better Auth la emite con `SameSite=Lax`,
  así que el caso más común (redirección GET) funciona y `form_post` puede requerir ajustes.
- Las credenciales de cada app son del dueño (no hay un cliente OAuth gestionado por Forja).

Pruebas: `test/unit/oauth.test.ts` (contrato, motor con un proveedor OIDC/OAuth 2.0 falso,
Google y Facebook) y `npm run test:e2e:oauth` (apps en vista previa y publicadas, ventana
emergente, protección contra apropiación de cuentas, `setup_oauth` por MCP y el login del
Studio).
