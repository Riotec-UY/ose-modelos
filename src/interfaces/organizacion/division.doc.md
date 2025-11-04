# División

**Entidad:** `IDivision`
**Contexto:** Organización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa una unidad administrativa dentro de un cliente (tenant). Puede ser una **región organizacional** tradicional o una **UGD (Unidad de Gestión Descentralizada)** con mayor autonomía operativa.

---

## 🏗️ ¿Para qué sirve?

OSE Uruguay está organizado territorialmente en divisiones y UGDs. Cada una gestiona infraestructura y operaciones en su zona geográfica.

### Tipos de División en OSE:

#### 1. **Región** (División tradicional)
Unidad administrativa clásica con gestión centralizada.

**Ejemplos:**
- División Norte
- División Sur
- División Este

#### 2. **UGD** (Unidad de Gestión Descentralizada)
Unidad con mayor autonomía operativa y presupuestal.

**Ejemplos:**
- UGD Maldonado
- UGD Montevideo
- UGD Colonia

**Diferencias clave:**
- UGDs tienen **mayor autonomía** en toma de decisiones
- UGDs pueden tener **permisos especiales** en el sistema
- UGDs gestionan su **propio presupuesto** operativo

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idCliente` | A qué organización pertenece | "ose-uruguay" |
| `tipo` | Si es región tradicional o UGD | "ugd" |
| `nombre` | Nombre de la división | "UGD Maldonado" |
| `codigo` | Código alfanumérico | "UGD-MALD" |
| `descripcion` | Descripción adicional | "Unidad de Gestión Descentralizada Maldonado" |
| `config` | Configuración específica por tipo | Ver ejemplos abajo |
| `activo` | Si está operativa | true |

---

## 💡 Ejemplo Real 1: UGD Maldonado

```yaml
División:
  ID: ugd-maldonado
  Cliente: OSE Uruguay

  Tipo: ugd (Unidad de Gestión Descentralizada)
  Nombre: "UGD Maldonado"
  Código: "UGD-MALD"
  Descripción: "Unidad de Gestión Descentralizada del departamento de Maldonado"

  Estado: activo

  Configuración Especial (UGD):
    permisosEspeciales: true
    nomenclaturaPersonalizada: "UGD"  # Mostrar "UGD" en UI en vez de "División"
    nivelAutonomia: "alta"

    # Configuraciones operativas propias
    operaciones:
      gestionaPropioPresupuesto: true
      tienePersonalPropio: true
      tomaDecisionesAutonomas: true

    # Contactos
    contactos:
      gerente: "Ing. Hugo Trías"
      email: "ugd.maldonado@ose.com.uy"
      telefono: "+598 42 222333"

  Jerarquía Interna:
    - Jefatura Maldonado Centro
    - Jefatura Punta del Este
    - Jefatura San Carlos
    - Jefatura Pueblo Edén
    - Jefatura Garzón
```

---

## 💡 Ejemplo Real 2: División Norte (Región)

```yaml
División:
  ID: div-norte
  Cliente: OSE Uruguay

  Tipo: region (División tradicional)
  Nombre: "División Norte"
  Código: "DIV-NORTE"
  Descripción: "División organizacional de la región norte del país"

  Estado: activo

  Configuración (Región):
    permisosEspeciales: false  # Gestión más centralizada
    nomenclaturaPersonalizada: "División"
    nivelAutonomia: "media"

  Departamentos Cubiertos:
    - Artigas
    - Salto
    - Rivera
    - Tacuarembó
```

---

## 🔗 Se relaciona con

- **Cliente** (`ICliente`): A qué organización pertenece (siempre OSE Uruguay)
- **Jefatura** (`IJefatura`): Una división tiene múltiples jefaturas
- **Distrito Pitométrico** (`IDistrito`): Pueden pertenecer a una división
- **Puntos de Medición** (`IPuntoMedicion`): Agrupados por división
- **Personal Operativo**: Usuarios pueden estar asignados a una división específica

**Jerarquía:**
```
OSE Uruguay (cliente)
  └─ UGD Maldonado (división)
      ├─ Jefatura Punta del Este
      ├─ Jefatura San Carlos
      └─ Jefatura Pueblo Edén
          └─ Distrito Pitométrico Edén
              └─ Puntos de Medición
```

---

## ⚙️ Reglas de Negocio

### 1. Una división pertenece a exactamente un cliente
No puede haber divisiones compartidas entre clientes.

### 2. Código único dentro del cliente
Dos divisiones del mismo cliente no pueden tener el mismo código.

**Válido:**
- Cliente OSE: código "UGD-MALD"
- Cliente Camuzzi: código "UGD-MALD" (diferente cliente, OK)

**Inválido:**
- Cliente OSE: dos divisiones con código "UGD-MALD"

### 3. Tipo no puede cambiar una vez creada
Si se crea como "ugd", no puede convertirse en "region" después (implicaría cambios estructurales mayores).

### 4. Configuración diferenciada por tipo

**UGDs típicamente tienen:**
- Mayor autonomía operativa
- Permisos especiales en el sistema
- Configuraciones propias más extensas

**Regiones típicamente tienen:**
- Gestión más centralizada
- Configuraciones estándar

---

## 👥 ¿Quién la usa?

### Administradores OSE
Crean y configuran divisiones al estructurar el sistema.

**Caso de uso:** Nueva UGD se incorpora al sistema
1. Admin crea `IDivision` tipo "ugd"
2. Configura nivel de autonomía
3. Crea jefaturas dentro de la UGD
4. Asigna personal operativo a la UGD

### Sistema de Permisos
Restringe acceso de usuarios según división asignada.

**Ejemplo:**
```typescript
// Usuario asignado a UGD Maldonado
usuario.idDivision = "ugd-maldonado";

// Solo puede ver datos de su división
const puntos = await db.puntosMedicion.find({
  idCliente: usuario.idCliente,
  idDivision: usuario.idDivision  // Filtro por división
});
```

### Dashboard de Reportes
Agrupa métricas y reportes por división.

**Visualización:**
```
Eficiencia por División:
  - UGD Maldonado: 67% ⬆️ (+2% vs mes anterior)
  - UGD Montevideo: 58% ➡️
  - División Norte: 52% ⬇️ (-1% vs mes anterior)
```

### Facturación Interna (opcional)
Si OSE quiere centros de costo por división.

---

## 🗺️ Estructura Real de OSE Uruguay

```
OSE Uruguay (1 cliente/tenant)
├── División Norte (tipo: region)
│   ├── Departamentos: Artigas, Salto, Rivera, Tacuarembó
│   └── Gestión: Centralizada
│
├── División Sur (tipo: region)
│   ├── Departamentos: Canelones, Florida, etc.
│   └── Gestión: Centralizada
│
├── División Este (tipo: region)
│   ├── Departamentos: Rocha, Treinta y Tres, Cerro Largo
│   └── Gestión: Centralizada
│
├── UGD Maldonado (tipo: ugd) ⭐ Piloto RIOTEC
│   ├── Autonomía: Alta
│   ├── Jefaturas: 5 (Punta del Este, San Carlos, Edén, etc.)
│   └── Proyecto piloto: Distrito Pitométrico Inteligente
│
├── UGD Montevideo (tipo: ugd)
│   ├── Autonomía: Alta
│   └── Mayor UGD por volumen
│
├── UGD Colonia (tipo: ugd)
│
└── ... (hasta 19 UGDs en total)
```

---

## 📊 Beneficios de la Estructura

### Para OSE Central:
- ✅ Visibilidad de toda la organización
- ✅ Comparación entre divisiones/UGDs
- ✅ Reportes consolidados
- ✅ Gestión centralizada de estándares

### Para UGDs:
- ✅ Autonomía operativa
- ✅ Configuraciones propias
- ✅ Gestión local más ágil
- ✅ Innovación (como el piloto de Maldonado)

### Para Regiones:
- ✅ Organización territorial clara
- ✅ Coordinación de múltiples departamentos
- ✅ Consistencia operativa

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { IDivision, TipoDivision } from 'ose-modelos';

// Crear UGD Maldonado
const ugdMaldonado: IDivision = {
  idCliente: "ose-uruguay",

  tipo: "ugd",
  nombre: "UGD Maldonado",
  codigo: "UGD-MALD",
  descripcion: "Unidad de Gestión Descentralizada Maldonado",

  config: {
    permisosEspeciales: true,
    nomenclaturaPersonalizada: "UGD",
    nivelAutonomia: "alta",

    operaciones: {
      gestionaPropioPresupuesto: true,
      tienePersonalPropio: true
    }
  },

  activo: true
};

// Crear División Norte (región)
const divNorte: IDivision = {
  idCliente: "ose-uruguay",

  tipo: "region",
  nombre: "División Norte",
  codigo: "DIV-NORTE",

  config: {
    permisosEspeciales: false,
    nivelAutonomia: "media"
  },

  activo: true
};
```

**Queries típicas:**

```typescript
// Listar todas las UGDs
const ugds = await db.divisiones.find({
  idCliente: "ose-uruguay",
  tipo: "ugd",
  activo: true
});

// Buscar división de Maldonado
const maldonado = await db.divisiones.findOne({
  idCliente: "ose-uruguay",
  codigo: "UGD-MALD"
});
```

**Ver:** `division.ts` para definición técnica completa
