# 📊 Registro de Sincronización - Auditoría de Integraciones

## 🎯 ¿Qué es?

`IRegistroSincronizacion` es un **log estructurado de auditoría operacional** que documenta cada ejecución de sincronización con sistemas externos (ATLAS, Zeus, otros).

Es el componente central del **sistema de monitoreo de integraciones** y permite:
- 🔍 Debugging rápido de problemas de integración
- 📊 Dashboard de salud en tiempo real
- 🚨 Alertas automáticas de degradación
- 📈 Métricas de SLA y disponibilidad
- 📝 Compliance y trazabilidad regulatoria

---

## 💡 ¿Por Qué es Crítico para el Piloto OSE?

### **Escenario Real:**

**10:15 AM - Operador OSE Maldonado:**
> "El medidor ATL-EDN-0045 no muestra lecturas desde las 09:30. ¿Es problema del medidor o de la integración con ATLAS?"

**Sin IRegistroSincronizacion:**
- Buscar en logs dispersos de NestJS
- No hay visibilidad de qué sincronizaciones se ejecutaron
- Debugging manual, lento, sin métricas

**Con IRegistroSincronizacion:**

```javascript
// Query simple en MongoDB:
db.registrosSincronizacion.find({
  idFuenteDatos: "fuente-atlas-maldonado",
  timestampInicio: { $gte: "2025-11-04T09:00:00Z" }
}).sort({ timestampInicio: -1 });
```

**Respuesta inmediata:**
```json
{
  "_id": "reg-sync-001",
  "timestampInicio": "2025-11-04T09:30:00Z",
  "timestampFin": "2025-11-04T09:30:45Z",
  "resultado": "error",
  "estadisticas": {
    "registrosProcesados": 0,
    "duracionMs": 45000
  },
  "errores": [
    {
      "tipo": "API_ERROR",
      "mensaje": "ATLAS API devolvió 503 Service Unavailable",
      "codigoError": "503"
    }
  ]
}
```

**Conclusión:** El problema es de ATLAS (no del medidor). El operador puede llamar a soporte de Teleimpresores.

---

## 📋 Casos de Uso

### **Caso 1: Polling Periódico (ATLAS)**

**Escenario:** Cron job ejecuta sincronización con ATLAS cada 15 minutos.

**Datos OSE Maldonado:**
- 326 medidores residenciales (Garzón: 157, Edén: 95, Los Talas: 74)
- Lecturas cada 10 minutos
- Frecuencia sincronización: cada 15 minutos

**Registro de sincronización exitosa:**

```json
{
  "_id": "reg-sync-atlas-001",
  "idCliente": "ose-uruguay",
  "idFuenteDatos": "fuente-atlas-maldonado",
  "tipoOperacion": "ingesta_lecturas",

  "timestampInicio": "2025-11-04T10:00:00.000Z",
  "timestampFin": "2025-11-04T10:02:15.350Z",
  "resultado": "exito",
  "mensajeResultado": "Sincronización completada exitosamente",

  "estadisticas": {
    "totalRegistrosOrigen": 326,
    "registrosProcesados": 326,
    "registrosCreados": 8,
    "registrosActualizados": 315,
    "registrosSinCambios": 3,
    "registrosConErrores": 0,

    "porcentajeExito": 100,
    "duracionMs": 135350,
    "duracionPromedioRegistroMs": 415,

    "lecturasValidas": 323,
    "lecturasSospechosas": 0,
    "lecturasError": 0,
    "puntosConNuevosValores": 323,
    "puntosSinComunicacion": 3,

    "otros": {
      "bateriasBajas": 2,
      "señalBaja": 5,
      "consumoAnormalDetectado": 1
    }
  },

  "errores": [],
  "esManual": false,
  "fechaCreacion": "2025-11-04T10:00:00.000Z"
}
```

**Qué nos dice:**
- ✅ Sincronización OK en 2m 15s
- ✅ 323 de 326 medidores con datos nuevos (99.1%)
- ⚠️ 3 medidores sin comunicación (requiere atención)
- ⚠️ 2 medidores con batería baja (mantenimiento preventivo)

---

### **Caso 2: Sincronización con Errores Parciales**

**Escenario:** ATLAS responde pero algunos medidores tienen problemas.

```json
{
  "_id": "reg-sync-atlas-002",
  "idCliente": "ose-uruguay",
  "idFuenteDatos": "fuente-atlas-maldonado",
  "tipoOperacion": "ingesta_lecturas",

  "timestampInicio": "2025-11-04T10:15:00.000Z",
  "timestampFin": "2025-11-04T10:17:30.200Z",
  "resultado": "exito_parcial",
  "mensajeResultado": "Completado con 15 errores no críticos",

  "estadisticas": {
    "totalRegistrosOrigen": 326,
    "registrosProcesados": 326,
    "registrosCreados": 5,
    "registrosActualizados": 306,
    "registrosSinCambios": 0,
    "registrosConErrores": 15,

    "porcentajeExito": 95.4,
    "duracionMs": 150200,
    "duracionPromedioRegistroMs": 461,

    "lecturasValidas": 311,
    "lecturasSospechosas": 8,
    "lecturasError": 7,
    "puntosConNuevosValores": 311,
    "puntosSinComunicacion": 15
  },

  "errores": [
    {
      "timestamp": "2025-11-04T10:15:22.100Z",
      "tipo": "VALIDATION_ERROR",
      "mensaje": "Consumo acumulado menor que lectura anterior (posible reset del medidor)",
      "entidadAfectada": {
        "tipo": "Lectura",
        "idExterno": "ATL-EDN-0023"
      },
      "contexto": {
        "valorAnterior": 1234.5,
        "valorActual": 45.2,
        "diferencia": -1189.3
      }
    },
    {
      "timestamp": "2025-11-04T10:16:05.500Z",
      "tipo": "OUT_OF_RANGE",
      "mensaje": "Caudal instantáneo fuera de rango físico (>1000 l/h para medidor 12.5mm)",
      "entidadAfectada": {
        "tipo": "Lectura",
        "idExterno": "ATL-GAR-0098"
      },
      "contexto": {
        "valorRecibido": 2500,
        "rangoPermitido": [0, 1000],
        "unidad": "l/h"
      }
    },
    // ... más errores
  ],

  "erroresCriticos": 2,
  "erroresTotales": 15,
  "esManual": false
}
```

**Acciones automáticas del sistema:**
1. ✅ Crear `IAnomalia` por consumo anormal en ATL-EDN-0023
2. ✅ Marcar lecturas fuera de rango con `calidadDato: 'error'`
3. ⚠️ Enviar alerta a operador: "15 lecturas con errores (4.6%)"
4. 📊 No usar lecturas con error en balance hídrico

---

### **Caso 3: Fallo Completo (ATLAS caído)**

**Escenario:** API de ATLAS no responde (servicio caído, red, etc.)

```json
{
  "_id": "reg-sync-atlas-003",
  "idCliente": "ose-uruguay",
  "idFuenteDatos": "fuente-atlas-maldonado",
  "tipoOperacion": "ingesta_lecturas",

  "timestampInicio": "2025-11-04T10:30:00.000Z",
  "timestampFin": "2025-11-04T10:30:30.500Z",
  "resultado": "error",
  "mensajeResultado": "Fallo al conectar con API de ATLAS",

  "estadisticas": {
    "registrosProcesados": 0,
    "registrosCreados": 0,
    "registrosActualizados": 0,
    "registrosSinCambios": 0,
    "registrosConErrores": 0,

    "porcentajeExito": 0,
    "duracionMs": 30500
  },

  "errores": [
    {
      "timestamp": "2025-11-04T10:30:30.000Z",
      "tipo": "CONNECTION_ERROR",
      "mensaje": "Connection timeout after 30s",
      "codigoError": "ETIMEDOUT",
      "contexto": {
        "url": "https://api.atlas.maldonado.ose.uy/v1/lecturas",
        "intentos": 3,
        "timeoutMs": 10000
      }
    }
  ],

  "erroresCriticos": 1,
  "erroresTotales": 1,
  "esManual": false
}
```

**Acciones automáticas del sistema:**
1. 🚨 **Alerta crítica** a operador: "ATLAS sin conexión"
2. 🔄 Actualizar `IFuenteDatos.estado` a `'error'`
3. 🔄 Actualizar `IFuenteDatos.mensajeEstado` a "Connection timeout"
4. 📊 Dashboard muestra "ATLAS: ERROR (última sync exitosa hace 15 min)"

**Si 3 sincronizaciones consecutivas fallan:**
```javascript
// Verificar últimas 3 sincronizaciones
const ultimasTres = await db.registrosSincronizacion.find({
  idFuenteDatos: "fuente-atlas-maldonado"
}).sort({ timestampInicio: -1 }).limit(3);

if (ultimasTres.every(r => r.resultado === 'error')) {
  // 🚨 CRÍTICO: Generar anomalía de sistema
  await db.anomalias.insertOne({
    tipo: 'fallo_integracion',
    severidad: 'critica',
    descripcion: "ATLAS: 3 sincronizaciones consecutivas fallidas",
    idFuenteDatos: "fuente-atlas-maldonado"
  });
}
```

---

### **Caso 4: Sincronización Zeus (Macromedición)**

**Escenario:** Sincronización de perforaciones, boosters, depósitos desde Zeus SCADA.

**Datos OSE Maldonado:**
- 1 perforación en Edén (caudal 15-30 m³/h)
- 2 boosters (Hospital, Península)
- 3 depósitos

```json
{
  "_id": "reg-sync-zeus-001",
  "idCliente": "ose-uruguay",
  "idFuenteDatos": "fuente-zeus-maldonado",
  "tipoOperacion": "ingesta_lecturas",

  "timestampInicio": "2025-11-04T10:05:00.000Z",
  "timestampFin": "2025-11-04T10:05:12.800Z",
  "resultado": "exito",
  "mensajeResultado": "Sincronización Zeus completada",

  "estadisticas": {
    "totalRegistrosOrigen": 18,  // 6 puntos × 3 variables promedio
    "registrosProcesados": 18,
    "registrosCreados": 18,
    "registrosActualizados": 0,
    "registrosSinCambios": 0,
    "registrosConErrores": 0,

    "porcentajeExito": 100,
    "duracionMs": 12800,
    "duracionPromedioRegistroMs": 711,

    "lecturasValidas": 18,
    "puntosConNuevosValores": 6,

    "otros": {
      "tiposLectura": {
        "Perforacion Caudal": 1,
        "Deposito Nivel": 3,
        "Booster Presion Entrada": 2,
        "Booster Presion Salida": 2,
        "Booster Caudal": 2,
        "Sensor Calidad Cloro": 2,
        "Booster Estado": 2,
        "Deposito Estado": 3,
        "Perforacion Estado": 1
      }
    }
  },

  "errores": [],
  "esManual": false
}
```

**Qué nos dice:**
- ✅ Zeus más rápido que ATLAS (12s vs 2m) - Menos puntos
- ✅ 100% de puntos con datos nuevos
- ✅ Múltiples tipos de lecturas por punto (discriminated unions funcionando)

---

### **Caso 5: Reconciliación Manual**

**Escenario:** Operador detecta gap de datos y ejecuta re-sincronización manual.

```json
{
  "_id": "reg-sync-manual-001",
  "idCliente": "ose-uruguay",
  "idFuenteDatos": "fuente-atlas-maldonado",
  "tipoOperacion": "reconciliacion",

  "timestampInicio": "2025-11-04T11:00:00.000Z",
  "timestampFin": "2025-11-04T11:05:30.200Z",
  "resultado": "exito",
  "mensajeResultado": "Reconciliación manual completada",

  "estadisticas": {
    "registrosProcesados": 652,  // 326 medidores × 2 lecturas perdidas
    "registrosCreados": 645,
    "registrosActualizados": 0,
    "registrosSinCambios": 0,
    "registrosConErrores": 7,

    "porcentajeExito": 98.9,
    "duracionMs": 330200
  },

  "usuarioEjecucion": "user-operador-maldonado-001",
  "esManual": true,
  "parametros": {
    "rangoTemporal": {
      "inicio": "2025-11-04T09:30:00Z",
      "fin": "2025-11-04T10:00:00Z"
    },
    "medidoresEspecificos": null,  // null = todos
    "sobrescribirExistentes": false
  }
}
```

**Qué nos dice:**
- ✅ Gap de 30 min recuperado (645 lecturas)
- ✅ Operador identificado (trazabilidad)
- ✅ Parámetros documentados (qué rango se reconcilió)

---

## 📊 Estructura Detallada

### **Estadísticas (`IEstadisticasSincronizacion`)**

```typescript
{
  // Contadores básicos
  totalRegistrosOrigen: 326,       // Total disponible en ATLAS
  registrosProcesados: 326,        // Procesados por RIOTEC
  registrosCreados: 8,             // INSERT nuevos
  registrosActualizados: 315,      // UPDATE existentes
  registrosSinCambios: 3,          // Sin cambios (skip)
  registrosConErrores: 0,          // Con error (no insertados)

  // Métricas de calidad
  porcentajeExito: 100,            // (323 / 326) × 100
  tasaError: 0,                    // (0 / 326) × 100

  // Performance
  duracionMs: 135350,              // 2m 15s
  duracionPromedioRegistroMs: 415, // 135350 / 326

  // Calidad de datos (para lecturas)
  lecturasValidas: 323,            // calidadDato: 'valida'
  lecturasSospechosas: 0,          // calidadDato: 'sospechosa'
  lecturasError: 0,                // calidadDato: 'error'
  puntosConNuevosValores: 323,    // Puntos con ≥1 lectura nueva
  puntosSinComunicacion: 3,        // Sin respuesta

  // Metadatos específicos
  otros: {
    bateriasBajas: 2,              // Específico de ATLAS
    señalBaja: 5,                  // Específico de ATLAS/LoRa
    alarmasActivas: 0              // Específico de Zeus
  }
}
```

### **Errores (`IErrorSincronizacion[]`)**

```typescript
[
  {
    timestamp: "2025-11-04T10:15:22.100Z",
    tipo: "VALIDATION_ERROR",
    mensaje: "Consumo acumulado menor que lectura anterior",
    codigoError: null,
    entidadAfectada: {
      tipo: "Lectura",
      id: "lectura-abc123",        // ID canónico (si existe)
      idExterno: "ATL-EDN-0023"    // ID en ATLAS
    },
    contexto: {
      valorAnterior: 1234.5,
      valorActual: 45.2,
      posibleCausa: "Reset de medidor o error de transmisión"
    }
  }
]
```

---

## 🔄 Ciclo de Vida de un Registro

### **Paso 1: Inicio de Sincronización**

```typescript
// api-integracion/src/services/sincronizacion.service.ts
async iniciarSincronizacion(idFuenteDatos: string) {
  // 1. Crear registro con estado 'en_progreso'
  const registro = await db.registrosSincronizacion.insertOne({
    idCliente: "ose-uruguay",
    idFuenteDatos: idFuenteDatos,
    tipoOperacion: "ingesta_lecturas",
    timestampInicio: new Date().toISOString(),
    resultado: "en_progreso",
    estadisticas: {
      registrosProcesados: 0,
      registrosCreados: 0,
      registrosActualizados: 0,
      registrosSinCambios: 0,
      registrosConErrores: 0,
      duracionMs: 0
    },
    errores: []
  });

  return registro._id;
}
```

### **Paso 2: Procesamiento**

```typescript
async sincronizarATLAS(registroId: string) {
  try {
    // 2. Llamar API ATLAS
    const lecturas = await atlasAPI.getLecturas();

    // 3. Procesar cada lectura
    for (const lectura of lecturas) {
      try {
        await this.procesarLectura(lectura);
        contadores.procesados++;
        contadores.creados++;  // o actualizados++
      } catch (error) {
        contadores.errores++;
        erroresArray.push({
          timestamp: new Date().toISOString(),
          tipo: error.tipo,
          mensaje: error.message,
          entidadAfectada: { idExterno: lectura.medidor_id }
        });
      }
    }

  } catch (error) {
    // Error crítico (API no responde)
    throw error;
  }
}
```

### **Paso 3: Finalización**

```typescript
async finalizarSincronizacion(registroId: string, resultado: {
  exito: boolean,
  contadores: any,
  errores: any[]
}) {
  // 4. Actualizar registro con resultados finales
  await db.registrosSincronizacion.updateOne(
    { _id: registroId },
    {
      $set: {
        timestampFin: new Date().toISOString(),
        resultado: resultado.exito ? 'exito' : 'error',
        estadisticas: {
          ...contadores,
          duracionMs: Date.now() - timestampInicio.getTime(),
          porcentajeExito: (contadores.procesados / contadores.total) * 100
        },
        errores: resultado.errores,
        erroresTotales: resultado.errores.length
      }
    }
  );

  // 5. Actualizar estado de la fuente de datos
  await db.fuentesDatos.updateOne(
    { _id: idFuenteDatos },
    {
      $set: {
        'configuracion.ultimaSincronizacion': new Date().toISOString(),
        estado: resultado.exito ? 'activa' : 'error'
      }
    }
  );

  // 6. Generar alertas si es necesario
  if (!resultado.exito || resultado.errores.length > umbral) {
    await this.generarAlerta(registroId);
  }
}
```

---

## 🔍 Queries MongoDB Comunes

### **1. Última sincronización por fuente**

```javascript
db.registrosSincronizacion.findOne(
  { idFuenteDatos: "fuente-atlas-maldonado" },
  { sort: { timestampInicio: -1 } }
);
```

### **2. Sincronizaciones con error en últimas 24h**

```javascript
db.registrosSincronizacion.find({
  idFuenteDatos: "fuente-atlas-maldonado",
  resultado: { $in: ["error", "exito_parcial"] },
  timestampInicio: {
    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
}).sort({ timestampInicio: -1 });
```

### **3. Tasa de éxito últimos 7 días**

```javascript
db.registrosSincronizacion.aggregate([
  {
    $match: {
      idFuenteDatos: "fuente-atlas-maldonado",
      timestampInicio: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  },
  {
    $group: {
      _id: "$resultado",
      count: { $sum: 1 },
      duracionPromedio: { $avg: "$estadisticas.duracionMs" }
    }
  }
]);

// Resultado:
// [
//   { _id: "exito", count: 650, duracionPromedio: 135000 },
//   { _id: "exito_parcial", count: 15, duracionPromedio: 150000 },
//   { _id: "error", count: 7, duracionPromedio: 30000 }
// ]
// Tasa éxito: (650 / 672) × 100 = 96.7%
```

### **4. Detectar degradación de performance**

```javascript
// Comparar duración promedio última semana vs semana anterior
db.registrosSincronizacion.aggregate([
  {
    $match: {
      idFuenteDatos: "fuente-atlas-maldonado",
      resultado: "exito"
    }
  },
  {
    $bucket: {
      groupBy: "$timestampInicio",
      boundaries: [
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      ],
      default: "Anterior",
      output: {
        count: { $sum: 1 },
        duracionPromedio: { $avg: "$estadisticas.duracionMs" }
      }
    }
  }
]);

// Si duracionPromedio semana actual > 2x semana anterior → Alerta
```

### **5. Errores más frecuentes**

```javascript
db.registrosSincronizacion.aggregate([
  { $match: { idFuenteDatos: "fuente-atlas-maldonado" } },
  { $unwind: "$errores" },
  {
    $group: {
      _id: "$errores.tipo",
      count: { $sum: 1 },
      ejemplos: { $push: "$errores.mensaje" }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);

// Resultado:
// [
//   { _id: "VALIDATION_ERROR", count: 45, ejemplos: [...] },
//   { _id: "OUT_OF_RANGE", count: 23, ejemplos: [...] },
//   { _id: "CONNECTION_ERROR", count: 7, ejemplos: [...] }
// ]
```

---

## 📊 Dashboard de Monitoreo

### **Tarjetas de Estado (Cards)**

```
┌──────────────────────────────────────────────────────────┐
│ ATLAS Maldonado                                          │
│ ✅ ACTIVA                                                │
│                                                          │
│ Última sync exitosa: hace 2 minutos                     │
│ Tasa de éxito (24h): 98.5%                              │
│ Duración promedio: 2m 15s                               │
│ Próxima sync: en 13 minutos                             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Zeus SCADA Maldonado                                     │
│ ✅ ACTIVA                                                │
│                                                          │
│ Última sync exitosa: hace 4 minutos                     │
│ Tasa de éxito (24h): 100%                               │
│ Duración promedio: 12s                                  │
│ Próxima sync: en 1 minuto                               │
└──────────────────────────────────────────────────────────┘
```

### **Gráfico de Tendencia**

```
Duraciones de Sincronización (últimas 24h)

ms
300000 │                          ⚠️
       │                         ╱ ╲
250000 │                        ╱   ╲
       │                       ╱     ╲
200000 │         ⚠️           ╱       ╲
       │        ╱ ╲          ╱         ╲
150000 │  ─────╱───╲────────╱───────────╲─────────  Promedio: 135s
       │ ╱                                     ╲
100000 │╱                                       ╲
       │                                         ╲──
 50000 │
       │
     0 └─┬────┬────┬────┬────┬────┬────┬────┬────┬──>
        00h  04h  08h  12h  16h  20h  00h  04h  08h

✅ Exito    ⚠️ Exito Parcial    ❌ Error
```

### **Tabla de Últimas Sincronizaciones**

```
┌────────────┬──────────┬────────────┬──────────┬──────────┬──────────┐
│ Timestamp  │ Fuente   │ Resultado  │ Procesad │ Errores  │ Duración │
├────────────┼──────────┼────────────┼──────────┼──────────┼──────────┤
│ 10:45:00   │ ATLAS    │ ✅ Exito   │ 326      │ 0        │ 2m 10s   │
│ 10:44:00   │ Zeus     │ ✅ Exito   │ 18       │ 0        │ 11s      │
│ 10:30:00   │ ATLAS    │ ⚠️ Parcial │ 326      │ 12       │ 2m 35s   │
│ 10:29:00   │ Zeus     │ ✅ Exito   │ 18       │ 0        │ 13s      │
│ 10:15:00   │ ATLAS    │ ❌ Error   │ 0        │ 1 (crit) │ 30s      │
└────────────┴──────────┴────────────┴──────────┴──────────┴──────────┘
```

---

## 🚨 Sistema de Alertas

### **Reglas de Alerta Automáticas**

#### **Alerta 1: Sincronización Fallida**
```typescript
// Trigger: resultado === 'error'
if (registro.resultado === 'error') {
  await crearAlerta({
    severidad: 'alta',
    titulo: `${fuenteDatos.nombre}: Sincronización fallida`,
    descripcion: registro.mensajeResultado,
    accionRecomendada: "Verificar conectividad y estado del sistema externo"
  });
}
```

#### **Alerta 2: 3 Fallos Consecutivos**
```typescript
// Trigger: últimas 3 sincronizaciones con error
const ultimasTres = await obtenerUltimas3Sincronizaciones(idFuenteDatos);

if (ultimasTres.every(r => r.resultado === 'error')) {
  await crearAlerta({
    severidad: 'critica',
    titulo: `${fuenteDatos.nombre}: CRÍTICO - 3 fallos consecutivos`,
    descripcion: "Sistema de integración posiblemente caído",
    accionRecomendada: "Contactar soporte técnico inmediatamente"
  });

  // Actualizar fuente a estado crítico
  await actualizarEstadoFuente(idFuenteDatos, 'error');
}
```

#### **Alerta 3: Degradación de Calidad**
```typescript
// Trigger: tasa de error > 10%
if (registro.estadisticas.tasaError > 10) {
  await crearAlerta({
    severidad: 'media',
    titulo: `${fuenteDatos.nombre}: Calidad de datos degradada`,
    descripcion: `${registro.estadisticas.tasaError}% de lecturas con errores`,
    accionRecomendada: "Revisar medidores con errores en detalle"
  });
}
```

#### **Alerta 4: Performance Degradada**
```typescript
// Trigger: duración > 2x promedio
const duracionPromedio = await calcularDuracionPromedio(idFuenteDatos);

if (registro.estadisticas.duracionMs > duracionPromedio * 2) {
  await crearAlerta({
    severidad: 'baja',
    titulo: `${fuenteDatos.nombre}: Sincronización lenta`,
    descripcion: `Tardó ${registro.estadisticas.duracionMs}ms (promedio: ${duracionPromedio}ms)`,
    accionRecomendada: "Verificar carga del sistema y conectividad de red"
  });
}
```

#### **Alerta 5: Sin Sincronización Reciente**
```typescript
// Trigger: última sync exitosa > 30 minutos
// (Ejecutado por cron job separado cada 10 min)

const ultimaExitosa = await obtenerUltimaSincronizacionExitosa(idFuenteDatos);
const minutosSinSync = (Date.now() - new Date(ultimaExitosa.timestampFin)) / 60000;

if (minutosSinSync > 30) {
  await crearAlerta({
    severidad: 'alta',
    titulo: `${fuenteDatos.nombre}: Sin datos recientes`,
    descripcion: `Última sincronización exitosa hace ${minutosSinSync} minutos`,
    accionRecomendada: "Verificar cron jobs y estado del conector"
  });
}
```

---

## 🗄️ Índices MongoDB Recomendados

```javascript
// 1. Query por fuente (más común)
db.registrosSincronizacion.createIndex({
  "idFuenteDatos": 1,
  "timestampInicio": -1
});

// 2. Query por resultado (alertas)
db.registrosSincronizacion.createIndex({
  "resultado": 1,
  "timestampInicio": -1
});

// 3. Query por cliente + fuente
db.registrosSincronizacion.createIndex({
  "idCliente": 1,
  "idFuenteDatos": 1,
  "timestampInicio": -1
});

// 4. Query por tipo de operación
db.registrosSincronizacion.createIndex({
  "tipoOperacion": 1
});

// 5. Query por usuario (reconciliaciones manuales)
db.registrosSincronizacion.createIndex({
  "usuarioEjecucion": 1,
  "timestampInicio": -1
}, {
  sparse: true  // Solo documentos con usuario
});

// 6. TTL: Retener 6 meses (ajustable según requisitos)
db.registrosSincronizacion.createIndex(
  { "fechaCreacion": 1 },
  { expireAfterSeconds: 15552000 }  // 180 días
);
```

**Performance esperada:**
- Query última sincronización: <5ms
- Query últimas 100 sincronizaciones: <20ms
- Aggregate tasa de éxito 7 días: <50ms

---

## ✅ Mejores Prácticas

### **1. Crear registro al INICIO (no al final)**
```typescript
// ✅ CORRECTO
const registroId = await crearRegistro({ resultado: 'en_progreso' });
try {
  await ejecutarSincronizacion();
  await actualizarRegistro(registroId, { resultado: 'exito' });
} catch (error) {
  await actualizarRegistro(registroId, { resultado: 'error' });
}

// ❌ INCORRECTO - Si falla no hay registro
try {
  await ejecutarSincronizacion();
  await crearRegistro({ resultado: 'exito' });
} catch (error) {
  // No queda evidencia del fallo
}
```

### **2. Capturar contexto en errores**
```typescript
// ✅ CORRECTO - Contexto rico
{
  tipo: "VALIDATION_ERROR",
  mensaje: "Consumo acumulado menor que lectura anterior",
  contexto: {
    valorAnterior: 1234.5,
    valorActual: 45.2,
    diferencia: -1189.3,
    medidorId: "ATL-EDN-0023",
    posibleCausa: "Reset de medidor"
  }
}

// ❌ INCORRECTO - Sin contexto
{
  tipo: "ERROR",
  mensaje: "Validation failed"
}
```

### **3. Calcular métricas útiles**
```typescript
estadisticas: {
  // Básicas
  registrosProcesados: 326,

  // Calculadas (útiles para dashboards)
  porcentajeExito: (323 / 326) * 100,  // 99.1%
  tasaError: (3 / 326) * 100,          // 0.9%
  duracionPromedioRegistroMs: 135000 / 326,  // 414ms

  // Específicas del dominio
  puntosSinComunicacion: 3,
  bateriasBajas: 2
}
```

### **4. Limitar tamaño de arrays de errores**
```typescript
// ✅ CORRECTO - Limitar a N errores más recientes
if (errores.length > 100) {
  errores = errores.slice(-100);  // Últimos 100
}

// Documentar que hay más
estadisticas.erroresOmitidos = totalErrores - 100;
```

### **5. Usar timestamps consistentes**
```typescript
// ✅ CORRECTO - ISO 8601 en UTC
timestampInicio: "2025-11-04T10:00:00.000Z"

// ❌ INCORRECTO - Timestamp Unix o fecha local
timestampInicio: 1730718000  // Difícil de leer
timestampInicio: "2025-11-04 10:00:00"  // Sin zona horaria
```

---

## 📚 Integración con Otras Entidades

### **`IFuenteDatos` ← `IRegistroSincronizacion`**

```typescript
// Actualizar última sincronización en IFuenteDatos
await db.fuentesDatos.updateOne(
  { _id: registro.idFuenteDatos },
  {
    $set: {
      'configuracion.ultimaSincronizacion': registro.timestampFin,
      'configuracion.proximaSincronizacion': calcularProxima(),
      estado: registro.resultado === 'exito' ? 'activa' : 'error',
      mensajeEstado: registro.mensajeResultado
    }
  }
);
```

### **`IAnomalia` ← `IRegistroSincronizacion`**

```typescript
// Crear anomalía si 3 sincronizaciones consecutivas fallan
if (ultimasTresFallidas) {
  await db.anomalias.insertOne({
    tipo: 'fallo_integracion',
    severidad: 'critica',
    descripcion: `${fuenteDatos.nombre}: 3 sincronizaciones fallidas`,
    idFuenteDatos: registro.idFuenteDatos,
    momentoDeteccion: new Date().toISOString(),
    metadatos: {
      registrosSincronizacion: [reg1._id, reg2._id, reg3._id]
    }
  });
}
```

### **`IAuditoria` ← `IRegistroSincronizacion`**

```typescript
// Crear auditoría para sincronizaciones manuales
if (registro.esManual) {
  await db.auditorias.insertOne({
    entidad: 'registrosSincronizacion',
    metodo: 'post',
    dato: registro,
    idUsuario: registro.usuarioEjecucion,
    idCliente: registro.idCliente
  });
}
```

---

## 🎯 Checklist de Implementación

- [ ] Crear colección `registrosSincronizacion` en MongoDB
- [ ] Crear 6 índices recomendados
- [ ] Implementar `crearRegistroSincronizacion()` en api-integracion
- [ ] Implementar `actualizarRegistroSincronizacion()` en api-integracion
- [ ] Modificar conectores (ATLAS, Zeus) para crear/actualizar registros
- [ ] Implementar sistema de alertas basado en registros
- [ ] Crear endpoint GET `/sincronizaciones?idFuenteDatos=X` para dashboard
- [ ] Crear endpoint GET `/sincronizaciones/stats` para métricas
- [ ] Crear dashboard de monitoreo en frontend
- [ ] Configurar TTL según política de retención OSE
- [ ] Documentar para operadores OSE

---

## 🔗 Referencias

- **Modelo Conceptual**: `/doc-ose-aguas/MODELO-CONCEPTUAL.md` líneas 1215-1239
- **IFuenteDatos**: `fuente-datos.doc.md`
- **IAnomalia**: `anomalia.doc.md`
- **IAuditoria**: `auditoria.doc.md`

---

**Última actualización**: 4 Nov 2025
**Versión del modelo**: 1.6.0
**Estado**: Listo para implementación en piloto OSE Maldonado
