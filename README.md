# Job Tracker FrontEnd

A modern, feature-rich job application tracking web app built with React, TypeScript, Vite, and TailwindCSS.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Customization & Environment](#customization--environment)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)
- [License](#license)

---

## Overview

Job Tracker helps you manage and track your job applications, interviews, follow-ups, and more. The FrontEnd is designed for speed, usability, and extensibility, leveraging a modular component structure and a modern toolchain.

## Features

- User authentication (login/register)
- Dashboard with job statistics and charts
- Add, edit, and filter job applications
- Calendar view for interviews and follow-ups
- File upload for resumes and related documents
- Profile management
- Responsive design with reusable UI components

## Tech Stack

- **React** 19 + **TypeScript**
- **Vite** (development/build tool)
- **TailwindCSS** (utility-first CSS framework)
- **Appwrite** (backend integration)
- **React Router** (routing)
- **React Hook Form** & **Zod** (forms & validation)
- **Recharts** (charts)
- **date-fns** (date utilities)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

### Installation

```bash
cd FrontEnd
pnpm install
```

### Running the App

```bash
pnpm dev
```
The app will be available at `http://localhost:5173` by default.

### Building for Production

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Preview Production Build

```bash
pnpm preview
```

## Project Structure

```
FrontEnd/
├── src/
│   ├── components/         # UI and page components
│   │   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   │   ├── pages/          # Main pages (Dashboard, Jobs, Calendar, etc.)
│   │   ├── ui/             # Reusable UI elements (Button, Card, etc.)
│   │   └── HomePage/       # Home page components
│   ├── constants/          # App constants
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── assets/             # Static assets
│   ├── types/              # TypeScript types
│   ├── App.tsx             # App entry point
│   └── main.tsx            # React DOM bootstrap
├── public/                 # Static public files
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
└── package.json            # Project metadata & scripts
```

## Available Scripts
- `pnpm dev` – Start development server
- `pnpm build` – Build for production
- `pnpm lint` – Run ESLint
- `pnpm preview` – Preview production build

## Customization & Environment
- Update API endpoints and environment variables as needed for your backend (Appwrite or other).
- TailwindCSS and Vite are fully customizable via their respective config files.

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

Please follow the code style and write clear commit messages.

## Deployment

To deploy the FrontEnd, build the project and serve the static files from the `dist` directory. You can use services like Vercel, Netlify, or your own server.

Example (using Vercel CLI):
```bash
pnpm build
vercel --prod
```

Make sure to set up environment variables as needed for production.

## FAQ

**Q: Can I use npm or yarn instead of pnpm?**
A: Yes! Just replace `pnpm` with `npm` or `yarn` in the commands.

**Q: How do I connect to a different backend?**
A: Update the API endpoints and environment variables in your configuration files.

**Q: Where do I add new pages or components?**
A: Add new pages in `src/components/pages/` and reusable components in `src/components/ui/`.

## Troubleshooting

- If you encounter issues during installation, ensure you have the correct Node.js version.
- Delete `node_modules` and lock files, then reinstall dependencies if you face dependency errors.
- For TailwindCSS or Vite issues, check their documentation and config files.
- For Appwrite integration issues, verify your API keys and endpoints.

## Contact

For questions, suggestions, or support, please open an issue or contact the maintainer:
- **Name:** [Your Name Here]
- **Email:** [your.email@example.com]
- **GitHub:** [your-github-username]

## License

This project is licensed under the MIT License.
