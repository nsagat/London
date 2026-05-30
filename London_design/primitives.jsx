// primitives.jsx — reusable UI components + hand-built SVG charts
const { useState, useEffect, useRef } = React;

// ---------- CountUp ----------
function CountUp({ value, decimals=0, prefix="", suffix="", className="", dur=1100 }) {
  const [n, setN] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let raf, start;
    const from = 0, to = value;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const disp = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-US");
  return <span className={className} ref={ref}>{prefix}{disp}{suffix}</span>;
}

// ---------- Sparkline ----------
function Sparkline({ data, w=120, h=34, color="var(--violet)", fill=true, sw=1.8 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((d,i) => [ (i/(data.length-1))*w, h - ((d-min)/rng)*(h-6) - 3 ]);
  const line = pts.map((p,i)=> (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const area = line + ` L ${w} ${h} L 0 ${h} Z`;
  const gid = "sg-"+Math.random().toString(36).slice(2,7);
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} preserveAspectRatio="none">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      {fill && <path d={area} fill={`url(#${gid})`}/>}
      <path d={line} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.6" fill={color}/>
    </svg>
  );
}

// ---------- Area line chart (with grid + axis) ----------
function LineChart({ series, w=560, h=200, color="var(--violet)", labels=[], yfmt=(v)=>v, pad=34 }) {
  const all = series.flatMap(s=>s.data);
  const min = 0, max = Math.max(...all)*1.12 || 1;
  const innerW = w - pad - 12, innerH = h - 26 - 8;
  const x = (i,len) => pad + (i/(len-1))*innerW;
  const y = (v) => 8 + innerH - (v/max)*innerH;
  const grids = 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{display:"block"}}>
      <g className="chart-grid">
        {Array.from({length:grids+1}).map((_,i)=>{
          const gy = 8 + (i/grids)*innerH;
          return <g key={i}>
            <line x1={pad} y1={gy} x2={w-12} y2={gy}/>
            <text className="axis-label" x={pad-8} y={gy+3} textAnchor="end">{yfmt(max - (i/grids)*max)}</text>
          </g>;
        })}
      </g>
      {series.map((s,si)=>{
        const c = s.color || color;
        const pts = s.data.map((d,i)=>[x(i,s.data.length), y(d)]);
        const line = pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
        const area = line + ` L ${pts[pts.length-1][0]} ${8+innerH} L ${pts[0][0]} ${8+innerH} Z`;
        const gid = "lc-"+si+"-"+Math.random().toString(36).slice(2,6);
        return <g key={si}>
          {s.fill !== false && <><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.16"/><stop offset="100%" stopColor={c} stopOpacity="0"/>
          </linearGradient></defs><path d={area} fill={`url(#${gid})`}/></>}
          <path d={line} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </g>;
      })}
      {labels.map((l,i)=>(
        <text key={i} className="axis-label" x={x(i,labels.length)} y={h-4} textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// ---------- Bar chart ----------
function BarChart({ data, w=560, h=200, color="var(--violet)", labels=[], yfmt=(v)=>v, pad=34 }) {
  const max = Math.max(...data.map(d=>Array.isArray(d)?d.reduce((a,b)=>a+b,0):d))*1.12 || 1;
  const innerW = w - pad - 12, innerH = h - 26 - 8;
  const n = data.length;
  const bw = (innerW/n)*0.56;
  const gap = (innerW/n);
  const colors = Array.isArray(color)?color:[color];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{display:"block"}}>
      <g className="chart-grid">
        {[0,1,2,3,4].map(i=>{ const gy=8+(i/4)*innerH; return <g key={i}>
          <line x1={pad} y1={gy} x2={w-12} y2={gy}/>
          <text className="axis-label" x={pad-8} y={gy+3} textAnchor="end">{yfmt(max-(i/4)*max)}</text></g>; })}
      </g>
      {data.map((d,i)=>{
        const vals = Array.isArray(d)?d:[d];
        const cx = pad + gap*i + gap/2;
        let acc = 0;
        return <g key={i}>
          {vals.map((v,vi)=>{
            const bh = (v/max)*innerH;
            const by = 8+innerH-acc-bh; acc+=bh;
            const r = vi===vals.length-1?3:0;
            return <rect key={vi} x={cx-bw/2} y={by} width={bw} height={Math.max(bh,1)} rx={r}
              fill={colors[vi%colors.length]} opacity={vi===0?1:0.55}>
              <animate attributeName="height" from="0" to={Math.max(bh,1)} dur="0.7s" fill="freeze" begin={`${i*0.04}s`}/>
              <animate attributeName="y" from={8+innerH} to={by} dur="0.7s" fill="freeze" begin={`${i*0.04}s`}/>
            </rect>;
          })}
          {labels[i] && <text className="axis-label" x={cx} y={h-4} textAnchor="middle">{labels[i]}</text>}
        </g>;
      })}
    </svg>
  );
}

// ---------- Donut ----------
function Donut({ segments, size=120, thickness=14, center }) {
  const total = segments.reduce((a,s)=>a+s.value,0);
  const r = (size-thickness)/2, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  let off = 0;
  return (
    <div style={{position:"relative", width:size, height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={thickness}/>
        {segments.map((s,i)=>{
          const len = (s.value/total)*circ;
          const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-off} strokeLinecap="round"
            style={{transition:"stroke-dashoffset .8s ease"}}/>;
          off += len; return el;
        })}
      </svg>
      {center && <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",textAlign:"center"}}>{center}</div>}
    </div>
  );
}

// ---------- Radial gauge ----------
function Gauge({ value, size=72, color="var(--violet)", label }) {
  const r=(size-8)/2, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  const len=(value/100)*circ;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth="6"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${len} ${circ}`} style={{transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center"}}>
        <span className="mono" style={{fontSize:size*0.24,fontWeight:600}}>{value}</span>
      </div>
    </div>
  );
}

// ---------- Logo chip ----------
function Logo({ name, size=28, radius=8 }) {
  const { logoColor, initials } = window.LondonData;
  return <div className="co-logo" style={{width:size,height:size,borderRadius:radius,background:logoColor(name),fontSize:size*0.42}}>{initials(name)}</div>;
}

// ---------- Status dot ----------
function StatusDot({ status }) {
  const map = { active:["dot-green",true], healthy:["dot-green",true], running:["dot-green",true],
    degraded:["dot-amber",true], idle:["dot-gray",false], review:["dot-violet",true], done:["dot-gray",false],
    offline:["dot-red",false] };
  const [cls,pulse] = map[status] || ["dot-gray",false];
  return <span className={`dot ${cls} ${pulse?"pulse-dot":""}`} style={pulse?{color:`var(--${cls.replace("dot-","")==="green"?"green":cls.replace("dot-","")})`}:{}}></span>;
}

// ---------- Badge ----------
function Badge({ tone="gray", children, dot }) {
  return <span className={`badge badge-${tone}`}>{dot && <span className={`dot dot-${dot}`}></span>}{children}</span>;
}

// ---------- Panel ----------
function Panel({ title, icon, right, children, glass, className="", style }) {
  return (
    <div className={`panel ${glass?"panel-glass":""} ${className}`} style={style}>
      {title && <div className="panel-head">
        {icon && <span style={{color:"var(--ink-3)"}}><Icon name={icon} size={16}/></span>}
        <span className="panel-title">{title}</span>
        {right && <div className="ml-auto row gap-2">{right}</div>}
      </div>}
      {children}
    </div>
  );
}

// ---------- Confidence bar ----------
function Confidence({ value }) {
  return <div className="conf"><div className="conf-track"><div className="conf-fill" style={{width:value+"%"}}></div></div><span className="conf-num">{value}%</span></div>;
}

window.UI = { CountUp, Sparkline, LineChart, BarChart, Donut, Gauge, Logo, StatusDot, Badge, Panel, Confidence };
Object.assign(window, { CountUp, Sparkline, LineChart, BarChart, Donut, Gauge, Logo, StatusDot, Badge, Panel, Confidence });
