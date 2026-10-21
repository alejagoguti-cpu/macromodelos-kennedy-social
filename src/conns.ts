import { COLORS, GEO, SOCIAL_EDGES, STAGE_MAP, type GeoId, type SocialStageId } from './content';

export interface Conn {
  id: string;
  a: string;
  b: string;
  color: string;
  dashed?: boolean;
  arrow?: boolean;
  min: number;
  max: number;
  stages: SocialStageId[];
  delay?: number;
  label?: string;
  title?: string;
  bulge?: boolean;
  kind?: 'tension' | 'agreement';
  exp?: boolean;
}

const C = COLORS;
export const CONNS: Conn[] = [];
const add = (c: Conn) => CONNS.push(c);

// ---- Columna vertical progresiva (secuencias 1 a 8)
add({ id: 's-hum-norm', a: 'c:humana:b', b: 'c:normativa:t', color: C.cream, arrow: true, min: 1, max: 8, delay: 0.8, stages: ['humana', 'normativa'] });
add({ id: 's-norm-cot', a: 'c:normativa:b', b: 'c:cotidiana:t', color: C.norm, arrow: true, min: 3, max: 8, delay: 0.7, stages: ['normativa', 'cotidiana'] });
add({ id: 's-cot-com', a: 'c:cotidiana:b', b: 'c:comunitaria:t', color: C.custody, arrow: true, min: 4, max: 8, delay: 0.7, stages: ['cotidiana', 'comunitaria'] });
add({ id: 's-com-bre', a: 'c:comunitaria:b', b: 'c:brecha:t', color: C.bridge, arrow: true, min: 5, max: 8, delay: 0.7, stages: ['comunitaria', 'brecha'] });
add({ id: 's-bre-pol', a: 'c:brecha:b', b: 'c:policentrica:t', color: C.tension, arrow: true, min: 6, max: 8, delay: 0.7, stages: ['brecha', 'policentrica'] });
add({ id: 's-pol-con', a: 'c:policentrica:b', b: 'c:conductas:t', color: C.poly, arrow: true, min: 7, max: 8, delay: 0.7, stages: ['policentrica', 'conductas'] });
add({ id: 's-con-din', a: 'c:conductas:b', b: 'c:dinamica:t', color: C.slate, arrow: true, min: 8, max: 8, delay: 0.7, stages: ['conductas', 'dinamica'] });

// ---- Secuencia 2: Instancias normativas distritales
add({ id: 'n-plan', a: 'c:normativa:r', b: 'g:planeacion', color: C.norm, min: 2, max: 2, delay: 0.5, stages: ['normativa'], title: 'SDP: formulación de instrumentos POT y normas de uso del suelo' });
add({ id: 'n-alc', a: 'c:normativa:r', b: 'g:alcaldia', color: C.norm, min: 2, max: 2, delay: 0.9, stages: ['normativa'], title: 'Alcaldía Local / SDA / EAAB: gestión administrativa y policiva' });
add({ id: 'n-idu', a: 'c:normativa:r', b: 'g:idu', color: C.norm, min: 2, max: 2, delay: 1.3, stages: ['normativa'], title: 'IDU: diseño y ejecución de obras viales e infraestructura pública' });
add({ id: 'n-rel-plan-alc', a: 'g:planeacion', b: 'g:alcaldia', color: C.norm, dashed: true, min: 2, max: 2, delay: 1.6, stages: ['normativa'], title: 'Articulación interinstitucional distrital' });

// ---- Secuencia 3: Comunidades y prácticas cotidianas
add({ id: 'c-patio', a: 'c:cotidiana:r', b: 'g:patio', color: C.custody, min: 3, max: 3, delay: 0.5, stages: ['cotidiana'], title: 'Economía popular en Patio Bonito y María Paz: comercio informal y vivienda' });
add({ id: 'c-cora', a: 'c:cotidiana:r', b: 'g:corabastos', color: C.custody, min: 3, max: 3, delay: 0.9, stages: ['cotidiana'], title: 'Corabastos: principal nodo de abastecimiento de alimentos y generación orgánica' });
add({ id: 'c-vaca', a: 'c:cotidiana:r', b: 'g:vaca', color: C.custody, min: 3, max: 3, delay: 1.3, stages: ['cotidiana'], title: 'Borde habitado Humedal La Vaca: asentamiento continuo y presión de ocupación' });
add({ id: 'c-burro', a: 'c:cotidiana:r', b: 'g:burro', color: C.custody, min: 3, max: 3, delay: 1.6, stages: ['cotidiana'], title: 'Ronda Humedal El Burro: vertimientos y depósito no formal de escombros' });

// ---- Secuencia 4: Tejido comunitario y mediación barrial
add({ id: 'm-jac', a: 'c:comunitaria:r', b: 'g:jac', color: C.bridge, min: 4, max: 4, delay: 0.5, stages: ['comunitaria'], title: 'Juntas de Acción Comunal: representatividad barrial y convocatoria' });
add({ id: 'm-col', a: 'c:comunitaria:r', b: 'g:colectivos', color: C.bridge, min: 4, max: 4, delay: 0.9, stages: ['comunitaria'], title: 'Colectivos Ambientales y Mesas de Humedal: pedagogía y defensa territorial' });
add({ id: 'm-jac-pat', a: 'g:jac', b: 'g:patio', color: C.bridge, arrow: true, min: 4, max: 4, delay: 1.4, stages: ['comunitaria'], title: 'Canal de mediación entre vecinos organizados y comercio popular' });
add({ id: 'm-col-vac', a: 'g:colectivos', b: 'g:vaca', color: C.bridge, arrow: true, min: 4, max: 4, delay: 1.7, stages: ['comunitaria'], title: 'Articulación de vecinos custodios con el humedal' });

// ---- Secuencia 5: La Brecha de Implementación (Tensiones y bucle de castigo)
add({ id: 'b-card', a: 'c:brecha:r', b: 'g:alcaldia', color: C.tension, min: 5, max: 5, delay: 0.4, stages: ['brecha'] });
add({ id: 'b-alc-pat', a: 'g:alcaldia', b: 'g:patio', color: C.tension, dashed: true, arrow: true, min: 5, max: 5, delay: 0.8, stages: ['brecha'], kind: 'tension', title: 'Operativos de desalojo e incautación sin alternativas económicas (tensión)' });
add({ id: 'b-alc-vac', a: 'g:alcaldia', b: 'g:vaca', color: C.tension, dashed: true, arrow: true, min: 5, max: 5, delay: 1.1, stages: ['brecha'], kind: 'tension', title: 'Sanciones policivas sobre construcciones en ronda hídrica' });
add({ id: 'b-pat-vac', a: 'g:patio', b: 'g:vaca', color: C.tension, arrow: true, min: 5, max: 5, delay: 1.4, stages: ['brecha'], kind: 'tension', title: 'Resistencia: ocupación informal persistente por necesidad de subsistencia' });

// ---- Secuencia 6: Gobernanza Policéntrica y Co-custodia
add({ id: 'p-card', a: 'c:policentrica:r', b: 'g:jac', color: C.poly, min: 6, max: 6, delay: 0.4, stages: ['policentrica'] });
add({ id: 'p-alc-jac', a: 'g:alcaldia', b: 'g:jac', color: C.poly, arrow: true, min: 6, max: 6, delay: 0.8, stages: ['policentrica'], kind: 'agreement', title: 'Acuerdos de manejo compartido y presupuestos participativos de proximidad' });
add({ id: 'p-alc-col', a: 'g:alcaldia', b: 'g:colectivos', color: C.poly, arrow: true, min: 6, max: 6, delay: 1.1, stages: ['policentrica'], kind: 'agreement', title: 'Reconocimiento formal de veedurías y co-manejo ambiental' });
add({ id: 'p-col-vac', a: 'g:colectivos', b: 'g:vaca', color: C.poly, arrow: true, min: 6, max: 6, delay: 1.4, stages: ['policentrica'], kind: 'agreement', title: 'Co-custodia activa: reforestación y vallados vivos comunitarios' });
add({ id: 'p-col-bur', a: 'g:colectivos', b: 'g:burro', color: C.poly, arrow: true, min: 6, max: 6, delay: 1.7, stages: ['policentrica'], kind: 'agreement', title: 'Separación y compostaje comunitario de residuos orgánicos' });

// ---- Secuencia 7: Estados territoriales de conducta
add({ id: 'st-card', a: 'c:conductas:r', b: 'g:patio', color: C.slate, min: 7, max: 7, delay: 0.4, stages: ['conductas'] });
add({ id: 'st-pat-vac', a: 'g:patio', b: 'g:vaca', color: C.slate, dashed: true, min: 7, max: 7, delay: 0.8, stages: ['conductas'], title: 'Transición conductual de los pobladores de borde según incentivos' });
add({ id: 'st-col-bur', a: 'g:colectivos', b: 'g:burro', color: C.poly, arrow: true, min: 7, max: 7, delay: 1.2, stages: ['conductas'], title: 'Transformación hacia el estado S4 (Co-custodia)' });

// ---- Secuencia 9: Red propia orbital de gobernanza
add({ id: 'r-hum-norm', a: 'o:humana', b: 'o:normativa', color: C.cream, arrow: true, min: 9, max: 9, delay: 0.8, stages: ['humana', 'normativa'] });
add({ id: 'r-norm-pol', a: 'o:normativa', b: 'o:policentrica', color: C.norm, arrow: true, min: 9, max: 9, delay: 1.1, stages: ['normativa', 'policentrica'], title: 'Descentralización normativa hacia la gobernanza policéntrica' });
add({ id: 'r-com-pol', a: 'o:comunitaria', b: 'o:policentrica', color: C.bridge, arrow: true, min: 9, max: 9, delay: 1.4, stages: ['comunitaria', 'policentrica'], title: 'El tejido barrial sostiene la legitimidad de los acuerdos' });
add({ id: 'r-cot-pol', a: 'o:cotidiana', b: 'o:policentrica', color: C.custody, arrow: true, min: 9, max: 9, delay: 1.7, stages: ['cotidiana', 'policentrica'], title: 'Las comunidades cotidianas materializan la co-custodia efectiva' });
add({ id: 'r-bre-pol', a: 'o:brecha', b: 'o:policentrica', color: C.tension, dashed: true, arrow: true, min: 9, max: 9, delay: 2.0, stages: ['brecha', 'policentrica'], title: 'Superación del bucle destructivo punitivo' });
add({ id: 'r-pol-con', a: 'o:policentrica', b: 'o:conductas', color: C.poly, arrow: true, min: 9, max: 9, delay: 2.3, stages: ['policentrica', 'conductas'], title: 'Gobernanza como inductora del estado S4' });

// Anclajes territoriales en la Red Propia para el modo explorar
for (const o of CONNS.slice()) {
  if (o.max === 9 || !(o.a.startsWith('g:') || o.b.startsWith('g:'))) continue;
  add({ ...o, id: o.id + '-net', a: o.a.startsWith('c:') ? 'o:' + o.a.split(':')[1] : o.a, min: 9, max: 9, exp: true });
}

// Relaciones narradas para el modo explorar (clic en cualquier nodo orbital)
export const STAGE_RELATIONS: Record<SocialStageId, { rel: [SocialStageId, string][]; geo: GeoId[] }> = {
  humana: {
    rel: [
      ['normativa', 'enmarca las capacidades de regulación'],
      ['cotidiana', 'reconoce la agencia material en territorio'],
      ['comunitaria', 'destaca el valor del tejido barrial'],
      ['policentrica', 'orienta el orden hacia la co-custodia'],
    ],
    geo: ['alcaldia', 'jac', 'patio', 'vaca', 'corabastos'],
  },
  normativa: {
    rel: [
      ['humana', 'fundamento ético y social de la planeación'],
      ['policentrica', 'transfiere capacidad vinculante de proximidad'],
      ['brecha', 'el mando vertical genera la trampa de política'],
    ],
    geo: ['planeacion', 'alcaldia', 'idu'],
  },
  cotidiana: {
    rel: [
      ['humana', 'sujetos vivos de la apropiación espacial'],
      ['comunitaria', 'articulación con JACs y colectivos'],
      ['policentrica', 'recibe compensaciones e incentivos de custodia'],
      ['conductas', 'adopta estados desde S1 hasta S4'],
    ],
    geo: ['patio', 'corabastos', 'vaca', 'burro'],
  },
  comunitaria: {
    rel: [
      ['normativa', 'interlocución técnica con entidades'],
      ['cotidiana', 'legitimidad barrial directa'],
      ['policentrica', 'núcleo mediador que amortigua la desconfianza'],
    ],
    geo: ['jac', 'colectivos'],
  },
  brecha: {
    rel: [
      ['normativa', 'origen en la imposición sin alternativas'],
      ['cotidiana', 'resistencia y evasión forzada'],
      ['policentrica', 'antítesis y salida constructiva'],
    ],
    geo: ['alcaldia', 'patio', 'vaca'],
  },
  policentrica: {
    rel: [
      ['normativa', 'apertura a convenios de co-manejo'],
      ['comunitaria', 'empoderamiento del tejido vecinal'],
      ['cotidiana', 'conversión de evasores en custodios'],
      ['conductas', 'maximiza la adopción de S4'],
    ],
    geo: ['alcaldia', 'jac', 'colectivos', 'vaca', 'burro', 'patio'],
  },
  conductas: {
    rel: [
      ['policentrica', 'incentivos que tornan óptima la co-custodia'],
      ['brecha', 'la coerción sin incentivos perpetúa S1'],
      ['cotidiana', 'reflejo directo de la vida comunitaria'],
    ],
    geo: ['patio', 'vaca', 'burro', 'corabastos'],
  },
  dinamica: {
    rel: [
      ['conductas', 'simula transiciones estocásticas Boltzmann'],
      ['policentrica', 'verifica el impacto de las políticas públicas'],
      ['cotidiana', 'espacialización de agentes en Kennedy'],
    ],
    geo: ['vaca', 'burro', 'patio', 'corabastos', 'tintal'],
  },
  red: {
    rel: [
      ['policentrica', 'articulación integral del sistema social'],
      ['comunitaria', 'red viva de gobernanza territorial'],
    ],
    geo: ['alcaldia', 'planeacion', 'jac', 'colectivos', 'patio', 'corabastos', 'vaca', 'burro'],
  },
};
