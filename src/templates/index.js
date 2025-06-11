export const componentTemplate = (componentName, routePath = "/") => {
  // Check if this is a dynamic route (contains :param)
  const isDynamicRoute = routePath.includes(":");

  if (isDynamicRoute) {
    // Extract parameter names from the route
    const params = routePath.match(/:([^/]+)/g) || [];
    const paramNames = params.map((param) => param.slice(1)); 

    return `// Route: ${routePath}
import { useParams } from 'react-router-dom';

export default function ${componentName}() {
  const params = useParams();
  ${paramNames.map((param) => `const ${param} = params.${param};`).join("\n  ")}

  return (
    <div>
      <h1>${componentName} Page</h1>
      <div>
        <h2>Route Parameters:</h2>
        ${paramNames
          .map((param) => `<p><strong>${param}:</strong> {${param}}</p>`)
          .join("\n        ")}
      </div>
    </div>
  );
}
`;
  } else {
    return `// Route: ${routePath}
export default function ${componentName}() {
  return (
    <div>
      <h1>${componentName} Page</h1>
    </div>
  );
}
`;
  }
};

export const routingTemplate = `import { Routes, Route } from 'react-router-dom';

// Auto-generated routes
export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes will be automatically added here */}
    </Routes>
  );
}
`;

export const appTemplate = (existingContent, fileExtension = ".jsx") => {
  // Determine routing import based on file extension
  const routingImport = `./routing${fileExtension}`;

  // Add imports at the top
  const imports = `import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '${routingImport}';
`;

  let modifiedContent = existingContent;

  // Simple approach: Find the App function and replace its content
  // Pattern 1: function App() { ... } (with proper brace counting)
  if (modifiedContent.includes("function App()")) {
    const functionStart = modifiedContent.indexOf("function App()");
    const braceStart = modifiedContent.indexOf("{", functionStart);
    let braceCount = 1;
    let braceEnd = braceStart + 1;

    while (braceCount > 0 && braceEnd < modifiedContent.length) {
      if (modifiedContent[braceEnd] === "{") braceCount++;
      if (modifiedContent[braceEnd] === "}") braceCount--;
      braceEnd++;
    }

    const before = modifiedContent.substring(0, braceStart + 1);
    const after = modifiedContent.substring(braceEnd - 1);

    modifiedContent =
      before +
      `
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
` +
      after;
  }
  // Pattern 2: const App = () => { ... }
  else if (modifiedContent.includes("const App = ()")) {
    const constStart = modifiedContent.indexOf("const App = ()");
    const braceStart = modifiedContent.indexOf("{", constStart);
    let braceCount = 1;
    let braceEnd = braceStart + 1;

    while (braceCount > 0 && braceEnd < modifiedContent.length) {
      if (modifiedContent[braceEnd] === "{") braceCount++;
      if (modifiedContent[braceEnd] === "}") braceCount--;
      braceEnd++;
    }

    const before = modifiedContent.substring(0, braceStart + 1);
    const after = modifiedContent.substring(braceEnd - 1);

    modifiedContent =
      before +
      `
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
` +
      after;
  }

  // Add imports at the beginning (after any existing imports)
  const lines = modifiedContent.split("\n");
  let insertIndex = 0;

  // Find where to insert imports (after existing imports)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("import ")) {
      insertIndex = i + 1;
    } else if (
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("import ")
    ) {
      break;
    }
  }

  lines.splice(insertIndex, 0, imports.trim());

  return lines.join("\n");
};
