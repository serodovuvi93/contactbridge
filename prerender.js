import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8');
const { render } = await import('./dist/server/entry-server.js');

// Base path matches vite.config.ts
const basePath = '/contactbridge';
const domain = 'https://serodovuvi93.github.io';

// Маршруты для генерации (SEO)
const routes = [
  {
    url: '/',
    title: 'ContactBridge Pro - Universal Contact Converter',
    desc: 'Securely convert Excel/CSV files to vCard (VCF) and back. Split large contact lists. Everything runs locally in your browser for 100% privacy.'
  },
  {
    url: '/csv-to-vcf',
    title: 'Free CSV to vCard Converter - Excel to VCF Online | ContactBridge Pro',
    desc: 'The easiest way to move contacts from Excel or Google Sheets to your iPhone, Android, or iCloud. Convert CSV to VCF instantly.'
  },
  {
    url: '/vcf-to-csv',
    title: 'Free VCF to CSV Converter - vCard to Excel Online | ContactBridge Pro',
    desc: 'Turn your contact backups into readable spreadsheets. Convert VCF to CSV for CRM imports and data cleaning.'
  },
  {
    url: '/splitter',
    title: 'Free VCF Splitter - Split vCard Files Online | ContactBridge Pro',
    desc: 'Break down massive contact files into smaller chunks for easier importing. Split VCF files securely.'
  }
];

(async () => {
  console.log('🚀 Starting Static Site Generation...');

  for (const route of routes) {
    try {
      console.log(`📄 Generating: ${route.url}`);

      // Ensure trailing slash for canonical and routing
      const routeUrlWithSlash = route.url === '/' ? '/' : `${route.url}/`;
      const fullUrl = `${basePath}${routeUrlWithSlash}`;

      // 1. Рендерим React-компонент в строку
      const appHtml = render(fullUrl);

      // 2. Берем шаблон index.html
      let html = template;

      // 3. Вставляем HTML приложения
      html = html.replace('<!--app-html-->', appHtml);

      // 4. Заменяем мета-теги
      html = html.replace(/<title>[\s\S]*?<\/title>/, '');
      html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, '');

      html = html.replace('<!--title-outlet-->', `<title>${route.title}</title>`);
      html = html.replace('<!--meta-outlet-->', `<meta name="description" content="${route.desc}" />`);

      // Canonical Tag
      const canonicalUrl = `${domain}${basePath}${routeUrlWithSlash}`;
      html = html.replace('</head>', `<link rel="canonical" href="${canonicalUrl}" />\n</head>`);

      // Open Graph
      html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${route.title}" />`);
      html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${route.desc}" />`);
      html = html.replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);

      // 5. Определяем путь для сохранения (всегда index.html внутри папки)
      const filePath = route.url === '/'
        ? 'dist/static/index.html'
        : `dist/static${route.url}/index.html`;

      // 6. Создаем папку и сохраняем файл
      const dir = path.dirname(toAbsolute(filePath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(toAbsolute(filePath), html);
    } catch (e) {
      console.error(`❌ Error generating ${route.url}:`, e);
    }
  }

  // Копируем index.html в 404.html
  fs.copyFileSync(toAbsolute('dist/static/index.html'), toAbsolute('dist/static/404.html'));
  console.log('✅ 404.html generated');
  console.log('🎉 SSG Build Complete!');
})();