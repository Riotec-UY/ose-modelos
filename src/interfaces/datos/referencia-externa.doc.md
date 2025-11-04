# Referencia Externa

**Entidad:** `IReferenciaExterna`
**Contexto:** Datos / Integración
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa el **mapeo entre una entidad canónica RIOTEC** y su identificador en un sistema externo. Permite que una misma entidad tenga múltiples IDs en diferentes sistemas.

**Concepto clave:** Separación del modelo canónico de sistemas externos (External System Reference Pattern).

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `entidadCanonica` | Qué entidad RIOTEC referencia | {id: "pm-boost-001", tipo: "PuntoMedicion"} |
| `fuenteDatos` | En qué sistema externo | "zeus-maldonado" |
| `idExterno` | ID en el sistema externo | "ZEUS-BOOST-HOSP" |
| `tipoExterno` | Tipo de entidad en sistema externo | "station" |
| `estado` | Estado de la referencia | "activa" / "obsoleta" / "error" |

---

## 💡 Ejemplo: Booster Hospital en Múltiples Sistemas

```yaml
Entidad Canónica:
  Tipo: PuntoMedicion
  ID: pm-boost-001
  Nombre: "Booster Hospital"

Tiene 3 Referencias Externas:

Referencia 1:
  Fuente: "Zeus SCADA Maldonado"
  ID Externo: "ZEUS-BOOST-HOSP"
  Tipo Externo: "station"
  Estado: activa
  Uso: Obtener lecturas de presión y caudal

Referencia 2:
  Fuente: "GIS ArcGIS"
  ID Externo: "layer:boosters/feature:42"
  Tipo Externo: "feature"
  Estado: activa
  Uso: Obtener ubicación geográfica

Referencia 3:
  Fuente: "Sistema Comercial OSE"
  ID Externo: "ACTIVO-INF-001"
  Tipo Externo: "asset"
  Estado: activa
  Uso: Gestión de activos, mantenimiento
```

---

## 🔗 Se relaciona con

- **Cualquier entidad canónica:** PuntoMedicion, Distrito, Lectura, etc.
- **Fuente de Datos:** De qué sistema viene la referencia
- **Configuración de Integración:** Usa referencias para mapear datos

---

## 💡 Ventajas del Patrón

**Independencia:**
- El modelo canónico no contiene IDs externos
- Se pueden agregar/quitar sistemas sin afectar el core

**Flexibilidad:**
- Una entidad puede tener múltiples referencias
- Facilita migración entre sistemas

**Trazabilidad:**
- Saber qué entidades vienen de qué sistemas
- Facilita reconciliación de datos

---

## 💡 Ejemplo de Uso: Sincronización

```typescript
// 1. Zeus SCADA envía datos de "ZEUS-BOOST-HOSP"
datosZeus = {
  station_id: "ZEUS-BOOST-HOSP",
  pressure_in: 4.5,
  pressure_out: 6.2
};

// 2. Sistema busca la referencia externa
ref = await db.referencias.findOne({
  fuenteDatos: "zeus-maldonado",
  idExterno: "ZEUS-BOOST-HOSP"
});
// → ref.entidadCanonica.id = "pm-boost-001"

// 3. Crea lecturas para la entidad canónica
lectura = {
  idPuntoMedicion: "pm-boost-001",  // ID canónico
  tipoLectura: "Booster Presión Entrada",
  valores: { presion: 4.5 }
};
```

---

## ⚙️ Estados

**activa:** Referencia operativa, se usa para sincronizaciones

**obsoleta:** Entidad ya no existe en sistema externo, referencia histórica

**error:** Problema de mapeo, requiere revisión

---

**Ver:** `referencia-externa.ts` para definición técnica completa
