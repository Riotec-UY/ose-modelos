#!/usr/bin/env node

/**
 * Script opcional para generar documentación consolidada en PDF
 *
 * USO:
 * 1. Instalar dependencias: npm install --save-dev glob markdown-pdf
 * 2. Ejecutar: node scripts/generate-pdf.js
 *
 * SALIDA:
 * - doc/generated/modelo-ose-completo.md (Markdown consolidado)
 * - doc/generated/modelo-ose-completo.pdf (PDF generado)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const markdownpdf = require('markdown-pdf');

// Configuración
const OUTPUT_DIR = path.join(__dirname, '../doc/generated');
const OUTPUT_MD = path.join(OUTPUT_DIR, 'modelo-ose-completo.md');
const OUTPUT_PDF = path.join(OUTPUT_DIR, 'modelo-ose-completo.pdf');

// Asegurar que existe el directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔍 Buscando archivos .doc.md...');

// Encontrar todos los archivos .doc.md
const docFiles = glob.sync('src/interfaces/**/*.doc.md');

console.log(`✅ Encontrados ${docFiles.length} archivos de documentación`);

// Agrupar por contexto
const byContext = {
  auxiliares: [],
  organizacion: [],
  infraestructura: [],
  datos: [],
  analisis: []
};

docFiles.forEach(file => {
  const parts = file.split(path.sep);
  const context = parts[2]; // src/interfaces/[CONTEXT]/...

  if (byContext[context]) {
    const content = fs.readFileSync(file, 'utf8');
    const name = path.basename(file, '.doc.md');

    byContext[context].push({
      file,
      name,
      content
    });
  }
});

// Generar Markdown consolidado
console.log('📝 Generando Markdown consolidado...');

let consolidado = `# Modelo de Datos OSE Aguas - Documentación Completa

**Proyecto:** Distrito Pitométrico Inteligente OSE Maldonado
**Versión del modelo:** 1.1.0
**Fecha de generación:** ${new Date().toISOString().split('T')[0]}

---

## Tabla de Contenidos

`;

// Generar TOC
const contextNames = {
  auxiliares: 'Tipos Auxiliares',
  organizacion: 'Organización',
  infraestructura: 'Infraestructura Física',
  datos: 'Datos e Integración',
  analisis: 'Análisis y Reporting'
};

Object.keys(byContext).forEach(context => {
  if (byContext[context].length > 0) {
    consolidado += `\n### ${contextNames[context]}\n`;
    byContext[context].forEach(doc => {
      const title = doc.content.split('\n')[0].replace('#', '').trim();
      consolidado += `- ${title}\n`;
    });
  }
});

consolidado += '\n---\n\n';

// Agregar contenido completo
Object.keys(byContext).forEach(context => {
  if (byContext[context].length === 0) return;

  consolidado += `\n\n# ${contextNames[context].toUpperCase()}\n\n`;
  consolidado += `---\n\n`;

  byContext[context].forEach(doc => {
    consolidado += doc.content + '\n\n';
    consolidado += '---\n\n';
  });
});

// Agregar pie de página
consolidado += `\n\n---\n\n`;
consolidado += `**Documento generado automáticamente**\n`;
consolidado += `**Fecha:** ${new Date().toLocaleString('es-UY')}\n`;
consolidado += `**Fuente:** https://github.com/Riotec-UY/ose-modelos\n`;

// Escribir Markdown consolidado
fs.writeFileSync(OUTPUT_MD, consolidado, 'utf8');
console.log(`✅ Markdown consolidado generado: ${OUTPUT_MD}`);

// Generar PDF
console.log('📄 Generando PDF...');

markdownpdf()
  .from(OUTPUT_MD)
  .to(OUTPUT_PDF, () => {
    console.log(`✅ PDF generado: ${OUTPUT_PDF}`);
    console.log('');
    console.log('📦 Archivos generados:');
    console.log(`   - ${OUTPUT_MD}`);
    console.log(`   - ${OUTPUT_PDF}`);
    console.log('');
    console.log('✨ Listo! Puedes compartir estos documentos con stakeholders.');
  });
