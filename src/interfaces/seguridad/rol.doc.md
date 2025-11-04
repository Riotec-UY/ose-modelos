# Rol

**Entidad:** `IRol`
**Contexto:** Seguridad / Autorización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Define un **conjunto de permisos** que pueden ser asignados a usuarios. Los roles determinan qué acciones puede realizar un usuario en el sistema.

Basado en el patrón **RBAC** (Role-Based Access Control).

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "rol-001" |
| `idCliente` | Cliente al que pertenece | "ose-uruguay" |
| `nombre` | Nombre del rol | "Operador Avanzado" |
| `codigo` | Código alfanumérico único | "OPER_AVZ" |
| `tipo` | Tipo de rol predefinido | "operador_avanzado" |
| `descripcion` | Descripción del rol | "Operador con permisos extendidos..." |
| `nivelAcceso` | Nivel de acceso | "jefatura" / "division" / "nacional" |
| `activo` | Estado del rol | true / false |
| `rolSistema` | Es rol del sistema (no modificable) | true / false |

---

## 💡 Tipos de Roles Predefinidos

### **Nivel Sistema**
```yaml
- administrador_sistema:
    Descripción: Acceso total al sistema
    Nivel: nacional
    Permisos: TODOS
```

### **Nivel Cliente**
```yaml
- administrador_cliente:
    Descripción: Administrador de un cliente
    Nivel: nacional (dentro del cliente)
    Permisos: Administración completa del cliente
```

### **Nivel División/UGD**
```yaml
- gerente_division:
    Descripción: Gerente de división/UGD
    Nivel: division
    Permisos: Gestión de la división y sus jefaturas
```

### **Nivel Jefatura**
```yaml
- supervisor_jefatura:
    Descripción: Supervisor de jefatura
    Nivel: jefatura
    Permisos: Supervisión de una jefatura específica

- operador_avanzado:
    Descripción: Operador con permisos extendidos
    Nivel: jefatura
    Permisos: Crear/modificar datos operacionales

- operador_basico:
    Descripción: Operador con permisos básicos
    Nivel: jefatura
    Permisos: Solo lectura y reportar anomalías
```

### **Roles de Solo Lectura**
```yaml
- analista:
    Descripción: Analista de datos
    Nivel: division / jefatura
    Permisos: Lectura avanzada, exportar reportes

- viewer:
    Descripción: Solo visualización
    Nivel: cualquiera
    Permisos: Solo lectura de dashboards
```

### **Roles Personalizados**
```yaml
- personalizado:
    Descripción: Rol creado por administrador
    Nivel: según necesidad
    Permisos: Configurables
```

---

## 💡 Ejemplos

### **Ejemplo 1: Rol de Sistema**
```yaml
Rol:
  _id: "rol-admin-sistema"
  idCliente: "ose-uruguay"
  nombre: "Administrador del Sistema"
  codigo: "ADMIN_SYS"
  tipo: "administrador_sistema"
  descripcion: "Acceso total a todos los módulos del sistema"
  nivelAcceso: "nacional"
  activo: true
  rolSistema: true  # No se puede eliminar ni modificar

Permisos asociados:
  - usuarios:crear, usuarios:leer, usuarios:actualizar, usuarios:eliminar
  - roles:crear, roles:leer, roles:actualizar, roles:eliminar
  - ... (todos los permisos)
```

### **Ejemplo 2: Rol de Operador de Jefatura**
```yaml
Rol:
  _id: "rol-oper-basico"
  idCliente: "ose-uruguay"
  nombre: "Operador Básico"
  codigo: "OPER_BAS"
  tipo: "operador_basico"
  descripcion: "Operador con permisos básicos de lectura y reporte"
  nivelAcceso: "jefatura"
  activo: true
  rolSistema: true

Permisos asociados:
  - dashboard_operativo:leer
  - puntos_medicion:leer
  - lecturas:leer
  - anomalias:crear  # Puede reportar anomalías
  - anomalias:leer
  - balances_hidricos:leer
```

### **Ejemplo 3: Rol Personalizado**
```yaml
Rol:
  _id: "rol-custom-001"
  idCliente: "ose-uruguay"
  nombre: "Inspector de Calidad"
  codigo: "INSP_CAL"
  tipo: "personalizado"
  descripcion: "Inspector enfocado en calidad de agua"
  nivelAcceso: "division"
  activo: true
  rolSistema: false  # Se puede modificar

Permisos asociados:
  - lecturas:leer  # Solo lecturas de cloro/pH
  - anomalias:crear  # Reportar problemas de calidad
  - reportes:leer
```

---

## ⚙️ Niveles de Acceso

| Nivel | Descripción | Ejemplo |
|-------|-------------|---------|
| `nacional` | Acceso a todo el cliente | Admin sistema, admin cliente |
| `division` | Acceso a una división/UGD | Gerente UGD Maldonado |
| `jefatura` | Acceso a una jefatura | Operador Jefatura Edén |

---

## ⚙️ Roles del Sistema vs Personalizados

### **Roles del Sistema (`rolSistema: true`)**
- ✅ Vienen predefinidos con el sistema
- ✅ Tienen permisos estándar
- ❌ NO se pueden eliminar
- ⚠️ NO se pueden modificar sus permisos (en algunos casos sí el nombre/descripción)

### **Roles Personalizados (`rolSistema: false`)**
- ✅ Creados por administradores
- ✅ Permisos configurables
- ✅ Se pueden modificar
- ✅ Se pueden eliminar (si no hay usuarios asignados)

---

## 🔗 Se relaciona con

- **Cliente**: Todo rol pertenece a un cliente
- **Permiso**: A través de `RolPermiso` (many-to-many)
- **PersonalOperativo**: A través de `UsuarioRol` (many-to-many)

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Sistema de autorización, control de acceso

**Frontend Angular:** Administración de roles, asignación de permisos

**Administradores:** Crear y gestionar roles del sistema

---

**Ver:** `rol.ts` para definición técnica completa
