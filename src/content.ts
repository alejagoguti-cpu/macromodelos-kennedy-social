// Macromodelo Social · Política Humana y Red de Actores Territoriales de Kennedy
// Basado en teoría de sistemas complejos, gobernanza policéntrica (Ostrom) y cartografía real del POT (Decreto 555/2021).
import proyecto from './data/proyecto.json';

export type LngLat = [number, number];
type Nodo = { id: string; nombre: string; capa: string; lat: number; lon: number };
type Arista = { id: string; a: string; b: string; tipo: string; tension: string; razon: string };

const NODOS = proyecto.nodos as Record<string, Nodo>;
export const ARISTAS = proyecto.aristas as Record<string, Arista>;

export const P = (code: string): LngLat => [NODOS[code].lon, NODOS[code].lat];
export const NOMBRE = (code: string) => NODOS[code].nombre;

// Paleta arquitectónica sobria (inspirada en problemaskennedy y cartografía territorial)
export const COLORS = {
  cream: '#ebe5d9',
  water: '#6ea8d6',    // Red hídrica y humedales
  green: '#7fbf8e',    // Rondas y corredores ambientales
  norm: '#93c5fd',     // Instancias normativas / Regulación
  custody: '#fcd34d',  // Prácticas cotidianas / Comunidades y economía popular
  bridge: '#c084fc',   // Tejido comunitario / Articulación y mediación
  tension: '#f87171',  // Fricciones / Brecha de implementación
  poly: '#34d399',     // Gobernanza policéntrica / Co-custodia
  slate: '#94a3b8',    // Conductas territoriales
  cyan: '#38bdf8',     // Dinámica de agentes en territorio
  white: '#f8fafc',
  ink: '#0a0a0a',
};

export type SocialStageId =
  | 'humana'      // 01 · Política humana
  | 'normativa'   // 02 · Instancias normativas
  | 'cotidiana'   // 03 · Comunidades y custodia cotidiana
  | 'comunitaria' // 04 · Tejido comunitario y mediación
  | 'brecha'      // 05 · Brecha de implementación
  | 'policentrica'// 06 · Gobernanza policéntrica
  | 'conductas'   // 07 · Estados territoriales
  | 'dinamica'    // 08 · Simulación territorial
  | 'red';        // 09 · Red propia de gobernanza

export interface Stage {
  id: SocialStageId;
  n: string;
  title: string;
  short: string;
  text: string;
  color: string;
  ink: string;
  appear: number;
  role: string;
}

export const STAGES: Stage[] = [
  {
    id: 'humana',
    n: '01',
    title: 'Política humana y agencia distribuida',
    short: 'Política humana',
    color: COLORS.cream,
    ink: '#0a0a0a',
    appear: 0,
    role: 'Marco conceptual del macromodelo',
    text: 'La red social territorial no es un inventario estático de entidades, sino un sistema dinámico de agencia distribuida donde la organización social emerge de las tensiones entre quiénes deciden y quiénes ejecutan.',
  },
  {
    id: 'normativa',
    n: '02',
    title: 'Instancias normativas y de regulación',
    short: 'Regulación formal',
    color: COLORS.norm,
    ink: '#041226',
    appear: 1,
    role: 'Poder formal y asignación de recursos',
    text: 'SDP, SDA, IDU y Alcaldía Local: definen la zonificación, el marco regulatorio y los presupuestos fiscales. Deciden con autoridad legal pero con desconexión fenoménica frente a la velocidad de la dinámica barrial.',
  },
  {
    id: 'cotidiana',
    n: '03',
    title: 'Comunidades y prácticas cotidianas',
    short: 'Práctica cotidiana',
    color: COLORS.custody,
    ink: '#1c1302',
    appear: 3,
    role: 'Apropiación material y uso efectivo del suelo',
    text: 'Residentes de borde, recicladores de oficio y comercio popular: materializan día a día el territorio. Sus decisiones responden a supervivencia, economía inmediata y niveles de vulnerabilidad material.',
  },
  {
    id: 'comunitaria',
    n: '04',
    title: 'Tejido comunitario y mediación',
    short: 'Tejido comunitario',
    color: COLORS.bridge,
    ink: '#160524',
    appear: 4,
    role: 'Articulación de proximidad y legitimidad barrial',
    text: 'JACs, mesas ambientales de humedal y colectivos vecinales: filtran, traducen y legitiman decisiones entre la norma distrital y la base social. Reducen asimetrías de información y amortiguan tensiones territoriales.',
  },
  {
    id: 'brecha',
    n: '05',
    title: 'La brecha de implementación y bucle destructivo',
    short: 'Brecha de implementación',
    color: COLORS.tension,
    ink: '#260404',
    appear: 5,
    role: 'Trampa de política de mando y control vertical',
    text: 'Cuando la norma se impone de forma vertical sin incentivos locales, surge la evasión comunitaria, se degradan los humedales y se intensifica la fiscalización punitiva, destruyendo la confianza institucional acumulada.',
  },
  {
    id: 'policentrica',
    n: '06',
    title: 'Gobernanza policéntrica y co-custodia',
    short: 'Gobernanza policéntrica',
    color: COLORS.poly,
    ink: '#031c12',
    appear: 6,
    role: 'Estrategia de transformación territorial',
    text: 'Superar la trampa mediante decisiones vinculantes de proximidad, incentivos económicos productivos (reciclaje tecnificado, agricultura urbana) y acuerdos de manejo compartido sobre bordes y rondas hídricas.',
  },
  {
    id: 'conductas',
    n: '07',
    title: 'Estados territoriales de conducta',
    short: 'Estados conductuales',
    color: COLORS.slate,
    ink: '#0f172a',
    appear: 7,
    role: 'Espacio de estados de la población',
    text: 'La población territorial transiciona estocásticamente entre cuatro estados: S1 Evasión agresiva, S2 Oportunismo pasivo, S3 Cumplimiento normativo y S4 Co-custodia activa de los bienes comunes.',
  },
  {
    id: 'dinamica',
    n: '08',
    title: 'Dinámica de agentes en el territorio de Kennedy',
    short: 'Dinámica territorial',
    color: COLORS.cyan,
    ink: '#031c26',
    appear: 8,
    role: 'Simulación interactiva de políticas y confianza',
    text: 'Auditoría en tiempo real de 80 agentes en Humedales La Vaca, El Burro, Patio Bonito y Corabastos: comprueba cómo cambian las conductas y la confianza ante variaciones de coerción, incentivos y latencia.',
  },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<SocialStageId, Stage>;

export const STEP_LABELS = [
  'Política humana',
  'Instancias normativas',
  'Mapeo institucional',
  'Prácticas cotidianas',
  'Tejido comunitario',
  'Brecha de implementación',
  'Gobernanza policéntrica',
  'Estados de conducta',
  'Dinámica en territorio',
  'Red propia de gobernanza',
];
export const N = STEP_LABELS.length;

// Columna vertical en la pantalla
export const SPINE: SocialStageId[] = ['humana', 'normativa', 'cotidiana', 'comunitaria', 'brecha', 'policentrica', 'conductas', 'dinamica'];
export const ACTIVE_BY_BEAT = [0, 1, 1, 2, 3, 4, 5, 6, 7, -1];

// Puntos geográficos y actores en el territorio de Kennedy
export const GEO = {
  alcaldia: { ll: P('ACT05'), label: 'Alcaldía Local · SDA / EAAB' },
  planeacion: { ll: P('ACT06'), label: 'SDP · Regulación e instrumentos POT' },
  idu: { ll: P('ACT07'), label: 'IDU · Infraestructura urbana' },
  jac: { ll: P('ACT02'), label: 'JAC Kennedy · Liderazgo barrial' },
  colectivos: { ll: P('ACT01'), label: 'Colectivos Ambientales' },
  patio: { ll: P('ECO03'), label: 'Economía popular · Patio Bonito' },
  corabastos: { ll: P('ECO01'), label: 'Corabastos · Central de abastos' },
  vaca: { ll: P('EEP02'), label: 'Humedal La Vaca · Borde habitado' },
  burro: { ll: P('EEP01'), label: 'Humedal El Burro · Ronda y presión' },
  techo: { ll: P('EEP03'), label: 'Humedal de Techo' },
  fucha: { ll: P('EEP04'), label: 'Ronda del Fucha' },
  tintal: { ll: P('AE15'), label: 'Eje Tintal · Barrios consolidados' },
} as const;
export type GeoId = keyof typeof GEO;

// Relaciones del Excel POT aplicadas al modelo social
export const SOCIAL_EDGES = [
  { id: 'EDG-S01', a: 'planeacion', b: 'alcaldia', tipo: 'Coordinación normativa distrital', tension: 'Baja' },
  { id: 'EDG-S02', a: 'alcaldia', b: 'jac', tipo: 'Presupuestos participativos y mediación', tension: 'Media' },
  { id: 'EDG-S03', a: 'alcaldia', b: 'colectivos', tipo: 'Mesas de humedal y acuerdos ambientales', tension: 'Media' },
  { id: 'EDG-S04', a: 'jac', b: 'patio', tipo: 'Organización vecinal y economía popular', tension: 'Baja' },
  { id: 'EDG-S05', a: 'colectivos', b: 'vaca', tipo: 'Veeduría y custodia comunitaria', tension: 'Baja' },
  { id: 'EDG-S06', a: 'colectivos', b: 'burro', tipo: 'Monitoreo ambiental de vertimientos', tension: 'Media' },
  { id: 'EDG-S07', a: 'corabastos', b: 'patio', tipo: 'Flujo informal y reciclaje de oficio', tension: 'Alta' },
  { id: 'EDG-S08', a: 'patio', b: 'vaca', tipo: 'Presión antrópica sobre borde de ronda', tension: 'Alta' },
  { id: 'EDG-S09', a: 'corabastos', b: 'burro', tipo: 'Impacto por residuos y transporte de carga', tension: 'Alta' },
] as const;

// Encuadres de cámara para cada fase
export const BOUNDS = {
  kennedy: [-74.186, 4.606, -74.126, 4.664] as [number, number, number, number],
  institucional: [-74.168, 4.622, -74.135, 4.648] as [number, number, number, number],
  bordes: [-74.172, 4.618, -74.142, 4.646] as [number, number, number, number],
  mediacion: [-74.166, 4.624, -74.142, 4.646] as [number, number, number, number],
  conflictos: [-74.175, 4.615, -74.138, 4.648] as [number, number, number, number],
};

// Estados conductuales detallados
export const BEHAVIOR_STATES = [
  { id: 'S1', label: 'S1 · Evasión / Extracción', desc: 'Desacato normativo forzado por vulnerabilidad de subsistencia y desconfianza.', color: '#f87171' },
  { id: 'S2', label: 'S2 · Oportunismo pasivo', desc: 'Acatamiento intermitente condicionado estrictamente a presencia o sanción policial.', color: '#fbbf24' },
  { id: 'S3', label: 'S3 · Cumplimiento normativo', desc: 'Cumplimiento estándar por inercia cívica o costo de la infracción legal.', color: '#60a5fa' },
  { id: 'S4', label: 'S4 · Co-custodia activa', desc: 'Apropiación comunitaria, cuidado de humedales y separación tecnificada de residuos.', color: '#34d399' },
];
