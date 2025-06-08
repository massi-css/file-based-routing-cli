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

  // Generate the route path with dynamic route handling
  let route;
  if (name === "index") {
    // Handle index files - they map to the parent directory
    const pathParts = relativePath.split("/");
    pathParts.pop(); // Remove the "index" part
    route = "/" + pathParts.join("/");
  } else {
    // Convert bracket notation [id] to :id for React Router
    const routePath = relativePath
      .split("/")
      .map((segment) => {
        if (segment.match(/^\[.+\]$/)) {
          // Convert [id] to :id, [slug] to :slug, etc.
          return segment.replace(/^\[(.+)\]$/, ":$1");
        }
        return segment;
      })
      .join("/");
    route = "/" + routePath;
  }
  // Generate component name (handle bracket notation for imports)
  let component;

  // Create a unique component name based on the full relative path
  const pathParts = relativePath.split("/");
  if (name.match(/^\[.+\]$/)) {
    // For dynamic routes like [id].jsx or categories/[id].jsx
    // Include parent directory names to make it unique
    const paramName = name.replace(/^\[(.+)\]$/, "$1");
    const parentParts = pathParts.slice(0, -1); // All parts except the file name

    if (parentParts.length > 0) {
      // e.g., "categories/[id]" becomes "CategoriesDynamicId"
      // Remove brackets from parent parts for component naming
      const parentName = parentParts
        .map((part) => {
          // Remove brackets from directory names
          const cleanPart = part.replace(/^\[(.+)\]$/, "$1");
          return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
        })
        .join("");
      component =
        parentName +
        "Dynamic" +
        paramName.charAt(0).toUpperCase() +
        paramName.slice(1);
    } else {
      // e.g., "[id]" becomes "DynamicId"
      component =
        "Dynamic" + paramName.charAt(0).toUpperCase() + paramName.slice(1);
    }
  } else if (name === "index") {
    // For index files, use the parent directory name
    const parentParts = pathParts.slice(0, -1); // All parts except "index"
    if (parentParts.length > 0) {
      component =
        parentParts
          .map((part) => {
            // Remove brackets from directory names
            const cleanPart = part.replace(/^\[(.+)\]$/, "$1");
            return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
          })
          .join("") + "Index";
    } else {
      component = "Home"; // Root index
    }
  } else {
    // For regular files, include parent path if nested
    const parentParts = pathParts.slice(0, -1);
    if (parentParts.length > 0) {
      const parentName = parentParts
        .map((part) => {
          // Remove brackets from directory names
          const cleanPart = part.replace(/^\[(.+)\]$/, "$1");
          return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
        })
        .join("");
      component = parentName + name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      component = name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  // Create import-safe file path (for the actual file import)
  const importPath = relativePath;

  return { name, ext, relativePath, route, component, importPath };
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
