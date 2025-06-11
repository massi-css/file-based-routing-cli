# File-Based Routing CLI for React

A command-line tool that enables file-based routing in React projects, similar to Next.js routing but for standard React applications. This tool automatically generates and manages routes based on your file structure in the `pages` directory.

## Features

### 🚀 Quick Setup

- Automatically installs and configures `react-router-dom`
- Sets up the necessary routing infrastructure
- Modifies your `App.jsx/tsx` to include routing configuration
- Creates a `pages` directory for your route components
- Supports both JavaScript and TypeScript projects

### 📁 Advanced File-Based Routing

- Creates routes based on file names in the `pages` directory
- Supports dynamic routes with bracket notation (`[id].jsx`)
- Route groups with parentheses notation (`(auth)/login.jsx`)
- Index routes for clean directory-based routing
- Automatically generates route components with proper naming
- Real-time file watching and route updates

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
│   ├── index.jsx           → /
│   ├── about.jsx           → /about
│   ├── contact.jsx         → /contact
│   ├── (auth)/
│   │   ├── login.jsx       → /login
│   │   └── register.jsx    → /register
│   ├── (dashboard)/
│   │   ├── settings.jsx    → /settings
│   │   └── profile.jsx     → /profile
│   └── blog/
│       ├── index.jsx       → /blog
│       └── [id].jsx        → /blog/:id
```

## Routing Features

### 📁 Dynamic Routes

Use bracket notation for dynamic route parameters:

- `pages/blog/[id].jsx` → `/blog/:id`
- `pages/user/[userId]/posts/[postId].jsx` → `/user/:userId/posts/:postId`

Dynamic route components automatically include `useParams` hook and parameter display:

```jsx
// Generated for pages/blog/[id].jsx
import { useParams } from "react-router-dom";

export default function BlogDynamicId() {
  const params = useParams();
  const id = params.id;

  return (
    <div>
      <h1>BlogDynamicId Page</h1>
      <div>
        <h2>Route Parameters:</h2>
        <p>
          <strong>id:</strong> {id}
        </p>
      </div>
    </div>
  );
}
```

### 📂 Route Groups

Use parentheses to group routes without affecting the URL structure:

- `pages/(auth)/login.jsx` → `/login` (not `/auth/login`)
- `pages/(dashboard)/settings.jsx` → `/settings` (not `/dashboard/settings`)
- `pages/(marketing)/about.jsx` → `/about` (not `/marketing/about`)

Route groups are perfect for organizing related pages while keeping clean URLs.

### 🏠 Index Routes

Index files create routes for their parent directory:

- `pages/index.jsx` → `/` (homepage)
- `pages/blog/index.jsx` → `/blog`
- `pages/(auth)/index.jsx` → `/` (route groups are ignored)
- `pages/(dashboard)/settings/index.jsx` → `/settings`

## Component Generation

When you create a new file in the `pages` directory, the CLI automatically generates a component with this structure:

### Component Naming

The CLI generates unique component names based on the file path:

- `pages/about.jsx` → `About`
- `pages/blog/index.jsx` → `BlogIndex`
- `pages/(auth)/login.jsx` → `AuthLogin`
- `pages/blog/[id].jsx` → `BlogDynamicId`
- `pages/(dashboard)/user/[id].jsx` → `DashboardUserDynamicId`

## Requirements

- Node.js 14 or higher
- React project using npm
- React Router DOM v6+

## License

MIT
