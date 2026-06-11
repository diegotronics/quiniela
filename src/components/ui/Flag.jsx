// SVG country flag — recipe-based render.
// Recipes (kind): vstripe, hstripe, cross, circle, diamond, usa, uru, chi, kor,
// sui, aus, pan, mar, cze, bih, cod, rsa.
// El recipe `cross` admite `offset` (cruz nórdica desplazada al asta) e `inner`
// (cruz interior de otro color, como en Noruega e Islandia).

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
  MAR: { kind: "mar" },
  DEN: { kind: "cross", bg: "#C8102E", cross: "#fff", offset: true },
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
  PAN: { kind: "pan" },
  JAM: { kind: "cross", bg: "#009B3A", cross: "#FED100", diag: true },
  VEN: { kind: "hstripe", cols: ["#FCE300", "#00247D", "#CF142B"] },
  SWE: { kind: "cross", bg: "#006AA7", cross: "#FECC00", offset: true },
  NOR: { kind: "cross", bg: "#BA0C2F", cross: "#fff", inner: "#00205B", offset: true },
  FIN: { kind: "cross", bg: "#fff", cross: "#002F6C", offset: true },
  ISL: { kind: "cross", bg: "#02529C", cross: "#fff", inner: "#DC1E35", offset: true },
  SRB: { kind: "hstripe", cols: ["#C6363C", "#0C4076", "#fff"] },
  IRN: { kind: "hstripe", cols: ["#239F40", "#fff", "#DA0000"] },
  QAT: { kind: "vstripe", cols: ["#fff", "#8A1538"], ratio: [1, 2] },
  IRQ: { kind: "hstripe", cols: ["#CE1126", "#fff", "#000"] },
  JOR: { kind: "hstripe", cols: ["#000", "#fff", "#007A3D"] },
  RSA: { kind: "rsa" },
  CZE: { kind: "cze" },
  BIH: { kind: "bih" },
  HAI: { kind: "hstripe", cols: ["#00209F", "#D21034"] },
  CUW: { kind: "hstripe", cols: ["#002B7F", "#F9E814", "#002B7F"], ratio: [3, 1, 3] },
  TUN: { kind: "circle", bg: "#E70013", dot: "#fff" },
  EGY: { kind: "hstripe", cols: ["#CE1126", "#fff", "#000"] },
  NZL: { kind: "aus" },
  CPV: { kind: "hstripe", cols: ["#003893", "#fff", "#CF2027", "#fff", "#003893"], ratio: [6, 1, 2, 1, 2] },
  ALG: { kind: "vstripe", cols: ["#006233", "#fff"] },
  COD: { kind: "cod" },
  UZB: { kind: "hstripe", cols: ["#0099B5", "#fff", "#1EB53A"] },
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
      // Las cruces nórdicas (offset) se desplazan hacia el asta; el resto van centradas.
      const cx = f.offset ? W * 0.36 : W * 0.5;
      const vw = W * 0.16;
      const hh = H * 0.18;
      body = (
        <>
          <rect width={W} height={H} fill={f.bg} />
          <rect x={cx - vw / 2} y={0} width={vw} height={H} fill={f.cross} />
          <rect x={0} y={H / 2 - hh / 2} width={W} height={hh} fill={f.cross} />
          {f.inner && (
            <>
              <rect x={cx - vw / 4} y={0} width={vw / 2} height={H} fill={f.inner} />
              <rect x={0} y={H / 2 - hh / 4} width={W} height={hh / 2} fill={f.inner} />
            </>
          )}
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
  } else if (f.kind === "pan") {
    // Bandera cuartelada: blanco con estrella azul (sup. izq.), rojo (sup. der.),
    // azul (inf. izq.) y blanco con estrella roja (inf. der.).
    const blue = "#072357";
    const red = "#DA121A";
    const so = H * 0.17;
    const si = H * 0.07;
    body = (
      <>
        <rect width={W} height={H} fill="#fff" />
        <rect x={W / 2} y={0} width={W / 2} height={H / 2} fill={red} />
        <rect x={0} y={H / 2} width={W / 2} height={H / 2} fill={blue} />
        <path d={star5(W * 0.25, H * 0.25, so, si)} fill={blue} />
        <path d={star5(W * 0.75, H * 0.75, so, si)} fill={red} />
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
  } else if (f.kind === "mar") {
    // Marruecos: campo rojo con un pentáculo verde (estrella de cinco puntas en trazo).
    body = (
      <>
        <rect width={W} height={H} fill="#C1272D" />
        <path
          d={star5(W / 2, H / 2, H * 0.34, H * 0.165)}
          fill="none"
          stroke="#006233"
          strokeWidth={H * 0.05}
          strokeLinejoin="round"
        />
      </>
    );
  } else if (f.kind === "cze") {
    // Chequia: triángulo azul al asta sobre franjas blanca (sup.) y roja (inf.).
    body = (
      <>
        <rect width={W} height={H / 2} fill="#fff" />
        <rect y={H / 2} width={W} height={H / 2} fill="#D7141A" />
        <polygon points={`0,0 ${W * 0.5},${H / 2} 0,${H}`} fill="#11457E" />
      </>
    );
  } else if (f.kind === "bih") {
    // Bosnia y Herzegovina: campo azul, triángulo amarillo y estrellas blancas
    // en diagonal a lo largo de la hipotenusa.
    const stars = Array.from({ length: 7 }, (_, i) => {
      const t = (i + 0.5) / 7;
      const x = W * 0.5 + t * (W * 0.5) + W * 0.03;
      const y = t * H;
      return <path key={i} d={star5(x, y, H * 0.085, H * 0.038)} fill="#fff" />;
    });
    body = (
      <>
        <rect width={W} height={H} fill="#002395" />
        <polygon points={`${W * 0.5},0 ${W},0 ${W},${H}`} fill="#FECB00" />
        {stars}
      </>
    );
  } else if (f.kind === "cod") {
    // RD Congo: campo azul celeste, franja roja diagonal con borde amarillo y
    // estrella amarilla en el cantón superior.
    body = (
      <>
        <rect width={W} height={H} fill="#007FFF" />
        <line x1={0} y1={H} x2={W} y2={0} stroke="#F7D618" strokeWidth={H * 0.44} />
        <line x1={0} y1={H} x2={W} y2={0} stroke="#CE1021" strokeWidth={H * 0.26} />
        <path d={star5(W * 0.17, H * 0.22, H * 0.13, H * 0.06)} fill="#F7D618" />
      </>
    );
  } else if (f.kind === "rsa") {
    // Sudáfrica: rojo (sup.) y azul (inf.), palio verde en "Y" con borde blanco
    // y triángulo negro con filo dorado al asta.
    const green = "#007749";
    body = (
      <>
        <rect width={W} height={H / 2} fill="#E03C31" />
        <rect y={H / 2} width={W} height={H / 2} fill="#001489" />
        <line x1={0} y1={0} x2={W} y2={H / 2} stroke="#fff" strokeWidth={H * 0.42} />
        <line x1={0} y1={H} x2={W} y2={H / 2} stroke="#fff" strokeWidth={H * 0.42} />
        <line x1={0} y1={0} x2={W} y2={H / 2} stroke={green} strokeWidth={H * 0.24} />
        <line x1={0} y1={H} x2={W} y2={H / 2} stroke={green} strokeWidth={H * 0.24} />
        <polygon points={`0,0 ${W * 0.42},${H / 2} 0,${H}`} fill="#FFB915" />
        <polygon points={`0,0 ${W * 0.32},${H / 2} 0,${H}`} fill="#000" />
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
        borderRadius: rounded,
        overflow: "hidden",
        boxShadow:
          "0 1px 2px rgba(20,17,13,0.16), 0 0 0 0.5px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)",
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
