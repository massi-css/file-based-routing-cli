import { watch } from "chokidar";
import chalk from "chalk";
import { promises as fs } from "fs";
import {
  writeFile,
  parsePagePath,
  checkDirectoryExists,
  detectProjectType,
  getFileExtension,
  isReactFile,
} from "../utils/fileSystem.js";
import { updateRouting } from "../utils/routeManager.js";
import { componentTemplate } from "../templates/index.js";

export async function watchPages() {
  const pages = [];

  // Detect project type for dynamic file extensions
  const { isTypeScript, useJSX } = await detectProjectType();
  const fileExtension = getFileExtension(isTypeScript, useJSX);

  // Determine which pages directory exists
  const srcPagesExists = await checkDirectoryExists("src/pages");
  const rootPagesExists = await checkDirectoryExists("pages");

  const pagesPath = srcPagesExists ? "src/pages" : "pages";
  const routingPath = pagesPath.startsWith("src/")
    ? `src/routing${fileExtension}`
    : `routing${fileExtension}`;

  console.log(
    chalk.blue(`Watching for file changes in ${pagesPath} directory...`)
  );
  const watcher = watch(`${pagesPath}`, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });
  watcher
    .on("add", async (path) => {
      await handleFileAdd(path, pages, routingPath, pagesPath, fileExtension);
    })
    .on("unlink", async (path) => {
      await handleFileRemove(
        path,
        pages,
        routingPath,
        pagesPath,
        fileExtension
      );
    })
    .on("error", (error) => {
      console.error(chalk.red(`Watcher error: ${error}`));
    })
    .on("ready", () => {
      console.log(
        chalk.green(
          "File watcher is ready!"
        )
      );
    });
  // Keep the process alive
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\nStopping file watcher..."));
    watcher.close();
    process.exit(0);
  });
}

async function handleFileAdd(
  path,
  pages,
  routingPath,
  pagesPath,
  fileExtension
) {
  // Only process React files (.jsx, .tsx, .js, .ts)
  if (!isReactFile(path)) {
    return;
  }
  const { name, ext, relativePath, route, component, importPath } =
    parsePagePath(path);
  try {
    const stats = await fs.stat(path);
    if (stats.size === 0) {
      await writeFile(path, componentTemplate(component, route));
    }

    pages.push({
      file: relativePath + ext,
      component,
      route,
      importPath: relativePath, // Use relativePath without extension for imports
    });
    await updateRouting(pages, routingPath, pagesPath);
    console.log(chalk.green(`Added route: ${route} → ${component}`));
  } catch (error) {
    console.error(chalk.red("Error handling file addition:"), error);
  }
}

async function handleFileRemove(
  path,
  pages,
  routingPath,
  pagesPath,
  fileExtension
) {
  // Only process React files (.jsx, .tsx, .js, .ts)
  if (!isReactFile(path)) {
    return;
  }

  const { name, relativePath, component } = parsePagePath(path);
  const index = pages.findIndex((p) => p.component === component);
  if (index !== -1) {
    const removedPage = pages[index];
    pages.splice(index, 1);

    await updateRouting(pages, routingPath, pagesPath);
    console.log(
      chalk.yellow(`Removed route: ${removedPage.route} → ${component}`)
    );
  }
}
