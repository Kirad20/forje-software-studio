import { useEffect, useState } from "react";
import { api } from "../application/controller.js";
import { timeAgo } from "../../../shared/presentation/format.js";
import { Select, Switch } from "../../../shared/ui.js";
import { useConfirmation } from "../../../shared/ConfirmDialog.js";

interface User {
  id: string;
  email: string;
  name: string | null;
  platformRole: "admin" | "user";
  disabled: boolean;
  credits: number;
  createdAt: string;
}

/** Admin → Usuarios: platform roles and access. Admins manage accounts, never other tenants' projects. */
export function Users() {
  const { confirm, dialog } = useConfirmation();
  const [users, setUsers] = useState<User[] | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const load = () => api<{ users: User[] }>("/admin/users").then((r) => setUsers(r.users));
  useEffect(() => {
    void load().catch((e) => setError((e as Error).message));
  }, []);
  useEffect(() => { setPage(0); }, [filter, role]);
  if (!users) return <div className="empty">{error ? <div role="alert">{error} <button onClick={() => { setError(""); void load().catch((e) => setError((e as Error).message)); }}>Reintentar</button></div> : <span className="spinner" />}</div>;
  const patch = async (u: User, body: Partial<User>) => {
    setError("");
    setPending(u.id);
    try {
      await api(`/admin/users/${u.id}`, { method: "PATCH", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  };
  const shown = users.filter((u) => (!filter || `${u.email} ${u.name ?? ""}`.toLowerCase().includes(filter.toLowerCase())) && (!role || u.platformRole === role));
  const pages = Math.max(1, Math.ceil(shown.length / 25));
  const currentPage = Math.min(page, pages - 1);
  return (
    <div className="stack" style={{ gap: 12 }}>
      {dialog}
      <div className="admin-toolbar">
        <input aria-label="Buscar usuarios" placeholder="Buscar por correo o nombre…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Select label="Filtrar usuarios por rol" value={role} onValueChange={setRole} style={{ width: 220 }}
          options={[{ value: "", label: "Todos los roles" }, { value: "user", label: "Usuarios" }, { value: "admin", label: "Administración" }]} />
      </div>
      <div className="small muted" role="status">{shown.length} de {users.length} cuentas</div>
      {error && <div className="error-box" role="alert">{error}</div>}
      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        <table className="grid">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Rol</th>
              <th>Créditos</th>
              <th>Alta</th>
              <th>Acceso</th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(currentPage * 25, (currentPage + 1) * 25).map((u) => (
              <tr key={u.id} style={{ opacity: u.disabled ? 0.6 : 1 }}>
                <td>
                  {u.email}
                  {u.name && <div className="small muted">{u.name}</div>}
                </td>
                <td>
                  <Select<User["platformRole"]> label={`Rol de ${u.email}`} value={u.platformRole} disabled={pending !== null}
                    onValueChange={async (platformRole) => {
                      if (platformRole !== u.platformRole && await confirm(`¿Cambiar el rol de ${u.email} a ${platformRole === "admin" ? "Administración" : "Usuario"}?`)) void patch(u, { platformRole });
                    }} style={{ width: 170 }} searchable={false}
                    options={[{ value: "user", label: "Usuario" }, { value: "admin", label: "Administración" }]} />
                </td>
                <td>{u.credits.toLocaleString()}</td>
                <td>{timeAgo(u.createdAt)}</td>
                <td>
                  <Switch on={!u.disabled} disabled={pending !== null} onChange={async (on) => {
                    if (on || await confirm(`¿Desactivar el acceso de ${u.email}?`)) void patch(u, { disabled: !on });
                  }} label={`Acceso de ${u.email}`} />
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={5} className="empty">No hay cuentas con estos filtros. <button onClick={() => { setFilter(""); setRole(""); }}>Limpiar filtros</button></td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="row">
        <span className="grow small muted">Página {currentPage + 1} de {pages}</span>
        <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</button>
        <button disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
      </div>}
    </div>
  );
}
