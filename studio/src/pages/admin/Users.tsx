import { useEffect, useState } from "react";
import { api, timeAgo } from "../../api";
import { Switch } from "../../components/ui";

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
  const [users, setUsers] = useState<User[] | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const load = () => api<{ users: User[] }>("/admin/users").then((r) => setUsers(r.users));
  useEffect(() => {
    void load();
  }, []);
  if (!users) return <div className="empty"><span className="spinner" /></div>;
  const patch = async (u: User, body: Partial<User>) => {
    setError("");
    try {
      await api(`/admin/users/${u.id}`, { method: "PATCH", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const shown = users.filter((u) => !filter || `${u.email} ${u.name ?? ""}`.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="stack" style={{ gap: 12 }}>
      <input placeholder="Buscar por correo o nombre…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      {error && <div className="error-box">{error}</div>}
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
            {shown.map((u) => (
              <tr key={u.id} style={{ opacity: u.disabled ? 0.6 : 1 }}>
                <td>
                  {u.email}
                  {u.name && <div className="small muted">{u.name}</div>}
                </td>
                <td>
                  <select value={u.platformRole} onChange={(e) => void patch(u, { platformRole: e.target.value as User["platformRole"] })} style={{ width: 150 }}>
                    <option value="user">Usuario</option>
                    <option value="admin">Administración</option>
                  </select>
                </td>
                <td>{u.credits.toLocaleString()}</td>
                <td>{timeAgo(u.createdAt)}</td>
                <td>
                  <Switch on={!u.disabled} onChange={(on) => void patch(u, { disabled: !on })} label={`Acceso de ${u.email}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
