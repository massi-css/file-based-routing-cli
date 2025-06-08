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

  // Debug: Check current directory
  console.log(chalk.gray(`Current working directory: ${process.cwd()}`));

  // Detect project type for dynamic file extensions
  const { isTypeScript, useJSX } = await detectProjectType();
  const fileExtension = getFileExtension(isTypeScript, useJSX);

  console.log(
    chalk.gray(
      `Detected ${
        isTypeScript ? "TypeScript" : "JavaScript"
      } project with ${fileExtension} files`
    )
  );

  // Determine which pages directory exists
  const srcPagesExists = await checkDirectoryExists("src/pages");
  const rootPagesExists = await checkDirectoryExists("pages");

  console.log(chalk.gray(`src/pages exists: ${srcPagesExists}`));
  console.log(chalk.gray(`root pages exists: ${rootPagesExists}`));

  const pagesPath = srcPagesExists ? "src/pages" : "pages";
  const routingPath = pagesPath.startsWith("src/")
    ? `src/routing${fileExtension}`
    : `routing${fileExtension}`;

  console.log(
    chalk.blue(`Watching for file changes in ${pagesPath} directory...`)
  );
  console.log(chalk.gray(`Using routing file: ${routingPath}`));
  console.log(chalk.gray(`Watch pattern: ${pagesPath}/**/*`));
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
      console.log(chalk.yellow(`File added: ${path}`));
      await handleFileAdd(path, pages, routingPath, pagesPath, fileExtension);
    })
    .on("unlink", async (path) => {
      console.log(chalk.yellow(`File removed: ${path}`));
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
      console.log(chalk.green("Watcher is ready and watching for changes"));
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
    console.log(chalk.cyan(`Processing file: ${path}`));
    console.log(chalk.cyan(`Component: ${component}, Route: ${route}`));
    const stats = await fs.stat(path);
    if (stats.size === 0) {
      console.log(chalk.cyan(`File is empty, creating component template...`));
      await writeFile(path, componentTemplate(component, route));
    }

    pages.push({
      file: relativePath + ext,
      component,
      route,
      importPath: relativePath, // Use relativePath without extension for imports
    });
    console.log(chalk.cyan(`Updating routing file: ${routingPath}`));
    await updateRouting(pages, routingPath, pagesPath);
    console.log(chalk.green(`Added route: ${route} -> ${component}`));
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

    console.log(
      chalk.cyan(`Removing route: ${removedPage.route} -> ${component}`)
    );
    console.log(chalk.cyan(`Updating routing file: ${routingPath}`));

    await updateRouting(pages, routingPath, pagesPath);
    console.log(
      chalk.yellow(`Removed route: ${removedPage.route} -> ${component}`)
    );
  }
}
