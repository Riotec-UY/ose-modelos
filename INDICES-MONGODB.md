# Índices MongoDB Recomendados

**Versión**: 1.0.0
**Fecha**: 4 Nov 2025
**Base**: Modelo v1.4.0 (configuraciones embebidas)

Este documento define los índices MongoDB recomendados para el sistema OSE Aguas, optimizados para el modelo con configuraciones embebidas en `IPuntoMedicion`.

---

## 📋 Tabla de Contenidos

- [Principios de Indexación](#principios-de-indexación)
- [Índices por Colección](#índices-por-colección)
  - [puntosMedicion](#puntosmedicion)
  - [lecturas](#lecturas)
  - [distritos](#distritos)
  - [usuarios](#usuarios)
- [Queries Comunes Optimizados](#queries-comunes-optimizados)
- [Mantenimiento de Índices](#mantenimiento-de-índices)

---

## 🎯 Principios de Indexación

### 1. **Cardinalidad Alta Primero**
Campos con alta variabilidad (ej: `_id`, `codigo`) antes que campos de baja variabilidad (ej: `tipo`, `estado`).

### 2. **Selectividad en Queries**
Índices compuestos ordenados según el filtro más selectivo primero.

### 3. **Evitar Exceso de Índices**
Cada índice tiene costo en writes. Crear solo índices que se usan frecuentemente.

### 4. **TTL para Lecturas**
Las lecturas expiran automáticamente después de X meses (configurable).

### 5. **Geoespacial para Ubicaciones**
Usar índices `2dsphere` para queries de proximidad y áreas.

---

## 📊 Índices por Colección

### `puntosMedicion`

Colección principal con configuraciones embebidas.

```javascript
// ===============================
// ÍNDICES BÁSICOS
// ===============================

// 1. Multi-tenant raíz (SIEMPRE filtrar por cliente)
db.puntosMedicion.createIndex({
  "idCliente": 1
});

// 2. Búsqueda por código único
db.puntosMedicion.createIndex({
  "codigo": 1
}, {
  unique: true,
  sparse: true  // Permite null/undefined
});

// 3. Filtro por tipo y estado (común en dashboards)
db.puntosMedicion.createIndex({
  "idCliente": 1,
  "tipo": 1,
  "estado": 1
});

// 4. Jerarquía organizacional
db.puntosMedicion.createIndex({
  "idCliente": 1,
  "idDivision": 1,
  "idJefatura": 1
});

// 5. Puntos por distrito (balance hídrico)
db.puntosMedicion.createIndex({
  "idDistrito": 1
});

// ===============================
// ÍNDICES GEOESPACIALES
// ===============================

// 6. Queries espaciales (puntos cercanos, dentro de área)
db.puntosMedicion.createIndex({
  "ubicacion.geojson": "2dsphere"
});

// ===============================
// ÍNDICES PARA CONFIGURACIONES EMBEBIDAS ⭐
// ===============================

// 7. Filtrar por fuente de datos externa (ej: "todos los de Zeus")
//    Caso de uso: Monitoring de integraciones, filtros en UI
db.puntosMedicion.createIndex({
  "configuracionIntegracion.idFuenteDatos": 1
});

// 8. Puntos con sincronización en error
//    Caso de uso: Alertas, dashboards de salud
db.puntosMedicion.createIndex({
  "configuracionIntegracion.estado": 1
});

// 9. Puntos con errores consecutivos
//    Caso de uso: Priorizar puntos con muchos fallos
db.puntosMedicion.createIndex({
  "configuracionIntegracion.contadorErroresConsecutivos": 1
}, {
  sparse: true  // Solo indexar si existe el campo
});

// 10. Buscar puntos con lectura específica configurada
//     Caso de uso: "Todos los puntos que deberían tener presión"
db.puntosMedicion.createIndex({
  "configuracionesLectura.tipoLectura": 1
});

// 11. Lecturas obligatorias (para alertas)
db.puntosMedicion.createIndex({
  "configuracionesLectura.obligatoria": 1,
  "configuracionesLectura.tipoLectura": 1
});

// 12. Acceso rápido a última lectura por tipo
//     Caso de uso: Dashboards que muestran solo última lectura
db.puntosMedicion.createIndex({
  "ultimaLecturaPorTipo": 1
}, {
  sparse: true
});

// ===============================
// ÍNDICES COMPUESTOS AVANZADOS
// ===============================

// 13. Puntos operativos de Zeus con errores (query común en monitoring)
db.puntosMedicion.createIndex({
  "idCliente": 1,
  "estado": 1,
  "configuracionIntegracion.idFuenteDatos": 1,
  "configuracionIntegracion.estado": 1
});

// 14. Balance hídrico: puntos de entrada/salida por distrito
db.puntosMedicion.createIndex({
  "idDistrito": 1,
  "funcionBalanceHidrico": 1,
  "estado": 1
});
```

**Resumen**:
- **Total**: 14 índices
- **Geoespaciales**: 1
- **Compuestos**: 5
- **Para configuraciones embebidas**: 6 ⭐

---

### `lecturas`

Colección de series temporales (millones de documentos).

```javascript
// ===============================
// ÍNDICES BÁSICOS
// ===============================

// 1. Lecturas por punto (query más común)
db.lecturas.createIndex({
  "idPuntoMedicion": 1,
  "valores.timestamp": -1  // Descendente para obtener últimas primero
});

// 2. Multi-tenant
db.lecturas.createIndex({
  "idCliente": 1
});

// 3. Búsqueda por rango temporal (análisis histórico)
db.lecturas.createIndex({
  "valores.timestamp": -1
});

// 4. Filtro por tipo de lectura
db.lecturas.createIndex({
  "tipoLectura": 1
});

// 5. Lecturas con errores (calidad de datos)
db.lecturas.createIndex({
  "calidadDato": 1
});

// ===============================
// ÍNDICES COMPUESTOS AVANZADOS
// ===============================

// 6. Lecturas por punto, tipo y rango temporal (query común)
db.lecturas.createIndex({
  "idPuntoMedicion": 1,
  "tipoLectura": 1,
  "valores.timestamp": -1
});

// 7. Fuente de datos + timestamp (auditoría de integraciones)
db.lecturas.createIndex({
  "metadatosOrigen.idFuenteDatos": 1,
  "valores.timestamp": -1
});

// ===============================
// TTL - EXPIRACIÓN AUTOMÁTICA ⏰
// ===============================

// 8. TTL: Lecturas expiran automáticamente después de X meses
//    Ajustar según requisitos de retención
db.lecturas.createIndex(
  { "expireAt": 1 },
  { expireAfterSeconds: 0 }  // Expira en la fecha especificada en expireAt
);

// Ejemplo de uso al crear lectura:
// lectura.expireAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 meses
```

**Resumen**:
- **Total**: 8 índices
- **TTL**: 1 (expiración automática)
- **Compuestos**: 2

**Nota**: Para análisis de series temporales masivas, considerar MongoDB Time Series Collections (MongoDB 5.0+).

---

### `distritos`

Distritos pitométricos (zonas de balance hídrico).

```javascript
// 1. Distritos por jefatura
db.distritos.createIndex({
  "idJefatura": 1
});

// 2. Búsqueda por código
db.distritos.createIndex({
  "codigo": 1
}, {
  unique: true,
  sparse: true
});

// 3. Distritos activos
db.distritos.createIndex({
  "activo": 1
});

// 4. Queries espaciales (buscar distritos que contengan un punto)
db.distritos.createIndex({
  "frontera": "2dsphere"
});

// Query de ejemplo:
// db.distritos.find({
//   frontera: {
//     $geoIntersects: {
//       $geometry: { type: "Point", coordinates: [-54.9333, -34.9167] }
//     }
//   }
// });
```

---

### `usuarios`

Usuarios con permisos embebidos (patrón IRIX).

```javascript
// 1. Login por email
db.usuarios.createIndex({
  "email": 1
}, {
  unique: true
});

// 2. Login por username (opcional)
db.usuarios.createIndex({
  "username": 1
}, {
  unique: true,
  sparse: true
});

// 3. Usuarios por cliente
db.usuarios.createIndex({
  "idCliente": 1
});

// 4. Usuarios por estado (activos/inactivos)
db.usuarios.createIndex({
  "estado": 1
});

// 5. Búsqueda de usuarios con permisos en contexto específico
db.usuarios.createIndex({
  "permisos.idCliente": 1,
  "permisos.idDivision": 1,
  "permisos.activo": 1
});

// 6. Búsqueda por rol
db.usuarios.createIndex({
  "permisos.roles": 1
});
```

---

### `sesiones`

Sesiones activas (JWT).

```javascript
// 1. Búsqueda por token
db.sesiones.createIndex({
  "token": 1
}, {
  unique: true
});

// 2. Sesiones por usuario
db.sesiones.createIndex({
  "idUsuario": 1
});

// 3. TTL: Sesiones expiran automáticamente
db.sesiones.createIndex(
  { "fechaExpiracion": 1 },
  { expireAfterSeconds: 0 }
);
```

---

## 🔍 Queries Comunes Optimizados

### Query 1: Obtener punto completo (configuraciones + última lectura)

```javascript
// ✅ 1 SOLA query (configuraciones embebidas)
const punto = await db.puntosMedicion.findOne({
  _id: ObjectId('punto-123')
});

// Retorna:
// - punto.configuracionesLectura (embebido)
// - punto.configuracionIntegracion (embebido)
// - punto.ultimaLecturaPorTipo (embebido)

// Índice usado: { _id: 1 } (automático)
```

**Performance**: ~1ms (single document lookup)

---

### Query 2: Filtrar puntos por fuente de datos (ej: "todos los de Zeus")

```javascript
const puntosZeus = await db.puntosMedicion.find({
  'configuracionIntegracion.idFuenteDatos': 'fuente-zeus'
});

// Índice usado: { "configuracionIntegracion.idFuenteDatos": 1 }
```

**Performance**: ~5-20ms (depende de cantidad de puntos)

---

### Query 3: Puntos con sincronización en error

```javascript
const puntosError = await db.puntosMedicion.find({
  'configuracionIntegracion.estado': 'error',
  'configuracionIntegracion.contadorErroresConsecutivos': { $gte: 3 }
});

// Índice usado: { "configuracionIntegracion.estado": 1 }
```

---

### Query 4: Lecturas de un punto en rango temporal

```javascript
const lecturas = await db.lecturas.find({
  idPuntoMedicion: 'punto-123',
  'valores.timestamp': {
    $gte: '2025-11-01T00:00:00Z',
    $lte: '2025-11-04T23:59:59Z'
  }
}).sort({ 'valores.timestamp': -1 }).limit(1000);

// Índice usado: { "idPuntoMedicion": 1, "valores.timestamp": -1 }
```

**Performance**: ~10-50ms (con índice compuesto)

---

### Query 5: Balance hídrico - puntos de entrada en distrito

```javascript
const puntosEntrada = await db.puntosMedicion.find({
  idDistrito: 'dist-eden',
  funcionBalanceHidrico: 'entrada',
  estado: 'operativo'
});

// Índice usado: { "idDistrito": 1, "funcionBalanceHidrico": 1, "estado": 1 }
```

---

### Query 6: Puntos cerca de una ubicación

```javascript
const puntosCercanos = await db.puntosMedicion.find({
  'ubicacion.geojson': {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-54.9333, -34.9167]  // [lng, lat]
      },
      $maxDistance: 1000  // 1km en metros
    }
  }
});

// Índice usado: { "ubicacion.geojson": "2dsphere" }
```

---

### Query 7: Puntos dentro de un distrito (geoespacial)

```javascript
// Primero obtener la frontera del distrito
const distrito = await db.distritos.findOne({ codigo: 'DPE-001' });

// Luego buscar puntos dentro
const puntosEnDistrito = await db.puntosMedicion.find({
  'ubicacion.geojson': {
    $geoWithin: {
      $geometry: distrito.frontera  // IGeoJSONPolygon
    }
  }
});

// Índice usado: { "ubicacion.geojson": "2dsphere" }
```

---

## 🔧 Mantenimiento de Índices

### Verificar índices existentes

```javascript
db.puntosMedicion.getIndexes();
```

### Analizar uso de índices

```javascript
db.puntosMedicion.aggregate([
  { $indexStats: {} }
]);
```

### Eliminar índice no usado

```javascript
db.puntosMedicion.dropIndex("nombre_del_indice");
```

### Reconstruir índices (solo si es necesario)

```javascript
db.puntosMedicion.reIndex();
```

**⚠️ Advertencia**: `reIndex()` bloquea la colección. Ejecutar en horarios de bajo tráfico.

---

## 📈 Monitoreo de Performance

### Query con explain plan

```javascript
db.puntosMedicion.find({
  'configuracionIntegracion.idFuenteDatos': 'fuente-zeus'
}).explain("executionStats");
```

Verificar:
- `executionStats.executionTimeMillis` < 100ms (ideal < 50ms)
- `executionStats.totalDocsExamined` ≈ `executionStats.nReturned` (sin scan completo)
- `winningPlan.inputStage.stage` = "IXSCAN" (usa índice)

---

## 🎯 Checklist de Implementación

- [ ] Crear índices en `puntosMedicion` (14 índices)
- [ ] Crear índices en `lecturas` (8 índices, incluir TTL)
- [ ] Crear índices en `distritos` (4 índices)
- [ ] Crear índices en `usuarios` (6 índices)
- [ ] Crear índices en `sesiones` (3 índices, incluir TTL)
- [ ] Configurar TTL para `lecturas.expireAt` (retención de datos)
- [ ] Configurar TTL para `sesiones.fechaExpiracion` (sesiones expiradas)
- [ ] Verificar índices con `explain()` en queries comunes
- [ ] Monitorear uso de índices con `$indexStats`
- [ ] Ajustar índices según patrones de uso reales

---

## 📚 Referencias

- [MongoDB Index Strategies](https://www.mongodb.com/docs/manual/applications/indexes/)
- [MongoDB 2dsphere Indexes](https://www.mongodb.com/docs/manual/core/2dsphere/)
- [MongoDB TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/)
- [MongoDB Query Optimization](https://www.mongodb.com/docs/manual/core/query-optimization/)

---

**Última actualización**: 4 Nov 2025
**Versión del modelo**: 1.4.0
