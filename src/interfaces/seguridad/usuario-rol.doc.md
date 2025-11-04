# Usuario-Rol

**Entidad:** `IUsuarioRol`
**Contexto:** Seguridad / Autorización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Relaciona **usuarios con roles** de forma many-to-many con **alcance organizacional**.

Un usuario puede tener múltiples roles con diferentes alcances (global, división, jefatura).

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "usr-rol-001" |
| `idUsuario` | ID del usuario | "usr-001" |
| `idRol` | ID del rol | "rol-oper-basico" |
| `alcance` | Alcance del rol | "global" / "division" / "jefatura" |
| `idDivision` | División donde aplica (opcional) | "ugd-maldonado" |
| `idJefatura` | Jefatura donde aplica (opcional) | "jef-eden" |
| `fechaAsignacion` | Cuándo se asignó | "2025-11-04T10:00:00Z" |
| `fechaExpiracion` | Cuándo expira (opcional) | "2026-11-04T23:59:59Z" |
| `asignadoPor` | Quién lo asignó | "usr-admin-001" |
| `activo` | Estado de la asignación | true / false |

---

## 💡 Alcances del Rol

### **Alcance Global**
El usuario tiene ese rol en **TODO el cliente** (acceso nacional).

```yaml
UsuarioRol:
  idUsuario: "usr-admin"
  idRol: "rol-admin-sistema"
  alcance: "global"
  idDivision: null
  idJefatura: null

# El usuario puede ejercer ese rol en cualquier división/jefatura
```

### **Alcance División**
El usuario tiene ese rol solo en una **división específica**.

```yaml
UsuarioRol:
  idUsuario: "usr-gerente"
  idRol: "rol-gerente-division"
  alcance: "division"
  idDivision: "ugd-maldonado"
  idJefatura: null

# El usuario puede ejercer ese rol solo en UGD Maldonado
# (y todas sus jefaturas)
```

### **Alcance Jefatura**
El usuario tiene ese rol solo en una **jefatura específica**.

```yaml
UsuarioRol:
  idUsuario: "usr-operador"
  idRol: "rol-operador-basico"
  alcance: "jefatura"
  idDivision: "ugd-maldonado"
  idJefatura: "jef-eden"

# El usuario puede ejercer ese rol SOLO en Jefatura Edén
```

---

## 💡 Ejemplos

### **Ejemplo 1: Administrador Global**
```yaml
UsuarioRol:
  _id: "usr-rol-001"
  idUsuario: "usr-admin-sistema"
  idRol: "rol-admin-sistema"

  alcance: "global"  # Acceso total al cliente
  idDivision: null
  idJefatura: null

  fechaAsignacion: "2025-01-01T00:00:00Z"
  fechaExpiracion: null  # Sin expiración
  asignadoPor: "usr-superadmin"
  activo: true

Resultado:
  El usuario puede ejercer permisos de "Administrador del Sistema"
  en TODAS las divisiones y jefaturas de OSE Uruguay.
```

### **Ejemplo 2: Gerente de UGD**
```yaml
UsuarioRol:
  _id: "usr-rol-002"
  idUsuario: "usr-gerente-maldonado"
  idRol: "rol-gerente-division"

  alcance: "division"
  idDivision: "ugd-maldonado"  # Solo UGD Maldonado
  idJefatura: null

  fechaAsignacion: "2025-02-01T00:00:00Z"
  fechaExpiracion: null
  asignadoPor: "usr-admin-sistema"
  activo: true

Resultado:
  El usuario puede ejercer permisos de "Gerente de División"
  en UGD Maldonado y todas sus jefaturas (Edén, San Carlos, etc.)
```

### **Ejemplo 3: Operador de Jefatura**
```yaml
UsuarioRol:
  _id: "usr-rol-003"
  idUsuario: "usr-operador-eden"
  idRol: "rol-operador-basico"

  alcance: "jefatura"
  idDivision: "ugd-maldonado"
  idJefatura: "jef-eden"  # SOLO Jefatura Edén

  fechaAsignacion: "2025-03-01T00:00:00Z"
  fechaExpiracion: null
  asignadoPor: "usr-gerente-maldonado"
  activo: true

Resultado:
  El usuario puede ejercer permisos de "Operador Básico"
  SOLO en Jefatura Edén. No puede ver otras jefaturas.
```

### **Ejemplo 4: Usuario con Múltiples Roles**
```yaml
Usuario: "usr-supervisor"

Asignaciones:
  # Rol 1: Supervisor en Jefatura Edén
  UsuarioRol:
    idRol: "rol-supervisor-jefatura"
    alcance: "jefatura"
    idDivision: "ugd-maldonado"
    idJefatura: "jef-eden"

  # Rol 2: Analista en toda la División
  UsuarioRol:
    idRol: "rol-analista"
    alcance: "division"
    idDivision: "ugd-maldonado"
    idJefatura: null

Resultado:
  - En Jefatura Edén: tiene permisos de Supervisor + Analista
  - En otras jefaturas de Maldonado: solo permisos de Analista
  - En otras divisiones: sin acceso
```

### **Ejemplo 5: Rol Temporal**
```yaml
UsuarioRol:
  _id: "usr-rol-005"
  idUsuario: "usr-pasante"
  idRol: "rol-viewer"

  alcance: "jefatura"
  idDivision: "ugd-maldonado"
  idJefatura: "jef-eden"

  fechaAsignacion: "2025-11-01T00:00:00Z"
  fechaExpiracion: "2025-12-31T23:59:59Z"  # Expira fin de año
  asignadoPor: "usr-supervisor-eden"
  activo: true

Resultado:
  El usuario tiene acceso solo hasta el 31/12/2025.
  Después de esa fecha, el sistema debe marcar activo=false automáticamente.
```

---

## ⚙️ Reglas de Validación

1. **Alcance y División/Jefatura:**
   - Si `alcance = 'global'` → `idDivision` e `idJefatura` deben ser `null`
   - Si `alcance = 'division'` → `idDivision` es requerido, `idJefatura` debe ser `null`
   - Si `alcance = 'jefatura'` → `idDivision` e `idJefatura` son requeridos

2. **Coherencia Organizacional:**
   - La `idJefatura` debe pertenecer a la `idDivision` especificada

3. **Expiración:**
   - Si `fechaExpiracion` es pasada → `activo` debe ser `false`
   - Sistema debe verificar expiración periódicamente

---

## 🔗 Se relaciona con

- **PersonalOperativo**: El usuario que tiene el rol
- **Rol**: El rol asignado
- **División**: Alcance de división (opcional)
- **Jefatura**: Alcance de jefatura (opcional)

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Sistema de autorización, resolución de permisos por contexto

**Frontend Angular:** Administración de usuarios, asignación de roles

**Administradores:** Asignar roles a usuarios con alcance específico

---

**Ver:** `usuario-rol.ts` para definición técnica completa
