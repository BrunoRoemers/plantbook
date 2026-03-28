import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { ServerEncryptedValue, SeederEncryptedValue } from "@/lib/crypto";

const TRAYS_DIR = path.join(process.cwd(), "content/trays");

/*
 * Schemas
 */

export const TrayFrontmatter = z.object({
  number: z.number(),
  nurturer_name: z.string(),
  nurturer_email: ServerEncryptedValue,
  seeder_secret: SeederEncryptedValue,
  nurturer_secret: ServerEncryptedValue,
  contribution_amount: z.number(),
  contribution_currency: z.string(),
  cells_per_row: z.number(),
  cells: z.array(z.string()),
  created_at: z.coerce.string(),
});
export type TrayFrontmatter = z.infer<typeof TrayFrontmatter>;

export const Tray = z.object({
  frontmatter: TrayFrontmatter,
  content: z.string(),
});
export type Tray = z.infer<typeof Tray>;

/*
 * Helpers
 */

function trayDirName(num: number): string {
  return String(num).padStart(3, "0");
}

/*
 * Queries
 */

export function getTray(num: number): Tray | null {
  const filepath = path.join(TRAYS_DIR, trayDirName(num), "index.md");
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  return {
    frontmatter: TrayFrontmatter.parse(data),
    content,
  };
}

export function getAllTrays(): Tray[] {
  if (!fs.existsSync(TRAYS_DIR)) return [];

  const dirs = fs
    .readdirSync(TRAYS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const trays: Tray[] = [];
  for (const dir of dirs) {
    const indexPath = path.join(TRAYS_DIR, dir.name, "index.md");
    if (!fs.existsSync(indexPath)) continue;

    const raw = fs.readFileSync(indexPath, "utf8");
    const { data, content } = matter(raw);
    trays.push({
      frontmatter: TrayFrontmatter.parse(data),
      content,
    });
  }

  return trays.sort((a, b) => b.frontmatter.number - a.frontmatter.number);
}

export function getNextTrayNumber(): number {
  if (!fs.existsSync(TRAYS_DIR)) return 1;

  const dirs = fs
    .readdirSync(TRAYS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  if (dirs.length === 0) return 1;

  const maxNumber = Math.max(
    ...dirs.map((d) => parseInt(d.name, 10)).filter((n) => !isNaN(n))
  );

  return maxNumber + 1;
}
