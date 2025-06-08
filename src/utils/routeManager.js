import { writeFile } from "./fileSystem.js";
import { relative, dirname } from "path";

export async function updateRouting(pages, routingPath, pagesDir) {
  const content = generateRoutingContent(pages, routingPath, pagesDir);
  await writeFile(routingPath, content);
}

function generateRoutingContent(pages, routingPath, pagesDir) {
  // Calculate relative path from routing file to pages directory
  const routingDir = dirname(routingPath);
  const relativePagesPath = relative(routingDir, pagesDir).replace(/\\/g, "/");
  const pagesImportPath = relativePagesPath.startsWith(".")
    ? relativePagesPath
    : `./${relativePagesPath}`;

  return `import { Routes, Route } from 'react-router-dom';
${pages
  .map((page) => {
    // Clean up the file path for import
    const cleanPath = page.file.replace(/\\/g, "/");
    return `import ${page.component} from '${pagesImportPath}/${cleanPath}';`;
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
