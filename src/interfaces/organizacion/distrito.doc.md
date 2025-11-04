# Distrito Pitométrico

**Entidad:** `IDistrito`
**Contexto:** Organización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa una zona geográfica **delimitada** de la red de distribución de agua donde se calcula el balance hídrico (entrada vs salida). Es la unidad fundamental para control de pérdidas de agua.

**Concepto clave:** Un distrito pitométrico es un "sector hidráulico aislado" con puntos de entrada y salida medidos, que permite calcular cuánta agua se pierde en esa zona.

---

## 🏗️ ¿Para qué sirve?

El objetivo principal del proyecto OSE Maldonado es implementar **distritos pitométricos inteligentes** para detectar y reducir pérdidas de agua.

### ¿Qué es un Distrito Pitométrico?

Es una zona de la red de agua con:
1. **Límites definidos** (físicos o virtuales)
2. **Puntos de entrada medidos** (macromedidores de entrada)
3. **Puntos de salida medidos** (consumos)
4. **Control de válvulas** para aislar el sector

**Fórmula del Balance:**
```
Agua Entrada - Agua Salida - Consumo Autorizado No Medido = PÉRDIDAS

Eficiencia (%) = (Agua Salida / Agua Entrada) × 100
```

### Beneficios:
- **Detección temprana de fugas**: días → minutos
- **Cuantificación de pérdidas**: saber exactamente cuánto se pierde
- **Localización**: saber dónde ocurren las pérdidas
- **Seguimiento**: medir mejoras en el tiempo

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idJefatura` | A qué jefatura pertenece | "jef-eden" |
| `nombre` | Nombre del distrito | "Distrito Pitométrico Pueblo Edén" |
| `codigo` | Código identificador | "DMA-EDEN-01" |
| `estado` | Fase de implementación | "operativo" |
| `frontera` | Delimitación geográfica | Polígono, círculo, puntos |
| `poblacion` | Habitantes servidos | 1200 |
| `conexiones` | Cantidad de conexiones | 350 |
| `redKm` | Kilómetros de tubería | 15 km |
| `configuracionBalance` | Parámetros de cálculo | Ver ejemplos |

---

## 💡 Ejemplo Real: Distrito Pitométrico Pueblo Edén

```yaml
Distrito Pitométrico:
  ID: distrito-eden
  Cliente: OSE Uruguay
  División: UGD Maldonado
  Jefatura: Pueblo Edén

  Nombre: "Distrito Pitométrico Pueblo Edén"
  Código: "DMA-EDEN-01"
  Descripción: "Primer distrito pitométrico inteligente de OSE Maldonado"

  Estado: operativo
  Fecha Implementación: 2025-12-01

  # Delimitación geográfica
  Frontera:
    tipo: polygon
    coordenadas:
      - lat: -34.6500, lng: -54.7200  # Punto norte
      - lat: -34.6550, lng: -54.7150  # Punto este
      - lat: -34.6580, lng: -54.7220  # Punto sur
      - lat: -34.6530, lng: -54.7270  # Punto oeste
    area_km2: 2.5

  # Características operacionales
  Población: 1200 habitantes
  Conexiones: 350 (95 telemedidas + 255 sin telemedir)
  Red de distribución: 15 km
  Tipo de zona: "rural/semi-urbano"

  # Configuración del balance hídrico
  Configuración Balance:
    horaInicioBalance: "00:00"  # Inicio del día
    periodoBalance: "diario"     # Calcular balance cada día
    umbralPerdidas: 25           # % - Alerta si pérdidas > 25%
    metodoCalculo: "avanzado"    # Considera consumo no medido estimado

    # Meta de eficiencia
    eficienciaActual: 67%
    eficienciaObjetivo: 72%      # Meta del piloto: +5 puntos
    plazoPiloto: "6 meses"

  # Puntos de medición del distrito
  Puntos de Entrada (Producción):
    - Perforación Edén (pm-perf-001)
      • Caudal máximo: 50 m³/h
      • Fuente de datos: Zeus SCADA
      • Frecuencia: cada 5 minutos

  Puntos de Salida (Consumo):
    - 95 Medidores residenciales telemedidos
      • Fuente de datos: ATLAS
      • Frecuencia: cada 10 minutos
    - 255 Medidores sin telemedir
      • Lectura manual mensual
      • Estimación diaria por interpolación

  Consumo Autorizado No Medido:
    - Fuente pública (plaza)
    - Lavado de calles
    - Estimado: 2 m³/día

  # Resultados actuales
  Balance Último Período (día 2025-11-03):
    Entrada: 850 m³
    Salida medida: 570 m³
    Consumo no medido: 2 m³
    Pérdidas: 278 m³ (33%)
    Eficiencia: 67%
```

---

## 🔗 Se relaciona con

- **Jefatura** (`IJefatura`): A qué centro operativo pertenece
- **División y Cliente**: Herencia jerárquica
- **Puntos de Medición** (`IPuntoMedicion`): Los puntos que forman parte del distrito
- **Balance Hídrico** (`IBalanceHidrico`): Los cálculos periódicos del distrito
- **Anomalías** (`IAnomalia`): Fugas y problemas detectados en el distrito

**Flujo operativo:**
```
Distrito Pitométrico Edén
  ├─ ENTRADA: Perforación Edén (macromedidor)
  │   └─ Lecturas cada 5 min → Zeus SCADA
  │
  ├─ SALIDA: 95 medidores residenciales
  │   └─ Lecturas cada 10 min → ATLAS
  │
  └─ BALANCE: Cada 15 minutos
      ├─ Entrada: 850 m³/día
      ├─ Salida: 570 m³/día
      ├─ Pérdidas: 280 m³/día (33%)
      └─ Si pérdidas > 25% → ALERTA
```

---

## ⚙️ Estados del Distrito

### `implementando`
Distrito en fase de construcción/preparación.

**Actividades:**
- Instalación de macromedidores de entrada
- Instalación de medidores de salida
- Delimitación de frontera
- Configuración de válvulas

### `operativo`
Distrito funcionando normalmente, calculando balance.

**Requisitos:**
- Al menos 80% de puntos con lecturas
- Macromedidores de entrada operativos
- Configuración de balance definida

### `suspendido`
Distrito temporalmente fuera de servicio.

**Razones:**
- Mantenimiento mayor
- Reconfiguración de red
- Problemas técnicos

---

## ⚙️ Reglas de Negocio

### 1. Debe tener al menos un punto de entrada
Un distrito sin entrada no puede calcular balance.

### 2. Debe tener al menos un punto de salida
Un distrito sin salida no puede calcular balance.

### 3. Límites no deben superponerse
Dos distritos de la misma división no pueden tener fronteras superpuestas (causaría ambigüedad en balance).

### 4. Balance válido requiere cobertura mínima
Para que un balance sea confiable:
- ✅ Al menos 80% de medidores con lecturas
- ✅ Todos los macromedidores de entrada operativos
- ✅ Período completo (sin gaps grandes de tiempo)

### 5. Meta de eficiencia debe ser realista
No se puede pasar de 50% a 90% de eficiencia. Mejoras graduales son más realistas:
- Piloto Edén: 67% → 72% (+5 puntos en 6 meses)

---

## 👥 ¿Quién lo usa?

### Ingenieros de OSE
Diseñan y configuran distritos según topología de red.

**Caso de uso:** Implementar distrito en Pueblo Edén
1. Analizan red de distribución
2. Identifican puntos naturales de delimitación
3. Definen frontera del distrito
4. Identifican puntos de entrada y salida
5. Configuran umbrales y metas

### Sistema de Balance Hídrico (automático)
Calcula balance periódicamente.

**Proceso diario:**
```
1. A las 00:00 → Inicio del período de balance
2. Cada 15 minutos → Calcula balance parcial
3. A las 23:59 → Consolida balance del día
4. Compara con umbral (25%)
5. Si pérdidas > 25% → Genera anomalía
```

### Dashboard de Gestión
Visualiza estado del distrito en tiempo real.

**Visualización:**
```
Distrito Pitométrico Edén

Estado: ✅ Operativo
Última actualización: hace 3 minutos

Balance Hoy (parcial 00:00-14:30):
  Entrada:  520 m³  (Perforación Edén)
  Salida:   340 m³  (95 medidores)
  Pérdidas: 180 m³  (35%) ⚠️ SOBRE UMBRAL

Gráfica:
  [────────────────────────────────]
  Entrada:  ████████████████░░░░░░ 520 m³
  Salida:   ███████████░░░░░░░░░░░ 340 m³
  Pérdidas: █████░░░░░░░░░░░░░░░░░ 180 m³

Tendencia semanal:
  L: 32% ⚠️
  M: 34% ⚠️
  X: 33% ⚠️
  J: 31% ⚠️
  V: 35% ⚠️ ← Pico (investigar)
  S: 30%
  D: 28%
```

### Personal Operativo
Recibe alertas de anomalías del distrito.

**Ejemplo de alerta:**
```
🚨 ALERTA - Distrito Pitométrico Edén

Fecha: 2025-11-04 14:45
Severidad: ALTA

Pérdidas detectadas: 35% (umbral: 25%)
Pérdida estimada: 180 m³ en últimas 14 horas
Población afectada: Potencial (no hay cortes reportados)

Posibles causas:
  - Fuga en red de distribución
  - Error en macromedidor de entrada
  - Consumo no autorizado

Acción requerida:
  ✓ Inspección visual de la red
  ✓ Verificar funcionamiento de medidores
  ✓ Buscar reportes de agua en calles

Asignado a: Jefatura Pueblo Edén
```

---

## 📊 Beneficios del Distrito Pitométrico

### Antes (sin distrito):
- Balance manual mensual con 3-4 semanas de retraso
- Fugas detectadas por reclamos de usuarios
- Pérdidas estimadas, no medidas
- No se sabe dónde ocurren las pérdidas

### Después (con distrito inteligente):
- ✅ Balance automático cada 15 minutos
- ✅ Detección de fugas en minutos vs semanas
- ✅ Pérdidas medidas con precisión
- ✅ Localización: "Pérdida en Distrito Edén"
- ✅ Seguimiento: Ver mejoras día a día
- ✅ Meta cuantificable: +5 puntos de eficiencia

---

## 🎯 Meta del Piloto OSE Maldonado

**Situación actual:**
- Eficiencia: 67% (mejor del país, pero aún 33% de pérdidas)
- Detección de fugas: semanas
- Balance: manual, mensual

**Meta del piloto (6 meses):**
- Eficiencia: 72% (+5 puntos)
- Detección de fugas: minutos
- Balance: automático, tiempo real
- ROI: <18 meses

**Si el piloto es exitoso:**
- Expansión a otros distritos de Maldonado
- Replicación en otras UGDs de Uruguay
- Modelo exportable a otras utilities de agua

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { IDistrito } from 'ose-modelos';

// Crear Distrito Pitométrico Edén
const distritoEden: IDistrito = {
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",
  idJefatura: "jef-eden",

  nombre: "Distrito Pitométrico Pueblo Edén",
  codigo: "DMA-EDEN-01",
  descripcion: "Primer distrito pitométrico inteligente",

  estado: "operativo",

  // Delimitación geográfica
  frontera: {
    tipo: "polygon",
    coordenadas: [
      { latitud: -34.6500, longitud: -54.7200 },
      { latitud: -34.6550, longitud: -54.7150 },
      { latitud: -34.6580, longitud: -54.7220 },
      { latitud: -34.6530, longitud: -54.7270 }
    ]
  },

  // Características
  poblacion: 1200,
  conexiones: 350,
  redKm: 15,

  // Configuración del balance
  configuracionBalance: {
    horaInicioBalance: "00:00",
    periodoBalance: "diario",
    umbralPerdidas: 25,  // %
    metodoCalculo: "avanzado"
  },

  activo: true
};
```

**Ver:** `distrito.ts` para definición técnica completa
