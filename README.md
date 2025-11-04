# OSE Modelos

Modelos canónicos TypeScript para el sistema de **Distrito Pitométrico Inteligente OSE Maldonado**.

## 📋 Descripción

Este paquete contiene las interfaces TypeScript que definen el modelo de datos canónico para:
- Balance hídrico en tiempo real
- Gestión de infraestructura de agua y saneamiento
- Integración multi-fuente (ATLAS, Zeus SCADA)
- Análisis de pérdidas y eficiencia operacional

## 🏗️ Arquitectura

El modelo sigue una arquitectura de **4 contextos conceptuales**:

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

### 4. Contexto Seguridad y Autenticación (MongoDB-optimized)
- `IUsuario` - Usuarios del sistema con permisos embebidos (1 query, NO referencias)
- `IPermisoUsuario` - Permisos embebidos por contexto organizacional (roles + permisos por módulo)
- `TipoRol` - Tipos de roles como union type (NO entidad separada)
- `IPermisosModulos` - Permisos granulares por módulo como objeto embebido
- `ISesion` - Sesiones activas y gestión de tokens JWT

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

**Índice Completo de Documentación:**

#### 📂 Organización
- [`cliente.doc.md`](src/interfaces/organizacion/cliente.doc.md) - Multi-tenant raíz (OSE Uruguay)
- [`division.doc.md`](src/interfaces/organizacion/division.doc.md) - UGD Maldonado y estructura operacional
- [`jefatura.doc.md`](src/interfaces/organizacion/jefatura.doc.md) - Centros operativos locales
- [`distrito.doc.md`](src/interfaces/organizacion/distrito.doc.md) - Distritos pitométricos (balance hídrico)

#### 🏗️ Infraestructura
- [`punto-medicion.doc.md`](src/interfaces/infraestructura/punto-medicion.doc.md) - Lugares de medición (13 tipos)
- [`ubicacion-geografica.doc.md`](src/interfaces/infraestructura/ubicacion-geografica.doc.md) - Posición geográfica y direcciones
- [`configuracion-lectura-punto.doc.md`](src/interfaces/infraestructura/configuracion-lectura-punto.doc.md) - Qué lecturas debe tener cada punto
- [`relacion-topologica.doc.md`](src/interfaces/infraestructura/relacion-topologica.doc.md) - Topología de red hidráulica

#### 💾 Datos e Integración
- [`lectura.doc.md`](src/interfaces/datos/lectura.doc.md) - Lecturas de sensores (discriminated unions explicado)
- [`fuente-datos.doc.md`](src/interfaces/datos/fuente-datos.doc.md) - Sistemas externos (ATLAS, Zeus SCADA)
- [`referencia-externa.doc.md`](src/interfaces/datos/referencia-externa.doc.md) - Mapeo de IDs externos
- [`configuracion-integracion-punto.doc.md`](src/interfaces/datos/configuracion-integracion-punto.doc.md) - Sincronización desde sistemas externos

#### 📊 Análisis
- [`balance-hidrico.doc.md`](src/interfaces/analisis/balance-hidrico.doc.md) - Cálculo de balance (entrada - salida)
- [`anomalia.doc.md`](src/interfaces/analisis/anomalia.doc.md) - Detección de fugas y anomalías
- [`serie-temporal.doc.md`](src/interfaces/analisis/serie-temporal.doc.md) - Series temporales para análisis

#### 🔧 Auxiliares
- [`geojson.doc.md`](src/interfaces/auxiliares/geojson.doc.md) - Geometrías geográficas GeoJSON (Point, Polygon, Circle) ⭐ NUEVO
- [`coordenadas.doc.md`](src/interfaces/auxiliares/coordenadas.doc.md) - Puntos geográficos simples (compatibilidad)
- [`metadatos.doc.md`](src/interfaces/auxiliares/metadatos.doc.md) - Metadatos de origen, auditoría y técnicos
- [`queryParams.doc.md`](src/interfaces/auxiliares/queryParams.doc.md) - Parámetros de consulta para APIs
- [`responses.doc.md`](src/interfaces/auxiliares/responses.doc.md) - Formatos estándar de respuestas HTTP

#### 🔐 Seguridad y Autenticación (MongoDB-optimized)
- [`usuario.doc.md`](src/interfaces/seguridad/usuario.doc.md) - Usuarios del sistema con permisos embebidos (modelo MongoDB)
- [`sesion.doc.md`](src/interfaces/seguridad/sesion.doc.md) - Sesiones activas y tokens JWT

**Navegación:**
Puedes leer estos archivos directamente en GitHub o en tu editor preferido. Están escritos en Markdown estándar y contienen ejemplos reales del proyecto OSE Maldonado.

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
│   ├── analisis/          # BalanceHidrico, Alertas, Reportes
│   └── seguridad/         # Usuario, TipoRol, TipoPermiso, Sesion (MongoDB-optimized)
└── index.ts               # Export central
```

## 🚀 Versionamiento

**Versión actual:** 1.3.2
**Base del modelo:** MODELO-CONCEPTUAL.md v3.3 (4 Nov 2025) + Patrón IRIX

### Historial
- **1.3.2** - Adopción de GeoJSON estándar para ubicaciones (4 Nov 2025)
  - **IMPORTANTE**: Cambio en modelo de ubicaciones (retrocompatible)
  - ✅ **Nuevo módulo**: `geojson.ts` con tipos GeoJSON estándar (RFC 7946)
  - ✅ **Tipos soportados**: Point, Polygon, Circle, LineString, MultiPolygon
  - ✅ **IUbicacionGeografica**: `geojson` ahora es campo principal (requerido)
  - ✅ **IDistrito**: `frontera` simplificada a `IGeoJSON` (más limpio)
  - ✅ **ICoordenadas**: Mantenida para compatibilidad (opcional/deprecated)
  - ✅ **Helpers**: `crearGeoJSONPoint`, `extraerLatLngDePoint`
  - ✅ **MongoDB**: Compatible con queries espaciales ($geoNear, $geoWithin)
  - ✅ **Compatibilidad IRIX**: Modelo probado en producción
  - Patrón adaptado desde IRIX gestion-modelos
  - Documentación completa con ejemplos de MongoDB queries

- **1.3.1** - Refactor nomenclatura: PersonalOperativo → Usuario (4 Nov 2025)
  - **BREAKING CHANGE**: Renombrado de interfaces para mayor claridad
  - ✅ `IPersonalOperativo` → `IUsuario` (nombre más genérico y apropiado)
  - ✅ `EstadoPersonal` → `EstadoUsuario`
  - ✅ `ESTADOS_PERSONAL` → `ESTADOS_USUARIO`
  - ✅ Archivos renombrados: `personal-operativo.ts` → `usuario.ts`
  - Razón: El sistema tiene múltiples tipos de usuarios (admins, gerentes, analistas, técnicos, viewers), no solo "personal operativo"
  - Documentación y referencias actualizadas en README

- **1.3.0** - Refactor RBAC a modelo MongoDB-optimized (4 Nov 2025)
  - **BREAKING CHANGE**: Rediseño completo del sistema de seguridad siguiendo patrón de IRIX
  - ✅ **Modelo MongoDB-optimized**: Permisos embebidos, NO entidades separadas
  - ✅ **1 solo query**: Usuario + todos sus permisos en una consulta
  - ✅ **Eliminadas 4 entidades SQL-oriented**: `IRol`, `IPermiso`, `IUsuarioRol`, `IRolPermiso`
  - ✅ **Nuevas interfaces**: `IPermisoUsuario` (embebido), `TipoRol` (union type), `IPermisosModulos` (objeto)
  - ✅ **27 módulos** con permisos granulares por acción (crear, leer, actualizar, eliminar, ejecutar)
  - ✅ **9 tipos de roles** predefinidos (admin_sistema, gerente_division, operador_basico, etc.)
  - ✅ **Alcances organizacionales**: global, division, jefatura
  - ✅ **Helpers**: `PERMISOS_COMPLETOS`, `PERMISOS_SOLO_LECTURA`
  - Modelo simplificado: 2 entidades en lugar de 6
  - Documentación actualizada con comparación SQL vs MongoDB

- **1.2.0** - Seguridad y Autenticación SQL-oriented (4 Nov 2025) - **OBSOLETO**
  - Primera implementación con entidades separadas (enfoque SQL)
  - Reemplazado completamente en v1.3.0

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
