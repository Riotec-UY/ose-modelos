# GeoJSON - Geometrías Geográficas Estándar

**Tipos:** `IGeoJSON`, `IGeoJSONPoint`, `IGeoJSONPolygon`, `IGeoJSONCircle`, `IGeoJSONLineString`, `IGeoJSONMultiPolygon`
**Contexto:** Auxiliares / Ubicación
**Versión:** 1.0.0
**Estándar:** RFC 7946 (GeoJSON)

---

## 🎯 ¿Qué es?

**GeoJSON** es el formato estándar internacional para representar geometrías geográficas (puntos, líneas, polígonos, etc.).

Adoptamos este estándar (usado por IRIX en producción) para:
- ✅ **Compatibilidad MongoDB**: Queries espaciales nativos ($geoNear, $geoWithin)
- ✅ **Estándar de industria**: RFC 7946, usado globalmente
- ✅ **Interoperabilidad**: Compatible con Google Maps, OpenStreetMap, Mapbox, etc.
- ✅ **Type-safe**: Discriminated unions en TypeScript

---

## ⚠️ IMPORTANTE: Orden de Coordenadas

GeoJSON usa **[longitud, latitud]** (NO [latitud, longitud]):

```typescript
// ❌ INCORRECTO (orden natural, pero no GeoJSON)
[-34.9167, -54.9333]  // [lat, lng]

// ✅ CORRECTO (orden GeoJSON estándar)
[-54.9333, -34.9167]  // [lng, lat]
     ^^^^      ^^^^
     oeste     sur
```

**Regla mnemotécnica**: Longitud primero = "X antes que Y" (como en matemáticas)

---

## 📋 Tipos de Geometría

### 1. Point - Punto único

**Uso:** Ubicación puntual (medidor, booster, perforación)

```typescript
const puntoMedicion: IGeoJSONPoint = {
  type: "Point",
  coordinates: [-54.9333, -34.9167]  // Maldonado, Uruguay
  //            ^^^^^^^^  ^^^^^^^^
  //            lng       lat
};

// Con altitud (opcional)
const puntoConAltitud: IGeoJSONPoint = {
  type: "Point",
  coordinates: [-54.9333, -34.9167, 120]  // 120m sobre nivel del mar
};
```

---

### 2. Polygon - Polígono cerrado

**Uso:** Distritos pitométricos, jefaturas, áreas de servicio

```typescript
const distritoPitometrico: IGeoJSONPolygon = {
  type: "Polygon",
  coordinates: [
    [  // Anillo exterior (borde del distrito)
      [-54.9300, -34.9100],  // Punto 1
      [-54.9400, -34.9100],  // Punto 2
      [-54.9400, -34.9200],  // Punto 3
      [-54.9300, -34.9200],  // Punto 4
      [-54.9300, -34.9100]   // Cierre (igual a punto 1) ← IMPORTANTE
    ]
    // Opcional: anillos interiores (huecos/islas)
  ]
};
```

**Reglas del polígono:**
- ✅ Primer y último punto DEBEN ser idénticos (cerrar el polígono)
- ✅ Anillo exterior: antihorario (counterclockwise)
- ✅ Anillos interiores (huecos): horarios (clockwise)
- ✅ Mínimo 4 puntos (triángulo + cierre)

---

### 3. Circle - Círculo (extensión MongoDB)

**Uso:** Área de cobertura de booster, zona de alerta

```typescript
const coberturaBuoster: IGeoJSONCircle = {
  type: "Point",
  coordinates: [-54.9333, -34.9167],
  radius: 500  // 500 metros de radio
};
```

**Nota:** No es estándar GeoJSON RFC 7946, pero sí soportado por MongoDB.

---

### 4. LineString - Línea/Tramo

**Uso:** Red de cañerías, tubería entre puntos

```typescript
const tramoCañeria: IGeoJSONLineString = {
  type: "LineString",
  coordinates: [
    [-54.9300, -34.9100],  // Inicio
    [-54.9350, -34.9150],  // Punto intermedio
    [-54.9400, -34.9200]   // Final
  ]
};
```

**Mínimo:** 2 puntos

---

### 5. MultiPolygon - Múltiples polígonos

**Uso:** División con zonas no contiguas, cliente multi-zona

```typescript
const divisionMultizona: IGeoJSONMultiPolygon = {
  type: "MultiPolygon",
  coordinates: [
    [  // Polígono 1 (Zona A)
      [
        [-54.9300, -34.9100],
        [-54.9400, -34.9100],
        [-54.9400, -34.9200],
        [-54.9300, -34.9100]
      ]
    ],
    [  // Polígono 2 (Zona B)
      [
        [-54.9500, -34.9300],
        [-54.9600, -34.9300],
        [-54.9600, -34.9400],
        [-54.9500, -34.9300]
      ]
    ]
  ]
};
```

---

## 💡 Ejemplo Completo: Distrito Pitométrico Edén

```typescript
import { IDistrito, IGeoJSONPolygon } from 'ose-modelos';

const fronteraDistritoEden: IGeoJSONPolygon = {
  type: "Polygon",
  coordinates: [
    [
      [-55.0217, -34.6653],  // Esquina noreste
      [-55.0238, -34.6653],  // Esquina noroeste
      [-55.0238, -34.6673],  // Esquina suroeste
      [-55.0217, -34.6673],  // Esquina sureste
      [-55.0217, -34.6653]   // Cierre
    ]
  ]
};

const distritoEden: IDistrito = {
  idJefatura: "jef-eden",
  nombre: "Distrito Pitométrico Pueblo Edén",
  codigo: "DPE-001",
  frontera: fronteraDistritoEden,  // ✅ GeoJSON tipado
  poblacion: 1200,
  conexiones: 450,
  redKm: 8.5
};
```

**MongoDB Query Espacial:**
```typescript
// Encontrar todos los puntos dentro del distrito
db.puntosMedicion.find({
  "ubicacion.geojson": {
    $geoWithin: {
      $geometry: distritoEden.frontera  // ← GeoJSON directo
    }
  }
});
```

---

## 🔄 Conversión lat/lng ↔ GeoJSON

### ICoordenadas → IGeoJSONPoint

```typescript
import { ICoordenadas, IGeoJSONPoint } from 'ose-modelos';

const coords: ICoordenadas = {
  latitud: -34.9167,
  longitud: -54.9333
};

// Conversión manual (invertir orden)
const punto: IGeoJSONPoint = {
  type: "Point",
  coordinates: [coords.longitud, coords.latitud]  // ⚠️ lng primero!
  //            ^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^
  //            [0] = lng         [1] = lat
};
```

### IGeoJSONPoint → ICoordenadas

```typescript
import { IGeoJSONPoint, ICoordenadas } from 'ose-modelos';

const punto: IGeoJSONPoint = {
  type: "Point",
  coordinates: [-54.9333, -34.9167]
};

// Extracción manual (invertir orden)
const coords: ICoordenadas = {
  longitud: punto.coordinates[0],  // [lng, lat]
  latitud: punto.coordinates[1]
};
```

---

## 🗺️ Índices MongoDB

Para habilitar queries espaciales eficientes:

```javascript
// Crear índice geoespacial
db.puntosMedicion.createIndex({ "ubicacion.geojson": "2dsphere" });

// Queries soportados:
// - $geoNear: Encontrar puntos cercanos
// - $geoWithin: Encontrar puntos dentro de un área
// - $geoIntersects: Encontrar geometrías que se intersectan
```

---

## 🔗 Se relaciona con

- **IUbicacionGeografica**: Usa IGeoJSON como geometría principal
- **IDistrito**: Frontera definida como IGeoJSONPolygon o IGeoJSONCircle
- **IPuntoMedicion**: Ubicación definida con IGeoJSONPoint
- **ICoordenadas**: Helper para lectura simple (compatibilidad)

---

## 📚 Referencias

- **RFC 7946**: https://tools.ietf.org/html/rfc7946
- **MongoDB GeoJSON**: https://www.mongodb.com/docs/manual/reference/geojson/
- **GeoJSON.org**: https://geojson.org/

---

**Ver:** `geojson.ts` para definiciones técnicas completas
