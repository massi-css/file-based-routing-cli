export const componentTemplate = (
  componentName
) => `export default function ${componentName}() {
  return (
    <div>
      <h1>${componentName} Page</h1>
    </div>
  );
}
`;

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

export const appTemplate = (
  existingContent
) => `import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routing';

${existingContent.replace(
  "export default function App() {",
  "export default function App() {\n  return (\n    <BrowserRouter>\n      <AppRoutes />\n    </BrowserRouter>\n  );\n}"
)}`;
