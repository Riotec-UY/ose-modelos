# OSE Modelos

Modelos canónicos TypeScript para el sistema de **Distrito Pitométrico Inteligente OSE Maldonado**.

## 📋 Descripción

Este paquete contiene las interfaces TypeScript que definen el modelo de datos canónico para:
- Balance hídrico en tiempo real
- Gestión de infraestructura de agua y saneamiento
- Integración multi-fuente (ATLAS, Zeus SCADA)
- Análisis de pérdidas y eficiencia operacional

## 🏗️ Arquitectura

El modelo sigue una arquitectura de **3 capas conceptuales**:

### 1. Contexto Organizacional
- `ICliente` - Multi-tenant raíz
- `IDivision` - División operacional (ej: UGD Maldonado)
- `IJefatura` - Jefatura territorial
- `IDistrito` - Distrito pitométrico (zona de balance hídrico)

### 2. Contexto Infraestructura Física
- `IPuntoMedicion` - **Lugar** de medición (residencial, booster, perforación, etc.)
- `IUbicacionGeografica` - Coordenadas y referencias espaciales

### 3. Contexto Datos y Análisis
- `ILectura` - Lecturas de sensores (discriminated unions por tipo)
- `IFuenteDatos` - Fuentes externas (ATLAS, Zeus, etc.)
- `IReferenciaExterna` - Mapeo de IDs externos → entidades canónicas
- `IBalanceHidrico` - Cálculos de balance (entrada - salida)
- `IAlerta` - Detección de anomalías y fugas

## 📦 Instalación

### Como dependencia local en otros proyectos

```bash
# Desde GitHub (privado)
npm install git+ssh://git@github.com/Riotec-UY/ose-modelos.git

# O desde el directorio local durante desarrollo
npm install ../ose-modelos
```

### Actualizar a la última versión

```bash
npm update ose-modelos
```

## 💻 Uso

```typescript
import {
  IPuntoMedicion,
  ILectura,
  IBalanceHidrico,
  TipoPuntoMedicion
} from 'ose-modelos';

// Uso de types en lugar de enums (no se compila, solo se importa)
const tipo: TipoPuntoMedicion = 'residencial';
```

## 🔧 Restricciones de Diseño

- **Solo interfaces y types**: No hay código ejecutable
- **No usar enums tradicionales**: Usar union types (`type X = 'a' | 'b'`)
- **Arrays de constantes**: Para iterar valores posibles
- **Metadatos flexibles**: `Record<string, any>` para campos específicos por tipo

## 📚 Documentación

Ver la documentación completa en:
- `/doc-ose-aguas/MODELO-CONCEPTUAL.md` - Modelo de dominio v3.3
- `/LINEAMIENTOS-ARQUITECTURA.md` - Lineamientos técnicos v2.5

## 🗂️ Estructura

```
src/
├── interfaces/
│   ├── auxiliares/        # Tipos auxiliares (coordenadas, queries, responses)
│   ├── organizacion/      # Cliente, División, Jefatura, Distrito
│   ├── infraestructura/   # PuntoMedicion, UbicacionGeografica
│   ├── datos/             # Lectura, FuenteDatos, ReferenciaExterna
│   └── analisis/          # BalanceHidrico, Alertas, Reportes
└── index.ts               # Export central
```

## 🚀 Versionamiento

**Versión actual:** 1.0.0
**Base del modelo:** MODELO-CONCEPTUAL.md v3.3 (4 Nov 2025)

### Historial
- **1.0.0** - Implementación inicial del modelo conceptual v3.3
  - Estructura organizacional multi-tenant
  - PuntoMedicion como LUGAR (consolidado)
  - Lecturas con discriminated unions
  - Referencias externas y metadatos de origen
