# Anomalía

**Entidad:** `IAnomalia`
**Contexto:** Análisis
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa una **situación anormal** detectada en la operación del sistema que requiere atención. Pueden ser fugas, fallos de equipos, consumos anormales, problemas de calidad de agua, etc.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `tipo` | Tipo de anomalía | "fuga" / "consumo_anormal" / "caida_presion" / etc. |
| `severidad` | Qué tan grave es | "baja" / "media" / "alta" / "crítica" |
| `estado` | Fase del ciclo de vida | "detectada" / "investigando" / "confirmada" / "resuelta" |
| `momentoDeteccion` | Cuándo se detectó | "2025-11-04T14:30:00Z" |
| `descripcion` | Qué pasó | "Pérdidas 35% en Distrito Edén (umbral: 25%)" |
| `metodoDeteccion` | Cómo se detectó | "automatico" / "manual" / "reporte_ciudadano" |
| `perdidaEstimada` | m³ perdidos | 180 m³ |
| `usuarioAsignado` | Quién la atiende | "tecnico.rodriguez@ose.com.uy" |

---

## 💡 Ejemplo: Fuga en Red de Distribución

```yaml
Anomalía:
  ID: anom-001
  Cliente: OSE Uruguay
  Distrito: Distrito Pitométrico Edén

  Tipo: fuga
  Severidad: alta
  Estado: confirmada

  Momento Detección: 2025-11-04 14:30:00
  Método Detección: automatico (balance hídrico)

  Descripción:
    "Pérdidas detectadas: 35% (umbral: 25%)
     Balance diario: 180 m³ de pérdidas vs 280 m³ promedio
     Posible fuga en red de distribución zona norte"

  Pérdida Estimada: 180 m³/día
  Población Afectada: 0 (no hay cortes de servicio)

  Ubicación Estimada:
    lat: -34.6500, lng: -54.7200
    referencia: "Zona norte de Pueblo Edén"

  Asignado a: tecnico.rodriguez@ose.com.uy
  Fecha Asignación: 2025-11-04 15:00:00

  Historial de Acciones:
    - 14:30: Sistema detecta anomalía automáticamente
    - 15:00: Asignada a técnico Rodríguez
    - 15:30: Técnico inicia inspección visual
    - 16:45: Fuga confirmada en Calle Principal esquina 1ra
    - 17:00: Cuadrilla despachada
    - 18:30: Fuga reparada
    - 19:00: Anomalía marcada como "resuelta"
```

---

## ⚙️ Tipos de Anomalías

**Fugas:**
- En red de distribución
- En conexiones domiciliarias
- En infraestructura (boosters, depósitos)

**Operacionales:**
- Caída de presión
- Fallo de equipos
- Medidores sin comunicación

**Calidad del Agua:**
- Caída de cloro residual
- pH fuera de rango
- Turbidez elevada

**Consumo:**
- Consumo anormal (pico inusual)
- Consumo continuo (posible fuga domiciliaria)

---

## ⚙️ Ciclo de Vida

```
DETECTADA → INVESTIGANDO → CONFIRMADA → RESUELTA
               ↓
           FALSA_ALARMA
```

---

## ⚙️ SLA por Severidad

| Severidad | Respuesta | Resolución | Ejemplo |
|-----------|-----------|------------|---------|
| Crítica | <15 min | <2 horas | Fuga masiva, población sin agua |
| Alta | <1 hora | <24 horas | Fuga importante, caída presión |
| Media | <4 horas | <3 días | Consumo anormal, medidor error |
| Baja | <24 horas | <1 semana | Sin comunicación esporádico |

---

## 👥 ¿Quién la usa?

**Sistema de Detección:** Genera anomalías automáticamente al detectar patrones anormales

**Operadores OSE:** Investigan, confirman y resuelven anomalías

**Dashboard:** Muestra anomalías activas y su estado

---

**Ver:** `anomalia.ts` para definición técnica completa
