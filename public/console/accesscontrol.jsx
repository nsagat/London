// accesscontrol.jsx — Access Control: human + AI workforce permissions
const { useState: useStateAC } = React;

function ACSectionHead({ n, title, desc, right }) {
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

const ROLES = ["Revenue Leader","Sales Manager","SDR","Admin"];

const GROUPS = [
  { name:"Revenue Leader", icon:"revenue", members:4, tone:"violet",
    can:["Deploy agents","Approve workflows","Access analytics","Manage budgets"], cannot:[] },
  { name:"Sales Manager", icon:"users", members:9, tone:"blue",
    can:["Use agents","View signals","Approve campaigns"], cannot:["Change policies","Manage integrations"] },
  { name:"SDR", icon:"target", members:28, tone:"cyan",
    can:["Use assigned agents","View recommendations"], cannot:["Deploy new agents","Access audit logs"] },
  { name:"Admin", icon:"shield", members:3, tone:"amber",
    can:["Full access — all agents, data, policies & users"], cannot:[], full:true },
];

// agent access matrix: values per role
const ACCESS = [
  { code:"PRX", name:"Prospector", color:"#5B2BD9", cells:["full","full","full","full"] },
  { code:"SIG", name:"Signal Scout", color:"#0E8F9F", cells:["full","full","view","full"] },
  { code:"OUT", name:"Outreach", color:"#2563EB", cells:["approve","use","use","full"] },
  { code:"QAL", name:"Qualifier", color:"#0E9F6E", cells:["full","full","use","full"] },
  { code:"RNW", name:"Renewals", color:"#7B52F0", cells:["full","view","none","full"] },
  { code:"FCT", name:"Forecaster", color:"#0E8F9F", cells:["full","view","none","full"] },
];
const cellMap = {
  full:   { tone:"green",  label:"Full",      ico:"check" },
  view:   { tone:"gray",   label:"View only", ico:"eye" },
  approve:{ tone:"amber",  label:"Approve",   ico:"checkCircle" },
  use:    { tone:"violet", label:"Use",       ico:"play" },
  none:   { tone:"none",   label:"No access", ico:null },
};
function Cell({ v }) {
  const m = cellMap[v];
  if(v==="none") return <span className="badge" style={{background:"var(--surface-sunken)",color:"var(--ink-4)"}}>
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>None</span>;
  return <span className={`badge badge-${m.tone}`}>{m.ico && <Icon name={m.ico} size={11} sw={m.ico==="check"?3:2}/>}{m.label}</span>;
}

const SYSTEMS = [
  { name:"Salesforce", icon:"database", access:[1,1,1,1] },
  { name:"HubSpot", icon:"target", access:[1,1,1,1] },
  { name:"Bright Data", icon:"globe", access:[1,1,0,1] },
  { name:"Slack", icon:"slack", access:[1,1,1,1] },
  { name:"Apollo", icon:"users", access:[1,0,1,1] },
  { name:"Clay", icon:"layers", access:[1,1,0,1] },
  { name:"Gmail", icon:"mail", access:[1,1,1,1] },
  { name:"Analytics", icon:"analytics", access:[1,1,0,1] },
];

const REQUESTS = [
  { agent:"Prospector", code:"PRX", color:"#5B2BD9", by:"Sarah Chen", status:"Awaiting approval", tone:"amber", stage:1 },
  { agent:"Signal Scout", code:"SIG", color:"#0E8F9F", by:"John Miller", status:"Approved · deployed", tone:"green", stage:3 },
  { agent:"Renewals", code:"RNW", color:"#7B52F0", by:"Mia Torres", status:"Policy validation", tone:"violet", stage:2 },
];
const WF_STEPS = ["Request agent","Manager approval","Policy validation","Deployment"];

const SENSITIVE = [
  { action:"Send emails", approver:"Sales Manager", last:"12m ago", icon:"mail" },
  { action:"Export data", approver:"Admin", last:"2h ago", icon:"download" },
  { action:"Modify CRM records", approver:"Revenue Leader", last:"1d ago", icon:"layers" },
  { action:"Increase agent budget", approver:"Revenue Leader", last:"3d ago", icon:"dollar" },
  { action:"Deploy new agent", approver:"Admin", last:"5h ago", icon:"plus" },
];

const ACTIVITY = [
  { t:"09:21", who:"Sarah Chen", text:"accessed Prospector", icon:"eye", sev:"info" },
  { t:"09:26", who:"John Miller", text:"approved Outreach deployment", icon:"check", sev:"ok" },
  { t:"09:31", who:"Renewals", text:"requested CRM access — pending review", icon:"link", sev:"warn" },
  { t:"09:34", who:"Policy engine", text:"blocked unauthorized data export", icon:"shield", sev:"block" },
  { t:"09:40", who:"Admin", text:"granted Signal Scout permissions to SDR group", icon:"users", sev:"ok" },
  { t:"09:52", who:"Mia Torres", text:"revoked agent access for 2 inactive users", icon:"settings", sev:"info" },
];
const acSev = {
  info:{bg:"var(--surface-2)",color:"var(--ink-3)",border:"var(--border)"},
  ok:{bg:"var(--green-bg)",color:"var(--green)",border:"transparent"},
  warn:{bg:"var(--amber-bg)",color:"var(--amber)",border:"transparent"},
  block:{bg:"var(--red-bg)",color:"var(--red)",border:"transparent"},
};

function ACKpis() {
  const k = [
    { label:"Employees", icon:"users", val:"48", sub:"across 6 teams", tone:"violet" },
    { label:"AI Agents", icon:"workforce", val:"12", sub:"governed & assigned", tone:"violet" },
    { label:"Permission Groups", icon:"shield", val:"6", sub:"role-based", tone:"violet" },
    { label:"Pending Access Requests", icon:"clock", val:"3", sub:"awaiting approval", tone:"amber" },
  ];
  const bg={violet:"var(--violet-tint)",amber:"var(--amber-bg)"}, fg={violet:"var(--violet)",amber:"var(--amber)"};
  return (
    <div className="kpi-grid stagger">
      {k.map(x=>(
        <div key={x.label} className="kpi card-hover">
          <div className="kpi-top"><span className="kpi-ic" style={{background:bg[x.tone],color:fg[x.tone]}}><Icon name={x.icon} size={16}/></span><span className="kpi-label">{x.label}</span></div>
          <div className="kpi-val">{x.val}</div>
          <div className="kpi-delta-label" style={{marginTop:9}}>{x.sub}</div>
        </div>
      ))}
    </div>
  );
}

function RoleCards() {
  const tint={violet:"var(--violet-tint)",blue:"var(--blue-bg)",cyan:"var(--cyan-bg)",amber:"var(--amber-bg)"};
  const fg={violet:"var(--violet)",blue:"var(--blue)",cyan:"var(--cyan)",amber:"var(--amber)"};
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}} className="stagger">
      {GROUPS.map(g=>(
        <div key={g.name} className="panel card-hover" style={{padding:16,display:"flex",flexDirection:"column"}}>
          <div className="row gap-3" style={{marginBottom:12}}>
            <span style={{width:34,height:34,borderRadius:10,background:tint[g.tone],color:fg[g.tone],display:"grid",placeItems:"center",flexShrink:0}}><Icon name={g.icon} size={17}/></span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600}}>{g.name}</div>
              <div className="mono" style={{fontSize:10.5,color:"var(--ink-3)"}}>{g.members} members</div>
            </div>
            {g.full && <Badge tone="amber">Full access</Badge>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,flex:1}}>
            {g.can.map(c=>(
              <div key={c} className="row gap-2" style={{fontSize:12.5}}>
                <span style={{width:16,height:16,borderRadius:"50%",background:"var(--green-bg)",color:"var(--green)",display:"grid",placeItems:"center",flexShrink:0}}><Icon name="check" size={10} sw={3}/></span>
                <span>{c}</span>
              </div>
            ))}
            {g.cannot.map(c=>(
              <div key={c} className="row gap-2" style={{fontSize:12.5,color:"var(--ink-3)"}}>
                <span style={{width:16,height:16,borderRadius:"50%",background:"var(--red-bg)",color:"var(--red)",display:"grid",placeItems:"center",flexShrink:0}}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatrixTable({ title, icon, headRows, children }) {
  return (
    <Panel className="card-hover" title={title} icon={icon}>
      <div style={{overflowX:"auto"}}>
        <table className="tbl">
          <thead><tr><th>{headRows}</th>{ROLES.map(r=><th key={r} style={{textAlign:"center"}}>{r}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Panel>
  );
}

function ApprovalWorkflow() {
  return (
    <Panel className="card-hover" title="Agent Approval Workflows" icon="flow">
      <div className="panel-body">
        <div className="row" style={{gap:0,flexWrap:"wrap",marginBottom:18}}>
          {WF_STEPS.map((s,i)=>(
            <React.Fragment key={s}>
              <div className="row gap-2" style={{padding:"8px 12px",background:"var(--violet-tint)",border:"1px solid var(--violet-100)",borderRadius:"var(--r-sm)"}}>
                <span className="mono" style={{width:18,height:18,borderRadius:"50%",background:"var(--violet)",color:"#fff",display:"grid",placeItems:"center",fontSize:9.5,fontWeight:600}}>{i+1}</span>
                <span style={{fontSize:12.5,fontWeight:500,color:"var(--violet)",whiteSpace:"nowrap"}}>{s}</span>
              </div>
              {i<WF_STEPS.length-1 && <span style={{color:"var(--ink-4)",padding:"0 6px"}}><Icon name="arrowR" size={16}/></span>}
            </React.Fragment>
          ))}
        </div>
        <div className="eyebrow" style={{marginBottom:8}}>Recent requests</div>
        {REQUESTS.map((r,i)=>(
          <div key={i} className="row gap-3" style={{padding:"10px 0",borderBottom:i<REQUESTS.length-1?"1px solid var(--border-faint)":"none"}}>
            <span style={{width:28,height:28,borderRadius:8,background:r.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:600,flexShrink:0}}>{r.code}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600}}>{r.agent} <span style={{fontWeight:400,color:"var(--ink-3)"}}>· requested by {r.by}</span></div>
              <div className="row gap-2" style={{marginTop:4}}>
                {WF_STEPS.map((s,si)=>(
                  <span key={si} style={{height:4,flex:1,maxWidth:40,borderRadius:2,background:si<=r.stage?"var(--violet)":"var(--surface-sunken)"}}></span>
                ))}
              </div>
            </div>
            <Badge tone={r.tone} dot={r.tone==="green"?"green":r.tone==="amber"?"amber":"violet"}>{r.status}</Badge>
            {r.tone==="amber" && <button className="btn btn-sm btn-primary"><Icon name="check" size={13}/>Approve</button>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SecurityScore() {
  return (
    <Panel className="card-hover" title="AI Workforce Security Score" icon="shield">
      <div className="panel-body">
        <div className="row gap-4" style={{alignItems:"center"}}>
          <Gauge value={94} size={92} color="var(--green)"/>
          <div>
            <div className="row" style={{alignItems:"baseline",gap:4}}>
              <span className="mono" style={{fontSize:30,fontWeight:600,letterSpacing:"-0.03em"}}>94</span>
              <span className="mono" style={{fontSize:14,color:"var(--ink-3)"}}>/100</span>
            </div>
            <Badge tone="green" dot="green">Healthy</Badge>
            <div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:8}}>Potential risks · <span style={{color:"var(--amber)",fontWeight:600}}>2</span></div>
          </div>
        </div>
        <div className="eyebrow" style={{margin:"14px 0 8px"}}>Flagged risks</div>
        {[
          "3 inactive users still have agent access",
          "One agent has elevated permissions",
        ].map((r,i)=>(
          <div key={i} className="row gap-2" style={{padding:"8px 10px",background:"var(--amber-bg)",borderRadius:8,marginBottom:6}}>
            <Icon name="alert" size={14} style={{color:"var(--amber)",flexShrink:0}}/>
            <span style={{fontSize:12}}>{r}</span>
            <button className="btn btn-sm ml-auto" style={{height:24,padding:"0 8px"}}>Resolve</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityFeed() {
  return (
    <Panel className="card-hover" title="Access Activity" icon="clock"
      right={<span className="live-chip"><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Live</span>}>
      <div style={{maxHeight:360,overflowY:"auto"}}>
        {ACTIVITY.map((e,i)=>{
          const s=acSev[e.sev];
          return (
            <div key={i} className="row gap-3" style={{padding:"11px 16px",borderBottom:i<ACTIVITY.length-1?"1px solid var(--border-faint)":"none",alignItems:"flex-start"}}>
              <span className="mono" style={{fontSize:11,color:"var(--ink-3)",width:38,flexShrink:0,paddingTop:4}}>{e.t}</span>
              <span style={{width:28,height:28,borderRadius:8,background:s.bg,color:s.color,border:`1px solid ${s.border}`,display:"grid",placeItems:"center",flexShrink:0}}><Icon name={e.icon} size={14}/></span>
              <div style={{flex:1,minWidth:0,paddingTop:2,fontSize:13,lineHeight:1.45}}><span style={{fontWeight:600}}>{e.who}</span> <span style={{color:"var(--ink-2)"}}>{e.text}</span></div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function QuickActions() {
  const actions = [
    { t:"Invite user", icon:"plus", primary:true },
    { t:"Create role", icon:"shield" },
    { t:"Assign agent", icon:"workforce" },
    { t:"Revoke access", icon:"link", danger:true },
    { t:"Pause agent access", icon:"pause", danger:true },
  ];
  return (
    <Panel className="card-hover" title="Quick Actions" icon="zap">
      <div className="panel-body" style={{display:"flex",flexDirection:"column",gap:9}}>
        {actions.map(a=>(
          <button key={a.t} className={`btn ${a.primary?"btn-primary":""}`} style={{justifyContent:"flex-start",height:40,...(a.danger?{color:"var(--red)"}:{})}}>
            <Icon name={a.icon} size={15}/>{a.t}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function AccessControlPage() {
  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div className="row gap-3" style={{marginBottom:4}}>
            <h1 className="page-title">Access Control</h1>
            <span className="live-chip" style={{marginBottom:2}}><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Secure</span>
          </div>
          <p className="page-desc">Control center for your human + AI workforce — who can use which agents, access what data, and what needs approval.</p>
        </div>
        <div className="row gap-2">
          <button className="btn"><Icon name="shield" size={15}/>Create role</button>
          <button className="btn btn-primary"><Icon name="plus" size={15}/>Invite user</button>
        </div>
      </div>

      <div style={{marginBottom:34}}>
        <ACSectionHead n="01 · Overview" title="Workforce access at a glance"/>
        <ACKpis/>
      </div>

      <div style={{marginBottom:34}}>
        <ACSectionHead n="02 · Roles" title="Role-Based Access Control" desc="Permission groups spanning people and the agents they command."/>
        <RoleCards/>
      </div>

      <div style={{marginBottom:34}}>
        <ACSectionHead n="03 · Agents" title="Agent Access Matrix" desc="Which roles can use, approve, or only view each agent."/>
        <MatrixTable title="Agent Access Matrix" icon="workforce" headRows="Agent">
          {ACCESS.map(a=>(
            <tr key={a.code}>
              <td style={{minWidth:150}}><div className="cell-co"><span style={{width:28,height:28,borderRadius:8,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10.5,fontWeight:600}}>{a.code}</span><span style={{fontWeight:500}}>{a.name}</span></div></td>
              {a.cells.map((v,i)=><td key={i} style={{textAlign:"center"}}><Cell v={v}/></td>)}
            </tr>
          ))}
        </MatrixTable>
      </div>

      <div style={{marginBottom:34}}>
        <ACSectionHead n="04 · Data" title="Data Access Permissions" desc="Which connected systems each role can reach."/>
        <MatrixTable title="System Access by Role" icon="database" headRows="System">
          {SYSTEMS.map(s=>(
            <tr key={s.name}>
              <td style={{minWidth:150}}><span className="row gap-2"><span style={{color:"var(--ink-3)"}}><Icon name={s.icon} size={15}/></span><span style={{fontWeight:500}}>{s.name}</span></span></td>
              {s.access.map((v,i)=>(
                <td key={i} style={{textAlign:"center"}}>
                  {v ? <span className="badge badge-green"><Icon name="check" size={11} sw={3}/>Allowed</span>
                     : <span className="badge" style={{background:"var(--surface-sunken)",color:"var(--ink-4)"}}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>Denied</span>}
                </td>
              ))}
            </tr>
          ))}
        </MatrixTable>
      </div>

      <div style={{marginBottom:34}}>
        <ACSectionHead n="05 · Workflows" title="Agent Approval Workflows" desc="Every agent deployment runs through request, approval, policy validation, and deploy."/>
        <ApprovalWorkflow/>
      </div>

      <div style={{marginBottom:34}}>
        <ACSectionHead n="06 · Sensitive Actions & 08 · Security" title="Guarded actions & security score"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <Panel className="card-hover" title="Sensitive Actions" icon="alert">
            <div style={{overflowX:"auto"}}>
              <table className="tbl">
                <thead><tr><th>Action</th><th>Approval required</th><th>Approver</th><th>Last used</th></tr></thead>
                <tbody>
                  {SENSITIVE.map(s=>(
                    <tr key={s.action}>
                      <td><span className="row gap-2"><span style={{color:"var(--violet)"}}><Icon name={s.icon} size={15}/></span><span style={{fontWeight:500}}>{s.action}</span></span></td>
                      <td><Badge tone="amber" dot="amber">Required</Badge></td>
                      <td><span style={{fontSize:12.5,color:"var(--ink-2)"}}>{s.approver}</span></td>
                      <td><span className="mono" style={{fontSize:11.5,color:"var(--ink-3)"}}>{s.last}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <SecurityScore/>
        </div>
      </div>

      <div>
        <ACSectionHead n="07 · Activity & 09 · Actions" title="Access activity & quick actions"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <ActivityFeed/>
          <QuickActions/>
        </div>
      </div>
    </div>
  );
}

window.AccessControlPage = AccessControlPage;
