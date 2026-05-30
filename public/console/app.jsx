// app.jsx — root: workspace-first routing with unlock state + skeleton transition
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [page, setPage] = useStateA("workspace");
  const [loading, setLoading] = useStateA(false);
  const [unlocked, setUnlocked] = useStateA(()=> localStorage.getItem("london_unlocked")==="1");
  const [, setLiveTick] = useStateA(0);

  // Fetch live Bright Data intelligence into window.LondonData, then re-render
  // so every page picks up the real data. Falls back to mock if unreachable.
  useEffectA(()=>{
    if (window.loadLondonLive) {
      window.loadLondonLive().then(()=> setLiveTick(t=>t+1)).catch(()=>{});
    }
  }, []);

  const go = (p) => {
    if (p === page) return;
    if (p === "workspace") { setPage(p); return; }
    setLoading(true);
    setPage(p);
    setTimeout(()=>setLoading(false), 420);
  };

  const unlock = ()=>{ setUnlocked(true); localStorage.setItem("london_unlocked","1"); };

  const Pages = {
    home: window.HomePage,
    builder: window.BuilderPage,
    marketplace: window.MarketplacePage,
    analytics: window.AnalyticsPage,
    integrations: window.IntegrationsPage,
    governance: window.GovernancePage,
    access: window.AccessControlPage,
    account: window.AccountPage,
  };
  const Current = Pages[page] || (()=> <div className="content-inner">Coming soon</div>);

  return (
    <div className="app">
      <Sidebar page={page} setPage={go} unlocked={unlocked}/>
      <div className="main">
        <Topbar page={page}/>
        {page === "workspace"
          ? <WorkspacePage go={go} onUnlock={unlock}/>
          : <div className="content">{loading ? <PageSkeleton/> : <Current go={go}/>}</div>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
