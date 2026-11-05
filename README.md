# Tempo Sticky Notes

React + TypeScript application built with Vite.

## Local development

Use Node.js 24 (see `.nvmrc`) and npm.

```sh
nvm install
nvm use
npm install
npm run dev
```

## Checks and production build

```sh
npm run typecheck
npm run build
npm run preview
```

The production build is written to `dist/`. The build command checks TypeScript
before bundling. Vite and its official React plugin handle TypeScript and JSX
transforms, along with React Fast Refresh during development.
