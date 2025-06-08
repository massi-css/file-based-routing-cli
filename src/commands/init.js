import ora from "ora";
import {
  ensureDirectory,
  writeFile,
  findFile,
  readFile,
  checkDirectoryExists,
  detectProjectType,
  getFileExtension,
  findAppFile,
} from "../utils/fileSystem.js";
import { promises as fs } from "fs";
import { routingTemplate, appTemplate } from "../templates/index.js";
import chalk from "chalk";

export async function initializeProject() {
  const spinner = ora("Initializing project...").start();
  try {
    // Detect project type (TypeScript vs JavaScript)
    const { isTypeScript, useJSX } = await detectProjectType();
    const fileExtension = getFileExtension(isTypeScript, useJSX);

    spinner.text = `Detected ${
      isTypeScript ? "TypeScript" : "JavaScript"
    } project with ${fileExtension} files`;

    // Check if src directory exists
    let pagesPath = "src/pages";
    try {
      await fs.access("src");
      await ensureDirectory(pagesPath);
    } catch {
      // If src doesn't exist, create pages in root
      pagesPath = "pages";
      await ensureDirectory(pagesPath);
    }

    // Create routing file with appropriate extension
    const routingPath = pagesPath.startsWith("src/")
      ? `src/routing${fileExtension}`
      : `routing${fileExtension}`;
    await writeFile(routingPath, routingTemplate); // Modify App file
    const appFile = await findAppFile();
    if (appFile) {
      const appContent = await readFile(appFile);
      if (!appContent.includes("BrowserRouter")) {
        spinner.text = `Configuring routing in ${appFile}...`;
        const modifiedAppContent = appTemplate(appContent, fileExtension);
        await writeFile(appFile, modifiedAppContent);
        spinner.text = "Routing configuration complete";
      } else {
        spinner.text = "BrowserRouter already configured";
      }
    } else {
      spinner.warn(
        "No App file found - you may need to manually configure routing"
      );
    } // Install dependencies
    await installDependencies(spinner);

    spinner.succeed(
      ` Project initialized successfully! \n Run ${chalk.green(
        "fbr watch"
      )} to start monitoring file changes.`
    );
  } catch (error) {
    spinner.fail("Failed to initialize project");
    console.error(error);
  }
}

async function installDependencies(spinner) {
  try {
    const packageJson = JSON.parse(await readFile("package.json"));
    if (!packageJson.dependencies["react-router-dom"]) {
      spinner.text = "Installing react-router-dom...";
      const { exec } = await import("child_process");
      await new Promise((resolve, reject) => {
        exec("npm install react-router-dom", (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      spinner.text = "Dependencies installed";
    } else {
      spinner.text = "react-router-dom already installed";
    }
  } catch (error) {
    spinner.warn(
      "Could not install dependencies automatically. Please run 'npm install react-router-dom' manually."
    );
  }
}
