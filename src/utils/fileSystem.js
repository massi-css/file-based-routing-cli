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

export async function detectProjectType() {
  try {
    // Check for TypeScript config
    try {
      await fs.access("tsconfig.json");
      return { isTypeScript: true, useJSX: true }; // Assume JSX for React projects
    } catch {}

    // Check package.json for TypeScript dependency
    try {
      const packageJson = JSON.parse(await readFile("package.json"));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      const isTypeScript = deps.typescript || deps["@types/react"];
      return { isTypeScript: !!isTypeScript, useJSX: true };
    } catch {}

    // Default to JavaScript with JSX
    return { isTypeScript: false, useJSX: true };
  } catch {
    return { isTypeScript: false, useJSX: true };
  }
}

export function getFileExtension(isTypeScript, useJSX) {
  if (isTypeScript) {
    return useJSX ? ".tsx" : ".ts";
  } else {
    return useJSX ? ".jsx" : ".js";
  }
}

export async function findAppFile() {
  const possibleFiles = [
    "src/App.tsx",
    "src/App.jsx",
    "src/App.ts",
    "src/App.js",
    "App.tsx",
    "App.jsx",
    "App.ts",
    "App.js",
  ];

  for (const file of possibleFiles) {
    try {
      await fs.access(file);
      return file;
    } catch {}
  }
  return null;
}

export function isReactFile(filePath) {
  return (
    filePath.endsWith(".jsx") ||
    filePath.endsWith(".tsx") ||
    filePath.endsWith(".js") ||
    filePath.endsWith(".ts")
  );
}
