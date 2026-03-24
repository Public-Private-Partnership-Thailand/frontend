# Thailand Public-Private Partnership Platform

## Technology Stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **TanStack React Query** — server state for summary, info, and risk endpoints
- **Chart.js** + **react-chartjs-2** — bar, bubble, and other charts
- **React Leaflet** — Thailand project map
- **tippy.js** — tooltips (e.g. risk matrix OTP project links)
- **React Hook Form**, **Yup**, **dayjs**, **Papa Parse** (CSV), etc.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Configure the API base URL (and any auth secrets) in `.env` or `.env.local`. The app reads settings such as `NEXT_PUBLIC_*` / API URL via `app/configs/appConfig` (see `.env.example` if present).

3. **Run the dev server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Features

### Home (`/`)

- **Tabs**: *ภาพรวม* (overview) and *กลุ่มกิจการ* (sector) with distinct chart layouts.
- **Filters**: Ministry, business group, contract type, year range — applied via summary query params after *ค้นหา*.
- **Map & project lists**: Thailand map and project tables/cards driven by loaded data.
- **Charts (API-backed where noted)**: Projects by ministry (bar), ministry investment (bar), public-authority project counts (`countProjectGroupByPublicAuthority`), budget year investment, sector bubble chart (`sectorProjectValueBubble`), heat maps when data exists, etc. Some sections may still use mock data until the API exposes equivalent fields.

### Risk (`/risk`)

- General risk overview, category/phase matrix, heat maps, filters by risk source, Thailand OTP tooltips with project links.

### Projects (`/projects`)

- Advanced filtering, pagination, CSV export, responsive table, auth-gated create/edit where applicable.