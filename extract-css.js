import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetHtml = path.join(__dirname, 'public', 'terminal.html');
const targetCss = path.join(__dirname, 'public', 'css', 'terminal.css');

let html = fs.readFileSync(targetHtml, 'utf8');

const styleRegex = /<style>([\s\S]*?)<\/style>/;
const match = html.match(styleRegex);

if (match) {
    fs.mkdirSync(path.join(__dirname, 'public', 'css'), { recursive: true });
    fs.writeFileSync(targetCss, match[1].trim());
    
    html = html.replace(styleRegex, '<link rel="stylesheet" href="/css/terminal.css" />');
    fs.writeFileSync(targetHtml, html);
    
    console.log('Extracted CSS successfully to ' + targetCss);
} else {
    console.log('No style tag found in ' + targetHtml);
}
