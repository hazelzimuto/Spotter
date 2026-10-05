const fs = require('fs');
const path = require('path');

/**
 * Design Token to CSS Variables Converter
 * 
 * Enforces standard color system practices:
 * 1. Primitives: Raw scale tokens (e.g. primary-40, neutral-10) declared as primitive CSS variables.
 * 2. Color Roles (Semantic Tokens): Applied via themes (light/dark) onto `:root` and `[data-theme="dark"]`.
 *    UI elements MUST consume semantic color roles (e.g., var(--color-primary), var(--color-surface)),
 *    NEVER primitive colors directly.
 */

// Helper to convert camelCase to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// Deep lookup to resolve path like "primitives.color.primary.40"
function getNestedValue(obj, pathStr) {
  const keys = pathStr.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

// Resolve curly brace references recursively (e.g. "{primitives.color.primary.40}")
function resolveReferences(value, fullJson) {
  if (typeof value !== 'string') return value;

  const refRegex = /^\{([^}]+)\}$/;
  const match = value.match(refRegex);

  if (match) {
    const refPath = match[1];
    const resolved = getNestedValue(fullJson, refPath);
    if (resolved !== undefined) {
      return resolveReferences(resolved, fullJson);
    }
  }

  // Handle inline references if string contains partial refs
  return value.replace(/\{([^}]+)\}/g, (_, refPath) => {
    const resolved = getNestedValue(fullJson, refPath);
    return resolved !== undefined ? resolveReferences(resolved, fullJson) : `{${refPath}}`;
  });
}

// Recursively resolve all references in an object
function resolveAllTokens(target, fullJson) {
  if (typeof target === 'string') {
    return resolveReferences(target, fullJson);
  }
  if (typeof target === 'number' || typeof target === 'boolean' || target === null) {
    return target;
  }
  if (Array.isArray(target)) {
    return target.map(item => resolveAllTokens(item, fullJson));
  }
  const result = {};
  for (const key of Object.keys(target)) {
    result[key] = resolveAllTokens(target[key], fullJson);
  }
  return result;
}

// Convert object tree into key-value pairs of CSS variables
function flattenToCssVars(obj, prefix = '') {
  let vars = [];

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const varName = prefix ? `${prefix}-${toKebabCase(key)}` : `--${toKebabCase(key)}`;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      vars = vars.concat(flattenToCssVars(value, varName));
    } else {
      vars.push({ name: varName, value });
    }
  }

  return vars;
}

function generateCss(tokens) {
  const resolvedTokens = resolveAllTokens(tokens, tokens);
  const primitives = resolvedTokens.primitives || {};
  const semantic = resolvedTokens.semantic || {};
  const themes = resolvedTokens.themes || {};
  const components = resolvedTokens.components || {};

  let css = `/**
 * AURORA DESIGN SYSTEM - AUTO-GENERATED CSS VARIABLES
 * Source of Truth: design tokens JSON
 * 
 * IMPORTANT:
 * - Primitive variables (--primitive-*) store raw scale values.
 * - Semantic Color Roles (--color-*) store UI roles (Light/Dark themes).
 * - UI components MUST use semantic color roles (--color-*), NEVER primitives directly.
 */

:root {
  /* ==========================================================================
     1. PRIMITIVE DESIGN TOKENS
     ========================================================================== */
`;

  // 1. Primitive Colors
  if (primitives.color) {
    css += `  /* Primitive Color Scales */\n`;
    const primColors = flattenToCssVars(primitives.color, '--primitive-color');
    for (const v of primColors) {
      css += `  ${v.name}: ${v.value};\n`;
    }
    css += `\n`;
  }

  // 2. Primitive Typography & Base Scale Tokens
  if (primitives.typography) {
    css += `  /* Base Typography */\n`;
    const primTypography = flattenToCssVars(primitives.typography, '--primitive-typography');
    for (const v of primTypography) {
      css += `  ${v.name}: ${v.value};\n`;
    }
    css += `\n`;
  }

  // 3. Spacing, Radius, Border, Elevation, Icons, Motion, Breakpoints, Z-Index
  const baseCategories = ['spacing', 'radius', 'borderWidth', 'elevation', 'icon', 'motion', 'breakpoint', 'layout', 'zIndex'];
  for (const cat of baseCategories) {
    if (primitives[cat]) {
      css += `  /* Primitive ${cat.charAt(0).toUpperCase() + cat.slice(1)} */\n`;
      const catVars = flattenToCssVars(primitives[cat], `--${toKebabCase(cat)}`);
      for (const v of catVars) {
        css += `  ${v.name}: ${v.value};\n`;
      }
    css += `\n`;
  }

  // 3c. Interaction state tokens (hover/pressed/focus/disabled opacity).
  if (semantic.state) {
    css += `  /* Interaction State */\n`;
    const semState = flattenToCssVars(semantic.state, '--state');
    for (const v of semState) {
      css += `  ${v.name}: ${v.value};\n`;
    }
    css += `\n`;
  }

  // 3d. Component recipe tokens, excluding colour literals.
  //
  // tokens.json bakes light-theme colour values into components.*, so emitting
  // them verbatim would pin every component to the light palette and defeat
  // the dark theme. Only non-colour leaves (heights, radii, padding, gaps,
  // border widths) are emitted; CSS keeps sourcing colour from the --color-*
  // semantic roles, per the rule at the top of this file.
  const COLOR_LITERAL = /^(#|rgb|hsl|oklch|color\()/i;
  const isColorLiteral = (value) =>
    typeof value === 'string' && COLOR_LITERAL.test(value.trim());

  const emitNonColor = (node, prefix) => {
    let out = '';
    for (const key of Object.keys(node)) {
      const value = node[key];
      const name = `${prefix}-${toKebabCase(key)}`;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        out += emitNonColor(value, name);
      } else if (!isColorLiteral(value)) {
        out += `  ${name}: ${value};\n`;
      }
    }
    return out;
  };

  if (components) {
    css += `  /* Component Recipe Tokens (colour comes from --color-* roles) */\n`;
    css += emitNonColor(components, '--component');
    css += `\n`;
  }

  }

  css += `  /* ==========================================================================
     2. SEMANTIC TOKENS (NON-COLOR)
     ========================================================================== */
`;

  if (semantic.spacing) {
    const semSpacing = flattenToCssVars(semantic.spacing, '--spacing');
    for (const v of semSpacing) {
      css += `  ${v.name}: ${v.value};\n`;
    }
  }
  if (semantic.radius) {
    const semRadius = flattenToCssVars(semantic.radius, '--radius');
    for (const v of semRadius) {
      css += `  ${v.name}: ${v.value};\n`;
    }
  }
  if (semantic.border) {
    const semBorder = flattenToCssVars(semantic.border, '--border');
    for (const v of semBorder) {
      css += `  ${v.name}: ${v.value};\n`;
    }
  }
  if (semantic.elevation) {
    const semElev = flattenToCssVars(semantic.elevation, '--elevation');
    for (const v of semElev) {
      css += `  ${v.name}: ${v.value};\n`;
    }
  }
  if (semantic.zIndex) {
    const semZ = flattenToCssVars(semantic.zIndex, '--z-index');
    for (const v of semZ) {
      css += `  ${v.name}: ${v.value};\n`;
    }
  }

  // 3b. Typography semantic variables.
  // UI modules consume typographic values as CSS custom properties
  // (var(--typography-font-size-24)), so the type scale must be emitted as
  // variables and not only as the utility classes in section 5.
  if (semantic.typography) {
    css += `  /* Semantic Typography Scale */\n`;
    if (primitives.typography) {
      const typeScale = flattenToCssVars(primitives.typography, '--typography');
      for (const v of typeScale) {
        css += `  ${v.name}: ${v.value};\n`;
      }
    }
    for (const key of Object.keys(semantic.typography)) {
      const typeSpec = semantic.typography[key];
      const prefix = `--typography-${toKebabCase(key)}`;
      for (const prop of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']) {
        if (typeSpec[prop] !== undefined) {
          css += `  ${prefix}-${toKebabCase(prop)}: ${typeSpec[prop]};\n`;
        }
      }
    }
    css += `\n`;
  }

  // 4. Color Roles (Light Theme Default)
  css += `\n  /* ==========================================================================
     3. SEMANTIC COLOR ROLES (LIGHT THEME DEFAULT)
     ========================================================================== */\n`;

  if (themes.light && themes.light.color) {
    const lightRoles = flattenToCssVars(themes.light.color, '--color');
    for (const v of lightRoles) {
      css += `  ${v.name}: ${v.value};\n`;
    }
  }

  css += `}\n\n`;

  // 5. Dark Theme Color Roles Overrides
  if (themes.dark && themes.dark.color) {
    css += `/* ==========================================================================
   4. SEMANTIC COLOR ROLES (DARK THEME OVERRIDES)
   ========================================================================== */
[data-theme="dark"] {
`;
    const darkRoles = flattenToCssVars(themes.dark.color, '--color');
    for (const v of darkRoles) {
      css += `  ${v.name}: ${v.value};\n`;
    }
    css += `}\n\n`;

    // System dark mode media query fallback
    css += `@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
`;
    for (const v of darkRoles) {
      css += `    ${v.name}: ${v.value};\n`;
    }
    css += `  }\n}\n\n`;
  }

  // 6. Typography Semantic Classes & Utility Tokens
  if (semantic.typography) {
    css += `/* ==========================================================================
   5. SEMANTIC TYPOGRAPHY UTILITIES
   ========================================================================== */\n`;
    for (const key of Object.keys(semantic.typography)) {
      const typeSpec = semantic.typography[key];
      const className = toKebabCase(key);
      css += `.${className} {\n`;
      if (typeSpec.fontFamily) css += `  font-family: ${typeSpec.fontFamily};\n`;
      if (typeSpec.fontSize) css += `  font-size: ${typeSpec.fontSize};\n`;
      if (typeSpec.fontWeight) css += `  font-weight: ${typeSpec.fontWeight};\n`;
      if (typeSpec.lineHeight) css += `  line-height: ${typeSpec.lineHeight};\n`;
      if (typeSpec.letterSpacing) css += `  letter-spacing: ${typeSpec.letterSpacing};\n`;
      css += `}\n\n`;
    }
  }

  return css;
}

function main() {
  // Find tokens file
  const candidatePaths = [
    process.argv[2],
    path.join(__dirname, 'design tokens/tokens.json'),
    path.join(__dirname, 'design-tokens.tokens.json'),
    '/Users/josephbrendan/Desktop/Spotter/design-tokens.tokens.json'
  ].filter(Boolean);

  let tokensPath = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      tokensPath = p;
      break;
    }
  }

  if (!tokensPath) {
    console.error('Error: Design tokens JSON file not found in any expected location.');
    process.exit(1);
  }

  console.log(`Reading design tokens from: ${tokensPath}`);
  const rawData = fs.readFileSync(tokensPath, 'utf8');
  const tokens = JSON.parse(rawData);

  const cssContent = generateCss(tokens);

  // Write output CSS
  // Always write to project root so app/globals.css @import "../tokens.css" resolves correctly
  const outputDir = __dirname;

  const outputPath = path.join(outputDir, 'tokens.css');
  fs.writeFileSync(outputPath, cssContent, 'utf8');

  console.log(`Successfully generated CSS variables at: ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateCss, resolveReferences, flattenToCssVars };
