# Scripts Opcionales para Documentación

Este directorio contiene scripts opcionales para generar documentación consolidada en diferentes formatos.

## 📄 generate-pdf.js

Genera documentación consolidada en Markdown y PDF a partir de todos los archivos `.doc.md` del repositorio.

### Instalación de Dependencias

Estas dependencias son **opcionales** y solo se necesitan si quieres generar PDFs:

```bash
npm install --save-dev glob markdown-pdf
```

### Uso

```bash
node scripts/generate-pdf.js
```

### Salida

Los archivos se generan en `/doc/generated/`:

- `modelo-ose-completo.md` - Markdown consolidado con todas las entidades documentadas
- `modelo-ose-completo.pdf` - PDF para compartir con stakeholders no técnicos

### Estructura del Documento Generado

El documento consolidado incluye:

1. **Portada** con versión y fecha de generación
2. **Tabla de contenidos** agrupada por contexto (Organización, Infraestructura, Datos, Análisis)
3. **Documentación completa** de cada entidad
4. **Pie de página** con información de generación

### Casos de Uso

- **Presentaciones a OSE**: PDF profesional con toda la documentación
- **Onboarding de equipo**: Documento único para entender el modelo completo
- **Documentación de contratos**: Anexo técnico para acuerdos
- **Archivo histórico**: Snapshot de la documentación en un momento dado

## 🔮 Scripts Futuros

Otros scripts que podrían agregarse:

- `generate-diagrams.js` - Generar diagramas ER automáticamente
- `validate-docs.js` - Validar que todo `.ts` tenga su `.doc.md`
- `generate-html.js` - Generar sitio web estático de documentación
- `generate-excel.js` - Diccionario de datos en Excel para stakeholders

## 📝 Notas

- Los archivos `.doc.md` son legibles directamente en GitHub/VSCode sin necesidad de estos scripts
- Estos scripts son **opcionales** y solo se usan cuando se necesita generar formatos específicos (PDF, etc.)
- La documentación principal siempre son los archivos `.doc.md` co-ubicados con el código
