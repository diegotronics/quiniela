// SVG country flag — recipe-based render.
// Recipes (kind): vstripe, hstripe, cross, circle, diamond, usa, uru, chi, kor, sui, aus.

const FLAGS = {
  MEX: { kind: "vstripe", cols: ["#006847", "#fff", "#ce1126"] },
  ARG: { kind: "hstripe", cols: ["#74acdf", "#fff", "#74acdf"] },
  BRA: { kind: "diamond", cols: ["#009739", "#FFDF00", "#012169"] },
  ESP: { kind: "hstripe", cols: ["#aa151b", "#f1bf00", "#aa151b"], ratio: [1, 2, 1] },
  FRA: { kind: "vstripe", cols: ["#0055A4", "#fff", "#EF4135"] },
  GER: { kind: "hstripe", cols: ["#000", "#DD0000", "#FFCE00"] },
  ITA: { kind: "vstripe", cols: ["#008C45", "#fff", "#CD212A"] },
  POR: { kind: "vstripe", cols: ["#006600", "#FF0000"], ratio: [2, 3] },
  NED: { kind: "hstripe", cols: ["#AE1C28", "#fff", "#21468B"] },
  BEL: { kind: "vstripe", cols: ["#000", "#FAE042", "#ED2939"] },
  CRO: { kind: "hstripe", cols: ["#FF0000", "#fff", "#171796"] },
  ENG: { kind: "cross", bg: "#fff", cross: "#CE1124" },
  USA: { kind: "usa" },
  CAN: { kind: "vstripe", cols: ["#FF0000", "#fff", "#FF0000"], ratio: [1, 2, 1] },
  URU: { kind: "uru" },
  COL: { kind: "hstripe", cols: ["#FCD116", "#003893", "#CE1126"], ratio: [2, 1, 1] },
  ECU: { kind: "hstripe", cols: ["#FFD100", "#0033A0", "#EF3340"], ratio: [2, 1, 1] },
  CHI: { kind: "chi" },
  JPN: { kind: "circle", bg: "#fff", dot: "#BC002D" },
  KOR: { kind: "kor" },
  SEN: { kind: "vstripe", cols: ["#00853F", "#FDEF42", "#E31B23"] },
  MAR: { kind: "circle", bg: "#C1272D", dot: null, extra: "star" },
  DEN: { kind: "cross", bg: "#C8102E", cross: "#fff" },
  SUI: { kind: "sui" },
  POL: { kind: "hstripe", cols: ["#fff", "#DC143C"] },
  CMR: { kind: "vstripe", cols: ["#007A5E", "#CE1126", "#FCD116"] },
  SCO: { kind: "cross", bg: "#0065BD", cross: "#fff", diag: true },
  AUS: { kind: "aus" },
  HON: { kind: "hstripe", cols: ["#0073CF", "#fff", "#0073CF"] },
  PER: { kind: "vstripe", cols: ["#D91023", "#fff", "#D91023"] },
  PAR: { kind: "hstripe", cols: ["#D52B1E", "#fff", "#0038A8"] },
  TUR: { kind: "circle", bg: "#E30A17", dot: null, extra: "star" },
  UKR: { kind: "hstripe", cols: ["#005BBB", "#FFD500"] },
  AUT: { kind: "hstripe", cols: ["#ED2939", "#fff", "#ED2939"] },
  SAU: { kind: "vstripe", cols: ["#006C35"] },
  NGA: { kind: "vstripe", cols: ["#008753", "#fff", "#008753"] },
  CIV: { kind: "vstripe", cols: ["#FF8200", "#fff", "#009A44"] },
  GHA: { kind: "hstripe", cols: ["#CE1126", "#FCD116", "#006B3F"] },
  CRC: { kind: "hstripe", cols: ["#002B7F", "#fff", "#CE1126", "#fff", "#002B7F"], ratio: [1, 1, 2, 1, 1] },
  PAN: { kind: "vstripe", cols: ["#fff", "#DA121A"] },
  JAM: { kind: "cross", bg: "#009B3A", cross: "#FED100", diag: true },
  VEN: { kind: "hstripe", cols: ["#FCE300", "#00247D", "#CF142B"] },
  SWE: { kind: "cross", bg: "#006AA7", cross: "#FECC00" },
  NOR: { kind: "cross", bg: "#BA0C2F", cross: "#fff" },
  FIN: { kind: "cross", bg: "#fff", cross: "#003580" },
  ISL: { kind: "cross", bg: "#02529C", cross: "#fff" },
  SRB: { kind: "hstripe", cols: ["#C6363C", "#0C4076", "#fff"] },
  IRN: { kind: "hstripe", cols: ["#239F40", "#fff", "#DA0000"] },
  QAT: { kind: "vstripe", cols: ["#fff", "#8A1538"], ratio: [1, 2] },
  IRQ: { kind: "hstripe", cols: ["#CE1126", "#fff", "#000"] },
  JOR: { kind: "hstripe", cols: ["#000", "#fff", "#007A3D"] },
};

function star5(cx, cy, ro, ri) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += (i === 0 ? "M" : "L") + (cx + r * Math.cos(a)) + " " + (cy + r * Math.sin(a)) + " ";
  }
  return d + "Z";
}

export function Flag({ code, w = 22, h = 16, rounded = 3 }) {
  const f = FLAGS[code] || { kind: "hstripe", cols: ["#ccc", "#aaa"] };
  const W = w, H = h;
  let body;

  if (f.kind === "vstripe") {
    const ratio = f.ratio || f.cols.map(() => 1);
    const sum = ratio.reduce((a, b) => a + b, 0);
    let x = 0;
    body = f.cols.map((c, i) => {
      const ww = (ratio[i] / sum) * W;
      const r = <rect key={i} x={x} y={0} width={ww + 0.2} height={H} fill={c} />;
      x += ww;
      return r;
    });
  } else if (f.kind === "hstripe") {
    const ratio = f.ratio || f.cols.map(() => 1);
    const sum = ratio.reduce((a, b) => a + b, 0);
    let y = 0;
    body = f.cols.map((c, i) => {
      const hh = (ratio[i] / sum) * H;
      const r = <rect key={i} x={0} y={y} width={W} height={hh + 0.2} fill={c} />;
      y += hh;
      return r;
    });
  } else if (f.kind === "circle") {
    body = (
      <>
        <rect width={W} height={H} fill={f.bg} />
        {f.dot && <circle cx={W / 2} cy={H / 2} r={H * 0.28} fill={f.dot} />}
        {f.extra === "star" && (
          <path d={star5(W / 2, H / 2, H * 0.32, H * 0.14)} fill="#fff" />
        )}
      </>
    );
  } else if (f.kind === "cross") {
    if (f.diag) {
      body = (
        <>
          <rect width={W} height={H} fill={f.bg} />
          <line x1={0} y1={0} x2={W} y2={H} stroke={f.cross} strokeWidth={H * 0.18} />
          <line x1={W} y1={0} x2={0} y2={H} stroke={f.cross} strokeWidth={H * 0.18} />
        </>
      );
    } else {
      body = (
        <>
          <rect width={W} height={H} fill={f.bg} />
          <rect x={W * 0.4} y={0} width={W * 0.2} height={H} fill={f.cross} />
          <rect x={0} y={H * 0.4} width={W} height={H * 0.2} fill={f.cross} />
        </>
      );
    }
  } else if (f.kind === "diamond") {
    body = (
      <>
        <rect width={W} height={H} fill={f.cols[0]} />
        <polygon
          points={`${W * 0.1},${H / 2} ${W / 2},${H * 0.12} ${W * 0.9},${H / 2} ${W / 2},${H * 0.88}`}
          fill={f.cols[1]}
        />
        <circle cx={W / 2} cy={H / 2} r={H * 0.18} fill={f.cols[2]} />
      </>
    );
  } else if (f.kind === "usa") {
    const stripes = Array.from({ length: 7 }, (_, i) => (
      <rect key={i} x={0} y={(i * H) / 6.5} width={W} height={(H / 13) * 2} fill={i % 2 === 0 ? "#B22234" : "#fff"} />
    ));
    body = (
      <>
        <rect width={W} height={H} fill="#fff" />
        {stripes}
        <rect x={0} y={0} width={W * 0.42} height={H * 0.55} fill="#3C3B6E" />
      </>
    );
  } else if (f.kind === "uru") {
    const stripes = Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={W * 0.32} y={(i * H) / 9} width={W * 0.68} height={H / 9 + 0.2} fill={i % 2 === 0 ? "#fff" : "#0038A8"} />
    ));
    body = (
      <>
        <rect width={W} height={H} fill="#fff" />
        {stripes}
        <rect x={0} y={0} width={W * 0.42} height={H * 0.55} fill="#fff" />
        <circle cx={W * 0.21} cy={H * 0.27} r={H * 0.12} fill="#FCD116" stroke="#000" strokeWidth="0.4" />
      </>
    );
  } else if (f.kind === "chi") {
    body = (
      <>
        <rect width={W} height={H / 2} fill="#fff" />
        <rect y={H / 2} width={W} height={H / 2} fill="#D52B1E" />
        <rect width={W * 0.42} height={H * 0.5} fill="#0039A6" />
      </>
    );
  } else if (f.kind === "kor") {
    body = (
      <>
        <rect width={W} height={H} fill="#fff" />
        <circle cx={W / 2} cy={H / 2} r={H * 0.28} fill="#C60C30" />
        <path
          d={`M${W / 2 - H * 0.28} ${H / 2} a ${H * 0.14} ${H * 0.14} 0 0 1 ${H * 0.28} 0 a ${H * 0.14} ${H * 0.14} 0 0 0 ${H * 0.28} 0`}
          fill="#003478"
        />
      </>
    );
  } else if (f.kind === "sui") {
    body = (
      <>
        <rect width={W} height={H} fill="#D52B1E" />
        <rect x={W * 0.42} y={H * 0.2} width={W * 0.16} height={H * 0.6} fill="#fff" />
        <rect x={W * 0.25} y={H * 0.4} width={W * 0.5} height={H * 0.2} fill="#fff" />
      </>
    );
  } else if (f.kind === "aus") {
    body = (
      <>
        <rect width={W} height={H} fill="#00247D" />
        <rect x={0} y={0} width={W * 0.42} height={H * 0.55} fill="#00247D" />
        <line x1={0} y1={0} x2={W * 0.42} y2={H * 0.55} stroke="#fff" strokeWidth="1.2" />
        <line x1={W * 0.42} y1={0} x2={0} y2={H * 0.55} stroke="#fff" strokeWidth="1.2" />
        <circle cx={W * 0.75} cy={H * 0.55} r={H * 0.08} fill="#fff" />
      </>
    );
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${W} ${H}`}
      style={{
        flexShrink: 0,
        display: "block",
        boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)",
        borderRadius: rounded,
        overflow: "hidden",
      }}
    >
      <defs>
        <clipPath id={`flagclip-${code || "x"}-${w}-${h}`}>
          <rect width={W} height={H} rx={rounded} ry={rounded} />
        </clipPath>
      </defs>
      <g clipPath={`url(#flagclip-${code || "x"}-${w}-${h})`}>{body}</g>
    </svg>
  );
}
