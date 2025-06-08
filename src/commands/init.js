import ora from "ora";
import {
  ensureDirectory,
  writeFile,
  findFile,
  readFile,
} from "../utils/fileSystem.js";
import { routingTemplate, appTemplate } from "../templates/index.js";

export async function initializeProject() {
  const spinner = ora("Initializing project...").start();
  try {
    // Create pages directory and routing file
    await ensureDirectory("pages");
    await writeFile("src/routing.jsx", routingTemplate);

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
