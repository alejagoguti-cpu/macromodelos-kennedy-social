# Macromodelo Social · Política Humana y Red de Actores Territoriales de Kennedy

Secuencia interactiva y espacial (React 19 + TypeScript + GSAP/ScrollTrigger + SVG + MapLibre GL JS + Three.js) dedicada **exclusivamente al Macromodelo Social de Kennedy**: la ontología de quiénes toman decisiones y quiénes las ejecutan, las tensiones territoriales y la transición hacia la **gobernanza policéntrica y co-custodia de los bienes comunes**.

---

## 1. Estructura Conceptual y Secuencia

El recorrido despliega la arquitectura de relaciones sociales sobre el territorio real de Kennedy:

1. **01 · Política humana y agencia distribuida**:
   El territorio como un sistema de agencia distribuida. La organización social no es estática, sino que emerge de las tensiones continuas entre regulación, mediación y apropiación material.
2. **02 · Instancias normativas y de regulación**:
   Nodos distritales formales (SDP, SDA, IDU, Alcaldía Local). Asignación presupuestal, zonificación POT e instrumentos normativos; caracterizados por la desconexión fenoménica con el ritmo barrial.
3. **03 · Mapeo institucional en Kennedy**:
   Anclaje espacial en el mapa y modelo 3D de las sedes distritales y su radio de incidencia.
4. **04 · Comunidades y prácticas cotidianas**:
   Vectores de custodia y uso efectivo del suelo: residentes de borde de humedal (La Vaca y El Burro), recicladores de oficio y comercio popular en Patio Bonito y Corabastos.
5. **05 · Tejido comunitario y mediación barrial**:
   Juntas de Acción Comunal (JACs), mesas ambientales de humedal y colectivos vecinales. Nodos puente que traducen la norma y aportan legitimidad de proximidad ($L_m$).
6. **06 · La brecha de implementación (El bucle destructivo)**:
   La trampa del mando y control vertical: regulación punitiva sin alternativas $\to$ resistencia y evasión $\to$ deterioro ambiental de humedales $\to$ mayor sanción y erosión acelerada de la confianza.
7. **07 · Gobernanza policéntrica y co-custodia**:
   La alternativa virtuosa: acuerdos de manejo comunitario, descentralización vinculante de proximidad, incentivos económicos productivos y custodia compartida de rondas y bordes.
8. **08 · Estados territoriales de conducta**:
   Espacio conductual de la población:
   - **$S_1$ Evasión / Extracción agresiva** (desacato forzado por necesidad de subsistencia).
   - **$S_2$ Oportunismo pasivo** (cumplimiento condicionado a fiscalización inmediata).
   - **$S_3$ Cumplimiento normativo estándar** (inercia cívica o costo coercitivo).
   - **$S_4$ Co-custodia activa** (acuerdos barriales, cuidado de rondas, separación tecnificada).
9. **09 · Dinámica de agentes en territorio**:
   Simulación integrada en el mapa y canvas 3D con 70 agentes geolocalizados en los bordes de humedal, Patio Bonito y Corabastos. Control mediante un HUD arquitectónico sobrio e integrado.
10. **10 · Red propia de gobernanza**:
    Topología completa de la red social de Kennedy en disposición orbital, con modo interactivo para auditar relaciones y anclajes geográficos.

---

## 2. Marco Matemático del Motor ABM (Teoría de Juegos y Elección Discreta)

### Función de Utilidad Esperada (Multinomial Logit):
$$U_i(S_k) = w_1 \cdot \Pi_{\text{econ}}(S_k, V_i) + w_2 \cdot \Gamma_{\text{social}}(S_k, C_i) + w_3 \cdot \Omega_{\text{norm}}(S_k, T_i, \Phi_d) - \kappa(S_k)$$

- $\Pi_{\text{econ}}$: Retorno material según la vulnerabilidad $V_i$.
- $\Gamma_{\text{social}}$: Conformidad y presión social comunitaria según capital social $C_i$.
- $\Omega_{\text{norm}}$: Expectativa de cumplimiento y sanción según confianza $T_i$ y fiscalización $\Phi_d$.
- $\kappa(S_k)$: Costo de transacción o esfuerzo operativo.

### Probabilidad de Transición (Boltzmann):
$$P_i(S_t \to S_k) = \frac{\exp(\beta \cdot U_i(S_k))}{\sum_{j=1}^4 \exp(\beta \cdot U_i(S_j))}$$

### Dinámica de Confianza y Amortiguación Comunitaria:
$$T_i(t+1) = (1 - \lambda_T) T_i(t) + \alpha \cdot \text{Cumplimiento} - \gamma (1 - L_m) \cdot \text{Traición}$$

El tejido comunitario ($L_m$) actúa como amortiguador: cuando existe legitimidad barrial alta, la comunidad preserva la confianza y la cooperación frente a la lentitud o fricciones del nivel distrital.

---

## 3. Desarrollo y Despliegue

```bash
npm install
npm run dev      # Servidor local con Vite
npm run build    # Compilación a /docs para GitHub Pages
```

- **Repositorio:** [github.com/alejagoguti-cpu/macromodelos-kennedy-social](https://github.com/alejagoguti-cpu/macromodelos-kennedy-social)
- **Despliegue:** [alejagoguti-cpu.github.io/macromodelos-kennedy-social/](https://alejagoguti-cpu.github.io/macromodelos-kennedy-social/)
