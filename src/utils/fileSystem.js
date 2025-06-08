import { promises as fs } from "fs";
import { parse, relative, normalize, sep } from "path";

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

export function parsePagePath(filePath) {
  const { name, ext } = parse(filePath);

  // Normalize the path to handle Windows/Unix differences
  const normalizedPath = normalize(filePath).replace(/\\/g, "/");

  // Determine the base directory and extract relative path
  let relativePath;
  if (normalizedPath.includes("src/pages/")) {
    const pagesIndex = normalizedPath.indexOf("src/pages/");
    relativePath = normalizedPath.substring(pagesIndex + "src/pages/".length);
  } else if (normalizedPath.includes("pages/")) {
    const pagesIndex = normalizedPath.indexOf("pages/");
    relativePath = normalizedPath.substring(pagesIndex + "pages/".length);
  } else {
    relativePath = name;
  }

  // Remove the file extension from the relative path
  relativePath = relativePath.replace(ext, "");

  // Generate the route path
  const route = "/" + (name === "index" ? "" : relativePath);

  // Generate component name (capitalize first letter)
  const component = name.charAt(0).toUpperCase() + name.slice(1);

  return { name, ext, relativePath, route, component };
}
