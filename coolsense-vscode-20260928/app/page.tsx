"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AirVent,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Building2,
  CircleDollarSign,
  Clock3,
  Cpu,
  Download,
  Gauge,
  Leaf,
  Lightbulb,
  Monitor,
  Radio,
  ShieldCheck,
  Sparkles,
  Sun,
  ThermometerSun,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ZoneStatus = "efficient" | "watch" | "waste" | "solar";

type Zone = {
  id: string;
  name: string;
  short: string;
  occupancy: string;
  temp: number;
  energy: number;
  status: ZoneStatus;
  insight: string;
  action: string;
};

const hourlyData = [
  { time: "00", ac: 0.12, plugs: 0.1, lights: 0 },
  { time: "02", ac: 0.12, plugs: 0.1, lights: 0 },
  { time: "04", ac: 1.18, plugs: 0.1, lights: 0 },
  { time: "06", ac: 1.24, plugs: 0.11, lights: 0 },
  { time: "08", ac: 1.28, plugs: 0.28, lights: 0.29 },
  { time: "10", ac: 1.25, plugs: 0.34, lights: 0.29 },
  { time: "12", ac: 1.22, plugs: 0.31, lights: 0.28 },
  { time: "14", ac: 1.2, plugs: 0.35, lights: 0.29 },
  { time: "16", ac: 1.18, plugs: 0.33, lights: 0.28 },
  { time: "18", ac: 1.14, plugs: 0.29, lights: 0.26 },
  { time: "20", ac: 0.14, plugs: 0.28, lights: 0 },
  { time: "22", ac: 0.12, plugs: 0.11, lights: 0 },
];

const categoryData = [
  { name: "Air-conditioning", value: 18, color: "#35f2a2" },
  { name: "Plug loads", value: 6, color: "#50b7ff" },
  { name: "Lighting", value: 3.37, color: "#f6c85f" },
];

const zones: Zone[] = [
  {
    id: "north",
    name: "North work pods",
    short: "NORTH PODS",
    occupancy: "12 / 32",
    temp: 24.8,
    energy: 8.4,
    status: "watch",
    insight: "Only 38% occupied while the full zone receives conditioned air.",
    action: "Trim airflow 20% and hold 26°C during low occupancy.",
  },
  {
    id: "window",
    name: "Window collaboration zone",
    short: "WINDOW ZONE",
    occupancy: "6 / 18",
    temp: 26.7,
    energy: 5.9,
    status: "solar",
    insight: "Afternoon solar gain is adding heat faster than cooling removes it.",
    action: "Add solar film or automated blinds before increasing cooling.",
  },
  {
    id: "meeting",
    name: "Meeting room",
    short: "MEETING ROOM",
    occupancy: "0 / 13",
    temp: 23.9,
    energy: 4.1,
    status: "waste",
    insight: "The coldest monitored zone is unoccupied and shares a thermostat.",
    action: "Install a local sensor and motorised damper; reduce airflow when vacant.",
  },
  {
    id: "south",
    name: "South work pods",
    short: "SOUTH PODS",
    occupancy: "13 / 34",
    temp: 25.6,
    energy: 7.2,
    status: "efficient",
    insight: "Comfort is within target despite partial occupancy.",
    action: "Use this zone as the control benchmark for the pilot.",
  },
  {
    id: "support",
    name: "Support rooms",
    short: "SUPPORT",
    occupancy: "intermittent",
    temp: 26,
    energy: 1.8,
    status: "efficient",
    insight: "Low energy and stable temperature suggest little intervention is needed.",
    action: "Monitor only; avoid unnecessary retrofit cost.",
  },
];

const anomalies = [
  {
    icon: Clock3,
    severity: "CRITICAL",
    title: "Cooling begins 4.5 hours early",
    detail: "Sample FCU rises near 04:00 although office operations begin at 08:30.",
    impact: "≈ 5.4 kWh/day",
  },
  {
    icon: AirVent,
    severity: "HIGH",
    title: "Vacant meeting room overcooled",
    detail: "0 of 13 seats occupied at 23.9°C; shared control keeps airflow high.",
    impact: "≈ 2.0 kWh/day",
  },
  {
    icon: Monitor,
    severity: "MEDIUM",
    title: "Persistent plug baseload",
    detail: "Extra monitors and devices draw roughly 95 W even outside office hours.",
    impact: "≈ 1.1 kWh/day",
  },
];

function calculateForecast(occupancy: number, setpoint: number, damper: number, solar: number) {
  const base = 27.37;
  const ac = 18;
  const tempSaving = ac * Math.max(0, setpoint - 25) * 0.1;
  const occupancySaving = ac * Math.max(0, 1 - occupancy / 80) * 0.18;
  const damperSaving = ac * Math.max(0, 1 - damper / 100) * 0.08;
  const solarSaving = ac * (solar / 100) * 0.06;
  const daily = Math.min(base * 0.35, tempSaving + occupancySaving + damperSaving + solarSaving);
  const annualKwh = daily * 260 * 8;
  const annualCost = annualKwh * 0.3;
  const annualCarbon = annualKwh * 0.4 / 1000;
  const payback = 6800 / annualCost;
  return { daily, annualKwh, annualCost, annualCarbon, payback, pct: daily / base * 100 };
}

function PanelTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className="panel-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {note ? <span className="panel-note">{note}</span> : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone = "green" }: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  tone?: "green" | "blue" | "amber" | "rose";
}) {
  return (
    <article className={`metric metric-${tone}`}>
      <div className="metric-top"><span>{label}</span><Icon size={16} /></div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <small>{label}:00</small>
      {payload.map((item) => <div key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value.toFixed(2)} kW</b></div>)}
    </div>
  );
}

function DigitalTwin({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const active = zones.find((zone) => zone.id === selected) ?? zones[0];
  return (
    <div className="twin-layout">
      <div className="floor-shell">
        <div className="floor-head"><span>LEVEL 6 · LIVE MODEL</span><span className="scan"><i /> SCANNING</span></div>
        <div className="floor-grid">
          {zones.map((zone) => (
            <button
              key={zone.id}
              className={`floor-zone zone-${zone.id} zone-${zone.status} ${selected === zone.id ? "selected" : ""}`}
              onClick={() => onSelect(zone.id)}
              aria-label={`Inspect ${zone.name}`}
            >
              <span>{zone.short}</span>
              <strong>{zone.occupancy}</strong>
              <small>{zone.temp.toFixed(1)}°C · {zone.energy} kWh</small>
            </button>
          ))}
          <div className="corridor"><span>LIFT LOBBY</span><i /><i /><i /></div>
        </div>
        <div className="floor-legend">
          <span><i className="good" /> efficient</span>
          <span><i className="watch" /> right-size</span>
          <span><i className="hot" /> heat gain</span>
          <span><i className="waste" /> energy waste</span>
        </div>
      </div>
      <aside className="zone-detail">
        <div className="zone-detail-head"><div><p className="eyebrow">selected zone</p><h3>{active.name}</h3></div><span className={`status status-${active.status}`}>{active.status}</span></div>
        <div className="zone-reading"><div><span>Occupancy</span><strong>{active.occupancy}</strong></div><div><span>Temperature</span><strong>{active.temp.toFixed(1)}°C</strong></div><div><span>Daily energy</span><strong>{active.energy} kWh</strong></div></div>
        <div className="diagnosis"><BrainCircuit size={17} /><p><b>Diagnosis</b>{active.insight}</p></div>
        <div className="action-card"><Sparkles size={17} /><p><b>Next best action</b>{active.action}</p></div>
        <p className="model-note">Readings combine supplied sample data with team observations. Zone allocation is a pilot hypothesis to validate with Ecovolt history.</p>
      </aside>
    </div>
  );
}

export default function Home() {
  const [selectedZone, setSelectedZone] = useState("meeting");
  const [occupancy, setOccupancy] = useState(31);
  const [setpoint, setSetpoint] = useState(26);
  const [damper, setDamper] = useState(55);
  const [solar, setSolar] = useState(60);

  const forecast = useMemo(
    () => calculateForecast(occupancy, setpoint, damper, solar),
    [occupancy, setpoint, damper, solar],
  );

  useEffect(() => {
    type Tool = {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    };
    type ModelContext = { registerTool: (tool: Tool, options: { signal: AbortSignal }) => void | Promise<void> };
    const context = (document as unknown as { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = context.registerTool({
      name: "configure_coolsense_scenario",
      title: "Configure CoolSense scenario",
      description: "Set the visible occupancy, cooling setpoint, damper airflow and solar-control inputs, then return the modelled energy outcome.",
      inputSchema: {
        type: "object",
        properties: {
          occupancy: { type: "number", minimum: 0, maximum: 80 },
          setpoint: { type: "number", minimum: 25, maximum: 27 },
          damper: { type: "number", minimum: 20, maximum: 100 },
          solar: { type: "number", minimum: 0, maximum: 100 },
        },
        required: ["occupancy", "setpoint", "damper", "solar"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const value = input as Record<string, unknown>;
        const next = {
          occupancy: Number(value.occupancy),
          setpoint: Number(value.setpoint),
          damper: Number(value.damper),
          solar: Number(value.solar),
        };
        if (!Number.isFinite(next.occupancy) || next.occupancy < 0 || next.occupancy > 80 ||
          !Number.isFinite(next.setpoint) || next.setpoint < 25 || next.setpoint > 27 ||
          !Number.isFinite(next.damper) || next.damper < 20 || next.damper > 100 ||
          !Number.isFinite(next.solar) || next.solar < 0 || next.solar > 100) {
          throw new Error("Scenario values are outside the supported ranges.");
        }
        setOccupancy(next.occupancy);
        setSetpoint(next.setpoint);
        setDamper(next.damper);
        setSolar(next.solar);
        return calculateForecast(next.occupancy, next.setpoint, next.damper, next.solar);
      },
    }, { signal: lifecycle.signal });
    void Promise.resolve(register).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const printReport = () => window.print();

  return (
    <main>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-mark"><span><Waves size={19} /></span><div><strong>COOL<span>SENSE</span></strong><small>SUSS ENERGY OS</small></div></div>
          <nav aria-label="Dashboard sections">
            <a href="#command"><Gauge size={17} /><span>Command centre</span></a>
            <a href="#signals"><Activity size={17} /><span>Energy signals</span></a>
            <a href="#twin"><Building2 size={17} /><span>Digital twin</span></a>
            <a href="#simulator"><BrainCircuit size={17} /><span>Simulator</span></a>
            <a href="#business"><CircleDollarSign size={17} /><span>Business case</span></a>
          </nav>
          <div className="sidebar-foot">
            <div className="api-status"><span className="pulse-dot" /><div><b>Ecovolt-ready</b><small>Read-only integration</small></div></div>
            <p>Decision intelligence for the UOB–SUSS Planet Resilience Hackathon.</p>
          </div>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div><p className="eyebrow">LEVEL 6 · OFFICE PILOT</p><h1>Energy command centre</h1></div>
            <div className="top-actions">
              <div className="live-chip"><Radio size={14} /><span>MODEL ONLINE</span><small>sample data</small></div>
              <Button variant="outline" onClick={printReport} className="export-button"><Download />Export brief</Button>
            </div>
          </header>

          <Tabs defaultValue="overview" className="site-tabs">
            <TabsList variant="line" className="tab-list" aria-label="Dashboard views">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="forensics">Forensics</TabsTrigger>
              <TabsTrigger value="twin">Digital twin</TabsTrigger>
              <TabsTrigger value="simulator">Smart-zone lab</TabsTrigger>
              <TabsTrigger value="business">Business case</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="tab-content">
              <section id="command" className="metric-grid">
                <Metric icon={Zap} label="Daily monitored energy" value="27.4 kWh" detail="Derived from supplied sample profiles" />
                <Metric icon={AirVent} label="Cooling share" value="65.8%" detail="The largest controllable load" tone="blue" />
                <Metric icon={Users} label="Observed utilisation" value="39%" detail="31 of 80 seats occupied" tone="amber" />
                <Metric icon={AlertTriangle} label="Avoidable energy" value="9.4 kWh" detail="Modelled daily opportunity" tone="rose" />
              </section>

              <section id="signals" className="dashboard-grid">
                <article className="panel energy-panel">
                  <PanelTitle eyebrow="01 / load profile" title="The building cools before people arrive" note="SAMPLE WEEKDAY" />
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
                        <CartesianGrid stroke="#172631" vertical={false} strokeDasharray="3 5" />
                        <XAxis dataKey="time" stroke="#61707a" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis stroke="#61707a" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}k`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="ac" name="Air-con" stroke="#35f2a2" fill="#35f2a21f" strokeWidth={2.5} />
                        <Area type="monotone" dataKey="plugs" name="Plugs" stroke="#50b7ff" fill="#50b7ff16" strokeWidth={1.8} />
                        <Area type="monotone" dataKey="lights" name="Lighting" stroke="#f6c85f" fill="#f6c85f12" strokeWidth={1.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer"><div className="legend"><span><i className="ac" />Air-con</span><span><i className="plug" />Plug loads</span><span><i className="light" />Lighting</span></div><p><b>04:00</b> avoidable cooling begins</p></div>
                </article>

                <article className="panel energy-mix">
                  <PanelTitle eyebrow="02 / priority" title="Where to intervene first" />
                  <div className="mix-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={categoryData} dataKey="value" innerRadius={62} outerRadius={86} paddingAngle={4}>{categoryData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div className="mix-total"><strong>27.4</strong><span>kWh / day</span></div>
                  </div>
                  <div className="mix-list">{categoryData.map((item, index) => <div key={item.name}><i style={{ background: item.color }} /><span>{index + 1}. {item.name}</span><b>{Math.round(item.value / 27.37 * 100)}%</b></div>)}</div>
                  <div className="priority-callout"><AirVent size={18} /><p><b>Start with cooling.</b> It uses 5.3× more energy than lighting in the supplied profile.</p></div>
                </article>

                <article className="panel anomaly-panel">
                  <PanelTitle eyebrow="03 / anomaly queue" title="Three leaks. One pilot." note="RANKED BY IMPACT" />
                  <div className="anomaly-list">{anomalies.map(({ icon: Icon, severity, title, detail, impact }) => <div className="anomaly" key={title}><span className={`anomaly-icon severity-${severity.toLowerCase()}`}><Icon size={17} /></span><div><div className="anomaly-heading"><b>{title}</b><Badge variant="outline">{severity}</Badge></div><p>{detail}</p></div><strong>{impact}</strong></div>)}</div>
                </article>

                <article className="panel verdict-panel">
                  <p className="eyebrow">THE WINNING WEDGE</p>
                  <h2>Condition people,<br />not empty rooms.</h2>
                  <p>CoolSense overlays occupancy and zone temperature onto existing central air-conditioning. A low-cost damper and sensor pilot gives each shared zone the ability to reduce—not shut off—airflow while maintaining 25–27°C comfort.</p>
                  <div className="verdict-badges"><span><ShieldCheck size={15} />comfortable</span><span><CircleDollarSign size={15} />commercial</span><span><Building2 size={15} />scalable</span></div>
                </article>
              </section>
            </TabsContent>

            <TabsContent value="forensics" className="tab-content">
              <section className="forensics-grid">
                <article className="panel forensic-main">
                  <PanelTitle eyebrow="Evidence chain" title="From raw signal to root cause" note="SUPPLIED DATA + OBSERVATION" />
                  <div className="evidence-chain">
                    <div><span>01</span><b>Signal</b><p>FCU averages 746 W and peaks near 1.30 kW.</p></div>
                    <div><span>02</span><b>Mismatch</b><p>Cooling begins around 04:00; occupancy begins around 08:30.</p></div>
                    <div><span>03</span><b>Observation</b><p>Office is only 30–40% full; empty meeting room feels strongly cooled.</p></div>
                    <div><span>04</span><b>Root cause</b><p>Central schedule and shared thermostat cannot see zone-level demand.</p></div>
                    <div><span>05</span><b>Intervention</b><p>Add occupancy sensing, zone temperature and a modulating damper.</p></div>
                  </div>
                </article>
                <article className="panel quantified">
                  <PanelTitle eyebrow="Measured baseline" title="Supplied sample readings" />
                  <div className="readings-table"><div><span>Component</span><span>Peak</span><span>Average</span></div><div><b>Air-con FCU</b><span>1,296 W</span><span>746 W</span></div><div><b>Plug loads</b><span>400 W</span><span>258 W</span></div><div><b>Lighting circuit</b><span>293 W</span><span>139 W</span></div></div>
                  <p className="model-note">Daily energy values are reconstructed from the provided weekday profile and should be replaced with Ecovolt history during validation.</p>
                </article>
                <article className="panel comfort-panel">
                  <PanelTitle eyebrow="Comfort guardrail" title="Savings without complaints" />
                  <div className="comfort-scale"><span>24°C</span><div><i style={{ left: "33%" }} /><em>25–27°C comfort band</em></div><span>28°C</span></div>
                  <ul><li><ThermometerSun size={16} />Target 25–27°C</li><li><Waves size={16} />Air speed ≤ 0.8 m/s</li><li><Gauge size={16} />PMV between −0.5 and +0.5</li></ul>
                </article>
                <article className="panel counterfactual">
                  <PanelTitle eyebrow="Counterfactual" title="Why not just switch it off?" />
                  <p>Central air-conditioning serves connected rooms. Hard shut-off risks poor ventilation and comfort. CoolSense uses dampers to trim airflow locally, while the existing system and facilities team remain in control.</p>
                  <div><ShieldCheck size={18} /><span><b>Fail-safe design</b> Minimum airflow, manual override and comfort alerts.</span></div>
                </article>
              </section>
            </TabsContent>

            <TabsContent value="twin" className="tab-content">
              <section id="twin" className="panel twin-panel">
                <PanelTitle eyebrow="Interactive floor model" title="See comfort and waste in the same view" note="SELECT A ZONE" />
                <DigitalTwin selected={selectedZone} onSelect={setSelectedZone} />
              </section>
            </TabsContent>

            <TabsContent value="simulator" className="tab-content">
              <section id="simulator" className="simulator-grid">
                <article className="panel controls-panel">
                  <PanelTitle eyebrow="Smart-zone lab" title="Design the pilot live" note="INTERACTIVE" />
                  <div className="control-list">
                    <label><div><span><Users size={16} />Occupants</span><b>{occupancy} / 80</b></div><Slider min={0} max={80} step={1} value={[occupancy]} onValueChange={(v) => setOccupancy(v[0])} /></label>
                    <label><div><span><ThermometerSun size={16} />Cooling setpoint</span><b>{setpoint.toFixed(1)}°C</b></div><Slider min={25} max={27} step={0.5} value={[setpoint]} onValueChange={(v) => setSetpoint(v[0])} /></label>
                    <label><div><span><AirVent size={16} />Damper airflow</span><b>{damper}%</b></div><Slider min={20} max={100} step={5} value={[damper]} onValueChange={(v) => setDamper(v[0])} /></label>
                    <label><div><span><Sun size={16} />Solar heat blocked</span><b>{solar}%</b></div><Slider min={0} max={100} step={5} value={[solar]} onValueChange={(v) => setSolar(v[0])} /></label>
                  </div>
                  <div className="logic-card"><Cpu size={18} /><p><b>Control logic</b> If a zone is vacant, reduce airflow to the safe minimum. If occupied, modulate within comfort bounds. If window heat rises, block radiation before adding cooling.</p></div>
                </article>

                <article className="panel forecast-panel">
                  <p className="eyebrow">MODELLED PILOT OUTCOME</p>
                  <div className="forecast-hero"><span>up to</span><strong>{forecast.pct.toFixed(0)}%</strong><p>daily energy reduction</p></div>
                  <div className="forecast-stats"><div><span>Daily</span><b>{forecast.daily.toFixed(1)} kWh</b></div><div><span>Annual · 8 zones</span><b>{Math.round(forecast.annualKwh).toLocaleString()} kWh</b></div><div><span>Cost avoided</span><b>S${Math.round(forecast.annualCost).toLocaleString()}</b></div><div><span>Carbon avoided</span><b>{forecast.annualCarbon.toFixed(1)} tCO₂e</b></div></div>
                  <div className="forecast-bar"><div style={{ width: `${Math.min(forecast.pct * 2.4, 100)}%` }} /><span>0%</span><span>target 20%</span><span>35% cap</span></div>
                  <p className="model-note">Planning model: 260 weekdays, 8 comparable zones, S$0.30/kWh, 0.40 kgCO₂e/kWh. Actual results require a metered pilot.</p>
                </article>
              </section>
            </TabsContent>

            <TabsContent value="business" className="tab-content">
              <section id="business" className="business-grid">
                <article className="panel business-hero">
                  <p className="eyebrow">COMMERCIAL CASE</p>
                  <h2>A small retrofit with a measurable payback.</h2>
                  <div className="big-payback"><span>Estimated payback</span><strong>{forecast.payback.toFixed(1)} years</strong><small>on S$6,800 pilot capex</small></div>
                  <p>The pilot reuses the central system. It adds only the missing intelligence layer: occupancy sensors, zone temperature sensors, motorised dampers and the CoolSense dashboard.</p>
                </article>
                <article className="panel capex-card">
                  <PanelTitle eyebrow="Pilot bill of materials" title="One shared FCU · two zones" />
                  <div className="capex-list"><div><span>2× occupancy + temperature sensors</span><b>S$900</b></div><div><span>2× motorised dampers + actuators</span><b>S$2,400</b></div><div><span>Gateway, integration, commissioning</span><b>S$2,000</b></div><div><span>Measurement & validation</span><b>S$1,500</b></div><div className="total"><span>Total pilot capex</span><b>S$6,800</b></div></div>
                </article>
                <article className="panel roadmap-card">
                  <PanelTitle eyebrow="90-day deployment" title="Prove, tune, scale" />
                  <div className="roadmap"><div><span>01</span><b>Baseline</b><small>Days 1–14</small><p>Pull Ecovolt history, map FCUs, validate occupancy and comfort.</p></div><div><span>02</span><b>Pilot</b><small>Days 15–45</small><p>Instrument meeting room + work zone; deploy damper controls.</p></div><div><span>03</span><b>Verify</b><small>Days 46–75</small><p>A/B compare weather-normalised energy and comfort.</p></div><div><span>04</span><b>Scale</b><small>Days 76–90</small><p>Package playbook for SUSS and similar Singapore campuses.</p></div></div>
                </article>
                <article className="panel moat-card">
                  <PanelTitle eyebrow="Why this stands out" title="Not another awareness app" />
                  <div className="moat-list"><div><BarChart3 size={18} /><p><b>Evidence-led</b>Starts with the largest measured load.</p></div><div><BrainCircuit size={18} /><p><b>Closed-loop</b>Turns signals into an operational action.</p></div><div><ShieldCheck size={18} /><p><b>Comfort-safe</b>Keeps explicit thermal guardrails.</p></div><div><Building2 size={18} /><p><b>Repeatable</b>Scales by FCU zone, not full-building replacement.</p></div></div>
                </article>
              </section>
            </TabsContent>
          </Tabs>

          <footer><div><Leaf size={15} /><b>CoolSense SUSS</b><span>Planet Resilience · 2026</span></div><p>Built from supplied hackathon data. Savings, costs and zone splits are transparent planning assumptions pending a metered pilot.</p></footer>
        </section>
      </div>
    </main>
  );
}
