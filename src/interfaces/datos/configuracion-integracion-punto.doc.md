# Configuración de Integración por Punto

**Entidad:** `IConfiguracionIntegracionPunto`
**Contexto:** Datos / Integración
**Versión:** 1.1.0

---

## 🎯 ¿Qué es?

Define **cómo obtener datos** de un punto de medición específico desde sistemas externos (ATLAS, Zeus SCADA, etc.).

Mapea las variables/tags/sensores del sistema externo a los tipos de lectura del modelo canónico de RIOTEC.

Es como el "manual de sincronización" que le dice al sistema:
- Qué variable externa leer (ej: "ZEUS-BOOST-HOSP.PressureIn")
- A qué tipo de lectura canónica convertirla (ej: "Booster Presión Entrada")
- Con qué frecuencia sincronizar (ej: cada 5 minutos)
- Cómo obtenerla (ej: OPC UA, API REST, polling vs push)

---

## 🏗️ ¿Para qué sirve?

OSE Maldonado tiene datos fragmentados en múltiples sistemas:
- **ATLAS (Teleimpresores):** Lecturas de 326 medidores residenciales
- **Zeus SCADA (Microcom):** Lecturas de boosters, perforaciones, sensores

Cada sistema usa sus propios nombres de variables:
- ATLAS: `"meter_12345.accumulated_m3"`
- Zeus: `"ZEUS-BOOST-HOSP.PressureIn"`

RIOTEC necesita **unificar** todo en un modelo común. Esta configuración define el mapeo:

**ATLAS** → `IConfiguracionIntegracionPunto` → **Modelo RIOTEC**
**Zeus** → `IConfiguracionIntegracionPunto` → **Modelo RIOTEC**

### Permite:
1. **Integrar múltiples sistemas** sin modificar el núcleo del modelo
2. **Mapear automáticamente** variables externas → lecturas canónicas
3. **Configurar métodos de sincronización** diferentes por punto
4. **Aplicar transformaciones** si las unidades difieren (ej: bar → psi)
5. **Monitorear errores** de integración por punto

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idPuntoMedicion` | A qué punto se refiere | "pm-boost-001" (Booster Hospital) |
| `idFuenteDatos` | De qué sistema externo vienen los datos | "zeus-maldonado" |
| `mapaVariables` | Lista de variables externas y su mapeo | Ver tabla abajo |
| `metodoSincronizacion` | Cómo obtener los datos | "polling" (cada X min) |
| `frecuenciaSincronizacion` | Cada cuántos minutos sincronizar | 5 minutos |
| `configuracionProtocolo` | Parámetros técnicos de conexión | OPC UA nodeId, API endpoint, etc. |
| `estado` | Estado operacional | "activa" / "pausada" / "error" |
| `ultimaSincronizacionExitosa` | Cuándo fue la última vez que funcionó | "2025-11-04 14:35:00" |

---

## 💡 Ejemplo Real: Booster Hospital desde Zeus SCADA

### Punto de Medición:
- **Nombre:** Booster Hospital
- **ID:** pm-boost-001
- **Ubicación:** Ruta 39 km 3
- **Sistema externo:** Zeus SCADA (Microcom)

### Configuración de Integración:

```yaml
Punto: Booster Hospital (pm-boost-001)
Fuente de datos: Zeus SCADA Maldonado

Mapeo de Variables:
  Variable 1:
    - Variable externa: "ZEUS-BOOST-HOSP.PressureIn"
    - Tipo lectura destino: "Booster Presión Entrada"
    - Transformación: ninguna (ya viene en bar)
    - Activa: Sí

  Variable 2:
    - Variable externa: "ZEUS-BOOST-HOSP.PressureOut"
    - Tipo lectura destino: "Booster Presión Salida"
    - Transformación: ninguna
    - Activa: Sí

  Variable 3:
    - Variable externa: "ZEUS-BOOST-HOSP.Flow"
    - Tipo lectura destino: "Booster Caudal"
    - Transformación: ninguna (ya viene en m³/h)
    - Activa: Sí

Método de sincronización: polling (consulta periódica)
Frecuencia: cada 5 minutos

Configuración del protocolo:
  - Protocolo: OPC UA
  - NodeId base: "ns=2;s=BOOST-HOSP"
  - Endpoint: "opc.tcp://scada.maldonado.ose.uy:4840"

Estado: activa
Última sincronización exitosa: hace 3 minutos
```

---

## 💡 Ejemplo Real: Medidor Residencial desde ATLAS

### Punto de Medición:
- **Nombre:** Medidor Juan Pérez
- **ID:** pm-res-001
- **Ubicación:** Calle Principal 123, Pueblo Edén
- **Sistema externo:** ATLAS (Teleimpresores)

### Configuración de Integración:

```yaml
Punto: Medidor Residencial 001 (pm-res-001)
Fuente de datos: ATLAS Maldonado

Mapeo de Variables:
  Variable 1:
    - Variable externa: "ATL-RES-00123.accumulated_m3"
    - Tipo lectura destino: "Medidor Residencial Consumo"
    - Transformación: ninguna
    - Activa: Sí

Método de sincronización: polling
Frecuencia: cada 15 minutos (sincronización con servidor ATLAS)

Configuración del protocolo:
  - Protocolo: API REST
  - Endpoint: "/api/v1/meters/ATL-RES-00123/readings"
  - Método HTTP: GET

Estado: activa
Última sincronización exitosa: hace 12 minutos
```

---

## 🔗 Se relaciona con

- **Punto de Medición** (`IPuntoMedicion`): El punto del cual se sincronizan datos
- **Fuente de Datos** (`IFuenteDatos`): El sistema externo (ATLAS, Zeus, etc.)
- **Configuración de Lectura** (`IConfiguracionLecturaPunto`): Qué lecturas esperar (esta define cómo obtenerlas)
- **Lectura** (`ILectura`): Los valores reales que llegan tras la sincronización

**Flujo completo:**
```
Sistema Externo   →   Configuración       →   Sincronización   →   Lectura
(Zeus/ATLAS)          Integración              (cada X min)          Canónica
                      (mapeo)
```

---

## ⚙️ Componentes Clave

### 1. Mapeo de Variables (`IMapeoVariable`)

Cada variable externa que se quiere sincronizar tiene:

```typescript
{
  variableExterna: "ZEUS-BOOST-HOSP.PressureIn",  // Tag en Zeus
  tipoLecturaDestino: "Booster Presión Entrada",   // Tipo canónico RIOTEC
  transformacion: "x * 0.1",                       // Opcional: conversión
  activo: true                                     // Se puede desactivar sin borrar
}
```

**Transformación:** Permite convertir unidades o aplicar fórmulas
- Ejemplo 1: Zeus envía presión en psi, RIOTEC usa bar → `transformacion: "x * 0.0689476"`
- Ejemplo 2: Sensor envía temperatura en °F → `transformacion: "(x - 32) * 5/9"`
- Ejemplo 3: Sin transformación (unidades coinciden) → `transformacion: null`

### 2. Métodos de Sincronización

#### **Polling** (el más común)
- RIOTEC consulta periódicamente al sistema externo
- Frecuencia configurable (ej: cada 5 min)
- Uso: ATLAS, Zeus API REST

#### **Push**
- El sistema externo envía datos a RIOTEC cuando tiene nuevos
- No hay frecuencia (evento-driven)
- Uso: Webhooks, APIs de notificación

#### **On Change**
- Similar a Push, pero solo cuando el valor cambia
- Uso: MQTT, OPC UA subscriptions

#### **Manual**
- Sincronización bajo demanda (botón en UI)
- Uso: Datos históricos, imports especiales

### 3. Configuración del Protocolo

Varía según el tipo de conexión:

#### **Para OPC UA (Zeus):**
```json
{
  "nodeId": "ns=2;s=BOOST-HOSP",
  "browsePath": "/Objects/Boosters/Hospital",
  "endpoint": "opc.tcp://scada.ose.uy:4840"
}
```

#### **Para API REST (ATLAS):**
```json
{
  "endpoint": "/api/v1/meters/{meterId}/readings",
  "metodoHTTP": "GET",
  "parametrosQuery": { "from": "last_sync", "format": "json" }
}
```

#### **Para MQTT:**
```json
{
  "topic": "ose/maldonado/boosters/hospital/+",
  "qos": 1
}
```

---

## 👥 ¿Quién la usa?

### Ingeniero de Integración RIOTEC
Configura el mapeo cuando se integra un nuevo sistema o punto.

**Caso de uso:** Nuevo booster instalado
1. Operador OSE crea el `PuntoMedicion` en el sistema
2. Ingeniero RIOTEC identifica tags/variables en Zeus para ese booster
3. Crea `IConfiguracionIntegracionPunto` mapeando variables Zeus → Lecturas RIOTEC
4. Activa sincronización
5. Valida que lleguen datos correctamente

### Sistema de Sincronización (automático)
Ejecuta la sincronización según la configuración.

**Proceso:**
1. Cada 5 minutos (según `frecuenciaSincronizacion`)
2. Para cada configuración activa:
   - Conecta al sistema externo (Zeus, ATLAS)
   - Lee las variables externas
   - Aplica transformaciones si existen
   - Crea `ILectura` canónicas
   - Actualiza `ultimaSincronizacionExitosa`
3. Si hay error:
   - Registra en `ultimoError`
   - Incrementa `contadorErroresConsecutivos`
   - Si supera umbral → cambia `estado` a "error"

### Dashboard de Monitoreo
Muestra el estado de salud de las integraciones.

**Visualización:**
```
✅ Booster Hospital - Zeus SCADA
   Última sincronización: hace 3 min
   Variables: 3/3 OK

⚠️ Medidor Residencial 045 - ATLAS
   Última sincronización: hace 25 min (esperaba 15 min)
   Variables: 1/1 OK pero con retraso

❌ Perforación Edén - Zeus SCADA
   Última sincronización exitosa: hace 2 horas
   Error: Timeout de conexión OPC UA
   Errores consecutivos: 24
```

---

## ⚙️ Reglas de Negocio

### 1. Una configuración por (Punto + Fuente)
Un punto puede tener datos de múltiples fuentes, pero cada combinación (Punto + Fuente) tiene una sola configuración.

**Ejemplo:**
- Booster Hospital desde Zeus → 1 configuración (presión + caudal)
- Booster Hospital desde GIS → 1 configuración diferente (solo ubicación)

### 2. Múltiples variables por configuración
Una configuración puede mapear varias variables externas.

**Ejemplo:** Booster Hospital tiene 3 variables mapeadas en la misma configuración.

### 3. Frecuencia mínima recomendada
No sincronizar más seguido de lo que el sistema externo actualiza:
- Zeus: actualiza cada 5 min → sincronizar cada 5 min (OK)
- ATLAS: actualiza cada 10 min → sincronizar cada 15 min (OK, con margen)

### 4. Manejo de errores
- Después de 5 errores consecutivos → `estado = "error"`
- Se intenta reconectar automáticamente
- Si vuelve a funcionar → `estado = "activa"` y resetea contador

### 5. Variables inactivas
Se puede marcar `activo: false` en un mapeo sin borrarlo:
- Útil para deshabilitar temporalmente una variable
- Ejemplo: Sensor de cloro en mantenimiento

---

## 📊 Beneficios Operativos

### Antes (sin configuración de integración)
- Mapeos hardcodeados en código
- Cambiar un tag de Zeus requería recompilar
- No había visibilidad de estado de sincronizaciones
- Difícil diagnosticar problemas de integración

### Después (con configuración)
- ✅ Mapeos configurables sin tocar código
- ✅ Visibilidad en tiempo real del estado de cada integración
- ✅ Detección automática de problemas de conectividad
- ✅ Fácil agregar nuevos puntos o fuentes
- ✅ Auditoría completa de sincronizaciones

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import {
  IConfiguracionIntegracionPunto,
  IMapeoVariable
} from 'ose-modelos';

// Mapeo de variables
const mapaVariables: IMapeoVariable[] = [
  {
    variableExterna: "ZEUS-BOOST-HOSP.PressureIn",
    tipoLecturaDestino: "Booster Presión Entrada",
    activo: true
  },
  {
    variableExterna: "ZEUS-BOOST-HOSP.PressureOut",
    tipoLecturaDestino: "Booster Presión Salida",
    activo: true
  },
  {
    variableExterna: "ZEUS-BOOST-HOSP.Flow",
    tipoLecturaDestino: "Booster Caudal",
    transformacion: "x * 1.0", // factor de conversión si necesario
    activo: true
  }
];

// Configuración de integración
const config: IConfiguracionIntegracionPunto = {
  idPuntoMedicion: "pm-boost-001",
  idFuenteDatos: "zeus-maldonado",
  idCliente: "ose-uruguay",

  mapaVariables,

  metodoSincronizacion: "polling",
  frecuenciaSincronizacion: 5, // minutos

  configuracionProtocolo: {
    nodeId: "ns=2;s=BOOST-HOSP",
    endpoint: "opc.tcp://scada.maldonado.ose.uy:4840"
  },

  estado: "activa",
  activa: true
};
```

**Ver:** `configuracion-integracion-punto.ts` para definición técnica completa
