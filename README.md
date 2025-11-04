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
- `IConfiguracionLecturaPunto` - Define qué lecturas debe tener cada punto
- `IRelacionTopologica` - Relaciones hidráulicas entre puntos (alimenta_a, controla, etc.)

### 3. Contexto Datos y Análisis
- `ILectura` - Lecturas de sensores (discriminated unions por tipo)
- `IFuenteDatos` - Fuentes externas (ATLAS, Zeus, etc.)
- `IReferenciaExterna` - Mapeo de IDs externos → entidades canónicas
- `IConfiguracionIntegracionPunto` - Configuración de sincronización por punto desde sistemas externos
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

## 📖 Documentación del Modelo

### Para Stakeholders No Técnicos

Cada entidad del modelo tiene **dos tipos de documentación**:

1. **Archivo `.ts`** - Definición técnica TypeScript (para desarrolladores)
2. **Archivo `.doc.md`** - Documentación conceptual en lenguaje accesible (para todos)

Los archivos `.doc.md` están **co-ubicados** con los archivos `.ts` correspondientes y explican:
- 🎯 Qué es la entidad y para qué sirve
- 📋 Qué información contiene
- 💡 Ejemplos reales del proyecto OSE Maldonado
- 🔗 Cómo se relaciona con otras entidades
- ⚙️ Reglas de negocio
- 👥 Quién la usa y cómo

**Ejemplos disponibles:**
- [`punto-medicion.doc.md`](src/interfaces/infraestructura/punto-medicion.doc.md) - Qué son los puntos de medición
- [`configuracion-lectura-punto.doc.md`](src/interfaces/infraestructura/configuracion-lectura-punto.doc.md) - Configuración de lecturas esperadas
- [`relacion-topologica.doc.md`](src/interfaces/infraestructura/relacion-topologica.doc.md) - Relaciones hidráulicas entre puntos
- [`configuracion-integracion-punto.doc.md`](src/interfaces/datos/configuracion-integracion-punto.doc.md) - Integración con sistemas externos

**Navegación:**
Puedes leer estos archivos directamente en GitHub o en tu editor preferido. Están escritos en Markdown estándar.

### Generar Documentación Consolidada (Opcional)

Para generar PDFs o documentos consolidados para presentaciones, ver el script opcional en `/scripts/generate-pdf.js` (requiere instalación de dependencias adicionales).

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
│   ├── infraestructura/   # PuntoMedicion, UbicacionGeografica, ConfiguracionLecturaPunto, RelacionTopologica
│   ├── datos/             # Lectura, FuenteDatos, ReferenciaExterna, ConfiguracionIntegracionPunto
│   └── analisis/          # BalanceHidrico, Alertas, Reportes
└── index.ts               # Export central
```

## 🚀 Versionamiento

**Versión actual:** 1.1.0
**Base del modelo:** MODELO-CONCEPTUAL.md v3.3 (4 Nov 2025)

### Historial
- **1.1.0** - Extensión operativa: Configuración y topología de red
  - Agregado `IConfiguracionLecturaPunto`: Define qué lecturas esperar por punto
  - Agregado `IRelacionTopologica`: Modela relaciones hidráulicas entre puntos
  - Agregado `IConfiguracionIntegracionPunto`: Configura sincronización por punto desde sistemas externos
  - Soporte completo para operatoria del sistema: asignación de variables y topología de red

- **1.0.0** - Implementación inicial del modelo conceptual v3.3
  - Estructura organizacional multi-tenant
  - PuntoMedicion como LUGAR (consolidado)
  - Lecturas con discriminated unions
  - Referencias externas y metadatos de origen
