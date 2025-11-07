# Dato Climático

**Entidad:** `IDatoClimatico`
**Contexto:** Datos
**Versión:** 1.0.0
**Última actualización:** 6 Nov 2025

---

## 🎯 ¿Qué es?

Representa un **registro individual** de observación o pronóstico meteorológico asociado a una EstacionClimaticaVirtual.

**Concepto clave:** Es un dato puntual en el tiempo. El historial completo de datos climáticos se almacena en esta colección.

### Diferencias con ILectura (lecturas de agua):
- **ILectura**: Datos de infraestructura hídrica (caudal, presión, consumo de agua)
- **IDatoClimatico**: Datos meteorológicos (temperatura, precipitación, humedad)

---

## 🏗️ ¿Para qué sirve?

En el sistema OSE, los datos climáticos permiten:

1. **Correlacionar consumo con clima**: "Cuando temperatura > 30°C, consumo aumenta 18%"
2. **Alertas proactivas**: "Pronóstico de ola de calor, activar reservas"
3. **Análisis histórico**: "Sequía 2023 causó aumento de extracción en perforaciones"
4. **Balance ajustado**: "Precipitación alta explica menor consumo de riego"

---

## ⚡ Patrón de Almacenamiento

**Dos niveles de acceso:**

### 1. Acceso Rápido (Snapshot)
```typescript
// Para datos recientes: consultar EstacionClimaticaVirtual.ultimaLectura
const estacion = await EstacionClimaticaVirtual.findById(id);
console.log(estacion.ultimaLectura.temperatura);  // ⚡ Ultra-rápido
```

### 2. Historial Completo (Colección)
```typescript
// Para series temporales: consultar DatoClimatico
const historico = await DatoClimatico.find({
  idEstacionClimaticaVirtual: id,
  timestamp: { $gte: "2025-01-01", $lte: "2025-12-31" }
}).sort({ timestamp: -1 });
```

**Ventajas:**
- ✅ Snapshot embebido: 1 query, acceso instantáneo
- ✅ Historial separado: No infla documento de estación
- ✅ Queries temporales eficientes con índices

---

## 📋 Información que contiene

### Variables Meteorológicas Básicas

| Campo | Unidad | Rango Típico Uruguay | Uso OSE |
|-------|--------|---------------------|---------|
| `temperatura` | °C | -5 a 40 | Correlación con consumo |
| `humedad` | % | 0-100 | Cálculo de evaporación |
| `precipitacion` | mm | 0-150 | Recarga acuíferos, reducción consumo riego |
| `presionAtmosferica` | hPa | 990-1030 | Pronósticos |
| `velocidadViento` | km/h | 0-100 | Evaporación en depósitos |
| `direccionViento` | grados | 0-360 | Pronósticos (0=Norte, 90=Este) |
| `coberturaNubes` | % | 0-100 | Radiación solar |
| `indiceUV` | 0-11+ | 0-11 | - |
| `visibilidad` | km | 0-50 | - |
| `puntoRocio` | °C | -10 a 25 | Evaporación |
| `sensacionTermica` | °C | -10 a 45 | Mejor correlación con consumo que temperatura real |

### Variables para Pronósticos

| Campo | Unidad | Cuándo se usa |
|-------|--------|--------------|
| `probabilidadPrecipitacion` | % | Solo en tipoDato='pronostico' |
| `temperaturaMinima` | °C | Pronósticos diarios |
| `temperaturaMaxima` | °C | Pronósticos diarios, alertas de ola de calor |

---

## 💡 Ejemplo 1: Dato Observado Actual

```yaml
Dato Climático:
  ID: dc-001
  Cliente: OSE Uruguay
  Estación Virtual: ECV-EDEN-001

  Timestamp: 2025-11-06T14:00:00Z
  Tipo de Dato: observado

  # Variables meteorológicas
  Temperatura: 28°C
  Humedad: 65%
  Precipitación: 0 mm (última hora)
  Presión Atmosférica: 1013 hPa
  Velocidad Viento: 15 km/h
  Dirección Viento: 90° (Este)
  Cobertura Nubes: 30%
  Índice UV: 8 (muy alto)
  Sensación Térmica: 31°C

  Calidad: válida
  Fuente: Visual Crossing API

  Fecha Creación: 2025-11-06T14:05:23Z
```

**Uso:**
- Se guarda cada hora automáticamente por polling
- Dashboard muestra en widget de clima
- Se usa para análisis de correlación consumo-temperatura

---

## 💡 Ejemplo 2: Pronóstico 7 Días

```yaml
Dato Climático:
  ID: dc-forecast-7d
  Cliente: OSE Uruguay
  Estación Virtual: ECV-EDEN-001

  Timestamp: 2025-11-13T12:00:00Z  # 7 días adelante
  Tipo de Dato: pronostico

  # Pronóstico diario
  Temperatura Mínima: 18°C
  Temperatura Máxima: 32°C
  Probabilidad Precipitación: 80%
  Precipitación Estimada: 15 mm

  Calidad: válida
  Fuente: Visual Crossing API

  Fecha Creación: 2025-11-06T14:05:23Z
```

**Uso:**
- Se guarda al obtener pronóstico extendido (semanal)
- Sistema genera alerta: "Ola de calor próxima semana, esperar +18% consumo"
- Operadores planifican: Activar reservas, monitorear presiones

---

## 💡 Ejemplo 3: Dato Estadístico (Climatología)

```yaml
Dato Climático:
  ID: dc-stats-nov
  Cliente: OSE Uruguay
  Estación Virtual: ECV-EDEN-001

  Timestamp: 2025-11-01T00:00:00Z
  Tipo de Dato: estadistico

  # Promedios históricos noviembre
  Temperatura: 22°C (promedio noviembre últimos 30 años)
  Humedad: 70%
  Precipitación: 95 mm (acumulado mensual promedio)

  Calidad: válida
  Fuente: INUMET API (climatología)

  Fecha Creación: 2025-11-01T00:00:00Z
```

**Uso:**
- Comparar año actual vs promedio histórico
- Detectar anomalías: "Noviembre 2025: 40% más caluroso que promedio histórico"
- Planificación a largo plazo

---

## 🔗 Se relaciona con

- **EstacionClimaticaVirtual**: Cada dato pertenece a una estación
- **FuenteDatos** (tipo 'clima'): De dónde vino el dato (Visual Crossing, INUMET, etc.)
- **ISnapshotClimatico**: Versión simplificada embebida en estación (solo última lectura)

---

## 🌡️ Tipos de Datos

| Tipo | Descripción | Timestamp | Ejemplo |
|------|-------------|-----------|---------|
| `observado` | Dato real actual o histórico | Pasado o presente | Temperatura ahora: 24°C |
| `pronostico` | Predicción futura (1-15 días) | Futuro | Temperatura mañana: 28°C |
| `estadistico` | Promedio histórico, climatología | Representativo | Temperatura promedio nov: 22°C |

---

## 📊 Calidad del Dato

Reutiliza el type `CalidadDato` de `ILectura`:

| Calidad | Significado | Usar en análisis |
|---------|-------------|------------------|
| `válida` | Dato confiable | ✅ Sí |
| `sospechosa` | Fuera de patrón pero en rango físico | ⚠️ Con precaución |
| `error` | Fuera de rango físico o error API | ❌ No |
| `interpolada` | Calculada para llenar gap | ⚠️ Depende del contexto |
| `calculada` | Derivada de otras lecturas | ✅ Sí |

---

## 🔍 Queries Típicas

### 1. Obtener última lectura (rápido)
```javascript
// NO consultar DatoClimatico, usar snapshot embebido
const estacion = await EstacionClimaticaVirtual.findById(idEstacion);
const clima = estacion.ultimaLectura;  // ⚡ Instantáneo
```

### 2. Serie temporal (mes)
```javascript
const historico = await DatoClimatico.find({
  idEstacionClimaticaVirtual: idEstacion,
  tipoDato: 'observado',
  timestamp: {
    $gte: '2025-10-01T00:00:00Z',
    $lte: '2025-10-31T23:59:59Z'
  }
}).sort({ timestamp: 1 });
```

### 3. Correlación temperatura-consumo
```javascript
// Unir datos climáticos con consumo
const analisis = await db.aggregate([
  // Agrupar consumo por hora
  {
    $match: {
      tipo: 'Medidor Residencial Consumo',
      timestamp: { $gte: fechaInicio }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' } },
      consumoTotal: { $sum: '$valores.consumo' }
    }
  },
  // Unir con datos climáticos
  {
    $lookup: {
      from: 'datosclimaticos',
      let: { hora: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: [
          { $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' } },
          '$$hora'
        ]}}}
      ],
      as: 'clima'
    }
  }
]);
```

### 4. Alertas de ola de calor
```javascript
const alertas = await DatoClimatico.find({
  tipoDato: 'pronostico',
  temperaturaMaxima: { $gte: 35 },  // Ola de calor
  timestamp: { $gte: new Date(), $lte: diasAdelante(7) }
});

if (alertas.length > 0) {
  notificar("Alerta: Ola de calor próxima semana, esperar +18% consumo");
}
```

---

## 📈 Optimización MongoDB

### Índices recomendados:

```javascript
// Índice principal: queries por estación y tiempo
db.datosclimaticos.createIndex({
  idEstacionClimaticaVirtual: 1,
  timestamp: -1
});

// Índice para filtrar por tipo
db.datosclimaticos.createIndex({
  idEstacionClimaticaVirtual: 1,
  tipoDato: 1,
  timestamp: -1
});

// Índice TTL: auto-eliminar datos > 1 año (opcional)
db.datosclimaticos.createIndex(
  { fechaCreacion: 1 },
  { expireAfterSeconds: 31536000 }  // 1 año
);
```

### Particionado (si volumen muy alto):

```javascript
// Particionar por mes (si hay millones de registros)
db.datosclimaticos_2025_11
db.datosclimaticos_2025_12
db.datosclimaticos_2026_01
```

---

## 🌍 Fuentes de Datos Climáticos

### Producción (recomendado):
- **Visual Crossing**: 1000 records/día gratis, 50+ años históricos, pronóstico 15 días
- **INUMET**: Datos oficiales Uruguay, gratuito, via CKAN API

### Backup/alternativas:
- **Open-Meteo**: Gratuito ilimitado, 80+ años históricos, open source
- **OpenWeatherMap**: 1000 calls/día gratis, histórico pagado

---

## 🚨 Casos de Uso: Alertas Operacionales

### Alerta 1: Ola de Calor
```yaml
Condición: temperaturaMaxima > 35°C en próximos 3 días
Acción:
  - Notificar: "Esperar aumento 15-20% consumo"
  - Sugerir: "Activar reservas, monitorear presiones"
  - Ajustar: Balance hídrico esperado +18%
```

### Alerta 2: Sequía Prolongada
```yaml
Condición: precipitacion < 10 mm/mes por 3 meses consecutivos
Acción:
  - Notificar: "Sequía prolongada, recarga acuíferos reducida"
  - Sugerir: "Aumentar monitoreo niveles en perforaciones"
  - Planificar: Restricciones de consumo si es necesario
```

### Alerta 3: Lluvia Intensa
```yaml
Condición: precipitacion > 50 mm en 24 horas
Acción:
  - Notificar: "Lluvia intensa, posible infiltración en red"
  - Esperar: Balance hídrico anómalo (mayor pérdida aparente)
  - Verificar: Lecturas de macromedidores (entrada)
```

---

## 👥 ¿Quién la usa?

**Sistema (automático):**
- Job de polling crea datos cada hora
- Motor de alertas consulta pronósticos
- Motor de análisis correlaciona con consumo

**Dashboard:**
- Widget de clima muestra última lectura
- Gráficos de tendencia consultan historial
- Heat map climático superpuesto en mapa

**Analistas:**
- Reportes de correlación consumo-temperatura
- Análisis de impacto de sequías
- Validación de balance hídrico con factores climáticos

---

## 📊 Ejemplo de Análisis

### Correlación Temperatura-Consumo (Verano 2025)

```yaml
Análisis:
  Período: Diciembre 2024 - Febrero 2025
  Zona: Pueblo Edén (95 medidores)

  Datos:
    - 2,160 lecturas horarias de consumo
    - 2,160 datos climáticos horarios (temperatura)

  Resultado:
    Temperatura < 25°C → Consumo promedio: 12 m³/medidor/día
    Temperatura 25-30°C → Consumo promedio: 14 m³/medidor/día (+16%)
    Temperatura 30-35°C → Consumo promedio: 17 m³/medidor/día (+42%)
    Temperatura > 35°C → Consumo promedio: 20 m³/medidor/día (+67%)

  Conclusión:
    Por cada 5°C de aumento, consumo sube ~15%
    Sistema puede predecir consumo con 85% precisión usando pronóstico de temperatura
```

---

**Ver:** `dato-climatico.ts` para definición técnica completa
