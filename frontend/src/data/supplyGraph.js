export const NODES = [
  { id: 'n1',  name: 'Shanghai Port',       x: 638, y: 152, type: 'Port',      status: 'disrupted', risk: 0.9,  region: 'Asia' },
  { id: 'n2',  name: 'Foxconn Shenzhen',    x: 608, y: 182, type: 'Supplier',  status: 'warning',   risk: 0.6,  region: 'Asia' },
  { id: 'n3',  name: 'Samsung Vietnam',     x: 585, y: 218, type: 'Supplier',  status: 'ok',        risk: 0.2,  region: 'Asia' },
  { id: 'n4',  name: 'Ningbo Port',         x: 648, y: 168, type: 'Port',      status: 'ok',        risk: 0.15, region: 'Asia' },
  { id: 'n5',  name: 'Singapore Hub',       x: 578, y: 262, type: 'Hub',       status: 'warning',   risk: 0.45, region: 'Asia' },
  { id: 'n6',  name: 'Dubai Logistics',     x: 438, y: 188, type: 'Hub',       status: 'ok',        risk: 0.1,  region: 'Middle East' },
  { id: 'n7',  name: 'Rotterdam Port',      x: 318, y: 92,  type: 'Port',      status: 'ok',        risk: 0.05, region: 'Europe' },
  { id: 'n8',  name: 'LA Distribution',     x: 98,  y: 162, type: 'Warehouse', status: 'ok',        risk: 0.1,  region: 'North America' },
  { id: 'n9',  name: 'Chicago DC',          x: 132, y: 132, type: 'Warehouse', status: 'ok',        risk: 0.05, region: 'North America' },
  { id: 'n10', name: 'Hamburg Port',        x: 342, y: 86,  type: 'Port',      status: 'ok',        risk: 0.05, region: 'Europe' },
  { id: 'n11', name: 'Mumbai Supplier',     x: 492, y: 198, type: 'Supplier',  status: 'disrupted', risk: 0.8,  region: 'South Asia' },
  { id: 'n12', name: 'Felixstowe Port',     x: 305, y: 88,  type: 'Port',      status: 'ok',        risk: 0.05, region: 'Europe' },
  { id: 'n13', name: 'Tokyo Supplier',      x: 680, y: 138, type: 'Supplier',  status: 'ok',        risk: 0.1,  region: 'Asia' },
  { id: 'n14', name: 'NYC Warehouse',       x: 175, y: 128, type: 'Warehouse', status: 'ok',        risk: 0.05, region: 'North America' },
]

export const ROUTES = [
  { id: 'r1',  from: 'n1',  to: 'n8',  type: 'primary', status: 'disrupted', label: 'Trans-Pacific' },
  { id: 'r2',  from: 'n4',  to: 'n8',  type: 'alt',     status: 'active',    label: 'Alt via Ningbo' },
  { id: 'r3',  from: 'n2',  to: 'n1',  type: 'primary', status: 'warning',   label: 'Shenzhen→Shanghai' },
  { id: 'r4',  from: 'n3',  to: 'n5',  type: 'primary', status: 'ok',        label: 'Vietnam→Singapore' },
  { id: 'r5',  from: 'n5',  to: 'n6',  type: 'primary', status: 'ok',        label: 'Singapore→Dubai' },
  { id: 'r6',  from: 'n6',  to: 'n7',  type: 'primary', status: 'ok',        label: 'Dubai→Rotterdam' },
  { id: 'r7',  from: 'n7',  to: 'n8',  type: 'primary', status: 'ok',        label: 'Rotterdam→LA' },
  { id: 'r8',  from: 'n11', to: 'n6',  type: 'primary', status: 'disrupted', label: 'Mumbai→Dubai' },
  { id: 'r9',  from: 'n10', to: 'n14', type: 'primary', status: 'ok',        label: 'Hamburg→NYC' },
  { id: 'r10', from: 'n13', to: 'n1',  type: 'primary', status: 'ok',        label: 'Tokyo→Shanghai' },
  { id: 'r11', from: 'n12', to: 'n14', type: 'primary', status: 'ok',        label: 'Felixstowe→NYC' },
]

export const INITIAL_DISRUPTIONS = [
  {
    id: 'd1', type: 'Port Delay', location: 'Shanghai, China',
    severity: 9, age: '14m ago', color: 'red',
    affectedNodes: ['n1', 'n2'], skus: ['P100','P104','P109'],
    revenueAtRisk: 2400000, delay: 14,
  },
  {
    id: 'd2', type: 'Supplier Failure', location: 'Mumbai, India',
    severity: 7, age: '28m ago', color: 'red',
    affectedNodes: ['n11'], skus: ['P200','P201'],
    revenueAtRisk: 1800000, delay: 21,
  },
  {
    id: 'd3', type: 'Weather Warning', location: 'South China Sea',
    severity: 5, age: '1h ago', color: 'amber',
    affectedNodes: ['n5'], skus: ['P300'],
    revenueAtRisk: 900000, delay: 7,
  },
  {
    id: 'd4', type: 'Demand Spike', location: 'LA Distribution',
    severity: 3, age: '2h ago', color: 'green',
    affectedNodes: ['n8'], skus: ['P400','P401','P402'],
    revenueAtRisk: 0, delay: 0,
  },
]

export const SIM_SCENARIOS = {
  typhoon: {
    label: 'Typhoon Strike', icon: '🌀',
    disruption: { type: 'Typhoon Warning', location: 'South China Sea', severity: 10, color: 'red', affectedNodes: ['n1','n4','n5'], skus: ['P100','P200','P300','P400'], revenueAtRisk: 6800000, delay: 21 },
    reasoning: [
      { agent: 'Detection', icon: 'D', text: 'ALERT: Typhoon Haikui · Cat-4 · Landfall ETA 18h · South China Sea', color: 'red' },
      { agent: 'Detection', icon: 'D', text: 'Severity: 10/10 · Type: WEATHER_EXTREME · Affected corridor: Shanghai–LA', color: 'red' },
      { agent: 'Impact',    icon: 'I', text: 'Modeling: 14 routes disrupted · 8 suppliers affected · 7–21 day delays', color: 'amber' },
      { agent: 'Impact',    icon: 'I', text: 'Revenue at risk: $6.8M · Critical SKUs: 22 · Stock-out risk in 18 days', color: 'amber' },
      { agent: 'Decision',  icon: 'Dc', text: 'Pre-emptive reroute required. Issuing emergency orders before landfall...', color: 'teal' },
      { agent: 'Action',    icon: 'A', text: '✓ 6 shipments rerouted via Indian Ocean · 3 emergency POs issued · $6.8M → $1.2M', color: 'green', done: true },
    ],
    action: { icon: '🛡️', title: 'Pre-emptive Reroute', sub: '6 shipments diverted · Indian Ocean corridor', tag: 'blue' },
  },
  port_strike: {
    label: 'Port Strike', icon: '🚢',
    disruption: { type: 'Port Strike', location: 'Los Angeles, CA', severity: 8, color: 'red', affectedNodes: ['n8','n9'], skus: ['P100','P200'], revenueAtRisk: 3100000, delay: 10 },
    reasoning: [
      { agent: 'Detection', icon: 'D', text: 'ALERT: Labour union vote — Port of LA strike · 72h notice issued', color: 'red' },
      { agent: 'Detection', icon: 'D', text: 'Severity: 8/10 · Type: PORT_STRIKE · Confidence: 0.87', color: 'red' },
      { agent: 'Impact',    icon: 'I', text: 'Impact: 340 TEUs in transit · LA-bound cargo blocked · 12 customers affected', color: 'amber' },
      { agent: 'Decision',  icon: 'Dc', text: 'Diverting to Port of Long Beach · +1 day · $22k vs $3.1M delay cost', color: 'teal' },
      { agent: 'Action',    icon: 'A', text: '✓ Carrier notified · Booking rerouted · Customs pre-clearance filed at Long Beach', color: 'green', done: true },
    ],
    action: { icon: '⚓', title: 'Divert to Long Beach', sub: '340 TEUs · +1 day · Cost $22k', tag: 'amber' },
  },
  supplier_bankrupt: {
    label: 'Supplier Failure', icon: '📉',
    disruption: { type: 'Supplier Bankruptcy', location: 'Global / MegaComp', severity: 9, color: 'red', affectedNodes: ['n2','n11'], skus: ['P100','P101','P102','P103'], revenueAtRisk: 4200000, delay: 60 },
    reasoning: [
      { agent: 'Detection', icon: 'D', text: 'NEWS SIGNAL: MegaComp Ltd files Chapter 11 · Primary component supplier for P100–P120', color: 'red' },
      { agent: 'Detection', icon: 'D', text: 'Severity: 9/10 · Type: SUPPLIER_FAILURE · 38 SKUs dependent', color: 'red' },
      { agent: 'Impact',    icon: 'I', text: 'Stock cover: 23 days remaining · Requalification timeline: 60–90 days', color: 'amber' },
      { agent: 'Decision',  icon: 'Dc', text: 'Emergency dual-source: TechParts Asia + Alpha Semicon approved as backup suppliers', color: 'teal' },
      { agent: 'Action',    icon: 'A', text: '✓ 3 emergency POs created · Total: $1.2M · Delivery: 14–18 days · Risk mitigated', color: 'green', done: true },
    ],
    action: { icon: '📦', title: 'Emergency POs Issued', sub: 'TechParts Asia + Alpha Semicon · $1.2M', tag: 'green' },
  },
  geopolitical: {
    label: 'Trade Sanctions', icon: '⚠️',
    disruption: { type: 'Trade Sanctions', location: 'East Asia Region', severity: 7, color: 'amber', affectedNodes: ['n1','n2','n13'], skus: ['P500','P501'], revenueAtRisk: 2100000, delay: 30 },
    reasoning: [
      { agent: 'Detection', icon: 'D', text: 'REGULATORY: New semiconductor export sanctions · Region: East Asia', color: 'red' },
      { agent: 'Detection', icon: 'D', text: 'Severity: 7/10 · Type: GEOPOLITICAL · Legal review triggered', color: 'red' },
      { agent: 'Impact',    icon: 'I', text: 'Affected components: 14 SKUs · Compliance review for 6 vendors initiated', color: 'amber' },
      { agent: 'Decision',  icon: 'Dc', text: 'Switching sourcing to compliant regions: Mexico, Vietnam, India corridors', color: 'teal' },
      { agent: 'Action',    icon: 'A', text: '✓ Compliance report generated · Legal team notified · 4 alternate suppliers queued', color: 'green', done: true },
    ],
    action: { icon: '⚖️', title: 'Compliance Reroute', sub: '4 alternate suppliers queued · Mexico/Vietnam', tag: 'blue' },
  },
}

export const DEFAULT_REASONING = [
  { agent: 'Detection', icon: 'D', text: 'Ingesting signal: Shanghai Port — gate closures 68% above normal', color: 'red' },
  { agent: 'Detection', icon: 'D', text: 'Severity score: 9.1/10 · Type: PORT_DELAY · Confidence: 0.94', color: 'red' },
  { agent: 'Impact',    icon: 'I', text: 'Running graph traversal on supply chain DAG · 312 nodes · 847 edges', color: 'amber' },
  { agent: 'Impact',    icon: 'I', text: 'Affected SKUs: P100, P104, P109 · Downstream nodes: 6 · Customers at risk: 3', color: 'amber' },
  { agent: 'Impact',    icon: 'I', text: 'Estimated delay: +14 days · Revenue impact: $2.4M', color: 'amber' },
  { agent: 'Decision',  icon: 'Dc', text: 'Evaluating: (1) Reroute via Ningbo +2d $18k (2) Air freight +0d $340k (3) Wait $2.4M loss', color: 'teal' },
  { agent: 'Decision',  icon: 'Dc', text: 'Selecting: Option 1 — Reroute via Ningbo · Best cost-delay tradeoff · Confidence 0.91', color: 'teal' },
  { agent: 'Action',    icon: 'A', text: '✓ Route updated via Ningbo API · ETA recalculated · Stakeholders notified', color: 'green', done: true },
]
