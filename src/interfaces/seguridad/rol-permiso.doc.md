# Rol-Permiso

**Entidad:** `IRolPermiso`
**Contexto:** Seguridad / Autorización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Relaciona **roles con permisos** de forma many-to-many.

Define qué permisos tiene cada rol. Un rol puede tener múltiples permisos, y un permiso puede estar asociado a múltiples roles.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "rol-perm-001" |
| `idRol` | ID del rol | "rol-operador-basico" |
| `idPermiso` | ID del permiso | "perm-dashboard-leer" |
| `fechaAsignacion` | Cuándo se asignó | "2025-11-04T10:00:00Z" |
| `asignadoPor` | Quién lo asignó (opcional) | "usr-admin" |

---

## 💡 Ejemplo 1: Configurar Rol "Operador Básico"

```yaml
Rol:
  _id: "rol-operador-basico"
  nombre: "Operador Básico"

Permisos asignados (via RolPermiso):

  RolPermiso #1:
    idRol: "rol-operador-basico"
    idPermiso: "perm-dashboard-leer"
    fechaAsignacion: "2025-11-04T10:00:00Z"

  RolPermiso #2:
    idRol: "rol-operador-basico"
    idPermiso: "perm-puntos-leer"
    fechaAsignacion: "2025-11-04T10:00:00Z"

  RolPermiso #3:
    idRol: "rol-operador-basico"
    idPermiso: "perm-lecturas-leer"
    fechaAsignacion: "2025-11-04T10:00:00Z"

  RolPermiso #4:
    idRol: "rol-operador-basico"
    idPermiso: "perm-anomalias-crear"
    fechaAsignacion: "2025-11-04T10:00:00Z"

  RolPermiso #5:
    idRol: "rol-operador-basico"
    idPermiso: "perm-anomalias-leer"
    fechaAsignacion: "2025-11-04T10:00:00Z"

Resultado:
  Un "Operador Básico" puede:
    ✅ Ver dashboard operativo
    ✅ Ver puntos de medición
    ✅ Ver lecturas
    ✅ Crear anomalías (reportar problemas)
    ✅ Ver anomalías
    ❌ No puede modificar puntos
    ❌ No puede eliminar anomalías
    ❌ No puede gestionar usuarios
```

---

## 💡 Ejemplo 2: Configurar Rol "Administrador"

```yaml
Rol:
  _id: "rol-admin-sistema"
  nombre: "Administrador del Sistema"

Permisos asignados:
  # Este rol tiene TODOS los permisos del sistema
  # Se crean múltiples RolPermiso, uno por cada permiso existente

  RolPermiso #1:
    idRol: "rol-admin-sistema"
    idPermiso: "perm-usuarios-crear"

  RolPermiso #2:
    idRol: "rol-admin-sistema"
    idPermiso: "perm-usuarios-leer"

  RolPermiso #3:
    idRol: "rol-admin-sistema"
    idPermiso: "perm-usuarios-actualizar"

  RolPermiso #4:
    idRol: "rol-admin-sistema"
    idPermiso: "perm-usuarios-eliminar"

  # ... y así con TODOS los permisos

Resultado:
  Un "Administrador" tiene acceso TOTAL al sistema.
```

---

## 💡 Ejemplo 3: Agregar Permiso a Rol Existente

```yaml
Situación:
  El rol "Operador Avanzado" necesita poder actualizar puntos de medición.

Acción:
  Crear nuevo RolPermiso:
    _id: "rol-perm-new-001"
    idRol: "rol-operador-avanzado"
    idPermiso: "perm-puntos-actualizar"
    fechaAsignacion: "2025-11-04T15:00:00Z"
    asignadoPor: "usr-admin"

Resultado:
  Todos los usuarios con rol "Operador Avanzado" ahora pueden
  actualizar puntos de medición (sin necesidad de modificar
  sus asignaciones de rol).
```

---

## 💡 Flujo Completo: Usuario → Rol → Permiso

```yaml
1. PersonalOperativo:
     _id: "usr-001"
     nombreCompleto: "Juan Pérez"

2. UsuarioRol (Juan tiene rol de Operador):
     idUsuario: "usr-001"
     idRol: "rol-operador-basico"
     alcance: "jefatura"
     idJefatura: "jef-eden"

3. Rol:
     _id: "rol-operador-basico"
     nombre: "Operador Básico"

4. RolPermiso (Operador tiene estos permisos):
     - idRol: "rol-operador-basico", idPermiso: "perm-dashboard-leer"
     - idRol: "rol-operador-basico", idPermiso: "perm-anomalias-crear"
     - idRol: "rol-operador-basico", idPermiso: "perm-anomalias-leer"

5. Permisos:
     - _id: "perm-dashboard-leer", codigo: "dashboard_operativo:leer"
     - _id: "perm-anomalias-crear", codigo: "anomalias:crear"
     - _id: "perm-anomalias-leer", codigo: "anomalias:leer"

Resultado final:
  Juan Pérez puede:
    ✅ Ver dashboard operativo (en Jefatura Edén)
    ✅ Crear anomalías (en Jefatura Edén)
    ✅ Ver anomalías (en Jefatura Edén)
    ❌ No puede ver otras jefaturas (limitado por alcance en UsuarioRol)
```

---

## ⚙️ Ventajas del Patrón

**1. Reutilización de Roles:**
   - Configurar permisos una vez en el rol
   - Aplicar a múltiples usuarios automáticamente

**2. Mantenimiento Centralizado:**
   - Modificar permisos del rol → afecta a todos los usuarios con ese rol
   - No necesidad de actualizar usuario por usuario

**3. Flexibilidad:**
   - Un usuario puede tener múltiples roles (via UsuarioRol)
   - Un rol puede evolucionar agregando/quitando permisos

**4. Auditoría:**
   - Fecha de asignación de cada permiso
   - Trazabilidad de quién configuró el rol

---

## 🔗 Se relaciona con

- **Rol**: El rol que tiene el permiso
- **Permiso**: El permiso asignado al rol
- **PersonalOperativo**: Indirectamente vía UsuarioRol

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Sistema de autorización, resolución de permisos

**Frontend Angular:** Administración de roles, configuración de permisos

**Administradores:** Configurar qué permisos tiene cada rol

---

**Ver:** `rol-permiso.ts` para definición técnica completa
