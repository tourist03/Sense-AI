# Sense.AI — news intelligence & editorial workspace

This tourist03 copy preserves the original project history and adds a public, browser-only portfolio demo. Active application code lives in [legacy_app](legacy_app/).

- [Open the sample-data demo](https://tourist03.github.io/Sense-AI/)
- [View Vineet Singh’s portfolio](https://tourist03.github.io/portfolio/)
- [Demo setup and limitations](legacy_app/docs/PUBLIC_DEMO.md)
- [Full Python / Windows deployment guide](legacy_app/CALLIOPE_AMBER_ORBIT.md)
- [Original repository](https://github.com/stark-craft/velvet-penguin-lantern)

The full application combines a shared news corpus, local semantic clustering and summaries, explainable personal briefings, research discovery, and editable editorial reports. The public demo uses the actual React interface with fictional sample data, prewritten AI text, and browser-local state. It does not connect to internal services or expose runtime records or model files.

---

The original root README follows as historical reference. Its older top-level application and profile-routing instructions are superseded by the active legacy_app code and project-memory instructions.

# newsScrapper

## Active legacy-compatible application

The current application—the FastAPI/Scrapy backend and Vite/React interface
validated on macOS and prepared for the Windows server—is in [`legacy_app/`](legacy_app/).
Use [`legacy_app/WINDOWS_SETUP.md`](legacy_app/WINDOWS_SETUP.md) for the Windows
installation and launch steps. Model weights, `.env`, generated briefings, and
user analytics are intentionally excluded from Git.

newsScrapper is a local-first AI news-intelligence workspace. It crawls the
configured Default and Broadcast publisher lists, clusters related coverage,
summarizes story groups, applies a learnable gatekeeper, and exposes dossiers,
editorial worklists, exports, feedback, and analytics through a profile-aware
frontend.

Start with [`NEWSSCRAPPER_WINDOWS_GUIDE.md`](NEWSSCRAPPER_WINDOWS_GUIDE.md).
It contains the exact Windows commands, secure corporate-certificate workflow,
model folders and hashes, source/IP/keyword locations, architecture, data flow,
troubleshooting, and acceptance checks.

## Repository layout

```text
app/, components/, lib/          Vinext/React frontend
backend/main.py                  API, preflight, pipeline, scheduler, training
backend/signalroom/              compatible internal Python package
backend/profiles/                Default/Broadcast keywords and thresholds
backend/sites/                   preserved source configurations
backend/model_weights/           ignored MiniLM/DistilBART destinations
backend/models/                  generated Gatekeeper artifacts
backend/runtime/                 generated JSON state and crawl artifacts
scripts/windows/                 doctor and safe Windows launch wrappers
deployment/                      portable single-laptop deployment assets
```

The active runtime store is JSON. Ordinary briefing/article history is retained
for 30 days; saved, under-review, and approved articles remain protected beyond
that window.

## Quick local checks

```powershell
npm ci
npm run typecheck
npm run lint
npm test
```

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe backend\main.py preflight --profile default --source techcrunch
.\.venv\Scripts\python.exe -m unittest discover -s backend\tests -v
```

Run the read-only Windows audit at any time:

```powershell
.\scripts\windows\doctor.ps1
```

Visible branding is centralized in `lib/brand.ts` and
`backend/signalroom/branding.py`. Internal `signalroom` identifiers and legacy
`SIGNALROOM_*` settings are retained for runtime and data compatibility.
