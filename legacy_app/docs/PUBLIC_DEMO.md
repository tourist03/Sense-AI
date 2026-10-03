# Sense.AI public portfolio demo

The tourist03 copy preserves the upstream project and adds an isolated public demo at https://tourist03.github.io/Sense-AI/. Active application source remains in `legacy_app/`; the original FastAPI server, source catalog, scheduler and API paths are unchanged.

The demo reuses the actual Sampark React interface. A separate entry uses hash routing for GitHub Pages, local abstract SVG artwork, fictional news and research fixtures, and a demo-only API transport. A persistent banner and a source-information page label the content as sample data. No real user data, runtime JSON, private content, credentials, model weights or internal endpoints are included in the deployment.

Supported demo interactions include browsing, search/filtering, topic preferences, dossiers, follow/hide, reversible reactions, research cards, and report editing with browser-local draft history and HTML export. AI text is explicitly prewritten. Live crawls, private service requests, privileged logins and server export formats return a clear unavailable message. Telemetry is discarded.

From `legacy_app/news-ui` with Node 24:

```sh
npm ci
npm test
npm run build
npm run build:demo
npm run preview:demo
```

The preview is at http://127.0.0.1:4175/Sense-AI/. `build:demo` writes `demo-dist/`. The Pages workflow uploads only that directory. The full app build still writes `dist/` for the Python/portable deployment.

Sample saves, hidden items, reactions, preferences, watchlist, and up to five report drafts use the `sense-ai-public-demo-v1` browser storage key. Reset demo clears that key. These browser actions do not affect the upstream server or any other viewer. A full deployment still requires Python, one Uvicorn worker, persistent runtime storage, separately installed model weights and private configuration as documented in the existing deployment guide.

This fork and its portfolio publication are explicitly requested by the user; their tourist03 destination takes precedence over the original project's upstream-only Git instructions. Existing upstream commits retain their authorship. Uncommitted work from the original local checkout is not included.
