import { useMemo, useState } from "react";
import { createUsuario, deleteUsuario, updateUsuario } from "@/api/usuarios";
import { useUsuariosAdmin } from "@/hooks/useUsuarios";
import { useAsync } from "@/hooks/useAsync";
import { listPuntajesGlobales } from "@/api/predicciones";
import { countPartidos } from "@/api/partidos";
import {
  buildInviteUrl,
  createInvitacion,
  isInvitacionVigente,
  listInvitaciones,
  revokeInvitacion,
} from "@/api/invitaciones";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Button, Card, Icon, Pill } from "@/components/ui";

const EMPTY = { nombre: "", email: "", password: "", avatar: "", color: "#553C9A", es_admin: false, pagado: false };
const FILTERS = ["Todos", "Activos", "Admins"];
const COLORS = ["#553C9A", "#C53030", "#2C7A7B", "#B7791F", "#2B6CB0", "#D53F8C", "#38A169", "#DD6B20"];

export default function AdminMiembros() {
  const { user: currentUser } = useAuth();
  const { usuarios, refresh } = useUsuariosAdmin();
  const { data: puntajes } = useAsync(listPuntajesGlobales, []);
  const { data: totalPartidos } = useAsync(countPartidos, []);
  const { data: invitaciones, refresh: refreshInvitaciones } = useAsync(listInvitaciones, []);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ nombre: "", email: "" });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [lastInvite, setLastInvite] = useState(null);

  const totales = useMemo(() => {
    const m = new Map();
    for (const p of puntajes || []) {
      m.set(p.usuario_id, (m.get(p.usuario_id) || 0) + (p.puntos_obtenidos || 0));
    }
    return m;
  }, [puntajes]);

  const lista = useMemo(() => {
    const enriched = usuarios.map((u) => ({ ...u, puntos: totales.get(u.id) || 0 }));
    if (filter === "Admins") return enriched.filter((u) => u.es_admin);
    if (filter === "Activos") return enriched.filter((u) => !u.es_admin);
    return enriched;
  }, [usuarios, totales, filter]);

  const sorted = [...lista].sort((a, b) => b.puntos - a.puntos);

  const guardar = async (e) => {
    e?.preventDefault();
    if (!form.nombre || !form.email) return;
    if (editing) {
      if (form.password && form.password.length < 4) {
        return alert("La contraseña debe tener al menos 4 caracteres.");
      }
    } else if (!form.password || form.password.length < 4) {
      return alert("La contraseña debe tener al menos 4 caracteres.");
    }
    setBusy(true);
    try {
      if (editing) {
        const { password, ...rest } = form;
        const patch = password ? { ...rest, password } : rest;
        await updateUsuario(editing, patch);
      } else {
        const avatar = form.avatar || form.nombre.slice(0, 2).toUpperCase();
        await createUsuario({ ...form, avatar });
      }
      setForm(EMPTY);
      setEditing(null);
      setModalOpen(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const editar = (u) => {
    setEditing(u.id);
    setForm({
      nombre: u.nombre,
      email: u.email,
      password: "",
      avatar: u.avatar || "",
      color: u.color || "#553C9A",
      es_admin: u.es_admin,
      pagado: !!u.pagado,
    });
    setModalOpen(true);
  };

  const eliminar = async (u) => {
    if (currentUser && u.id === currentUser.id) {
      return alert("No puedes eliminar tu propia cuenta de administrador.");
    }
    if (!confirm(`¿Eliminar a ${u.nombre}? Sus predicciones también se borrarán.`)) return;
    try {
      await deleteUsuario(u.id);
      await refresh();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const eliminarDesdeModal = async () => {
    if (!editing) return;
    const u = usuarios.find((x) => x.id === editing);
    if (!u) return;
    if (currentUser && u.id === currentUser.id) {
      return alert("No puedes eliminar tu propia cuenta de administrador.");
    }
    if (!confirm(`¿Eliminar a ${u.nombre}? Sus predicciones también se borrarán.`)) return;
    setBusy(true);
    try {
      await deleteUsuario(u.id);
      setForm(EMPTY);
      setEditing(null);
      setModalOpen(false);
      await refresh();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePagado = async (u) => {
    await updateUsuario(u.id, { pagado: !u.pagado });
    refresh();
  };

  const activos = usuarios.filter((u) => !u.es_admin).length;
  const totalPicks = (puntajes || []).length;
  const partidosTotal = totalPartidos || 0;
  const invitacionesPendientes = useMemo(
    () => (invitaciones || []).filter(isInvitacionVigente),
    [invitaciones]
  );
  const participacion =
    activos > 0 && partidosTotal > 0
      ? `${Math.round((totalPicks / (activos * partidosTotal)) * 100)}%`
      : "—";

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard?.writeText(text);
      alert("Link copiado al portapapeles");
    } catch {
      alert("No se pudo copiar el link");
    }
  };

  const abrirModalInvitacion = () => {
    setInviteForm({ nombre: "", email: "" });
    setLastInvite(null);
    setInviteModalOpen(true);
  };

  const generarInvitacion = async (e) => {
    e?.preventDefault();
    if (inviteBusy) return;
    setInviteBusy(true);
    try {
      const inv = await createInvitacion({
        nombre: inviteForm.nombre,
        email: inviteForm.email,
        creada_por: currentUser?.id,
      });
      setLastInvite(inv);
      await refreshInvitaciones();
    } catch (err) {
      alert("Error al crear la invitación: " + err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  const revocarInvitacion = async (token) => {
    if (!confirm("¿Revocar esta invitación? El link dejará de funcionar.")) return;
    try {
      await revokeInvitacion(token);
      await refreshInvitaciones();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      {/* Actions bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 18 }}>
        <Button variant="ghost" onClick={() => { setForm(EMPTY); setEditing(null); setModalOpen(true); }}>
          <Icon.Plus /> Crear manual
        </Button>
        <Button variant="primary" onClick={abrirModalInvitacion}>
          <Icon.Send /> Invitar miembro
        </Button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 22 }}>
        <Kpi label="Miembros activos" val={String(activos)} sub={`${usuarios.length} en total`} />
        <Kpi
          label="Pendientes"
          val={String(invitacionesPendientes.length)}
          sub="invitaciones vigentes"
        />
        <Kpi label="Pronósticos hechos" val={String(totalPicks)} sub="totales" />
        <Kpi
          label="% participación"
          val={participacion}
          sub={partidosTotal > 0 ? `sobre ${partidosTotal} partidos` : "sin partidos cargados"}
        />
      </div>

      {/* Invitaciones pendientes */}
      <Card style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: invitacionesPendientes.length ? 14 : 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>Links de invitación familiar</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
              Generá un link único y compartilo por WhatsApp.
            </div>
          </div>
          <Button variant="primary" onClick={abrirModalInvitacion}>
            <Icon.Plus /> Nuevo link
          </Button>
        </div>

        {invitacionesPendientes.length === 0 ? (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "var(--surface-2)",
              border: "0.5px dashed var(--line)",
              fontSize: 13,
              color: "var(--ink-3)",
              textAlign: "center",
            }}
          >
            No hay invitaciones pendientes.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {invitacionesPendientes.map((inv) => (
              <InvitacionRow
                key={inv.token}
                inv={inv}
                onCopy={() => copyToClipboard(buildInviteUrl(inv.token))}
                onRevoke={() => revocarInvitacion(inv.token)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Filters */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                background: filter === f ? "var(--ink)" : "transparent",
                color: filter === f ? "var(--bg)" : "var(--ink-2)",
                border: filter === f ? "none" : "0.5px solid var(--line)",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
          Ordenar por <span style={{ color: "var(--ink)", fontWeight: 500 }}>Puntos ↓</span>
        </div>
      </div>

      {/* Tabla */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 100px 100px 90px 40px",
            padding: "10px 16px",
            background: "var(--surface-2)",
            fontSize: 11,
            color: "var(--ink-3)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            borderBottom: "0.5px solid var(--line)",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>#</span>
          <span>Miembro</span>
          <span>Rol</span>
          <span>Pago</span>
          <span style={{ textAlign: "right" }}>Puntos</span>
          <span></span>
        </div>
        {sorted.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 100px 100px 90px 40px",
              padding: "12px 16px",
              alignItems: "center",
              gap: 12,
              borderBottom: i < sorted.length - 1 ? "0.5px solid var(--line-2)" : "none",
              fontSize: 13,
            }}
          >
            <span className="mono" style={{ color: "var(--ink-3)" }}>{String(i + 1).padStart(2, "0")}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <Avatar name={u.nombre} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>{u.nombre}</div>
                <div
                  style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  className="mono"
                >
                  {u.email}
                </div>
              </div>
            </div>
            <span>
              {u.es_admin ? (
                <Pill tone="ink" size="sm">Admin</Pill>
              ) : (
                <Pill tone="outline" size="sm">Miembro</Pill>
              )}
            </span>
            <span>
              <button
                onClick={() => togglePagado(u)}
                title={u.pagado ? "Marcar como pendiente" : "Marcar como pagado"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {u.pagado ? (
                  <Pill tone="accent" size="sm"><Icon.Check /> Pagado</Pill>
                ) : (
                  <Pill tone="coral" size="sm">Pendiente</Pill>
                )}
              </button>
            </span>
            <span className="mono" style={{ textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>
              {u.puntos}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => editar(u)}
                title="Editar"
                style={{ background: "none", border: "none", padding: 6, borderRadius: 6, color: "var(--ink-3)", cursor: "pointer" }}
              >
                <Icon.Edit />
              </button>
              {(!currentUser || u.id !== currentUser.id) && (
                <button
                  onClick={() => eliminar(u)}
                  title="Eliminar"
                  style={{ background: "none", border: "none", padding: 6, borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}
                >
                  <Icon.Trash />
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Modal de crear/editar */}
      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); setEditing(null); setForm(EMPTY); }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
            {editing ? "Editar miembro" : "Invitar miembro"}
          </h3>
          <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Input
              label={editing ? "Nueva contraseña" : "Contraseña"}
              type="text"
              autoComplete="new-password"
              placeholder={editing ? "Dejar vacío para no cambiar" : "Mínimo 4 caracteres"}
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />
            <Input label="Avatar (2 letras)" value={form.avatar} maxLength={3} onChange={(v) => setForm({ ...form, avatar: v.toUpperCase() })} />

            <div>
              <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6 }}>
                Color
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    title={c}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: form.color === c ? "2px solid var(--ink)" : "0.5px solid var(--line)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color || "#553C9A"}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  style={{ width: 36, height: 28, border: "0.5px solid var(--line)", borderRadius: 6, background: "transparent", cursor: "pointer", padding: 0 }}
                />
              </div>
            </div>

            <Toggle
              label="Administrador"
              hint="Puede gestionar miembros, partidos y reglas."
              checked={!!form.es_admin}
              onChange={(v) => setForm({ ...form, es_admin: v })}
            />
            <Toggle
              label="Pago confirmado"
              hint="Marcar cuando el miembro pagó la inscripción."
              checked={!!form.pagado}
              onChange={(v) => setForm({ ...form, pagado: v })}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <div>
                {editing && (!currentUser || editing !== currentUser.id) && (
                  <Button type="button" variant="danger" onClick={eliminarDesdeModal} disabled={busy}>
                    <Icon.Trash /> Eliminar miembro
                  </Button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); setEditing(null); setForm(EMPTY); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Guardando…" : editing ? "Actualizar" : "Crear miembro"}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de invitación */}
      {inviteModalOpen && (
        <Modal
          onClose={() => {
            setInviteModalOpen(false);
            setLastInvite(null);
            setInviteForm({ nombre: "", email: "" });
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
            {lastInvite ? "Link listo" : "Invitar miembro"}
          </h3>

          {!lastInvite ? (
            <form onSubmit={generarInvitacion} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
                Generamos un link único. El familiar elige su contraseña al aceptarlo.
              </p>
              <Input
                label="Nombre (opcional)"
                value={inviteForm.nombre}
                onChange={(v) => setInviteForm({ ...inviteForm, nombre: v })}
                placeholder="Para reconocerlo en la lista"
              />
              <Input
                label="Email (opcional)"
                type="email"
                value={inviteForm.email}
                onChange={(v) => setInviteForm({ ...inviteForm, email: v })}
                placeholder="Pre-llena el formulario"
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviteBusy}>
                  {inviteBusy ? "Generando…" : "Generar link"}
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
                Compartilo por WhatsApp. Vence en 30 días o cuando lo revoques.
              </p>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  border: "0.5px solid var(--line)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-2)",
                  wordBreak: "break-all",
                }}
              >
                {buildInviteUrl(lastInvite.token)}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setInviteModalOpen(false);
                    setLastInvite(null);
                    setInviteForm({ nombre: "", email: "" });
                  }}
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => copyToClipboard(buildInviteUrl(lastInvite.token))}
                >
                  <Icon.Copy /> Copiar link
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function InvitacionRow({ inv, onCopy, onRevoke }) {
  const url = buildInviteUrl(inv.token);
  const venceEn = inv.expires_at
    ? Math.max(0, Math.round((new Date(inv.expires_at).getTime() - Date.now()) / 86400000))
    : null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 10,
        background: "var(--surface-2)",
        border: "0.5px solid var(--line)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
          {inv.nombre || inv.email || "Invitación sin destinatario"}
        </div>
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 2,
          }}
          title={url}
        >
          {url}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {venceEn !== null && (
          <Pill tone={venceEn <= 3 ? "coral" : "outline"} size="sm">
            {venceEn === 0 ? "vence hoy" : `${venceEn}d`}
          </Pill>
        )}
        <button
          onClick={onCopy}
          title="Copiar link"
          style={{ background: "none", border: "none", padding: 6, borderRadius: 6, color: "var(--ink-2)", cursor: "pointer" }}
        >
          <Icon.Copy />
        </button>
        <button
          onClick={onRevoke}
          title="Revocar"
          style={{ background: "none", border: "none", padding: 6, borderRadius: 6, color: "var(--danger)", cursor: "pointer" }}
        >
          <Icon.Trash />
        </button>
      </div>
    </div>
  );
}

function Kpi({ label, val, sub }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: "16px 16px",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="mono" style={{ fontSize: 28, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.8 }}>
          {val}
        </span>
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: "var(--ink-3)" }}>{sub}</div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        borderRadius: "var(--r-md)",
        border: "0.5px solid var(--line)",
        background: "var(--surface-2)",
        cursor: "pointer",
      }}
    >
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{label}</span>
        {hint && (
          <span style={{ display: "block", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{hint}</span>
        )}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        style={{
          position: "relative",
          width: 36,
          height: 20,
          borderRadius: 999,
          background: checked ? "var(--ink)" : "var(--line)",
          transition: "background 120ms ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--bg)",
            transition: "left 120ms ease",
          }}
        />
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
    </label>
  );
}

function Input({ label, value, onChange, type = "text", maxLength, placeholder, autoComplete }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--r-md)",
          border: "0.5px solid var(--line)",
          background: "var(--surface-2)",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,17,13,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-xl)",
          padding: 22,
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--shadow-3)",
          border: "0.5px solid var(--line)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
