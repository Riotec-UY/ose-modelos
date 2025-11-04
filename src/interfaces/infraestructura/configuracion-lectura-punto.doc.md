# Configuración de Lectura por Punto

**Entidad:** `IConfiguracionLecturaPunto`
**Contexto:** Infraestructura
**Versión:** 1.1.0

---

## 🎯 ¿Qué es?

Define **qué lecturas debe tener** cada punto de medición, con qué frecuencia deben llegar, y qué hacer cuando no llegan o están fuera de rango.

Es como una "ficha técnica de monitoreo" para cada punto de la red.

---

## 🏗️ ¿Para qué sirve?

En OSE Maldonado, cada punto de la red tiene diferentes necesidades de monitoreo:

- Un **booster** necesita lecturas de presión de entrada, presión de salida y caudal cada 5 minutos
- Una **perforación** necesita lecturas de caudal cada 5 minutos y nivel freático cada 30 minutos
- Un **medidor residencial** solo necesita consumo acumulado cada 10 minutos

Esta configuración permite al sistema:

1. **Validar** que lleguen todas las lecturas esperadas
2. **Alertar** cuando falta una lectura obligatoria o llega con retraso
3. **Verificar** que los valores medidos estén dentro de rangos válidos (ej: presión 0-10 bar)
4. **Identificar** sensores con problemas de comunicación o fuera de servicio

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idPuntoMedicion` | A qué punto de la red se refiere | "pm-boost-001" (Booster Hospital) |
| `tipoLectura` | Qué variable física se debe medir | "Booster Presión Entrada" |
| `frecuenciaEsperada` | Cada cuántos minutos debe llegar | 5 minutos |
| `obligatoria` | Si es crítica para la operación | Sí → genera alerta si falta |
| `rangoValido` | Valores físicamente posibles | min: 0 bar, max: 10 bar |
| `toleranciaRetraso` | Minutos de gracia antes de alertar | 10 minutos (2x frecuencia) |
| `activa` | Si está en uso actualmente | Sí / No |

---

## 💡 Ejemplo Real: Booster Hospital

**Ubicación:** Ruta 39 km 3, frente al Hospital Regional Maldonado
**Función:** Estación de bombeo para aumentar presión en zona alta

### Configuraciones de Lectura:

#### 1. Presión de Entrada
- **Tipo de lectura:** Booster Presión Entrada
- **Frecuencia esperada:** cada 5 minutos
- **Obligatoria:** SÍ (crítica para operación)
- **Rango válido:** 0 a 10 bar
- **Acción si falta:** Alerta operativa inmediata
- **¿Por qué?** Si la presión de entrada cae, puede indicar problema en la red aguas arriba

#### 2. Presión de Salida
- **Tipo de lectura:** Booster Presión Salida
- **Frecuencia esperada:** cada 5 minutos
- **Obligatoria:** SÍ
- **Rango válido:** 0 a 15 bar
- **¿Por qué?** Monitorea que las bombas estén funcionando correctamente

#### 3. Caudal
- **Tipo de lectura:** Booster Caudal
- **Frecuencia esperada:** cada 5 minutos
- **Obligatoria:** NO (informativa)
- **Rango válido:** 0 a 150 m³/h (capacidad instalada)
- **¿Por qué?** Permite calcular balance hídrico y detectar consumos anormales

---

## 🔗 Se relaciona con

- **Punto de Medición** (`IPuntoMedicion`): A qué punto físico se le configura el monitoreo
- **Lectura** (`ILectura`): Los valores reales que llegan (esta es la configuración esperada)
- **Configuración de Integración** (`IConfiguracionIntegracionPunto`): Cómo se obtienen esas lecturas desde Zeus/ATLAS

**Flujo:**
```
Configuración de Lectura     →    Configuración de Integración    →    Lecturas reales
(qué esperar)                      (cómo obtenerlo)                     (qué llegó)
```

---

## ⚙️ Reglas de Negocio

### 1. Múltiples configuraciones por punto
Un mismo punto puede tener varias configuraciones, una por cada variable que debe monitorear.

**Ejemplo:** Booster Hospital tiene 3 configuraciones (presión entrada, presión salida, caudal)

### 2. Generación de alertas
- Si una lectura es **obligatoria** y no llega en `frecuenciaEsperada + toleranciaRetraso`, el sistema genera una alerta automática
- Por defecto, `toleranciaRetraso = 2 × frecuenciaEsperada`

### 3. Validación de rangos
- Si llega una lectura con valor fuera del `rangoValido`, se marca como calidad "sospechosa" o "error"
- Lecturas fuera de rango no se usan para cálculo de balance hídrico

### 4. Rangos típicos por tipo de punto

| Tipo de Punto | Variable | Rango Típico |
|---------------|----------|--------------|
| Booster | Presión entrada | 0 - 10 bar |
| Booster | Presión salida | 0 - 15 bar |
| Booster | Caudal | 0 - capacidad instalada |
| Perforación | Caudal extracción | 0 - caudal máximo |
| Perforación | Nivel freático | -200 a 0 metros |
| Residencial | Consumo acumulado | 0 - 9999 m³ |

---

## 👥 ¿Quién la usa?

### Operadores OSE
Configuran qué lecturas esperar de cada punto cuando se instala o modifica un sensor.

**Caso de uso:** Se instala un nuevo sensor de cloro en la Perforación Edén
- Agregan configuración: tipo "Sensor Calidad Cloro", frecuencia 60 min, obligatoria NO

### Sistema de Alertas
Detecta automáticamente lecturas faltantes o fuera de rango.

**Caso de uso:** Booster Hospital deja de enviar presión de entrada
- El sistema detecta que pasaron 15 minutos sin lectura (esperaba 5 min + 10 min tolerancia)
- Genera alerta: "Lectura obligatoria faltante: Presión Entrada - Booster Hospital"
- Asigna a operador de turno

### Dashboard Operativo
Muestra el "estado de salud" de cada punto.

**Visualización:**
```
✅ Perforación Edén - Todas las lecturas OK (última: hace 3 min)
⚠️ Booster Hospital - Presión entrada: sin datos hace 18 min
❌ Medidor Residencial 045 - Sin comunicación hace 2 horas
```

---

## 📊 Beneficios Operativos

### Antes (sin configuración)
- No se sabía qué lecturas esperar de cada punto
- Fallos de sensores se detectaban manualmente días después
- No había criterio claro de qué era "anormal"

### Después (con configuración)
- ✅ Detección automática de sensores con problemas
- ✅ Alertas tempranas (minutos vs días)
- ✅ Validación automática de rangos
- ✅ Métricas de disponibilidad de datos por punto
- ✅ Base para SLAs de infraestructura

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { IConfiguracionLecturaPunto } from 'ose-modelos';

// Crear configuración para Booster Hospital - Presión Entrada
const config: IConfiguracionLecturaPunto = {
  idPuntoMedicion: "pm-boost-001",
  idCliente: "ose-uruguay",
  tipoLectura: "Booster Presión Entrada",
  frecuenciaEsperada: 5, // minutos
  obligatoria: true,
  rangoValido: {
    minimo: 0,
    maximo: 10,
    unidad: "bar"
  },
  toleranciaRetraso: 10, // minutos
  activa: true
};
```

**Ver:** `configuracion-lectura-punto.ts` para definición técnica completa
