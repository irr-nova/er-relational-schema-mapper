# Stand-alone ER Builder prototype

This directory is an independent Vite app for prototyping the ER diagram editor and mapping result view. It is separate from the active application in `../src/` and is not the app deployed by Render.

## Run locally

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm ci
npm run dev
```

The Vite dev server proxies `/api/map` to `http://127.0.0.1:8000/map`. Run the FastAPI service from `../../backend/mapping-engine/` in another terminal for schema mapping to work. Build this prototype with `npm run build`.

For the deployed product, work in `../src/er-builder/` and follow the repository's top-level `README.md`.
