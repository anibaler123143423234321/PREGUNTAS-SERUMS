import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');

const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.endsWith('.js'));
const cssFile = files.find(f => f.endsWith('.css'));

const jsCode = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
const cssCode = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SERUMS Pro | Simulador y Plataforma de Entrenamiento Médico MINSA</title>
    <meta name="description" content="Plataforma médica interactiva de alta fidelidad para el Examen SERUMS del MINSA Perú. 400 preguntas oficiales con perlas de estudio, explicaciones clínicas y analítica de desempeño." />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3'/><path d='M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4'/><circle cx='20' cy='10' r='2'/></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
    <style>
      ${cssCode}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      ${jsCode}
    </script>
  </body>
</html>`;

const outputPath = path.resolve(__dirname, '../simulador_serums_pro.html');
fs.writeFileSync(outputPath, htmlTemplate, 'utf8');
console.log(`Successfully generated standalone ${outputPath}`);
