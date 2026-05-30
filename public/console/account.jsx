// account.jsx — My Account: personal AI workforce headquarters
const { useState: useStateAcc } = React;

function AccSectionHead({ n, title, right }) {
  return (
    <div className="row" style={{justifyContent:"space-between",alignItems:"flex-end",margin:"0 0 14px"}}>
      <div><div className="eyebrow" style={{marginBottom:5}}>{n}</div><h2 style={{fontSize:17,fontWeight:600,letterSpacing:"-0.02em"}}>{title}</h2></div>
      {right}
    </div>
  );
}

function Switch({ on=true }) {
  const [v,setV] = useStateAcc(on);
  return (
    <button onClick={()=>setV(!v)} aria-pressed={v} style={{width:40,height:23,borderRadius:20,background:v?"var(--violet)":"var(--border-strong)",position:"relative",border:"none",cursor:"pointer",transition:"background .16s",flexShrink:0}}>
      <span style={{position:"absolute",top:2.5,left:v?19:2.5,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .16s",boxShadow:"var(--shadow-xs)"}}></span>
    </button>
  );
}

const MEMBERS = [
  { name:"Avery Chen", role:"Revenue Leader", status:"active", last:"Now", you:true },
  { name:"Sarah Miller", role:"Sales Manager", status:"active", last:"12m ago" },
  { name:"John Park", role:"SDR", status:"active", last:"1h ago" },
  { name:"Mia Torres", role:"Sales Manager", status:"active", last:"3h ago" },
  { name:"David Kim", role:"SDR", status:"invited", last:"—" },
];

const SPEND = [
  { code:"PRX", name:"Prospector", color:"#5B2BD9", amt:1240 },
  { code:"SIG", name:"Signal Scout", color:"#0E8F9F", amt:860 },
  { code:"QAL", name:"Qualifier", color:"#0E9F6E", amt:420 },
  { code:"OUT", name:"Outreach", color:"#2563EB", amt:380 },
];

function ProfileOverview() {
  return (
    <div className="panel" style={{overflow:"hidden"}}>
      <div style={{height:84,background:"radial-gradient(600px 200px at 80% -40%, rgba(91,43,217,0.18), transparent 70%), linear-gradient(120deg,#6A3AE6,#5B2BD9)"}}></div>
      <div style={{padding:"0 22px 20px",display:"flex",gap:18,alignItems:"flex-end",marginTop:-34,flexWrap:"wrap"}}>
        <div style={{width:74,height:74,borderRadius:18,background:"linear-gradient(140deg,#475569,#1e293b)",display:"grid",placeItems:"center",color:"#fff",fontFamily:"var(--mono)",fontSize:24,fontWeight:600,border:"3px solid var(--surface)",boxShadow:"var(--shadow-sm)",flexShrink:0}}>AC</div>
        <div style={{flex:1,minWidth:0,paddingBottom:2}}>
          <div className="row gap-2"><span style={{fontSize:20,fontWeight:600,letterSpacing:"-0.02em"}}>Avery Chen</span><Badge tone="green" dot="green">Active</Badge></div>
          <div style={{fontSize:13,color:"var(--ink-2)",marginTop:2}}>VP Revenue · Acme Inc</div>
        </div>
        <button className="btn" style={{alignSelf:"center"}}><Icon name="settings" size={15}/>Edit profile</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:"1px solid var(--border-faint)"}}>
        {[["Workspace role","Revenue Leader"],["Member since","Jan 2025"],["Company","Acme Inc"],["Workspace status","Active"]].map(([l,v],i)=>(
          <div key={l} style={{padding:"14px 22px",borderRight:i<3?"1px solid var(--border-faint)":"none"}}>
            <div style={{fontSize:10.5,color:"var(--ink-3)"}}>{l}</div>
            <div style={{fontSize:13.5,fontWeight:600,marginTop:3}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Billing() {
  return (
    <Panel className="card-hover" title="Subscription & Billing" icon="dollar" right={<Badge tone="violet">Enterprise</Badge>}>
      <div className="panel-body">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {[["Current plan","Enterprise"],["Monthly cost","$4,900/mo"],["Next invoice","June 15, 2026"],["Payment method","Visa •••• 4821"]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:10.5,color:"var(--ink-3)"}}>{l}</div><div className="mono" style={{fontSize:15,fontWeight:600,marginTop:3}}>{v}</div></div>
          ))}
        </div>
        <div className="row gap-2" style={{flexWrap:"wrap",paddingTop:12,borderTop:"1px solid var(--border-faint)"}}>
          <button className="btn btn-primary btn-sm"><Icon name="dollar" size={13}/>Manage billing</button>
          <button className="btn btn-sm"><Icon name="download" size={13}/>Download invoice</button>
          <button className="btn btn-sm">Update payment</button>
        </div>
      </div>
    </Panel>
  );
}

function HealthSummary() {
  return (
    <Panel className="card-hover" title="Workspace Health" icon="heart">
      <div className="panel-body" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        <Gauge value={96} size={104} color="var(--green)"/>
        <div style={{textAlign:"center",marginTop:-2}}><span className="mono" style={{fontSize:13,color:"var(--ink-3)"}}>96 / 100</span></div>
        <div style={{width:"100%"}}>
          <div className="stat-row"><span className="l"><span className="dot dot-green"></span>AI workforce</span><span className="v" style={{color:"var(--green)"}}>Healthy</span></div>
          <div className="stat-row"><span className="l"><span className="dot dot-green pulse-dot" style={{color:"var(--green)"}}></span>Signals flowing</span><span className="v" style={{color:"var(--green)"}}>Active</span></div>
          <div className="stat-row"><span className="l"><Icon name="integrations" size={13}/>Integrations</span><span className="v">8 connected</span></div>
        </div>
      </div>
    </Panel>
  );
}

function WorkforceSpend() {
  const max = Math.max(...SPEND.map(s=>s.amt));
  return (
    <Panel className="card-hover" title="AI Workforce Spend" icon="zap"
      right={<span className="mono" style={{fontSize:11,color:"var(--ink-3)"}}>this month</span>}>
      <div className="panel-body">
        <div className="row" style={{alignItems:"flex-end",justifyContent:"space-between",marginBottom:4}}>
          <div><span className="mono" style={{fontSize:28,fontWeight:600,letterSpacing:"-0.03em"}}>$2,900</span><span className="mono" style={{fontSize:14,color:"var(--ink-3)"}}> / $5,000</span></div>
          <Badge tone="violet">58% utilized</Badge>
        </div>
        <div className="health-bar" style={{height:8,marginBottom:16}}><div className="health-fill" style={{width:"58%",background:"linear-gradient(90deg,var(--violet-500),var(--violet))"}}></div></div>
        <div className="eyebrow" style={{marginBottom:10}}>Agent spend breakdown</div>
        {SPEND.map(s=>(
          <div key={s.code} style={{marginBottom:11}}>
            <div className="row gap-2" style={{justifyContent:"space-between",marginBottom:5}}>
              <span className="row gap-2"><span style={{width:8,height:8,borderRadius:2,background:s.color}}></span><span style={{fontSize:12.5,fontWeight:500}}>{s.name}</span></span>
              <span className="mono" style={{fontSize:12.5,fontWeight:600}}>${s.amt.toLocaleString("en-US")}</span>
            </div>
            <div className="conf-track" style={{width:"100%"}}><div className="conf-fill" style={{width:(s.amt/max*100)+"%",background:s.color}}></div></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function UsageCredits() {
  const usage = [
    { l:"Signals processed", v:"128,400", icon:"signal", sub:"last 30 days" },
    { l:"Agent tasks", v:"96,120", icon:"zap", sub:"this quarter" },
    { l:"Bright Data requests", v:"4.2M", icon:"globe", sub:"this month" },
    { l:"Workspace credits", v:"82%", icon:"layers", sub:"remaining", ring:82 },
  ];
  return (
    <Panel className="card-hover" title="Usage & Credits" icon="database">
      <div className="panel-body" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {usage.map(u=>(
          <div key={u.l} style={{border:"1px solid var(--border-faint)",borderRadius:"var(--r-md)",padding:"13px 14px"}}>
            <div className="row gap-2" style={{marginBottom:8}}><span style={{width:26,height:26,borderRadius:7,background:"var(--violet-tint)",color:"var(--violet)",display:"grid",placeItems:"center"}}><Icon name={u.icon} size={14}/></span></div>
            <div className="mono" style={{fontSize:20,fontWeight:600,letterSpacing:"-0.02em"}}>{u.v}</div>
            <div style={{fontSize:11,color:"var(--ink-2)",marginTop:2}}>{u.l}</div>
            <div style={{fontSize:10,color:"var(--ink-3)"}}>{u.sub}</div>
            {u.ring!==undefined && <div className="health-bar" style={{height:5,marginTop:8}}><div className="health-fill" style={{width:u.ring+"%",background:"var(--violet)"}}></div></div>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Members() {
  return (
    <Panel className="card-hover" title="Workspace Members" icon="users"
      right={<><button className="btn btn-sm"><Icon name="shield" size={13}/>Manage roles</button><button className="btn btn-sm btn-primary"><Icon name="plus" size={13}/>Invite member</button></>}>
      <div style={{overflowX:"auto"}}>
        <table className="tbl">
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last active</th></tr></thead>
          <tbody>
            {MEMBERS.map(m=>(
              <tr key={m.name}>
                <td><div className="cell-co"><Logo name={m.name}/><div><div className="row gap-2"><span style={{fontWeight:500}}>{m.name}</span>{m.you && <Badge tone="violet">You</Badge>}</div></div></div></td>
                <td><Badge tone={m.role==="Revenue Leader"?"violet":m.role==="Sales Manager"?"blue":"gray"}>{m.role}</Badge></td>
                <td><span className="row gap-2"><StatusDot status={m.status==="active"?"active":"idle"}/><span style={{fontSize:12.5,textTransform:"capitalize"}}>{m.status}</span></span></td>
                <td><span className="mono" style={{fontSize:12,color:"var(--ink-3)"}}>{m.last}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function InfoRows({ rows }) {
  return (
    <div className="panel-body">
      {rows.map((r,i)=>(
        <div key={r[0]} className="stat-row" style={{borderBottom:i<rows.length-1?"1px solid var(--border-faint)":"none"}}>
          <span className="l">{r[0]}</span>
          <span className="v" style={r[2]?{color:`var(--${r[2]})`}:{}}>{r[1]}</span>
        </div>
      ))}
    </div>
  );
}

function Security() {
  return (
    <Panel className="card-hover" title="Security & Authentication" icon="shield">
      <InfoRows rows={[["Email","avery@acme.com"],["Password","••••••••"],["Multi-factor auth","Enabled","green"],["Last login","2 hours ago"]]}/>
      <div className="row gap-2" style={{padding:"0 16px 16px",flexWrap:"wrap"}}>
        <button className="btn btn-sm">Change password</button>
        <button className="btn btn-sm">Manage MFA</button>
        <button className="btn btn-sm">View sessions</button>
      </div>
    </Panel>
  );
}

function Procurement() {
  return (
    <Panel className="card-hover" title="Payment & Procurement" icon="briefcase">
      <InfoRows rows={[["Procurement status","Approved","green"],["Billing contact","finance@acme.com"],["Contract renewal","Jan 2027"],["Enterprise agreement","Active","green"]]}/>
    </Panel>
  );
}

function TogglePanel({ title, icon, items }) {
  return (
    <Panel className="card-hover" title={title} icon={icon}>
      <div className="panel-body">
        {items.map((it,i)=>(
          <div key={it[0]} className="row" style={{justifyContent:"space-between",padding:"10px 0",borderBottom:i<items.length-1?"1px solid var(--border-faint)":"none"}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{it[0]}</div>{it[1] && <div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:1}}>{it[1]}</div>}</div>
            <Switch on={it[2]!==false}/>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AIPreferences() {
  const selects = [
    { l:"Preferred GTM focus", v:"Pipeline Growth" },
    { l:"Preferred regions", v:"North America" },
    { l:"Reporting frequency", v:"Weekly" },
  ];
  return (
    <Panel className="card-hover" title="Personal AI Preferences" icon="spark">
      <div className="panel-body">
        {selects.map((s,i)=>(
          <div key={s.l} className="row" style={{justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border-faint)"}}>
            <span style={{fontSize:13,fontWeight:500}}>{s.l}</span>
            <span className="badge badge-gray" style={{fontSize:12,padding:"4px 10px"}}>{s.v}<Icon name="chevD" size={12}/></span>
          </div>
        ))}
        <div className="row" style={{justifyContent:"space-between",padding:"12px 0 2px"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>Let London personalize recommendations</div><div style={{fontSize:11.5,color:"var(--ink-3)",marginTop:1}}>Tunes the catalog & feed to your profile</div></div>
          <Switch on={true}/>
        </div>
      </div>
    </Panel>
  );
}

function AccountPage() {
  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <h1 className="page-title">My Account</h1>
          <p className="page-desc">Your personal AI workforce headquarters — plan, spend, members, security, and preferences.</p>
        </div>
        <button className="btn"><Icon name="external" size={15}/>Sign out</button>
      </div>

      <div style={{marginBottom:30}}>
        <AccSectionHead n="01 · Account Overview" title="Profile"/>
        <ProfileOverview/>
      </div>

      <div style={{marginBottom:30}}>
        <AccSectionHead n="02 · Billing & 10 · Health" title="Subscription & workspace health"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <Billing/><HealthSummary/>
        </div>
      </div>

      <div style={{marginBottom:30}}>
        <AccSectionHead n="03 · Spend & 04 · Usage" title="AI workforce spend & usage"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <WorkforceSpend/><UsageCredits/>
        </div>
      </div>

      <div style={{marginBottom:30}}>
        <AccSectionHead n="05 · Members" title="Workspace members"/>
        <Members/>
      </div>

      <div style={{marginBottom:30}}>
        <AccSectionHead n="06 · Procurement & 07 · Security" title="Security & procurement"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <Security/><Procurement/>
        </div>
      </div>

      <div>
        <AccSectionHead n="08 · Notifications & 09 · AI Preferences" title="Preferences"/>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
          <TogglePanel title="Notification Preferences" icon="bell" items={[
            ["Agent alerts","Status changes & failures"],
            ["Buying signal alerts","High-confidence signals"],
            ["Budget alerts","Spend thresholds"],
            ["Weekly reports","Performance digest"],
          ]}/>
          <AIPreferences/>
        </div>
      </div>
    </div>
  );
}

window.AccountPage = AccountPage;
