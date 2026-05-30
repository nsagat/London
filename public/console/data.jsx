// data.jsx — mock data for London GTM Intelligence Platform

// color helper for entity logos
const LOGO_COLORS = ["#5B2BD9","#0E9F6E","#2563EB","#D98A0B","#E0353F","#0E8F9F","#7B52F0","#475569"];
function logoColor(s){ let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))>>>0; return LOGO_COLORS[h%LOGO_COLORS.length]; }
function initials(name){ return name.replace(/[^A-Za-z0-9 ]/g,"").split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase(); }

// ---- AI Agents (the workforce) ----
const AGENTS = [
  { id:"AGT-01", code:"PRX", name:"Prospector",       dept:"Sales Dev",   fn:"Account discovery & ICP scoring",        status:"active",  color:"#5B2BD9", health:98, roiX:6.4,  costMo:1240, tasks:18420, perf:94, deployed:"Mar 2026" },
  { id:"AGT-02", code:"SIG", name:"Signal Scout",     dept:"Intelligence",fn:"Buying-signal detection & enrichment",   status:"active",  color:"#0E8F9F", health:96, roiX:5.1,  costMo:2100, tasks:42310, perf:91, deployed:"Jan 2026" },
  { id:"AGT-03", code:"OUT", name:"Outreach",         dept:"Sales Dev",   fn:"Personalized multi-touch sequencing",    status:"active",  color:"#2563EB", health:92, roiX:4.8,  costMo:1680, tasks:27640, perf:88, deployed:"Feb 2026" },
  { id:"AGT-04", code:"CMP", name:"Competitor Watch", dept:"Strategy",    fn:"Competitive & pricing intelligence",     status:"active",  color:"#D98A0B", health:88, roiX:3.6,  costMo:940,  tasks:9120,  perf:90, deployed:"Apr 2026" },
  { id:"AGT-05", code:"QAL", name:"Qualifier",        dept:"Sales",       fn:"Inbound lead scoring & routing",         status:"active",  color:"#0E9F6E", health:99, roiX:7.2,  costMo:760,  tasks:14880, perf:96, deployed:"Feb 2026" },
  { id:"AGT-06", code:"RNW", name:"Renewals",         dept:"Customer Succ",fn:"Churn-risk & expansion signals",        status:"degraded",color:"#7B52F0", health:74, roiX:5.9,  costMo:1320, tasks:6240,  perf:79, deployed:"Mar 2026" },
  { id:"AGT-07", code:"MKT", name:"Market Mapper",    dept:"Strategy",    fn:"TAM mapping & territory planning",       status:"active",  color:"#475569", health:94, roiX:2.8,  costMo:1100, tasks:3410,  perf:85, deployed:"Apr 2026" },
  { id:"AGT-08", code:"BRF", name:"Briefer",          dept:"Sales",       fn:"Pre-meeting account briefs",             status:"idle",    color:"#E0353F", health:100,roiX:4.1,  costMo:520,  tasks:8930,  perf:92, deployed:"Jan 2026" },
];

// ---- Live intelligence feed ----
const SIGNAL_TYPES = {
  pricing:  { icon:"pricetag", color:"#D98A0B", bg:"#FBF1DE", label:"Pricing" },
  funding:  { icon:"fund",     color:"#0E9F6E", bg:"#E6F6EF", label:"Funding" },
  hiring:   { icon:"hiring",   color:"#2563EB", bg:"#E8EFFE", label:"Hiring" },
  tech:     { icon:"tech",     color:"#7B52F0", bg:"#F1ECFE", label:"Tech change" },
  expansion:{ icon:"trendUp",  color:"#0E8F9F", bg:"#E2F4F6", label:"Expansion" },
  risk:     { icon:"alert",    color:"#E0353F", bg:"#FCEBEC", label:"Risk" },
};

const FEED_SEED = [
  { type:"pricing",  company:"Northwind Logistics", text:"Lowered enterprise tier pricing by 18% — annual plans only", conf:94, source:"Bright Data", agent:"CMP", min:1 },
  { type:"funding",  company:"Vela Robotics",       text:"Closed $42M Series B led by Iconiq — 2 new GTM hires posted", conf:97, source:"Bright Data", agent:"SIG", min:3 },
  { type:"hiring",   company:"Helios Health",       text:"Posted VP Revenue Operations + 4 AE roles in the last 7 days",  conf:89, source:"Bright Data", agent:"SIG", min:6 },
  { type:"tech",     company:"Cobalt Finance",      text:"Migrated checkout from Stripe to internal — integration window open", conf:82, source:"Bright Data", agent:"CMP", min:11 },
  { type:"expansion",company:"Meridian Retail",     text:"Opened 3 EMEA offices — territory now in active expansion", conf:91, source:"Bright Data", agent:"MKT", min:18 },
  { type:"risk",     company:"Atlas Manufacturing", text:"Usage down 34% MoM + support tickets rising — churn risk elevated", conf:86, source:"Product API", agent:"RNW", min:24 },
  { type:"hiring",   company:"Quill Software",      text:"New CRO hired from Salesforce — buying committee likely shifting", conf:88, source:"Bright Data", agent:"SIG", min:31 },
  { type:"funding",  company:"Beacon Energy",       text:"Raised $110M growth round — budget cycle reopening Q3", conf:95, source:"Bright Data", agent:"SIG", min:42 },
];

// streaming candidates (prepended live)
const FEED_STREAM = [
  { type:"tech",     company:"Lumen Analytics",   text:"Added Snowflake + dbt to stack — data warehouse modernization", conf:84, source:"Bright Data", agent:"CMP" },
  { type:"hiring",   company:"Forge Industrial",  text:"Hiring 6 SDRs in Austin — outbound motion scaling fast", conf:90, source:"Bright Data", agent:"SIG" },
  { type:"pricing",  company:"Pinnacle Cloud",    text:"Introduced usage-based pricing — repositioning vs incumbents", conf:87, source:"Bright Data", agent:"CMP" },
  { type:"expansion",company:"Driftwood SaaS",    text:"Launched in 4 new verticals — net-new ICP segments detected", conf:83, source:"Bright Data", agent:"MKT" },
  { type:"funding",  company:"Cinder AI",         text:"Seed extension $9M — early but high-velocity, founder-led sales", conf:79, source:"Bright Data", agent:"SIG" },
  { type:"risk",     company:"Granite Telecom",   text:"Key champion left for competitor — relationship risk flagged", conf:81, source:"CRM Sync", agent:"RNW" },
];

// ---- Agent activity timeline / execution traces ----
const TRACES = [
  { agent:"PRX", color:"#5B2BD9", action:"Scored 1,240 net-new accounts against ICP v4", detail:"412 passed threshold · 38 hot", min:0, status:"running" },
  { agent:"SIG", color:"#0E8F9F", action:"Enriched 318 signals across 87 target accounts", detail:"Bright Data · 4 sources merged", min:2, status:"running" },
  { agent:"OUT", color:"#2563EB", action:"Drafted 56 personalized sequences for review", detail:"Tone: executive · awaiting approval", min:5, status:"review" },
  { agent:"QAL", color:"#0E9F6E", action:"Routed 23 inbound leads to AE queue", detail:"Avg score 81 · 6 routed to enterprise", min:9, status:"done" },
  { agent:"CMP", color:"#D98A0B", action:"Detected pricing change at Northwind Logistics", detail:"Confidence 94% · alert dispatched", min:14, status:"done" },
  { agent:"MKT", color:"#475569", action:"Refreshed EMEA territory map for Q3 planning", detail:"3 new regions · 1,890 accounts", min:22, status:"done" },
];

// ---- Account intelligence table ----
const ACCOUNTS = [
  { co:"Vela Robotics",       signal:"Series B raised", type:"funding",  conf:97, source:"Bright Data", action:"Trigger executive outreach", priority:"high",  arr:"$240K" },
  { co:"Northwind Logistics", signal:"Pricing dropped 18%", type:"pricing", conf:94, source:"Bright Data", action:"Send competitive battlecard", priority:"high",  arr:"$180K" },
  { co:"Helios Health",       signal:"RevOps + 4 AE hires", type:"hiring", conf:89, source:"Bright Data", action:"Map new buying committee", priority:"med",   arr:"$320K" },
  { co:"Meridian Retail",     signal:"EMEA expansion", type:"expansion",conf:91, source:"Bright Data", action:"Open EMEA territory play", priority:"high",  arr:"$410K" },
  { co:"Atlas Manufacturing", signal:"Usage -34% MoM", type:"risk",     conf:86, source:"Product API", action:"Launch retention sequence", priority:"high",  arr:"$95K"  },
  { co:"Quill Software",      signal:"New CRO hired", type:"hiring",     conf:88, source:"Bright Data", action:"Re-engage with new champion", priority:"med",   arr:"$150K" },
  { co:"Beacon Energy",       signal:"$110M growth round", type:"funding",conf:95, source:"Bright Data", action:"Add to Q3 enterprise pipeline", priority:"med", arr:"$280K" },
  { co:"Cobalt Finance",      signal:"Stack migration", type:"tech",     conf:82, source:"Bright Data", action:"Pitch integration window", priority:"low",   arr:"$120K" },
];

// ---- KPIs ----
const KPIS = [
  { key:"agents",  label:"Active Agents",     icon:"workforce", value:7,      suffix:"/8", delta:"+1",     dir:"up",   sub:"deployed this quarter", spark:[4,4,5,5,6,6,7,7] },
  { key:"revenue", label:"Revenue Influenced",icon:"revenue",   value:14.2,  prefix:"$", suffix:"M", delta:"+22.4%", dir:"up", sub:"vs. last quarter", spark:[6,7,8,8,10,11,13,14.2] },
  { key:"signals", label:"Signals Collected", icon:"signal",    value:128400,delta:"+9,210", dir:"up",   sub:"last 30 days", spark:[80,88,95,102,110,116,122,128] },
  { key:"tasks",   label:"Tasks Automated",   icon:"zap",       value:96120, delta:"+18.6%", dir:"up",   sub:"this quarter", spark:[40,52,60,68,76,84,90,96] },
];

// ---- Marketplace catalog ----
const CATALOG = [
  { name:"Prospector",      dept:"Sales Dev",    fn:"Account discovery & ICP scoring",       perf:94, cost:"$1,240/mo", color:"#5B2BD9", code:"PRX", integ:["Salesforce","Apollo","Clay"], installed:true,  desc:"Continuously scans your TAM, scores accounts against your ICP, and surfaces net-new logos ready to engage." },
  { name:"Signal Scout",    dept:"Intelligence", fn:"Buying-signal detection & enrichment",  perf:91, cost:"$2,100/mo", color:"#0E8F9F", code:"SIG", integ:["Bright Data","Clay","HubSpot"], installed:true,  desc:"Monitors funding, hiring, tech, and pricing signals across millions of sources via Bright Data." },
  { name:"Outreach",        dept:"Sales Dev",    fn:"Personalized multi-touch sequencing",   perf:88, cost:"$1,680/mo", color:"#2563EB", code:"OUT", integ:["Gmail","Salesforce","Slack"], installed:true,  desc:"Writes and runs executive-grade outbound sequences, adapting tone and timing per account." },
  { name:"Competitor Watch",dept:"Strategy",     fn:"Competitive & pricing intelligence",    perf:90, cost:"$940/mo",   color:"#D98A0B", code:"CMP", integ:["Bright Data","Notion"], installed:true,  desc:"Tracks competitor pricing, positioning, and product changes; auto-generates battlecards." },
  { name:"Qualifier",       dept:"Sales",        fn:"Inbound lead scoring & routing",        perf:96, cost:"$760/mo",   color:"#0E9F6E", code:"QAL", integ:["HubSpot","Slack"], installed:true,  desc:"Scores and routes inbound in real time so AEs only see what's worth their hour." },
  { name:"Renewals",        dept:"Customer Succ",fn:"Churn-risk & expansion signals",        perf:79, cost:"$1,320/mo", color:"#7B52F0", code:"RNW", integ:["Salesforce","Gmail"], installed:true,  desc:"Predicts churn and expansion windows from product usage and relationship signals." },
  { name:"Market Mapper",   dept:"Strategy",     fn:"TAM mapping & territory planning",       perf:85, cost:"$1,100/mo", color:"#475569", code:"MKT", integ:["Bright Data","Apollo"], installed:true,  desc:"Builds living TAM maps and balanced territories from firmographic and signal data." },
  { name:"Briefer",         dept:"Sales",        fn:"Pre-meeting account briefs",            perf:92, cost:"$520/mo",   color:"#E0353F", code:"BRF", integ:["Notion","Gmail","Slack"], installed:true,  desc:"Generates a one-page account brief before every meeting, pulled from live intelligence." },
  { name:"Forecaster",      dept:"RevOps",       fn:"Pipeline & deal forecasting",           perf:87, cost:"$1,450/mo", color:"#0E8F9F", code:"FCT", integ:["Salesforce","HubSpot"], installed:false, desc:"AI-driven pipeline forecasting with deal-level risk scoring and scenario modeling." },
  { name:"Enricher",        dept:"Intelligence", fn:"Contact & account data enrichment",     perf:93, cost:"$880/mo",   color:"#2563EB", code:"ENR", integ:["Apollo","Clay","Bright Data"], installed:false, desc:"Fills and verifies contact, firmographic, and technographic data continuously." },
  { name:"Advocate",        dept:"Customer Succ",fn:"Reference & advocacy matching",         perf:81, cost:"$640/mo",   color:"#D98A0B", code:"ADV", integ:["Slack","Salesforce"], installed:false, desc:"Identifies happy customers and matches them to live deals as references." },
  { name:"Negotiator",      dept:"Sales",        fn:"Deal-desk & pricing guidance",          perf:84, cost:"$1,560/mo", color:"#5B2BD9", code:"NEG", integ:["Salesforce","Notion"], installed:false, desc:"Recommends pricing, discount guardrails, and concession strategy per deal." },
];

const DEPARTMENTS = ["All","Sales Dev","Intelligence","Sales","Strategy","Customer Succ","RevOps"];

// roi per agent code + cost parser (for Workspace recommendations)
const ROI_BY_CODE = { PRX:6.4, SIG:5.1, OUT:4.8, CMP:3.6, QAL:7.2, RNW:5.9, MKT:2.8, BRF:4.1, FCT:4.4, ENR:5.3, ADV:3.9, NEG:4.2 };
function parseCost(c){ return Number(String(c).replace(/[^0-9]/g,"")) || 0; }

// ---- Integrations ----
const INTEGRATIONS = [
  { name:"Bright Data",  cat:"Intelligence", status:"healthy", icon:"globe",       color:"#5B2BD9", desc:"Web-scale signal collection", events:"4.2M/day", latency:"180ms", featured:true },
  { name:"Salesforce",   cat:"CRM",          status:"healthy", icon:"database",    color:"#2563EB", desc:"System of record sync",        events:"86K/day",  latency:"240ms" },
  { name:"HubSpot",      cat:"CRM",          status:"healthy", icon:"target",      color:"#D98A0B", desc:"Marketing & inbound sync",     events:"52K/day",  latency:"210ms" },
  { name:"Clay",         cat:"Enrichment",   status:"healthy", icon:"layers",      color:"#0E9F6E", desc:"Enrichment & waterfalls",      events:"31K/day",  latency:"320ms" },
  { name:"Apollo",       cat:"Enrichment",   status:"degraded",icon:"users",       color:"#7B52F0", desc:"Contact & account data",       events:"28K/day",  latency:"640ms" },
  { name:"Slack",        cat:"Comms",        status:"healthy", icon:"slack",       color:"#0E8F9F", desc:"Alerts & approvals",           events:"12K/day",  latency:"90ms"  },
  { name:"Gmail",        cat:"Comms",        status:"healthy", icon:"mail",        color:"#E0353F", desc:"Outbound execution",           events:"19K/day",  latency:"150ms" },
  { name:"Notion",       cat:"Workspace",    status:"idle",    icon:"briefcase",   color:"#475569", desc:"Briefs & knowledge base",      events:"3K/day",   latency:"280ms" },
];

window.LondonData = {
  AGENTS, SIGNAL_TYPES, FEED_SEED, FEED_STREAM, TRACES, ACCOUNTS, KPIS,
  CATALOG, DEPARTMENTS, INTEGRATIONS, logoColor, initials,
  ROI_BY_CODE, parseCost,
};
