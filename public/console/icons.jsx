// icons.jsx — inline stroke icons (Lucide-style), no emoji
// Usage: <Icon name="home" /> or individual exports
const _I = (paths, vb = "0 0 24 24") => (props = {}) => (
  <svg viewBox={vb} width={props.size || 20} height={props.size || 20}
    fill="none" stroke="currentColor" strokeWidth={props.sw || 1.7}
    strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    {paths}
  </svg>
);

const Icons = {
  home: _I(<><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9 21v-6h6v6"/></>),
  command: _I(<><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/></>),
  workforce: _I(<><circle cx="12" cy="7" r="3"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/><circle cx="19" cy="6" r="1.6"/><circle cx="5" cy="6" r="1.6"/></>),
  builder: _I(<><path d="M12 3v3"/><circle cx="12" cy="8" r="2.5"/><path d="M12 10.5V14"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M12 14 6.5 16M12 14l5.5 2"/></>),
  marketplace: _I(<><path d="M4 8h16l-1 4H5L4 8Z"/><path d="M4 8 3 5"/><rect x="5" y="12" width="14" height="8" rx="1.5"/><path d="M9 12v8M15 12v8"/></>),
  catalog: _I(<><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>),
  analytics: _I(<><path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-3M12 16V8M16 16v-6M20 16v-2" strokeWidth="2.2"/></>),
  integrations: _I(<><path d="M8 8V6a4 4 0 0 1 8 0v2"/><rect x="5" y="8" width="14" height="12" rx="2.5"/><path d="M12 13v3"/></>),
  govern: _I(<><path d="M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></>),
  pulse: _I(<><path d="M3 12h4l2.5-7 5 14L17 12h4"/></>),
  signal: _I(<><path d="M5 18a13 13 0 0 1 14 0"/><path d="M8 14.5a8 8 0 0 1 8 0"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/></>),
  revenue: _I(<><path d="M12 2v20"/><path d="M17 6.5c0-2-2.2-3-5-3s-5 1-5 3 2.2 2.8 5 3.5 5 1.5 5 3.5-2.2 3-5 3-5-1.3-5-3"/></>),
  zap: _I(<><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></>),
  bell: _I(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/></>),
  search: _I(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>),
  filter: _I(<><path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/></>),
  chevR: _I(<><path d="m9 6 6 6-6 6"/></>),
  chevD: _I(<><path d="m6 9 6 6 6-6"/></>),
  arrowUp: _I(<><path d="M12 19V5M6 11l6-6 6 6"/></>),
  arrowDown: _I(<><path d="M12 5v14M6 13l6 6 6-6"/></>),
  arrowR: _I(<><path d="M5 12h14M13 6l6 6-6 6"/></>),
  trendUp: _I(<><path d="M3 17 9 11l4 4 8-8"/><path d="M21 11V7h-4"/></>),
  dollar: _I(<><circle cx="12" cy="12" r="9"/><path d="M14.5 9c0-1.2-1.1-2-2.5-2s-2.5.8-2.5 2 1.1 1.8 2.5 2.2 2.5 1 2.5 2.2-1.1 2-2.5 2-2.5-.8-2.5-2"/><path d="M12 6v1.5M12 16.5V18"/></>),
  heart: _I(<><path d="M12 20s-7-4.3-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.7 12 20 12 20Z"/></>),
  alert: _I(<><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17.5v.5" strokeWidth="2"/></>),
  check: _I(<><path d="M4 12.5 9 17l11-11"/></>),
  checkCircle: _I(<><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>),
  clock: _I(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>),
  building: _I(<><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/></>),
  tag: _I(<><path d="M3 12V4a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/></>),
  layers: _I(<><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></>),
  cpu: _I(<><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2"/></>),
  globe: _I(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></>),
  target: _I(<><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>),
  flow: _I(<><rect x="3" y="4" width="6" height="5" rx="1.5"/><rect x="15" y="4" width="6" height="5" rx="1.5"/><rect x="9" y="15" width="6" height="5" rx="1.5"/><path d="M6 9v3a2 2 0 0 0 2 2h1M18 9v3a2 2 0 0 1-2 2h-1"/></>),
  plus: _I(<><path d="M12 5v14M5 12h14"/></>),
  settings: _I(<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></>),
  more: _I(<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>),
  external: _I(<><path d="M14 5h5v5M19 5l-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>),
  play: _I(<><path d="M7 5l11 7-11 7V5Z"/></>),
  pause: _I(<><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></>),
  sliders: _I(<><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"/><circle cx="15" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></>),
  shield: _I(<><path d="M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6l-8-3Z"/></>),
  database: _I(<><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></>),
  mail: _I(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>),
  slack: _I(<><rect x="8" y="3" width="3" height="9" rx="1.5"/><rect x="3" y="13" width="9" height="3" rx="1.5"/><rect x="13" y="12" width="3" height="9" rx="1.5"/><rect x="12" y="8" width="9" height="3" rx="1.5"/></>),
  spark: _I(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></>),
  users: _I(<><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5M21 20a6 6 0 0 0-5-5.9"/></>),
  briefcase: _I(<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></>),
  eye: _I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>),
  link: _I(<><path d="M9 15l6-6"/><path d="M10.5 6.5 12 5a4 4 0 0 1 6 6l-1.5 1.5M13.5 17.5 12 19a4 4 0 0 1-6-6l1.5-1.5"/></>),
  grid: _I(<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>),
  list: _I(<><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="2"/></>),
  refresh: _I(<><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v4h-4"/></>),
  download: _I(<><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></>),
  fund: _I(<><path d="M3 21h18"/><rect x="5" y="10" width="3" height="8"/><rect x="10.5" y="6" width="3" height="12"/><rect x="16" y="13" width="3" height="5"/></>),
  hiring: _I(<><circle cx="10" cy="8" r="3"/><path d="M4 20a6 6 0 0 1 12 0"/><path d="M18 8v6M15 11h6"/></>),
  pricetag: _I(<><path d="M3 12V4a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/></>),
  tech: _I(<><path d="m8 16-4-4 4-4M16 8l4 4-4 4M14 4l-4 16"/></>),
  expand: _I(<><path d="M4 10V4h6M20 14v6h-6M4 4l6 6M20 20l-6-6"/></>),
};

function Icon({ name, ...props }) {
  const C = Icons[name];
  return C ? <C {...props} /> : null;
}

window.Icon = Icon;
window.Icons = Icons;
