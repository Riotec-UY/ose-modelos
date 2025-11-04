# API Responses

**Entidad:** `ISuccessResponse`, `IErrorResponse`, `IListResponse`, `IApiResponse`
**Contexto:** Auxiliares / API
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Define el **formato estándar de respuestas HTTP** para todas las APIs del sistema RIOTEC. Garantiza consistencia en éxitos, errores y listados.

---

## 📋 1. Success Response (`ISuccessResponse<T>`)

Respuesta para operaciones exitosas (GET, POST, PUT, DELETE):

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `success` | Siempre `true` | `true` |
| `data` | Datos de respuesta (tipo genérico) | `{ id: "...", nombre: "..." }` |
| `message` | Mensaje opcional | "Punto creado exitosamente" |
| `timestamp` | Timestamp de respuesta | "2025-11-04T14:30:00Z" |

**Ejemplos:**

```typescript
// GET /api/puntos-medicion/pm-boost-001
{
  "success": true,
  "data": {
    "_id": "pm-boost-001",
    "tipo": "booster",
    "nombre": "Booster Hospital",
    "estado": "operativo"
  },
  "timestamp": "2025-11-04T14:30:00Z"
}

// POST /api/puntos-medicion
{
  "success": true,
  "data": {
    "_id": "pm-boost-002",
    "nombre": "Booster Nuevo"
  },
  "message": "Punto de medición creado exitosamente",
  "timestamp": "2025-11-04T14:35:00Z"
}
```

---

## 📋 2. Error Response (`IErrorResponse`)

Respuesta para errores (400, 404, 500, etc.):

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `success` | Siempre `false` | `false` |
| `error.code` | Código de error | "PUNTO_NO_ENCONTRADO" |
| `error.message` | Mensaje legible | "No se encontró el punto..." |
| `error.details` | Detalles adicionales | `{ id: "pm-boost-999" }` |
| `timestamp` | Timestamp de respuesta | "2025-11-04T14:30:00Z" |

**Ejemplos:**

```typescript
// 404 - Not Found
{
  "success": false,
  "error": {
    "code": "PUNTO_NO_ENCONTRADO",
    "message": "No se encontró el punto de medición con ID pm-boost-999",
    "details": {
      "id": "pm-boost-999"
    }
  },
  "timestamp": "2025-11-04T14:30:00Z"
}

// 400 - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDACION_ERROR",
    "message": "Datos inválidos en la solicitud",
    "details": {
      "campos": [
        { "campo": "nombre", "error": "Nombre es requerido" },
        { "campo": "tipo", "error": "Tipo debe ser uno de: booster, perforación, ..." }
      ]
    }
  },
  "timestamp": "2025-11-04T14:30:00Z"
}

// 500 - Internal Server Error
{
  "success": false,
  "error": {
    "code": "ERROR_INTERNO",
    "message": "Error interno del servidor",
    "details": {
      "errorId": "err-2025-11-04-12345"
    }
  },
  "timestamp": "2025-11-04T14:30:00Z"
}
```

---

## 📋 3. List Response (`IListResponse<T>`)

Respuesta para listados con paginación:

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `success` | Siempre `true` | `true` |
| `data` | Array de resultados | `[{...}, {...}, ...]` |
| `paginacion` | Metadatos de paginación | Ver `IPaginacion` |
| `timestamp` | Timestamp de respuesta | "2025-11-04T14:30:00Z" |

**Ejemplo:**

```typescript
// GET /api/puntos-medicion?tipo=booster&limit=50&skip=0
{
  "success": true,
  "data": [
    {
      "_id": "pm-boost-001",
      "nombre": "Booster Hospital",
      "tipo": "booster",
      "estado": "operativo"
    },
    {
      "_id": "pm-boost-002",
      "nombre": "Booster Centro",
      "tipo": "booster",
      "estado": "operativo"
    }
    // ... 48 resultados más
  ],
  "paginacion": {
    "total": 235,      // Total de boosters
    "limit": 50,       // Resultados por página
    "skip": 0,         // Offset
    "pagina": 1,       // Página actual
    "totalPaginas": 5  // Total de páginas
  },
  "timestamp": "2025-11-04T14:30:00Z"
}
```

---

## 📋 4. API Response Union (`IApiResponse<T>`)

Union type para type-safe handling:

```typescript
export type IApiResponse<T = any> = ISuccessResponse<T> | IErrorResponse;

// Uso en frontend:
async function getPunto(id: string): Promise<IPuntoMedicion> {
  const response: IApiResponse<IPuntoMedicion> = await api.get(`/puntos/${id}`);

  if (response.success) {
    // TypeScript sabe que response.data existe
    return response.data;
  } else {
    // TypeScript sabe que response.error existe
    throw new Error(response.error.message);
  }
}
```

---

## ⚙️ Códigos de Error Comunes

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDACION_ERROR` | 400 | Datos inválidos |
| `NO_AUTORIZADO` | 401 | Sin autenticación |
| `PROHIBIDO` | 403 | Sin permisos |
| `NO_ENCONTRADO` | 404 | Recurso no existe |
| `CONFLICTO` | 409 | Conflicto (ej: duplicado) |
| `ERROR_INTERNO` | 500 | Error del servidor |
| `SERVICIO_NO_DISPONIBLE` | 503 | Servicio temporalmente no disponible |

---

## 💡 Ventajas del Patrón

**Consistencia:**
- Todas las APIs responden con el mismo formato
- Frontend sabe exactamente qué esperar

**Type-Safety:**
- TypeScript infiere tipos correctamente
- Evita errores de runtime

**Debugging:**
- Timestamps en todas las respuestas
- Códigos de error estandarizados

**Manejo de Errores:**
- Distinguir fácilmente éxito de error con `success` flag
- Detalles estructurados para debugging

---

## 🔗 Se relaciona con

- **Query Params** (`IQueryParams`): Define parámetros de entrada
- **Paginación** (`IPaginacion`): Incluida en `IListResponse`
- **Todas las APIs**: Todas las respuestas siguen estos formatos

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Generan respuestas en estos formatos

**Frontend Angular:** Consume y procesa respuestas type-safe

**Documentación API:** Define contrato estándar para todos los endpoints

**Testing:** Valida formato de respuestas en tests

---

**Ver:** `responses.ts` para definición técnica completa
