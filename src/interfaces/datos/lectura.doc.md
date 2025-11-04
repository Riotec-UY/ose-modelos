# Lectura

**Entidad:** `ILectura`
**Contexto:** Datos
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa un **valor registrado** de una variable en un momento específico desde un punto de medición. Es el dato operacional básico del sistema.

**Concepto clave:** Una Lectura es type-safe gracias a **discriminated unions**. El tipo de lectura determina automáticamente qué valores contiene.

---

## 🏗️ ¿Para qué sirve?

Las lecturas son el "corazón" del sistema: todos los cálculos, análisis y alertas se basan en ellas.

### Tipos de lecturas en OSE Maldonado:

**MACROMEDICIÓN (Entrada/Control):**
- Macromedidor Caudal
- Macromedidor Presión

**MICROMEDICIÓN (Salida/Consumo):**
- Medidor Residencial Consumo

**CALIDAD DEL AGUA:**
- Sensor Calidad Cloro
- Sensor Calidad pH
- Sensor Calidad Turbidez

**INFRAESTRUCTURA DE DISTRIBUCIÓN:**
- Booster Presión Entrada
- Booster Presión Salida
- Booster Caudal
- Depósito Nivel
- Perforación Caudal

---

## 📋 Concepto: Discriminated Unions (Type-Safe)

**Problema:** Una lectura puede contener diferentes valores según su tipo:
- Medidor residencial: consumo acumulado, batería, señal
- Booster: presión, caudal
- Sensor cloro: cloro residual, temperatura

**Solución:** TypeScript infiere automáticamente qué valores tiene cada lectura según su `tipoLectura`.

```typescript
// TypeScript sabe que esta lectura tiene consumoAcumulado, batería, señal
lectura.tipoLectura = "Medidor Residencial Consumo";
console.log(lectura.valores.consumoAcumulado);  // ✅ OK
console.log(lectura.valores.cloroResidual);     // ❌ Error: no existe

// TypeScript sabe que esta lectura tiene cloroResidual
lectura.tipoLectura = "Sensor Calidad Cloro";
console.log(lectura.valores.cloroResidual);     // ✅ OK
console.log(lectura.valores.consumoAcumulado);  // ❌ Error: no existe
```

---

## 📋 Información que contiene

### Campos Comunes (todas las lecturas):

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idPuntoMedicion` | De qué punto viene | "pm-res-001" (Medidor Juan Pérez) |
| `tipoLectura` | Qué variable mide (discriminante) | "Medidor Residencial Consumo" |
| `valores` | Los valores medidos (varía por tipo) | Ver ejemplos abajo |
| `calidadDato` | Confiabilidad del dato | "válida" / "sospechosa" / "error" |
| `metadatosOrigen` | De dónde vino (ATLAS, Zeus, etc.) | Ver IMetadatosDeOrigen |
| `fechaCreacion` | Cuándo se ingresó al sistema | "2025-11-04T14:35:00Z" |

### Valores Específicos por Tipo:

Cada tipo de lectura tiene sus propios campos en `valores`:

---

## 💡 Ejemplo 1: Medidor Residencial Consumo

```yaml
Lectura:
  ID: lec-123456
  Punto de Medición: pm-res-001 (Medidor Juan Pérez)

  Tipo de Lectura: "Medidor Residencial Consumo"

  Valores:
    timestamp: "2025-11-04T14:30:00Z"
    consumoAcumulado: 1234.567 m³     # Lectura del totalizador
    caudal: 15 l/h                     # Caudal instantáneo (opcional)
    bateria: 95%                       # Estado de batería del medidor
    senal: 85%                         # Calidad de señal LoRa
    temperatura: 22°C                  # Temperatura ambiente (opcional)

  Calidad del Dato: "válida"

  Metadatos de Origen:
    fuente: "ATLAS Maldonado"
    timestampIngesta: "2025-11-04T14:35:00Z"
    metodoIntegracion: "api_rest"
    camposEspecificos:
      atlas_meter_id: "ATL-RES-00123"
      atlas_status: "ok"
```

**Uso en Balance Hídrico:**
- Contribuye a **SALIDA** (consumo)
- Valor usado: `consumoAcumulado`
- Frecuencia: cada 10 min (dispositivo), cada 15 min (sincronización)

---

## 💡 Ejemplo 2: Booster Presión Entrada

```yaml
Lectura:
  ID: lec-789012
  Punto de Medición: pm-boost-001 (Booster Hospital)

  Tipo de Lectura: "Booster Presión Entrada"

  Valores:
    timestamp: "2025-11-04T14:30:00Z"
    presion: 4.5 bar                   # Presión medida
    caudal: 45 m³/h                    # Caudal (opcional)

  Calidad del Dato: "válida"

  Metadatos de Origen:
    fuente: "Zeus SCADA Maldonado"
    timestampIngesta: "2025-11-04T14:30:05Z"
    metodoIntegracion: "opc_ua"
    camposEspecificos:
      zeus_station_id: "ZEUS-BOOST-HOSP"
      zeus_variable_tag: "PRES_ENTRADA"
      quality_code: "GOOD"
```

**Uso Operativo:**
- Monitoreo de red
- Detección de caídas de presión
- Validación de funcionamiento de booster

---

## 💡 Ejemplo 3: Perforación Caudal

```yaml
Lectura:
  ID: lec-345678
  Punto de Medición: pm-perf-001 (Perforación Edén)

  Tipo de Lectura: "Perforación Caudal"

  Valores:
    timestamp: "2025-11-04T14:30:00Z"
    caudal: 42 m³/h                    # Caudal de extracción
    caudalAcumulado: 15678.5 m³        # Total extraído
    nivelFreático: -28 metros          # Profundidad del agua (opcional)
    presion: 3.2 bar                   # Presión de salida (opcional)

  Calidad del Dato: "válida"

  Metadatos de Origen:
    fuente: "Zeus SCADA Maldonado"
    timestampIngesta: "2025-11-04T14:30:05Z"
    metodoIntegracion: "opc_ua"
```

**Uso en Balance Hídrico:**
- Contribuye a **ENTRADA** (producción)
- Valor usado: `caudalAcumulado` o `caudal × tiempo`
- Frecuencia: cada 5 minutos

---

## 💡 Ejemplo 4: Sensor Calidad Cloro

```yaml
Lectura:
  ID: lec-901234
  Punto de Medición: pm-perf-001 (Perforación Edén)

  Tipo de Lectura: "Sensor Calidad Cloro"

  Valores:
    timestamp: "2025-11-04T14:00:00Z"
    cloroResidual: 0.8 ppm             # Concentración de cloro
    temperatura: 18°C                  # Temperatura del agua

  Calidad del Dato: "válida"

  Metadatos de Origen:
    fuente: "Zeus SCADA Maldonado"
```

**Uso Operativo:**
- Control de calidad del agua
- Cumplimiento de normas sanitarias
- Alertas si cloro < 0.2 ppm o > 2.0 ppm

---

## 🔗 Se relaciona con

- **Punto de Medición** (`IPuntoMedicion`): De dónde viene la lectura
- **Configuración de Lectura** (`IConfiguracionLecturaPunto`): Qué lecturas se esperan
- **Configuración de Integración** (`IConfiguracionIntegracionPunto`): Cómo se obtienen
- **Fuente de Datos** (`IFuenteDatos`): Sistema externo que la provee (ATLAS, Zeus)
- **Metadatos de Origen** (`IMetadatosDeOrigen`): Trazabilidad
- **Balance Hídrico** (`IBalanceHidrico`): Usa lecturas para cálculos
- **Serie Temporal** (`ISerieTemporal`): Agrupación de lecturas

---

## ⚙️ Calidad de Datos

Cada lectura tiene un estado de calidad:

### `válida`
Dato confiable, pasó todas las validaciones.

**Criterios:**
- Valor dentro de rango esperado
- Timestamp coherente
- Sin errores de comunicación
- Sensor operativo

### `sospechosa`
Fuera de patrón normal pero físicamente posible.

**Ejemplo:**
- Consumo residencial: 500 l/h (alto, pero posible si hay fuga domiciliaria)
- Se usa en cálculos pero se marca para revisión

### `error`
Fuera de rango físico o error de comunicación.

**Ejemplos:**
- Presión: -5 bar (físicamente imposible)
- Consumo: 999999 m³ (sensor defectuoso)
- NO se usa en balance hídrico

### `interpolada`
Valor calculado para llenar un gap temporal.

**Ejemplo:**
- Falló lectura a las 14:30
- Se interpola entre 14:20 y 14:40
- Se marca como "interpolada"

### `calculada`
Derivada de otras lecturas.

**Ejemplo:**
- Balance hídrico: pérdidas = entrada - salida (calculada)

---

## 👥 ¿Quién la usa?

### Sistema de Integración (automático)
Crea lecturas al sincronizar desde ATLAS/Zeus.

**Flujo:**
```
1. Cada 5-15 min → Sincronización
2. Lee datos de Zeus/ATLAS
3. Crea ILectura canónica
4. Valida calidad
5. Almacena en base de datos
```

### Sistema de Balance Hídrico (automático)
Consulta lecturas para calcular entrada/salida.

**Query ejemplo:**
```typescript
// Lecturas de entrada del distrito (últimas 24h)
const lecturasEntrada = await db.lecturas.find({
  idPuntoMedicion: { $in: puntosEntradaDistrito },
  "valores.timestamp": {
    $gte: "2025-11-03T00:00:00Z",
    $lte: "2025-11-04T00:00:00Z"
  },
  calidadDato: { $in: ["válida", "sospechosa"] }
});
```

### Dashboard de Monitoreo
Visualiza lecturas en tiempo real.

**Visualización:**
```
Perforación Edén
  Última lectura: hace 3 minutos
  Caudal: 42 m³/h ✅
  Nivel freático: -28 m ✅
  Calidad: válida

Gráfica (últimas 6 horas):
  [────────────────────────────────]
  50 m³/h │     ╱╲    ╱╲
  40 m³/h │    ╱  ╲  ╱  ╲  ← Actual
  30 m³/h │   ╱    ╲╱    ╲
  20 m³/h │  ╱
  10 m³/h │ ╱
          └─────────────────────────
          8:00  10:00  12:00  14:00
```

### Operadores OSE
Consultan lecturas históricas para análisis.

**Caso de uso:** Investigar anomalía
1. Sistema detecta pérdidas altas en Distrito Edén
2. Operador consulta lecturas de todos los puntos
3. Identifica: Perforación Edén tiene caudal alto + medidores con consumo normal
4. Conclusión: Posible fuga en red entre perforación y medidores

---

## 📊 Volumen de Datos

### Distrito Pitométrico Edén (estimación):

**Puntos de entrada:**
- 1 Perforación: 1 lectura cada 5 min = 12/hora = 288/día

**Puntos de salida:**
- 95 Medidores: 1 lectura cada 10 min = 6/hora = 570/día (cada uno)
- Total: 95 × 570 = 54,150 lecturas/día

**Total Distrito Edén:** ~54,500 lecturas/día

**Retención:**
- Últimos 30 días: Datos crudos
- 30-365 días: Agregado horario
- >365 días: Agregado diario
- Esto mantiene el volumen manejable

---

## ⚙️ Reglas de Negocio

### 1. Timestamp obligatorio
Toda lectura debe tener timestamp. Sin él no puede participar en series temporales ni balances.

### 2. Un tipo → Estructura específica
El tipo de lectura determina la estructura de `valores`:
- "Medidor Residencial Consumo" → debe tener `consumoAcumulado`
- "Sensor Calidad Cloro" → debe tener `cloroResidual`

### 3. Calidad determina uso
- Lecturas "error" NO se usan en balance hídrico
- Lecturas "interpoladas" se usan pero con marca especial
- Solo lecturas "válida" o "sospechosa" cuentan para cobertura mínima

### 4. No editar lecturas históricas
Las lecturas son inmutables. Si hay error, se marca como "error" pero no se borra.

### 5. Retención configurable
Lecturas antiguas se agregan o archivan según política de retención.

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { ILectura, TipoLectura } from 'ose-modelos';

// Lectura de medidor residencial (TypeScript infiere el tipo)
const lecturaResidencial: ILectura = {
  idPuntoMedicion: "pm-res-001",
  idCliente: "ose-uruguay",

  tipoLectura: "Medidor Residencial Consumo",  // Discriminante

  // TypeScript sabe que valores debe ser IValoresMedidorResidencial
  valores: {
    timestamp: "2025-11-04T14:30:00Z",
    consumoAcumulado: 1234.567,
    bateria: 95,
    senal: 85
  },

  calidadDato: "válida",

  metadatosOrigen: {
    fuente: "ATLAS Maldonado",
    timestampIngesta: "2025-11-04T14:35:00Z",
    metodoIntegracion: "api_rest"
  }
};

// Procesamiento type-safe
function procesarLectura(lectura: ILectura) {
  if (lectura.tipoLectura === "Medidor Residencial Consumo") {
    // TypeScript sabe que valores tiene consumoAcumulado
    console.log(`Consumo: ${lectura.valores.consumoAcumulado} m³`);
  }
  else if (lectura.tipoLectura === "Sensor Calidad Cloro") {
    // TypeScript sabe que valores tiene cloroResidual
    console.log(`Cloro: ${lectura.valores.cloroResidual} ppm`);
  }
}
```

**Ver:** `lectura.ts` para definición técnica completa de todos los tipos
