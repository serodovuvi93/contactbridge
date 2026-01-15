import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8');
const { render } = await import('./dist/server/entry-server.js');

// Define routes and their specific metadata
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
  // Loop over each route to generate a static HTML file
  for (const route of routes) {
    const appHtml = render(route.url);

    // Replace Title
    let html = template.replace(
      '<!--title-outlet-->', 
      `<title>${route.title}</title>`
    );

    // Replace Meta Description
    // First, remove existing default description to avoid duplicates if present
    html = html.replace(/<meta name="description" content=".*?" \/>/, '');
    
    // Inject new description
    html = html.replace(
      '<!--meta-outlet-->',
      `<meta name="description" content="${route.desc}" />`
    );

    // Update Open Graph tags for better social sharing
    html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${route.title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${route.desc}" />`);

    // Inject the rendered app HTML
    html = html.replace(`<!--app-html-->`, appHtml);

    // Determine output path
    const filePath = route.url === '/' 
      ? 'dist/static/index.html' 
      : `dist/static${route.url}/index.html`;

    // Ensure directory exists
    const dir = path.dirname(toAbsolute(filePath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(toAbsolute(filePath), html);
    console.log(`Generated: ${filePath}`);
  }

  // Copy root index.html to 404.html for SPA fallback (GitHub Pages requirement)
  fs.copyFileSync(toAbsolute('dist/static/index.html'), toAbsolute('dist/static/404.html'));
  console.log('Generated: dist/static/404.html');
  
  // Cleanup server build
  // fs.rmSync(toAbsolute('dist/server'), { recursive: true });
})();