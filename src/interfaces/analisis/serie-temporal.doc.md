# Serie Temporal

**Entidad:** `ISerieTemporal`
**Contexto:** Análisis
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa un **conjunto ordenado de lecturas** de un mismo punto de medición durante un período específico. Es útil para análisis de tendencias, comparaciones y visualizaciones.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idPuntoMedicion` | De qué punto son las lecturas | "pm-perf-001" |
| `tipoLectura` | Qué variable (opcional) | "Perforación Caudal" |
| `fechaInicio` | Inicio del período | "2025-11-04T00:00:00Z" |
| `fechaFin` | Fin del período | "2025-11-04T23:59:59Z" |
| `lecturas` | Array de lecturas ordenadas | [...] |
| `estadisticas` | Métricas agregadas | Ver abajo |

---

## 💡 Ejemplo: Serie Temporal Perforación Edén

```yaml
Serie Temporal:
  Punto: Perforación Edén (pm-perf-001)
  Tipo Lectura: "Perforación Caudal"

  Período:
    Inicio: 2025-11-04 00:00:00
    Fin:    2025-11-04 23:59:59

  Lecturas: [288 lecturas cada 5 minutos]
    - 00:00: 42 m³/h
    - 00:05: 43 m³/h
    - 00:10: 42 m³/h
    ... (288 lecturas total)

  Estadísticas:
    cantidad: 288
    minimo: 38 m³/h
    maximo: 48 m³/h
    promedio: 42.5 m³/h
    mediana: 42 m³/h
    desviacionEstandar: 2.1
    cantidadInterpoladas: 2
    cantidadErrores: 0

  Generado en: 2025-11-05 00:01:00
  Duración Query: 145 ms
```

---

## 🔗 Se relaciona con

- **Punto de Medición:** De dónde vienen las lecturas
- **Lecturas:** Los valores individuales
- **Dashboard:** Para gráficas y visualizaciones

---

## 💡 Casos de Uso

**Gráficas en Dashboard:**
Visualizar caudal de perforación durante el día

**Análisis de Tendencias:**
Comparar consumo de noviembre vs octubre

**Detección de Patrones:**
Identificar horas pico de consumo

**Exportación:**
Generar reportes Excel/PDF con datos históricos

---

**Ver:** `serie-temporal.ts` para definición técnica completa
