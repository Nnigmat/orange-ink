import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:8000';
const label = process.argv[3] || '';
const dir = './screenshots';
fs.mkdirSync(dir, { recursive: true });
const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png')).length;
const filename = path.join(dir, `screenshot-${existing + 1}${label ? '-' + label : ''}.png`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url);
await page.screenshot({ path: filename, fullPage: true });
await browser.close();
console.log('Saved:', filename);
