import { watch } from "chokidar";
import chalk from "chalk";
import {
  writeFile,
  parsePagePath,
  checkDirectoryExists,
} from "../utils/fileSystem.js";
import { updateRouting } from "../utils/routeManager.js";
import { componentTemplate } from "../templates/index.js";

export async function watchPages() {
  const pages = [];
  // Determine which pages directory exists
  const pagesPath = (await checkDirectoryExists("src/pages"))
    ? "src/pages"
    : "pages";
  const watcher = watch(`${pagesPath}/**/*.{jsx,tsx}`);
  console.log(
    chalk.blue(`Watching for file changes in ${pagesPath} directory...`)
  );

  watcher
    .on("add", async (path) => {
      await handleFileAdd(path, pages);
    })
    .on("unlink", async (path) => {
      await handleFileRemove(path, pages);
    });
}

async function handleFileAdd(path, pages) {
  const { name, ext, relativePath, route, component } = parsePagePath(path);

  try {
    const stats = await fs.stat(path);
    if (stats.size === 0) {
      await writeFile(path, componentTemplate(component));
    }

    pages.push({ file: relativePath + ext, component, route });
    await updateRouting(pages, "src/routing.jsx");
    console.log(chalk.green(`Added route: ${route} -> ${component}`));
  } catch (error) {
    console.error("Error handling file addition:", error);
  }
}

async function handleFileRemove(path, pages) {
  const { name } = parsePagePath(path);
  const index = pages.findIndex((p) => p.component === name);
  if (index !== -1) {
    pages.splice(index, 1);
    await updateRouting(pages, "src/routing.jsx");
    console.log(chalk.yellow(`Removed route: ${name}`));
  }
}
