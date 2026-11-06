# Tempo Sticky Notes

Desktop sticky notes app built with React, TypeScript and Vite.

[Live demo](https://den-logo.github.io/sticky-notes/)

## Run

Requires Node.js 24 and npm. With nvm:

```sh
nvm install
nvm use
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The build checks TypeScript and writes the production files to `dist/`.

## Architecture

Components handle the board and notes; hooks handle dragging and resizing.
Zustand stores note data, while temporary edits stay local until committed.
Text is also committed when the page is hidden. Components use CSS Modules,
with shared design tokens in global CSS. Icons, UI strings and storage utilities
live in `src/libs`.

The store receives a `NotesApi` dependency. Its current asynchronous adapter
uses localStorage and validates saved data before loading it. A save queue writes
changes in order, keeping the latest waiting snapshot. Errors offer Retry or an
explicit option to start a new board when loading fails. An HTTP adapter can
replace local storage without changing components. Notes stay in the same browser
and are not synchronized between tabs.
