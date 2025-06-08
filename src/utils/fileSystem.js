import { promises as fs } from "fs";
import { parse, relative } from "path";

export async function checkDirectoryExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(path) {
  await fs.mkdir(path, { recursive: true });
}

export async function writeFile(path, content) {
  await fs.writeFile(path, content);
}

export async function readFile(path) {
  return await fs.readFile(path, "utf-8");
}

export async function findFile(files) {
  for (const file of files) {
    try {
      await fs.access(file);
      return file;
    } catch {}
  }
  return null;
}

export function parsePagePath(path) {
  const { name, ext } = parse(path);
  const relativePath = relative("pages", path).replace(ext, "");
  const route = "/" + (name === "index" ? "" : relativePath);
  const component = name.charAt(0).toUpperCase() + name.slice(1);
  return { name, ext, relativePath, route, component };
}
