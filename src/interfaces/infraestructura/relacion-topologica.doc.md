# Relación Topológica entre Puntos

**Entidad:** `IRelacionTopologica`
**Contexto:** Infraestructura
**Versión:** 1.1.0

---

## 🎯 ¿Qué es?

Define las **conexiones hidráulicas** entre puntos de medición en la red de agua: qué punto alimenta a cuál, qué equipos trabajan en paralelo, qué sistemas son backup de otros.

Es como el "mapa de conexiones" o "diagrama de flujo" de la red de distribución de agua.

---

## 🏗️ ¿Para qué sirve?

La red de distribución de OSE Maldonado no es un conjunto de puntos aislados, sino un **sistema interconectado**:

- El agua extraída de las **perforaciones** (entrada) fluye hacia los **boosters** (control)
- Los **boosters** distribuyen agua hacia **zonas residenciales** (salida)
- Algunos equipos trabajan en **paralelo** (2 bombas en la misma estación)
- Hay sistemas de **backup/redundancia** (perforación alternativa si una falla)

Esta información permite:

1. **Análisis de impacto:** Si falla un punto, ¿qué zonas se afectan?
2. **Balance por sector:** Calcular entrada vs salida en sub-circuitos
3. **Detección de fugas:** Si hay pérdida entre punto A y punto B
4. **Planificación de mantenimiento:** Saber qué sistemas activar antes de desactivar uno
5. **Visualización de red:** Mostrar el flujo de agua en mapas/diagramas

---

## 📋 Tipos de Relaciones

### 1. `alimenta_a` (la más común)
**Significado:** El punto A envía agua al punto B

**Ejemplos:**
- Perforación Edén → Booster Hospital
- Booster Hospital → Zona Residencial Punta del Este
- Depósito Central → Red de distribución barrio X

### 2. `controla`
**Significado:** El punto A regula/controla el funcionamiento del punto B

**Ejemplos:**
- Válvula de entrada distrito → Macromedidor de entrada
- PLC de control → Bomba booster

### 3. `backup_de`
**Significado:** El punto A es respaldo/redundancia del punto B

**Ejemplos:**
- Perforación Edén 2 es backup de Perforación Edén 1
- Booster Norte es backup de Booster Sur (interconexión de emergencia)

### 4. `paralelo_con`
**Significado:** Los puntos A y B trabajan simultáneamente para el mismo objetivo

**Ejemplos:**
- Bomba 1 paralelo con Bomba 2 en Booster Hospital
- Perforación A y B alimentan al mismo depósito

### 5. `pertenece_a_circuito`
**Significado:** El punto forma parte de un circuito o zona operativa específica

**Ejemplos:**
- Todos los medidores de "Circuito Pueblo Edén"
- Puntos de control del "Distrito Pitométrico Península"

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idPuntoOrigen` | Desde dónde viene el agua (upstream) | Perforación Edén |
| `idPuntoDestino` | Hacia dónde va el agua (downstream) | Booster Hospital |
| `tipoRelacion` | Qué tipo de conexión es | "alimenta_a" |
| `capacidadNominal` | m³/h que puede transferir esta conexión | 50 m³/h |
| `distanciaAproximada` | Metros de tubería entre puntos | 1500 m |
| `diametroTuberia` | Diámetro de la cañería en mm | 200 mm |
| `prioridad` | Si hay múltiples rutas (1=principal) | 1 |
| `estado` | Activa / Inactiva / Desactivada | Activa |

---

## 💡 Ejemplo Real: Red Pueblo Edén

### Topología Simplificada:

```
ENTRADA (Producción)
  ↓
┌─────────────────────┐
│ Perforación Edén    │ Capacidad: 50 m³/h
│ (pm-perf-001)       │
└─────────────────────┘
          ↓ alimenta_a (1500m, tubería 200mm)
          ↓
CONTROL (Distribución)
  ↓
┌─────────────────────┐
│ Booster Hospital    │ Capacidad: 150 m³/h
│ (pm-boost-001)      │
└─────────────────────┘
          ↓ alimenta_a (múltiples ramales)
          ├───────────────────────┬─────────────────────┐
          ↓                       ↓                     ↓
SALIDA (Consumo)
  ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Zona Res. A  │    │ Zona Res. B  │    │ Gran Consumo │
│ 50 medidores │    │ 30 medidores │    │ Hospital     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Relaciones modeladas:

#### Relación 1: Perforación → Booster
```yaml
Desde: Perforación Edén (pm-perf-001)
Hacia: Booster Hospital (pm-boost-001)
Tipo: alimenta_a
Capacidad nominal: 50 m³/h
Distancia: 1500 metros
Diámetro tubería: 200 mm
Estado: activa
```

#### Relación 2: Booster → Zona Residencial A
```yaml
Desde: Booster Hospital (pm-boost-001)
Hacia: Punto control Zona A (pm-control-zona-a)
Tipo: alimenta_a
Capacidad nominal: 30 m³/h
Distancia: 800 metros
Diámetro tubería: 150 mm
Prioridad: 1 (ramal principal)
Estado: activa
```

#### Relación 3: Booster → Hospital (Gran Consumidor)
```yaml
Desde: Booster Hospital (pm-boost-001)
Hacia: Macromedidor Hospital (pm-gc-hospital)
Tipo: alimenta_a
Capacidad nominal: 20 m³/h
Distancia: 100 metros
Diámetro tubería: 100 mm
Estado: activa
```

---

## 🔗 Se relaciona con

- **Punto de Medición** (`IPuntoMedicion`): Los puntos que se conectan
- **Distrito Pitométrico** (`IDistrito`): La zona donde están las relaciones
- **Balance Hídrico** (`IBalanceHidrico`): Usa la topología para calcular sub-balances

---

## ⚙️ Reglas de Negocio

### 1. Direccionalidad
Las relaciones son **direccionales**: el agua fluye desde `idPuntoOrigen` hacia `idPuntoDestino`.

**Importante:** Si el flujo puede ir en ambas direcciones (raro en agua potable), se crean 2 relaciones.

### 2. Estado de relaciones
- **Activa:** Operando normalmente
- **Inactiva:** Temporalmente fuera de servicio (mantenimiento, válvula cerrada)
- **Desactivada:** Permanentemente eliminada (tubería removida)

### 3. Prioridad en múltiples rutas
Si un punto puede recibir agua de múltiples orígenes, `prioridad` indica la ruta preferida:
- `prioridad: 1` → Ruta principal
- `prioridad: 2` → Ruta secundaria/backup

### 4. Validación de capacidades
`capacidadNominal` no debe superar la capacidad del punto de origen.

**Ejemplo:** Si Perforación Edén tiene capacidad de 50 m³/h, la suma de todas las relaciones "alimenta_a" que salen no debería superar 50 m³/h.

---

## 👥 ¿Quién la usa?

### Ingenieros Operativos
Modelan la topología de la red al implementar el sistema.

**Caso de uso:** Nueva instalación en Pueblo Edén
- Identifican todos los puntos de medición
- Definen las relaciones entre ellos según planos de red
- Cargan capacidades nominales y distancias

### Sistema de Análisis de Impacto
Calcula qué zonas se afectan si un punto falla.

**Caso de uso:** Perforación Edén entra en mantenimiento
- Sistema consulta relaciones donde origen = Perforación Edén
- Identifica: Booster Hospital y todas las zonas que dependen de él
- Genera plan: "Activar Perforación alternativa antes de desactivar Edén"

### Sistema de Detección de Fugas
Compara caudal entre puntos conectados.

**Caso de uso:** Pérdida entre Perforación y Booster
- Relación: Perforación Edén alimenta_a Booster Hospital (1500m de tubería)
- Caudal en Perforación: 45 m³/h
- Caudal en Booster (entrada): 38 m³/h
- **Diferencia: 7 m³/h** → Posible fuga en los 1500m de tubería entre ambos
- Genera alerta para inspección del tramo

### Dashboard de Red
Visualiza el flujo de agua en mapas interactivos.

**Visualización:**
```
Perforación Edén ─────[45 m³/h]────→ Booster Hospital ─────[40 m³/h]────→ Zonas
       ✅ OK                          ⚠️ Presión baja                      ✅ OK
```

---

## 📊 Beneficios Operativos

### Análisis que permite:

#### 1. Balance Hídrico por Sector
```
Sector "Pueblo Edén":
  Entrada: Perforación Edén (50 m³/h)
  Salida:
    - Zona A: 20 m³/h
    - Zona B: 15 m³/h
    - Hospital: 10 m³/h
  Total salida: 45 m³/h
  Pérdidas: 5 m³/h (10%)
```

#### 2. Análisis de Impacto Operativo
```
Si falla: Booster Hospital
  → Afecta a: 80 medidores residenciales + Hospital
  → Población afectada: ~300 personas
  → Acción requerida: Activar booster backup inmediatamente
```

#### 3. Optimización de Mantenimiento
```
Mantenimiento programado: Perforación Edén
  Puntos dependientes: Booster Hospital
  Acción previa requerida:
    1. Activar Perforación alternativa
    2. Validar que Booster recibe agua de fuente alternativa
    3. Confirmar presión estable en zonas
  → Recién ahí desactivar Perforación Edén
```

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { IRelacionTopologica } from 'ose-modelos';

// Crear relación: Perforación Edén alimenta a Booster Hospital
const relacion: IRelacionTopologica = {
  idCliente: "ose-uruguay",
  idDistrito: "distrito-eden",

  // Direccionalidad del flujo
  idPuntoOrigen: "pm-perf-001",  // Perforación Edén
  idPuntoDestino: "pm-boost-001", // Booster Hospital
  tipoRelacion: "alimenta_a",

  // Características técnicas
  capacidadNominal: 50, // m³/h
  distanciaAproximada: 1500, // metros
  diametroTuberia: 200, // mm

  // Estado
  estado: "activa",
  descripcion: "Tubería principal desde perforación hasta booster de distribución"
};
```

**Ver:** `relacion-topologica.ts` para definición técnica completa
