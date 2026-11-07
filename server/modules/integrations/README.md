# GitHub integration

Each Forja account can register one GitHub App with GitHub's official
manifest flow. No platform OAuth client or pasted personal token is needed.
`PUBLIC_URL` must be the public HTTPS origin; HTTP loopback is supported for local
development. App credentials are encrypted with the platform secrets key and
never returned to Studio.

The manifest uses public App visibility so it can be installed on both the
owning GitHub account and organizations. Visibility grants no repository access:
Forja uses only installations explicitly approved through the account's
session-bound installation flow, never every installation of the public App.

## HTTP API

- `POST /api/github/app/start` returns `{url, manifest}`. Submit the manifest as a
  hidden `manifest` field in a browser form POST to `url`.
- `GET /api/github/app/callback` consumes the session-bound, ten-minute, single-use
  registration state and stores the converted manifest credentials.
- `GET /api/github/app/install` redirects to installation with another single-use
  state. Its callback validates the installation using the account's App JWT.
- `GET /api/github` includes public App metadata, active installations and
  `canCreateRepo`. Apps cannot create repositories through `/user/repos`; create
  one on GitHub and select it during installation instead.
- `GET /api/github/repos?page=N` lists editable selected repositories with
  `installationId`, and `nextPage`. App pages aggregate page N of each
  installation. Legacy PAT/OAuth pages list writable user repositories.
- `GET /api/github/branches?repo=owner/name&installationId=N&page=N` lists branches
  after verifying repository selection. An omitted installation ID can be
  resolved from the account's configured App.
- `POST /api/projects/:id/github` with `mode: "link"` accepts `repo`, `branch`
  and `installationId`. It validates access and the branch before saving.
- `POST /api/github/import` accepts `{repo, branch?, installationId?, name?,
  orgId?}` and returns `{project, result, warnings}`.
- `DELETE /api/github` disables both legacy and App access: registered
  installations, pending states and legacy credentials are cleared atomically,
  cached tokens are invalidated, and project links become `lost_access`. App
  metadata/credentials remain for explicit reauthorization through a fresh
  installation flow; synchronization cannot silently mint new tokens.

Registration/install callbacks redirect only to `/integrations`; registration
states cannot be reused from another account, session or flow. Existing PAT and
platform OAuth endpoints remain available for legacy clients. Linking an empty
legacy repository without a specified branch retains its initialization behavior.

## Native imports and synchronization

Imports fetch and validate a complete remote snapshot before creating a project.
Only native paths supported by the projects module are imported: pages,
components, helpers, endpoints, jobs, migrations, static assets, base.css,
package.json and forja.services.json. Projects without native JSX/TSX pages,
recognized foreign frameworks, secrets, links/submodules, corrupted blobs,
truncated trees and oversized content are rejected. Limits are 2,000 native
files, 1 MB per file and 16 MB total; HTTP API responses are bounded and time out.

Initial import creates no starter files and makes **no repository writes**. Its
saved commit/tree/blob baseline enables the existing two-way synchronizer.
Unmanaged paths such as README and .github stay on GitHub and are preserved by
future commits using `base_tree`. Native SQL migrations are imported as UTF-8
files, not executed or applied to production. Build problems and skipped paths
are returned as warnings; package scripts are never executed by import.

Installation tokens remain server-side and refresh before expiry. Sync checks
the App installation and current repository selection, including removal or
suspension. Webhooks verify the owning App's secret (legacy signatures are
accepted only for legacy project links). Unauthorized repositories become
`lost_access` rather than continuing to synchronize.
