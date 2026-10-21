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
  // Variables continuas de estado
  vulnerability: number; // V_i in [0, 1]
  resources: number;     // R_i
  trust: number;         // T_i in [0, 1] (confianza institucional)
  socialCapital: number; // C_i in [0, 1] (capital social local)
  // Estado discreto actual
  state: AgentState;
  stateHistory: AgentState[];
  utilities: Record<AgentState, number>;
}

export interface PolicyParams {
  coercion: number;     // Phi_d in [0, 1] (intensidad de control / fiscalización)
  polycentric: number;  // G_d in [0, 1] (apertura a gobernanza policéntrica e incentivos)
  latency: number;      // tau_d in ticks (latencia institucional de respuesta)
  mesoLegitimacy: number;// L_m in [0, 1] (legitimidad comunitaria de JACs y colectivos)
  rationality: number;  // beta (racionalidad en la función de Boltzmann)
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
    label: 'Evasión / Extracción agresiva',
    desc: 'Ocupación de rondas, vertimientos clandestinos, desacato normativo por necesidad de subsistencia.',
    color: '#ef4444',
    ink: '#fff',
  },
  S2: {
    code: 'S2',
    label: 'Oportunismo pasivo',
    desc: 'Cumplimiento condicionado estrictamente a la presencia policial o fiscalización inmediata.',
    color: '#f59e0b',
    ink: '#000',
  },
  S3: {
    code: 'S3',
    label: 'Cumplimiento normativo estándar',
    desc: 'Acatamiento pasivo de normas por costo coercitivo o inercia cívica.',
    color: '#60a5fa',
    ink: '#000',
  },
  S4: {
    code: 'S4',
    label: 'Co-custodia activa',
    desc: 'Cuidado activo de bordes y humedales, separación tecnificada de residuos, acuerdos comunitarios.',
    color: '#10b981',
    ink: '#fff',
  },
};

// Generador de agentes iniciales en los puntos de tensión de Kennedy
export function createInitialAgents(count = 90): SocialAgent[] {
  const sectors = [
    { id: 'la_vaca', label: 'Borde Humedal La Vaca', center: [-74.16255, 4.62899] as [number, number], r: 0.0035, vBias: 0.75 },
    { id: 'el_burro', label: 'Borde Humedal El Burro', center: [-74.14979, 4.64062] as [number, number], r: 0.0038, vBias: 0.65 },
    { id: 'patio_bonito', label: 'Patio Bonito / María Paz', center: [-74.16012, 4.63150] as [number, number], r: 0.0030, vBias: 0.85 },
    { id: 'corabastos', label: 'Área de Influencia Corabastos', center: [-74.1542, 4.6275] as [number, number], r: 0.0040, vBias: 0.70 },
    { id: 'tintal', label: 'Eje Tintal / Techo', center: [-74.1450, 4.6440] as [number, number], r: 0.0035, vBias: 0.45 },
  ] as const;

  const roles: { role: ProductiveRole; label: string; vMult: number; cMult: number }[] = [
    { role: 'residente_borde', label: 'Residente de borde de humedal', vMult: 1.1, cMult: 0.9 },
    { role: 'reciclador_oficio', label: 'Reciclador(a) de oficio', vMult: 1.25, cMult: 1.2 },
    { role: 'comercio_informal', label: 'Comerciante informal', vMult: 1.15, cMult: 1.0 },
    { role: 'residente_consolidado', label: 'Vecino de barrio consolidado', vMult: 0.65, cMult: 1.1 },
  ];

  const agents: SocialAgent[] = [];
  let id = 1;

  for (let i = 0; i < count; i++) {
    const s = sectors[i % sectors.length];
    const rInfo = roles[Math.floor(Math.random() * roles.length)];
    // Distribución espacial alrededor del centro del sector
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * s.r;
    const lon = s.center[0] + rad * Math.cos(ang);
    const lat = s.center[1] + rad * Math.sin(ang) * 0.9;

    const vulnerability = Math.min(0.98, Math.max(0.1, s.vBias * rInfo.vMult * (0.8 + Math.random() * 0.4)));
    const trust = Math.max(0.05, Math.min(0.7, 0.4 - vulnerability * 0.25 + (Math.random() - 0.5) * 0.2));
    const socialCapital = Math.min(0.95, Math.max(0.15, 0.45 * rInfo.cMult + (Math.random() - 0.5) * 0.25));

    // Estado inicial influenciado por vulnerabilidad inicial
    const state: AgentState = vulnerability > 0.75 && trust < 0.35 ? 'S1' : vulnerability > 0.5 ? 'S2' : 'S3';

    agents.push({
      id: id++,
      name: `Agente #${id - 1} · ${rInfo.label}`,
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

// Paso computacional del ABM: actualiza utilidades, probabilidades Boltzmann y confianza
export function stepSimulation(agents: SocialAgent[], policy: PolicyParams, currentTick: number): { nextAgents: SocialAgent[]; stats: SimStats } {
  const { coercion, polycentric, latency, mesoLegitimacy, rationality } = policy;

  // Parámetros de evolución de confianza (Gemini transcript)
  const lambda_T = 0.04; // Tasa natural de olvido / inercia
  const alpha = 0.16;    // Aprendizaje ante cumplimiento institucional
  const gamma = 0.32;    // Erosión asimétrica ante traición (gamma > alpha)
  // El mediador meso con legitimidad amortigua la traición institucional:
  const gamma_effective = gamma * (1 - mesoLegitimacy * 0.75);

  const compliance = polycentric * Math.max(0, 1 - (latency / 18));
  const betrayal = (coercion > 0.6 && polycentric < 0.25) || latency > 10 ? Math.min(1, 0.3 + (latency / 20) * 0.5 + coercion * 0.3) : 0.08;

  const nextAgents: SocialAgent[] = agents.map((agent) => {
    const V = agent.vulnerability;
    const C = agent.socialCapital;
    const T = agent.trust;

    // 1. Pesos de utilidad según vulnerabilidad:
    // Para alta vulnerabilidad, el peso económico domina abrumadoramente
    const w1 = 0.5 + 0.45 * V;     // Economía de subsistencia
    const w2 = 0.25 * (1 - V * 0.5); // Social / Comunitario
    const w3 = 0.25 * (1 - V * 0.5); // Institucional / Coerción

    // 2. Funciones de retorno por estado S_k (Transcript):
    // S1: Evasión / Extracción agresiva
    const pi_S1 = 0.85 * V;
    const gamma_S1 = -0.5 * C;
    const omega_S1 = -coercion * (1.3 - 0.4 * T);
    const kappa_S1 = 0.05;
    const u_S1 = w1 * pi_S1 + w2 * gamma_S1 + w3 * omega_S1 - kappa_S1;

    // S2: Oportunismo pasivo
    const pi_S2 = 0.45 * V;
    const gamma_S2 = 0;
    const omega_S2 = -0.35 * coercion;
    const kappa_S2 = 0.02;
    const u_S2 = w1 * pi_S2 + w2 * gamma_S2 + w3 * omega_S2 - kappa_S2;

    // S3: Cumplimiento normativo
    const pi_S3 = 0.15 * (1 - V);
    const gamma_S3 = 0.35 * C;
    const omega_S3 = 0.55 * T + 0.35 * coercion;
    const kappa_S3 = 0.22;
    const u_S3 = w1 * pi_S3 + w2 * gamma_S3 + w3 * omega_S3 - kappa_S3;

    // S4: Co-custodia activa
    // Si la gobernanza policéntrica ofrece incentivos económicos (compostaje, reciclaje pagado, custodia),
    // la utilidad económica es muy atractiva incluso para agentes vulnerables.
    const pi_S4 = 1.1 * polycentric * (0.8 + 0.6 * V) - 0.35 * (1 - polycentric);
    const gamma_S4 = 0.9 * C * (1 + 0.6 * mesoLegitimacy);
    const omega_S4 = 0.95 * T;
    const kappa_S4 = Math.max(0.08, 0.38 - 0.28 * polycentric);
    const u_S4 = w1 * pi_S4 + w2 * gamma_S4 + w3 * omega_S4 - kappa_S4;

    const uMap: Record<AgentState, number> = { S1: u_S1, S2: u_S2, S3: u_S3, S4: u_S4 };

    // 3. Probabilidades de Boltzmann (Multinomial Logit):
    const beta = Math.max(0.5, Math.min(6, rationality));
    const expS1 = Math.exp(beta * u_S1);
    const expS2 = Math.exp(beta * u_S2);
    const expS3 = Math.exp(beta * u_S3);
    const expS4 = Math.exp(beta * u_S4);
    const sumExp = expS1 + expS2 + expS3 + expS4;

    const pS1 = expS1 / sumExp;
    const pS2 = expS2 / sumExp;
    const pS3 = expS3 / sumExp;
    const pS4 = expS4 / sumExp;

    // Sorteo de Monte Carlo
    const rand = Math.random();
    let nextState: AgentState = 'S1';
    if (rand < pS1) nextState = 'S1';
    else if (rand < pS1 + pS2) nextState = 'S2';
    else if (rand < pS1 + pS2 + pS3) nextState = 'S3';
    else nextState = 'S4';

    // 4. Actualización dinámica de confianza:
    // T_i(t+1) = (1 - lambda_T) T_i(t) + alpha * Cumplimiento - gamma_efectivo * Traicion
    const deltaT = alpha * compliance - gamma_effective * betrayal;
    const nextTrust = Math.min(0.98, Math.max(0.02, (1 - lambda_T) * T + deltaT));

    const nextHistory = [...agent.stateHistory.slice(-19), nextState];

    return {
      ...agent,
      state: nextState,
      trust: nextTrust,
      stateHistory: nextHistory,
      utilities: uMap,
    };
  });

  // Estadísticas globales
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

  // Salud ambiental de humedales y bordes: castigada por S1, restaurada por S4
  const envHealth = Math.min(100, Math.max(0, Math.round(50 + (s4 * 1.2 - s1 * 1.5 + s3 * 0.4 - s2 * 0.2))));

  // Identificar el bucle activo
  let activeLoop: SimStats['activeLoop'] = 'inertia';
  if (s1 > (s3 + s4) * 0.7 && avgTrust < 0.35) {
    activeLoop = 'destructive';
  } else if (s4 > (s1 + s2) && avgTrust > 0.55) {
    activeLoop = 'polycentric';
  }

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
  destructive: {
    name: 'Mando y Control Punitivo',
    desc: 'Alta fiscalización sin alternativas económicas ni co-manejo. Desencadena la trampa de política y evasión masiva.',
    policy: {
      coercion: 0.85,
      polycentric: 0.08,
      latency: 16,
      mesoLegitimacy: 0.25,
      rationality: 2.2,
    },
  },
  polycentric: {
    name: 'Gobernanza Policéntrica y Co-custodia',
    desc: 'Incentivos económicos de co-manejo, respuesta ágil y articulación con JACs y colectivos de humedal. Transición virtuosa.',
    policy: {
      coercion: 0.35,
      polycentric: 0.82,
      latency: 3,
      mesoLegitimacy: 0.85,
      rationality: 2.4,
    },
  },
  abandonment: {
    name: 'Inercia y Desconexión Institucional',
    desc: 'Baja presencia pública y lentitud extrema. Oportunismo pasivo y degradación silenciosa de los bienes comunes.',
    policy: {
      coercion: 0.15,
      polycentric: 0.12,
      latency: 20,
      mesoLegitimacy: 0.40,
      rationality: 1.8,
    },
  },
};
