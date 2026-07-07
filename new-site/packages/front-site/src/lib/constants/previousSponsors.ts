/**
 * Carrega e seleciona o melhor logo de cada patrocinador anterior.
 * Importado por PatrocinadoresAntigosSection e TornarPatrocinadorSection.
 */

const _allModules = import.meta.glob(
  '/src/assets/img/previous_sponsors/**/*.{svg,png,webp}',
  { eager: true }
) as Record<string, { default: string }>;

function isMonochrome(filename: string): boolean {
  const f = filename.toLowerCase();
  return (
    f.includes('white') || f.includes('branco') || f.includes('negativ') ||
    f.includes('_neg') || f.includes('neg_') || f.includes('preto') ||
    f.includes('black') || f.includes('simpleicons') || f.includes('cinza') || f.includes('gray')
  );
}

function isIconOnly(filename: string): boolean {
  const f = filename.toLowerCase();
  return (
    (f.includes('icon') || f.includes('icone') || f.startsWith('icon')) &&
    !f.includes('iconape')
  );
}

function pickBestLogo(srcs: string[]): string | undefined {
  const score = (src: string): number => {
    const fn = src.split('/').pop() ?? '';
    let s = 0;
    if (src.endsWith('.svg')) s += 4;
    if (src.endsWith('.png')) s += 2;
    if (isMonochrome(fn)) s -= 5;
    if (isIconOnly(fn))   s -= 3;
    const f = fn.toLowerCase();
    if (f.includes('original') || f.includes('colorid') || f.includes('principal')) s += 3;
    if (f.includes('full') || f.includes('horizontal')) s += 2;
    if (f.includes('dark')) s += 1;
    return s;
  };
  return [...srcs].sort((a, b) => score(b) - score(a))[0];
}

const _companiesMap = new Map<string, string[]>();
for (const [path, mod] of Object.entries(_allModules)) {
  const match = path.match(/previous_sponsors\/([^/]+)\//);
  if (!match) continue;
  const company = match[1];
  if (!_companiesMap.has(company)) _companiesMap.set(company, []);
  _companiesMap.get(company)!.push(mod.default as string);
}

export type SponsorLogo = { src: string; alt: string; title: string };

export const PREVIOUS_SPONSORS: SponsorLogo[] = Array.from(_companiesMap.entries())
  .map(([name, srcs]) => {
    const src = pickBestLogo(srcs);
    return src ? { src, alt: name, title: name } : null;
  })
  .filter((s): s is SponsorLogo => s !== null);
