import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Sparkles, AlertTriangle, ShieldCheck, HelpCircle, Users, Activity, Sliders, ChevronDown, ChevronUp, Layers, Compass } from 'lucide-react';
import { createInitialAgents, stepSimulation, PRESETS, STATE_INFO, type AgentState, type PolicyParams, type SimStats, type SocialAgent } from './social_sim';
import { COLORS } from './content';

interface Props {
  onAgentSelect?: (agent: SocialAgent | null) => void;
  compact?: boolean;
}

export function SocialSimView({ onAgentSelect, compact = false }: Props) {
  const [agents, setAgents] = useState<SocialAgent[]>(() => createInitialAgents(80));
  const [policy, setPolicy] = useState<PolicyParams>(PRESETS.polycentric.policy);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState<SimStats>({
    tick: 0,
    s1Count: 15,
    s2Count: 25,
    s3Count: 20,
    s4Count: 20,
    avgTrust: 0.52,
    avgVulnerability: 0.65,
    environmentalHealth: 68,
    activeLoop: 'polycentric',
  });
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [presetName, setPresetName] = useState<string>('polycentric');

  // Loop de simulación
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setAgents((prev) => {
        const { nextAgents, stats: nextStats } = stepSimulation(prev, policy, tick);
        setStats(nextStats);
        setTick((t) => t + 1);
        return nextAgents;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, [running, policy, tick]);

  const applyPreset = (key: keyof typeof PRESETS) => {
    setPresetName(key);
    setPolicy(PRESETS[key].policy);
  };

  const handleReset = () => {
    const init = createInitialAgents(80);
    setAgents(init);
    setTick(0);
  };

  const selectedAgent = useMemo(() => agents.find((a) => a.id === selectedAgentId) || null, [agents, selectedAgentId]);

  const total = agents.length;
  const pS1 = Math.round((stats.s1Count / total) * 100);
  const pS2 = Math.round((stats.s2Count / total) * 100);
  const pS3 = Math.round((stats.s3Count / total) * 100);
  const pS4 = Math.round((stats.s4Count / total) * 100);

  return (
    <div className={`social-sim-panel ${compact ? 'compact' : ''}`}>
      {/* Cabecera del simulador */}
      <div className="sim-header">
        <div className="sim-title-group">
          <div className="sim-badge">
            <Users size={14} />
            <span>MODELO ABM · TEORÍA DE JUEGOS Y LOGIT</span>
          </div>
          <h4>Simulador de Dinámica Social y Gobernanza en Kennedy</h4>
        </div>

        <div className="sim-controls-top">
          <button className={`btn-icon ${running ? 'act' : ''}`} onClick={() => setRunning(!running)} title={running ? 'Pausar simulación' : 'Iniciar simulación'}>
            {running ? <Pause size={14} /> : <Play size={14} />}
            <span>{running ? 'Pausa' : 'Simular'}</span>
          </button>
          <button className="btn-icon" onClick={handleReset} title="Reiniciar población de agentes">
            <RotateCcw size={14} />
            <span>Ciclo: #{tick}</span>
          </button>
        </div>
      </div>

      {/* Presets rápidos */}
      <div className="sim-presets">
        <span className="preset-label">Escenarios:</span>
        <button
          className={`btn-preset ${presetName === 'polycentric' ? 'active' : ''}`}
          onClick={() => applyPreset('polycentric')}
        >
          <ShieldCheck size={13} style={{ color: '#10b981' }} />
          <span>Gobernanza Policéntrica</span>
        </button>
        <button
          className={`btn-preset ${presetName === 'destructive' ? 'active' : ''}`}
          onClick={() => applyPreset('destructive')}
        >
          <AlertTriangle size={13} style={{ color: '#ef4444' }} />
          <span>Mando Punitivo (Bucle Destructivo)</span>
        </button>
        <button
          className={`btn-preset ${presetName === 'abandonment' ? 'active' : ''}`}
          onClick={() => applyPreset('abandonment')}
        >
          <Activity size={13} style={{ color: '#f59e0b' }} />
          <span>Inercia / Abandono</span>
        </button>
      </div>

      {/* Barra de distribución de estados */}
      <div className="sim-meter-block">
        <div className="meter-labels">
          <span style={{ color: STATE_INFO.S1.color }}>S1 Evasión: {pS1}%</span>
          <span style={{ color: STATE_INFO.S2.color }}>S2 Oportunismo: {pS2}%</span>
          <span style={{ color: STATE_INFO.S3.color }}>S3 Cumplimiento: {pS3}%</span>
          <span style={{ color: STATE_INFO.S4.color }}>S4 Co-custodia: {pS4}%</span>
        </div>
        <div className="meter-bar">
          <div className="bar-seg s1" style={{ width: `${pS1}%` }} title={`S1 Evasión: ${pS1}%`} />
          <div className="bar-seg s2" style={{ width: `${pS2}%` }} title={`S2 Oportunismo: ${pS2}%`} />
          <div className="bar-seg s3" style={{ width: `${pS3}%` }} title={`S3 Cumplimiento: ${pS3}%`} />
          <div className="bar-seg s4" style={{ width: `${pS4}%` }} title={`S4 Co-custodia: ${pS4}%`} />
        </div>
      </div>

      {/* Indicadores clave */}
      <div className="sim-kpis">
        <div className="kpi-card">
          <div className="kpi-val" style={{ color: stats.avgTrust > 0.5 ? '#10b981' : '#ef4444' }}>
            {Math.round(stats.avgTrust * 100)}%
          </div>
          <div className="kpi-label">Confianza Institucional T(t)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-val" style={{ color: stats.environmentalHealth > 60 ? '#10b981' : '#f59e0b' }}>
            {stats.environmentalHealth}/100
          </div>
          <div className="kpi-label">Salud de Bordes y Humedales</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-val loop-status">
            {stats.activeLoop === 'polycentric' && <span className="status-poly">Policéntrico ✨</span>}
            {stats.activeLoop === 'destructive' && <span className="status-dest">Trampa Destructiva ⚠️</span>}
            {stats.activeLoop === 'inertia' && <span className="status-iner">Inercia Pasiva ⏳</span>}
          </div>
          <div className="kpi-label">Bucle Activo de Retroalimentación</div>
        </div>
      </div>

      {/* Sliders de Política Territorial */}
      <div className="sim-sliders-grid">
        <div className="slider-item">
          <div className="sl-header">
            <span>Coerción / Fiscalización (Φd)</span>
            <b>{Math.round(policy.coercion * 100)}%</b>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={policy.coercion}
            onChange={(e) => {
              setPresetName('custom');
              setPolicy({ ...policy, coercion: parseFloat(e.target.value) });
            }}
          />
        </div>

        <div className="slider-item">
          <div className="sl-header">
            <span>Gobernanza Policéntrica / Incentivos (Gd)</span>
            <b>{Math.round(policy.polycentric * 100)}%</b>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={policy.polycentric}
            onChange={(e) => {
              setPresetName('custom');
              setPolicy({ ...policy, polycentric: parseFloat(e.target.value) });
            }}
          />
        </div>

        <div className="slider-item">
          <div className="sl-header">
            <span>Latencia Institucional (τd)</span>
            <b>{policy.latency} ticks</b>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={policy.latency}
            onChange={(e) => {
              setPresetName('custom');
              setPolicy({ ...policy, latency: parseInt(e.target.value, 10) });
            }}
          />
        </div>

        <div className="slider-item">
          <div className="sl-header">
            <span>Legitimidad Articuladores Meso (Lm)</span>
            <b>{Math.round(policy.mesoLegitimacy * 100)}%</b>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={policy.mesoLegitimacy}
            onChange={(e) => {
              setPresetName('custom');
              setPolicy({ ...policy, mesoLegitimacy: parseFloat(e.target.value) });
            }}
          />
        </div>
      </div>

      {/* Inspector individual de Agentes */}
      <div className="sim-inspector">
        <div className="inspector-head">
          <span>Muestra representativa de agentes en Kennedy (haz clic para auditar):</span>
        </div>
        <div className="agents-chips-wrap">
          {agents.slice(0, 16).map((a) => (
            <button
              key={a.id}
              className={`agent-chip ${selectedAgentId === a.id ? 'sel' : ''}`}
              style={{ ['--ac' as string]: STATE_INFO[a.state].color }}
              onClick={() => {
                const next = selectedAgentId === a.id ? null : a.id;
                setSelectedAgentId(next);
                onAgentSelect?.(next ? a : null);
              }}
            >
              <span className="dot" />
              <span className="tx">#{a.id} · {a.role.replace('_', ' ')}</span>
            </button>
          ))}
        </div>

        {selectedAgent && (
          <div className="agent-detail-card" style={{ ['--ac' as string]: STATE_INFO[selectedAgent.state].color }}>
            <div className="ad-title">
              <b>{selectedAgent.name}</b>
              <span className="ad-badge" style={{ background: STATE_INFO[selectedAgent.state].color, color: STATE_INFO[selectedAgent.state].ink }}>
                {STATE_INFO[selectedAgent.state].label}
              </span>
            </div>
            <div className="ad-meta">
              <span>Sector: <b>{selectedAgent.sectorLabel}</b></span>
              <span>Vulnerabilidad: <b>{Math.round(selectedAgent.vulnerability * 100)}%</b></span>
              <span>Confianza T_i: <b>{Math.round(selectedAgent.trust * 100)}%</b></span>
              <span>Capital Social C_i: <b>{Math.round(selectedAgent.socialCapital * 100)}%</b></span>
            </div>
            <div className="ad-reason">
              {STATE_INFO[selectedAgent.state].desc}
            </div>
          </div>
        )}
      </div>

      {/* Desplegable de formalización matemática */}
      <div className="formula-toggle" onClick={() => setShowFormula(!showFormula)}>
        <HelpCircle size={14} />
        <span>Ontología y Formulación Matemática (Logit de Boltzmann)</span>
        {showFormula ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {showFormula && (
        <div className="formula-box">
          <p>
            <b>1. Función de Utilidad:</b>{' '}
            <code>U_i(S_k) = w_1·Π_econ(S_k, V_i) + w_2·Γ_social(S_k, C_i) + w_3·Ω_norm(S_k, T_i, Φ_d) - κ(S_k)</code>
          </p>
          <p>
            <b>2. Probabilidad de Transición (Boltzmann):</b>{' '}
            <code>P_i(S_t → S_k) = exp(β·U_i(S_k)) / Σ exp(β·U_i(S_j))</code>
          </p>
          <p>
            <b>3. Memoria Dinámica de Confianza y Escudo Meso:</b>{' '}
            <code>T_i(t+1) = (1 - λ_T)·T_i(t) + α·Cumplimiento - γ·(1 - L_m)·Traición</code>
          </p>
        </div>
      )}
    </div>
  );
}
