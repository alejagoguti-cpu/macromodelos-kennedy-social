import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { PRESETS, STATE_INFO, type PolicyParams, type SimStats, type SocialAgent } from './social_sim';

interface Props {
  stats: SimStats;
  policy: PolicyParams;
  running: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onSelectPreset: (presetKey: keyof typeof PRESETS) => void;
  onPolicyChange: (policy: PolicyParams) => void;
  agentCount: number;
}

export function SocialSimHud({
  stats,
  policy,
  running,
  onToggleRun,
  onReset,
  onSelectPreset,
  onPolicyChange,
  agentCount,
}: Props) {
  const [activePreset, setActivePreset] = useState<string>('polycentric');

  const pS1 = Math.round((stats.s1Count / agentCount) * 100);
  const pS2 = Math.round((stats.s2Count / agentCount) * 100);
  const pS3 = Math.round((stats.s3Count / agentCount) * 100);
  const pS4 = Math.round((stats.s4Count / agentCount) * 100);

  const setPreset = (key: keyof typeof PRESETS) => {
    setActivePreset(key);
    onSelectPreset(key);
  };

  return (
    <div className="sim-arch-hud">
      <div className="hud-top">
        <div className="hud-badge">
          <span className="dot-live" />
          <span>SIMULACIÓN TERRITORIAL · KENNEDY</span>
          <span className="hud-tick">Ciclo #{stats.tick}</span>
        </div>

        <div className="hud-actions">
          <button className={`hud-btn-mini ${running ? 'on' : ''}`} onClick={onToggleRun}>
            {running ? <Pause size={12} /> : <Play size={12} />}
            <span>{running ? 'Pausa' : 'Simular'}</span>
          </button>
          <button className="hud-btn-mini" onClick={onReset} title="Reiniciar agentes">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Escenarios arquitectónicos minimalistas */}
      <div className="hud-scenarios">
        <button
          className={`hud-scen-btn ${activePreset === 'polycentric' ? 'active' : ''}`}
          onClick={() => setPreset('polycentric')}
        >
          <ShieldCheck size={12} style={{ color: '#34d399' }} />
          <span>Gobernanza policéntrica</span>
        </button>
        <button
          className={`hud-scen-btn ${activePreset === 'destructive' ? 'active' : ''}`}
          onClick={() => setPreset('destructive')}
        >
          <AlertTriangle size={12} style={{ color: '#f87171' }} />
          <span>Mando punitivo</span>
        </button>
        <button
          className={`hud-scen-btn ${activePreset === 'abandonment' ? 'active' : ''}`}
          onClick={() => setPreset('abandonment')}
        >
          <Activity size={12} style={{ color: '#fbbf24' }} />
          <span>Inercia</span>
        </button>
      </div>

      {/* Barra de distribución arquitectónica fina */}
      <div className="hud-distribution">
        <div className="hud-meter-line">
          <div style={{ width: `${pS1}%`, background: '#f87171' }} title={`S1 Evasión: ${pS1}%`} />
          <div style={{ width: `${pS2}%`, background: '#fbbf24' }} title={`S2 Oportunismo: ${pS2}%`} />
          <div style={{ width: `${pS3}%`, background: '#60a5fa' }} title={`S3 Cumplimiento: ${pS3}%`} />
          <div style={{ width: `${pS4}%`, background: '#34d399' }} title={`S4 Co-custodia: ${pS4}%`} />
        </div>
        <div className="hud-labels">
          <span style={{ color: '#f87171' }}>S1 {pS1}%</span>
          <span style={{ color: '#fbbf24' }}>S2 {pS2}%</span>
          <span style={{ color: '#60a5fa' }}>S3 {pS3}%</span>
          <span style={{ color: '#34d399' }}>S4 {pS4}%</span>
        </div>
      </div>

      {/* Indicadores numéricos sobrios */}
      <div className="hud-metrics">
        <div className="hud-metric">
          <span className="hm-val" style={{ color: stats.avgTrust > 0.5 ? '#34d399' : '#f87171' }}>
            {Math.round(stats.avgTrust * 100)}%
          </span>
          <span className="hm-lbl">Confianza institucional</span>
        </div>
        <div className="hud-metric">
          <span className="hm-val" style={{ color: stats.environmentalHealth > 60 ? '#34d399' : '#fbbf24' }}>
            {stats.environmentalHealth}/100
          </span>
          <span className="hm-lbl">Salud de humedales</span>
        </div>
        <div className="hud-metric">
          <span className="hm-val">
            {stats.activeLoop === 'polycentric' && <b style={{ color: '#34d399' }}>Policéntrico</b>}
            {stats.activeLoop === 'destructive' && <b style={{ color: '#f87171' }}>Punitivo</b>}
            {stats.activeLoop === 'inertia' && <b style={{ color: '#fbbf24' }}>Inercia</b>}
          </span>
          <span className="hm-lbl">Bucle activo</span>
        </div>
      </div>

      {/* Deslizadores técnicos integrados */}
      <div className="hud-sliders">
        <div className="hud-slider-row">
          <div className="hsl-head">
            <span>Coerción y control normativo (Φd)</span>
            <span>{Math.round(policy.coercion * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={policy.coercion}
            onChange={(e) => {
              setActivePreset('custom');
              onPolicyChange({ ...policy, coercion: parseFloat(e.target.value) });
            }}
          />
        </div>

        <div className="hud-slider-row">
          <div className="hsl-head">
            <span>Incentivos y co-manejo (Gd)</span>
            <span>{Math.round(policy.polycentric * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={policy.polycentric}
            onChange={(e) => {
              setActivePreset('custom');
              onPolicyChange({ ...policy, polycentric: parseFloat(e.target.value) });
            }}
          />
        </div>

        <div className="hud-slider-row">
          <div className="hsl-head">
            <span>Latencia institucional (τd)</span>
            <span>{policy.latency} ticks</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={policy.latency}
            onChange={(e) => {
              setActivePreset('custom');
              onPolicyChange({ ...policy, latency: parseInt(e.target.value, 10) });
            }}
          />
        </div>

        <div className="hud-slider-row">
          <div className="hsl-head">
            <span>Amortiguación comunitaria (Lm)</span>
            <span>{Math.round(policy.communityLegitimacy * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={policy.communityLegitimacy}
            onChange={(e) => {
              setActivePreset('custom');
              onPolicyChange({ ...policy, communityLegitimacy: parseFloat(e.target.value) });
            }}
          />
        </div>
      </div>
    </div>
  );
}
