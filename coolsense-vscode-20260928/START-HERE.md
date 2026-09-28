# CoolSense SUSS — VS Code Setup

This archive contains the complete editable source for the CoolSense dashboard.
The dashboard currently uses the supplied hackathon sample readings and planning
assumptions. No API keys or private credentials are included.

## Requirements

- Visual Studio Code
- Node.js 22.13 or newer
- pnpm 11 (recommended)

## Run locally

1. Extract the ZIP file.
2. Open the extracted folder in Visual Studio Code.
3. Open **Terminal → New Terminal**.
4. Run:

```bash
corepack enable
pnpm install
pnpm dev
```

5. Open the local address printed in the terminal, normally
   `http://localhost:5173`.

If Corepack is unavailable, install pnpm first:

```bash
npm install --global pnpm
pnpm install
pnpm dev
```

## Important files

- `app/page.tsx` — dashboard content, sample data and savings calculations
- `app/globals.css` — complete visual design and responsive styling
- `app/layout.tsx` — page metadata
- `public/favicon.svg` — CoolSense icon
- `components/ui/` — reusable interface controls

## Create a production build

```bash
pnpm build
```

## Electrical-data status

The current version visualises the readings supplied for the hackathon:

- air-conditioning: approximately 18.0 kWh/day
- plug loads: approximately 6.0 kWh/day
- lighting: approximately 3.37 kWh/day
- observed occupancy: approximately 31 of 80 seats

The Ecovolt sandbox is read-only. The UI therefore labels savings and zone
allocation as modelled assumptions. Add a server-side API route before connecting
real Ecovolt credentials; never place an API key inside `app/page.tsx` or commit it
to Git.

## Suggested next development step

Replace the `hourlyData`, `categoryData` and `zones` arrays in `app/page.tsx`
with data returned by a server-side Ecovolt adapter. Keep a sample-data fallback
so the demonstration still works if the sandbox is unavailable.
