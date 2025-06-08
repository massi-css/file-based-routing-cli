import { writeFile } from "./fileSystem.js";

export async function updateRouting(pages, routingPath) {
  const content = generateRoutingContent(pages);
  await writeFile(routingPath, content);
}

function generateRoutingContent(pages) {
  return `import { Routes, Route } from 'react-router-dom';
${pages
  .map((page) => `import ${page.component} from '../pages/${page.file}';`)
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
