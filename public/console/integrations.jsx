// integrations.jsx — connected systems & health
function statusMeta(s){
  return ({
    healthy:{tone:"green",dot:"green",label:"Healthy"},
    degraded:{tone:"amber",dot:"amber",label:"Degraded"},
    idle:{tone:"gray",dot:"gray",label:"Idle"},
    offline:{tone:"red",dot:"red",label:"Offline"},
  })[s];
}

function IntegrationCard({ it }) {
  const m = statusMeta(it.status);
  return (
    <div className="panel card-hover" style={{padding:16,cursor:"pointer"}}>
      <div className="row gap-3" style={{marginBottom:12}}>
        <span style={{width:40,height:40,borderRadius:11,background:it.color+"1A",color:it.color,display:"grid",placeItems:"center",flexShrink:0}}><Icon name={it.icon} size={20}/></span>
        <div style={{flex:1,minWidth:0}}>
          <div className="row gap-2" style={{justifyContent:"space-between"}}>
            <span style={{fontSize:14,fontWeight:600}}>{it.name}</span>
            <Badge tone={m.tone} dot={m.dot}>{m.label}</Badge>
          </div>
          <div style={{fontSize:12,color:"var(--ink-2)",marginTop:2}}>{it.desc}</div>
        </div>
      </div>
      <div className="divider" style={{marginBottom:10}}></div>
      <div className="row gap-3" style={{justifyContent:"space-between"}}>
        <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Events</div><div className="mono" style={{fontSize:12.5,fontWeight:500}}>{it.events}</div></div>
        <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Latency p95</div><div className="mono" style={{fontSize:12.5,fontWeight:500,color:it.status==="degraded"?"var(--amber)":"var(--ink)"}}>{it.latency}</div></div>
        <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Category</div><div style={{fontSize:12.5,fontWeight:500}}>{it.cat}</div></div>
      </div>
    </div>
  );
}

function IntegrationsPage() {
  const { INTEGRATIONS } = window.LondonData;
  const featured = INTEGRATIONS.find(i=>i.featured);
  const rest = INTEGRATIONS.filter(i=>!i.featured);
  const healthy = INTEGRATIONS.filter(i=>i.status==="healthy").length;

  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-desc">The data and execution layer powering your AI workforce. <span style={{color:"var(--ink)"}}>{healthy}/{INTEGRATIONS.length} healthy</span>.</p>
        </div>
        <button className="btn btn-primary"><Icon name="plus" size={15}/>Add integration</button>
      </div>

      {/* health summary */}
      <div className="kpi-grid stagger" style={{marginBottom:16}}>
        <StatTileLite label="Connected systems" value="8" sub="across 5 categories" icon="link"/>
        <StatTileLite label="Events / day" value="4.4M" sub="ingested & synced" icon="database" color="var(--violet)"/>
        <StatTileLite label="Avg latency" value="264ms" sub="p95 across systems" icon="clock"/>
        <StatTileLite label="Sync uptime" value="99.98%" sub="trailing 30 days" icon="check" color="var(--green)"/>
      </div>

      {/* Featured Bright Data */}
      <div className="panel card-hover" style={{padding:0,marginBottom:16,overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(700px 240px at 88% -30%, rgba(91,43,217,0.10), transparent 70%)"}}></div>
        <div style={{padding:22,display:"flex",gap:22,alignItems:"center",position:"relative",flexWrap:"wrap"}}>
          <span style={{width:58,height:58,borderRadius:16,background:"linear-gradient(150deg,var(--violet-600),var(--violet))",color:"#fff",display:"grid",placeItems:"center",boxShadow:"var(--shadow-violet)",flexShrink:0}}><Icon name="globe" size={28}/></span>
          <div style={{flex:1,minWidth:240}}>
            <div className="row gap-2" style={{marginBottom:4}}>
              <span style={{fontSize:17,fontWeight:600}}>Bright Data</span>
              <Badge tone="violet">Intelligence engine</Badge>
              <Badge tone="green" dot="green">Healthy</Badge>
            </div>
            <p style={{fontSize:13,color:"var(--ink-2)",margin:0,maxWidth:560,lineHeight:1.5}}>The web-scale data layer behind every signal. Bright Data continuously collects funding, hiring, pricing, and technographic intelligence across millions of sources — feeding London's agents in real time.</p>
          </div>
          <div style={{display:"flex",gap:26,paddingLeft:8}}>
            <div><div className="eyebrow">Sources</div><div className="mono" style={{fontSize:20,fontWeight:600}}>4.2M<span style={{fontSize:11,color:"var(--ink-3)"}}>/day</span></div></div>
            <div><div className="eyebrow">Latency</div><div className="mono" style={{fontSize:20,fontWeight:600}}>180ms</div></div>
            <div><div className="eyebrow">Coverage</div><div className="mono" style={{fontSize:20,fontWeight:600}}>98.6%</div></div>
          </div>
          <button className="btn"><Icon name="settings" size={15}/>Manage</button>
        </div>
      </div>

      <div className="row gap-2" style={{marginBottom:12}}>
        <span className="eyebrow">Connected systems</span>
        <div className="grow divider"></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}} className="stagger">
        {rest.map(it=> <IntegrationCard key={it.name} it={it}/>)}
      </div>
    </div>
  );
}

function StatTileLite({ label, value, sub, icon, color }) {
  return (
    <div className="kpi card-hover">
      <div className="kpi-top">
        <span className="kpi-ic" style={{background:color?color+"16":"var(--violet-tint)",color:color||"var(--violet)"}}><Icon name={icon} size={16}/></span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-val" style={{color:color||"var(--ink)"}}>{value}</div>
      <div className="kpi-delta-label" style={{marginTop:8}}>{sub}</div>
    </div>
  );
}

window.IntegrationsPage = IntegrationsPage;
