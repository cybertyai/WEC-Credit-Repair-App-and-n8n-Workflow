/**
 * Converts a markdown session report to PDF using Puppeteer.
 * Usage: node scripts/generate-report.js <input.md> [output.pdf]
 *
 * The output defaults to reports/<input-basename>.pdf
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const marked = require('marked');

async function generateReport(inputPath, outputPath) {
  const md = fs.readFileSync(inputPath, 'utf8');
  const html = marked.parse(md);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a2e;
      padding: 40px 48px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 { color: #0A1628; font-size: 24px; margin-bottom: 8px; border-bottom: 3px solid #C9952A; padding-bottom: 8px; }
    h2 { color: #0A1628; font-size: 18px; margin-top: 28px; margin-bottom: 8px; }
    h3 { color: #C9952A; font-size: 15px; margin-top: 20px; margin-bottom: 6px; }
    p { margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #0A1628; color: #C9952A; padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    pre { background: #0A1628; color: #e2e8f0; padding: 16px; border-radius: 8px; margin: 12px 0; overflow-x: auto; }
    pre code { background: none; color: inherit; }
    ul, ol { margin: 8px 0 12px 20px; }
    li { margin-bottom: 4px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  ${html}
  <div class="footer">
    <span>Williams Equity Capital, Inc. — Confidential</span>
    <span>Generated: ${new Date().toLocaleString()}</span>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    printBackground: true,
  });
  await browser.close();

  console.log(`PDF written to: ${outputPath}`);
}

const [,, inputArg, outputArg] = process.argv;
if (!inputArg) {
  console.error('Usage: node scripts/generate-report.js <input.md> [output.pdf]');
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.join(path.resolve(__dirname, '..', 'reports'), path.basename(inputArg, '.md') + '.pdf');

generateReport(inputPath, outputPath).catch(err => {
  console.error(err);
  process.exit(1);
});
