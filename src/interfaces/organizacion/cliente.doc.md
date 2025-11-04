# Cliente (Tenant)

**Entidad:** `ICliente`
**Contexto:** Organización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa la organización que usa la plataforma RIOTEC. Es el nivel más alto de la jerarquía organizacional (multi-tenant raíz).

**En el contexto OSE:** Representa a toda la organización **OSE Uruguay** como un único tenant.

---

## 🏗️ ¿Para qué sirve?

RIOTEC es una plataforma multi-tenant que puede ser utilizada por múltiples organizaciones de servicios públicos (agua, gas, etc.). El Cliente es el nivel de aislamiento de datos.

### Concepto clave para OSE:

**OSE Uruguay es UN SOLO Cliente (tenant)**. Las divisiones, UGDs y jefaturas son estructuras **internas** del cliente, NO clientes separados.

```
Cliente: OSE Uruguay (tenant único)
  ├─ División Norte (estructura interna)
  ├─ División Sur (estructura interna)
  ├─ UGD Maldonado (estructura interna)
  └─ UGD Montevideo (estructura interna)
```

Esto es importante para:
1. **Aislamiento de datos**: Los datos de OSE Uruguay están completamente separados de otros clientes RIOTEC
2. **Configuración global**: Configuraciones que aplican a toda la organización
3. **Facturación**: OSE Uruguay es una unidad de facturación
4. **Permisos**: Base para el control de acceso multi-tenant

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `nombre` | Nombre de la organización | "OSE Uruguay" |
| `codigo` | Código único identificador | "OSE-UY" |
| `tenantSemilla` | Si es el tenant principal del sistema | false (OSE es un cliente normal) |
| `activo` | Si está operativo | true |
| `configuracion` | Configuraciones globales | Ver ejemplos abajo |

---

## 💡 Ejemplo Real: OSE Uruguay

```yaml
Cliente:
  ID: ose-uruguay
  Nombre: "OSE Uruguay"
  Código: "OSE-UY"

  Estado: activo

  Configuración Global:
    pais: "Uruguay"
    moneda: "UYU"
    zonaHoraria: "America/Montevideo"
    unidadVolumen: "m³"
    unidadPresion: "bar"

    # Configuración de alertas
    alertas:
      emailNotificaciones: "operaciones@ose.com.uy"
      nivelEscalamientoCritico: "gerencia@ose.com.uy"

    # Configuración de balance hídrico
    balanceHidrico:
      umbralEficienciaObjetivo: 75  # %
      umbralPerdidaAlarmaMedia: 20   # %
      umbralPerdidaAlarmaCritica: 30 # %

    # Branding (opcional para UI)
    branding:
      logoUrl: "/assets/ose-logo.png"
      colorPrimario: "#004B87"
      colorSecundario: "#00A3E0"

  Jerarquía Interna:
    - División Norte
    - División Sur
    - División Este
    - UGD Maldonado
    - UGD Montevideo
    - UGD Colonia
    - ... (19 UGDs en total)
```

---

## 🔗 Se relaciona con

- **División** (`IDivision`): Un cliente tiene múltiples divisiones
- **Todo el sistema**: Todas las entidades tienen `idCliente` para aislamiento multi-tenant
- **Usuario** (`IUsuario`): Los usuarios del sistema pertenecen a un cliente

**Jerarquía:**
```
Cliente (OSE Uruguay)
  └─ División (UGD Maldonado)
      └─ Jefatura (Pueblo Edén)
          └─ Distrito (Distrito Pitométrico Edén)
              └─ Puntos de Medición
                  └─ Lecturas
```

---

## ⚙️ Reglas de Negocio

### 1. Un cliente = Un tenant
Cada cliente es un tenant completamente aislado. Los datos de un cliente NO son visibles para otros clientes.

### 2. Código único
El código del cliente debe ser único en toda la plataforma RIOTEC.

**Ejemplos:**
- OSE Uruguay: `"OSE-UY"`
- Camuzzi Gas (otro cliente RIOTEC): `"CAMUZZI-AR"`
- Aguas de Salta (hipotético): `"AGUAS-SALTA-AR"`

### 3. Multi-tenancy PLANO (importante)
OSE tiene una **jerarquía organizacional interna** (divisiones, UGDs), pero sigue siendo un solo tenant.

**Correcto:**
```
Cliente: OSE Uruguay
  └─ Divisiones (estructura interna)
```

**Incorrecto (anti-patrón):**
```
Cliente: UGD Maldonado (NO - esto sería un tenant separado)
Cliente: UGD Montevideo (NO - esto sería otro tenant)
```

### 4. Tenant Semilla (opcional)
Puede existir un "tenant semilla" que contiene configuraciones maestras del sistema.

Para OSE: `tenantSemilla: false` (es un cliente normal)

---

## 👥 ¿Quién lo usa?

### Administradores de Plataforma RIOTEC
Crean y configuran clientes cuando se incorpora una nueva organización.

**Caso de uso:** Nueva utilidad de agua se integra a RIOTEC
1. Admin RIOTEC crea nuevo Cliente
2. Asigna código único
3. Configura parámetros globales (país, zona horaria, unidades)
4. Crea estructura inicial de divisiones

### Sistema de Autenticación
Verifica que usuarios solo accedan a datos de su cliente.

**Flujo:**
```
Usuario login → Token JWT con idCliente → Todas las queries incluyen idCliente
```

### Sistema de Facturación (RIOTEC interno)
Agrupa uso de recursos por cliente para facturación.

**Métricas por cliente:**
- Cantidad de puntos de medición
- Volumen de lecturas almacenadas
- Cantidad de usuarios
- Uso de APIs

---

## 📊 Beneficios del Multi-Tenancy

### Para RIOTEC:
- ✅ Una sola plataforma para múltiples clientes
- ✅ Mantenimiento centralizado
- ✅ Escalabilidad horizontal
- ✅ Costos compartidos de infraestructura

### Para OSE:
- ✅ Datos completamente aislados
- ✅ Configuraciones propias
- ✅ No comparte recursos con otros clientes
- ✅ SLA independiente

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { ICliente } from 'ose-modelos';

// Crear cliente OSE Uruguay
const cliente: ICliente = {
  nombre: "OSE Uruguay",
  codigo: "OSE-UY",
  tenantSemilla: false,
  activo: true,

  configuracion: {
    pais: "Uruguay",
    moneda: "UYU",
    zonaHoraria: "America/Montevideo",
    unidadVolumen: "m³",
    unidadPresion: "bar",

    balanceHidrico: {
      umbralEficienciaObjetivo: 75,
      umbralPerdidaAlarmaMedia: 20,
      umbralPerdidaAlarmaCritica: 30
    }
  }
};
```

**Importante:** En todas las consultas se debe filtrar por `idCliente`:

```typescript
// Correcto - aislamiento multi-tenant
const puntos = await db.puntosMedicion.find({
  idCliente: "ose-uruguay",
  estado: "operativo"
});

// Incorrecto - NO filtrar por cliente
const puntos = await db.puntosMedicion.find({
  estado: "operativo" // ⚠️ Devolvería puntos de TODOS los clientes
});
```

**Ver:** `cliente.ts` para definición técnica completa
