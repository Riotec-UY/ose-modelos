# Sesión

**Entidad:** `ISesion`
**Contexto:** Seguridad / Autenticación
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa una **sesión activa de usuario** en el sistema. Gestiona tokens JWT, seguimiento de actividad y control de acceso.

Cada vez que un usuario hace login, se crea una nueva sesión.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `_id` | Identificador único | "ses-001" |
| `idUsuario` | Usuario de la sesión | "usr-001" |
| `token` | Token JWT | "eyJhbGciOiJIUzI1NiIs..." |
| `refreshToken` | Token para renovar (opcional) | "refresh_abc123..." |
| `fechaInicio` | Cuándo se inició | "2025-11-04T08:00:00Z" |
| `fechaUltimaActividad` | Última actividad | "2025-11-04T14:30:00Z" |
| `fechaFin` | Cuándo se cerró (null si activa) | "2025-11-04T18:00:00Z" |
| `fechaExpiracion` | Cuándo expira el token | "2025-11-04T16:00:00Z" |
| `estado` | Estado de la sesión | "activa" / "cerrada" / "expirada" |
| `ip` | IP del cliente | "192.168.1.100" |
| `userAgent` | Navegador/cliente | "Mozilla/5.0..." |
| `dispositivo` | Tipo de dispositivo | "web" / "mobile_ios" / "mobile_android" |
| `ubicacion` | Ubicación geográfica (opcional) | { pais: "Uruguay", ciudad: "Maldonado" } |
| `contextoOrganizacional` | Contexto actual (opcional) | { idCliente, idDivision, idJefatura } |

---

## 💡 Ciclo de Vida de una Sesión

```
1. Usuario hace login
   ↓
2. Sistema valida credenciales
   ↓
3. Sistema crea Sesión con estado 'activa'
   ↓
4. Sistema genera token JWT
   ↓
5. Cliente guarda token
   ↓
6. Cliente usa token en cada request (header Authorization: Bearer {token})
   ↓
7. Sistema valida token contra sesión activa
   ↓
8a. Usuario hace logout        OR    8b. Token expira
    → estado = 'cerrada'             → estado = 'expirada'
    → fechaFin = now()               → fechaFin = fechaExpiracion
```

---

## 💡 Estados de Sesión

| Estado | Descripción | Puede usarse |
|--------|-------------|--------------|
| `activa` | Sesión válida y en uso | ✅ Sí |
| `cerrada` | Usuario hizo logout | ❌ No |
| `expirada` | Token expiró por tiempo | ❌ No |
| `invalida` | Token revocado por seguridad | ❌ No |

---

## 💡 Ejemplos

### **Ejemplo 1: Sesión Web Activa**
```yaml
Sesion:
  _id: "ses-001"
  idUsuario: "usr-operador-eden"

  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  refreshToken: "refresh_abc123def456"

  fechaInicio: "2025-11-04T08:00:00Z"
  fechaUltimaActividad: "2025-11-04T14:30:00Z"
  fechaFin: null  # Aún activa
  fechaExpiracion: "2025-11-04T16:00:00Z"  # Expira en 8 horas

  estado: "activa"

  ip: "192.168.1.100"
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
  dispositivo: "web"

  ubicacion:
    pais: "Uruguay"
    ciudad: "Maldonado"

  contextoOrganizacional:
    idCliente: "ose-uruguay"
    idDivision: "ugd-maldonado"
    idJefatura: "jef-eden"

Estado:
  ✅ Usuario puede usar el sistema hasta las 16:00
  ✅ Puede renovar con refreshToken antes de expirar
```

### **Ejemplo 2: Sesión Móvil**
```yaml
Sesion:
  _id: "ses-002"
  idUsuario: "usr-supervisor"

  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  refreshToken: "refresh_mobile_xyz789"

  fechaInicio: "2025-11-04T09:00:00Z"
  fechaUltimaActividad: "2025-11-04T09:30:00Z"
  fechaFin: null
  fechaExpiracion: "2025-11-11T09:00:00Z"  # 7 días (móvil)

  estado: "activa"

  ip: "190.64.123.45"
  userAgent: "RIOTEC-Mobile/1.0.0 (iOS 17.0)"
  dispositivo: "mobile_ios"

  ubicacion:
    pais: "Uruguay"
    ciudad: "Punta del Este"

  contextoOrganizacional:
    idCliente: "ose-uruguay"
    idDivision: "ugd-maldonado"
    idJefatura: null  # Supervisor tiene acceso a toda la división

Estado:
  ✅ Sesión móvil con mayor duración (7 días)
  ✅ Renovación automática con refreshToken
```

### **Ejemplo 3: Sesión Cerrada (Logout)**
```yaml
Sesion:
  _id: "ses-003"
  idUsuario: "usr-admin"

  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  refreshToken: null

  fechaInicio: "2025-11-04T07:00:00Z"
  fechaUltimaActividad: "2025-11-04T17:59:00Z"
  fechaFin: "2025-11-04T18:00:00Z"  # Usuario hizo logout
  fechaExpiracion: "2025-11-04T19:00:00Z"

  estado: "cerrada"

  ip: "10.0.0.50"
  userAgent: "Mozilla/5.0..."
  dispositivo: "web"

Estado:
  ❌ Sesión cerrada, token inválido
  ❌ Usuario debe hacer login nuevamente
```

### **Ejemplo 4: Sesión Expirada**
```yaml
Sesion:
  _id: "ses-004"
  idUsuario: "usr-operador"

  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  fechaInicio: "2025-11-04T08:00:00Z"
  fechaUltimaActividad: "2025-11-04T15:45:00Z"
  fechaFin: "2025-11-04T16:00:00Z"  # Expiró automáticamente
  fechaExpiracion: "2025-11-04T16:00:00Z"

  estado: "expirada"

  ip: "192.168.1.200"
  userAgent: "Mozilla/5.0..."
  dispositivo: "web"

Estado:
  ❌ Token expiró por tiempo (8 horas)
  ⚠️ Usuario puede renovar si tiene refreshToken válido
  ⚠️ Si no, debe hacer login nuevamente
```

---

## 💡 Seguridad y Tokens JWT

### **Token JWT (Access Token)**
- Duración corta: 8 horas (web), 7 días (móvil)
- Contiene claims: `userId`, `clienteId`, `roles`, `exp`
- Se envía en cada request: `Authorization: Bearer {token}`
- NO se almacena en backend, solo se valida firma

### **Refresh Token**
- Duración larga: 30 días (web), 90 días (móvil)
- Se almacena en backend (en Sesión)
- Permite renovar access token sin re-login
- Se puede revocar (marcar sesión como 'invalida')

### **Flujo de Renovación**
```
1. Access token expira
   ↓
2. Cliente envía refreshToken
   ↓
3. Backend valida refreshToken en Sesión
   ↓
4. Si válido: genera nuevo access token
   ↓
5. Actualiza fechaExpiracion en Sesión
   ↓
6. Retorna nuevo token al cliente
```

---

## ⚙️ Contexto Organizacional

El `contextoOrganizacional` define el alcance actual de la sesión:

```yaml
# Operador con acceso solo a Jefatura Edén
contextoOrganizacional:
  idCliente: "ose-uruguay"
  idDivision: "ugd-maldonado"
  idJefatura: "jef-eden"

# Queries automáticamente filtran por este contexto
# Ej: GET /api/puntos-medicion
# → Solo retorna puntos de Jefatura Edén
```

```yaml
# Gerente con acceso a toda la División
contextoOrganizacional:
  idCliente: "ose-uruguay"
  idDivision: "ugd-maldonado"
  idJefatura: null  # null = toda la división

# Queries filtran por división
# Ej: GET /api/puntos-medicion
# → Retorna puntos de todas las jefaturas de Maldonado
```

---

## ⚙️ Gestión de Sesiones Múltiples

Un usuario puede tener **múltiples sesiones activas** simultáneamente:

```yaml
Usuario "usr-001" tiene:
  - Sesión web en computadora de oficina
  - Sesión móvil en teléfono
  - Sesión tablet en campo

Cada una es independiente:
  - Tokens diferentes
  - Expiración diferente
  - Puede cerrar una sin afectar las otras
```

**Cerrar todas las sesiones (logout global):**
```yaml
Acción: Usuario solicita "Cerrar todas las sesiones"

Resultado:
  - Todas las sesiones del usuario → estado = 'invalida'
  - Todos los tokens quedan revocados
  - Usuario debe hacer login nuevamente en todos los dispositivos
```

---

## 🔗 Se relaciona con

- **Usuario** (`IUsuario`): Usuario de la sesión
- **Cliente**: Contexto organizacional
- **División**: Contexto organizacional (opcional)
- **Jefatura**: Contexto organizacional (opcional)

---

## 👥 ¿Quién lo usa?

**Backend APIs:** Autenticación, validación de tokens, gestión de sesiones

**Frontend Angular:** Almacenar token, renovación automática, logout

**Administradores:** Ver sesiones activas, revocar sesiones

---

**Ver:** `sesion.ts` para definición técnica completa
