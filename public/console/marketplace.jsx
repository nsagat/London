// marketplace.jsx — Workforce Catalog as a personalized AI advisor (category-based)
const { useState: useStateM } = React;

// Each category: insight + KPIs + agents ranked by match (first = Recommended For You, with reasons)
const CATS = [
  { id:"saledev", name:"Sales Development", icon:"builder",
    insight:"Based on your profile, London recommends focusing on outbound account discovery and ICP scoring.",
    kpis:{ rev:"$3.2M", cost:"$1.2K/mo", deploy:"~1 wk", conf:"96%" },
    agents:[ {code:"PRX",match:98,reasons:["Salesforce detected","North America ICP","Pipeline growth objective","Budget compatible"]},{code:"OUT",match:91},{code:"BRF",match:84} ] },
  { id:"leadgen", name:"Lead Generation", icon:"target",
    insight:"Your inbound + outbound mix favors continuous ICP scoring with real-time enrichment.",
    kpis:{ rev:"$2.6M", cost:"$1.2K/mo", deploy:"~1 wk", conf:"94%" },
    agents:[ {code:"PRX",match:95,reasons:["ICP scoring matches goal","Inbound + outbound coverage","Clay + Apollo connected","Budget compatible"]},{code:"QAL",match:93},{code:"ENR",match:88} ] },
  { id:"intel", name:"Intelligence", icon:"signal",
    insight:"With Bright Data connected, London recommends maximizing buying-signal detection.",
    kpis:{ rev:"$2.9M", cost:"$2.1K/mo", deploy:"~3 days", conf:"95%" },
    agents:[ {code:"SIG",match:97,reasons:["Bright Data connected","Buying-signal objective","Real-time enrichment","North America coverage"]},{code:"ENR",match:90},{code:"CMP",match:85} ] },
  { id:"outbound", name:"Outbound", icon:"mail",
    insight:"Executive-grade sequencing with human approval fits your guardrails and growth goal.",
    kpis:{ rev:"$2.4M", cost:"$1.7K/mo", deploy:"~1 wk", conf:"92%" },
    agents:[ {code:"OUT",match:96,reasons:["Gmail connected","Executive-grade sequencing","Pipeline growth objective","Approval guardrails set"]},{code:"PRX",match:90},{code:"BRF",match:82} ] },
  { id:"sales", name:"Sales", icon:"briefcase",
    insight:"Fast inbound routing gets AEs to the right accounts first — high ROI, low setup.",
    kpis:{ rev:"$2.1M", cost:"$760/mo", deploy:"~3 days", conf:"96%" },
    agents:[ {code:"QAL",match:96,reasons:["Inbound routing need","HubSpot connected","Fast time-to-value","Budget compatible"]},{code:"BRF",match:90},{code:"NEG",match:84} ] },
  { id:"strategy", name:"Strategy", icon:"globe",
    insight:"Your EMEA expansion plans call for living TAM maps and balanced territory planning.",
    kpis:{ rev:"$1.6M", cost:"$1.1K/mo", deploy:"~2 wks", conf:"90%" },
    agents:[ {code:"MKT",match:92,reasons:["EMEA expansion plans","Territory planning need","Firmographic data ready","Budget compatible"]},{code:"CMP",match:88} ] },
  { id:"cs", name:"Customer Success", icon:"heart",
    insight:"Protecting installed-base revenue: predict churn early and surface expansion windows.",
    kpis:{ rev:"$1.9M", cost:"$1.3K/mo", deploy:"~1 wk", conf:"91%" },
    agents:[ {code:"RNW",match:94,reasons:["Product usage connected","Churn-risk priority","Expansion signals","Salesforce connected"]},{code:"ADV",match:86} ] },
  { id:"revops", name:"Revenue Operations", icon:"analytics",
    insight:"Tighten forecasting and routing across your CRM stack with deal-level risk scoring.",
    kpis:{ rev:"$2.2M", cost:"$1.45K/mo", deploy:"~1 wk", conf:"93%" },
    agents:[ {code:"FCT",match:95,reasons:["Pipeline forecasting need","Salesforce + HubSpot connected","Deal-level risk scoring","Budget compatible"]},{code:"QAL",match:88} ] },
  { id:"forecast", name:"Forecasting", icon:"trendUp",
    insight:"Scenario modeling on connected CRM data improves forecast accuracy quarter over quarter.",
    kpis:{ rev:"$2.0M", cost:"$1.45K/mo", deploy:"~1 wk", conf:"93%" },
    agents:[ {code:"FCT",match:97,reasons:["Forecast accuracy goal","Scenario modeling","CRM connected","Budget compatible"]},{code:"SIG",match:84} ] },
  { id:"compete", name:"Competitive Intelligence", icon:"zap",
    insight:"Win more competitive deals with always-on pricing tracking and auto-generated battlecards.",
    kpis:{ rev:"$1.4M", cost:"$940/mo", deploy:"~3 days", conf:"94%" },
    agents:[ {code:"CMP",match:96,reasons:["Competitive deals priority","Bright Data connected","Auto-generated battlecards","Budget compatible"]},{code:"SIG",match:89} ] },
];

function agentByCode(code){ return window.LondonData.CATALOG.find(c=>c.code===code); }

function MatchRing({ value, size=58 }) {
  const r=(size-8)/2, c=2*Math.PI*r, len=(value/100)*c, cx=size/2;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(91,43,217,0.14)" strokeWidth="5"/>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--violet)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${len} ${c}`}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",flexDirection:"column"}}>
        <span className="mono" style={{fontSize:size*0.26,fontWeight:600,color:"var(--violet)",lineHeight:1}}>{value}</span>
      </div>
    </div>
  );
}

function RecommendedCard({ entry }) {
  const a = agentByCode(entry.code);
  if(!a) return null;
  return (
    <div className="panel" style={{borderColor:"var(--violet-100)",boxShadow:"var(--shadow-md)",overflow:"hidden"}}>
      <div style={{padding:"14px 18px",background:"linear-gradient(180deg,var(--violet-tint),var(--surface))",borderBottom:"1px solid var(--violet-100)",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span className="badge" style={{background:"var(--violet)",color:"#fff",fontSize:10.5,padding:"3px 9px"}}><Icon name="spark" size={12}/>RECOMMENDED FOR YOU</span>
        <span className="mono" style={{fontSize:12.5,color:"var(--violet)",fontWeight:600}}>{entry.match}% Match</span>
        {a.installed && <span className="ml-auto"><Badge tone="green" dot="green">Deployed</Badge></span>}
      </div>
      <div style={{padding:18,display:"grid",gridTemplateColumns:"minmax(0,1.1fr) minmax(0,1fr)",gap:20}}>
        <div>
          <div className="row gap-3" style={{marginBottom:12}}>
            <span style={{width:46,height:46,borderRadius:12,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:15,fontWeight:600,flexShrink:0}}>{a.code}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:17,fontWeight:600,letterSpacing:"-0.01em"}}>{a.name}</div>
              <div style={{fontSize:12.5,color:"var(--ink-2)"}}>{a.fn}</div>
            </div>
            <MatchRing value={entry.match}/>
          </div>
          <p style={{fontSize:12.5,color:"var(--ink-2)",lineHeight:1.55,margin:"0 0 14px"}}>{a.desc}</p>
          <div className="row gap-4" style={{paddingTop:12,borderTop:"1px solid var(--border-faint)"}}>
            <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Cost</div><div className="mono" style={{fontSize:14,fontWeight:600}}>{a.cost}</div></div>
            <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Performance</div><div className="mono" style={{fontSize:14,fontWeight:600}}>{a.perf}<span style={{color:"var(--ink-3)"}}>/100</span></div></div>
            <div><div style={{fontSize:9.5,color:"var(--ink-3)"}}>Department</div><div style={{fontSize:13,fontWeight:500,marginTop:1}}>{a.dept}</div></div>
            <button className="btn btn-primary ml-auto" style={{alignSelf:"center"}}>{a.installed?"Manage":"Deploy agent"}<Icon name="arrowR" size={14}/></button>
          </div>
        </div>
        <div style={{background:"var(--surface-2)",border:"1px solid var(--border-faint)",borderRadius:"var(--r-md)",padding:"14px 16px"}}>
          <div className="eyebrow" style={{marginBottom:10}}>Why it matches</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {entry.reasons.map((r,i)=>(
              <div key={i} className="row gap-2" style={{fontSize:12.5}}>
                <span style={{width:18,height:18,borderRadius:"50%",background:"var(--green-bg)",color:"var(--green)",display:"grid",placeItems:"center",flexShrink:0}}><Icon name="check" size={11} sw={3}/></span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OtherRow({ entry, rank }) {
  const a = agentByCode(entry.code);
  if(!a) return null;
  const tag = entry.match>=90 ? ["violet","Strong match"] : ["gray","Alternative"];
  return (
    <div className="panel card-hover row gap-3" style={{padding:"12px 16px",alignItems:"center"}}>
      <span className="mono" style={{fontSize:11,color:"var(--ink-4)",width:18,flexShrink:0}}>#{rank}</span>
      <span style={{width:34,height:34,borderRadius:9,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:600,flexShrink:0}}>{a.code}</span>
      <div style={{minWidth:0,flex:"0 0 200px"}}>
        <div className="row gap-2"><span style={{fontSize:13.5,fontWeight:600}}>{a.name}</span>{a.installed && <Badge tone="green" dot="green">Deployed</Badge>}</div>
        <div style={{fontSize:11.5,color:"var(--ink-3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.fn}</div>
      </div>
      <Badge tone={tag[0]}>{tag[1]}</Badge>
      <div className="row gap-2 grow" style={{maxWidth:200}}>
        <div className="conf-track" style={{flex:1}}><div className="conf-fill" style={{width:entry.match+"%"}}></div></div>
        <span className="conf-num">{entry.match}%</span>
      </div>
      <span className="mono" style={{fontSize:12.5,fontWeight:500,width:78,textAlign:"right"}}>{a.cost}</span>
      <button className="btn btn-sm">{a.installed?"Manage":"Deploy"}</button>
    </div>
  );
}

function CategoryView({ cat }) {
  const rec = cat.agents[0];
  const others = cat.agents.slice(1);
  const kpis = [
    { l:"Est. revenue impact", v:cat.kpis.rev, c:"var(--green)" },
    { l:"Recommended cost", v:cat.kpis.cost },
    { l:"Deployment time", v:cat.kpis.deploy },
    { l:"Confidence score", v:cat.kpis.conf, c:"var(--violet)" },
  ];
  return (
    <div className="page-enter">
      <div className="row gap-3" style={{marginBottom:14,alignItems:"flex-start"}}>
        <span style={{width:38,height:38,borderRadius:11,background:"var(--violet-tint)",color:"var(--violet)",display:"grid",placeItems:"center",flexShrink:0}}><Icon name={cat.icon} size={19}/></span>
        <div style={{flex:1,minWidth:0}}>
          <h2 style={{fontSize:19,fontWeight:600,letterSpacing:"-0.02em"}}>{cat.name}</h2>
          <p style={{fontSize:13,color:"var(--ink-2)",margin:"3px 0 0",maxWidth:680,lineHeight:1.5}}>{cat.insight}</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {kpis.map(k=>(
          <div key={k.l} className="panel" style={{padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"var(--ink-3)"}}>{k.l}</div>
            <div className="mono" style={{fontSize:19,fontWeight:600,marginTop:4,color:k.c||"var(--ink)",letterSpacing:"-0.02em"}}>{k.v}</div>
          </div>
        ))}
      </div>

      <RecommendedCard entry={rec}/>

      {others.length>0 && (
        <div style={{marginTop:18}}>
          <div className="row gap-2" style={{marginBottom:10}}>
            <span className="eyebrow">Other agents in this category</span>
            <span className="mono" style={{fontSize:10.5,color:"var(--ink-4)"}}>ranked by match</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {others.map((e,i)=> <OtherRow key={e.code} entry={e} rank={i+2}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketplacePage() {
  const [active, setActive] = useStateM(CATS[0].id);
  const cat = CATS.find(c=>c.id===active);
  const deployed = window.LondonData.CATALOG.filter(a=>a.installed).length;

  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div className="row gap-3" style={{marginBottom:4}}>
            <h1 className="page-title">AI Workforce Recommendations</h1>
            <span className="live-chip" style={{marginBottom:2,background:"var(--violet-50)",color:"var(--violet)"}}><Icon name="spark" size={12}/>Curated for you</span>
          </div>
          <p className="page-desc">London curates the right agents for each GTM function — ranked by fit to your company profile, not an A–Z list.</p>
        </div>
        <button className="btn btn-primary"><Icon name="plus" size={15}/>Request custom agent</button>
      </div>

      {/* profile bar */}
      <div className="panel row gap-2" style={{padding:"10px 14px",marginBottom:18,flexWrap:"wrap"}}>
        <span style={{color:"var(--violet)"}}><Icon name="building" size={15}/></span>
        <span style={{fontSize:12.5,fontWeight:600}}>Personalized for Acme Inc</span>
        <span className="muted" style={{fontSize:12}}>·</span>
        {["Salesforce","North America","Mid-market SaaS","Series B+"].map(t=>(
          <span key={t} className="badge badge-gray">{t}</span>
        ))}
        <span className="mono ml-auto" style={{fontSize:11,color:"var(--ink-3)"}}>{deployed}/12 deployed</span>
      </div>

      {/* category pills */}
      <div className="segmented" style={{flexWrap:"wrap",marginBottom:24}}>
        {CATS.map(c=>(
          <button key={c.id} className={active===c.id?"on":""} onClick={()=>setActive(c.id)}>{c.name}</button>
        ))}
      </div>

      <CategoryView cat={cat} key={cat.id}/>
    </div>
  );
}

window.MarketplacePage = MarketplacePage;
