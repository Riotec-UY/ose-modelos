# OSE Modelos - Guía para Claude

Este paquete contiene **SOLO interfaces TypeScript** para el sistema OSE Aguas. No hay código ejecutable.

## 🎯 Principios de Diseño

### 1. Solo Interfaces y Types
```typescript
// ✅ CORRECTO
export interface ICliente {
  nombre: string;
}

export type TipoCliente = 'público' | 'privado';

// ❌ INCORRECTO - No código ejecutable
export class Cliente {
  constructor() {}
}

export function validarCliente() {}
```

### 2. No Enums Tradicionales (usar types)
```typescript
// ✅ CORRECTO - Union types
export type TipoPuntoMedicion = 'residencial' | 'booster' | 'perforación';

// Array de constantes para iterar
export const TIPOS_PUNTO_MEDICION: TipoPuntoMedicion[] = [
  'residencial',
  'booster',
  'perforación'
];

// ❌ INCORRECTO - Enum tradicional
export enum TipoPuntoMedicion {
  Residencial = 'residencial',
  Booster = 'booster'
}
```

### 3. Metadatos Flexibles con Record<string, any>
```typescript
// ✅ CORRECTO
export interface IPuntoMedicion {
  metadatosTecnicos?: Record<string, any>; // Flexible, varía por tipo
}

// Uso:
const punto: IPuntoMedicion = {
  tipo: 'booster',
  metadatosTecnicos: {
    capacidadBombeo: 100,
    potencia: 50
  }
};
```

### 4. Discriminated Unions para Lecturas
```typescript
// ✅ CORRECTO - Type-safe por discriminante
export interface ILecturaBase<T extends TipoLectura> {
  tipoLectura: T;                    // Discriminante
  valores: MapaValoresLectura[T];   // Type-safe según tipo
}

export type ILectura =
  | ILecturaBase<"Macromedidor Caudal">
  | ILecturaBase<"Medidor Residencial Consumo">;

// TypeScript infiere automáticamente:
function procesarLectura(lectura: ILectura) {
  if (lectura.tipoLectura === "Macromedidor Caudal") {
    // TypeScript sabe que valores es IValoresMacromedidorCaudal
    console.log(lectura.valores.caudal);
  }
}
```

## 📁 Estructura

```
src/
├── interfaces/
│   ├── auxiliares/        # Tipos auxiliares (coordenadas, queries, responses)
│   ├── organizacion/      # Cliente, División, Jefatura, Distrito
│   ├── infraestructura/   # PuntoMedicion, UbicacionGeografica
│   ├── datos/             # Lectura, FuenteDatos, ReferenciaExterna
│   └── analisis/          # BalanceHidrico, Anomalia, SerieTemporal
└── index.ts               # Export central
```

## 🔄 Flujo de Trabajo

### Al agregar una nueva entidad:

1. **Crear interfaz en carpeta correcta**
   ```typescript
   // src/interfaces/organizacion/nueva-entidad.ts
   export interface INuevaEntidad {
     _id?: string;
     idCliente: string;
     nombre: string;
     // ...
   }
   ```

2. **Crear DTOs (Create/Update)**
   ```typescript
   export interface ICreateNuevaEntidad extends Omit<
     Partial<INuevaEntidad>,
     '_id' | 'virtuals'
   > {
     idCliente: string; // Requeridos explícitos
     nombre: string;
   }
   ```

3. **Exportar en index.ts de carpeta**
   ```typescript
   // src/interfaces/organizacion/index.ts
   export * from './nueva-entidad';
   ```

4. **Ya está disponible globalmente**
   - El index.ts principal ya exporta todo vía `export * from './interfaces/organizacion'`

### Al agregar un nuevo tipo de lectura:

1. **Agregar al type TipoLectura**
   ```typescript
   export type TipoLectura =
     | "Macromedidor Caudal"
     | "Tu Nuevo Tipo";  // Agregar aquí
   ```

2. **Agregar al array TIPOS_LECTURA**
   ```typescript
   export const TIPOS_LECTURA: TipoLectura[] = [
     "Macromedidor Caudal",
     "Tu Nuevo Tipo",  // Agregar aquí
   ];
   ```

3. **Crear interfaz de valores**
   ```typescript
   export interface IValoresTuNuevoTipo {
     timestamp: string;
     // campos específicos
   }
   ```

4. **Agregar al mapa**
   ```typescript
   export type MapaValoresLectura = {
     "Tu Nuevo Tipo": IValoresTuNuevoTipo;  // Agregar aquí
   };
   ```

5. **Agregar al union type**
   ```typescript
   export type ILectura =
     | ILecturaBase<"Macromedidor Caudal">
     | ILecturaBase<"Tu Nuevo Tipo">;  // Agregar aquí
   ```

## 🚫 Restricciones Importantes

### No se puede hacer:
- ❌ Usar `class`
- ❌ Usar `enum` tradicional
- ❌ Crear funciones
- ❌ Usar `const` para valores complejos (solo para arrays de types)
- ❌ Importar librerías externas (excepto types de otras librerías)

### Sí se puede hacer:
- ✅ `interface`
- ✅ `type` (union types, mapped types, etc.)
- ✅ `const` para arrays de union types
- ✅ `Record<string, any>` para flexibilidad
- ✅ Generics (`<T extends X>`)
- ✅ Utility types (`Omit`, `Partial`, `Pick`, etc.)

## 📚 Documentación de Referencia

- **Modelo Conceptual:** `/doc-ose-aguas/MODELO-CONCEPTUAL.md` v3.3
- **Lineamientos Arquitectura:** `/LINEAMIENTOS-ARQUITECTURA.md` v2.5
- **Validación Modelo:** `/doc-ose-aguas/VALIDACION-MODELO.md`

## 🔧 Uso en Otros Repos

```typescript
// api-datos, api-integracion, frontend-angular
import {
  IPuntoMedicion,
  ILectura,
  TipoPuntoMedicion,
  TIPOS_PUNTO_MEDICION
} from 'ose-modelos';

// Type-safe desde el modelo hasta el frontend
const punto: IPuntoMedicion = {
  idCliente: 'ose-uruguay',
  tipo: 'residencial',
  nombre: 'Medidor Juan Pérez',
  // TypeScript valida todo
};
```

## ⚠️ IMPORTANTE para Claude

Cuando modifiques este paquete:
1. **NUNCA agregues código ejecutable**
2. **SIEMPRE usa types en lugar de enums**
3. **MANTÉN la consistencia** con los patrones existentes
4. **DOCUMENTA** con comentarios JSDoc para IntelliSense
5. **VALIDA** que todo siga siendo importable como tipos puros

Este paquete es la **fuente de verdad** del modelo de datos. Cualquier cambio aquí impacta todos los servicios y el frontend.
