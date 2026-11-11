# PostCraft AI: Free AI Image Studio & Multi-Channel Social Publisher

> **100% Free, Unlimited & Watermark-Free AI Image Generation** with automated multi-channel scheduling and publishing to **Pinterest** (via API v5 and bulk ZIP/CSV exports) from interactive prompts or live **Google Spreadsheets**.

---

## 🌟 Key Features

1. **Free & Unlimited AI Image Engine (Zero Watermarks)**:
   - High-fidelity generative models (**FLUX** & **SDXL**).
   - Strict anti-watermark negative parameters (`nologo=true` & exclusion filters).
   - **2:3 Pinterest Optimal Aspect Ratio** (`1000x1500px`), Square (`1:1`), Full Story (`9:16`), and Landscape (`16:9`).
   - Aesthetic style presets: *Aesthetic & Minimalist*, *8K Hyper-Realistic*, *Interior & Architecture*, *Dreamy Watercolor*, *Modern Infographic*, *Vintage Film Grain*, *Luxury Brand Editorial*, *Cyberpunk Neon*.

2. **Google Sheets Bulk Automation**:
   - Paste any Google Spreadsheet link set to *"Anyone with the link can view"* or upload a `.csv` file.
   - Intelligent column mapper (Prompt, Title, Description, Target Board, Destination Link, Scheduled Time).
   - Instant visual preview table with batch scheduling.

3. **Pluggable Multi-Channel Publisher Architecture**:
   - **Pinterest (Active Core Provider)**: Pinterest API v5 integration for boards, media uploads, and standard pin creation.
   - **Dry-Run Simulation Mode**: Test scheduling and workflows end-to-end even before registering a Pinterest Developer token.
   - **Universal Bulk Exporter**: Download ready-to-use `.zip` archives containing all generated images plus a formatted Pinterest Bulk Upload CSV.
   - **Pluggable Provider Registry**: Easily add future provider adapters (**Instagram**, **X/Twitter**, **TikTok**, **Facebook**) via the standard `IPublisherProvider` interface.

4. **Automated Background Scheduler**:
   - In-memory/local JSON queue engine.
   - Automatic execution of pending pins matching scheduled timestamps.
   - Manual *"Run Scheduler Now"* button for on-demand batch runs.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
pnpm dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Pages Overview
- **`/studio`**: Interactive AI Studio — type any prompt, pick an aesthetic preset, generate, and publish or download in 1 click.
- **`/sheets`**: Google Sheets Hub — paste your spreadsheet link, review extracted rows, and batch-schedule pins.
- **`/queue`**: Scheduled Queue — live dashboard showing pending, generated, and published pins with manual runner triggers.
- **`/gallery`**: Creations History — view and download all previously synthesized images.
- **`/settings`**: Providers & API — configure your Pinterest Bearer token and inspect provider adapter states.

---

## 📂 Project Architecture

```
postcraft-ai/
├── public/templates/sample-social-schedule.csv   # Downloadable sample CSV
├── data/db.json                                  # Zero-compilation local persistent storage
├── src/
│   ├── app/                                      # Next.js 14 App Router & API Endpoints
│   │   ├── api/ai/generate/                      # AI Image Synthesis API
│   │   ├── api/sheets/parse/                     # Google Sheets / CSV Parser API
│   │   ├── api/sheets/sync/                      # Bulk Queue Importer
│   │   ├── api/queue/                            # Queue CRUD & Runner
│   │   ├── api/export/zip/                       # Universal Bulk ZIP + CSV Exporter
│   │   ├── api/providers/pinterest/              # Pinterest Boards, Auth & Publish
│   │   ├── studio/                               # AI Creative Studio UI
│   │   ├── sheets/                               # Google Sheets Importer UI
│   │   ├── queue/                                # Queue Dashboard UI
│   │   ├── gallery/                              # Creations History UI
│   │   └── settings/                             # Provider Settings UI
│   ├── components/                               # Reusable Atomic & Layout Components
│   ├── lib/
│   │   ├── ai/                                   # Image Generator & Presets
│   │   ├── sheets/                               # CSV & Google Sheets Parsers
│   │   ├── scheduler/                            # Scheduling Service
│   │   └── providers/                            # Universal IPublisherProvider & Registry
│   └── types/                                    # Full TypeScript Type Definitions
```
