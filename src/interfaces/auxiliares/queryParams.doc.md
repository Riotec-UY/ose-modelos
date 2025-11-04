# Query Params

**Entidad:** `IQueryParams`, `IPaginacion`
**Contexto:** Auxiliares / API
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Define los **parámetros de consulta** para endpoints GET en las APIs. Permite aplicar filtros, ordenamiento y paginación usando formato MongoDB directamente.

---

## 📋 Query Params (`IQueryParams`)

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `filter` | Filtros MongoDB | `{ tipo: 'booster', estado: 'operativo' }` |
| `limit` | Límite de resultados | `100` |
| `skip` | Offset para paginación | `0` (primera página) |
| `sort` | Ordenamiento | `{ fechaCreacion: -1 }` (-1 = DESC) |
| `projection` | Campos a incluir/excluir | `{ nombre: 1, descripcion: 1 }` |
| `populate` | Referencias a poblar | `['idDistrito', 'idJefatura']` |

---

## 💡 Ejemplo 1: Buscar Boosters en Maldonado

```typescript
const query: IQueryParams = {
  filter: {
    tipo: 'booster',
    'ubicacion.ciudad': 'Maldonado',
    estado: 'operativo'
  },
  limit: 20,
  skip: 0,
  sort: { nombre: 1 }  // Ordenar alfabéticamente
};

// GET /api/puntos-medicion?query={...}
// Resultado: 20 boosters de Maldonado, ordenados por nombre
```

---

## 💡 Ejemplo 2: Lecturas Recientes con Errores

```typescript
const query: IQueryParams = {
  filter: {
    calidadDato: 'error',
    timestamp: { $gte: '2025-11-04T00:00:00Z' }
  },
  limit: 100,
  skip: 0,
  sort: { timestamp: -1 },  // Más recientes primero
  projection: {
    tipoLectura: 1,
    timestamp: 1,
    calidadDato: 1,
    valores: 0  // Excluir valores detallados
  }
};

// Resultado: Últimas 100 lecturas con error del día
```

---

## 💡 Ejemplo 3: Paginación

```typescript
// Página 1 (resultados 0-49)
const pagina1: IQueryParams = {
  filter: { tipo: 'residencial' },
  limit: 50,
  skip: 0
};

// Página 2 (resultados 50-99)
const pagina2: IQueryParams = {
  filter: { tipo: 'residencial' },
  limit: 50,
  skip: 50
};

// Página 3 (resultados 100-149)
const pagina3: IQueryParams = {
  filter: { tipo: 'residencial' },
  limit: 50,
  skip: 100
};
```

---

## 📋 Paginación (`IPaginacion`)

Metadatos incluidos en respuestas de listados:

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `total` | Total de documentos | 1235 |
| `limit` | Límite aplicado | 50 |
| `skip` | Offset aplicado | 100 |
| `pagina` | Página actual | 3 |
| `totalPaginas` | Total de páginas | 25 |

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [...],  // 50 resultados
  "paginacion": {
    "total": 1235,
    "limit": 50,
    "skip": 100,
    "pagina": 3,
    "totalPaginas": 25
  }
}
```

---

## ⚙️ Operadores MongoDB Soportados

```typescript
// Comparación
{ campo: { $gt: 100 } }    // Mayor que
{ campo: { $gte: 100 } }   // Mayor o igual
{ campo: { $lt: 100 } }    // Menor que
{ campo: { $lte: 100 } }   // Menor o igual
{ campo: { $ne: 'valor' } } // No igual

// Lógicos
{ $or: [{ a: 1 }, { b: 2 }] }  // OR
{ $and: [{ a: 1 }, { b: 2 }] } // AND

// Arrays
{ campo: { $in: ['a', 'b', 'c'] } }  // Está en array

// Strings
{ campo: { $regex: 'patrón', $options: 'i' } }  // Regex case-insensitive
```

---

## 🔗 Se relaciona con

- **Responses** (`IListResponse`): Incluye paginación en respuestas
- **Todas las APIs**: Todos los endpoints GET usan este formato

---

## 👥 ¿Quién lo usa?

**Frontend:** Construye queries para buscar/filtrar datos

**Backend APIs:** Recibe y procesa queries en endpoints GET

**Documentación API:** Define contrato estándar para todos los endpoints

---

**Ver:** `queryParams.ts` para definición técnica completa
