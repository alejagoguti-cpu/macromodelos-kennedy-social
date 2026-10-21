# Red propia & Gobernanza · Macromodelos territoriales de Kennedy

Secuencia interactiva (React 19 + TypeScript + GSAP/ScrollTrigger + SVG + MapLibre GL JS + Three.js) que integra los **ocho macromodelos territoriales de Kennedy** con un motor computacional basado en agentes (**ABM**) de **Política Humana y Gobernanza Policéntrica**:

1. **01 · Ecocéntrico**: El territorio entendido como un sistema de interdependencias entre todas las formas de vida (marco general).
2. **02 · Hidrocéntrico**: El agua y la red hídrica como estructura ordenadora del territorio (Humedales El Burro, La Vaca, Techo, Ronda del Fucha).
3. **03 · Regenerativo**: Restauración de ecosistemas degradados y conectividad ecológica.
4. **04 · Comercio ecológico y autonomía territorial**: Fortalecimiento de la economía popular de proximidad (Corabastos y Patio Bonito).
5. **05 · Circularidad**: Reincorporación de residuos orgánicos a nuevos ciclos productivos (sin cantidades estimadas).
6. **06 · Límites ecológicos**: Criterio transversal que condiciona las actividades y movilidad a la capacidad de carga del territorio.
7. **07 · Biocéntrico**: Criterio transversal de evaluación que prioriza la continuidad de las formas de vida (fauna endémica, Tingua Bogotana).
8. **08 · Social y Política Humana**: Nodos de decisión vs. vectores de ejecución, desacople normativo-operativo y transición hacia la **gobernanza policéntrica y co-custodia comunitaria**.

---

## Macromodelo Social y Motor ABM (Teoría de Juegos y Elección Discreta)

El modelo social formaliza la red de actores mediante tres niveles ontológicos:
- **Macro (Decisores Normativos)**: SDP, SDA, IDU, Alcaldía Local de Kennedy (presupuesto $B_d$, intensidad de fiscalización $\Phi_d$, apertura a co-inversión $G_d$, latencia institucional $\tau_d$).
- **Meso (Articuladores / Mediadores)**: Juntas de Acción Comunal (JAC), Mesas de Humedal, Colectivos Ambientales (legitimidad $L_m$, capacidad de interlocución $A_m$, índice de fatiga $D_m$).
- **Micro (Ejecutores Operativos)**: Residentes de borde, recicladores de oficio, comercio informal (vulnerabilidad $V_i$, recursos $R_i$, confianza institucional $T_i$, capital social local $C_i$).

### Espacio de Estados Conductuales:
- **$S_1$**: Evasión / Extracción agresiva (desacato forzado por vulnerabilidad).
- **$S_2$**: Oportunismo pasivo (cumplimiento intermitente atado a vigilancia policial).
- **$S_3$**: Cumplimiento normativo estándar.
- **$S_4$**: Co-custodia activa (acuerdos comunitarios, cuidado de rondas, separación tecnificada).

### Formulación Matemática:
1. **Utilidad esperada (Multinomial Logit):**
   $$U_i(S_k) = w_1 \cdot \Pi_{\text{econ}}(S_k, V_i) + w_2 \cdot \Gamma_{\text{social}}(S_k, C_i) + w_3 \cdot \Omega_{\text{norm}}(S_k, T_i, \Phi_d) - \kappa(S_k)$$

2. **Probabilidad de Boltzmann:**
   $$P_i(S_t \to S_k) = \frac{\exp(\beta \cdot U_i(S_k))}{\sum_{j=1}^4 \exp(\beta \cdot U_i(S_j))}$$

3. **Memoria Dinámica de Confianza y Escudo Meso:**
   $$T_i(t+1) = (1 - \lambda_T) T_i(t) + \alpha \cdot \text{Cumplimiento} - \gamma (1 - L_m) \cdot \text{Traición}$$

---

## Navegación e Interactividad
- **Secuencia guiada**: Scroll vertical, flechas del teclado o clics en tarjetas.
- **Laboratorio ABM interactivo**: En la secuencia 08 (o desde el modo explorar), permite modificar en tiempo real la fiscalización $\Phi_d$, los incentivos de co-manejo $G_d$, la latencia institucional $\tau_d$ y la legitimidad local $L_m$, observando la transición de 80 agentes geolocalizados en Kennedy.
- **Doble visor cartográfico**: Alterna entre el **Mapa 2D (MapLibre)** y el **Kennedy 3D (Three.js)**.
- **Red propia orbital (Secuencia final)**: Clic en cualquier macromodelo para auditar sus dependencias territoriales y relaciones cruzadas.

---

## Fuentes de Datos
- Cartografía: OpenStreetMap (Overpass API) © colaboradores de OpenStreetMap (ODbL).
- Topología territorial, nodos y aristas: `src/data/proyecto.json` derivado de `red-pot-kennedy-visor.xlsx`.
- Instrumentos de planeación: UPL y POT Bogotá (Decreto 555 de 2021).
- Marco conceptual de dinámica de actores: Modelamiento de Sistemas Complejos y Gobernanza Policéntrica.

---

## Desarrollo Local
```bash
npm install
npm run dev      # Servidor de desarrollo local (Vite)
npm run build    # Compila a producción en /docs (apto para GitHub Pages)
```
