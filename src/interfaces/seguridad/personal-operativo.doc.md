# Personal Operativo (Usuario)

**Entidad:** `IPersonalOperativo`
**Contexto:** Seguridad / Autenticación
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa a los **usuarios del sistema RIOTEC** con acceso operacional. Incluye operadores, supervisores, gerentes y administradores de la plataforma.

Cada usuario pertenece a un **Cliente** (tenant) y puede tener acceso limitado por **División** y/o **Jefatura**.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "usr-001" |
| `idCliente` | Cliente (tenant) al que pertenece | "ose-uruguay" |
| `idDivision` | División asignada (opcional) | "ugd-maldonado" |
| `idJefatura` | Jefatura asignada (opcional) | "jef-eden" |
| `nombreCompleto` | Nombre del usuario | "Juan Pérez" |
| `email` | Email (usado para login) | "juan.perez@ose.com.uy" |
| `passwordHash` | Hash de contraseña | "$2b$10$..." |
| `estado` | Estado del usuario | "activo" / "inactivo" / "suspendido" |
| `fechaUltimoAcceso` | Última vez que accedió | "2025-11-04T14:30:00Z" |
| `notificacionesEmail` | Recibe notificaciones por email | true |
| `notificacionesPush` | Recibe notificaciones push | false |
| `telefono` | Teléfono de contacto | "+598 99 123 456" |
| `fotoUrl` | URL de foto de perfil | "https://..." |

---

## 💡 Niveles de Acceso

El acceso del usuario se determina por la combinación de División y Jefatura asignadas:

### **Nivel Nacional (Sin División/Jefatura)**
```yaml
PersonalOperativo:
  idCliente: "ose-uruguay"
  idDivision: null
  idJefatura: null
  nombreCompleto: "Admin Nacional"
  email: "admin@ose.com.uy"

# Acceso: TODO el cliente (todas las divisiones y jefaturas)
```

### **Nivel División**
```yaml
PersonalOperativo:
  idCliente: "ose-uruguay"
  idDivision: "ugd-maldonado"
  idJefatura: null
  nombreCompleto: "Gerente UGD Maldonado"
  email: "gerente.maldonado@ose.com.uy"

# Acceso: Solo UGD Maldonado (todas sus jefaturas)
```

### **Nivel Jefatura**
```yaml
PersonalOperativo:
  idCliente: "ose-uruguay"
  idDivision: "ugd-maldonado"
  idJefatura: "jef-eden"
  nombreCompleto: "Operador Edén"
  email: "operador.eden@ose.com.uy"

# Acceso: Solo Jefatura Edén
```

---

## ⚙️ Estados del Usuario

| Estado | Descripción | Puede acceder |
|--------|-------------|---------------|
| `activo` | Usuario operativo normal | ✅ Sí |
| `inactivo` | Usuario desactivado (no se usa) | ❌ No |
| `suspendido` | Usuario temporalmente suspendido | ❌ No |

**Ciclo de vida:**
```
CREACIÓN → activo ⟷ suspendido → inactivo
```

---

## 🔐 Seguridad de Contraseñas

**IMPORTANTE:** NUNCA almacenar contraseñas en texto plano.

```typescript
// ❌ INCORRECTO
{
  password: "miContraseña123"
}

// ✅ CORRECTO
{
  passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
}
```

**Algoritmos recomendados:**
- bcrypt (factor de costo ≥ 10)
- argon2 (recomendado para nuevas implementaciones)
- scrypt

---

## 💡 Ejemplo: Usuario Operador de Jefatura

```yaml
PersonalOperativo:
  _id: "usr-001"
  idCliente: "ose-uruguay"
  idDivision: "ugd-maldonado"
  idJefatura: "jef-eden"

  nombreCompleto: "Juan Pérez"
  email: "juan.perez@ose.com.uy"
  passwordHash: "$2b$10$..."

  estado: "activo"
  fechaUltimoAcceso: "2025-11-04T14:30:00Z"

  notificacionesEmail: true
  notificacionesPush: true
  telefono: "+598 99 123 456"

Acceso:
  - ✅ Puede ver datos de Jefatura Edén
  - ❌ NO puede ver otras jefaturas
  - ❌ NO puede ver otras divisiones
```

---

## 🔗 Se relaciona con

- **Cliente** (`idCliente`): Todo usuario pertenece a un cliente
- **División** (`idDivision`): Puede estar asignado a una división
- **Jefatura** (`idJefatura`): Puede estar asignado a una jefatura
- **UsuarioRol**: Define qué roles tiene el usuario
- **Sesión**: Sesiones activas del usuario
- **LogAuditoría**: Acciones realizadas por el usuario

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Sistema de autenticación y autorización

**Frontend Angular:** Login, gestión de perfil, administración de usuarios

**Administradores:** Crear y gestionar usuarios del sistema

---

**Ver:** `personal-operativo.ts` para definición técnica completa
