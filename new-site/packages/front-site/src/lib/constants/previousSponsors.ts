import type { LogoHoverTheme } from '@/components/ui/LogoLoop';

export type SponsorLogo = {
  src: string;
  alt: string;
  title: string;
  /** Escala extra de exibição, para arquivos com muita área morta em volta da marca. */
  scale?: number;
  /**
   * Tema em que o logo fica branco puro no hover em vez de revelar a cor do arquivo.
   * Necessário quando a cor original da marca é próxima do fundo da seção, o que
   * deixaria o logo ilegível justamente no estado de destaque.
   */
  whiteOnHover?: LogoHoverTheme;
};

const p = (
  company: string,
  file: string,
  overrides?: Pick<SponsorLogo, 'scale' | 'whiteOnHover'>,
): SponsorLogo => ({
  src: `/img/previous_sponsors/${encodeURIComponent(company)}/${encodeURIComponent(file)}`,
  alt: company,
  title: company,
  ...overrides,
});

export const PREVIOUS_SPONSORS: SponsorLogo[] = [
  p("Acad Arena",        "LogoGradient@4x.png"),
  p("Accenture",         "icon-light.svg"),
  p("Alliage",           "path194.svg"),
  p("Alura",             "alura-light.svg"),
  p("AMD",               "full-dark.svg"),
  p("BemAgro",           "icone colorido para fundos escuros-web.svg"),
  p("BTG Pactual",       "BTGT.0002.DE.191118.OriginaisEletronicos_POS_CMYK_BTGPACTUAL_semrespiro.png", { whiteOnHover: 'dark' }),
  p("CI&T",              "full-light.svg"),
  p("Cohere",            "full-light.svg"),
  p("CPqD",              "full-light.svg"),
  p("CSD",               "CSD branco.svg"),
  p("Desktop",           "LOGO 1.png"),
  p("EloGroup",          "logo.svg"),
  p("Ernst & Young",     "wikimedia-ey-logo-2019.svg"),
  p("Fundação Estudar",  "FE_aplicação.png"),
  p("Goldman Sachs",     "goldman-sachs-1.svg"),
  p("Google",            "full-light.svg"),
  p("Griaule",           "logo-griaule-cmyk-blue - notext.svg", { whiteOnHover: 'light' }),
  p("idwall",            "full-light.svg"),
  p("Inoa",              "Logo Horizontal Cores clean 300dpi - com margem.png"),
  p("Intel Software",    "icon-light.svg"),
  p("Loggi",             "logodownload-1.png"),
  p("LuizaLabs",         "iconape-1.png"),
  p("Neon",              "neon.logo (2).png"),
  p("Pagar.me",          "full-light.svg"),
  p("Porto Seguro",      "Porto Seguros_RGB_Horizontal-01.svg"),
  p("ProFUSION",         "Asset 52.svg"),
  p("Qive",              "Qive_originais de marca-03.png"),
  p("Raizen",            "wikimedia-original.svg"),
  p("Serasa",            "wikimedia-original.svg", { whiteOnHover: 'light' }),
  p("Tractian",          "seeklogo-preview.png", { whiteOnHover: 'light' }),
  p("Venturus",          "venturus.png"),
  p("Visagio",           "Logo-Grupo-Off.png", { scale: 1.4 }),
  p("Yara International","full-light.svg"),
];
