# Personal Operativo (Usuario) - Modelo MongoDB

**Entidad:** `IPersonalOperativo`, `IPermisoUsuario`
**Contexto:** Seguridad / Autenticación
**Versión:** 2.0.0 (MongoDB-optimized)

---

## 🎯 ¿Qué es?

Representa a los **usuarios del sistema RIOTEC** con acceso operacional.

**Modelo MongoDB-optimized**: Siguiendo el patrón de IRIX, los permisos, roles y módulos están **embebidos** como arrays y objetos dentro del usuario, NO como referencias a entidades separadas. Esto permite obtener el usuario completo con todos sus permisos en **1 solo query**.

---

## 📋 Información que contiene

### **IPersonalOperativo** (Usuario principal)

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "usr-001" |
| `idCliente` | Cliente (tenant) al que pertenece | "ose-uruguay" |
| `idDivision` | División por defecto (opcional) | "ugd-maldonado" |
| `idJefatura` | Jefatura por defecto (opcional) | "jef-eden" |
| `nombreCompleto` | Nombre del usuario | "Juan Pérez" |
| `email` | Email (usado para login) | "juan.perez@ose.com.uy" |
| `username` | Username alternativo | "jperez" |
| `passwordHash` | Hash de contraseña | "$2b$10$..." |
| **`permisos`** | **Array embebido de permisos** | `[{ alcance, roles, permisos }]` |
| `estado` | Estado del usuario | "activo" / "inactivo" / "suspendido" |
| `fechaUltimoAcceso` | Última vez que accedió | "2025-11-04T14:30:00Z" |

### **IPermisoUsuario** (Embebido en el array `permisos`)

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idCliente` | Cliente donde aplica | "ose-uruguay" |
| `idDivision` | División donde aplica (opcional) | "ugd-maldonado" |
| `idJefatura` | Jefatura donde aplica (opcional) | "jef-eden" |
| `alcance` | Alcance del permiso | "global" / "division" / "jefatura" |
| **`roles`** | **Array de roles (strings, NO refs)** | `["operador_basico"]` |
| **`permisos`** | **Objeto con permisos por módulo** | `{ puntos_medicion: { leer: true } }` |
| `activo` | Estado del permiso | true / false |
| `fechaAsignacion` | Cuándo se asignó | "2025-11-04T10:00:00Z" |
| `fechaExpiracion` | Cuándo expira (opcional) | "2026-11-04T23:59:59Z" |

---

## 💡 Ejemplo Completo: Operador de Jefatura Edén

```typescript
const usuario: IPersonalOperativo = {
  _id: "usr-001",
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",
  idJefatura: "jef-eden",

  nombreCompleto: "Juan Pérez",
  email: "juan.perez@ose.com.uy",
  username: "jperez",
  passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXe...",

  // ✅ Permisos embebidos (NO referencias!)
  permisos: [
    {
      idCliente: "ose-uruguay",
      idDivision: "ugd-maldonado",
      idJefatura: "jef-eden",
      alcance: "jefatura",

      // Array de roles (strings)
      roles: ["operador_basico"],

      // Objeto con permisos por módulo
      permisos: {
        dashboard_operativo: { leer: true },
        puntos_medicion: { leer: true },
        lecturas: { leer: true },
        anomalias: { crear: true, leer: true },
        balances_hidricos: { leer: true }
      },

      activo: true,
      fechaAsignacion: "2025-11-04T10:00:00Z"
    }
  ],

  estado: "activo",
  fechaUltimoAcceso: "2025-11-04T14:30:00Z",
  notificacionesEmail: true,
  notificacionesPush: true
};
```

**Acceso:**
- ✅ Puede ver dashboard operativo (en Jefatura Edén)
- ✅ Puede ver puntos de medición (en Jefatura Edén)
- ✅ Puede crear y ver anomalías (en Jefatura Edén)
- ❌ NO puede modificar puntos (no tiene permiso `actualizar`)
- ❌ NO puede ver otras jefaturas (limitado por alcance)

---

## 💡 Ejemplo: Usuario con Múltiples Permisos

Un usuario puede tener múltiples permisos con diferentes alcances:

```typescript
const usuario: IPersonalOperativo = {
  _id: "usr-supervisor",
  idCliente: "ose-uruguay",
  nombreCompleto: "María Gómez",
  email: "maria.gomez@ose.com.uy",

  // ✅ Múltiples permisos embebidos
  permisos: [
    // Permiso 1: Supervisor en Jefatura Edén
    {
      idCliente: "ose-uruguay",
      idDivision: "ugd-maldonado",
      idJefatura: "jef-eden",
      alcance: "jefatura",
      roles: ["supervisor_jefatura"],
      permisos: {
        puntos_medicion: { crear: true, leer: true, actualizar: true },
        anomalias: { crear: true, leer: true, actualizar: true, eliminar: true },
        balances_hidricos: { leer: true, ejecutar: true }
      },
      activo: true,
      fechaAsignacion: "2025-01-01T00:00:00Z"
    },

    // Permiso 2: Analista en toda la División
    {
      idCliente: "ose-uruguay",
      idDivision: "ugd-maldonado",
      alcance: "division",
      roles: ["analista"],
      permisos: {
        dashboard_gerencial: { leer: true },
        reportes: { leer: true, ejecutar: true },
        series_temporales: { leer: true }
      },
      activo: true,
      fechaAsignacion: "2025-03-01T00:00:00Z"
    }
  ],

  estado: "activo"
};
```

**Resultado:**
- En **Jefatura Edén**: tiene permisos de Supervisor + Analista
- En **otras jefaturas de Maldonado**: solo permisos de Analista
- En **otras divisiones**: sin acceso

---

## 💡 Roles Disponibles

Los roles son **strings simples** (NO entidades):

```typescript
type TipoRol =
  | 'administrador_sistema'
  | 'administrador_cliente'
  | 'gerente_division'
  | 'supervisor_jefatura'
  | 'operador_avanzado'
  | 'operador_basico'
  | 'analista'
  | 'tecnico'
  | 'viewer';
```

---

## 💡 Permisos por Módulo

Los permisos se definen como un **objeto** con flags booleanos:

```typescript
permisos: {
  puntos_medicion: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  },
  lecturas: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  },
  balances_hidricos: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
    ejecutar?: boolean; // Acción especial
  },
  // ... 24 módulos más
}
```

**Módulos disponibles** (27 total):
- **Organización**: clientes, divisiones, jefaturas, distritos
- **Infraestructura**: puntos_medicion, relaciones_topologicas, configuraciones_lectura
- **Datos**: lecturas, fuentes_datos, referencias_externas
- **Análisis**: balances_hidricos, anomalias, series_temporales
- **Seguridad**: usuarios, sesiones, logs_auditoria
- **Sistema**: configuracion_sistema, notificaciones, reglas_alerta, registros_sincronizacion
- **Dashboards**: dashboard_operativo, dashboard_gerencial, reportes

---

## ⚙️ Ventajas del Modelo MongoDB

### ✅ **1 Solo Query**
```typescript
// Obtener usuario con TODOS sus permisos
const usuario = await db.usuarios.findOne({ _id: "usr-001" });
// usuario.permisos[] ya tiene todo!
```

### ❌ **Modelo SQL antiguo (6 queries!)**
```sql
-- 1. Obtener usuario
SELECT * FROM usuarios WHERE id = 'usr-001';

-- 2. Obtener roles del usuario
SELECT * FROM usuario_rol WHERE id_usuario = 'usr-001';

-- 3. Obtener info de cada rol
SELECT * FROM roles WHERE id IN (...)

-- 4. Obtener permisos de cada rol
SELECT * FROM rol_permiso WHERE id_rol IN (...)

-- 5. Obtener info de cada permiso
SELECT * FROM permisos WHERE id IN (...)

-- 6. Popular referencias...
```

### ✅ **Denormalización Correcta**
- Los permisos están **cerca** de donde se usan
- Sin JOINs complejos
- Performance óptima
- Modelo natural para MongoDB

---

## ⚙️ Helpers Disponibles

```typescript
// Permisos completos (admin)
import { PERMISOS_COMPLETOS } from 'ose-modelos';

// Permisos de solo lectura (viewer)
import { PERMISOS_SOLO_LECTURA } from 'ose-modelos';

// Crear permiso personalizado
const permisoOperador: IPermisoUsuario = {
  idCliente: "ose-uruguay",
  idJefatura: "jef-eden",
  alcance: "jefatura",
  roles: ["operador_basico"],
  permisos: {
    dashboard_operativo: { leer: true },
    anomalias: { crear: true, leer: true }
  },
  activo: true,
  fechaAsignacion: new Date().toISOString()
};
```

---

## 🔗 Se relaciona con

- **Cliente** (`idCliente`): Todo usuario pertenece a un cliente
- **División** (`idDivision`): Contexto organizacional
- **Jefatura** (`idJefatura`): Contexto organizacional
- **Sesión**: Sesiones activas del usuario

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Sistema de autenticación y autorización (1 query!)

**Frontend Angular:** Login, gestión de perfil, administración de usuarios

**Administradores:** Crear y gestionar usuarios del sistema

---

**Ver:** `personal-operativo.ts`, `tipos-roles.ts`, `tipos-permisos.ts` para definiciones técnicas completas
