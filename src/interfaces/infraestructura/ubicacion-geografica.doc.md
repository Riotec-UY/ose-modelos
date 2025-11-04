# Ubicación Geográfica

**Entidad:** `IUbicacionGeografica`
**Contexto:** Infraestructura
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa la **posición geográfica** de un punto de medición, distrito o cualquier elemento de infraestructura. Incluye coordenadas, dirección postal y referencias espaciales.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `coordenadas` | Latitud y longitud (WGS84) | {lat: -34.6500, lng: -54.7200} |
| `direccionPostal` | Dirección física | "Ruta 12 km 5, Pueblo Edén" |
| `ciudad` | Ciudad/localidad | "Pueblo Edén" |
| `departamento` | Departamento | "Maldonado" |
| `barrio` | Barrio/zona (opcional) | "Zona Rural Norte" |
| `codigoPostal` | Código postal (opcional) | "20000" |
| `wkt` | Geometría en formato WKT (opcional) | "POINT(-54.7200 -34.6500)" |
| `geojson` | Geometría en formato GeoJSON (opcional) | {...} |

---

## 💡 Ejemplo 1: Perforación Edén

```yaml
Ubicación Geográfica:
  Coordenadas:
    latitud: -34.6500
    longitud: -54.7200
    altitud: 45 metros sobre nivel del mar

  Dirección Postal: "Ruta 12 km 5"
  Ciudad: "Pueblo Edén"
  Departamento: "Maldonado"
  País: "Uruguay"

  Referencias Adicionales: "500m al norte de la plaza principal"
```

---

## 💡 Ejemplo 2: Medidor Residencial

```yaml
Ubicación Geográfica:
  Coordenadas:
    latitud: -34.6456
    longitud: -54.7123

  Dirección Postal: "Calle Principal 123"
  Ciudad: "Pueblo Edén"
  Departamento: "Maldonado"
  Barrio: "Centro"
  Código Postal: "20000"
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
