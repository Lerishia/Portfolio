import { readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const imageRoot = join(process.cwd(), "public", "Image");

const categoryMeta = {
  Branding: {
    label: "Branding",
    description:
      "Identity systems, packaging, business stationery, vehicle graphics, and full brand presentation work."
  },
  "Corporate Material": {
    label: "Corporate Material",
    description: "Internal communication pieces, learning material, process visuals, and infographic-led design."
  },
  Emailer: {
    label: "Emailer",
    description: "Promotional email design focused on clarity, hierarchy, and product-led communication."
  },
  "Marketing Material": {
    label: "Marketing Material",
    description: "Flyers, posters, wallpapers, product campaigns, and print-ready marketing collateral."
  },
  "Personal projects": {
    label: "Personal Projects",
    description: "Self-initiated creative work, invitations, concept pieces, and experimental illustration projects."
  },
  "Promotional Material": {
    label: "Promotional Material",
    description: "Retail and campaign graphics designed to support launches, offers, and seasonal messaging."
  },
  "Social media": {
    label: "Social Media",
    description: "Social banners and posts designed to capture attention quickly while staying brand-consistent."
  },
  "Website design": {
    label: "Website Design",
    description: "Landing pages, storefront layouts, and responsive UI explorations across desktop and web flows."
  }
} satisfies Record<string, { label: string; description: string }>;

const hiddenPortfolioItems = new Set(["Branding/Profile Picture.jpg"]);
const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

export interface PortfolioItem {
  categoryKey: string;
  relativePath: string;
  src: string;
  title: string;
  alt: string;
}

export interface PortfolioSection {
  id: string;
  categoryKey: string;
  label: string;
  description: string;
  count: number;
  items: PortfolioItem[];
}

const encodePath = (value: string) => value.split("/").map(encodeURIComponent).join("/");

const titleFromFile = (value: string) =>
  value
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const getFiles = (directory: string, relativePrefix = ""): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getFiles(fullPath, relativePath);
    }

    const extension = extname(entry.name).toLowerCase();
    if (!allowedExtensions.has(extension) || hiddenPortfolioItems.has(relativePath) || !statSync(fullPath).isFile()) {
      return [];
    }

    return [relativePath];
  });

const portfolioItems: PortfolioItem[] = getFiles(imageRoot)
  .map((relativePath) => {
    const [categoryKey] = relativePath.split("/");
    const fileName = basename(relativePath);

    return {
      categoryKey,
      relativePath,
      src: `/Image/${encodePath(relativePath)}`,
      title: titleFromFile(fileName),
      alt: `${titleFromFile(fileName)} by Lerishia Naidoo`
    };
  })
  .filter((item) => categoryMeta[item.categoryKey as keyof typeof categoryMeta])
  .sort((left, right) => left.title.localeCompare(right.title, undefined, { numeric: true }));

export const portfolioSections: PortfolioSection[] = Object.entries(categoryMeta)
  .map(([categoryKey, meta]) => {
    const items = portfolioItems.filter((item) => item.categoryKey === categoryKey);

    return {
      id: slugify(categoryKey),
      categoryKey,
      label: meta.label,
      description: meta.description,
      count: items.length,
      items
    };
  })
  .filter((section) => section.count > 0);

export const featuredGallery = portfolioSections.flatMap((section) => section.items.slice(0, 1)).slice(0, 3);
