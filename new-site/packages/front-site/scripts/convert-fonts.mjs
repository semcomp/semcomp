import { promises as fs } from "node:fs";
import path from "node:path";
import ttf2woff2 from "ttf2woff2";

const root = process.cwd();
const targets = [
  "src/assets/fonts/Comfortaa",
  "src/assets/fonts/Poppins",
];

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    if (entry.name.toLowerCase().endsWith(".ttf")) {
      out.push(full);
    }
  }
  return out;
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function convertOne(ttfPath) {
  const ttfBuffer = await fs.readFile(ttfPath);
  const woff2Buffer = Buffer.from(ttf2woff2(ttfBuffer));
  const woff2Path = ttfPath.replace(/\.ttf$/i, ".woff2");
  await fs.writeFile(woff2Path, woff2Buffer);

  return {
    ttfPath,
    woff2Path,
    ttfSize: ttfBuffer.byteLength,
    woff2Size: woff2Buffer.byteLength,
  };
}

async function main() {
  const files = [];
  for (const rel of targets) {
    const abs = path.join(root, rel);
    try {
      await fs.access(abs);
      const found = await walk(abs);
      files.push(...found);
    } catch {
      // ignore missing dir
    }
  }

  if (files.length === 0) {
    console.log("No TTF files found.");
    return;
  }

  console.log(`[fonts] converting ${files.length} TTF files...`);
  const converted = [];
  for (const file of files) {
    const result = await convertOne(file);
    converted.push(result);
    const relIn = path.relative(root, result.ttfPath).replaceAll("\\", "/");
    const relOut = path.relative(root, result.woff2Path).replaceAll("\\", "/");
    const savedPct = (((result.ttfSize - result.woff2Size) / result.ttfSize) * 100).toFixed(1);
    console.log(`[fonts] ${relIn} -> ${relOut} (${kb(result.ttfSize)} -> ${kb(result.woff2Size)}, -${savedPct}%)`);
  }

  const totalTtf = converted.reduce((acc, item) => acc + item.ttfSize, 0);
  const totalWoff2 = converted.reduce((acc, item) => acc + item.woff2Size, 0);
  const totalSaved = (((totalTtf - totalWoff2) / totalTtf) * 100).toFixed(1);

  console.log(`[fonts] done. Total: ${kb(totalTtf)} -> ${kb(totalWoff2)} (-${totalSaved}%).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
