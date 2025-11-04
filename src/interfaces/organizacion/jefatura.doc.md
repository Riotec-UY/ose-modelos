# Jefatura

**Entidad:** `IJefatura`
**Contexto:** Organización
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa un centro operativo local dentro de una División o UGD. Es una subdivisión geográfica/operacional más específica que agrupa infraestructura y personal de una zona.

---

## 🏗️ ¿Para qué sirve?

Las Divisiones y UGDs de OSE son muy extensas geográficamente. Las Jefaturas son las unidades operativas locales que gestionan el día a día en localidades específicas.

### Características:
- **Geográficamente específicas**: Una jefatura cubre una ciudad, pueblo o zona
- **Operación local**: Tiene personal y recursos propios
- **Gestión de infraestructura**: Administra puntos de medición, distritos, redes de su zona
- **Atención en terreno**: Primer nivel de respuesta ante incidentes

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `idCliente` | A qué organización pertenece | "ose-uruguay" |
| `idDivision` | A qué división/UGD pertenece | "ugd-maldonado" |
| `nombre` | Nombre de la jefatura | "Jefatura Pueblo Edén" |
| `codigo` | Código alfanumérico | "JEF-EDEN" |
| `descripcion` | Descripción | "Centro operativo Pueblo Edén" |
| `configuracion` | Datos de contacto, horarios, etc. | Ver ejemplos |
| `activo` | Si está operativa | true |

---

## 💡 Ejemplo Real 1: Jefatura Pueblo Edén

```yaml
Jefatura:
  ID: jef-eden
  Cliente: OSE Uruguay
  División: UGD Maldonado

  Nombre: "Jefatura Pueblo Edén"
  Código: "JEF-EDEN"
  Descripción: "Centro operativo localidad Pueblo Edén y zonas rurales circundantes"

  Estado: activo

  Configuración:
    # Ubicación física de la jefatura
    direccion: "Ruta 12 km 5, Pueblo Edén"
    telefono: "+598 42 XXX-XXX"
    email: "jefatura.eden@ose.com.uy"

    # Horarios de atención
    horarioAtencion: "Lunes a Viernes 8:00-16:00"

    # Personal
    cantidadOperadores: 8
    cantidadTecnicos: 4
    jefe: "Técnico Juan Rodríguez"

    # Área de cobertura
    localidadesCubiertas:
      - "Pueblo Edén (urbano)"
      - "Zona rural Edén"
      - "Paraje Los Talas"

  Infraestructura Gestionada:
    - 1 Perforación (Perforación Edén)
    - 95 Medidores residenciales
    - 1 Distrito Pitométrico
    - 15 km de red de distribución
```

---

## 💡 Ejemplo Real 2: Jefatura Punta del Este

```yaml
Jefatura:
  ID: jef-punta-este
  Cliente: OSE Uruguay
  División: UGD Maldonado

  Nombre: "Jefatura Punta del Este"
  Código: "JEF-PDE"
  Descripción: "Centro operativo zona costera peninsular"

  Estado: activo

  Configuración:
    direccion: "Av. Gorlero y Calle 25, Punta del Este"
    telefono: "+598 42 XXX-XXX"
    email: "jefatura.pde@ose.com.uy"

    horarioAtencion:
      temporadaBaja: "Lunes a Viernes 8:00-16:00"
      temporadaAlta: "Lunes a Domingo 7:00-21:00"  # Verano: horario extendido

    # Personal (varía según temporada)
    personalTemporadaBaja: 12
    personalTemporadaAlta: 35  # Refuerzos para verano

  Características Especiales:
    # Zona turística con alta estacionalidad
    variacionDemanda: "300% en verano vs invierno"
    poblacionPermanente: 15000
    poblacionTemporadaAlta: 45000

  Infraestructura Gestionada:
    - 2 Perforaciones principales
    - 3 Boosters de refuerzo
    - 2 Depósitos de almacenamiento
    - Múltiples distritos pitométricos
    - Red de distribución extensa
```

---

## 🔗 Se relaciona con

- **Cliente** (`ICliente`): La organización raíz (OSE Uruguay)
- **División** (`IDivision`): La división/UGD a la que pertenece
- **Distrito Pitométrico** (`IDistrito`): Una jefatura puede tener múltiples distritos
- **Puntos de Medición** (`IPuntoMedicion`): Infraestructura gestionada localmente
- **Personal Operativo**: Usuarios asignados a la jefatura

**Jerarquía completa:**
```
OSE Uruguay (cliente)
  └─ UGD Maldonado (división)
      └─ Jefatura Pueblo Edén (centro operativo local)
          ├─ Distrito Pitométrico Edén
          ├─ Perforación Edén
          ├─ 95 Medidores residenciales
          └─ Personal operativo (8 operadores + 4 técnicos)
```

---

## ⚙️ Reglas de Negocio

### 1. Pertenencia obligatoria a División
Una jefatura siempre pertenece a una división/UGD específica.

### 2. Herencia de cliente
Una jefatura hereda el `idCliente` de su división (siempre "ose-uruguay" en este caso).

### 3. Nombre único dentro de división
Dos jefaturas de la misma división no pueden tener el mismo nombre.

**Válido:**
- División UGD Maldonado: "Jefatura Pueblo Edén"
- División Norte: "Jefatura Pueblo Edén" (diferente división, OK)

### 4. Cobertura geográfica
Una jefatura típicamente cubre:
- Una localidad urbana principal
- Zonas rurales circundantes
- Puede haber superposición en zonas de transición (coordinan entre jefaturas)

---

## 👥 ¿Quién la usa?

### Administradores de UGD
Crean y configuran jefaturas según organización territorial.

**Caso de uso:** Estructura inicial de UGD Maldonado
1. Identifican centros operativos locales
2. Crean jefatura para cada zona
3. Asignan infraestructura a cada jefatura
4. Asignan personal

### Personal Operativo Local
Los operadores y técnicos pertenecen a una jefatura.

**Ejemplo:**
```typescript
// Operador de Pueblo Edén
usuario = {
  nombre: "Juan Rodríguez",
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",
  idJefatura: "jef-eden",  // Asignado a Jefatura Edén
  rol: "operador"
};

// Solo ve datos de su jefatura
```

### Sistema de Asignación de Tareas
Asigna trabajos de mantenimiento según ubicación.

**Ejemplo:**
```
Anomalía detectada en: Perforación Edén
  └─ Ubicación: Jefatura Pueblo Edén
  └─ Asignar a: Personal de Jefatura Edén
  └─ Notificar: jefatura.eden@ose.com.uy
```

### Dashboard de Gestión
Muestra métricas por jefatura para gerentes de UGD.

**Visualización:**
```
UGD Maldonado - Eficiencia por Jefatura:

  Jefatura Pueblo Edén:        72% ✅ (sobre objetivo 72%)
  Jefatura Punta del Este:     65% ⚠️ (bajo objetivo)
  Jefatura San Carlos:         68% ➡️
  Jefatura Garzón:             70% ✅
```

---

## 🗺️ Jefaturas de UGD Maldonado

```
UGD Maldonado
├── Jefatura Maldonado Centro
│   ├── Zona urbana capital
│   ├── Mayor densidad poblacional
│   └── Infraestructura más compleja
│
├── Jefatura Punta del Este ⭐
│   ├── Zona turística costera
│   ├── Alta estacionalidad (verano)
│   └── Demanda variable 300%
│
├── Jefatura San Carlos
│   ├── Localidad intermedia
│   └── Zona mixta urbano-rural
│
├── Jefatura Pueblo Edén ⭐ Piloto
│   ├── Localidad rural
│   ├── 95 medidores telemedidos
│   └── Primer distrito pitométrico inteligente
│
└── Jefatura Garzón
    ├── Zona rural norte
    └── 157 medidores telemedidos
```

---

## 📊 Beneficios de la Estructura

### Gestión Local Eficiente:
- ✅ Personal conoce el territorio
- ✅ Respuesta rápida ante incidentes
- ✅ Relación directa con usuarios
- ✅ Conocimiento de particularidades locales

### Coordinación con División:
- ✅ Reportan a la UGD
- ✅ Comparten recursos cuando necesario
- ✅ Estandarización de procesos
- ✅ Escalamiento de problemas complejos

### Métricas Granulares:
- ✅ Comparación entre jefaturas
- ✅ Identificación de mejores prácticas
- ✅ Focalización de inversiones
- ✅ Seguimiento de mejoras locales

---

## 🔧 Implementación Técnica

Para desarrolladores que consuman este modelo:

```typescript
import { IJefatura } from 'ose-modelos';

// Crear Jefatura Pueblo Edén
const jefaturaEden: IJefatura = {
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",

  nombre: "Jefatura Pueblo Edén",
  codigo: "JEF-EDEN",
  descripcion: "Centro operativo Pueblo Edén",

  configuracion: {
    direccion: "Ruta 12 km 5, Pueblo Edén",
    telefono: "+598 42 XXX-XXX",
    email: "jefatura.eden@ose.com.uy",

    localidadesCubiertas: [
      "Pueblo Edén (urbano)",
      "Zona rural Edén",
      "Paraje Los Talas"
    ],

    personal: {
      cantidadOperadores: 8,
      cantidadTecnicos: 4,
      jefe: "Técnico Juan Rodríguez"
    }
  },

  activo: true
};
```

**Queries típicas:**

```typescript
// Listar jefaturas de UGD Maldonado
const jefaturas = await db.jefaturas.find({
  idCliente: "ose-uruguay",
  idDivision: "ugd-maldonado",
  activo: true
});

// Buscar jefatura de un usuario
const jefatura = await db.jefaturas.findById(usuario.idJefatura);

// Contar puntos de medición por jefatura
const puntosPorJefatura = await db.puntosMedicion.aggregate([
  {
    $match: { idCliente: "ose-uruguay", idDivision: "ugd-maldonado" }
  },
  {
    $group: {
      _id: "$idJefatura",
      cantidad: { $sum: 1 }
    }
  }
]);
```

**Ver:** `jefatura.ts` para definición técnica completa
