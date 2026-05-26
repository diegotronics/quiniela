import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { calcularPuntos, flag } from "../lib/constants.js";

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("fases");

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Helvetica Neue', sans-serif", paddingBottom: "2rem" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ color: "#FFD700", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>⚙️ Panel Admin</h1>
          <p style={{ color: "#a0aec0", fontSize: "0.75rem", margin: 0 }}>La Copa Familiar</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => navigate("/app")} style={btnGhost}>← Volver</button>
          <button onClick={logout} style={btnGhost}>Salir</button>
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        <div style={{ background: "linear-gradient(135deg, #1a1a2e, #2d3748)", borderRadius: 16, padding: "1.2rem", marginBottom: "1rem" }}>
          <h2 style={{ color: "#FFD700", margin: 0, fontSize: "1.1rem" }}>Hola, {user?.nombre}</h2>
          <p style={{ color: "#a0aec0", margin: "0.3rem 0 0", fontSize: "0.8rem" }}>Solo el admin puede ver esto</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {[
            { id: "fases", label: "Fases" },
            { id: "resultados", label: "Resultados" },
            { id: "usuarios", label: "Usuarios" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "0.6rem 0.3rem", borderRadius: 10, border: "none", cursor: "pointer", background: tab === t.id ? "#1a1a2e" : "#e2e8f0", color: tab === t.id ? "#FFD700" : "#4a5568", fontSize: "0.8rem", fontWeight: 700 }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "fases" && <AdminFases />}
        {tab === "resultados" && <AdminResultados />}
        {tab === "usuarios" && <AdminUsuarios />}

        <p style={{ textAlign: "center", color: "#a0aec0", fontSize: "0.75rem", marginTop: "2rem" }}>
          <Link to="/app" style={{ color: "#2B6CB0" }}>← Volver a la app normal</Link>
        </p>
      </div>
    </div>
  );
}

function AdminFases() {
  const [fases, setFases] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const { data } = await supabase.from("fases").select("*").order("orden");
    setFases(data || []);
  };

  useEffect(() => { load(); }, []);

  const setEstado = async (id, estado) => {
    setBusy(id);
    await supabase.from("fases").update({ estado }).eq("id", id);
    await load();
    setBusy(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {fases.map(p => (
        <div key={p.id} style={card}>
          <span style={{ fontSize: "1.2rem" }}>{p.icono}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#2d3748" }}>{p.nombre}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#a0aec0" }}>Estado: {p.estado}</p>
          </div>
          <select
            value={p.estado}
            disabled={busy === p.id}
            onChange={e => setEstado(p.id, e.target.value)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#2d3748", fontSize: "0.8rem", cursor: "pointer" }}
          >
            <option value="activa">🟢 Activa</option>
            <option value="cerrada">🏁 Cerrada</option>
            <option value="bloqueada">🔒 Bloqueada</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function AdminResultados() {
  const [fases, setFases] = useState([]);
  const [selectedFase, setSelectedFase] = useState("grupos");
  const [partidos, setPartidos] = useState([]);
  const [draft, setDraft] = useState({}); // partido_id -> { goles_local, goles_visitante }
  const [busy, setBusy] = useState(null);
  const [grupo, setGrupo] = useState("A");

  useEffect(() => {
    supabase.from("fases").select("*").order("orden").then(({ data }) => setFases(data || []));
  }, []);

  useEffect(() => {
    if (!selectedFase) return;
    let cancel = false;
    (async () => {
      const { data } = await supabase.from("partidos").select("*").eq("fase_id", selectedFase);
      if (cancel) return;
      setPartidos(data || []);
      const d = {};
      (data || []).forEach(p => {
        if (p.goles_local != null && p.goles_visitante != null) {
          d[p.id] = { goles_local: p.goles_local, goles_visitante: p.goles_visitante };
        }
      });
      setDraft(d);
    })();
    return () => { cancel = true; };
  }, [selectedFase]);

  const partidosVista = useMemo(() => {
    if (selectedFase === "grupos") return partidos.filter(p => p.grupo === grupo);
    return partidos;
  }, [partidos, selectedFase, grupo]);

  const guardar = async (partido) => {
    const d = draft[partido.id];
    if (!d || d.goles_local == null || d.goles_visitante == null) {
      alert("Ingresa ambos goles antes de guardar");
      return;
    }
    setBusy(partido.id);
    try {
      const { error: e1 } = await supabase
        .from("partidos")
        .update({
          goles_local: d.goles_local,
          goles_visitante: d.goles_visitante,
          resultado_ingresado: true,
        })
        .eq("id", partido.id);
      if (e1) throw e1;

      const { data: preds, error: e2 } = await supabase
        .from("predicciones")
        .select("*")
        .eq("partido_id", partido.id);
      if (e2) throw e2;

      const real = { goles_local: d.goles_local, goles_visitante: d.goles_visitante };
      const updates = (preds || []).map(p => ({
        id: p.id,
        usuario_id: p.usuario_id,
        partido_id: p.partido_id,
        goles_local: p.goles_local,
        goles_visitante: p.goles_visitante,
        puntos_obtenidos: calcularPuntos(partido.fase_id, p, real),
        updated_at: new Date().toISOString(),
      }));

      if (updates.length > 0) {
        const { error: e3 } = await supabase.from("predicciones").upsert(updates);
        if (e3) throw e3;
      }

      const { data: refreshed } = await supabase.from("partidos").select("*").eq("fase_id", selectedFase);
      setPartidos(refreshed || []);
      alert(`✅ Resultado guardado y puntos calculados para ${updates.length} predicciones.`);
    } catch (err) {
      console.error(err);
      alert("❌ Error: " + err.message);
    } finally {
      setBusy(null);
    }
  };

  const setVal = (id, field, v) => {
    setDraft(d => ({
      ...d,
      [id]: { ...d[id], [field]: Math.max(0, Number(v) || 0) },
    }));
  };

  return (
    <div>
      <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        {fases.map(f => (
          <button key={f.id} onClick={() => setSelectedFase(f.id)} style={{ flexShrink: 0, padding: "0.5rem 1rem", borderRadius: 20, border: "none", cursor: "pointer", background: selectedFase === f.id ? "#1a1a2e" : "#e2e8f0", color: selectedFase === f.id ? "#FFD700" : "#4a5568", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
            {f.icono} {f.nombre}
          </button>
        ))}
      </div>

      {selectedFase === "grupos" && (
        <div style={{ overflowX: "auto", display: "flex", gap: "0.5rem", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
          {["A","B","C","D","E","F","G","H","I","J","K","L"].map(g => (
            <button key={g} onClick={() => setGrupo(g)} style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer", background: grupo === g ? "#FFD700" : "#e2e8f0", color: grupo === g ? "#1a1a2e" : "#4a5568", fontSize: "0.9rem", fontWeight: 700 }}>{g}</button>
          ))}
        </div>
      )}

      {partidosVista.length === 0 && (
        <p style={{ textAlign: "center", color: "#a0aec0" }}>
          No hay partidos para esta fase. Inserta los partidos en Supabase cuando se conozcan los clasificados.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {partidosVista.map(p => {
          const d = draft[p.id] || {};
          const cambiado =
            d.goles_local !== p.goles_local || d.goles_visitante !== p.goles_visitante;
          return (
            <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "0.8rem 1rem", border: `2px solid ${p.resultado_ingresado ? "#9ae6b4" : "#e2e8f0"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.7rem", color: "#a0aec0" }}>
                <span>{p.grupo ? `Grupo ${p.grupo} · ` : ""}{p.id}</span>
                <span>📅 {p.fecha}</span>
                {p.resultado_ingresado && <span style={{ color: "#276749" }}>✅ Guardado</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, textAlign: "right", fontSize: "0.85rem", color: "#2d3748", fontWeight: 600 }}>
                  {flag(p.equipo_local)} {p.equipo_local}
                </div>
                <input
                  type="number"
                  min="0"
                  value={d.goles_local ?? ""}
                  onChange={e => setVal(p.id, "goles_local", e.target.value)}
                  style={inputScore}
                />
                <span style={{ color: "#a0aec0" }}>—</span>
                <input
                  type="number"
                  min="0"
                  value={d.goles_visitante ?? ""}
                  onChange={e => setVal(p.id, "goles_visitante", e.target.value)}
                  style={inputScore}
                />
                <div style={{ flex: 1, textAlign: "left", fontSize: "0.85rem", color: "#2d3748", fontWeight: 600 }}>
                  {p.equipo_visitante} {flag(p.equipo_visitante)}
                </div>
              </div>
              <button
                onClick={() => guardar(p)}
                disabled={busy === p.id || !cambiado}
                style={{ marginTop: "0.6rem", width: "100%", padding: "0.5rem", borderRadius: 8, border: "none", background: cambiado ? "#1a1a2e" : "#e2e8f0", color: cambiado ? "#FFD700" : "#a0aec0", fontWeight: 700, fontSize: "0.8rem", cursor: cambiado ? "pointer" : "not-allowed" }}
              >
                {busy === p.id ? "Guardando..." : p.resultado_ingresado ? "Actualizar resultado" : "💾 Guardar y calcular puntos"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: "", usuario: "", password: "1234", avatar: "", color: "#553C9A" });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("usuarios").select("*").order("created_at");
    setUsuarios(data || []);
  };

  useEffect(() => { load(); }, []);

  const togglePagado = async (u) => {
    await supabase.from("usuarios").update({ pagado: !u.pagado }).eq("id", u.id);
    load();
  };

  const guardar = async (e) => {
    e?.preventDefault();
    if (!form.nombre || !form.usuario || !form.password) return;
    setBusy(true);
    if (editing) {
      await supabase.from("usuarios").update(form).eq("id", editing);
    } else {
      const avatar = form.avatar || form.nombre.slice(0, 2).toUpperCase();
      await supabase.from("usuarios").insert({ ...form, avatar });
    }
    setForm({ nombre: "", usuario: "", password: "1234", avatar: "", color: "#553C9A" });
    setEditing(null);
    setBusy(false);
    load();
  };

  const editar = (u) => {
    setEditing(u.id);
    setForm({ nombre: u.nombre, usuario: u.usuario, password: u.password, avatar: u.avatar || "", color: u.color || "#553C9A" });
  };

  const eliminar = async (u) => {
    if (u.es_admin) return alert("No se puede eliminar al admin");
    if (!confirm(`¿Eliminar a ${u.nombre}? Sus predicciones también se borrarán.`)) return;
    await supabase.from("usuarios").delete().eq("id", u.id);
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <form onSubmit={guardar} style={{ background: "#fff", borderRadius: 12, padding: "1rem", border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.9rem", color: "#1a1a2e" }}>
          {editing ? "✏️ Editar jugador" : "➕ Agregar jugador"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} style={inputForm} />
          <input placeholder="usuario" value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} style={inputForm} />
          <input placeholder="contraseña" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputForm} />
          <input placeholder="avatar (2 letras)" maxLength={3} value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value.toUpperCase() })} style={inputForm} />
          <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ ...inputForm, height: "38px", padding: "0.2rem" }} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
          <button type="submit" disabled={busy} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: "#1a1a2e", color: "#FFD700", fontWeight: 700, cursor: "pointer" }}>
            {busy ? "Guardando..." : editing ? "Actualizar" : "Crear jugador"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ nombre: "", usuario: "", password: "1234", avatar: "", color: "#553C9A" }); }} style={{ padding: "0.6rem 1rem", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>Cancelar</button>
          )}
        </div>
      </form>

      {usuarios.map(u => (
        <div key={u.id} style={card}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.color || "#553C9A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{u.avatar || u.nombre.slice(0,2).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#2d3748" }}>
              {u.nombre} {u.es_admin && <span style={{ fontSize: "0.65rem", color: "#FFD700", background: "#1a1a2e", padding: "0.1rem 0.4rem", borderRadius: 6 }}>ADMIN</span>}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#a0aec0" }}>@{u.usuario} · {u.pagado ? "💚 pagado" : "💸 pendiente"}</p>
          </div>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button onClick={() => togglePagado(u)} title={u.pagado ? "Marcar pendiente" : "Marcar pagado"} style={btnIcon}>{u.pagado ? "💚" : "💸"}</button>
            <button onClick={() => editar(u)} style={btnIcon}>✏️</button>
            {!u.es_admin && <button onClick={() => eliminar(u)} style={btnIcon}>🗑️</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

const card = { background: "#fff", borderRadius: 12, padding: "0.8rem 1rem", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.8rem" };
const btnGhost = { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#a0aec0", padding: "0.4rem 0.8rem", borderRadius: 8, fontSize: "0.75rem", cursor: "pointer" };
const btnIcon = { padding: "0.3rem 0.5rem", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.9rem" };
const inputScore = { width: 48, padding: "0.4rem", borderRadius: 8, border: "2px solid #e2e8f0", textAlign: "center", fontSize: "1rem", fontWeight: 700 };
const inputForm = { padding: "0.5rem 0.7rem", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.85rem", outline: "none" };
