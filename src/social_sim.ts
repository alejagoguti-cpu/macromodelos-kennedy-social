// Motor de Simulación Basado en Agentes (ABM) para el Macromodelo Social de Kennedy
// Basado en Teoría de Juegos Evolutivos, Elección Discreta (Multinomial Logit / Boltzmann)
// y Gobernanza Policéntrica (Ostrom).

export type AgentState = 'S1' | 'S2' | 'S3' | 'S4';
export type ProductiveRole = 'comercio_informal' | 'reciclador_oficio' | 'residente_borde' | 'residente_consolidado';

export interface SocialAgent {
  id: number;
  name: string;
  role: ProductiveRole;
  roleLabel: string;
  sector: 'la_vaca' | 'el_burro' | 'patio_bonito' | 'corabastos' | 'tintal';
  sectorLabel: string;
  lon: number;
  lat: number;
  vulnerability: number; // V_i in [0, 1]
  resources: number;     // R_i
  trust: number;         // T_i in [0, 1] (confianza institucional)
  socialCapital: number; // C_i in [0, 1] (capital social local)
  state: AgentState;
  stateHistory: AgentState[];
  utilities: Record<AgentState, number>;
}

export interface PolicyParams {
  coercion: number;            // Phi_d in [0, 1] (intensidad de control / fiscalización)
  polycentric: number;         // G_d in [0, 1] (apertura a gobernanza policéntrica e incentivos)
  latency: number;             // tau_d in ticks (latencia institucional de respuesta)
  communityLegitimacy: number; // L_m in [0, 1] (legitimidad comunitaria de JACs y colectivos)
  rationality: number;         // beta (racionalidad en la función de Boltzmann)
}

export interface SimStats {
  tick: number;
  s1Count: number;
  s2Count: number;
  s3Count: number;
  s4Count: number;
  avgTrust: number;
  avgVulnerability: number;
  environmentalHealth: number; // 0 a 100%
  activeLoop: 'destructive' | 'polycentric' | 'inertia';
}

export const STATE_INFO: Record<AgentState, { code: string; label: string; desc: string; color: string; ink: string }> = {
  S1: {
    code: 'S1',
    label: 'Evasión / Extracción',
    desc: 'Ocupación de rondas, vertimientos clandestinos, desacato forzado por necesidad inmediata.',
    color: '#f87171',
    ink: '#fff',
  },
  S2: {
    code: 'S2',
    label: 'Oportunismo pasivo',
    desc: 'Cumplimiento condicionado estrictamente a presencia o sanción policial inmediata.',
    color: '#fbbf24',
    ink: '#000',
  },
  S3: {
    code: 'S3',
    label: 'Cumplimiento normativo',
    desc: 'Acatamiento pasivo de normas por inercia cívica o costo de la infracción legal.',
    color: '#60a5fa',
    ink: '#000',
  },
  S4: {
    code: 'S4',
    label: 'Co-custodia activa',
    desc: 'Cuidado activo de humedales y rondas, separación tecnificada y acuerdos comunitarios.',
    color: '#34d399',
    ink: '#fff',
  },
};

export function createInitialAgents(count = 70): SocialAgent[] {
  const sectors = [
    { id: 'la_vaca', label: 'Borde Humedal La Vaca', center: [-74.16255, 4.62899] as [number, number], r: 0.0032, vBias: 0.78 },
    { id: 'el_burro', label: 'Borde Humedal El Burro', center: [-74.14979, 4.64062] as [number, number], r: 0.0035, vBias: 0.68 },
    { id: 'patio_bonito', label: 'Patio Bonito / María Paz', center: [-74.16012, 4.63150] as [number, number], r: 0.0028, vBias: 0.85 },
    { id: 'corabastos', label: 'Área Corabastos', center: [-74.1542, 4.6275] as [number, number], r: 0.0038, vBias: 0.70 },
    { id: 'tintal', label: 'Eje Tintal / Techo', center: [-74.1450, 4.6440] as [number, number], r: 0.0032, vBias: 0.45 },
  ] as const;

  const roles: { role: ProductiveRole; label: string; vMult: number; cMult: number }[] = [
    { role: 'residente_borde', label: 'Habitante de borde de humedal', vMult: 1.1, cMult: 0.9 },
    { role: 'reciclador_oficio', label: 'Reciclador(a) de oficio', vMult: 1.25, cMult: 1.2 },
    { role: 'comercio_informal', label: 'Comerciante de economía popular', vMult: 1.15, cMult: 1.0 },
    { role: 'residente_consolidado', label: 'Vecino de barrio consolidado', vMult: 0.65, cMult: 1.1 },
  ];

  const agents: SocialAgent[] = [];
  let id = 1;

  for (let i = 0; i < count; i++) {
    const s = sectors[i % sectors.length];
    const rInfo = roles[Math.floor(Math.random() * roles.length)];
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * s.r;
    const lon = s.center[0] + rad * Math.cos(ang);
    const lat = s.center[1] + rad * Math.sin(ang) * 0.9;

    const vulnerability = Math.min(0.96, Math.max(0.12, s.vBias * rInfo.vMult * (0.85 + Math.random() * 0.3)));
    const trust = Math.max(0.08, Math.min(0.75, 0.48 - vulnerability * 0.3 + (Math.random() - 0.5) * 0.2));
    const socialCapital = Math.min(0.95, Math.max(0.2, 0.5 * rInfo.cMult + (Math.random() - 0.5) * 0.2));

    const state: AgentState = vulnerability > 0.72 && trust < 0.35 ? 'S1' : vulnerability > 0.5 ? 'S2' : 'S3';

    agents.push({
      id: id++,
      name: `${rInfo.label} #${id - 1}`,
      role: rInfo.role,
      roleLabel: rInfo.label,
      sector: s.id,
      sectorLabel: s.label,
      lon,
      lat,
      vulnerability,
      resources: Math.round(100 * (1 - vulnerability) + Math.random() * 50),
      trust,
      socialCapital,
      state,
      stateHistory: [state],
      utilities: { S1: 0, S2: 0, S3: 0, S4: 0 },
    });
  }

  return agents;
}

export function stepSimulation(agents: SocialAgent[], policy: PolicyParams, currentTick: number): { nextAgents: SocialAgent[]; stats: SimStats } {
  const { coercion, polycentric, latency, communityLegitimacy, rationality } = policy;

  const lambda_T = 0.035;
  const alpha = 0.18;
  const gamma = 0.34;
  const gamma_effective = gamma * (1 - communityLegitimacy * 0.72);

  const compliance = polycentric * Math.max(0, 1 - (latency / 18));
  const betrayal = (coercion > 0.6 && polycentric < 0.25) || latency > 10 ? Math.min(1, 0.3 + (latency / 20) * 0.5 + coercion * 0.3) : 0.08;

  const nextAgents: SocialAgent[] = agents.map((agent) => {
    const V = agent.vulnerability;
    const C = agent.socialCapital;
    const T = agent.trust;

    const w1 = 0.5 + 0.45 * V;
    const w2 = 0.25 * (1 - V * 0.5);
    const w3 = 0.25 * (1 - V * 0.5);

    const pi_S1 = 0.85 * V;
    const gamma_S1 = -0.5 * C;
    const omega_S1 = -coercion * (1.3 - 0.4 * T);
    const kappa_S1 = 0.05;
    const u_S1 = w1 * pi_S1 + w2 * gamma_S1 + w3 * omega_S1 - kappa_S1;

    const pi_S2 = 0.45 * V;
    const gamma_S2 = 0;
    const omega_S2 = -0.35 * coercion;
    const kappa_S2 = 0.02;
    const u_S2 = w1 * pi_S2 + w2 * gamma_S2 + w3 * omega_S2 - kappa_S2;

    const pi_S3 = 0.15 * (1 - V);
    const gamma_S3 = 0.35 * C;
    const omega_S3 = 0.55 * T + 0.35 * coercion;
    const kappa_S3 = 0.22;
    const u_S3 = w1 * pi_S3 + w2 * gamma_S3 + w3 * omega_S3 - kappa_S3;

    const pi_S4 = 1.15 * polycentric * (0.8 + 0.6 * V) - 0.35 * (1 - polycentric);
    const gamma_S4 = 0.95 * C * (1 + 0.6 * communityLegitimacy);
    const omega_S4 = 0.95 * T;
    const kappa_S4 = Math.max(0.08, 0.38 - 0.28 * polycentric);
    const u_S4 = w1 * pi_S4 + w2 * gamma_S4 + w3 * omega_S4 - kappa_S4;

    const uMap: Record<AgentState, number> = { S1: u_S1, S2: u_S2, S3: u_S3, S4: u_S4 };

    const beta = Math.max(0.5, Math.min(6, rationality));
    const expS1 = Math.exp(beta * u_S1);
    const expS2 = Math.exp(beta * u_S2);
    const expS3 = Math.exp(beta * u_S3);
    const expS4 = Math.exp(beta * u_S4);
    const sumExp = expS1 + expS2 + expS3 + expS4;

    const pS1 = expS1 / sumExp;
    const pS2 = expS2 / sumExp;
    const pS3 = expS3 / sumExp;

    const rand = Math.random();
    let nextState: AgentState = 'S1';
    if (rand < pS1) nextState = 'S1';
    else if (rand < pS1 + pS2) nextState = 'S2';
    else if (rand < pS1 + pS2 + pS3) nextState = 'S3';
    else nextState = 'S4';

    const deltaT = alpha * compliance - gamma_effective * betrayal;
    const nextTrust = Math.min(0.98, Math.max(0.04, (1 - lambda_T) * T + deltaT));
    const nextHistory = [...agent.stateHistory.slice(-15), nextState];

    return {
      ...agent,
      state: nextState,
      trust: nextTrust,
      stateHistory: nextHistory,
      utilities: uMap,
    };
  });

  let s1 = 0, s2 = 0, s3 = 0, s4 = 0, totalTrust = 0, totalV = 0;
  for (const a of nextAgents) {
    if (a.state === 'S1') s1++;
    else if (a.state === 'S2') s2++;
    else if (a.state === 'S3') s3++;
    else if (a.state === 'S4') s4++;
    totalTrust += a.trust;
    totalV += a.vulnerability;
  }

  const n = nextAgents.length;
  const avgTrust = totalTrust / n;
  const avgV = totalV / n;
  const envHealth = Math.min(100, Math.max(0, Math.round(50 + (s4 * 1.3 - s1 * 1.6 + s3 * 0.4 - s2 * 0.2))));

  let activeLoop: SimStats['activeLoop'] = 'inertia';
  if (s1 > (s3 + s4) * 0.65 && avgTrust < 0.35) activeLoop = 'destructive';
  else if (s4 > (s1 + s2) && avgTrust > 0.52) activeLoop = 'polycentric';

  return {
    nextAgents,
    stats: {
      tick: currentTick + 1,
      s1Count: s1,
      s2Count: s2,
      s3Count: s3,
      s4Count: s4,
      avgTrust,
      avgVulnerability: avgV,
      environmentalHealth: envHealth,
      activeLoop,
    },
  };
}

export const PRESETS: Record<string, { name: string; desc: string; policy: PolicyParams }> = {
  polycentric: {
    name: 'Gobernanza policéntrica',
    desc: 'Incentivos económicos, co-manejo barrial y respuesta ágil de proximidad.',
    policy: {
      coercion: 0.30,
      polycentric: 0.85,
      latency: 3,
      communityLegitimacy: 0.88,
      rationality: 2.4,
    },
  },
  destructive: {
    name: 'Mando punitivo vertical',
    desc: 'Fiscalización coercitiva sin alternativas ni compensación económica.',
    policy: {
      coercion: 0.85,
      polycentric: 0.05,
      latency: 18,
      communityLegitimacy: 0.22,
      rationality: 2.2,
    },
  },
  abandonment: {
    name: 'Inercia y desconexión',
    desc: 'Baja presencia pública, latencia prolongada y abandono de acuerdos.',
    policy: {
      coercion: 0.15,
      polycentric: 0.10,
      latency: 20,
      communityLegitimacy: 0.40,
      rationality: 1.8,
    },
  },
};
