import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

function toSnakeCase(str) {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .slice(0, 30);
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;
  
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e);
    return;
  }

  let modified = false;
  let needsTranslationHook = false;
  let componentsToInject = [];

  // Traverse to find JSX text and literal strings in JSX attributes
  traverse(ast, {
    JSXText(path) {
      const text = path.node.value;
      if (text.trim() === '') return; // Ignore pure whitespace

      const key = toSnakeCase(text);
      if (!key) return;

      needsTranslationHook = true;
      modified = true;
      
      const callExpr = t.callExpression(t.identifier('t'), [t.stringLiteral(key)]);
      path.replaceWith(t.jsxExpressionContainer(callExpr));
    },
    JSXAttribute(path) {
      // Add logic here if you want to replace things like placeholder="Search"
      // Skipped for brevity to focus on JSXText
    },
    FunctionDeclaration(path) {
      if (path.node.id && path.node.id.name.match(/^[A-Z]/)) {
         componentsToInject.push(path);
      }
    },
    ArrowFunctionExpression(path) {
      if (path.parent.type === 'VariableDeclarator' && path.parent.id.name.match(/^[A-Z]/)) {
         componentsToInject.push(path);
      }
    }
  });

  if (modified) {
    // Attempt to inject `const { t } = useTranslation();` into components
    let hasImport = false;
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === 'react-i18next') {
          hasImport = true;
        }
      }
    });

    if (!hasImport) {
      const importDecl = t.importDeclaration(
        [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
        t.stringLiteral('react-i18next')
      );
      ast.program.body.unshift(importDecl);
    }

    componentsToInject.forEach((compPath) => {
      // Check if it already has useTranslation
      let hasHook = false;
      compPath.traverse({
        CallExpression(p) {
          if (p.node.callee.name === 'useTranslation') hasHook = true;
        }
      });
      
      if (!hasHook && compPath.node.body.type === 'BlockStatement') {
        const hookCall = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.objectPattern([
              t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
            ]),
            t.callExpression(t.identifier('useTranslation'), [])
          )
        ]);
        compPath.node.body.body.unshift(hookCall);
      }
    });

    const output = generate(ast, {}, code);
    fs.writeFileSync(filePath, output.code, 'utf8');
    console.log(`Modified: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.match(/\.(jsx|tsx)$/)) {
      processFile(fullPath);
    }
  }
}

walk('./src');
console.log('Done!');
