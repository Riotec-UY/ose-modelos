# Coordenadas

**Entidad:** `ICoordenadas`
**Contexto:** Auxiliares
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa un **punto geográfico** definido por latitud y longitud. Es la forma más simple de representar una ubicación en el espacio.

---

## 📋 Información que contiene

| Campo | Qué representa | Rango/Ejemplo |
|-------|----------------|---------------|
| `latitud` | Distancia al ecuador | -90° a 90° (ej: -34.6500) |
| `longitud` | Distancia al meridiano de Greenwich | -180° a 180° (ej: -54.7200) |
| `altitud` | Altura sobre nivel del mar (opcional) | Metros (ej: 45) |

---

## 💡 Ejemplo: Perforación Edén

```yaml
Coordenadas:
  latitud: -34.6500   # 34.65° Sur
  longitud: -54.7200  # 54.72° Oeste
  altitud: 45         # 45 metros sobre nivel del mar
```

**Visualización:**
```
Latitud negativa = Sur del ecuador (Uruguay está en hemisferio sur)
Longitud negativa = Oeste de Greenwich (Uruguay está en hemisferio oeste)
```

---

## ⚙️ Sistema de Coordenadas

**Por defecto:** WGS84 (World Geodetic System 1984)
- Estándar usado por GPS
- Compatible con Google Maps, OpenStreetMap, GIS

---

## 🔗 Se relaciona con

- **Ubicación Geográfica** (`IUbicacionGeografica`): Usa coordenadas como parte de información más completa
- **Punto de Medición:** Para ubicar puntos en mapas
- **Distrito Pitométrico:** Para definir perímetros geográficos

---

## 💡 Casos de Uso

**Visualización en Mapas:**
Plotear puntos de medición en mapas GIS

**Cálculo de Distancias:**
Calcular ruta entre dos puntos de inspección

**Análisis Espacial:**
Identificar puntos cercanos a una fuga

---

**Ver:** `coordenadas.ts` para definición técnica completa
