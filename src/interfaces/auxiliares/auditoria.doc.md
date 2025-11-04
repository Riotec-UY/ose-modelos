# Auditoría - Sistema de Trazabilidad Completo

## Visión General

El sistema de auditoría de OSE implementa el **patrón GAS/INSIDE** de trazabilidad completa mediante snapshots inmutables. Este patrón garantiza el cumplimiento de requisitos regulatorios para empresas de servicio público.

## Concepto

### Patrón GAS/INSIDE (Snapshots Inmutables)

En lugar de almacenar "qué cambió", se almacena **el estado completo** del objeto en cada modificación:

```typescript
// ✅ Patrón GAS - Snapshot completo
{
  entidad: 'puntosMedicion',
  metodo: 'put',
  dato: {  // Estado COMPLETO después del cambio
    _id: 'pm-res-001',
    nombre: 'Medidor Juan Pérez',
    estado: 'operativo',  // Cambió de 'mantenimiento' a 'operativo'
    tipo: 'residencial',
    // ... TODOS los campos del objeto
  },
  idUsuario: 'usuario-123',
  fechaCreacion: '2025-11-04T10:30:00Z'
}
```

**Beneficios**:
- ✅ Reconstrucción completa del historial sin lógica compleja
- ✅ Auditoría de deletes (último snapshot antes de borrar)
- ✅ Queries simples para ver "cómo estaba X en fecha Y"
- ✅ Cumplimiento regulatorio (OSE es empresa pública)
- ✅ No requiere lógica de "aplicar cambios incrementales"

**Contras**:
- ❌ Mayor uso de almacenamiento (mitigado con TTL y compresión MongoDB)
- ❌ Objetos muy grandes pueden generar auditorías muy grandes

## Estructura de Datos

### Interface Principal

```typescript
export interface IAuditoria {
  _id?: string;

  // Qué entidad se modificó
  entidad: EntidadAuditable;  // 'puntosMedicion', 'usuarios', etc.

  // Qué operación se hizo
  metodo: MetodoAuditoria;    // 'post', 'put', 'delete'

  // Snapshot completo del objeto
  dato: Object;               // Estado completo del objeto después del cambio

  // Quién y cuándo
  idUsuario: string;          // Usuario que realizó la acción
  idCliente: string;          // Tenant (multi-tenancy)

  // Timestamp automático
  fechaCreacion?: string;     // Auto-generado por MongoDB

  // TTL opcional (data retention)
  expireAt?: string;          // Fecha de expiración automática

  // Virtuals (NO almacenados)
  usuario?: any;              // Populado por query
  cliente?: any;              // Populado por query
}
```

### Tipos Auditables

```typescript
export type EntidadAuditable =
  // Organizacionales
  | 'clientes'
  | 'divisiones'
  | 'jefaturas'
  | 'distritos'

  // Infraestructura
  | 'puntosMedicion'
  | 'relacionesTopologicas'

  // Datos
  | 'fuentesDatos'
  | 'referenciasExternas'

  // Análisis
  | 'balancesHidricos'
  | 'anomalias'

  // Seguridad
  | 'usuarios'
  | 'sesiones';
```

### Métodos Auditados

```typescript
export type MetodoAuditoria =
  | 'post'    // Creación
  | 'put'     // Actualización (full replace)
  | 'delete'; // Eliminación
```

**Nota**: `patch` (actualización parcial) se audita como `put` con el estado completo resultante.

## Implementación

### 1. Backend - Interceptor Automático (NestJS)

El patrón se implementa mediante un **interceptor global** que captura automáticamente todas las modificaciones:

```typescript
// audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method; // POST, PUT, DELETE

    return next.handle().pipe(
      tap((response) => {
        // Crear snapshot de auditoría
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
          this.crearAuditoria({
            entidad: this.getEntidadFromUrl(request.url),
            metodo: method.toLowerCase(),
            dato: response, // Snapshot completo
            idUsuario: request.user.id,
            idCliente: request.user.idCliente,
          });
        }
      })
    );
  }
}
```

### 2. Campos de Auditoría en Entidades

Todas las entidades auditables tienen **solo un campo**:

```typescript
export interface IPuntoMedicion {
  _id?: string;
  // ... campos de la entidad

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;  // Auto-generado (ISO 8601), inmutable
}
```

**Importante**:
- ✅ `fechaCreacion` es **inmutable** (solo se setea en creación)
- ✅ Se genera automáticamente en el backend (no se envía en DTOs)
- ✅ NO hay `fechaModificacion` ni `usuarioModificacion` (están en la auditoría)

### 3. DTOs - Exclusión de Campos de Auditoría

```typescript
// ✅ CORRECTO - fechaCreacion excluido de DTOs
export interface ICreatePuntoMedicion extends Omit<
  Partial<IPuntoMedicion>,
  '_id' | 'cliente' | 'division' | 'fechaCreacion'  // ⭐ Excluir fechaCreacion
> {
  // Solo campos requeridos por el negocio
  idCliente: string;
  nombre: string;
  // ...
}

export interface IUpdatePuntoMedicion extends Omit<
  Partial<IPuntoMedicion>,
  '_id' | 'cliente' | 'division' | 'fechaCreacion'  // ⭐ Excluir fechaCreacion
> {}
```

### 4. Índices MongoDB

```javascript
// Colección: auditorias

// Índice 1: Búsqueda por cliente y fecha (más común)
db.auditorias.createIndex(
  { idCliente: 1, fechaCreacion: -1 },
  { name: 'idx_auditoria_cliente_fecha' }
);

// Índice 2: Búsqueda por objeto específico (historial de un punto)
db.auditorias.createIndex(
  { idCliente: 1, 'dato._id': 1, fechaCreacion: -1 },
  { name: 'idx_auditoria_objeto' }
);

// Índice 3: Búsqueda por usuario (auditoría de acciones de un operador)
db.auditorias.createIndex(
  { idCliente: 1, idUsuario: 1, fechaCreacion: -1 },
  { name: 'idx_auditoria_usuario' }
);

// Índice 4: Búsqueda por entidad y método
db.auditorias.createIndex(
  { idCliente: 1, entidad: 1, metodo: 1, fechaCreacion: -1 },
  { name: 'idx_auditoria_entidad_metodo' }
);

// TTL para data retention (opcional - 7 años típico para empresas públicas)
db.auditorias.createIndex(
  { expireAt: 1 },
  { name: 'idx_auditoria_ttl', expireAfterSeconds: 0 }
);
```

## Casos de Uso

### 1. Auditoría de Cambios en Punto de Medición

```typescript
// Usuario actualiza estado de punto de medición
PUT /api/puntos-medicion/pm-res-001
{
  estado: 'mantenimiento'  // Cambió de 'operativo' a 'mantenimiento'
}

// Backend guarda automáticamente en auditorias:
{
  _id: 'aud-001',
  entidad: 'puntosMedicion',
  metodo: 'put',
  dato: {  // ⭐ Snapshot COMPLETO
    _id: 'pm-res-001',
    idCliente: 'ose-uruguay',
    nombre: 'Medidor Juan Pérez',
    tipo: 'residencial',
    estado: 'mantenimiento',  // Nuevo valor
    ubicacion: { ... },
    configuracionesLectura: [ ... ],
    fechaCreacion: '2025-01-15T08:00:00Z'
  },
  idUsuario: 'usuario-123',
  idCliente: 'ose-uruguay',
  fechaCreacion: '2025-11-04T10:30:00Z'
}
```

### 2. Auditoría de Eliminación

```typescript
// Usuario elimina un punto
DELETE /api/puntos-medicion/pm-res-999

// Backend guarda snapshot ANTES de borrar:
{
  _id: 'aud-002',
  entidad: 'puntosMedicion',
  metodo: 'delete',
  dato: {  // ⭐ Estado completo ANTES del delete
    _id: 'pm-res-999',
    idCliente: 'ose-uruguay',
    nombre: 'Medidor antiguo',
    tipo: 'residencial',
    estado: 'inactivo',
    // ... todos los campos
  },
  idUsuario: 'usuario-456',
  idCliente: 'ose-uruguay',
  fechaCreacion: '2025-11-04T11:00:00Z'
}
```

### 3. Historial Completo de un Objeto

```typescript
// Query: "¿Cómo ha cambiado el punto pm-res-001?"
db.auditorias.find({
  idCliente: 'ose-uruguay',
  'dato._id': 'pm-res-001'
}).sort({ fechaCreacion: -1 })

// Resultado: Array de snapshots ordenados por fecha
[
  {
    fechaCreacion: '2025-11-04T10:30:00Z',
    metodo: 'put',
    dato: { estado: 'mantenimiento', ... }  // Último cambio
  },
  {
    fechaCreacion: '2025-10-15T09:00:00Z',
    metodo: 'put',
    dato: { estado: 'operativo', ... }      // Cambio anterior
  },
  {
    fechaCreacion: '2025-01-15T08:00:00Z',
    metodo: 'post',
    dato: { estado: 'operativo', ... }      // Creación inicial
  }
]
```

### 4. "¿Cómo estaba X en fecha Y?"

```typescript
// Query: "¿Cómo estaba pm-res-001 el 1 de octubre?"
db.auditorias.findOne({
  idCliente: 'ose-uruguay',
  'dato._id': 'pm-res-001',
  fechaCreacion: { $lte: '2025-10-01T23:59:59Z' }
}).sort({ fechaCreacion: -1 })

// Resultado: Snapshot más reciente antes de esa fecha
{
  fechaCreacion: '2025-09-20T14:00:00Z',
  metodo: 'put',
  dato: {  // ⭐ Este es el estado del objeto el 1 de octubre
    _id: 'pm-res-001',
    estado: 'operativo',
    // ... resto del objeto
  }
}
```

### 5. Auditoría de Acciones de Usuario

```typescript
// Query: "¿Qué hizo el usuario-123 en las últimas 24 horas?"
db.auditorias.find({
  idCliente: 'ose-uruguay',
  idUsuario: 'usuario-123',
  fechaCreacion: { $gte: '2025-11-03T10:00:00Z' }
}).sort({ fechaCreacion: -1 })
```

## Data Retention y TTL

### Política de Retención Típica (OSE)

```typescript
// Auditorías con TTL de 7 años (requisito legal común para empresas públicas)
const auditoria: IAuditoria = {
  entidad: 'puntosMedicion',
  metodo: 'put',
  dato: { ... },
  idUsuario: 'usuario-123',
  idCliente: 'ose-uruguay',
  expireAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) // +7 años
};
```

MongoDB eliminará automáticamente los documentos cuando `expireAt` sea alcanzado.

### Auditorías Sin Expiración

Para ciertos eventos críticos, omitir `expireAt`:

```typescript
// Auditoría sin expiración (ej: creación de usuarios administradores)
const auditoriaCritica: IAuditoria = {
  entidad: 'usuarios',
  metodo: 'post',
  dato: { ... },
  idUsuario: 'superadmin',
  idCliente: 'ose-uruguay',
  // Sin expireAt - se mantiene indefinidamente
};
```

## Diferencias con Otros Patrones

### vs. Patrón IRIX/GESTION (Solo fechaCreacion)

| Característica | GAS/INSIDE (Snapshots) | IRIX/GESTION (Simple) |
|----------------|------------------------|------------------------|
| Trazabilidad completa | ✅ Sí | ❌ No |
| Historial de cambios | ✅ Sí | ❌ No |
| Auditoría de deletes | ✅ Sí | ❌ No |
| Espacio en disco | ⚠️ Mayor | ✅ Mínimo |
| Cumplimiento regulatorio | ✅ Total | ⚠️ Básico |
| Complejidad backend | ⚠️ Media | ✅ Mínima |

### vs. Patrón Metadata Embebida

| Característica | GAS/INSIDE (Snapshots) | Metadata Embebida |
|----------------|------------------------|-------------------|
| Historial de cambios | ✅ Completo | ❌ Solo último |
| Qué cambió | ✅ Full snapshot | ⚠️ Solo timestamp |
| Consultas | ✅ Separadas (no afectan entidad) | ⚠️ Cargan la entidad |
| Escalabilidad | ✅ Colección separada indexada | ⚠️ Crece documento principal |
| Auditoría de deletes | ✅ Sí | ❌ No (se pierde) |

## Implementación en Frontend

### Ejemplo: Mostrar Historial de Cambios

```typescript
// Angular service
async getHistorialPunto(idPunto: string): Promise<IAuditoria[]> {
  return this.http.get<IAuditoria[]>(`/api/auditorias`, {
    params: {
      'dato._id': idPunto,
      sort: '-fechaCreacion'
    }
  }).toPromise();
}

// Componente
auditorias: IAuditoria[] = [];

async ngOnInit() {
  this.auditorias = await this.auditService.getHistorialPunto('pm-res-001');

  // Mostrar timeline de cambios
  // [2025-11-04] Usuario: usuario-123 → Cambió a mantenimiento
  // [2025-10-15] Usuario: usuario-456 → Cambió a operativo
  // [2025-01-15] Usuario: usuario-123 → Creado
}
```

## Consideraciones de Performance

### 1. Volumen de Datos

- **Estimación**: ~1KB por snapshot promedio
- **100,000 cambios/mes** = ~100MB/mes = ~1.2GB/año
- **Con TTL 7 años**: ~8.4GB máximo por tenant
- **Mitigación**: Compresión MongoDB (nivel colección) reduce ~50-70%

### 2. Optimización de Snapshots Grandes

Para objetos muy grandes (ej: `IPuntoMedicion` con 50 configuraciones embebidas):

```typescript
// Opción 1: Auditar solo campos relevantes
const snapshotReducido = {
  _id: punto._id,
  nombre: punto.nombre,
  estado: punto.estado,
  tipo: punto.tipo,
  // Omitir arrays grandes si no son relevantes para auditoría
};

// Opción 2: Comprimir dato antes de guardar (gzip)
import { gzip } from 'zlib';
const datoComprimido = await gzip(JSON.stringify(punto));
```

### 3. Queries Eficientes

```typescript
// ✅ CORRECTO - Usa índices compuestos
db.auditorias.find({
  idCliente: 'ose-uruguay',  // Primero: índice compuesto
  'dato._id': 'pm-res-001',  // Segundo: índice compuesto
}).sort({ fechaCreacion: -1 }).limit(50);

// ❌ INCORRECTO - No usa índices eficientemente
db.auditorias.find({
  'dato.nombre': 'Medidor Juan'  // No indexado, scan completo
});
```

## Cumplimiento Regulatorio

### Requisitos OSE (Empresa Pública)

1. ✅ **Trazabilidad completa**: Quién, qué, cuándo, cómo
2. ✅ **Inmutabilidad**: Auditorías no pueden modificarse
3. ✅ **Reconstrucción histórica**: Estado de cualquier objeto en cualquier momento
4. ✅ **Auditoría de eliminaciones**: Saber qué se borró y quién lo borró
5. ✅ **Retención legal**: 7 años típico para empresas públicas

### Controles de Seguridad

```typescript
// Auditorías NUNCA pueden modificarse (solo CREATE, nunca UPDATE/DELETE)
// En NestJS:
@Post()
async create(@Body() dto: ICreateAuditoria) {
  return this.auditService.create(dto);
}

// ❌ NO implementar estos endpoints:
// PUT /auditorias/:id
// DELETE /auditorias/:id
```

## Referencias

- **Modelo Conceptual OSE**: `/doc-ose-aguas/MODELO-CONCEPTUAL.md`
- **Patrón INSIDE/GAS**: Implementación original en sistema GAS
- **Índices MongoDB**: `/INDICES-MONGODB.md`
- **RFC 7946 (GeoJSON)**: Estándar para datos geográficos
