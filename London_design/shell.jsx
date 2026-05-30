// shell.jsx — app shell: sidebar nav, topbar, routing scaffold
const { useState: useStateS, useEffect: useEffectS } = React;

const NAV = [
  { id:"workspace",    label:"Workspace",      icon:"command" },
  { id:"home",         label:"Command Center", icon:"home", locked:true },
  { id:"builder",      label:"Agent Builder",  icon:"builder" },
  { id:"marketplace",  label:"Workforce Catalog", icon:"catalog" },
  { id:"analytics",    label:"Analytics",      icon:"analytics", locked:true },
  { id:"integrations", label:"Integrations",   icon:"integrations", locked:true },
];

const CRUMBS = {
  workspace:"Workspace", home:"Command Center", builder:"Agent Builder", marketplace:"Workforce Catalog",
  analytics:"Analytics", integrations:"Integrations", governance:"Policy & Audit", access:"Access Control", account:"My Account",
};

function Sidebar({ page, setPage, unlocked }) {
  return (
    <aside className="sidebar">
      <div className="side-brand">
        <img src={window.MASCOT_SRC} alt="London" style={{width:36,height:36,objectFit:"contain",flexShrink:0,marginLeft:-3}}/>
        <div>
          <div className="brand-name">London</div>
          <div className="brand-sub">GTM Intelligence</div>
        </div>
      </div>

      <div className="side-section">
        <div className="side-label">Workspace</div>
        {NAV.map(n => {
          const isLocked = n.locked && !unlocked;
          return (
          <div key={n.id} className={`nav-item ${page===n.id?"active":""} ${isLocked?"locked":""} ${n.locked&&unlocked?"nav-unlock":""}`}
            onClick={()=> isLocked ? setPage("workspace") : setPage(n.id)}>
            <Icon name={n.icon} size={17}/>
            <span>{n.label}</span>
            {isLocked && <span className="nav-lock"><Icon name="shield" size={13}/></span>}
            {!isLocked && n.id==="home" && <span className="nav-dot"><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span></span>}
            {n.id==="marketplace" && <span className="nav-badge">12</span>}
          </div>
        );})}
      </div>

      <div className="side-section">
        <div className="side-label">Governance</div>
        <div className={`nav-item ${page==="governance"?"active":""}`} onClick={()=>setPage("governance")}><Icon name="govern" size={17}/><span>Policies & Audit</span></div>
        <div className={`nav-item ${page==="access"?"active":""}`} onClick={()=>setPage("access")}><Icon name="shield" size={17}/><span>Access Control</span></div>
      </div>

      <div className="side-spacer"></div>

      <div className="side-status">
        <div className="row gap-2" style={{justifyContent:"space-between",marginBottom:8}}>
          <span className="eyebrow">System Status</span>
          <span className="live-chip"><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Live</span>
        </div>
        <div className="row gap-2" style={{justifyContent:"space-between",fontSize:12}}>
          <span className="muted">Uptime</span><span className="mono" style={{fontWeight:500}}>99.98%</span>
        </div>
        <div className="row gap-2" style={{justifyContent:"space-between",fontSize:12,marginTop:5}}>
          <span className="muted">Signal latency</span><span className="mono" style={{fontWeight:500}}>184ms</span>
        </div>
      </div>

      <div className="side-user" onClick={()=>setPage("account")} style={{cursor:"pointer",background:page==="account"?"var(--surface)":"transparent",transition:"background .14s"}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(140deg,#475569,#1e293b)",display:"grid",placeItems:"center",color:"#fff",fontFamily:"var(--mono)",fontSize:11,fontWeight:600}}>AC</div>
        <div style={{minWidth:0,flex:1}}>
          <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Avery Chen</div>
          <div style={{fontSize:11,color:"var(--ink-3)"}}>VP Revenue · Acme</div>
        </div>
        <span style={{color:"var(--ink-4)"}}><Icon name="chevR" size={15}/></span>
      </div>
    </aside>
  );
}

function Topbar({ page }) {
  const [time, setTime] = useStateS(new Date());
  useEffectS(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t); },[]);
  const hh = time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  return (
    <header className="topbar">
      <div className="crumb">
        <span className="c-root">Acme Inc</span>
        <span className="c-sep"><Icon name="chevR" size={14}/></span>
        <span className="c-page">{CRUMBS[page]}</span>
      </div>
      <div className="ml-auto row gap-3">
        <div className="searchbox">
          <Icon name="search" size={15}/>
          <span>Search accounts, agents, signals…</span>
          <span className="kbd">⌘K</span>
        </div>
        <button className="icon-btn"><Icon name="refresh" size={16}/></button>
        <button className="icon-btn">
          <Icon name="bell" size={16}/>
          <span style={{position:"absolute",top:7,right:8,width:6,height:6,borderRadius:"50%",background:"var(--red)",border:"1.5px solid var(--surface)"}}></span>
        </button>
        <div className="row gap-2" style={{paddingLeft:6,borderLeft:"1px solid var(--border)",height:24,flexShrink:0}}>
          <span className="mono" style={{fontSize:11.5,color:"var(--ink-3)",marginLeft:8,whiteSpace:"nowrap"}}>{hh} UTC</span>
        </div>
      </div>
    </header>
  );
}

// Skeleton shown briefly on page change
function PageSkeleton() {
  return (
    <div className="content-inner">
      <div className="sk" style={{height:28,width:240,marginBottom:24}}></div>
      <div className="kpi-grid" style={{marginBottom:18}}>
        {[0,1,2,3].map(i=><div key={i} className="sk" style={{height:108}}></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div className="sk" style={{height:340}}></div>
        <div className="sk" style={{height:340}}></div>
      </div>
    </div>
  );
}

window.Shell = { Sidebar, Topbar, PageSkeleton, NAV };
Object.assign(window, { Sidebar, Topbar, PageSkeleton });
