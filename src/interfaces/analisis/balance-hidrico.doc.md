# Balance Hídrico

**Entidad:** `IBalanceHidrico`
**Contexto:** Análisis
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa el **cálculo que compara el agua que entra vs el agua que sale** en un distrito pitométrico durante un período específico. Es la métrica fundamental para detectar y cuantificar pérdidas de agua.

**Concepto clave:** Balance Hídrico = Contabilidad del Agua

```
Agua ENTRADA - Agua SALIDA - Consumo Autorizado No Medido = PÉRDIDAS

Eficiencia (%) = (Agua Salida / Agua Entrada) × 100
```

---

## 🏗️ ¿Para qué sirve?

El balance hídrico es el **corazón del proyecto OSE Maldonado**. Permite:

1. **Cuantificar pérdidas**: Saber exactamente cuántos m³ se pierden
2. **Detectar fugas**: Si pérdidas aumentan súbitamente
3. **Medir eficiencia**: Qué % del agua producida llega a usuarios
4. **Seguir mejoras**: Ver si las acciones correctivas funcionan
5. **Comparar**: Entre distritos, períodos, con metas

### Antes del proyecto (sin balance automatizado):
- Balance manual mensual con 3-4 semanas de retraso
- Pérdidas estimadas, no medidas con precisión
- Fugas detectadas por reclamos de usuarios (días/semanas)

### Con el proyecto (balance automatizado):
- ✅ Balance cada 15 minutos en tiempo real
- ✅ Pérdidas medidas con precisión
- ✅ Detección de fugas en minutos
- ✅ Visibilidad inmediata del impacto de acciones

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idDistrito` | En qué distrito se calcula | "distrito-eden" |
| `periodo` | Frecuencia del cálculo | "diario" |
| `fechaInicio` | Inicio del período | "2025-11-04T00:00:00Z" |
| `fechaFin` | Fin del período | "2025-11-04T23:59:59Z" |
| `volumenEntrada` | Agua que entró (m³) | 850 m³ |
| `volumenSalida` | Agua que salió (m³) | 570 m³ |
| `consumoAutorizadoNoMedido` | Consumo sin medidor (m³) | 2 m³ |
| `perdidasCalculadas` | Pérdidas (m³) | 278 m³ |
| `porcentajePerdidas` | % de pérdidas | 33% |
| `porcentajeEficiencia` | % de eficiencia | 67% |
| `estado` | Validación del balance | "calculado" / "validado" / "publicado" |

---

## 💡 Ejemplo Real: Balance Diario Distrito Edén

```yaml
Balance Hídrico:
  ID: bal-eden-20251104
  Cliente: OSE Uruguay
  Distrito: Distrito Pitométrico Pueblo Edén

  # Período
  Tipo: diario
  Fecha inicio: 2025-11-04 00:00:00
  Fecha fin:    2025-11-04 23:59:59

  # ENTRADA (Producción)
  Volumen de Entrada: 850 m³
    Fuentes:
      - Perforación Edén: 850 m³
        • Lecturas cada 5 min (Zeus SCADA)
        • Total: 288 lecturas en 24h
        • Calidad: 100% válidas

  # SALIDA (Consumo)
  Volumen de Salida: 570 m³
    Fuentes:
      - 95 Medidores residenciales telemedidos: 550 m³
        • Lecturas cada 10 min (ATLAS)
        • Cobertura: 94% (89/95 medidores con datos)
      - 255 Medidores sin telemedir: 20 m³ (estimado)
        • Interpolación desde última lectura manual

  # CONSUMO AUTORIZADO NO MEDIDO
  Consumo No Medido: 2 m³
    Estimado:
      - Fuente pública (plaza): 1 m³
      - Lavado de calles (ocasional): 1 m³

  # CÁLCULO
  Pérdidas Calculadas: 278 m³
    Fórmula: 850 - 570 - 2 = 278 m³

  Porcentaje de Pérdidas: 33%
    Fórmula: (278 / 850) × 100 = 32.7% ≈ 33%

  Porcentaje de Eficiencia: 67%
    Fórmula: (570 / 850) × 100 = 67.0%

  # VALIDACIÓN
  Estado: validado
  Fecha Cálculo: 2025-11-05 00:05:00 (5 min después de medianoche)
  Usuario Validador: "ing.rodriguez@ose.com.uy"
  Fecha Validación: 2025-11-05 08:30:00

  Notas del validador:
    "Pérdidas consistentes con tendencia semanal.
     No se detectaron anomalías significativas.
     Balance validado para publicación."

  # DETALLES TÉCNICOS
  Detalles:
    cantidadPuntosEntrada: 1
    cantidadPuntosSalida: 95
    puntosConError: []  # Ninguno
    metodoCalculo: "avanzado"
    coberturaMedidores: 94%
```

---

## 🔗 Se relaciona con

- **Distrito Pitométrico** (`IDistrito`): Donde se calcula el balance
- **Lecturas** (`ILectura`): Fuente de datos para entrada y salida
- **Puntos de Medición** (`IPuntoMedicion`): Los puntos que participan
- **Anomalías** (`IAnomalia`): Si pérdidas superan umbral → genera anomalía

**Flujo operativo:**
```
Distrito Pitométrico Edén
  │
  ├─ ENTRADA: Lecturas de Perforación Edén
  │   └─ Cada 5 min → Acumula volumen de entrada
  │
  ├─ SALIDA: Lecturas de 95 medidores residenciales
  │   └─ Cada 10 min → Acumula volumen de salida
  │
  └─ Cada 15 minutos (o al final del día):
      └─ Calcula Balance Hídrico
          ├─ Si pérdidas > 25% → Genera Anomalía
          └─ Almacena IBalanceHidrico
```

---

## ⚙️ Tipos de Balance por Período

### `horario`
Balance cada hora. Útil para detección temprana de fugas.

**Ejemplo:**
- Hora: 14:00-15:00
- Entrada: 35 m³
- Salida: 20 m³
- Pérdidas: 15 m³ (43%) ⚠️ Muy alto → Investigar

**Uso:**
- Detección inmediata de fugas grandes
- Monitoreo en tiempo real
- Dashboard operativo

### `diario`
Balance de 24 horas (medianoche a medianoche). El más común.

**Ejemplo:** Ver ejemplo completo arriba

**Uso:**
- Gestión operativa estándar
- Reportes diarios
- Seguimiento de tendencias

### `semanal`
Balance de 7 días. Útil para suavizar variaciones diarias.

**Uso:**
- Análisis de tendencias
- Comparación semanal
- Reportes gerenciales

### `mensual`
Balance de un mes completo. Usado para reportes oficiales.

**Uso:**
- Reportes institucionales
- Comparación con metas anuales
- Documentación de mejoras

---

## ⚙️ Estados del Balance

### `calculado`
Balance recién computado, pendiente de validación.

**Próximo paso:** Revisar por operador antes de publicar

### `validado`
Operador revisó y confirmó que el balance es correcto.

**Criterios de validación:**
- Cobertura de medidores > 80%
- Sin errores significativos en lecturas
- Pérdidas dentro de rangos esperados (o explicadas)

### `publicado`
Balance validado y visible para reportes oficiales.

**Uso:**
- Reportes a gerencia
- Estadísticas públicas
- Documentación de mejoras

### `rechazado`
Balance descartado por inconsistencias.

**Razones:**
- Cobertura muy baja (< 80%)
- Errores en medidores principales
- Datos sospechosos

### `archivado`
Balance antiguo archivado para liberar almacenamiento.

---

## 👥 ¿Quién lo usa?

### Sistema de Cálculo (automático)
Calcula balance periódicamente.

**Proceso:**
```
1. Cada día a las 00:05 (5 min después de medianoche)
2. Obtiene lecturas de puntos de entrada (últimas 24h)
3. Obtiene lecturas de puntos de salida (últimas 24h)
4. Suma volúmenes
5. Aplica fórmula de balance
6. Crea IBalanceHidrico con estado="calculado"
7. Si pérdidas > umbral → Genera Anomalía
```

### Operadores OSE (validación manual)
Revisan balances antes de publicar.

**Caso de uso:** Validación diaria
1. Sistema calcula balance a las 00:05
2. A las 08:00, operador revisa:
   - ¿Cobertura de medidores OK?
   - ¿Pérdidas en rango esperado?
   - ¿Hay anomalías que expliquen variaciones?
3. Si todo OK → marca como "validado"
4. Si algo raro → investiga antes de validar

### Dashboard de Gestión
Visualiza balance en tiempo real y histórico.

**Visualización:**
```
Distrito Pitométrico Edén - Balance Hoy (parcial 14:30)

  Entrada:  520 m³  (Perforación Edén)
  Salida:   340 m³  (95 medidores)
  Pérdidas: 180 m³  (35%) ⚠️

Gráfica Diaria:
  [────────────────────────────────]
  Entrada:  ████████████████░░░░░░ 520 m³
  Salida:   ███████████░░░░░░░░░░░ 340 m³
  Pérdidas: █████░░░░░░░░░░░░░░░░░ 180 m³

Tendencia Semanal (eficiencia):
  L: 68%  ➡️
  M: 67%  ↘️
  X: 66%  ↘️
  J: 67%  ↗️
  V: 65%  ↘️ ⚠️
  S: 69%  ↗️ ✅
  D: 70%  ↗️ ✅
```

### Gerencia OSE
Consulta tendencias y cumplimiento de metas.

**Reporte Mensual:**
```
UGD Maldonado - Noviembre 2025

Eficiencia por Distrito:
  Distrito Edén:        67% ➡️ (meta: 72%)
  Distrito Punta Este:  58% ↗️ (+2% vs octubre)
  Promedio UGD:         62% ↗️ (+1% vs octubre)

Pérdidas Totales: 15,000 m³/mes
  vs Octubre: -500 m³ (mejora de 3%)

Acciones Tomadas:
  - Reparación fuga calle Principal (Edén): -200 m³/día
  - Ajuste presión Booster Hospital: -50 m³/día
```

---

## 📊 Beneficios Operativos

### Cuantificación Precisa:
- ✅ Saber exactamente cuántos m³ se pierden
- ✅ No más estimaciones imprecisas
- ✅ Base sólida para decisiones

### Detección Temprana:
- ✅ Fugas detectadas en minutos/horas vs días/semanas
- ✅ Reducción de pérdidas por detección rápida
- ✅ Menor daño a infraestructura

### Seguimiento de Mejoras:
- ✅ Medir impacto de reparaciones
- ✅ Validar inversiones
- ✅ Motivar al equipo con mejoras visibles

### Comparación:
- ✅ Entre distritos (mejores prácticas)
- ✅ Entre períodos (tendencias)
- ✅ Con metas (cumplimiento)

---

## 🎯 Meta del Piloto OSE Maldonado

**Situación Inicial (pre-piloto):**
- Eficiencia Distrito Edén: 67%
- Pérdidas: 33% (~280 m³/día)
- Detección de fugas: semanas

**Meta del Piloto (6 meses):**
- Eficiencia: 72% (+5 puntos) ⭐
- Pérdidas: 28% (~-40 m³/día de ahorro)
- Detección de fugas: minutos

**Impacto Económico (si se logra):**
- Ahorro: 40 m³/día × 30 días = 1,200 m³/mes
- Ahorro anual: ~14,400 m³
- Valor: Significativo para zona rural

**Si el piloto es exitoso:**
- Replicar en otros distritos de Maldonado
- Expansión a otras UGDs de Uruguay
- Modelo exportable

---

## ⚙️ Reglas de Negocio

### 1. Balance válido requiere cobertura mínima
- Al menos 80% de medidores con lecturas
- Todos los puntos de entrada operativos
- Sin gaps temporales mayores a 2 horas

### 2. Lecturas con calidad "error" no se usan
Solo lecturas con calidad "válida" o "sospechosa" cuentan.

### 3. Estado progresa linealmente
```
calculado → validado → publicado → archivado
    ↓
rechazado (si hay problemas)
```

No se puede "despublicar" un balance publicado.

### 4. Un balance por (Distrito + Período)
No puede haber dos balances diarios para el mismo día en el mismo distrito.

### 5. Consumo no medido debe justificarse
Cada valor de `consumoAutorizadoNoMedido` debe tener fuente documentada.

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { IBalanceHidrico, PeriodoBalance } from 'ose-modelos';

// Crear balance diario
const balance: IBalanceHidrico = {
  idCliente: "ose-uruguay",
  idDistrito: "distrito-eden",

  periodo: "diario",
  fechaInicio: "2025-11-04T00:00:00Z",
  fechaFin: "2025-11-04T23:59:59Z",

  // Volúmenes
  volumenEntrada: 850,
  volumenSalida: 570,
  consumoAutorizadoNoMedido: 2,

  // Cálculos
  perdidasCalculadas: 278,  // 850 - 570 - 2
  porcentajePerdidas: 33,   // (278 / 850) × 100
  porcentajeEficiencia: 67, // (570 / 850) × 100

  // Estado
  estado: "calculado",
  fechaCalculo: "2025-11-05T00:05:00Z",

  detalles: {
    cantidadPuntosEntrada: 1,
    cantidadPuntosSalida: 95,
    puntosConError: [],
    metodoCalculo: "avanzado"
  }
};
```

**Ver:** `balance-hidrico.ts` para definición técnica completa
