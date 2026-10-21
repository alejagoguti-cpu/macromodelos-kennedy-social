import { cloneElement, type ReactElement } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import {
  ArrowLeft, ArrowRight, Building2, Droplets, Layers, Leaf,
  MousePointerClick, Network, ShieldCheck, AlertTriangle, Activity,
  Store, Truck, Users, Waves, Sliders
} from 'lucide-react';
import type { LngLat } from './content';
import {
  ACTIVE_BY_BEAT, BOUNDS, COLORS, GEO, STAGES, STAGE_MAP, N,
  SPINE, STEP_LABELS, type GeoId, type SocialStageId, BEHAVIOR_STATES
} from './content';
import { CONNS, STAGE_RELATIONS, type Conn } from './conns';
import { MapView, type Pad } from './mapview';
import { Kennedy3D } from './kennedy3d';
import { SocialSimHud } from './SocialSimHud';
import {
  createInitialAgents, stepSimulation, PRESETS, STATE_INFO,
  type PolicyParams, type SimStats, type SocialAgent
} from './social_sim';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.ticker.lagSmoothing(0);

const STAGE_ICONS: Record<SocialStageId, ReactElement> = {
  humana: <Users />,
  normativa: <Building2 />,
  cotidiana: <Store />,
  comunitaria: <Leaf />,
  brecha: <AlertTriangle />,
  policentrica: <ShieldCheck />,
  conductas: <Activity />,
  dinamica: <Sliders />,
  red: <Network />,
};

const GEO_ICON: Record<GeoId, ReactElement> = {
  alcaldia: <Building2 />,
  planeacion: <Layers />,
  idu: <Truck />,
  jac: <Users />,
  colectivos: <Leaf />,
  patio: <Store />,
  corabastos: <Store />,
  vaca: <Droplets />,
  burro: <Droplets />,
  techo: <Droplets />,
  fucha: <Waves />,
  tintal: <Building2 />,
};

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Disposición orbital para la secuencia final (Red propia de gobernanza)
function orbit(W: number, H: number, m: boolean, shift = false) {
  const sh = shift && !m;
  const mx = shift && m;
  const u = mx ? Math.min(W * 0.45, (H * 0.56 - 96) / 2) : m ? Math.min(W * 0.45, (H - 250) / 2) : sh ? Math.min(W * 0.255, (H - 170) / 2) : Math.min(W * 0.46, (H - 150) / 2);
  const cx = sh ? W * 0.27 : W / 2, cy = mx ? 86 + u : m ? H * 0.5 : H / 2 + 6;
  const at = (R: number, deg: number) => ({ x: cx + R * Math.cos((deg * Math.PI) / 180), y: cy + R * Math.sin((deg * Math.PI) / 180) });
  const Rb = u * 0.98, Rl = u * 0.82, Re = u * 0.64, Rt = u * (m ? 0.46 : 0.4);

  const pos: Record<SocialStageId, { x: number; y: number }> = {
    humana: { x: cx, y: cy },
    normativa: at(Re, -90),
    cotidiana: at(Rt, -30),
    comunitaria: at(Rt, -150),
    brecha: at(Rt, 90),
    policentrica: at(Rl, -45),
    conductas: at(Rl, 135),
    dinamica: at(Rb, -135),
    red: { x: cx, y: cy },
  };
  return { u, cx, cy, Rb, Rl, Re, Rt, pos };
}

interface St { x: number; y: number; o: number; s: number; w: number; compact: boolean; d: number; orb?: boolean }

function layout(b: number, W: number, H: number, m: boolean, shift = false): Record<string, St> {
  const L: Record<string, St> = {};
  const cw = m ? Math.min(W * 0.9, 380) : 340;
  const sx = m ? W * 0.5 : W * 0.2;
  const gap = m ? 138 : 138;
  const y0 = m ? 104 : 124;
  const act = ACTIVE_BY_BEAT[b];
  const target = H * (m ? (H < 720 ? 0.32 : 0.36) : 0.44);
  const cam = b >= 9 ? 0 : Math.min(0, target - (y0 + Math.max(act, 0) * gap));

  SPINE.forEach((id, i) => {
    const stage = STAGE_MAP[id];
    const vis = b >= stage.appear && !(b === 0);
    if (b >= 9) {
      const p = orbit(W, H, m, shift).pos[id];
      L[id] = { x: p.x, y: p.y + (m ? 14 : 22), o: 1, s: 1, w: m ? 96 : 140, compact: true, orb: true, d: 0.15 + i * 0.08 };
    } else {
      const ya = Math.max(y0 + 50, target);
      const y = i === act ? ya : i < act ? ya - 128 - (act - i - 1) * 98 : ya + 140;
      const o = !vis ? 0 : i === act ? 1 : Math.max(0.25, 0.65 - (act - i) * 0.12);
      const fade = y < (m ? 92 : 118) ? 0 : o;
      L[id] = { x: sx, y: vis ? y : y + 24, o: id === 'humana' && b === 0 ? 0 : fade, s: vis ? 1 : 0.94, w: i === act ? cw : cw * 0.82, compact: i !== act, d: i === act ? 0.45 : 0 };
    }
  });

  L.hero = b === 0 ? { x: W / 2, y: H * 0.46, o: 1, s: 1, w: 0, compact: false, d: 0 } : { x: sx, y: y0 + cam, o: 0, s: 0.55, w: 0, compact: false, d: 0 };
  return L;
}

function camera(b: number, W: number, H: number, m: boolean, shift = false): { box: [number, number, number, number]; pad: Pad; az: number; el: number; pts?: LngLat[] } {
  const pad: Pad = m ? { top: H * 0.5, right: 14, bottom: 80, left: 14 } : { top: 80, right: 40, bottom: 90, left: W * 0.4 };
  if (b === 2) return { box: BOUNDS.institucional, pad, az: -0.15, el: 0.9, pts: ['planeacion', 'alcaldia', 'idu'].map((g) => GEO[g as GeoId].ll) };
  if (b === 3) return { box: BOUNDS.bordes, pad, az: 0.22, el: 0.85, pts: ['patio', 'corabastos', 'vaca', 'burro'].map((g) => GEO[g as GeoId].ll) };
  if (b === 4) return { box: BOUNDS.mediacion, pad, az: -0.2, el: 0.86, pts: ['jac', 'colectivos', 'patio', 'vaca'].map((g) => GEO[g as GeoId].ll) };
  if (b === 5) return { box: BOUNDS.conflictos, pad, az: 0.35, el: 0.9, pts: ['alcaldia', 'patio', 'vaca', 'corabastos', 'burro'].map((g) => GEO[g as GeoId].ll) };
  if (b === 6) return { box: BOUNDS.conflictos, pad, az: 0.15, el: 0.88, pts: ['alcaldia', 'jac', 'colectivos', 'vaca', 'burro'].map((g) => GEO[g as GeoId].ll) };
  if (b === 7 || b === 8) return { box: BOUNDS.bordes, pad, az: -0.1, el: 0.82 };
  if (b === 9) { pad.left = shift && !m ? W * 0.5 : 0; pad.right = 0; pad.top = m ? H * 0.2 : shift ? 300 : 70; return { box: BOUNDS.kennedy, pad, az: -0.1, el: 0.78 }; }
  return { box: BOUNDS.kennedy, pad, az: 0, el: 0.95 };
}

const rect = (e: Element | null | undefined) => (e ? e.getBoundingClientRect() : null);
interface Pt { x: number; y: number; dx: number; dy: number; r?: number }

export default function App() {
  const [beat, setBeat] = useState(0);
  const [explore, setExplore] = useState(false);
  const [sel, setSel] = useState<SocialStageId | null>(null);
  const [size, setSize] = useState({ W: window.innerWidth, H: window.innerHeight });
  const [mapOk, setMapOk] = useState(false);
  const [view3d, setView3d] = useState(true);
  const [k3p, setK3p] = useState(0);
  const { W, H } = size;
  const m = W < 760;

  // Estado de simulación ABM integrado
  const [agents, setAgents] = useState<SocialAgent[]>(() => createInitialAgents(70));
  const [policy, setPolicy] = useState<PolicyParams>(PRESETS.polycentric.policy);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState<SimStats>({
    tick: 0,
    s1Count: 12,
    s2Count: 16,
    s3Count: 18,
    s4Count: 24,
    avgTrust: 0.58,
    avgVulnerability: 0.65,
    environmentalHealth: 72,
    activeLoop: 'polycentric',
  });
  const [hoveredAgent, setHoveredAgent] = useState<SocialAgent | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const cards = useRef<Record<string, HTMLElement | null>>({});
  const lanes = useRef<Record<string, HTMLElement | null>>({});
  const mv = useRef<MapView | null>(null);
  const k3 = useRef<Kennedy3D | null>(null);
  const k3El = useRef<HTMLDivElement>(null);
  const v3 = useRef(true);
  const beatRef = useRef(0);
  const lock = useRef(false);
  const inited = useRef(false);
  const shape = useRef<Record<string, string>>({});

  // Loop de simulación activo cuando beat === 8
  useEffect(() => {
    if (!running || beat !== 8) return;
    const timer = setInterval(() => {
      setAgents((prev) => {
        const { nextAgents, stats: nextStats } = stepSimulation(prev, policy, tick);
        setStats(nextStats);
        setTick((t) => t + 1);
        return nextAgents;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [running, beat, policy, tick]);

  const handleResetSim = () => {
    setAgents(createInitialAgents(70));
    setTick(0);
  };

  const handleSelectPreset = (key: keyof typeof PRESETS) => {
    setPolicy(PRESETS[key].policy);
  };

  // Navegación
  const go = useCallback((n: number) => {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === beatRef.current) return;
    beatRef.current = n;
    setBeat(n);
    if (n < 9) { setExplore(false); setSel(null); }
    const target = n * window.innerHeight;
    lock.current = true;
    gsap.to(window, { scrollTo: target, duration: reduced() ? 0 : 0.9, ease: 'power2.inOut', onComplete: () => { lock.current = false; } });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(beatRef.current + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(beatRef.current - 1); }
      if (e.key === 'Escape') { setSel(null); setHoveredAgent(null); }
    };
    const onResize = () => setSize({ W: window.innerWidth, H: window.innerHeight });
    addEventListener('keydown', onKey);
    addEventListener('resize', onResize);
    return () => { removeEventListener('keydown', onKey); removeEventListener('resize', onResize); };
  }, [go]);

  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: spacerRef.current, start: 'top top', end: 'bottom bottom',
      snap: { snapTo: 1 / (N - 1), duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' },
      onUpdate: (self) => {
        if (lock.current) return;
        const n = Math.round(self.progress * (N - 1));
        if (n !== beatRef.current) { beatRef.current = n; setBeat(n); if (n < 9) { setExplore(false); setSel(null); } }
      },
    });
    return () => st.kill();
  }, []);

  // Mapa
  useEffect(() => {
    const pad = camera(0, W, H, m).pad;
    const v = new MapView(mapEl.current!, pad);
    mv.current = v;
    v.ready.then(() => { setMapOk(true); });
    return () => { v.map.remove(); mv.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const k = new Kennedy3D(k3El.current!);
    k3.current = k;
    return () => { k.dispose(); k3.current = null; };
  }, []);
  useEffect(() => { if (beat >= 1 && k3.current) k3.current.load(setK3p); }, [beat]);
  useEffect(() => { v3.current = view3d; }, [view3d]);
  useEffect(() => { if (k3.current) { k3.current.active = beat >= 2 && view3d; k3.current.orbit = beat === 9; } }, [beat, view3d]);
  useEffect(() => { k3.current?.resize(); }, [W, H]);
  useEffect(() => { if (k3.current) k3.current.state(beat, explore ? sel : null); }, [beat, explore, sel]);

  useEffect(() => {
    const c = camera(beat, W, H, m, explore);
    if (k3.current) k3.current.fit(c.box, c.pad, reduced() ? 0 : beat === beatRef.current ? 1.9 : 0, c.az, c.el, c.pts);
    if (!mapOk || !mv.current) return;
    mv.current.fit(c.box, c.pad, reduced() ? 0 : beat === beatRef.current ? 1800 : 0);
    mv.current.map.resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, mapOk, m, W, H, explore]);

  useEffect(() => {
    if (mapOk && mv.current) mv.current.state(beat, explore ? sel : null);
  }, [beat, mapOk, explore, sel]);

  useLayoutEffect(() => {
    gsap.to(mapEl.current, { opacity: beat >= 2 && !view3d ? 1 : 0, duration: reduced() ? 0 : 1.4, ease: 'power2.out' });
    gsap.to(k3El.current, { opacity: beat >= 2 && view3d ? (beat === 9 ? 0.7 : 1) : 0, duration: reduced() ? 0 : 1.4, ease: 'power2.out' });
    gsap.to('#wash', { opacity: beat >= 2 && beat <= 8 ? 1 : 0, duration: 1 });
  }, [beat, view3d]);

  // Tarjetas
  useLayoutEffect(() => {
    gsap.set(Object.values(cards.current).filter((e) => e && !e.classList.contains('herosub') && e.tagName !== 'P'), { xPercent: -50, yPercent: -50 });
    gsap.set(cards.current.heroSub, { opacity: 0, y: 14 });
  }, []);
  const lay = useMemo(() => layout(beat, W, H, m, explore && beat === 9), [beat, W, H, m, explore]);
  useLayoutEffect(() => {
    const first = !inited.current;
    inited.current = true;
    const dur = reduced() || first ? 0 : 0.95;
    for (const k of Object.keys(lay)) {
      const el = k === 'hero' ? cards.current.hero : cards.current[k];
      if (!el) continue;
      const s = lay[k];
      const dim = explore && sel ? (isRelated(sel, k as SocialStageId) ? 1 : 0.18) : 1;
      gsap.to(el, {
        x: s.x, y: s.y, opacity: s.o * dim, scale: s.s, width: s.w || undefined, duration: dur, delay: reduced() || first ? 0 : s.d, ease: 'power3.inOut', overwrite: 'auto',
        onStart: () => { if (k !== 'hero') { el.classList.toggle('compact', s.compact); el.classList.toggle('orb', !!s.orb); shape.current[k] = (s.compact ? ' compact' : '') + (s.orb ? ' orb' : ''); } },
      });
      if (k !== 'hero') el.style.pointerEvents = s.o > 0.2 && (beat < 9 || explore) ? 'auto' : 'none';
    }
    if (beat === 0) gsap.to(cards.current.heroSub, { opacity: 1, y: 0, duration: 1, delay: 0.5, overwrite: 'auto' });
    else gsap.to(cards.current.heroSub, { opacity: 0, duration: 0.4, overwrite: 'auto' });
  }, [lay, explore, sel, beat]);

  // Conexiones
  const conns = useMemo(() => CONNS.filter((c) => beat >= c.min && beat <= c.max && (!c.exp || (explore && sel && c.stages.includes(sel)))), [beat, explore, sel]);
  const related = (c: Conn) => !explore || !sel || sel === 'humana' || sel === 'red' || c.stages.includes(sel);
  const geoColor = useMemo(() => {
    const g: Record<string, string> = {};
    const src = beat === 9 && !explore ? [] : beat === 9 && !sel ? CONNS.filter((c) => c.min === 9 && c.max === 9 && (c.a.startsWith('o:') || c.b.startsWith('g:'))) : conns.filter(related);
    for (const c of src) for (const a of [c.a, c.b]) if (a.startsWith('g:')) g[a.slice(2)] = g[a.slice(2)] || c.color;
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conns, explore, sel]);

  // Bucle de dibujo SVG
  useEffect(() => {
    const anchor = (s: string): Pt | null => {
      const [k, a, b] = s.split(':');
      if (k === 'o') {
        const t = cards.current[a]?.querySelector('.tile');
        const r = rect(t);
        return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, dx: 0, dy: 0, r: r.width / 2 + 3 } : null;
      }
      if (k === 'c' || k === 'f') {
        const r = rect(cards.current[a]);
        if (!r) return null;
        if (b === 'b') return { x: r.left + r.width / 2, y: r.bottom, dx: 0, dy: 1 };
        if (b === 't') return { x: r.left + r.width / 2, y: r.top, dx: 0, dy: -1 };
        if (b === 'l') return { x: r.left, y: r.top + r.height / 2, dx: -1, dy: 0 };
        return { x: r.right, y: r.top + r.height / 2, dx: 1, dy: 0 };
      }
      if (k === 'g') {
        if (v3.current) {
          const q = k3.current?.project(GEO[a as GeoId].ll);
          return q ? { x: q.x, y: q.y, dx: 0, dy: 0 } : null;
        }
        const v = mv.current;
        if (!v || !v.map.loaded()) return null;
        const p = v.project(GEO[a as GeoId].ll);
        return { x: p.x, y: p.y, dx: 0, dy: 0 };
      }
      return null;
    };

    const tick = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const mids: Record<string, { x: number; y: number }> = {};
      svg.querySelectorAll<SVGGElement>('g[data-cn]').forEach((g) => {
        const aStr = g.dataset.a!, bStr = g.dataset.b!;
        const A = anchor(aStr);
        const B = anchor(bStr);
        if (!A || !B) return;
        const dx = B.x - A.x, dy = B.y - A.y;
        const d = Math.hypot(dx, dy) || 1;
        const ra = A.r || 0, rb = B.r || 0;
        const startX = A.x + (dx / d) * ra, startY = A.y + (dy / d) * ra;
        const endX = B.x - (dx / d) * rb, endY = B.y - (dy / d) * rb;

        const p = g.querySelectorAll<SVGPathElement>('path[data-p]');
        const pathStr = `M${startX} ${startY} L${endX} ${endY}`;
        p.forEach((el) => el.setAttribute('d', pathStr));
        mids[g.dataset.cn!] = { x: (startX + endX) / 2, y: (startY + endY) / 2 };
      });

      svg.querySelectorAll<SVGGElement>('g[data-g]').forEach((g) => {
        const P = anchor('g:' + g.dataset.g);
        if (P) g.setAttribute('transform', `translate(${P.x} ${P.y})`);
      });
      svg.querySelectorAll<SVGGElement>('g[data-gl]').forEach((g) => {
        const m = mids[g.dataset.gl!];
        if (m) g.setAttribute('transform', `translate(${m.x} ${m.y})`);
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [mapOk]);

  const ripple = (e: React.MouseEvent, color: string) => {
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;--c:' + color;
    stageRef.current?.appendChild(r);
    setTimeout(() => r.remove(), 1000);
  };

  const onCard = (e: React.MouseEvent, id: SocialStageId) => {
    e.stopPropagation();
    ripple(e, STAGE_MAP[id].color);
    if (beat >= 9) { if (explore) setSel(sel === id ? null : id); return; }
    const act = ACTIVE_BY_BEAT[beat];
    if (SPINE[act] === id) go(beat + 1);
  };

  const orb = useMemo(() => orbit(W, H, m, explore && beat === 9), [W, H, m, explore, beat]);
  const selStage = sel ? STAGE_MAP[sel] : null;

  return (
    <>
      <div ref={spacerRef} style={{ height: N * 100 + 'vh' }} aria-hidden />
      <div id="stage" ref={stageRef} onClick={() => { if (explore) setSel(null); }}>
        <div id="map" ref={mapEl} style={{ opacity: 0 }} />
        <div id="k3d" ref={k3El} style={{ opacity: 0 }} />
        <div id="wash" style={{ opacity: 0 }} />

        {/* Conexiones SVG y nodos territoriales */}
        <svg id="links" ref={svgRef} width={W} height={H}>
          <NetRings o={orb} on={beat === 9} m={m} />

          {/* Agentes territoriales proyectados directamente sobre el mapa durante el paso 8 */}
          {beat === 8 && (
            <g className="spatial-agents">
              {agents.map((ag) => {
                const pt = v3.current ? k3.current?.project([ag.lon, ag.lat]) : mv.current?.project([ag.lon, ag.lat]);
                if (!pt) return null;
                const col = STATE_INFO[ag.state].color;
                return (
                  <g
                    key={ag.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="agent-dot-group"
                    onMouseEnter={() => setHoveredAgent(ag)}
                    onClick={(ev) => { ev.stopPropagation(); setHoveredAgent(ag); }}
                  >
                    <circle r={7} fill={col} opacity={0.22} className="agent-halo" />
                    <circle r={3.6} fill={col} stroke="#000" strokeWidth={1} />
                  </g>
                );
              })}
            </g>
          )}

          {CONNS.map((c) => {
            const on = conns.includes(c) && related(c);
            return (
              <g
                key={c.id} data-cn={c.id} data-a={c.a} data-b={c.b}
                className={'cn' + (on ? ' on' : '') + (c.dashed ? ' dsh' : '') + (beat === 9 && explore && sel && !related(c) ? ' dimS' : '')}
                style={{ ['--c' as string]: c.color, ['--dl' as string]: (on ? c.delay || 0 : 0) + 's' }}
              >
                {c.title && <title>{c.title}</title>}
                <path data-p className="base" pathLength={1} />
                <path data-p className="flow" pathLength={1} />
                <path data-p className="trav" pathLength={1} />
                {c.arrow && <path className="arrow" d="M-9 -5 L3 0 L-9 5 Z" />}
              </g>
            );
          })}

          {(Object.keys(GEO) as GeoId[]).map((g) => (
            <g key={g} data-g={g} className={'gp' + (geoColor[g] ? ' on' : '')} style={{ ['--c' as string]: geoColor[g] || '#fff' }}>
              <circle className="gr" r="14" />
              <circle className="gd" r="14" />
              <g style={{ color: 'var(--c)' }}>{cloneElement(GEO_ICON[g], { x: -8, y: -8, size: 16, strokeWidth: 2 } as object)}</g>
              <text x="0" y="30" className="gl">{GEO[g].label}</text>
            </g>
          ))}
        </svg>

        {/* Tooltip arquitectónico flotante para agente seleccionado */}
        {hoveredAgent && beat === 8 && (
          <div
            className="agent-spatial-tooltip"
            style={{
              left: Math.min(W - 260, Math.max(20, (v3.current ? k3.current?.project([hoveredAgent.lon, hoveredAgent.lat])?.x || 200 : mv.current?.project([hoveredAgent.lon, hoveredAgent.lat])?.x || 200) + 12)),
              top: Math.max(80, (v3.current ? k3.current?.project([hoveredAgent.lon, hoveredAgent.lat])?.y || 200 : mv.current?.project([hoveredAgent.lon, hoveredAgent.lat])?.y || 200) - 40),
            }}
          >
            <div className="ast-header">
              <span className="ast-state" style={{ background: STATE_INFO[hoveredAgent.state].color }}>
                {hoveredAgent.state}
              </span>
              <b>{hoveredAgent.roleLabel}</b>
            </div>
            <div className="ast-body">
              <p>Sector: <span>{hoveredAgent.sectorLabel}</span></p>
              <p>Confianza institucional: <span>{Math.round(hoveredAgent.trust * 100)}%</span></p>
              <p>Vulnerabilidad material: <span>{Math.round(hoveredAgent.vulnerability * 100)}%</span></p>
              <p className="ast-desc">{STATE_INFO[hoveredAgent.state].desc}</p>
            </div>
          </div>
        )}

        {/* Hero inicial: Macromodelo Social */}
        <div ref={(e) => { cards.current.hero = e; }} className="abs hero" onClick={() => beat === 0 && go(1)} style={{ cursor: beat === 0 ? 'pointer' : 'default', pointerEvents: beat === 0 ? 'auto' : 'none' }}>
          <div className="node d0 on" style={{ ['--c' as string]: COLORS.cream, ['--ink' as string]: '#0a0a0a' }}>
            <div className="tile"><Users /></div>
            <div className="txt"><div className="id">MACROMODELO SOCIAL</div><div className="lb">POLÍTICA HUMANA</div></div>
          </div>
        </div>
        <p ref={(e) => { cards.current.heroSub = e; }} className="herosub" style={{ top: H * 0.46 + (m ? 112 : 128) }}>
          El territorio como red de agencia distribuida: de quiénes toman decisiones y quiénes las ejecutan.
        </p>
        <div id="hint" className={beat === 0 ? '' : 'hide'}><MousePointerClick />{m ? 'Toca para explorar la red social' : 'Haz clic para explorar la red social'}</div>

        {/* Tarjetas arquitectónicas de las etapas del Macromodelo Social */}
        {STAGES.map((stg) => (
          <div key={stg.id} ref={(e) => { cards.current[stg.id] = e; }} data-id={stg.id}
            className={'abs node d1 on sm-' + stg.id + (explore && sel === stg.id ? ' sel' : '') + (shape.current[stg.id] || '')}
            style={{ ['--c' as string]: stg.color, ['--ink' as string]: stg.ink, opacity: 0, cursor: 'pointer' }}
            onClick={(e) => onCard(e, stg.id)}>
            <div className="wm">{STAGE_ICONS[stg.id]}</div>
            <div className="tile">{STAGE_ICONS[stg.id]}</div>
            <div className="txt">
              <div className="id">COMPONENTE {stg.n}</div>
              <div className="lb">{stg.title}</div>
              <div className="lbs">{stg.short}</div>
              <p className="dsc">{stg.text}</p>
              {stg.id === 'brecha' && (
                <div className="chain" aria-label="bucle destructivo">
                  {['norma vertical', 'falta incentivos', 'evasión', 'deterioro de humedal', 'mayor sanción'].map((t, i) => (
                    <span key={t} style={{ animationDelay: i * 0.8 + 's', borderColor: 'rgba(248, 113, 113, 0.4)' }}>{t}</span>
                  ))}
                </div>
              )}
              {stg.id === 'policentrica' && (
                <div className="chain" aria-label="bucle policéntrico">
                  {['decisión de proximidad', 'incentivos de custodia', 'amortiguación barrial', 'recuperación'].map((t, i) => (
                    <span key={t} style={{ animationDelay: i * 0.8 + 's', borderColor: 'rgba(52, 211, 153, 0.4)' }}>{t}</span>
                  ))}
                </div>
              )}
              {stg.id === 'conductas' && (
                <div className="conducts-mini-grid">
                  {BEHAVIOR_STATES.map((bs) => (
                    <div key={bs.id} className="cmg-item" style={{ borderLeftColor: bs.color }}>
                      <b>{bs.id}</b>
                      <span>{bs.label.split('·')[1]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Panel arquitectónico integrado para la simulación en paso 8 (sin modal invasivo) */}
        {beat === 8 && (
          <div className="sim-hud-container">
            <SocialSimHud
              stats={stats}
              policy={policy}
              running={running}
              onToggleRun={() => setRunning(!running)}
              onReset={handleResetSim}
              onSelectPreset={handleSelectPreset}
              onPolicyChange={setPolicy}
              agentCount={agents.length}
            />
          </div>
        )}

        {/* Modo explorar (secuencia final 9) */}
        {beat === 9 && explore && (
          <div id="panel" className={sel ? 'on' : ''} style={{ ['--c' as string]: selStage?.color || '#fff', ...(m ? { top: Math.round(orb.cy + orb.Rl + 36), bottom: 'auto', maxHeight: Math.round(H - (orb.cy + orb.Rl + 36) - 74) } : {}) }}>
            {selStage ? (
              <>
                <div className="kick">{selStage.role}</div>
                <h3>{selStage.title}</h3>
                <p>{selStage.text}</p>
                <div className="kick" style={{ marginTop: 12 }}>Relaciones de gobernanza</div>
                <ul>
                  {STAGE_RELATIONS[selStage.id].rel.map(([id, t]) => (
                    <li key={id} onClick={(e) => { e.stopPropagation(); setSel(id); }}>
                      <i style={{ background: STAGE_MAP[id].color }} />
                      <b>{STAGE_MAP[id].short}</b> · {t}
                    </li>
                  ))}
                </ul>
                <div className="kick" style={{ marginTop: 12 }}>Anclajes en Kennedy</div>
                <div className="geos">{STAGE_RELATIONS[selStage.id].geo.map((g) => (<span key={g}>{GEO[g]?.label || g}</span>))}</div>
              </>
            ) : (
              <div className="kick">Selecciona un componente para auditar sus relaciones de gobernanza</div>
            )}
          </div>
        )}

        <div id="bar">
          <div id="brand">
            <div className="logo"><Users /></div>
            <div>
              <h1>Macromodelo Social · Kennedy</h1>
              <p>Política humana · Red de gobernanza y actores territoriales</p>
            </div>
          </div>
          {beat >= 2 && (
            <button className="btn" onClick={() => setView3d(!view3d)} title="Cambiar entre el Kennedy 3D y el mapa 2D">
              <Network /><span className="bt">{view3d ? 'Mapa 2D' : 'Kennedy 3D'}</span>
              {view3d && k3p < 1 && <span className="kick" style={{ marginLeft: 4 }}>{Math.round(k3p * 100)}%</span>}
            </button>
          )}
          {beat === 9 && (
            <button className={'btn pri' + (explore ? ' act' : '')} onClick={() => { setExplore(!explore); setSel(null); }}>
              <Network />{explore ? (m ? 'Salir' : 'Salir de explorar') : (m ? 'Explorar' : 'Explorar red')}
            </button>
          )}
        </div>

        <p className="attr">Cartografía © colaboradores de OpenStreetMap · UPL Decreto 555 de 2021</p>

        <div id="nav">
          <button className="btn" style={{ visibility: beat === 0 ? 'hidden' : 'visible' }} onClick={() => go(beat - 1)}><ArrowLeft />Atrás</button>
          <div className="steps">
            <div className="ticks">{STEP_LABELS.map((s, i) => (<span key={s} onClick={() => go(i)} style={{ height: i === beat ? 16 : 7, background: i <= beat ? '#f0f0f0' : '#383838' }} />))}</div>
            <span className="kick hidemob">{String(beat + 1).padStart(2, '0')} · {STEP_LABELS[beat]}</span>
          </div>
          <button className="btn" style={{ visibility: beat === N - 1 ? 'hidden' : 'visible' }} onClick={() => go(beat + 1)}>Continuar<ArrowRight /></button>
        </div>
      </div>
    </>
  );
}

function isRelated(sel: SocialStageId, id: SocialStageId) {
  if (sel === id) return true;
  if (sel === 'humana' || sel === 'red') return true;
  return STAGE_RELATIONS[sel]?.rel.some(([r]) => r === id) || false;
}

function NetRings({ o, on, m }: { o: ReturnType<typeof orbit>; on: boolean; m: boolean }) {
  const ring = (R: number) => 'M' + (o.cx - R) + ' ' + o.cy + 'a' + R + ' ' + R + ' 0 1 0 ' + 2 * R + ' 0a' + R + ' ' + R + ' 0 1 0 ' + -2 * R + ' 0';
  return (
    <g className={'net' + (on ? ' on' : '')}>
      <defs>
        <radialGradient id="socGlow"><stop offset="0%" stopColor={COLORS.cream} stopOpacity="0.25" /><stop offset="70%" stopColor={COLORS.cream} stopOpacity="0.06" /><stop offset="100%" stopColor={COLORS.cream} stopOpacity="0.01" /></radialGradient>
      </defs>
      <circle cx={o.cx} cy={o.cy} r={o.Rb} className="nring bio" />
      <path d={ring(o.Rb)} id="rsocb" fill="none" />
      <text x={o.cx} y={o.cy - o.Rb - 9} textAnchor="middle" className="ringlb" style={{ fill: COLORS.white }}>{m ? 'GOBERNANZA POLICÉNTRICA' : 'RED HORIZONTAL DE GOBERNANZA POLICÉNTRICA Y CO-CUSTODIA'}</text>

      <circle cx={o.cx} cy={o.cy} r={o.Rl} className="nring lim" />
      <path d={ring(o.Rl)} id="rsocl" fill="none" />
      <text x={o.cx} y={o.cy + o.Rl + 20} textAnchor="middle" className="ringlb" style={{ fill: COLORS.poly }}>{m ? 'CO-CUSTODIA TERRITORIAL' : 'PRÁCTICAS COTIDIANAS Y CUIDADO DE HUMEDALES'}</text>

      <circle cx={o.cx} cy={o.cy} r={o.Re} fill="url(#socGlow)" className="neco" />
      <circle cx={o.cx} cy={o.cy} r={o.Re} className="nring eco" />
    </g>
  );
}
