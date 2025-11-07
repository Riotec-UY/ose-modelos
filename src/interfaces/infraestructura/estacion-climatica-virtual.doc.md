# Estación Climática Virtual

**Entidad:** `IEstacionClimaticaVirtual`
**Contexto:** Infraestructura
**Versión:** 1.0.0
**Última actualización:** 6 Nov 2025

---

## 🎯 ¿Qué es?

Una **estación climática virtual** es un punto lógico (NO físico) que agrupa datos meteorológicos para un área geográfica con radio de cobertura de ~15 km.

**Concepto clave:** Es VIRTUAL, no representa hardware físico real. Es un concepto de optimización para reducir costos de APIs climáticas.

### Diferencias con estación física:
- ❌ **NO es** una estación meteorológica física (como las de INUMET)
- ❌ **NO es** hardware instalado en campo
- ✅ **SÍ es** un punto de consulta a APIs externas (Visual Crossing, INUMET, etc.)
- ✅ **SÍ es** un concepto de agregación para optimizar recursos

---

## 🏗️ ¿Para qué sirve?

En el sistema OSE, necesitamos datos climáticos para correlacionar consumo de agua con factores meteorológicos (temperatura, precipitación, humedad). Sin optimización, necesitaríamos consultar la API climática por cada punto de medición.

### Problema sin estaciones virtuales:
```
326 medidores × 24 horas = 7,824 API calls/día ❌
Costo: ~$48 USD/mes
```

### Solución con estaciones virtuales:
```
4 estaciones × 24 horas = 96 API calls/día ✅
Costo: $0 USD/mes (free tier)
Ahorro: 98% de reducción
```

### Permite:
1. **Optimización de costos**: 98% reducción en API calls
2. **Datos siempre disponibles**: Polling proactivo cada hora
3. **Escalabilidad**: Viable hasta nivel nacional
4. **Simplicidad**: Creación y asociación automática

---

## ⚡ Creación Automática

**IMPORTANTE**: Las estaciones virtuales se crean automáticamente al agregar puntos de medición.

### Algoritmo:

```
Al crear PuntoMedicion:
  1. Buscar estación virtual cercana (<15 km)
  2. Si existe → Reutilizar (sin crear nueva)
  3. Si NO existe → Crear estación virtual automáticamente
  4. Programar primera actualización inmediata
```

### Ejemplo:

```yaml
# Primer punto en zona Edén
Crear PuntoMedicion("Medidor Residencial 001", ubicación: -34.6456, -54.7123)
→ No hay estación cercana
→ Crea automáticamente: "Estación Climática Virtual Edén" (ECV-EDEN-001)

# Segundo punto en zona Edén (dentro de 15 km)
Crear PuntoMedicion("Medidor Residencial 002", ubicación: -34.6470, -54.7150)
→ Ya existe "ECV-EDEN-001" a 2 km
→ Reutiliza estación existente (NO crea nueva)
```

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `nombre` | Nombre descriptivo | "Estación Climática Virtual Pueblo Edén" |
| `codigo` | Código único | "ECV-EDEN-001" |
| `ubicacion` | Coordenadas centrales | lat: -34.6456, lon: -54.7123 |
| `radioCoberturaKm` | Radio de cobertura | 15 km (configurable) |
| `idFuenteDatos` | API climática que usa | "visual-crossing-api" |
| `frecuenciaPollingMinutos` | Cada cuánto actualiza | 60 (cada hora) |
| `ultimaLectura` | Snapshot de clima actual | temp: 24°C, humedad: 65% |
| `estado` | Estado operacional | "activa" / "pausada" / "error" / "inactiva" |
| `creadoPor` | Origen de creación | "automatico" / "manual" |

---

## 💡 Ejemplo Completo: Estación Virtual Edén

```yaml
Estación Climática Virtual:
  ID: ecv-eden-001
  Cliente: OSE Uruguay
  División: UGD Maldonado
  Jefatura: Jefatura Pueblo Edén

  Nombre: "Estación Climática Virtual Pueblo Edén"
  Código: "ECV-EDEN-001"
  Descripción: "Estación creada automáticamente para zona Edén"

  Ubicación:
    Latitud: -34.6456
    Longitud: -54.7123
    Radio de Cobertura: 15 km

  Configuración:
    Fuente de Datos: "Visual Crossing API"
    Frecuencia Polling: 60 minutos (cada hora)
    Última Actualización: hace 23 minutos
    Próxima Actualización: en 37 minutos

  Última Lectura:
    Timestamp: 2025-11-06T14:00:00Z
    Temperatura: 24°C
    Humedad: 65%
    Precipitación: 0 mm
    Presión Atmosférica: 1013 hPa
    Velocidad Viento: 15 km/h
    Dirección Viento: 90° (Este)

  Estado: activa
  Creado Por: automatico
  Punto Origen: pm-res-001 (primer medidor de la zona)

  Puntos Asociados: 95 medidores (calculado)
```

---

## 🔄 Polling Automático

Cada hora en punto (00 minutos), un job scheduler actualiza todas las estaciones activas:

```
Cron Job: "0 * * * *"  # Cada hora en punto

Para cada EstacionClimaticaVirtual con estado = 'activa':
  1. Llamar a API climática (Visual Crossing, INUMET, etc.)
  2. Guardar dato completo en colección DatoClimatico
  3. Actualizar snapshot ultimaLectura (acceso rápido)
  4. Marcar proximaActualizacion: en 60 minutos
```

---

## 📊 Escenarios de Uso

### Piloto Maldonado (326 medidores)
```yaml
Distribución:
  - Garzón: 157 medidores → 1-2 estaciones
  - Edén: 95 medidores → 1 estación
  - Los Talas: 74 medidores → 1 estación
  Total: 3-4 estaciones virtuales

API calls/día:
  Sin optimización: 7,824 calls
  Con optimización: 96 calls (98% reducción)

Costo:
  Sin optimización: $48/mes (excede free tier)
  Con optimización: $0/mes (dentro de free tier)
```

### Expansión UGD Maldonado (~2,000 puntos)
```yaml
Estaciones necesarias: 20-25
API calls/día: 600
Uso free tier: 60%
Costo: $0/mes (aún gratis)
```

### Expansión Nacional (19 UGDs, ~15,000 puntos)
```yaml
Estaciones necesarias: 150-200
API calls/día: 4,800
Uso free tier: 480% (excede)
Costo estimado: $240/mes
Costo por punto: $0.016/mes (muy bajo)
```

---

## 🔗 Se relaciona con

- **PuntoMedicion**: Múltiples puntos asociados geográficamente (dentro del radio)
- **DatoClimatico**: Historial completo de lecturas climáticas
- **FuenteDatos** (tipo 'clima'): API meteorológica externa que consulta
- **ISnapshotClimatico**: Embebido en `ultimaLectura` para acceso ultra-rápido

---

## 🌡️ Estados

| Estado | Descripción | Próxima acción |
|--------|-------------|----------------|
| `activa` | Polling operativo, actualizándose cada hora | Continuar polling |
| `pausada` | Desactivada temporalmente (manual) | Esperar reactivación manual |
| `error` | Error en última sincronización con API | Reintentar, notificar admin |
| `inactiva` | Sin puntos asociados, candidata a eliminación | Job de limpieza la elimina |

---

## ⚙️ Configuración por Topografía

El radio de cobertura es **configurable** según características geográficas:

| Zona | Radio Recomendado | Razón |
|------|------------------|-------|
| Zona plana | 15-20 km | Clima homogéneo |
| Zona montañosa | 5-10 km | Microclimas por topografía |
| Zona costera | 10-15 km | Influencia marítima variable |

---

## 🗺️ Queries Geoespaciales

Las estaciones usan índices geoespaciales MongoDB 2dsphere para asociación eficiente:

```javascript
// Buscar estación cercana a un punto
db.estacionesclimaticasvirtuales.findOne({
  idCliente: "ose-uruguay",
  estado: { $in: ["activa", "pausada"] },
  ubicacion: {
    $nearSphere: {
      $geometry: { type: "Point", coordinates: [lon, lat] },
      $maxDistance: 15000  // 15 km en metros
    }
  }
});

// Buscar puntos dentro del radio de una estación
db.puntosmedicion.find({
  ubicacion: {
    $geoWithin: {
      $centerSphere: [
        [estacion.lon, estacion.lat],
        15 / 6371  // Radio en radianes (15 km / radio Tierra)
      ]
    }
  }
});
```

---

## 👥 ¿Quién la usa?

**Sistema (automático):**
- Crea estaciones al agregar puntos de medición
- Job de polling horario actualiza datos climáticos
- API asocia puntos con estación más cercana

**Administradores:**
- Pueden crear estaciones manualmente en casos especiales
- Configuran radio de cobertura según topografía
- Pausan/reactivan estaciones según necesidad

**Frontend:**
- Dashboard muestra mapa con estaciones y su cobertura
- Widget de clima consulta `ultimaLectura` de estación cercana
- Heat map climático superpuesto en mapa de red

---

## 📈 Métricas y Optimización

### Job de limpieza semanal:
```
Cada domingo a las 03:00:
  1. Buscar estaciones con puntosAsociadosCount = 0
  2. Si llevan > 30 días sin puntos → Marcar como 'inactiva'
  3. Si llevan > 90 días inactivas → Eliminar permanentemente
```

### Alertas automáticas:
```
Si contadorErroresConsecutivos > 5:
  → Marcar estado = 'error'
  → Notificar administrador
  → Pausar polling temporalmente

Si estado = 'error' por > 24 horas:
  → Intentar cambiar a fuente backup (ej: INUMET si falla Visual Crossing)
```

---

## 🚀 Beneficios

✅ **98% reducción** en API calls (piloto Maldonado)
✅ **$0 costo** para piloto (dentro de free tier)
✅ **Datos siempre disponibles** (polling proactivo)
✅ **Escalable** hasta nivel nacional
✅ **Creación automática** (cero configuración manual)
✅ **Realismo meteorológico** (15 km es razonable para clima)

---

**Ver:** `estacion-climatica-virtual.ts` para definición técnica completa
