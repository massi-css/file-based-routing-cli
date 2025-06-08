import ora from "ora";
import {
  ensureDirectory,
  writeFile,
  findFile,
  readFile,
  checkDirectoryExists,
} from "../utils/fileSystem.js";
import { promises as fs } from "fs";
import { routingTemplate, appTemplate } from "../templates/index.js";

export async function initializeProject() {
  const spinner = ora("Initializing project...").start();
  try {
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

    // Create routing file in the appropriate location
    const routingPath = pagesPath.startsWith("src/")
      ? "src/routing.jsx"
      : "routing.jsx";
    await writeFile(routingPath, routingTemplate);

    // Modify App.jsx/tsx
    const appFile = await findFile(["src/App.jsx", "src/App.tsx"]);
    if (appFile) {
      const appContent = await readFile(appFile);
      if (!appContent.includes("BrowserRouter")) {
        await writeFile(appFile, appTemplate(appContent));
      }
    }

    // Install dependencies
    await installDependencies(spinner);

    spinner.succeed("Project initialized successfully!");
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
    }
  } catch (error) {
    console.error("Error installing dependencies:", error);
  }
}
