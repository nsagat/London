// workspace.jsx — London Workspace: conversational AI CRO (the hero screen)
const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

const LondonAvatar = () => (
  <img src={window.MASCOT_SRC} alt="London" className="msg-av"
    style={{background:"none",boxShadow:"none",objectFit:"contain",padding:0}}/>
);

const CAPS = [
  { ic:"catalog",   t:"Find GTM agents" },
  { ic:"workforce", t:"Build an AI sales team" },
  { ic:"zap",       t:"Monitor competitors" },
  { ic:"signal",    t:"Discover buying signals" },
  { ic:"building",  t:"Research accounts" },
  { ic:"flow",      t:"Optimize revenue workflows" },
];

const SUGGESTIONS = [
  { t:"Find me the best SDR agents for SaaS", ic:"catalog" },
  { t:"Build my GTM team", ic:"workforce" },
  { t:"Monitor competitors", ic:"zap" },
  { t:"Find AI startups with hiring signals", ic:"signal" },
  { t:"Reduce outbound costs", ic:"dollar" },
  { t:"Improve lead generation", ic:"trendUp" },
];

const FLOW = [
  { key:"crm",    q:"Great choice. Let me design the right team — I'll ask a few quick questions first.\n\nWhich CRM do you run on?", chips:["Salesforce","HubSpot","Pipedrive","Not yet"] },
  { key:"budget", q:"Got it. What's your monthly budget for the AI workforce?", chips:["Under $2K","$2K–$5K","$5K–$10K","$10K+"] },
  { key:"leads",  q:"And how many qualified leads do you need per month?", chips:["~50","~100","~250","500+"] },
  { key:"market", q:"Last one — which market are you targeting?", chips:["North America","EMEA","APAC","Global"] },
];

function detectIntent(text){
  const t = text.toLowerCase();
  if(/sdr|outbound|cold|sequence/.test(t)) return { label:"scale outbound", codes:["PRX","OUT","QAL","ENR"] };
  if(/competitor|competitive|pricing/.test(t)) return { label:"monitor competitors", codes:["CMP","SIG","BRF"] };
  if(/signal|hiring|funding|intent|startup/.test(t)) return { label:"capture buying signals", codes:["SIG","ENR","PRX","CMP"] };
  if(/cost|reduce|efficien|cheap|save/.test(t)) return { label:"reduce GTM cost", codes:["QAL","OUT","BRF"] };
  if(/lead|inbound|generation|pipeline|demand/.test(t)) return { label:"grow pipeline", codes:["PRX","SIG","OUT","QAL"] };
  if(/team|build|gtm|workforce/.test(t)) return { label:"build your GTM team", codes:["PRX","SIG","OUT","QAL","BRF"] };
  return { label:"hit your revenue goals", codes:["PRX","SIG","OUT","QAL"] };
}
const budgetCap = (b)=> b==="Under $2K"?2 : b==="$2K–$5K"?3 : b==="$5K–$10K"?4 : 6;

function buildRec(intent, answers){
  const { CATALOG, ROI_BY_CODE, parseCost } = window.LondonData;
  const cap = budgetCap(answers.budget);
  let picks = intent.codes.map(c=>CATALOG.find(a=>a.code===c)).filter(Boolean);
  picks = picks.sort((a,b)=>b.perf-a.perf).slice(0, Math.max(2,cap));
  const agents = picks.map(a=>({ ...a, roi:ROI_BY_CODE[a.code]||4.5, match: Math.min(98, a.perf+ (Math.random()<0.5?2:4)), costN: parseCost(a.cost) }));
  const cost = agents.reduce((s,a)=>s+a.costN,0);
  const blended = agents.reduce((s,a)=>s+a.roi,0)/agents.length;
  const match = Math.round(agents.reduce((s,a)=>s+a.match,0)/agents.length);
  const proj = Math.round(cost*blended*12/1000);
  return { intent, answers, agents, cost, blended:+blended.toFixed(1), match, proj };
}

function RecCard({ rec, onOpen, onCustomize }){
  const a = rec.agents;
  return (
    <div className="rec-card">
      <div className="rec-hero">
        <div className="row gap-2" style={{justifyContent:"space-between",marginBottom:6,flexWrap:"wrap"}}>
          <span className="eyebrow">Recommended GTM Agent Stack</span>
          <span className="badge badge-violet" style={{fontSize:11}}><Icon name="target" size={12}/> {rec.match}% match</span>
        </div>
        <h3 style={{fontSize:18,fontWeight:600,letterSpacing:"-0.02em"}}>An AI revenue team to {rec.intent.label}</h3>
        <p style={{fontSize:12.5,color:"var(--ink-2)",margin:"4px 0 0"}}>{a.length} agents · tuned for {rec.answers.crm} · {rec.answers.market} · {rec.answers.leads} leads/mo target</p>
      </div>

      <div className="rec-stat-grid">
        <div className="rec-stat"><div className="eyebrow">Monthly cost</div><div className="mono" style={{fontSize:18,fontWeight:600,marginTop:3}}>${(rec.cost/1000).toFixed(1)}K</div></div>
        <div className="rec-stat"><div className="eyebrow">Blended ROI</div><div className="mono" style={{fontSize:18,fontWeight:600,marginTop:3,color:"var(--green)"}}>{rec.blended}x</div></div>
        <div className="rec-stat"><div className="eyebrow">Proj. revenue / yr</div><div className="mono" style={{fontSize:18,fontWeight:600,marginTop:3,color:"var(--green)"}}>${rec.proj}K</div></div>
        <div className="rec-stat"><div className="eyebrow">Setup time</div><div className="mono" style={{fontSize:18,fontWeight:600,marginTop:3}}>~4 wks</div></div>
      </div>

      <div>
        {a.map(ag=>(
          <div key={ag.code} className="rec-agent">
            <span style={{width:32,height:32,borderRadius:9,background:ag.color,color:"#fff",display:"grid",placeItems:"center",fontFamily:"var(--mono)",fontSize:11,fontWeight:600,flexShrink:0}}>{ag.code}</span>
            <div style={{flex:1,minWidth:0}}>
              <div className="row gap-2" style={{justifyContent:"space-between"}}>
                <span style={{fontSize:13.5,fontWeight:600}}>{ag.name}</span>
                <span className="mono" style={{fontSize:12,color:"var(--ink-2)"}}>{ag.cost}</span>
              </div>
              <div style={{fontSize:11.5,color:"var(--ink-3)",margin:"1px 0 5px"}}>{ag.fn}</div>
              <div className="conf"><div className="conf-track" style={{flex:1,maxWidth:200}}><div className="conf-fill" style={{width:ag.match+"%"}}></div></div><span className="conf-num">{ag.match}% match</span></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{padding:14,background:"var(--surface-2)",borderTop:"1px solid var(--border-faint)"}}>
        <div className="eyebrow" style={{marginBottom:8}}>Deployment plan</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Connect data & CRM","Deploy core agents","Enable orchestration","Autonomy + governance"].map((p,i)=>(
            <div key={i} className="row gap-2" style={{fontSize:11.5,color:"var(--ink-2)"}}>
              <span className="mono" style={{width:18,height:18,borderRadius:"50%",background:"var(--violet-tint)",color:"var(--violet)",display:"grid",placeItems:"center",fontSize:9.5,fontWeight:600}}>{i+1}</span>
              {p}{i<3 && <Icon name="chevR" size={12} style={{color:"var(--ink-4)"}}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="row gap-2" style={{padding:14,borderTop:"1px solid var(--border-faint)"}}>
        <button className="btn btn-primary" onClick={onCustomize}><Icon name="sliders" size={15}/>Customize in Builder</button>
        <button className="btn"><Icon name="play" size={15}/>Deploy this team</button>
        <button className="btn btn-ghost ml-auto" onClick={onOpen}><Icon name="home" size={15}/>Open Command Center</button>
      </div>
    </div>
  );
}

function WorkspacePage({ go, onUnlock }){
  const [messages, setMessages] = useStateW([{ role:"assistant", kind:"hero" }]);
  const [thinking, setThinking] = useStateW(false);
  const [step, setStep] = useStateW(-1); // -1 = intro (suggestions visible)
  const [answers, setAnswers] = useStateW({});
  const [intent, setIntent] = useStateW(null);
  const [input, setInput] = useStateW("");
  const [done, setDone] = useStateW(false);
  const scrollRef = useRefW();
  const taRef = useRefW();

  const scrollDown = ()=>{ const el=scrollRef.current; if(el) requestAnimationFrame(()=> el.scrollTop = el.scrollHeight); };
  useEffectW(scrollDown, [messages, thinking]);

  const botSay = (msg, delay=900)=>{
    setThinking(true);
    setTimeout(()=>{ setThinking(false); setMessages(m=>[...m, { role:"assistant", ...msg }]); }, delay);
  };

  const handleSend = (textArg)=>{
    const text = (textArg ?? input).trim();
    if(!text || thinking || done) return;
    setInput("");
    setMessages(m=>[...m, { role:"user", text }]);

    if(step === -1){
      const it = detectIntent(text);
      setIntent(it);
      setStep(0);
      botSay({ kind:"text", text: FLOW[0].q, chips: FLOW[0].chips }, 1000);
      return;
    }
    // collecting intake answers
    if(step >= 0 && step < FLOW.length){
      const key = FLOW[step].key;
      const next = step + 1;
      setAnswers(a=>({ ...a, [key]: text }));
      if(next < FLOW.length){
        setStep(next);
        botSay({ kind:"text", text: FLOW[next].q, chips: FLOW[next].chips }, 950);
      } else {
        // all collected → generate
        setStep(FLOW.length);
        const finalAnswers = { ...answers, [key]: text };
        setThinking(true);
        setTimeout(()=>{
          setMessages(m=>[...m, { role:"assistant", kind:"text", text:"Perfect — analyzing your goals against 200K+ live signals from Bright Data and matching the highest-performing agents…" }]);
        }, 900);
        setTimeout(()=>{
          const rec = buildRec(intent, finalAnswers);
          setThinking(false);
          setMessages(m=>[...m, { role:"assistant", kind:"text", text:`Here's the AI revenue team I'd deploy to ${intent.label}. It scores a ${rec.match}% match against your setup.` , rec }]);
          setDone(true);
          onUnlock();
        }, 2600);
      }
    }
  };

  const onKey = (e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); handleSend(); } };
  const autosize = ()=>{ const t=taRef.current; if(t){ t.style.height="auto"; t.style.height=Math.min(t.scrollHeight,132)+"px"; } };

  return (
    <div className="workspace">
      <div className="ws-scroll" ref={scrollRef}>
        <div className="ws-col">
          {messages.map((m,i)=>{
            if(m.role==="user") return (
              <div key={i} className="msg msg-user"><div className="msg-bubble">{m.text}</div></div>
            );
            // assistant
            if(m.kind==="hero") return (
              <div key={i} className="msg">
                <LondonAvatar/>
                <div className="msg-body ws-hero">
                  <h2>Hi Acme <span style={{fontFamily:'inherit'}}>👋</span></h2>
                  <p className="lede">I'm <strong>London</strong> — your AI Chief Revenue Officer.</p>
                  <p style={{color:"var(--ink-2)"}}>What are you trying to achieve today? I can help you:</p>
                  <div className="ws-caps">
                    {CAPS.map(c=>(
                      <div key={c.t} className="ws-cap"><span className="ic"><Icon name={c.ic} size={13}/></span>{c.t}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
            return (
              <div key={i}>
                <div className="msg">
                  <LondonAvatar/>
                  <div className="msg-body">
                    <div className="msg-name">London</div>
                    {String(m.text).split("\n\n").map((para,pi)=>(<p key={pi}>{para}</p>))}
                    {m.rec && <RecCard rec={m.rec} onOpen={()=>go("home")} onCustomize={()=>{ window.LONDON_PLAN={codes:m.rec.agents.map(a=>a.code),answers:m.rec.answers,intent:m.rec.intent,match:m.rec.match}; go("builder"); }}/>}
                    {m.chips && step < FLOW.length && i===messages.length-1 && !thinking && (
                      <div className="ws-chips">
                        {m.chips.map(c=>(<button key={c} className="ws-chip" onClick={()=>handleSend(c)}>{c}</button>))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* suggested prompts (intro only) */}
          {step===-1 && !thinking && (
            <div className="ws-suggest">
              {SUGGESTIONS.map(s=>(
                <button key={s.t} className="ws-prompt" onClick={()=>handleSend(s.t)}><Icon name={s.ic} size={14}/>{s.t}</button>
              ))}
            </div>
          )}

          {thinking && (
            <div className="msg">
              <LondonAvatar/>
              <div className="msg-body"><div className="typing"><span></span><span></span><span></span></div></div>
            </div>
          )}
        </div>
      </div>

      <div className="ws-composer-wrap">
        <div className="ws-composer">
          <div className="composer-box">
            <textarea ref={taRef} rows={1} value={input} placeholder={done?"Ask London anything about your team…":"Message London…"}
              onChange={e=>{ setInput(e.target.value); autosize(); }} onKeyDown={onKey}/>
            <button className="send-btn" disabled={!input.trim()||thinking} onClick={()=>handleSend()}>
              <Icon name="arrowUp" size={18} sw={2.4}/>
            </button>
          </div>
          <div className="ws-hint">London · GTM Intelligence · powered by Bright Data — responses are AI-generated</div>
        </div>
      </div>
    </div>
  );
}

window.WorkspacePage = WorkspacePage;
