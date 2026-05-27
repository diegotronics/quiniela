import { useState } from "react";
import { createUsuario, deleteUsuario, updateUsuario } from "@/api/usuarios";
import { useUsuariosAdmin } from "@/hooks/useUsuarios";
import { styles, color, radius } from "@/styles/theme";

const EMPTY = { nombre: "", email: "", password: "1234", avatar: "", color: "#553C9A" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminUsuarios() {
  const { usuarios, refresh } = useUsuariosAdmin();
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const togglePagado = async (u) => {
    await updateUsuario(u.id, { pagado: !u.pagado });
    refresh();
  };

  const guardar = async (e) => {
    e?.preventDefault();
    setError("");
    const nombre = form.nombre.trim();
    const email = form.email.trim().toLowerCase();
    if (!nombre || !email || !form.password) return;
    if (!EMAIL_RE.test(email)) {
      setError("Email inválido");
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, nombre, email };
      if (editing) {
        await updateUsuario(editing, payload);
      } else {
        const avatar = form.avatar || nombre.slice(0, 2).toUpperCase();
        await createUsuario({ ...payload, avatar });
      }
      setForm(EMPTY);
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const editar = (u) => {
    setEditing(u.id);
    setError("");
    setForm({
      nombre: u.nombre,
      email: u.email || "",
      password: u.password,
      avatar: u.avatar || "",
      color: u.color || "#553C9A",
    });
  };

  const eliminar = async (u) => {
    if (u.es_admin) return alert("No se puede eliminar al admin");
    if (!confirm(`¿Eliminar a ${u.nombre}? Sus predicciones también se borrarán.`)) return;
    await deleteUsuario(u.id);
    refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <form onSubmit={guardar} style={{ background: color.surface, borderRadius: radius.lg, padding: "1rem", border: `1px solid ${color.border}` }}>
        <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.9rem", color: color.navy }}>
          {editing ? "✏️ Editar jugador" : "➕ Agregar jugador"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} style={styles.inputForm} />
          <input type="email" placeholder="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={styles.inputForm} />
          <input placeholder="contraseña" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={styles.inputForm} />
          <input placeholder="avatar (2 letras)" maxLength={3} value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value.toUpperCase() })} style={styles.inputForm} />
          <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ ...styles.inputForm, height: 38, padding: "0.2rem" }} />
        </div>
        {error && <p style={{ color: "#c53030", margin: "0.6rem 0 0", fontSize: "0.8rem" }}>⚠️ {error}</p>}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
          <button type="submit" disabled={busy} style={{ ...styles.btnPrimary, flex: 1 }}>
            {busy ? "Guardando..." : editing ? "Actualizar" : "Crear jugador"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => { setEditing(null); setForm(EMPTY); setError(""); }}
              style={{ padding: "0.6rem 1rem", borderRadius: radius.sm, border: `1px solid ${color.border}`, background: color.surface, cursor: "pointer" }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {usuarios.map(u => (
        <div key={u.id} style={styles.card}>
          <div style={styles.avatar(u.color)}>{u.avatar || u.nombre.slice(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: color.text }}>
              {u.nombre}{" "}
              {u.es_admin && (
                <span style={{ fontSize: "0.65rem", color: color.gold, background: color.navy, padding: "0.1rem 0.4rem", borderRadius: 6 }}>
                  ADMIN
                </span>
              )}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: color.mutedSoft }}>
              {u.email} · {u.pagado ? "💚 pagado" : "💸 pendiente"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button onClick={() => togglePagado(u)} title={u.pagado ? "Marcar pendiente" : "Marcar pagado"} style={styles.btnIcon}>
              {u.pagado ? "💚" : "💸"}
            </button>
            <button onClick={() => editar(u)} style={styles.btnIcon}>✏️</button>
            {!u.es_admin && <button onClick={() => eliminar(u)} style={styles.btnIcon}>🗑️</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
