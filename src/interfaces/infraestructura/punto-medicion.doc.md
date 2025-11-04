# Punto de Medición

**Entidad:** `IPuntoMedicion`
**Contexto:** Infraestructura
**Versión:** 1.0.0

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

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `nombre` | Nombre descriptivo del punto | "Booster Hospital" |
| `codigo` | Código interno opcional | "BOOST-HOSP-001" |
| `tipo` | Tipo de lugar | "booster" |
| `funcionBalanceHidrico` | Rol en el balance | "control" |
| `idDistrito` | A qué distrito pertenece | "distrito-eden" |
| `ubicacion` | Coordenadas geográficas | lat: -34.9, lng: -54.95 |
| `direccionPostal` | Dirección física | "Ruta 39 km 3" |
| `estado` | Estado operacional | operativo / mantenimiento / error / inactivo |
| `fechaInstalacion` | Cuándo se instaló | "2024-01-15" |
| `metadatosTecnicos` | Datos específicos por tipo | Capacidad, fabricante, modelo, etc. |

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

- **División/Jefatura/Distrito** (`IDivision`, `IJefatura`, `IDistrito`): Jerarquía organizacional a la que pertenece
- **Ubicación Geográfica** (`IUbicacionGeografica`): Dónde está físicamente
- **Lectura** (`ILectura`): Los valores que se miden en este punto
- **Configuración de Lectura** (`IConfiguracionLecturaPunto`): Qué lecturas debe tener
- **Configuración de Integración** (`IConfiguracionIntegracionPunto`): Cómo obtener los datos desde sistemas externos
- **Relación Topológica** (`IRelacionTopologica`): Cómo se conecta con otros puntos
- **Balance Hídrico** (`IBalanceHidrico`): Participa en los cálculos de entrada/salida
- **Referencia Externa** (`IReferenciaExterna`): IDs en sistemas externos (ATLAS, Zeus, GIS, etc.)

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

**Caso de uso:** Instalación de nuevo medidor residencial
1. Técnico OSE instala medidor físico en domicilio
2. Operador crea `PuntoMedicion` en sistema RIOTEC
3. Configura ubicación, tipo, metadatos técnicos
4. Crea `ConfiguracionLecturaPunto` para definir lecturas esperadas
5. Crea `ConfiguracionIntegracionPunto` para sincronizar desde ATLAS

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
import { IPuntoMedicion, TipoPuntoMedicion } from 'ose-modelos';

// Crear punto de medición: Booster Hospital
const punto: IPuntoMedicion = {
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",
  idJefatura: "jef-maldonado-centro",
  idDistrito: "distrito-maldonado-alto",

  nombre: "Estación Booster Hospital",
  codigo: "BOOST-HOSP-001",

  tipo: "booster",
  funcionBalanceHidrico: "control",

  ubicacion: {
    coordenadas: { latitud: -34.9000, longitud: -54.9500 },
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
  }
};
```

**Ver:** `punto-medicion.ts` para definición técnica completa
