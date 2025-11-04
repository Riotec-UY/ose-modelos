# Permiso

**Entidad:** `IPermiso`
**Contexto:** Seguridad / Autorización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Define una **acción específica sobre un recurso** del sistema. Los permisos se agrupan en roles y se asignan a usuarios.

Modelo basado en **RBAC** (Role-Based Access Control) con granularidad a nivel de **recurso + acción**.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "perm-001" |
| `idCliente` | Cliente (opcional, para permisos custom) | "ose-uruguay" |
| `nombre` | Nombre del permiso | "Crear usuarios" |
| `codigo` | Código único | "usuarios:crear" |
| `descripcion` | Descripción del permiso | "Permite crear nuevos usuarios..." |
| `modulo` | Módulo/recurso | "usuarios" |
| `accion` | Acción sobre el recurso | "crear" |
| `activo` | Estado del permiso | true / false |
| `permisoSistema` | Es permiso del sistema | true / false |

---

## 💡 Estructura de Permisos (Recurso:Acción)

Los permisos siguen el patrón: `{modulo}:{accion}`

### **Acciones Disponibles**
| Acción | Descripción | Ejemplo |
|--------|-------------|---------|
| `crear` | Crear nuevas entidades | `usuarios:crear` |
| `leer` | Ver/consultar entidades | `usuarios:leer` |
| `actualizar` | Modificar entidades existentes | `usuarios:actualizar` |
| `eliminar` | Eliminar entidades | `usuarios:eliminar` |
| `ejecutar` | Ejecutar operaciones especiales | `sincronizacion:ejecutar` |

---

## 📂 Módulos/Recursos del Sistema

### **Organización**
```yaml
- clientes:crear, clientes:leer, clientes:actualizar, clientes:eliminar
- divisiones:crear, divisiones:leer, divisiones:actualizar, divisiones:eliminar
- jefaturas:crear, jefaturas:leer, jefaturas:actualizar, jefaturas:eliminar
- distritos:crear, distritos:leer, distritos:actualizar, distritos:eliminar
```

### **Infraestructura**
```yaml
- puntos_medicion:crear, puntos_medicion:leer, puntos_medicion:actualizar, puntos_medicion:eliminar
- relaciones_topologicas:crear, relaciones_topologicas:leer, etc.
- configuraciones_lectura:crear, configuraciones_lectura:leer, etc.
```

### **Datos**
```yaml
- lecturas:crear, lecturas:leer, lecturas:actualizar, lecturas:eliminar
- fuentes_datos:crear, fuentes_datos:leer, etc.
- referencias_externas:crear, referencias_externas:leer, etc.
```

### **Análisis**
```yaml
- balances_hidricos:crear, balances_hidricos:leer, balances_hidricos:actualizar
- anomalias:crear, anomalias:leer, anomalias:actualizar, anomalias:eliminar
- series_temporales:leer
```

### **Seguridad**
```yaml
- usuarios:crear, usuarios:leer, usuarios:actualizar, usuarios:eliminar
- roles:crear, roles:leer, roles:actualizar, roles:eliminar
- permisos:leer  # Crear/eliminar permisos solo admin sistema
- sesiones:leer, sesiones:eliminar
- logs_auditoria:leer
```

### **Sistema**
```yaml
- configuracion_sistema:leer, configuracion_sistema:actualizar
- notificaciones:crear, notificaciones:leer
- reglas_alerta:crear, reglas_alerta:leer, reglas_alerta:actualizar, reglas_alerta:eliminar
- registros_sincronizacion:leer, registros_sincronizacion:ejecutar
```

### **Dashboards**
```yaml
- dashboard_operativo:leer
- dashboard_gerencial:leer
- reportes:leer, reportes:ejecutar
```

---

## 💡 Ejemplos de Permisos

### **Ejemplo 1: Permiso Básico**
```yaml
Permiso:
  _id: "perm-usuarios-leer"
  idCliente: null  # Permiso del sistema
  nombre: "Ver usuarios"
  codigo: "usuarios:leer"
  descripcion: "Permite visualizar la lista de usuarios y sus detalles"
  modulo: "usuarios"
  accion: "leer"
  activo: true
  permisoSistema: true
```

### **Ejemplo 2: Permiso de Creación**
```yaml
Permiso:
  _id: "perm-anomalias-crear"
  idCliente: null
  nombre: "Crear anomalías"
  codigo: "anomalias:crear"
  descripcion: "Permite reportar nuevas anomalías detectadas"
  modulo: "anomalias"
  accion: "crear"
  activo: true
  permisoSistema: true
```

### **Ejemplo 3: Permiso de Ejecución**
```yaml
Permiso:
  _id: "perm-sincronizacion-ejecutar"
  idCliente: null
  nombre: "Ejecutar sincronización"
  codigo: "registros_sincronizacion:ejecutar"
  descripcion: "Permite ejecutar sincronizaciones manuales con sistemas externos"
  modulo: "registros_sincronizacion"
  accion: "ejecutar"
  activo: true
  permisoSistema: true
```

### **Ejemplo 4: Permiso Personalizado por Cliente**
```yaml
Permiso:
  _id: "perm-custom-001"
  idCliente: "ose-uruguay"  # Específico del cliente
  nombre: "Aprobar balances hídricos"
  codigo: "balances_hidricos:aprobar"
  descripcion: "Permiso especial para aprobar balances antes de publicar"
  modulo: "balances_hidricos"
  accion: "ejecutar"  # Acción especial
  activo: true
  permisoSistema: false  # Permiso personalizado
```

---

## 💡 Composición de Roles con Permisos

Los roles se componen asignando múltiples permisos:

```yaml
Rol "Operador Básico":
  Permisos:
    - dashboard_operativo:leer
    - puntos_medicion:leer
    - lecturas:leer
    - anomalias:crear
    - anomalias:leer

Rol "Supervisor Jefatura":
  Permisos:
    - (todos los del Operador Básico)
    - puntos_medicion:actualizar
    - anomalias:actualizar
    - balances_hidricos:leer
    - reportes:leer

Rol "Administrador":
  Permisos:
    - (TODOS los permisos del sistema)
```

---

## ⚙️ Permisos del Sistema vs Personalizados

### **Permisos del Sistema (`permisoSistema: true`)**
- ✅ Vienen predefinidos con el sistema
- ✅ Son estándar para todos los clientes
- ❌ NO se pueden eliminar
- ❌ NO se pueden modificar

### **Permisos Personalizados (`permisoSistema: false`)**
- ✅ Creados por administradores
- ✅ Específicos de un cliente
- ✅ Se pueden modificar
- ✅ Se pueden eliminar

---

## 🔗 Se relaciona con

- **Cliente**: Permisos personalizados pertenecen a un cliente
- **Rol**: A través de `RolPermiso` (many-to-many)
- **PersonalOperativo**: Indirectamente a través de roles

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Sistema de autorización, middleware de permisos

**Frontend Angular:** Control de visibilidad de componentes, botones

**Administradores:** Configurar roles y permisos del sistema

---

## 💡 Ejemplo de Verificación en Backend

```typescript
// Pseudocódigo (no parte del modelo)
async function verificarPermiso(
  usuario: IPersonalOperativo,
  permisoCodigo: string
): Promise<boolean> {
  // 1. Obtener roles del usuario (via UsuarioRol)
  const roles = await obtenerRolesUsuario(usuario._id);

  // 2. Obtener permisos de esos roles (via RolPermiso)
  const permisos = await obtenerPermisosRoles(roles);

  // 3. Verificar si tiene el permiso
  return permisos.some(p => p.codigo === permisoCodigo && p.activo);
}

// Uso en endpoint:
if (!await verificarPermiso(usuario, 'usuarios:crear')) {
  throw new Error('Sin permisos para crear usuarios');
}
```

---

**Ver:** `permiso.ts` para definición técnica completa
