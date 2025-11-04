# Ubicación Geográfica

**Entidad:** `IUbicacionGeografica`
**Contexto:** Infraestructura
**Versión:** 2.0.0 (GeoJSON-first)

---

## 🎯 ¿Qué es?

Representa la **posición geográfica** de un punto de medición, distrito o cualquier elemento de infraestructura.

**Modelo híbrido GeoJSON + metadatos**:
- **GeoJSON**: Geometría estándar (Point, Polygon, etc.) - **PRINCIPAL** ⭐
- **Metadatos**: Dirección postal, ciudad, referencias humanas

**¿Por qué GeoJSON?**
- ✅ Queries espaciales en MongoDB ($geoNear, $geoWithin)
- ✅ Estándar de industria (RFC 7946)
- ✅ Compatible con mapas (Google Maps, OpenStreetMap)
- ✅ Soporta puntos, polígonos, líneas, círculos

**Ver:** [`geojson.doc.md`](../auxiliares/geojson.doc.md) para detalles del formato

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `geojson` ⭐ | **Geometría GeoJSON (PRINCIPAL)** | `{ type: "Point", coordinates: [-54.7200, -34.6500] }` |
| `coordenadas` | Coordenadas simples (opcional) | `{ latitud: -34.6500, longitud: -54.7200 }` |
| `direccionPostal` | Dirección física | "Ruta 12 km 5, Pueblo Edén" |
| `ciudad` | Ciudad/localidad | "Pueblo Edén" |
| `departamento` | Departamento | "Maldonado" |
| `barrio` | Barrio/zona (opcional) | "Zona Rural Norte" |
| `codigoPostal` | Código postal (opcional) | "20000" |
| `referenciasAdicionales` | Referencias en terreno | "Frente a la plaza principal, portón verde" |
| `wkt` | WKT legacy (opcional) | "POINT(-54.7200 -34.6500)" |

---

## 💡 Ejemplo 1: Perforación Edén (GeoJSON)

```typescript
const ubicacionPerforacion: IUbicacionGeografica = {
  // ⭐ Geometría GeoJSON (PRINCIPAL)
  geojson: {
    type: "Point",
    coordinates: [-54.7200, -34.6500, 45]  // [lng, lat, altitud]
  },

  // Metadatos de dirección
  direccionPostal: "Ruta 12 km 5",
  ciudad: "Pueblo Edén",
  departamento: "Maldonado",
  referenciasAdicionales: "500m al norte de la plaza principal"
};
```

**MongoDB Query - Encontrar puntos cercanos:**
```typescript
db.puntosMedicion.find({
  "ubicacion.geojson": {
    $near: {
      $geometry: ubicacionPerforacion.geojson,
      $maxDistance: 1000  // 1km de radio
    }
  }
});
```

---

## 💡 Ejemplo 2: Medidor Residencial

```typescript
const ubicacionMedidor: IUbicacionGeografica = {
  // ⭐ GeoJSON Point
  geojson: {
    type: "Point",
    coordinates: [-54.7123, -34.6456]
  },

  // Dirección completa
  direccionPostal: "Calle Principal 123",
  ciudad: "Pueblo Edén",
  departamento: "Maldonado",
  barrio: "Centro",
  codigoPostal: "20000"
};
```

---

## 💡 Ejemplo 3: Distrito Pitométrico (Polígono)

```typescript
const ubicacionDistrito: IUbicacionGeografica = {
  // ⭐ GeoJSON Polygon (área cerrada)
  geojson: {
    type: "Polygon",
    coordinates: [
      [  // Anillo exterior
        [-54.7200, -34.6500],  // Punto 1
        [-54.7150, -34.6500],  // Punto 2
        [-54.7150, -34.6550],  // Punto 3
        [-54.7200, -34.6550],  // Punto 4
        [-54.7200, -34.6500]   // Cierre (igual a punto 1)
      ]
    ]
  },

  ciudad: "Pueblo Edén",
  departamento: "Maldonado",
  referenciasAdicionales: "Distrito Pitométrico Centro"
};
```

**MongoDB Query - Puntos dentro del distrito:**
```typescript
db.puntosMedicion.find({
  "ubicacion.geojson": {
    $geoWithin: {
      $geometry: ubicacionDistrito.geojson
    }
  }
});
```

---

## 🔗 Se relaciona con

- **Punto de Medición:** Ubicación del punto físico
- **Distrito Pitométrico:** Frontera geográfica del distrito
- **Jefatura:** Ubicación de los centros operativos

---

## 💡 Uso en Mapas

Las ubicaciones se visualizan en mapas GIS:

**Dashboard con Mapa:**
```
[Mapa de Maldonado]

Pueblo Edén:
  ⛲ Perforación Edén (-34.6500, -54.7200)
      Estado: ✅ Operativo
      Caudal: 42 m³/h

  🏠 95 medidores residenciales
      Estado: Mayoría ✅ OK
      Algunos ⚠️ Sin comunicación

  📊 Distrito Pitométrico Edén
      Perímetro mostrado en mapa
      Eficiencia: 67%
```

---

## ⚙️ Sistema de Coordenadas

**Por defecto:** WGS84 (World Geodetic System 1984)
- Usado por GPS
- Compatible con Google Maps, OpenStreetMap, etc.

---

## 💡 Casos de Uso

**Mapas Operativos:**
Visualizar puntos de medición en mapa interactivo

**Rutas de Inspección:**
Calcular ruta óptima para inspeccionar puntos

**Análisis Espacial:**
Identificar clusters de fugas en una zona

**Planificación:**
Diseñar expansión de distritos pitométricos

---

**Ver:** `ubicacion-geografica.ts` para definición técnica completa
