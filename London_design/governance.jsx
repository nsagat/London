// governance.jsx — Policy & Audit: enterprise AI governance center
const { useState: useStateG } = React;

function SectionHead({ n, title, desc, right }) {
  return (
    <div className="row" style={{justifyContent:"space-between",alignItems:"flex-end",margin:"0 0 16px"}}>
      <div>
        <div className="eyebrow" style={{marginBottom:5}}>{n}</div>
        <h2 style={{fontSize:18,fontWeight:600,letterSpacing:"-0.02em"}}>{title}</h2>
        {desc && <p style={{fontSize:13,color:"var(--ink-2)",margin:"4px 0 0"}}>{desc}</p>}
      </div>
      {right}
    </div>
  );
}

// permission chips
const Allow = ({ label }) => (
  <span className="badge badge-green"><Icon name="check" size={11} sw={3}/>{label}</span>
);
const Deny = ({ label }) => (
  <span className="badge" style={{background:"var(--red-bg)",color:"var(--red)"}}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>{label}
  </span>
);

const PERMS = [
  { code:"PRX", name:"Prospector", color:"#5B2BD9", access:["Salesforce","HubSpot","Bright Data"], actions:[["Research",1],["Enrichment",1],["Email sending",0]], approval:"Autonomous", status:"active" },
  { code:"OUT", name:"Outreach", color:"#2563EB", access:["CRM","Gmail"], actions:[["Draft emails",1],["Send w/o approval",0]], approval:"Approval required", status:"active" },
  { code:"SIG", name:"Signal Scout", color:"#0E8F9F", access:["Bright Data","Web Intelligence"], actions:[["Collect signals",1],["Enrichment",1],["Export data",0]], approval:"Autonomous", status:"active" },
  { code:"QAL", name:"Qualifier", color:"#0E9F6E", access:["HubSpot","Slack"], actions:[["Score leads",1],["Route to AE",1]], approval:"Autonomous", status:"active" },
  { code:"RNW", name:"Renewals", color:"#7B52F0", access:["Salesforce","Product API"], actions:[["Risk scoring",1],["Modify CRM",0]], approval:"Restricted", status:"degraded" },
  { code:"CMP", name:"Competitor Watch", color:"#D98A0B", access:["Bright Data","Notion"], actions:[["Monitor pricing",1],["Generate battlecards",1]], approval:"Autonomous", status:"active" },
];
const apprTone = { "Autonomous":"violet", "Approval required":"amber", "Restricted":"red" };

const POLICIES = [
  { icon:"shield", name:"Human Approval Required", desc:"All outbound sequences require human sign-off before send.", status:"Enforcing", triggered:"2h ago", impact:"56 sequences held", tone:"green" },
  { icon:"database", name:"Sensitive Data Protection", desc:"Agents cannot export or move customer PII outside London.", status:"Enforcing", triggered:"4h ago", impact:"3 exports blocked", tone:"green" },
  { icon:"dollar", name:"Budget Limits", desc:"Agent spend cannot exceed the monthly budget ceiling.", status:"Triggered", triggered:"18m ago", impact:"1 campaign paused", tone:"amber" },
  { icon:"layers", name:"CRM Protection", desc:"Agents cannot modify or delete CRM records without approval.", status:"Enforcing", triggered:"1d ago", impact:"12 edits queued", tone:"green" },
];

const AUDIT = [
  { t:"09:41", icon:"database", sev:"info",  who:"Prospector",     text:"accessed Salesforce — read 1,240 account records" },
  { t:"09:43", icon:"signal",   sev:"info",  who:"Signal Scout",   text:"analyzed 428 buying signals via Bright Data" },
  { t:"09:46", icon:"mail",     sev:"info",  who:"Outreach",       text:"generated 16 email drafts — awaiting approval" },
  { t:"09:48", icon:"alert",    sev:"block", who:"Policy engine",  text:"Blocked outbound campaign — exceeded $5K budget threshold" },
  { t:"09:52", icon:"check",    sev:"ok",    who:"Avery Chen",     text:"approved deployment of Qualifier v4 to production" },
  { t:"10:03", icon:"shield",   sev:"warn",  who:"Renewals",       text:"requested restricted CRM field — flagged for review" },
  { t:"10:14", icon:"signal",   sev:"info",  who:"Prospector",     text:"scored 1,240 net-new accounts against ICP v4" },
  { t:"10:21", icon:"check",    sev:"ok",    who:"Avery Chen",     text:"approved 9 outbound sequences for EMEA territory" },
];
const sevMap = {
  info:  { bg:"var(--surface-2)", color:"var(--ink-3)", border:"var(--border)" },
  ok:    { bg:"var(--green-bg)",  color:"var(--green)",  border:"transparent" },
  warn:  { bg:"var(--amber-bg)",  color:"var(--amber)",  border:"transparent" },
  block: { bg:"var(--red-bg)",    color:"var(--red)",    border:"transparent" },
};

function GovKpis() {
  const kpis = [
    { label:"Active Agents", icon:"workforce", val:"12", sub:"governed in real time", tone:"violet" },
    { label:"Policies Enforced", icon:"govern", val:"48", sub:"across 6 categories", tone:"violet" },
    { label:"Approval Rate", icon:"checkCircle", val:"96%", sub:"of agent actions", tone:"green" },
    { label:"Violations Blocked", icon:"shield", val:"17", sub:"last 30 days", tone:"red" },
  ];
  const bg = { violet:"var(--violet-tint)", green:"var(--green-bg)", red:"var(--red-bg)" };
  const fg = { violet:"var(--violet)", green:"var(--green)", red:"var(--red)" };
  return (
    <div className="kpi-grid stagger">
      {kpis.map(k=>(
        <div key={k.label} className="kpi card-hover">
          <div className="kpi-top">
            <span className="kpi-ic" style={{background:bg[k.tone],color:fg[k.tone]}}><Icon name={k.icon} size={16}/></span>
            <span className="kpi-label">{k.label}</span>
          </div>
          <div className="kpi-val">{k.val}</div>
          <div className="kpi-delta-label" style={{marginTop:9}}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

function PermissionsMatrix() {
  return (
    <Panel className="card-hover" title="Agent Permissions Matrix" icon="users"
      right={<button className="btn btn-sm"><Icon name="sliders" size={13}/>Edit policies</button>}>
      <div style={{overflowX:"auto"}}>
        <table className="tbl">
          <thead><tr><th>Agent</th><th>Data Access</th><th>Actions</th><th>Approval Level</th><th>Status</th></tr></thead>
          <tbody>
            {PERMS.map(p=>(
              <tr key={p.code}>
                <td style={{minWidth:160}}><div className="cell-co">
                  <span style={{width:28,height:28,borderRadius:8,background:p.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10.5,fontWeight:600}}>{p.code}</span>
                  <span style={{fontWeight:500}}>{p.name}</span></div></td>
                <td><div style={{display:"flex",gap:5,flexWrap:"wrap",maxWidth:230}}>{p.access.map(a=><Allow key={a} label={a}/>)}</div></td>
                <td><div style={{display:"flex",gap:5,flexWrap:"wrap",maxWidth:260}}>{p.actions.map(([a,ok])=> ok?<Allow key={a} label={a}/>:<Deny key={a} label={a}/>)}</div></td>
                <td><Badge tone={apprTone[p.approval]} dot={p.approval==="Restricted"?"red":p.approval==="Approval required"?"amber":"violet"}>{p.approval}</Badge></td>
                <td><span className="row gap-2"><StatusDot status={p.status}/><span style={{fontSize:12.5,textTransform:"capitalize"}}>{p.status}</span></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PolicyRules() {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:16}} className="stagger">
      {POLICIES.map(p=>(
        <div key={p.name} className="panel card-hover" style={{padding:16}}>
          <div className="row gap-3" style={{marginBottom:10}}>
            <span style={{width:34,height:34,borderRadius:10,background:p.tone==="amber"?"var(--amber-bg)":"var(--violet-tint)",color:p.tone==="amber"?"var(--amber)":"var(--violet)",display:"grid",placeItems:"center",flexShrink:0}}><Icon name={p.icon} size={17}/></span>
            <div style={{flex:1,minWidth:0}}>
              <div className="row gap-2" style={{justifyContent:"space-between"}}>
                <span style={{fontSize:13.5,fontWeight:600}}>{p.name}</span>
                <Badge tone={p.tone} dot={p.tone==="green"?"green":"amber"}>{p.status}</Badge>
              </div>
            </div>
          </div>
          <p style={{fontSize:12.5,color:"var(--ink-2)",lineHeight:1.5,margin:"0 0 12px"}}>{p.desc}</p>
          <div className="divider" style={{marginBottom:10}}></div>
          <div className="row" style={{justifyContent:"space-between"}}>
            <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Last triggered</div><div className="mono" style={{fontSize:12,fontWeight:500,marginTop:2}}>{p.triggered}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Impact</div><div style={{fontSize:12,fontWeight:500,marginTop:2}}>{p.impact}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditTrail() {
  return (
    <Panel className="card-hover" title="Audit Trail" icon="clock"
      right={<><span className="live-chip"><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Live</span><button className="btn btn-sm"><Icon name="download" size={13}/>Export</button></>}>
      <div style={{maxHeight:480,overflowY:"auto"}}>
        {AUDIT.map((e,i)=>{
          const s = sevMap[e.sev];
          return (
            <div key={i} className="row gap-3" style={{padding:"11px 16px",borderBottom:i<AUDIT.length-1?"1px solid var(--border-faint)":"none",alignItems:"flex-start"}}>
              <span className="mono" style={{fontSize:11,color:"var(--ink-3)",width:38,flexShrink:0,paddingTop:4}}>{e.t}</span>
              <span style={{width:28,height:28,borderRadius:8,background:s.bg,color:s.color,border:`1px solid ${s.border}`,display:"grid",placeItems:"center",flexShrink:0}}><Icon name={e.icon} size={14}/></span>
              <div style={{flex:1,minWidth:0,paddingTop:1}}>
                <div style={{fontSize:13,lineHeight:1.45}}><span style={{fontWeight:600}}>{e.who}</span> <span style={{color:"var(--ink-2)"}}>{e.text}</span></div>
                {e.sev!=="info" && <span style={{marginTop:5,display:"inline-flex"}}><Badge tone={e.sev==="ok"?"green":e.sev==="warn"?"amber":"red"}>{e.sev==="ok"?"Approved":e.sev==="warn"?"Flagged":"Blocked"}</Badge></span>}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function RiskCenter() {
  const score = 12;
  return (
    <Panel className="card-hover" title="Risk & Compliance" icon="shield">
      <div className="panel-body">
        <div className="row gap-4" style={{alignItems:"center",marginBottom:6}}>
          <div>
            <div className="eyebrow">Overall AI risk score</div>
            <div className="row" style={{alignItems:"baseline",gap:4,marginTop:4}}>
              <span className="mono" style={{fontSize:34,fontWeight:600,color:"var(--green)",letterSpacing:"-0.03em"}}>{score}</span>
              <span className="mono" style={{fontSize:15,color:"var(--ink-3)"}}>/100</span>
            </div>
            <Badge tone="green" dot="green">Low risk</Badge>
          </div>
          <div className="grow"></div>
          <div style={{textAlign:"center"}}>
            <Gauge value={100-score} size={84} color="var(--green)"/>
            <div style={{fontSize:10,color:"var(--ink-3)",marginTop:2}}>health</div>
          </div>
        </div>
        <div className="health-bar" style={{height:7,marginTop:6}}><div className="health-fill" style={{width:score+"%",background:"var(--green)"}}></div></div>
        <div className="divider" style={{margin:"14px 0 10px"}}></div>
        <div className="stat-row"><span className="l"><Icon name="checkCircle" size={14} style={{color:"var(--green)"}}/>Compliance status</span><span className="v" style={{color:"var(--green)"}}>Healthy</span></div>
        <div className="stat-row"><span className="l"><Icon name="alert" size={14} style={{color:"var(--amber)"}}/>Potential issues</span><span className="v">2</span></div>
        <div className="eyebrow" style={{margin:"12px 0 8px"}}>Active flags</div>
        {[
          {t:"Renewals requested restricted CRM data",tone:"amber"},
          {t:"Outreach budget threshold approaching (92%)",tone:"amber"},
        ].map((f,i)=>(
          <div key={i} className="row gap-2" style={{padding:"8px 10px",background:"var(--amber-bg)",borderRadius:8,marginBottom:6}}>
            <Icon name="alert" size={14} style={{color:"var(--amber)",flexShrink:0}}/>
            <span style={{fontSize:12,color:"var(--ink)"}}>{f.t}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function HumanLoop() {
  const [pending, setPending] = useStateG([
    { id:1, agent:"Outreach", color:"#2563EB", code:"OUT", what:"16 outbound email drafts · EMEA enterprise", risk:"low" },
    { id:2, agent:"Renewals", color:"#7B52F0", code:"RNW", what:"Restricted CRM field access request", risk:"high" },
    { id:3, agent:"Negotiator", color:"#5B2BD9", code:"NEG", what:"Discount approval — 22% on Vela Robotics", risk:"med" },
  ]);
  const [agents, setAgents] = useStateG([
    { code:"PRX", name:"Prospector", color:"#5B2BD9", state:"running" },
    { code:"SIG", name:"Signal Scout", color:"#0E8F9F", state:"running" },
    { code:"RNW", name:"Renewals", color:"#7B52F0", state:"paused" },
  ]);
  const decide = (id)=> setPending(p=>p.filter(x=>x.id!==id));
  const toggle = (code)=> setAgents(a=>a.map(x=>x.code===code?{...x,state:x.state==="running"?"paused":"running"}:x));
  const riskTone = { low:"green", med:"amber", high:"red" };
  return (
    <Panel className="card-hover" title="Human-in-the-Loop Controls" icon="users"
      right={<Badge tone="amber">{pending.length} pending</Badge>}>
      <div className="panel-body">
        <div className="eyebrow" style={{marginBottom:10}}>Approvals pending</div>
        {pending.length===0 && <div style={{fontSize:12.5,color:"var(--ink-3)",padding:"8px 0 14px"}}>All caught up — no approvals pending.</div>}
        {pending.map(p=>(
          <div key={p.id} className="row gap-3" style={{padding:"10px 0",borderBottom:"1px solid var(--border-faint)"}}>
            <span style={{width:28,height:28,borderRadius:8,background:p.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:600,flexShrink:0}}>{p.code}</span>
            <div style={{flex:1,minWidth:0}}>
              <div className="row gap-2"><span style={{fontSize:13,fontWeight:600}}>{p.agent}</span><Badge tone={riskTone[p.risk]}>{p.risk} risk</Badge></div>
              <div style={{fontSize:11.5,color:"var(--ink-2)",marginTop:2}}>{p.what}</div>
            </div>
            <div className="row gap-2">
              <button className="btn btn-sm btn-primary" onClick={()=>decide(p.id)}><Icon name="check" size={13}/>Approve</button>
              <button className="btn btn-sm" onClick={()=>decide(p.id)}>Reject</button>
            </div>
          </div>
        ))}

        <div className="eyebrow" style={{margin:"16px 0 10px"}}>Agent override controls</div>
        {agents.map(a=>(
          <div key={a.code} className="row gap-3" style={{padding:"9px 0",borderBottom:"1px solid var(--border-faint)"}}>
            <span style={{width:26,height:26,borderRadius:7,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:600,flexShrink:0}}>{a.code}</span>
            <span style={{fontSize:13,fontWeight:500,flex:1}}>{a.name}</span>
            <Badge tone={a.state==="running"?"green":"gray"} dot={a.state==="running"?"green":null}>{a.state==="running"?"Running":"Paused"}</Badge>
            <button className="btn btn-sm" onClick={()=>toggle(a.code)}><Icon name={a.state==="running"?"pause":"play"} size={13}/>{a.state==="running"?"Pause":"Resume"}</button>
            <button className="btn btn-sm" style={{color:"var(--red)",borderColor:"var(--red-bg)"}}>Disable</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Explainability() {
  const reasons = [
    { ok:true, t:"Funding signal detected", d:"Series B · $42M led by Iconiq", conf:97 },
    { ok:true, t:"42 new hires in 60 days", d:"3 GTM-leadership roles posted", conf:89 },
    { ok:true, t:"ICP match score 94%", d:"Mid-market SaaS · North America", conf:94 },
    { ok:true, t:"Tech stack alignment", d:"Salesforce + Snowflake detected", conf:82 },
  ];
  return (
    <Panel className="card-hover" title="Explainability" icon="eye"
      right={<Badge tone="violet">Decision trace</Badge>}>
      <div className="panel-body">
        <div className="row gap-3" style={{marginBottom:14,padding:"12px 14px",background:"var(--violet-tint)",borderRadius:"var(--r-md)"}}>
          <span style={{width:34,height:34,borderRadius:9,background:"#5B2BD9",color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:600,flexShrink:0}}>PRX</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13.5}}><strong>Prospector</strong> recommended <strong>Vela Robotics</strong> for executive outreach</div>
            <div style={{fontSize:11.5,color:"var(--ink-2)",marginTop:2}}>Surfaced 09:41 · routed to enterprise AE queue · 94% confidence</div>
          </div>
        </div>
        <div className="eyebrow" style={{marginBottom:8}}>Why this decision</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {reasons.map((r,i)=>(
            <div key={i} className="row gap-3" style={{padding:"11px 12px",border:"1px solid var(--border-faint)",borderRadius:"var(--r-md)",alignItems:"flex-start"}}>
              <span style={{width:22,height:22,borderRadius:"50%",background:"var(--green-bg)",color:"var(--green)",display:"grid",placeItems:"center",flexShrink:0,marginTop:1}}><Icon name="check" size={13} sw={3}/></span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:600}}>{r.t}</div>
                <div style={{fontSize:11,color:"var(--ink-3)",margin:"1px 0 6px"}}>{r.d}</div>
                <div className="conf"><div className="conf-track" style={{flex:1}}><div className="conf-fill" style={{width:r.conf+"%"}}></div></div><span className="conf-num">{r.conf}%</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="row gap-2" style={{marginTop:14}}>
          <span style={{fontSize:11.5,color:"var(--ink-3)"}}>Sourced via</span>
          <Badge tone="violet">Bright Data</Badge>
          <Badge tone="gray">Salesforce</Badge>
          <button className="btn btn-ghost btn-sm ml-auto">Full reasoning log<Icon name="chevR" size={13}/></button>
        </div>
      </div>
    </Panel>
  );
}

function GovernancePage() {
  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div className="row gap-3" style={{marginBottom:4}}>
            <h1 className="page-title">Policy &amp; Audit</h1>
            <span className="live-chip" style={{marginBottom:2}}><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Compliant</span>
          </div>
          <p className="page-desc">Your AI governance &amp; control layer — every agent's access, actions, and decisions, fully observable and enforced.</p>
        </div>
        <div className="row gap-2">
          <button className="btn"><Icon name="download" size={15}/>Export audit log</button>
          <button className="btn btn-primary"><Icon name="govern" size={15}/>New policy</button>
        </div>
      </div>

      <div style={{marginBottom:34}}>
        <SectionHead n="01 · Governance Overview" title="Control at a glance"/>
        <GovKpis/>
      </div>

      <div style={{marginBottom:34}}>
        <SectionHead n="02 · Permissions" title="Agent Permissions Matrix" desc="What each agent can access and do — and where a human stays in the loop."/>
        <PermissionsMatrix/>
      </div>

      <div style={{marginBottom:34}}>
        <SectionHead n="03 · Policy Rules" title="Active policies" desc="Guardrails enforced automatically across the workforce."/>
        <PolicyRules/>
      </div>

      <div style={{marginBottom:34}}>
        <SectionHead n="04 · Audit & 05 · Risk" title="Audit trail & risk"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <AuditTrail/>
          <RiskCenter/>
        </div>
      </div>

      <div style={{marginBottom:34}}>
        <SectionHead n="06 · Human-in-the-Loop" title="Approvals & overrides" desc="Stay in control — approve, reject, pause, or disable any agent."/>
        <HumanLoop/>
      </div>

      <div>
        <SectionHead n="07 · Explainability" title="Why agents act" desc="Every recommendation is traceable to the signals behind it."/>
        <Explainability/>
      </div>
    </div>
  );
}

window.GovernancePage = GovernancePage;
