// home.jsx — AI Workforce Command Center (flagship dashboard)
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function KpiBar() {
  const { KPIS } = window.LondonData;
  const colorFor = { agents:"var(--violet)", revenue:"var(--green)", signals:"var(--cyan)", tasks:"var(--blue)" };
  return (
    <div className="kpi-grid stagger">
      {KPIS.map(k => (
        <div key={k.key} className="kpi card-hover">
          <div className="kpi-top">
            <span className="kpi-ic" style={{background: k.key==="revenue"?"var(--green-bg)":k.key==="signals"?"var(--cyan-bg)":k.key==="tasks"?"var(--blue-bg)":"var(--violet-tint)", color: colorFor[k.key]}}>
              <Icon name={k.icon} size={16}/>
            </span>
            <span className="kpi-label">{k.label}</span>
          </div>
          <div className="kpi-val">
            <CountUp value={k.value} decimals={k.key==="revenue"?1:0} prefix={k.prefix||""} suffix={k.key==="agents"?"":""}/>
            {k.suffix && k.key!=="revenue" ? <span style={{fontSize:15,color:"var(--ink-3)"}}>{k.suffix}</span> : (k.key==="revenue"?<span style={{fontSize:18,color:"var(--ink-3)"}}>M</span>:null)}
          </div>
          <div className="kpi-bottom">
            <div>
              <span className={`kpi-delta ${k.dir}`}><Icon name={k.dir==="up"?"arrowUp":"arrowDown"} size={12} sw={2.4}/>{k.delta}</span>
              <div className="kpi-delta-label" style={{marginTop:3}}>{k.sub}</div>
            </div>
            <Sparkline data={k.spark} w={92} h={32} color={colorFor[k.key]}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function relTime(min){
  if(min<1) return "just now";
  if(min<60) return min+"m ago";
  const h=Math.floor(min/60); return h+"h ago";
}

function LiveFeed() {
  const { FEED_SEED, FEED_STREAM, SIGNAL_TYPES } = window.LondonData;
  const [items, setItems] = useStateH(()=>FEED_SEED.map((f,i)=>({...f, _id:"s"+i, _new:false})));
  const idx = useRefH(0);
  const counter = useRefH(100);
  useEffectH(()=>{
    const t = setInterval(()=>{
      const src = FEED_STREAM[idx.current % FEED_STREAM.length];
      idx.current++;
      const item = {...src, _id:"n"+(counter.current++), min:0, _new:true};
      setItems(prev => [item, ...prev.map(p=>({...p, min:p.min+1, _new:false}))].slice(0,9));
    }, 7000);
    return ()=>clearInterval(t);
  },[]);
  // tick timestamps every minute
  useEffectH(()=>{ const t=setInterval(()=>setItems(p=>p.map(i=>({...i,min:i.min+1}))),60000); return ()=>clearInterval(t); },[]);

  return (
    <Panel className="card-hover" style={{display:"flex",flexDirection:"column",minHeight:0}}
      title="Live GTM Intelligence" icon="signal"
      right={<><span className="live-chip"><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Streaming</span></>}>
      <div style={{padding:"8px 16px",borderBottom:"1px solid var(--border-faint)",display:"flex",alignItems:"center",gap:8}}>
        <Icon name="globe" size={13} style={{color:"var(--violet)"}}/>
        <span style={{fontSize:11.5,color:"var(--ink-2)"}}>Powered by <strong style={{color:"var(--ink)"}}>Bright Data</strong> · 4.2M sources/day</span>
        <span className="mono ml-auto" style={{fontSize:10.5,color:"var(--ink-3)"}}>{items.length} active</span>
      </div>
      <div style={{overflowY:"auto",flex:1,maxHeight:460}}>
        {items.map(it=>{
          const st = SIGNAL_TYPES[it.type];
          return (
            <div key={it._id} className={`feed-item ${it._new?"feed-enter":""}`}>
              <div className="feed-ic" style={{background:st.bg,borderColor:"transparent"}}>
                <span style={{color:st.color}}><Icon name={st.icon} size={16}/></span>
              </div>
              <div className="feed-main">
                <div className="feed-title">{it.text}</div>
                <div className="feed-meta">
                  <Logo name={it.company} size={16} radius={5}/>
                  <span className="feed-company">{it.company}</span>
                  <Badge tone="gray">{st.label}</Badge>
                  <span className="feed-time">· {relTime(it.min)}</span>
                  <span className="ml-auto row gap-2">
                    <span className="conf-num" style={{color:it.conf>=90?"var(--green)":"var(--ink-3)"}}>{it.conf}%</span>
                    <span className="mono" style={{fontSize:10,color:"var(--ink-4)"}}>{it.agent}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ActivityTimeline() {
  const { TRACES } = window.LondonData;
  const statusBadge = { running:["green","Running"], review:["violet","Needs review"], done:["gray","Done"] };
  return (
    <Panel className="card-hover" title="Agent Activity" icon="pulse"
      right={<button className="btn btn-ghost btn-sm">View all<Icon name="chevR" size={13}/></button>}>
      <div style={{overflowY:"auto",maxHeight:498}}>
        {TRACES.map((t,i)=>{
          const [tone,lbl] = statusBadge[t.status];
          return (
            <div key={i} className="trace-row">
              <div className="trace-rail">
                <div className="trace-avatar" style={{background:t.color}}>{t.agent}</div>
                {i<TRACES.length-1 && <div className="line"></div>}
              </div>
              <div style={{flex:1,minWidth:0,paddingBottom:4}}>
                <div className="row gap-2" style={{justifyContent:"space-between"}}>
                  <Badge tone={tone} dot={t.status==="running"?"green":t.status==="review"?"violet":null}>{lbl}</Badge>
                  <span className="feed-time">{t.min===0?"now":t.min+"m ago"}</span>
                </div>
                <div style={{fontSize:13,fontWeight:500,marginTop:6,lineHeight:1.4}}>{t.action}</div>
                <div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:3,fontFamily:"var(--mono)"}}>{t.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function RightRail() {
  const { AGENTS } = window.LondonData;
  const totalCost = AGENTS.reduce((a,b)=>a+b.costMo,0);
  const avgRoi = (AGENTS.reduce((a,b)=>a+b.roiX,0)/AGENTS.length).toFixed(1);
  const avgHealth = Math.round(AGENTS.reduce((a,b)=>a+b.health,0)/AGENTS.length);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Health */}
      <Panel className="card-hover" title="Agent Health" icon="heart"
        right={<Badge tone={avgHealth>=90?"green":"amber"} dot={avgHealth>=90?"green":"amber"}>{avgHealth}% avg</Badge>}>
        <div className="panel-body" style={{paddingTop:6,paddingBottom:8}}>
          {AGENTS.slice(0,5).map(a=>(
            <div key={a.id} style={{padding:"8px 0",borderBottom:"1px solid var(--border-faint)"}}>
              <div className="row gap-2" style={{justifyContent:"space-between",marginBottom:6}}>
                <span className="row gap-2" style={{fontSize:12.5,minWidth:0}}>
                  <StatusDot status={a.status}/>
                  <span style={{fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.name}</span>
                </span>
                <span className="mono" style={{fontSize:12,color:a.health>=90?"var(--green)":a.health>=80?"var(--amber)":"var(--red)"}}>{a.health}%</span>
              </div>
              <div className="health-bar"><div className="health-fill" style={{width:a.health+"%",background:a.health>=90?"var(--green)":a.health>=80?"var(--amber)":"var(--red)"}}></div></div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Cost & ROI */}
      <Panel className="card-hover" title="Cost & ROI" icon="dollar">
        <div className="panel-body" style={{display:"flex",gap:16,alignItems:"center"}}>
          <Donut size={104} thickness={12}
            segments={[{value:6.4,color:"var(--green)"},{value:2,color:"var(--surface-sunken)"}]}
            center={<div><div className="mono" style={{fontSize:20,fontWeight:600,color:"var(--green)"}}>{avgRoi}x</div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>avg ROI</div></div>}/>
          <div style={{flex:1}}>
            <div className="stat-row"><span className="l">Monthly spend</span><span className="v">${(totalCost/1000).toFixed(1)}K</span></div>
            <div className="stat-row"><span className="l">Cost / task</span><span className="v">$0.11</span></div>
            <div className="stat-row"><span className="l">Net influenced</span><span className="v" style={{color:"var(--green)"}}>$14.2M</span></div>
          </div>
        </div>
      </Panel>

      {/* Alerts */}
      <Panel className="card-hover" title="Alerts" icon="bell"
        right={<Badge tone="red">3 open</Badge>}>
        <div>
          {[
            {t:"Renewals agent degraded",d:"Health 74% · latency rising",tone:"amber",ic:"alert"},
            {t:"Atlas Mfg churn risk high",d:"Usage −34% MoM detected",tone:"red",ic:"trendUp"},
            {t:"Apollo integration slow",d:"640ms p95 · investigate",tone:"amber",ic:"link"},
          ].map((al,i)=>(
            <div key={i} className="row gap-3" style={{padding:"11px 16px",borderBottom:i<2?"1px solid var(--border-faint)":"none",cursor:"pointer"}}>
              <span style={{color:`var(--${al.tone==="red"?"red":"amber"})`,marginTop:1}}><Icon name={al.ic} size={16}/></span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:500}}>{al.t}</div>
                <div style={{fontSize:11,color:"var(--ink-3)",marginTop:2}}>{al.d}</div>
              </div>
              <Icon name="chevR" size={14} style={{color:"var(--ink-4)"}}/>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AccountTable() {
  const { ACCOUNTS, SIGNAL_TYPES } = window.LondonData;
  const prio = { high:["red","High"], med:["amber","Medium"], low:["gray","Low"] };
  return (
    <Panel className="card-hover" title="Account Intelligence" icon="building"
      right={<>
        <button className="btn btn-sm"><Icon name="filter" size={13}/>Filter</button>
        <button className="btn btn-sm btn-primary"><Icon name="download" size={13}/>Export</button>
      </>}>
      <div style={{overflowX:"auto"}}>
        <table className="tbl">
          <thead><tr>
            <th>Company</th><th>Signal</th><th>Confidence</th><th>Source</th><th>Recommended Action</th><th>Priority</th><th></th>
          </tr></thead>
          <tbody>
            {ACCOUNTS.map((a,i)=>{
              const st = SIGNAL_TYPES[a.type];
              const [ptone,plbl] = prio[a.priority];
              return (
                <tr key={i}>
                  <td><div className="cell-co"><Logo name={a.co}/><div><div style={{fontWeight:500}}>{a.co}</div><div className="mono" style={{fontSize:10.5,color:"var(--ink-3)"}}>{a.arr} ARR</div></div></div></td>
                  <td><span className="row gap-2"><span style={{color:st.color}}><Icon name={st.icon} size={15}/></span><span style={{fontWeight:500}}>{a.signal}</span></span></td>
                  <td><Confidence value={a.conf}/></td>
                  <td><Badge tone="gray">{a.source}</Badge></td>
                  <td><span style={{color:"var(--violet)",fontWeight:500,display:"inline-flex",alignItems:"center",gap:6}}><Icon name="zap" size={13}/>{a.action}</span></td>
                  <td><Badge tone={ptone} dot={a.priority==="high"?"red":a.priority==="med"?"amber":null}>{plbl}</Badge></td>
                  <td style={{textAlign:"right"}}><button className="icon-btn" style={{width:28,height:28,border:"none",background:"transparent"}}><Icon name="more" size={16}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function HomePage() {
  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div className="row gap-3" style={{marginBottom:4}}>
            <h1 className="page-title">AI Workforce Command Center</h1>
            <span className="live-chip" style={{marginBottom:2}}><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>7 agents working</span>
          </div>
          <p className="page-desc">Your AI revenue workforce, observed in real time — discovering signals, enriching accounts, and recommending action.</p>
        </div>
        <div className="row gap-2">
          <div className="segmented">
            <button>24h</button><button className="on">7d</button><button>30d</button><button>QTD</button>
          </div>
          <button className="btn btn-primary"><Icon name="plus" size={15}/>Deploy agent</button>
        </div>
      </div>

      <div style={{marginBottom:16}}><KpiBar/></div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.35fr) minmax(0,1fr) 332px",gap:16,marginBottom:16,alignItems:"start"}}>
        <LiveFeed/>
        <ActivityTimeline/>
        <RightRail/>
      </div>

      <AccountTable/>
    </div>
  );
}

window.HomePage = HomePage;
