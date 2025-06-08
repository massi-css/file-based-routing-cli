# File-Based Routing CLI for React

A command-line tool that enables file-based routing in React projects, similar to Next.js routing but for standard React applications. This tool automatically generates and manages routes based on your file structure in the `pages` directory.

## Features

### 🚀 Quick Setup

- Automatically installs and configures `react-router-dom`
- Sets up the necessary routing infrastructure
- Modifies your `App.jsx/tsx` to include routing configuration
- Creates a `pages` directory for your route components

### 📁 File-Based Routing

- Creates routes based on file names in the `pages` directory
- Supports both JavaScript and TypeScript (`.jsx` and `.tsx` files)
- Automatically generates route components with proper naming
- Handles index routes (`pages/index.jsx` → `/`)
- Updates routes automatically when files are added or removed

## Installation

You can install the package globally:

```bash
npm install -g file-based-routing-cli
```

Or use it directly with npx:

```bash
npx file-based-routing-cli [command]
```

## Usage

### Initialize Your Project

```bash
fbr init
```

This command:

1. Creates a `pages` directory
2. Installs `react-router-dom` if not present
3. Sets up the routing configuration
4. Modifies `App.jsx/tsx` to include the router

### Watch for Changes

```bash
fbr watch
```

This command:

1. Watches the `pages` directory for file changes
2. Automatically generates route components for new files
3. Updates the routing configuration when files are added or removed
4. Provides real-time feedback in the terminal

## File Structure Example

```
your-react-app/
├── src/
│   ├── App.jsx
│   └── routing.jsx (auto-generated)
├── pages/
│   ├── index.jsx      → /
│   ├── about.jsx      → /about
│   ├── contact.jsx    → /contact
│   └── blog/
│       ├── index.jsx  → /blog
│       └── [id].jsx   → /blog/:id
```

## Component Generation

When you create a new file in the `pages` directory, the CLI automatically generates a component with this structure:

```jsx
export default function About() {
  return (
    <div>
      <h1>About Page</h1>
    </div>
  );
}
```

## Requirements

- Node.js 14 or higher
- React project using npm
- React Router DOM v6+

## License

MIT
