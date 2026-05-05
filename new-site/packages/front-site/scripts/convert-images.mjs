import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const targets = [
  'src/assets/img/semcomp',
  'src/assets/img/team',
];

const exts = new Set(['.jpg', '.jpeg', '.png']);

async function walk(dir, out = []) {
  console.log(`[scan] entering ${path.relative(root, dir)}`);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (exts.has(ext)) {
      console.log(`[scan] found ${path.relative(root, full)}`);
      out.push(full);
    }
  }
  return out;
}

async function fileSize(filePath) {
  const stat = await fs.stat(filePath);
  return stat.size;
}

async function convertOne(src) {
  const ext = path.extname(src);
  const base = src.slice(0, -ext.length);
  const webpOut = `${base}.webp`;
  const avifOut = `${base}.avif`;

  console.log(`[convert] start ${path.relative(root, src)}`);
  const input = sharp(src);
  const meta = await input.metadata();

  await input
    .clone()
    .rotate()
    .webp({ quality: 82, effort: 5 })
    .toFile(webpOut);
  console.log(`[convert] wrote ${path.relative(root, webpOut)}`);

  await input
    .clone()
    .rotate()
    .avif({ quality: 52, effort: 5 })
    .toFile(avifOut);
  console.log(`[convert] wrote ${path.relative(root, avifOut)}`);

  const [srcSize, webpSize, avifSize] = await Promise.all([
    fileSize(src),
    fileSize(webpOut),
    fileSize(avifOut),
  ]);

  return {
    src,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    srcSize,
    webpOut,
    webpSize,
    avifOut,
    avifSize,
  };
}

function kb(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

function pct(from, to) {
  return `${(((from - to) / from) * 100).toFixed(1)}%`;
}

async function main() {
  console.log('[start] image conversion task');
  const files = [];
  for (const rel of targets) {
    const abs = path.join(root, rel);
    try {
      console.log(`[start] scanning ${rel}`);
      await fs.access(abs);
      const found = await walk(abs);
      files.push(...found);
      console.log(`[start] ${rel}: ${found.length} source files`);
    } catch {
      console.log(`[start] missing folder ${rel}, skipping`);
      // ignore missing folders
    }
  }

  if (files.length === 0) {
    console.log('No source images found.');
    return;
  }

  console.log(`[start] total source images: ${files.length}`);

  const results = [];
  for (const [index, file] of files.entries()) {
    console.log(`[progress] ${index + 1}/${files.length}`);
    results.push(await convertOne(file));
  }

  results.sort((a, b) => b.srcSize - a.srcSize);

  const reportLines = [
    '# Image Conversion Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '| File | Original | WebP | AVIF |',
    '|---|---:|---:|---:|',
  ];

  for (const r of results) {
    const rel = path.relative(root, r.src).replaceAll('\\\\', '/');
    reportLines.push(
      `| ${rel} | ${kb(r.srcSize)} | ${kb(r.webpSize)} (${pct(r.srcSize, r.webpSize)}) | ${kb(r.avifSize)} (${pct(r.srcSize, r.avifSize)}) |`
    );
  }

  await fs.mkdir(path.join(root, 'reports'), { recursive: true });
  const reportPath = path.join(root, 'reports', 'image-conversion.md');
  await fs.writeFile(reportPath, reportLines.join('\n'));

  const totalSrc = results.reduce((acc, r) => acc + r.srcSize, 0);
  const totalWebp = results.reduce((acc, r) => acc + r.webpSize, 0);
  const totalAvif = results.reduce((acc, r) => acc + r.avifSize, 0);

  console.log('[done] conversion complete');
  console.log(`Converted ${results.length} files.`);
  console.log(`Total original: ${kb(totalSrc)}`);
  console.log(`Total WebP: ${kb(totalWebp)} (${pct(totalSrc, totalWebp)})`);
  console.log(`Total AVIF: ${kb(totalAvif)} (${pct(totalSrc, totalAvif)})`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
