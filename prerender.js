import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8');
const { render } = await import('./dist/server/entry-server.js');

// Base path matches vite.config.ts
const basePath = '/contactbridge';

// Routes for generation (SEO)
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

      // 1. Render React component to string
      const fullUrl = route.url === '/' ? `${basePath}/` : `${basePath}${route.url}`;
      const appHtml = render(fullUrl);

      // 2. Get index.html template
      let html = template;

      // 3. Insert App HTML
      // IMPORTANT: We replace <!--app-html--> with real content
      html = html.replace('<!--app-html-->', appHtml);

      // 4. Replace meta tags

      // Remove default tags FIRST, so we don't remove the newly inserted ones
      // Use [\s\S]*? to support multi-line tags
      html = html.replace(/<title>[\s\S]*?<\/title>/, '');
      html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, '');

      // Insert new ones
      html = html.replace('<!--title-outlet-->', `<title>${route.title}</title>`);
      html = html.replace('<!--meta-outlet-->', `<meta name="description" content="${route.desc}" />`);

      // Open Graph - replace existing ones
      html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${route.title}" />`);
      html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${route.desc}" />`);

      // 5. Determine save path
      const filePath = route.url === '/'
        ? 'dist/static/index.html'
        : `dist/static${route.url}/index.html`;

      // 6. Create folder and save file
      const dir = path.dirname(toAbsolute(filePath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(toAbsolute(filePath), html);
    } catch (e) {
      console.error(`❌ Error generating ${route.url}:`, e);
    }
  }

  // Copy index.html to 404.html for GitHub Pages (SPA fallback)
  fs.copyFileSync(toAbsolute('dist/static/index.html'), toAbsolute('dist/static/404.html'));
  console.log('✅ 404.html generated');
  console.log('🎉 SSG Build Complete!');
})();