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
  relativePath = relativePath.replace(ext, "");
  let route;
  if (name === "index") {
    const pathParts = relativePath.split("/");
    pathParts.pop(); // Remove the "index" part
    const routeParts = pathParts.filter((part) => !part.match(/^\(.+\)$/));
    route = "/" + routeParts.join("/");
    if (route === "/") {
      route = "/";
    } else if (route === "//") {
      route = "/";
    }
  } else {
    const routePath = relativePath
      .split("/")
      .filter((segment) => !segment.match(/^\(.+\)$/)) 
      .map((segment) => {
        if (segment.match(/^\[.+\]$/)) {
          return segment.replace(/^\[(.+)\]$/, ":$1");
        }
        return segment;
      })
      .join("/");
    route = "/" + routePath;
  }
  let component;

  const pathParts = relativePath.split("/");
  if (name.match(/^\[.+\]$/)) {
    const paramName = name.replace(/^\[(.+)\]$/, "$1");
    const parentParts = pathParts.slice(0, -1); 
    if (parentParts.length > 0) {
      const parentName = parentParts
        .map((part) => {
          let cleanPart = part.replace(/^\[(.+)\]$/, "$1");
          cleanPart = cleanPart.replace(/^\((.+)\)$/, "$1");
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
            // Remove brackets from directory names like [id]
            let cleanPart = part.replace(/^\[(.+)\]$/, "$1");
            // Remove parentheses from route groups like (auth)
            cleanPart = cleanPart.replace(/^\((.+)\)$/, "$1");
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
          // Remove brackets from directory names like [id]
          let cleanPart = part.replace(/^\[(.+)\]$/, "$1");
          // Remove parentheses from route groups like (auth)
          cleanPart = cleanPart.replace(/^\((.+)\)$/, "$1");
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
