// builder.jsx — Agent Builder: goals → recommended workforce → deployment → ROI
const { useState: useStateB, useMemo: useMemoB } = React;

const GOALS = [
  { id:"pipeline",  label:"Grow new pipeline",       icon:"trendUp", agents:["PRX","SIG","OUT"] },
  { id:"inbound",   label:"Convert inbound faster",  icon:"target",  agents:["QAL","ENR"] },
  { id:"churn",     label:"Reduce churn",            icon:"shield",  agents:["RNW","BRF"] },
  { id:"emea",      label:"Expand into EMEA",        icon:"globe",   agents:["MKT","PRX"] },
  { id:"compete",   label:"Win competitive deals",   icon:"zap",     agents:["CMP","BRF"] },
  { id:"forecast",  label:"Tighten forecasting",     icon:"analytics",agents:["FCT","QAL"] },
];

// extended roster incl. not-yet-deployed
const ROSTER = {
  PRX:{name:"Prospector",dept:"Sales Dev",color:"#5B2BD9",cost:1240,roi:6.4},
  SIG:{name:"Signal Scout",dept:"Intelligence",color:"#0E8F9F",cost:2100,roi:5.1},
  OUT:{name:"Outreach",dept:"Sales Dev",color:"#2563EB",cost:1680,roi:4.8},
  QAL:{name:"Qualifier",dept:"Sales",color:"#0E9F6E",cost:760,roi:7.2},
  ENR:{name:"Enricher",dept:"Intelligence",color:"#2563EB",cost:880,roi:5.3},
  RNW:{name:"Renewals",dept:"Customer Succ",color:"#7B52F0",cost:1320,roi:5.9},
  BRF:{name:"Briefer",dept:"Sales",color:"#E0353F",cost:520,roi:4.1},
  MKT:{name:"Market Mapper",dept:"Strategy",color:"#475569",cost:1100,roi:2.8},
  CMP:{name:"Competitor Watch",dept:"Strategy",color:"#D98A0B",cost:940,roi:3.6},
  FCT:{name:"Forecaster",dept:"RevOps",color:"#0E8F9F",cost:1450,roi:4.4},
};

function WorkforceGraph({ codes }) {
  // arrange agents on an arc to the right of the orchestrator
  const W=560, H=380, cx=170, cy=H/2;
  const n = codes.length;
  const nodes = codes.map((c,i)=>{
    const t = n===1 ? 0.5 : i/(n-1);
    const angle = -52 + t*104; // degrees fan
    const rad = angle*Math.PI/180;
    const R = 250;
    return { code:c, x: cx + Math.cos(rad)*R*0.9 + 110, y: cy + Math.sin(rad)*R*0.62 };
  });
  return (
    <div style={{position:"relative",height:H,width:"100%",minWidth:W}}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{position:"absolute",inset:0}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="bd-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B2BD9" stopOpacity="0.05"/><stop offset="100%" stopColor="#5B2BD9" stopOpacity="0.5"/>
          </linearGradient>
        </defs>
        {/* Bright Data feed into orchestrator */}
        <path d={`M 40 60 C 100 ${cy-60}, ${cx-40} ${cy-30}, ${cx} ${cy}`} fill="none" stroke="url(#bd-flow)" strokeWidth="2" strokeDasharray="5 5">
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite"/>
        </path>
        {nodes.map((nd,i)=>{
          const a = ROSTER[nd.code];
          return <path key={i} d={`M ${cx} ${cy} C ${cx+90} ${cy}, ${nd.x-70} ${nd.y}, ${nd.x} ${nd.y}`}
            fill="none" stroke={a.color} strokeWidth="1.8" opacity="0.34"/>;
        })}
      </svg>

      {/* Bright Data source node */}
      <div style={{position:"absolute",left:"1%",top:30,width:120}}>
        <div className="panel" style={{padding:"9px 11px",borderColor:"var(--violet-100)",background:"var(--violet-tint)"}}>
          <div className="row gap-2"><Icon name="globe" size={14} style={{color:"var(--violet)"}}/><span style={{fontSize:11.5,fontWeight:600}}>Bright Data</span></div>
          <div className="mono" style={{fontSize:9.5,color:"var(--ink-3)",marginTop:3}}>4.2M sources/day</div>
        </div>
      </div>

      {/* Orchestrator */}
      <div style={{position:"absolute",left:`${(cx/W)*100}%`,top:cy,transform:"translate(-50%,-50%)"}}>
        <div style={{width:96,height:96,borderRadius:20,background:"linear-gradient(150deg,var(--violet-600),var(--violet))",boxShadow:"var(--shadow-violet)",display:"grid",placeItems:"center",color:"#fff",textAlign:"center"}}>
          <div>
            <Icon name="cpu" size={22}/>
            <div style={{fontSize:10,fontWeight:600,marginTop:3,lineHeight:1.1}}>GTM<br/>Orchestrator</div>
          </div>
        </div>
      </div>

      {/* Agent nodes */}
      {nodes.map((nd,i)=>{
        const a = ROSTER[nd.code];
        return (
          <div key={nd.code} style={{position:"absolute",left:`${(nd.x/W)*100}%`,top:nd.y,transform:"translate(-50%,-50%)",animation:`stagger-in .5s cubic-bezier(.16,1,.3,1) ${i*0.05}s backwards`}}>
            <div className="panel card-hover" style={{padding:"8px 11px",display:"flex",alignItems:"center",gap:9,whiteSpace:"nowrap"}}>
              <span style={{width:26,height:26,borderRadius:7,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10.5,fontWeight:600}}>{nd.code}</span>
              <div>
                <div style={{fontSize:12,fontWeight:600}}>{a.name}</div>
                <div style={{fontSize:9.5,color:"var(--ink-3)"}}>{a.dept}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BuilderPage() {
  const plan = window.LONDON_PLAN || null;
  const intentGoalMap = { "grow pipeline":["pipeline"], "build your GTM team":["pipeline","inbound"], "scale outbound":["pipeline"], "monitor competitors":["compete"], "capture buying signals":["pipeline"], "reduce GTM cost":["inbound"], "hit your revenue goals":["pipeline","inbound"] };
  const unionFromGoals = (goals)=>{ const set=new Set(); GOALS.filter(g=>goals.includes(g.id)).forEach(g=>g.agents.forEach(a=>set.add(a))); return [...set]; };
  const initGoals = plan ? (intentGoalMap[plan.intent.label] || ["pipeline","inbound"]) : ["pipeline","inbound"];
  const [sel, setSel] = useStateB(initGoals);
  const [codes, setCodes] = useStateB(plan ? plan.codes : unionFromGoals(initGoals));
  const toggle = (id)=> setSel(s=>{ const ns = s.includes(id)?s.filter(x=>x!==id):[...s,id]; setCodes(unionFromGoals(ns)); return ns; });

  const totalCost = codes.reduce((a,c)=>a+ROSTER[c].cost,0);
  const avgRoi = codes.length? (codes.reduce((a,c)=>a+ROSTER[c].roi,0)/codes.length) : 0;
  const projRev = Math.round(totalCost*avgRoi*12/1000);

  const phases = [
    { p:"Phase 1 · Week 1", t:"Connect data & CRM", d:"Bright Data, Salesforce, Clay", done:true },
    { p:"Phase 2 · Week 2", t:`Deploy ${Math.min(codes.length,3)} core agents`, d:"ICP scoring + signal detection", done:false },
    { p:"Phase 3 · Week 3", t:"Enable orchestration", d:"Human-in-the-loop approvals", done:false },
    { p:"Phase 4 · Week 4", t:"Full autonomy + governance", d:"Policies, audit, ROI tracking", done:false },
  ];

  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <h1 className="page-title">Agent Builder</h1>
          <p className="page-desc">Visualize and fine-tune your AI workforce — adjust the team, orchestration, and rollout before going live.</p>
        </div>
        <button className="btn btn-primary"><Icon name="play" size={15}/>Deploy workforce</button>
      </div>

      {plan && (
        <div className="row gap-3" style={{padding:"12px 16px",marginBottom:18,border:"1px solid var(--violet-100)",background:"var(--violet-tint)",borderRadius:"var(--r-md)"}}>
          <span style={{width:30,height:30,borderRadius:8,background:"var(--violet)",color:"#fff",display:"grid",placeItems:"center",flexShrink:0}}><Icon name="command" size={16}/></span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600}}>Loaded from your Workspace recommendation</div>
            <div style={{fontSize:12,color:"var(--ink-2)",marginTop:1}}>Team to {plan.intent.label} · tuned for {plan.answers.crm} · {plan.answers.market}. Toggle goals to fine-tune, then deploy.</div>
          </div>
          <Badge tone="violet"><Icon name="target" size={12}/> {plan.match}% match</Badge>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"312px minmax(0,1fr) 312px",gap:16,alignItems:"start"}}>
        {/* Goals */}
        <Panel title="Company Goals" icon="target" right={<span className="eyebrow">Step 1</span>}>
          <div className="panel-body" style={{display:"flex",flexDirection:"column",gap:8}}>
            <div className="eyebrow" style={{marginBottom:2}}>Select objectives</div>
            {GOALS.map(g=>{
              const on = sel.includes(g.id);
              return (
                <button key={g.id} onClick={()=>toggle(g.id)} className="card-hover"
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 11px",borderRadius:"var(--r-md)",cursor:"pointer",textAlign:"left",
                    border:`1px solid ${on?"var(--violet)":"var(--border)"}`,background:on?"var(--violet-tint)":"var(--surface)",transition:"all .15s"}}>
                  <span style={{width:28,height:28,borderRadius:8,display:"grid",placeItems:"center",background:on?"var(--violet)":"var(--surface-sunken)",color:on?"#fff":"var(--ink-2)"}}><Icon name={g.icon} size={15}/></span>
                  <span style={{fontSize:13,fontWeight:500,flex:1,color:on?"var(--violet)":"var(--ink)"}}>{g.label}</span>
                  <span style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${on?"var(--violet)":"var(--border-strong)"}`,background:on?"var(--violet)":"transparent",display:"grid",placeItems:"center"}}>
                    {on && <Icon name="check" size={12} style={{color:"#fff"}} sw={3}/>}
                  </span>
                </button>
              );
            })}
            <div className="divider" style={{margin:"6px 0"}}></div>
            <div className="eyebrow">Ideal customer profile</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Mid-market","SaaS","Series B+","North America","EMEA"].map(t=>(
                <span key={t} className="badge badge-gray" style={{padding:"4px 9px",fontSize:11}}>{t}</span>
              ))}
            </div>
          </div>
        </Panel>

        {/* Recommended workforce */}
        <Panel title="Recommended AI Workforce" icon="workforce"
          right={<><span className="eyebrow" style={{marginRight:8}}>Step 2</span><Badge tone="violet">{codes.length} agents</Badge></>}>
          <div style={{padding:"6px 10px"}}>
            {codes.length===0
              ? <div style={{height:380,display:"grid",placeItems:"center",color:"var(--ink-3)",fontSize:13}}>Select a goal to see the recommended workforce</div>
              : <WorkforceGraph codes={codes}/>}
          </div>
          <div style={{display:"flex",gap:10,padding:"12px 16px",borderTop:"1px solid var(--border-faint)",flexWrap:"wrap"}}>
            <div className="row gap-2"><span className="mono" style={{fontSize:11,color:"var(--ink-3)"}}>ORCHESTRATION</span><Badge tone="green" dot="green">Human-in-the-loop</Badge></div>
            <div className="row gap-2 ml-auto"><span className="mono" style={{fontSize:11,color:"var(--ink-3)"}}>INTELLIGENCE</span><Badge tone="violet">Bright Data</Badge></div>
          </div>
        </Panel>

        {/* Deployment + ROI */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Panel title="Deployment Plan" icon="flow" right={<span className="eyebrow">Step 3</span>}>
            <div className="panel-body" style={{paddingTop:8}}>
              {phases.map((ph,i)=>(
                <div key={i} className="row gap-3" style={{padding:"9px 0",borderBottom:i<phases.length-1?"1px solid var(--border-faint)":"none",alignItems:"flex-start"}}>
                  <span style={{width:22,height:22,borderRadius:"50%",flexShrink:0,display:"grid",placeItems:"center",marginTop:1,
                    background:ph.done?"var(--green-bg)":"var(--surface-sunken)",color:ph.done?"var(--green)":"var(--ink-3)",border:`1px solid ${ph.done?"transparent":"var(--border)"}`}}>
                    {ph.done? <Icon name="check" size={12} sw={3}/> : <span className="mono" style={{fontSize:10}}>{i+1}</span>}
                  </span>
                  <div style={{flex:1}}>
                    <div className="mono" style={{fontSize:9.5,color:"var(--ink-3)",letterSpacing:".06em"}}>{ph.p.toUpperCase()}</div>
                    <div style={{fontSize:12.5,fontWeight:500,marginTop:1}}>{ph.t}</div>
                    <div style={{fontSize:11,color:"var(--ink-3)",marginTop:1}}>{ph.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Expected ROI" icon="revenue" right={<span className="eyebrow">Step 4</span>}>
            <div className="panel-body">
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div className="eyebrow">Projected revenue influence / yr</div>
                  <div className="mono" style={{fontSize:30,fontWeight:600,color:"var(--green)",letterSpacing:"-0.03em",marginTop:4}}>${projRev}K</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="mono" style={{fontSize:20,fontWeight:600}}>{avgRoi.toFixed(1)}x</div>
                  <div style={{fontSize:10,color:"var(--ink-3)"}}>blended ROI</div>
                </div>
              </div>
              <Sparkline data={[2,3,3.5,5,6,8,10,projRev/100+8]} w={250} h={48} color="var(--green)"/>
              <div className="divider" style={{margin:"10px 0"}}></div>
              <div className="stat-row"><span className="l">Monthly agent cost</span><span className="v">${(totalCost/1000).toFixed(1)}K</span></div>
              <div className="stat-row"><span className="l">Payback period</span><span className="v">~6 weeks</span></div>
              <div className="stat-row"><span className="l">FTE-equivalent</span><span className="v">{(codes.length*1.8).toFixed(0)} reps</span></div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

window.BuilderPage = BuilderPage;
