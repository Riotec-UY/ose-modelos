#!/usr/bin/env node

/**
 * Script mejorado para generar archivos .proto desde interfaces TypeScript
 * Usa ts-morph para parsing correcto de TypeScript AST
 *
 * Mejoras respecto a v1:
 * - Parser robusto con ts-morph
 * - Detecta ICreate/IUpdate antes de generar servicios
 * - Maneja Omit, Partial, extends correctamente
 * - Mejor manejo de tipos complejos
 */

const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

// Configuración
const MODELS_PATH = path.join(process.cwd(), 'node_modules', 'ose-modelos', 'src', 'interfaces');
const OUTPUT_PATH = path.join(process.cwd(), 'proto');
const CONFIG_PATH = path.join(__dirname, 'proto-config.json');

console.log('🔧 Generando archivos protobuf v2 (con ts-morph)...\n');

// Cargar configuración de casos especiales
let protoConfig = {};
if (fs.existsSync(CONFIG_PATH)) {
  try {
    protoConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('✅ Configuración proto cargada:', CONFIG_PATH, '\n');
  } catch (error) {
    console.warn('⚠️  Error leyendo proto-config.json:', error.message);
    console.warn('   Continuando sin configuración especial...\n');
  }
} else {
  console.log('ℹ️  No se encontró proto-config.json - usando generación estándar\n');
}

// Verificar que existe el paquete de modelos
if (!fs.existsSync(MODELS_PATH)) {
  console.error('❌ No se encontró el paquete ose-modelos.');
  console.error('   Ejecuta primero: npm run models:install\n');
  process.exit(1);
}

// Mapeo de tipos TypeScript a Protobuf
const TYPE_MAP = {
  'string': 'string',
  'number': 'double',
  'boolean': 'bool',
  'Date': 'google.protobuf.Timestamp',
  'any': 'google.protobuf.Any',
  'Object': 'google.protobuf.Struct',
  'Record': 'google.protobuf.Struct',
};

/**
 * Obtiene configuración para una entidad específica
 */
function getEntityConfig(category, entityName) {
  if (!protoConfig[category]) return null;

  // Buscar la configuración por el nombre de la entidad
  // Convertir PuntoMedicion → punto-medicion (kebab-case)
  const entityBaseName = entityName
    .replace(/^I/, '')
    .replace(/([A-Z])/g, (match, letter, offset) =>
      offset > 0 ? '-' + letter.toLowerCase() : letter.toLowerCase()
    );
  return protoConfig[category][entityBaseName] || null;
}

/**
 * Aplica transformación de campo según configuración
 */
function applyFieldTransform(category, fieldName, fieldType) {
  const categoryConfig = protoConfig[category];
  if (!categoryConfig) return { type: fieldType, comment: null };

  // Buscar en todas las entidades de la categoría
  for (const entityKey in categoryConfig) {
    const entityConfig = categoryConfig[entityKey];
    if (!entityConfig.fieldTransforms) continue;

    const transform = entityConfig.fieldTransforms[fieldName];


    if (transform && fieldType === transform.from) {
      console.log(`   🔄 Transformando campo: ${fieldName}: ${transform.from} → ${transform.to}`);
      return {
        type: transform.to,
        comment: transform.comment || null
      };
    }
  }

  return { type: fieldType, comment: null };
}

/**
 * Aplica overrides a un mensaje específico
 */
function applyMessageOverrides(category, messageName, fields) {
  const categoryConfig = protoConfig[category];
  if (!categoryConfig) return fields;

  // Buscar configuración de la entidad
  for (const entityKey in categoryConfig) {
    const entityConfig = categoryConfig[entityKey];
    if (!entityConfig.messageOverrides) continue;

    const messageOverride = entityConfig.messageOverrides[messageName];
    if (!messageOverride) continue;

    console.log(`   ⚙️  Aplicando overrides a mensaje: ${messageName}`);

    // Aplicar allFieldsOptional si está configurado
    if (messageOverride.allFieldsOptional) {
      fields = fields.map(f => ({ ...f, optional: true }));
    }

    // Aplicar fieldOverrides específicos
    if (messageOverride.fieldOverrides) {
      fields = fields.map(field => {
        const override = messageOverride.fieldOverrides[field.name];
        if (!override) return field;

        const updated = { ...field };

        // Renombrar campo
        if (override.rename) {
          console.log(`      - Renombrando: ${field.name} → ${override.rename}`);
          updated.name = override.rename;
          updated.comment = override.comment || field.comment;
        }

        // Cambiar opcionalidad
        if (override.optional !== undefined) {
          updated.optional = override.optional;
        }

        return updated;
      });
    }

    return fields;
  }

  return fields;
}

/**
 * Normaliza un tipo removiendo rutas de import
 * Ejemplo: import("...").IPermisoUsuario[] → IPermisoUsuario[]
 */
function normalizeTypeName(typeText) {
  // Remover import paths: import("...").Type → Type
  const withoutImport = typeText.replace(/import\([^)]+\)\./g, '');
  return withoutImport.trim();
}

/**
 * Convierte tipo TypeScript a tipo Protobuf
 */
function convertTypeToProto(typeText, category = null, fieldName = null) {
  // Normalizar el tipo primero (remover import paths)
  const normalizedType = normalizeTypeName(typeText);

  // Aplicar transformación de configuración si aplica
  if (category && fieldName) {
    const transform = applyFieldTransform(category, fieldName, normalizedType);
    if (transform.type !== normalizedType) {
      return transform.type;
    }
  }
  // Limpiar espacios y normalizar
  const cleanType = normalizedType.trim();

  // Manejar Record<string, any> o similar
  if (cleanType.startsWith('Record<')) {
    return 'google.protobuf.Struct';
  }

  // Detectar arrays anidados ANTES de procesarlos (proto3 no los soporta)
  // Convertir number[][][][] o similares a string (JSON serializado)
  const arrayDepth = (cleanType.match(/\[\]/g) || []).length;
  if (arrayDepth >= 2) {
    console.log(`   ℹ️  Convirtiendo array anidado ${cleanType} → string (JSON)`);
    return 'string';
  }

  // Manejar arrays simples
  if (cleanType.endsWith('[]')) {
    const baseType = cleanType.slice(0, -2);
    const protoBase = convertTypeToProto(baseType);
    return `repeated ${protoBase}`;
  }

  // Union types - tomar el primer tipo
  if (cleanType.includes('|')) {
    const firstType = cleanType.split('|')[0].trim();
    return convertTypeToProto(firstType);
  }

  // Tipos mapeados
  if (TYPE_MAP[cleanType]) {
    return TYPE_MAP[cleanType];
  }

  // Tipos que empiezan con I (interfaces del modelo)
  if (cleanType.startsWith('I')) {
    // Casos especiales: tipos geográficos complejos → google.protobuf.Struct
    if (cleanType.includes('GeoJSON') || cleanType.includes('Polygon') || cleanType.includes('Point')) {
      return 'google.protobuf.Struct';
    }
    return cleanType;
  }

  // Tipos personalizados (enums, etc.) - usar string por defecto
  return 'string';
}

/**
 * Sanitiza nombres de campos para proto3
 * - Remueve comillas
 * - Convierte puntos a guiones bajos
 * - Convierte a snake_case si es necesario
 */
function sanitizeFieldName(name) {
  return name
    .replace(/['"]/g, '')        // Remover comillas
    .replace(/\./g, '_')          // Convertir puntos a underscores
    .replace(/[^a-zA-Z0-9_]/g, '_'); // Remover caracteres inválidos
}

/**
 * Extrae interfaces de un archivo usando ts-morph
 */
function parseInterfacesWithTsMorph(sourceFile, category) {
  const interfaces = [];

  sourceFile.getInterfaces().forEach(interfaceDecl => {
    const name = interfaceDecl.getName();

    // Solo exportadas
    if (!interfaceDecl.isExported()) {
      return;
    }

    const fields = [];

    // Usar el type system para obtener TODAS las propiedades, incluyendo heredadas
    // Esto resuelve Omit<Partial<X>> correctamente
    const type = interfaceDecl.getType();
    const properties = type.getProperties();

    properties.forEach((symbol, index) => {
      const propName = symbol.getName();
      const sanitizedName = sanitizeFieldName(propName);

      // Obtener declaraciones del símbolo para determinar opcionalidad
      const declarations = symbol.getDeclarations();
      let isOptional = false; // Por defecto NO opcional
      let propType = 'string'; // Tipo por defecto

      if (declarations.length > 0) {
        const decl = declarations[0];

        // Verificar si tiene question token (?)
        if (decl.getKind() === SyntaxKind.PropertySignature) {
          isOptional = decl.hasQuestionToken();

          // Obtener el tipo desde la declaración
          const typeNode = decl.getType();
          if (typeNode) {
            propType = typeNode.getText();
          }
        }
      }

      // Regla especial: todos los campos en IUpdate* deben ser opcionales
      // Esto cubre el caso de Partial<> que no agrega question tokens
      if (name.startsWith('IUpdate')) {
        isOptional = true;
      }

      if (sanitizedName !== propName) {
        console.log(`   ℹ️  Sanitizando campo: ${propName} → ${sanitizedName}`);
      }

      // Aplicar transformación de tipo según configuración
      const transformedType = convertTypeToProto(propType, category, propName);

      fields.push({
        name: sanitizedName,
        type: propType,  // Tipo original de TypeScript
        protoType: transformedType,  // Tipo transformado para proto
        optional: isOptional,
        index: index + 1
      });
    });

    interfaces.push({
      name,
      fields,
      isCreate: name.startsWith('ICreate'),
      isUpdate: name.startsWith('IUpdate'),
    });
  });

  return interfaces;
}

/**
 * Genera mensaje proto desde interfaz
 */
function generateProtoMessage(interfaceDef, category) {
  // Aplicar overrides si existen
  let fields = applyMessageOverrides(category, interfaceDef.name, interfaceDef.fields);

  let proto = `message ${interfaceDef.name} {\n`;

  fields.forEach((field) => {
    // Si protoType ya existe, usarlo directamente (ya fue transformado)
    // Si no, convertir el tipo original
    const protoType = field.protoType || convertTypeToProto(field.type, category, field.name);
    const optional = field.optional && !protoType.startsWith('repeated') ? 'optional ' : '';

    // Agregar comentario si existe
    if (field.comment) {
      proto += `  // ${field.comment}\n`;
    }

    proto += `  ${optional}${protoType} ${field.name} = ${field.index};\n`;
  });

  proto += '}\n';
  return proto;
}

/**
 * Genera RPCs adicionales según configuración
 */
function generateAdditionalRPCs(category, entityName) {
  const entityConfig = getEntityConfig(category, entityName);
  if (!entityConfig || !entityConfig.additionalRPCs) return '';

  let rpcsProto = '';

  entityConfig.additionalRPCs.forEach(rpc => {
    rpcsProto += `  rpc ${rpc.name}(${rpc.request}) returns (${rpc.response});\n`;
  });

  return rpcsProto;
}

/**
 * Genera servicio CRUD solo si existen los DTOs
 * NO genera mensajes compartidos (se generan aparte)
 */
function generateCrudService(entityName, hasCreate, hasUpdate, category) {
  if (!hasCreate || !hasUpdate) {
    console.log(`   ⚠️  Saltando servicio para ${entityName} (falta ICreate o IUpdate)`);
    return '';
  }

  const serviceName = entityName.replace('I', '') + 'Service';
  const createDto = `ICreate${entityName.replace('I', '')}`;
  const entityBaseName = entityName.replace('I', '');

  // RPCs estándar
  let serviceProto = `
service ${serviceName} {
  rpc Create(${createDto}) returns (${entityName});
  rpc Find(QueryRequest) returns (${entityName}List);
  rpc FindById(IdRequest) returns (${entityName});
  rpc Update(Update${entityBaseName}Request) returns (${entityName});
  rpc Delete(IdRequest) returns (DeleteResponse);
`;

  // Agregar RPCs adicionales
  const additionalRPCs = generateAdditionalRPCs(category, entityName);
  if (additionalRPCs) {
    console.log(`   ➕ Agregando RPCs adicionales para ${entityName}`);
    serviceProto += additionalRPCs;
  }

  serviceProto += `}

message Update${entityBaseName}Request {
  string id = 1;
  IUpdate${entityBaseName} data = 2;
}

message ${entityName}List {
  repeated ${entityName} items = 1;
  int32 total = 2;
}
`;

  return serviceProto;
}

/**
 * Genera mensajes compartidos (una sola vez por archivo proto)
 */
function generateSharedMessages() {
  return `
message QueryRequest {
  optional string filter = 1;
  optional int32 limit = 2;
  optional int32 skip = 3;
}

message IdRequest {
  string id = 1;
}

message DeleteResponse {
  bool success = 1;
  string message = 2;
}
`;
}

/**
 * Genera mensajes custom según configuración
 */
function generateCustomMessages(category) {
  const categoryConfig = protoConfig[category];
  if (!categoryConfig) return '';

  let customProto = '';

  for (const entityKey in categoryConfig) {
    const entityConfig = categoryConfig[entityKey];
    if (!entityConfig.customMessages) continue;

    entityConfig.customMessages.forEach(message => {
      customProto += `\nmessage ${message.name} {\n`;

      message.fields.forEach(field => {
        let fieldDef = '';

        // Manejar repeated
        if (field.repeated) {
          fieldDef = `repeated ${field.type}`;
        } else {
          const optional = field.optional ? 'optional ' : '';
          fieldDef = `${optional}${field.type}`;
        }

        customProto += `  ${fieldDef} ${field.name} = ${field.number};\n`;
      });

      customProto += '}\n';
    });
  }

  return customProto;
}

/**
 * Genera archivo .proto para una categoría
 */
function generateProtoFile(category, interfaces) {
  const packageName = `ose.datos.${category}`;

  let protoContent = `syntax = "proto3";\n\n`;
  protoContent += `package ${packageName};\n\n`;
  protoContent += `import "google/protobuf/timestamp.proto";\n`;
  protoContent += `import "google/protobuf/struct.proto";\n`;
  protoContent += `import "google/protobuf/any.proto";\n\n`;

  // Generar mensajes
  interfaces.forEach(interfaceDef => {
    protoContent += generateProtoMessage(interfaceDef, category);  // Pasar category
    protoContent += '\n';
  });

  // Identificar TODAS las entidades (no solo la principal)
  const entities = interfaces.filter(i =>
    !i.name.includes('Create') &&
    !i.name.includes('Update') &&
    !i.name.includes('Query') &&
    !i.name.includes('Response') &&
    !i.name.includes('Request') &&
    !i.name.includes('List') &&
    !i.name.includes('Valores') && // Excluir tipos de valores de lecturas
    !i.name.includes('Permiso') && // Excluir sub-tipos de permisos
    !i.name.includes('Error') &&
    !i.name.includes('Success') &&
    !i.name.includes('GeoJSON') && // Excluir tipos GeoJSON auxiliares
    i.name.startsWith('I') // Solo interfaces del modelo
  );

  // Generar servicio para CADA entidad que tenga DTOs
  let hasAnyService = false;
  entities.forEach(entity => {
    const entityBaseName = entity.name.replace('I', '');
    const hasCreate = interfaces.some(i => i.name === `ICreate${entityBaseName}`);
    const hasUpdate = interfaces.some(i => i.name === `IUpdate${entityBaseName}`);

    const serviceContent = generateCrudService(entity.name, hasCreate, hasUpdate, category);  // Pasar category
    if (serviceContent) {
      protoContent += serviceContent;
      hasAnyService = true;
    }
  });

  // Agregar mensajes compartidos solo si hay al menos un servicio
  if (hasAnyService) {
    protoContent += generateSharedMessages();

    // Agregar mensajes custom si existen
    const customMessages = generateCustomMessages(category);
    if (customMessages) {
      console.log(`   📝 Agregando mensajes custom para ${category}`);
      protoContent += customMessages;
    }
  }

  return protoContent;
}

/**
 * Procesa todas las categorías
 */
function processAllCategories() {
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
  });

  const categories = fs.readdirSync(MODELS_PATH).filter(name => {
    const fullPath = path.join(MODELS_PATH, name);
    return fs.statSync(fullPath).isDirectory();
  });

  console.log(`📂 Categorías encontradas: ${categories.join(', ')}\n`);

  categories.forEach(category => {
    console.log(`🔍 Procesando categoría: ${category}`);

    const categoryPath = path.join(MODELS_PATH, category);
    const files = fs.readdirSync(categoryPath).filter(f =>
      f.endsWith('.ts') &&
      f !== 'index.ts'
    );

    const allInterfaces = [];

    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      const sourceFile = project.addSourceFileAtPath(filePath);
      const interfaces = parseInterfacesWithTsMorph(sourceFile, category);  // Pasar category

      if (interfaces.length > 0) {
        console.log(`   - ${file}: ${interfaces.length} interfaces`);
        allInterfaces.push(...interfaces);
      }
    });

    if (allInterfaces.length > 0) {
      const protoContent = generateProtoFile(category, allInterfaces);
      const outputFile = path.join(OUTPUT_PATH, `${category}.proto`);

      fs.writeFileSync(outputFile, protoContent, 'utf8');
      console.log(`   ✅ Generado: ${outputFile}\n`);
    }
  });
}

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

try {
  processAllCategories();
  console.log('🎉 Generación de protobuf v2 completada exitosamente\n');
  console.log('📁 Archivos .proto disponibles en:', OUTPUT_PATH);
} catch (error) {
  console.error('\n❌ Error al generar protobuf:', error.message);
  console.error(error.stack);
  process.exit(1);
}
