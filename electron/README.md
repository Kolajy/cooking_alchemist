# Culinary Alchemy — Electron

Desktop shell for the Vite web game (`web/`). Uses the same shared JSON bundle as other native clients (`npm run export-native`).

## Dev (hot reload)

From the repo root:

```bash
npm run electron:dev
```

Starts the Vite dev server and opens an Electron window pointed at `https://localhost:5173`.

## Production build

```bash
npm run electron:build
```

Builds the web client with relative asset paths, then packages a desktop app into `electron/out/`.

Unpackaged smoke test after building web assets only:

```bash
npm run pack --workspace @culinary-alchemy/electron
npm run start --workspace @culinary-alchemy/electron
```

## Notes

- Saves use renderer `localStorage` (same as the browser client).
- External links open in the system browser.
- The Rust egui client in `desktop/` remains the Steam-target native build; Electron is a lightweight web wrapper for desktop distribution and testing.
