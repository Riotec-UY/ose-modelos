# Punto de Medición

**Entidad:** `IPuntoMedicion`
**Contexto:** Infraestructura
**Versión:** 2.0.0 (MongoDB-optimized)
**Última actualización:** 4 Nov 2025

---

## 🎯 ¿Qué es?

Representa un **lugar físico** en la red de agua donde se realizan mediciones de variables operacionales.

**Concepto clave:** Un Punto de Medición es un LUGAR, NO un tipo de dato ni un dispositivo específico.

### Ejemplos:
- Un domicilio residencial donde hay un medidor de agua
- Una estación de bombeo (booster) con sensores de presión y caudal
- Una perforación con medidor de extracción y sensor de nivel freático
- Un depósito de almacenamiento con sensor de nivel

---

## 🏗️ ¿Para qué sirve?

En OSE Maldonado, la red de distribución de agua tiene cientos de puntos donde se miden variables:
- **Puntos de entrada** (producción): Perforaciones que extraen agua
- **Puntos de control** (distribución): Boosters, depósitos, válvulas
- **Puntos de salida** (consumo): Medidores residenciales, comerciales, industriales

Cada uno de estos lugares es un "Punto de Medición" en el sistema RIOTEC.

### Permite:
1. **Inventario completo** de la infraestructura de medición
2. **Clasificación** por tipo y función en el balance hídrico
3. **Ubicación geográfica** de cada punto
4. **Asociación** con lecturas/mediciones que se toman en ese lugar
5. **Gestión del ciclo de vida** (instalación, operación, mantenimiento, desactivación)

---

## ⚡ Patrón MongoDB-Optimized (v2.0.0)

**IMPORTANTE**: Desde v1.4.0, `IPuntoMedicion` sigue un patrón **MongoDB-optimized** con configuraciones embebidas.

### ¿Qué cambió?

```typescript
// ❌ ANTES (v1.0 - SQL-oriented): 4 queries
const punto = await db.puntosMedicion.findById(id);
const configs = await db.configuracionesLectura.find({ idPuntoMedicion: id });
const integracion = await db.configuracionesIntegracion.findOne({ idPuntoMedicion: id });
const lecturas = await db.lecturas.find({ idPuntoMedicion: id }).sort(...).limit(100);

// ✅ AHORA (v2.0 - MongoDB-optimized): 1 query
const punto = await db.puntosMedicion.findById(id);
// punto.configuracionesLectura → embebido ⚡
// punto.configuracionIntegracion → embebido ⚡
// punto.ultimaLecturaPorTipo → embebido ⚡
```

### Configuraciones Embebidas

| Campo | Qué contiene | ¿Por qué embebido? |
|-------|--------------|-------------------|
| `configuracionesLectura[]` | Qué lecturas esperar, frecuencias, validaciones | Metadata pequeño (~3-5 configs), cambia poco, siempre se consulta junto con el punto |
| `configuracionIntegracion` | Cómo sincronizar desde Zeus/ATLAS, mapeo de variables | Metadata pequeño (1 config), cambia muy poco, permite filtrar "todos los de Zeus" |
| `ultimaLecturaPorTipo{}` | Última lectura por cada tipo (acceso ultra-rápido) | Evita query adicional a colección lecturas en el 80% de los casos |

### Ventajas

- ✅ **1 query** en lugar de 4 (4x más rápido)
- ✅ **Sin $lookup** ni aggregations complejos
- ✅ **Patrón IRIX/INSIDE**: Probado en producción
- ✅ **Filtrar por fuente** es más simple: `{ 'configuracionIntegracion.idFuenteDatos': 'fuente-zeus' }`

### Lecturas Históricas (siguen separadas)

```typescript
// Historial completo en colección separada (correcto)
const lecturasHistoricas = await db.lecturas.find({
  idPuntoMedicion: id,
  'valores.timestamp': { $gte: fechaInicio, $lte: fechaFin }
});
```

**Razón**: Lecturas son volumen alto (millones de docs), con TTL automático. Mantener separadas tiene sentido.

---

## 📋 Tipos de Puntos

### CONSUMO (Agua que SALE del sistema)
- **residencial:** Domicilio particular
- **comercial:** Comercio, oficina
- **industrial:** Industria, fábrica
- **institucional:** Hospital, escuela, edificio público

### INFRAESTRUCTURA DE PRODUCCIÓN (Agua que ENTRA al sistema)
- **perforacion:** Pozo de extracción de agua subterránea
- **planta_tratamiento:** Planta potabilizadora
- **entrada_externa:** Compra a otro proveedor

### INFRAESTRUCTURA DE DISTRIBUCIÓN (Puntos de CONTROL)
- **booster:** Estación de bombeo para aumentar presión
- **deposito:** Tanque de almacenamiento
- **camara_valvulas:** Punto de control de flujo en la red

### CONTROL Y MEDICIÓN
- **punto_control_distrito:** Entrada/salida de distrito pitométrico
- **interconexion:** Conexión entre zonas operativas

### GENÉRICO
- **otro:** Casos no clasificados

---

## 📋 Función en Balance Hídrico

Cada punto tiene una función en el cálculo de balance:

| Función | Significado | Ejemplos |
|---------|-------------|----------|
| `entrada` | Agua que INGRESA al sistema | Perforaciones, planta tratamiento |
| `salida` | Agua que SALE del sistema | Consumo residencial, comercial, industrial |
| `control` | Puntos intermedios de medición | Boosters, depósitos, controles de distrito |
| `no_aplica` | No participa en balance | Sensores de calidad sin caudal asociado |

---

## 📋 Información que contiene

### Datos Básicos

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `nombre` | Nombre descriptivo del punto | "Booster Hospital" |
| `codigo` | Código interno opcional | "BOOST-HOSP-001" |
| `tipo` | Tipo de lugar | "booster" |
| `funcionBalanceHidrico` | Rol en el balance | "control" |
| `idDistrito` | A qué distrito pertenece | "distrito-eden" |
| `ubicacion` | Coordenadas geográficas (GeoJSON) | Point [-54.95, -34.9] |
| `estado` | Estado operacional | operativo / mantenimiento / error / inactivo |
| `fechaInstalacion` | Cuándo se instaló | "2024-01-15" |
| `metadatosTecnicos` | Datos específicos por tipo | Capacidad, fabricante, modelo, etc. |

### Configuraciones Embebidas ⭐ (v2.0)

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `configuracionesLectura[]` | Qué lecturas esperar, frecuencias, validaciones | `[{ tipoLectura: "Macromedidor Caudal", frecuenciaEsperada: 5, obligatoria: true }]` |
| `configuracionIntegracion` | Cómo sincronizar desde sistemas externos | `{ idFuenteDatos: "fuente-zeus", metodoSincronizacion: "polling", frecuenciaSincronizacion: 5 }` |
| `ultimaLecturaPorTipo{}` | Última lectura por cada tipo (acceso rápido) | `{ "Macromedidor Caudal": { timestamp: "2025-11-04T10:30:00Z", valor: 45.2, calidadDato: "válida" } }` |

---

## 💡 Ejemplo Real 1: Booster Hospital

```yaml
Punto de Medición:
  ID: pm-boost-001
  Nombre: "Estación Booster Hospital"
  Código: "BOOST-HOSP-001"

  Tipo: booster
  Función en Balance: control (punto intermedio)

  Ubicación:
    Coordenadas: lat -34.9000, lng -54.9500
    Dirección: "Ruta 39 km 3, frente al Hospital Regional"
    Departamento: "Maldonado"

  Estado: operativo
  Fecha instalación: 2020-03-15

  Metadatos Técnicos:
    capacidadBombeo: 150 m³/h
    cantidadBombas: 2
    potenciaInstalada: 45 kW
    fabricante: "Grundfos"
    modeloBombas: "CR64-3"

  Jerarquía Organizacional:
    Cliente: OSE Uruguay
    División: UGD Maldonado
    Jefatura: Maldonado Centro
    Distrito: Distrito Maldonado Alto
```

**Lecturas asociadas** (1 punto → múltiples variables):
- Presión Entrada (cada 5 min)
- Presión Salida (cada 5 min)
- Caudal (cada 5 min)
- Estado de bombas (on change)

---

## 💡 Ejemplo Real 2: Perforación Edén

```yaml
Punto de Medición:
  ID: pm-perf-001
  Nombre: "Perforación Pueblo Edén"
  Código: "PERF-EDEN-01"

  Tipo: perforacion
  Función en Balance: entrada (producción)

  Ubicación:
    Coordenadas: lat -34.6500, lng -54.7200
    Dirección: "Zona rural Pueblo Edén"

  Estado: operativo
  Fecha instalación: 2015-11-20

  Metadatos Técnicos:
    profundidad: 180 metros
    caudalMaximo: 50 m³/h
    nivelEstatico: 25 metros
    añoPerforacion: 2015
    diametroPerforacion: 8 pulgadas

  Jerarquía Organizacional:
    Cliente: OSE Uruguay
    División: UGD Maldonado
    Jefatura: Pueblo Edén
    Distrito: Distrito Edén
```

**Lecturas asociadas**:
- Caudal de Extracción (cada 5 min)
- Nivel Freático (cada 30 min)
- Calidad del Agua - Cloro (cada 1 hora)
- Estado de la bomba (on change)

---

## 💡 Ejemplo Real 3: Medidor Residencial

```yaml
Punto de Medición:
  ID: pm-res-001
  Nombre: "Medidor Juan Pérez"
  Código: "ATL-MAL-ED-00123"

  Tipo: residencial
  Función en Balance: salida (consumo)

  Ubicación:
    Coordenadas: lat -34.6456, lng -54.7123
    Dirección: "Calle Principal 123, Pueblo Edén"

  Estado: operativo
  Fecha instalación: 2024-06-10

  Metadatos Técnicos:
    cuentaCliente: "OSE-1234567"
    fabricanteMedidor: "MADDALENA"
    modeloMedidor: "AMEI LXY"
    numeroSerie: "MDLN-2024-987654"
    diametro: 12.5 mm
    protocoloComunicacion: "LoRa"

  Jerarquía Organizacional:
    Cliente: OSE Uruguay
    División: UGD Maldonado
    Jefatura: Pueblo Edén
    Distrito: Distrito Edén
```

**Lecturas asociadas** (1 variable):
- Consumo Acumulado (cada 10 min desde el medidor, sincronización ATLAS cada 15 min)

---

## 🔗 Se relaciona con

### Entidades Externas (Referencias)

- **División/Jefatura/Distrito** (`IDivision`, `IJefatura`, `IDistrito`): Jerarquía organizacional a la que pertenece
- **Fuente de Datos** (`IFuenteDatos`): Sistemas externos desde donde se sincroniza (Zeus, ATLAS, etc.)
- **Lectura** (`ILectura`): Los valores que se miden en este punto (colección separada, historial completo)
- **Relación Topológica** (`IRelacionTopologica`): Cómo se conecta con otros puntos
- **Balance Hídrico** (`IBalanceHidrico`): Participa en los cálculos de entrada/salida
- **Referencia Externa** (`IReferenciaExterna`): IDs en sistemas externos (ATLAS, Zeus, GIS, etc.)

### Tipos Embebidos (dentro del documento)

- **Ubicación Geográfica** (`IUbicacionGeografica`): Dónde está físicamente (embebido)
- **Configuraciones de Lectura** (`IConfiguracionLectura[]`): Qué lecturas debe tener (embebido ⭐)
- **Configuración de Integración** (`IConfiguracionIntegracion`): Cómo sincronizar desde externos (embebido ⭐)
- **Resumen de Últimas Lecturas** (`Record<TipoLectura, IResumenUltimaLectura>`): Acceso rápido sin query adicional (embebido ⭐)

### ⚠️ Entidades Deprecadas

- ~~`IConfiguracionLecturaPunto`~~ → Usar `configuracionesLectura[]` embebido
- ~~`IConfiguracionIntegracionPunto`~~ → Usar `configuracionIntegracion` embebido

---

## ⚙️ Reglas de Negocio

### 1. Un punto → Múltiples lecturas
Un punto puede tener 1 o varias variables monitoreadas.

**Ejemplos:**
- Medidor residencial: 1 variable (consumo acumulado)
- Booster: 3+ variables (presiones, caudal, estados)
- Perforación: 4+ variables (caudal, nivel, calidad, estado)

### 2. Metadatos técnicos flexibles
Los metadatos varían según el tipo de punto:

**Residencial:**
```typescript
metadatosTecnicos: {
  cuentaCliente: string,
  fabricanteMedidor: string,
  numeroSerie: string,
  diametro_mm: number,
  protocoloComunicacion: 'LoRa' | 'NB-IoT' | 'GPRS'
}
```

**Booster:**
```typescript
metadatosTecnicos: {
  capacidadBombeo_m3h: number,
  cantidadBombas: number,
  potenciaInstalada_kW: number,
  fabricante: string,
  modeloBombas: string
}
```

**Perforación:**
```typescript
metadatosTecnicos: {
  profundidad_m: number,
  caudalMaximo_m3h: number,
  nivelEstatico_m: number,
  diametroPerforacion_pulgadas: number
}
```

### 3. Estados del ciclo de vida
```
NUEVO → OPERATIVO ⟷ MANTENIMIENTO → INACTIVO
```

- **operativo:** Funcionando normalmente
- **mantenimiento:** Temporalmente fuera de servicio (planificado)
- **error:** Fallo detectado, requiere atención
- **inactivo:** Permanentemente desactivado

### 4. Sin IDs externos en el modelo
El punto NO contiene IDs de ATLAS, Zeus, etc.

**Correcto:** Usar `ReferenciaExterna` separada
```
PuntoMedicion (pm-boost-001)
  ├─ ReferenciaExterna → Zeus: "ZEUS-BOOST-HOSP"
  ├─ ReferenciaExterna → GIS: "Feature-Layer:Boosters/ID:42"
  └─ ReferenciaExterna → Sistema Comercial: "ACTIVO-INF-001"
```

---

## 👥 ¿Quién lo usa?

### Operadores OSE
Registran nuevos puntos cuando instalan infraestructura.

**Caso de uso:** Instalación de nuevo medidor residencial (v2.0)
1. Técnico OSE instala medidor físico en domicilio
2. Operador crea `PuntoMedicion` en sistema RIOTEC con **todo embebido**:
   - Datos básicos: ubicación, tipo, metadatos técnicos
   - **Configuraciones de lectura embebidas**: Qué lecturas esperar
   - **Configuración de integración embebida**: Cómo sincronizar desde ATLAS
3. ✅ **1 sola operación** de creación (antes eran 3 inserts separados)

### Sistema de Balance Hídrico
Consulta puntos por función para calcular entrada/salida.

**Ejemplo:** Balance del Distrito Edén
```typescript
// Puntos de ENTRADA
const puntosEntrada = await puntos.find({
  idDistrito: "distrito-eden",
  funcionBalanceHidrico: "entrada"
});
// → [Perforación Edén]

// Puntos de SALIDA
const puntosSalida = await puntos.find({
  idDistrito: "distrito-eden",
  funcionBalanceHidrico: "salida"
});
// → [95 medidores residenciales + Hospital]
```

### Dashboard / Mapas GIS
Visualiza puntos geográficamente con iconos según tipo.

**Visualización:**
```
[Mapa de Maldonado]
  ⛲ Perforación Edén (verde - operativo)
  🔧 Booster Hospital (verde - operativo)
  🏠 95 medidores residenciales (mayoría verde)
  🏥 Hospital (amarillo - consumo alto)
```

---

## 📊 Beneficios Operativos

### Inventario Completo
- Lista de toda la infraestructura de medición
- Clasificada por tipo y función
- Con ubicaciones geográficas precisas

### Gestión del Ciclo de Vida
- Registro de fechas de instalación
- Seguimiento de estado operacional
- Planificación de mantenimientos

### Base para Análisis
- Balance hídrico por función (entrada/salida/control)
- Análisis geográfico (distritos, zonas)
- Seguimiento de disponibilidad de datos

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import {
  IPuntoMedicion,
  TipoPuntoMedicion,
  IConfiguracionLectura,
  IConfiguracionIntegracion
} from 'ose-modelos';

// ⭐ EJEMPLO v2.0: Crear punto con configuraciones embebidas
const punto: IPuntoMedicion = {
  // Datos básicos
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",
  idJefatura: "jef-maldonado-centro",
  idDistrito: "distrito-maldonado-alto",

  nombre: "Estación Booster Hospital",
  codigo: "BOOST-HOSP-001",

  tipo: "booster",
  funcionBalanceHidrico: "control",

  ubicacion: {
    geojson: {
      type: "Point",
      coordinates: [-54.9500, -34.9000]  // [lng, lat] orden GeoJSON
    },
    direccionPostal: "Ruta 39 km 3, frente al Hospital Regional",
    departamento: "Maldonado"
  },

  estado: "operativo",
  fechaInstalacion: "2020-03-15",

  metadatosTecnicos: {
    capacidadBombeo_m3h: 150,
    cantidadBombas: 2,
    potenciaInstalada_kW: 45,
    fabricante: "Grundfos",
    modeloBombas: "CR64-3"
  },

  // ⭐ CONFIGURACIONES EMBEBIDAS (MongoDB-optimized)
  configuracionesLectura: [
    {
      tipoLectura: "Booster Presión Entrada",
      frecuenciaEsperada: 5,  // minutos
      obligatoria: true,
      rangoValido: {
        minimo: 1.0,
        maximo: 6.0,
        unidad: "bar"
      },
      activa: true
    },
    {
      tipoLectura: "Booster Presión Salida",
      frecuenciaEsperada: 5,
      obligatoria: true,
      rangoValido: {
        minimo: 2.0,
        maximo: 8.0,
        unidad: "bar"
      },
      activa: true
    },
    {
      tipoLectura: "Booster Caudal",
      frecuenciaEsperada: 5,
      obligatoria: true,
      rangoValido: {
        minimo: 0,
        maximo: 150,
        unidad: "m³/h"
      },
      activa: true
    }
  ],

  configuracionIntegracion: {
    idFuenteDatos: "fuente-zeus-scada",
    metodoSincronizacion: "polling",
    frecuenciaSincronizacion: 5,  // minutos

    mapaVariables: [
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
        activo: true
      }
    ],

    configuracionProtocolo: {
      nodeId: "ns=2;s=Booster.Hospital",
      browsePath: "/Objects/Boosters/Hospital"
    },

    estado: "activa",
    activa: true
  },

  // ultimaLecturaPorTipo se actualiza automáticamente cuando llegan lecturas
  ultimaLecturaPorTipo: {
    "Booster Presión Entrada": {
      timestamp: "2025-11-04T10:30:00Z",
      valor: 3.5,
      calidadDato: "válida"
    },
    "Booster Presión Salida": {
      timestamp: "2025-11-04T10:30:00Z",
      valor: 5.2,
      calidadDato: "válida"
    },
    "Booster Caudal": {
      timestamp: "2025-11-04T10:30:00Z",
      valor: 45.2,
      calidadDato: "válida"
    }
  }
};

// ✅ 1 sola inserción - todo embebido
await db.puntosMedicion.insertOne(punto);

// ✅ Consulta simple - todo en 1 query
const puntoCompleto = await db.puntosMedicion.findOne({ _id: punto._id });
// puntoCompleto.configuracionesLectura → ya está
// puntoCompleto.configuracionIntegracion → ya está
// puntoCompleto.ultimaLecturaPorTipo → ya está
```

### Queries Comunes

```typescript
// Filtrar todos los puntos sincronizados desde Zeus
const puntosZeus = await db.puntosMedicion.find({
  'configuracionIntegracion.idFuenteDatos': 'fuente-zeus-scada'
});

// Puntos con sincronización en error
const puntosError = await db.puntosMedicion.find({
  'configuracionIntegracion.estado': 'error',
  'configuracionIntegracion.contadorErroresConsecutivos': { $gte: 3 }
});

// Puntos que deberían tener presión
const puntosConPresion = await db.puntosMedicion.find({
  'configuracionesLectura': {
    $elemMatch: {
      tipoLectura: { $regex: 'Presión' },
      obligatoria: true
    }
  }
});
```

**Ver:**
- `punto-medicion.ts` para definición técnica completa
- `INDICES-MONGODB.md` para índices recomendados
- `configuracion-lectura-punto.ts` (deprecated) - usar configuraciones embebidas
- `configuracion-integracion-punto.ts` (deprecated) - usar configuraciones embebidas
