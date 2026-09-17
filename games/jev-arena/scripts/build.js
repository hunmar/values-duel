import { mkdir, cp, rm, readFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await cp('index.html', 'dist/index.html');
for (const file of ['engine.js', 'render.js', 'main.js', 'style.css']) {
  const text = await readFile(`src/${file}`, 'utf8');
  if (/apikey_[a-z0-9]+/i.test(text) || text.includes('TYPESAFE_API_KEY')) throw new Error(`Secret-like content in client asset: ${file}`);
  await cp(`src/${file}`, `dist/src/${file}`);
}
console.log('Built dependency-free client in dist/. API remains server-side.');
