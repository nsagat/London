// analytics.jsx — executive analytics dashboards
const { useState: useStateAn } = React;

const MONTHS = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
const REV_INFLUENCED = [3.1,3.6,4.2,5.0,5.8,6.9,7.6,8.9,10.1,11.4,12.8,14.2];
const REV_SOURCED    = [0.8,1.0,1.3,1.6,1.9,2.4,2.7,3.2,3.8,4.3,4.9,5.6];
const SIGNALS_BY_MO  = [[18,9,12],[20,10,13],[24,11,15],[27,13,16],[30,15,18],[34,17,20],[38,18,22],[42,21,24],[46,23,27],[51,25,30],[55,28,33],[60,31,37]];

const AGENT_PERF = [
  { code:"QAL", name:"Qualifier",      color:"#0E9F6E", perf:96, roi:7.2, tasks:14880, cost:760 },
  { code:"PRX", name:"Prospector",     color:"#5B2BD9", perf:94, roi:6.4, tasks:18420, cost:1240 },
  { code:"BRF", name:"Briefer",        color:"#E0353F", perf:92, roi:4.1, tasks:8930,  cost:520 },
  { code:"SIG", name:"Signal Scout",   color:"#0E8F9F", perf:91, roi:5.1, tasks:42310, cost:2100 },
  { code:"CMP", name:"Competitor Watch",color:"#D98A0B",perf:90, roi:3.6, tasks:9120,  cost:940 },
  { code:"OUT", name:"Outreach",       color:"#2563EB", perf:88, roi:4.8, tasks:27640, cost:1680 },
  { code:"MKT", name:"Market Mapper",  color:"#475569", perf:85, roi:2.8, tasks:3410,  cost:1100 },
  { code:"RNW", name:"Renewals",       color:"#7B52F0", perf:79, roi:5.9, tasks:6240,  cost:1320 },
];

function StatTile({ label, value, delta, dir="up", sub, color }) {
  return (
    <div className="kpi card-hover">
      <div className="kpi-label" style={{marginBottom:10}}>{label}</div>
      <div className="kpi-val" style={{color:color||"var(--ink)"}}>{value}</div>
      <div className="kpi-bottom">
        <span className={`kpi-delta ${dir}`}><Icon name={dir==="up"?"arrowUp":"arrowDown"} size={12} sw={2.4}/>{delta}</span>
        <span className="kpi-delta-label">{sub}</span>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useStateAn("12mo");
  const totalTasks = AGENT_PERF.reduce((a,b)=>a+b.tasks,0);
  return (
    <div className="content-inner page-enter">
      <div className="page-head row" style={{justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-desc">Revenue attribution, agent performance, and efficiency across your AI workforce.</p>
        </div>
        <div className="row gap-2">
          <div className="segmented">
            <button onClick={()=>setRange("3mo")} className={range==="3mo"?"on":""}>3mo</button>
            <button onClick={()=>setRange("6mo")} className={range==="6mo"?"on":""}>6mo</button>
            <button onClick={()=>setRange("12mo")} className={range==="12mo"?"on":""}>12mo</button>
          </div>
          <button className="btn"><Icon name="download" size={15}/>Export report</button>
        </div>
      </div>

      <div className="kpi-grid stagger" style={{marginBottom:16}}>
        <StatTile label="Revenue Influenced" value="$14.2M" delta="+22.4%" sub="QoQ" color="var(--green)"/>
        <StatTile label="Cost Savings" value="$2.8M" delta="+31%" sub="vs. manual GTM" color="var(--violet)"/>
        <StatTile label="Blended Agent ROI" value="5.1x" delta="+0.6x" sub="trailing 90d"/>
        <StatTile label="Automation Rate" value="87%" delta="+9pts" sub="of GTM tasks"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
        {/* Revenue Attribution */}
        <Panel className="card-hover" style={{gridColumn:"span 2"}} title="Revenue Attribution" icon="revenue"
          right={<><Badge tone="violet" dot="violet">Influenced</Badge><Badge tone="green" dot="green">Sourced</Badge></>}>
          <div className="panel-body">
            <div className="row gap-4" style={{marginBottom:8}}>
              <div><div className="eyebrow">Influenced (YTD)</div><div className="mono" style={{fontSize:22,fontWeight:600}}>$14.2M</div></div>
              <div><div className="eyebrow">Sourced (YTD)</div><div className="mono" style={{fontSize:22,fontWeight:600,color:"var(--green)"}}>$5.6M</div></div>
              <div className="ml-auto" style={{alignSelf:"flex-end"}}><Badge tone="green"><Icon name="trendUp" size={12}/> +22.4% QoQ</Badge></div>
            </div>
            <LineChart w={620} h={210} labels={MONTHS} yfmt={v=>"$"+v.toFixed(0)+"M"}
              series={[
                { data:REV_INFLUENCED, color:"var(--violet)" },
                { data:REV_SOURCED, color:"var(--green)" },
              ]}/>
          </div>
        </Panel>

        {/* Workflow Efficiency */}
        <Panel className="card-hover" title="Workflow Efficiency" icon="zap">
          <div className="panel-body" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <Donut size={150} thickness={18}
              segments={[
                {value:87,color:"var(--violet)"},
                {value:9,color:"var(--blue)"},
                {value:4,color:"var(--surface-sunken)"},
              ]}
              center={<div><div className="mono" style={{fontSize:26,fontWeight:600}}>87%</div><div style={{fontSize:10,color:"var(--ink-3)"}}>automated</div></div>}/>
            <div style={{width:"100%",marginTop:6}}>
              <div className="stat-row"><span className="l"><span className="dot dot-violet"></span>Fully automated</span><span className="v">87%</span></div>
              <div className="stat-row"><span className="l"><span className="dot dot-blue" style={{background:"var(--blue)"}}></span>Human-approved</span><span className="v">9%</span></div>
              <div className="stat-row"><span className="l"><span className="dot dot-gray"></span>Manual</span><span className="v">4%</span></div>
            </div>
          </div>
        </Panel>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
        {/* Signal Detection Trends */}
        <Panel className="card-hover" style={{gridColumn:"span 2"}} title="Signal Detection Trends" icon="signal"
          right={<><Badge tone="violet" dot="violet">Funding</Badge><Badge tone="amber" dot="amber">Hiring</Badge><Badge tone="cyan" dot="green">Tech</Badge></>}>
          <div className="panel-body">
            <div className="row gap-4" style={{marginBottom:4}}>
              <div><div className="eyebrow">Signals / mo</div><div className="mono" style={{fontSize:22,fontWeight:600}}>128</div></div>
              <div><div className="eyebrow">Conversion to pipeline</div><div className="mono" style={{fontSize:22,fontWeight:600,color:"var(--green)"}}>23%</div></div>
            </div>
            <BarChart w={620} h={200} labels={MONTHS} data={SIGNALS_BY_MO}
              color={["var(--violet)","var(--amber)","var(--cyan)"]} yfmt={v=>Math.round(v)}/>
          </div>
        </Panel>

        {/* Cost Savings */}
        <Panel className="card-hover" title="Cost Savings" icon="dollar">
          <div className="panel-body">
            <div className="eyebrow">AI workforce vs. manual GTM</div>
            <div className="mono" style={{fontSize:30,fontWeight:600,color:"var(--violet)",letterSpacing:"-0.03em",margin:"6px 0 14px"}}>$2.8M<span style={{fontSize:13,color:"var(--ink-3)"}}> saved / yr</span></div>
            {[
              {l:"Manual GTM cost",v:"$3.9M",w:100,c:"var(--ink-4)"},
              {l:"AI workforce cost",v:"$1.1M",w:28,c:"var(--violet)"},
            ].map((r,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div className="row gap-2" style={{justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"var(--ink-2)"}}>{r.l}</span>
                  <span className="mono" style={{fontSize:12.5,fontWeight:600}}>{r.v}</span>
                </div>
                <div className="health-bar" style={{height:8}}><div className="health-fill" style={{width:r.w+"%",background:r.c}}></div></div>
              </div>
            ))}
            <div className="divider" style={{margin:"6px 0 10px"}}></div>
            <div className="stat-row"><span className="l">Cost per task</span><span className="v">$0.11</span></div>
            <div className="stat-row"><span className="l">FTE equivalent</span><span className="v">14 reps</span></div>
          </div>
        </Panel>
      </div>

      {/* Agent Performance Comparison */}
      <Panel className="card-hover" title="Agent Performance & Comparison" icon="analytics"
        right={<button className="btn btn-sm"><Icon name="sliders" size={13}/>Compare</button>}>
        <div style={{overflowX:"auto"}}>
          <table className="tbl">
            <thead><tr>
              <th>Agent</th><th>Department</th><th>Performance</th><th>ROI</th><th>Tasks ({(totalTasks/1000).toFixed(0)}K total)</th><th>Monthly cost</th>
            </tr></thead>
            <tbody>
              {AGENT_PERF.map(a=>(
                <tr key={a.code}>
                  <td><div className="cell-co"><span style={{width:26,height:26,borderRadius:7,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:10.5,fontWeight:600}}>{a.code}</span><span style={{fontWeight:500}}>{a.name}</span></div></td>
                  <td><span style={{color:"var(--ink-2)",fontSize:12.5}}>{window.LondonData.AGENTS.find(x=>x.code===a.code)?.dept||"—"}</span></td>
                  <td><div className="conf"><div className="conf-track" style={{width:90}}><div className="conf-fill" style={{width:a.perf+"%",background:a.perf>=90?"var(--green)":a.perf>=85?"var(--violet)":"var(--amber)"}}></div></div><span className="conf-num">{a.perf}</span></div></td>
                  <td><span className="mono" style={{fontWeight:600,color:a.roi>=5?"var(--green)":"var(--ink)"}}>{a.roi}x</span></td>
                  <td>
                    <div className="row gap-2">
                      <div className="conf-track" style={{width:80}}><div className="conf-fill" style={{width:(a.tasks/42310*100)+"%",background:a.color}}></div></div>
                      <span className="mono" style={{fontSize:11.5,color:"var(--ink-2)"}}>{a.tasks.toLocaleString("en-US")}</span>
                    </div>
                  </td>
                  <td><span className="mono" style={{fontSize:12.5}}>${a.cost.toLocaleString("en-US")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

window.AnalyticsPage = AnalyticsPage;
