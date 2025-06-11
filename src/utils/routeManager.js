import { writeFile } from "./fileSystem.js";
import { relative, dirname } from "path";

export async function updateRouting(pages, routingPath, pagesDir) {
  const content = generateRoutingContent(pages, routingPath, pagesDir);
  await writeFile(routingPath, content);
}

function generateRoutingContent(pages, routingPath, pagesDir) {
  const routingDir = dirname(routingPath);
  const relativePagesPath = relative(routingDir, pagesDir).replace(/\\/g, "/");
  const pagesImportPath = relativePagesPath.startsWith(".")
    ? relativePagesPath
    : `./${relativePagesPath}`;
  return `import { Routes, Route } from 'react-router-dom';
${pages
  .map((page) => {
    // Use the importPath which handles bracket notation
    const importPath =
      page.importPath || page.file.replace(/\.(jsx?|tsx?)$/, "");
    const cleanImportPath = importPath.replace(/\\/g, "/");

    // For paths with brackets, we need to wrap the entire import path in quotes
    // But since ES6 imports always need quotes anyway, we just ensure proper escaping
    const finalImportPath = `${pagesImportPath}/${cleanImportPath}`;

    return `import ${page.component} from '${finalImportPath}';`;
  })
  .join("\n")}

export default function AppRoutes() {
  return (
    <Routes>
      ${pages
        .map(
          (page) =>
            `<Route path="${page.route}" element={<${page.component} />} />`
        )
        .join("\n      ")}
    </Routes>
  );
}`;
}
