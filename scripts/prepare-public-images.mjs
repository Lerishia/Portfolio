import { cpSync, existsSync, lstatSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();
const sourceDir = resolve(rootDir, "Image");
const targetDir = resolve(rootDir, "public", "portfolio-images");

if (!existsSync(sourceDir)) {
  console.warn(`[prepare:assets] Skipping image sync because ${sourceDir} does not exist.`);
  process.exit(0);
}

if (existsSync(targetDir)) {
  const targetStats = lstatSync(targetDir);

  if (targetStats.isSymbolicLink()) {
    unlinkSync(targetDir);
  } else if (!targetStats.isDirectory()) {
    throw new Error(`[prepare:assets] Expected ${targetDir} to be a directory or symlink.`);
  }
}

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, {
  recursive: true,
  force: true
});

console.log(`[prepare:assets] Synced ${sourceDir} -> ${targetDir}`);
