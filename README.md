# Aethelgard Voice frontend

The frontend is a React, TypeScript, and Vite application for creating and
joining open-ended polls. Product behavior and user experience are defined in
[`DESIGN.md`](./DESIGN.md).

## Commands

```bash
npm install
npm run dev
```

The development server defaults to `http://localhost:5173`.

```bash
npm run build
npm run lint
npm run test
```

## Styling approach

Tailwind CSS v4 is the styling standard for this frontend. It is installed with
`@tailwindcss/vite`, registered alongside the React Vite plugin, and imported
from `src/index.css`. Semantic theme variables provide the product palette;
use their utilities for layout, typography, responsive behavior, focus states,
and reduced-motion behavior. Do not repeat raw design values in component
markup.

Keep authored CSS limited to global base rules and decorative pseudo-elements
or illustrations that cannot be expressed cleanly with utilities. Refer to
the [official Tailwind CSS Vite guide](https://tailwindcss.com/docs/installation/using-vite)
when changing the integration.
