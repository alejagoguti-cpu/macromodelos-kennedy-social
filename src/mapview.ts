import maplibregl from 'maplibre-gl';
import { BOUNDS, COLORS } from './content';

type Box = [number, number, number, number];
export interface Pad { top: number; right: number; bottom: number; left: number }

// Mapa real de Kennedy sobre fondo transparente (el escenario oscuro con puntos queda debajo).
export class MapView {
  map: maplibregl.Map;
  ready: Promise<void>;
  constructor(el: HTMLElement, pad: Pad) {
    this.map = new maplibregl.Map({
      container: el,
      style: { version: 8, sources: {}, layers: [] },
      bounds: BOUNDS.kennedy,
      fitBoundsOptions: { padding: pad },
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });
    this.ready = new Promise((res) => {
      this.map.on('load', async () => {
        const geo = await fetch('./data/geo.json').then((r) => r.json());
        this.build(geo);
        res();
      });
    });
  }

  private build(geo: any) {
    const m = this.map;
    const polys = geo.cuerpos.features;
    const wet = (k: string) => ({ type: 'FeatureCollection', features: polys.filter((f: any) => f.properties.wet === k) });
    m.addSource('upl', { type: 'geojson', data: geo.upl });
    m.addSource('agua', { type: 'geojson', data: geo.agua });
    m.addSource('vias', { type: 'geojson', data: geo.vias });
    m.addSource('otros', { type: 'geojson', data: { type: 'FeatureCollection', features: polys.filter((f: any) => !['burro', 'vaca', 'techo'].includes(f.properties.wet)) } });
    for (const k of ['burro', 'vaca', 'techo']) m.addSource('w-' + k, { type: 'geojson', data: wet(k) as any });

    m.addLayer({ id: 'upl-f', type: 'fill', source: 'upl', paint: { 'fill-color': ['case', ['get', 'kennedy'], '#15151b', '#0b0b0e'], 'fill-opacity': 1 } });
    m.addLayer({ id: 'upl-l', type: 'line', source: 'upl', paint: { 'line-color': ['case', ['get', 'kennedy'], '#4d4d57', '#26262c'], 'line-width': ['case', ['get', 'kennedy'], 1.2, 0.6] } });
    m.addLayer({ id: 'vias', type: 'line', source: 'vias', filter: ['==', ['get', 'cls'], 'trunk'], paint: { 'line-color': '#7a7a7a', 'line-width': 1, 'line-opacity': 0 } });
    m.addLayer({ id: 'vias2', type: 'line', source: 'vias', filter: ['!=', ['get', 'cls'], 'trunk'], paint: { 'line-color': '#4a4a4a', 'line-width': 0.6, 'line-opacity': 0 } });
    m.addLayer({ id: 'otros-f', type: 'fill', source: 'otros', paint: { 'fill-color': COLORS.water, 'fill-opacity': 0 } });
    // red hídrica: líneas finas reales
    m.addLayer({ id: 'canal', type: 'line', source: 'agua', filter: ['==', ['get', 'kind'], 'canal'], paint: { 'line-color': COLORS.water, 'line-width': 0.8, 'line-opacity': 0 } });
    m.addLayer({ id: 'rio', type: 'line', source: 'agua', filter: ['==', ['get', 'kind'], 'rio'], paint: { 'line-color': COLORS.water, 'line-width': 1.3, 'line-opacity': 0 } });
    // rondas hídricas existentes
    m.addLayer({ id: 'rondas', type: 'line', source: 'agua', filter: ['==', ['get', 'kind'], 'rio'], paint: { 'line-color': COLORS.green, 'line-width': 5, 'line-opacity': 0, 'line-blur': 3 } }, 'canal');
    for (const k of ['burro', 'vaca', 'techo']) {
      m.addLayer({ id: 'wf-' + k, type: 'fill', source: 'w-' + k, paint: { 'fill-color': COLORS.water, 'fill-opacity': 0 } });
      m.addLayer({ id: 'wl-' + k, type: 'line', source: 'w-' + k, paint: { 'line-color': COLORS.water, 'line-width': 1.4, 'line-opacity': 0 } });
    }
  }

  set(id: string, prop: string, v: number, delay = 0, dur = 900) {
    const m = this.map;
    if (!m.getLayer(id)) return;
    m.setPaintProperty(id, prop + '-transition', { duration: dur, delay });
    m.setPaintProperty(id, prop, v);
  }

  // qué capas del mapa se ven en cada secuencia
  state(beat: number, sel: string | null = null) {
    const hidK = beat >= 2 ? 1 : 0;
    ['burro', 'vaca', 'techo'].forEach((k, i) => {
      this.set('wf-' + k, 'fill-opacity', hidK ? 0.35 : 0, hidK ? 200 + i * 200 : 0);
      this.set('wl-' + k, 'line-opacity', hidK ? 0.95 : 0, hidK ? 200 + i * 200 : 0);
    });
    this.set('rio', 'line-opacity', hidK ? 0.85 : 0, hidK ? 500 : 0, 800);
    this.set('canal', 'line-opacity', hidK ? 0.6 : 0, hidK ? 700 : 0, 800);
    this.set('otros-f', 'fill-opacity', hidK ? 0.15 : 0, hidK ? 500 : 0);
    this.set('rondas', 'line-opacity', hidK ? 0.45 : 0, hidK ? 400 : 0);
    const vias = beat >= 2 ? 1 : 0;
    this.set('vias', 'line-opacity', vias ? 0.75 : 0, 300);
    this.set('vias2', 'line-opacity', vias ? 0.45 : 0, 500);
  }

  fit(box: Box, pad: Pad, duration = 1800) {
    this.map.fitBounds(box, { padding: pad, duration, essential: true, maxZoom: 16 });
  }
  project(ll: [number, number]) {
    return this.map.project(ll);
  }
}
