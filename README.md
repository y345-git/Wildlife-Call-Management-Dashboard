# Wildlife Call Management Dashboard

A modern, interactive web dashboard for analyzing wildlife incident data with beautiful visualizations and real-time filtering. This application connects to Google Sheets to provide comprehensive insights into wildlife call patterns, response metrics, and geographic distribution.

## Configuration

Sensitive data (Google credentials and sheet ID) are now provided via
environment variables. The server action in `src/app/actions.ts` will
read the values from `process.env` and does **not** require files in the
repository. This makes it easier to deploy to platforms like Vercel,
Netlify, or Docker.

Set the following variables in a local `.env.local` file or through your
hosting provider's dashboard:

- `GOOGLE_CREDENTIALS_JSON` – the full JSON payload for a service account.
  You may supply the raw JSON string or a base64‑encoded version to avoid
  shell quoting issues.
- `GOOGLE_SHEET_ID` – the ID portion of the Google Sheets URL.

Other non‑secret settings continue to use existing `NEXT_PUBLIC_…`
variables (e.g. `NEXT_PUBLIC_LOCATION`, `NEXT_PUBLIC_DISTRICT_NAME`).

Example `.env.local`:

```bash
# service account credentials (single line or base64)
GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"..."}'
# spreadsheet to read
GOOGLE_SHEET_ID=1eey_a4t5EOL_nyEDau4FLvXomcnwgxWa5F3Rjd52OQg

# optional public settings
NEXT_PUBLIC_LOCATION=sangli
NEXT_PUBLIC_DISTRICT_NAME=Sangli
```

Files such as `credentials.json` and `sheetid.txt` are still ignored by
`.gitignore` and may be used for local reference, but they are no longer
required at runtime.

#### components.json (shadcn/ui configuration)
UI component library configuration.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Environment Variables

Create a `.env.local` file for optional environment-specific settings:

```bash
NEXT_PUBLIC_LOCATION=sangli
NEXT_PUBLIC_DISTRICT_NAME=Sangli
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd next-dashboard
npm install
```

### 2. Set up Google Sheets API

- Create a Google Cloud Project
- Enable the Google Sheets API
- Create a Service Account and download the JSON key
- Share your spreadsheet with the service account email

### 3. Configure Environment

Instead of writing files, export the data as environment variables. You
can keep them in a local `.env.local` for development, or configure them
through your hosting provider.

- `GOOGLE_CREDENTIALS_JSON` → paste the full JSON body from the service
  account key (or base64 encode it if you prefer).
- `GOOGLE_SHEET_ID` → copy the ID portion from your Google Sheets URL.

The application will automatically read these variables at runtime. See
`src/app/actions.ts` for details.

### 5. Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Repository Structure

This dashboard is part of a larger Wildlife Call Management System. The complete repository structure:

```
Wildlife Call Management/
├── next-dashboard/              # Modern React Dashboard (This Project)
│   ├── src/
│   │   ├── app/
│   │   │   ├── actions.ts       # Server actions for data fetching
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Main dashboard page
│   │   │   └── globals.css      # Global styles
│   │   ├── components/
│   │   │   ├── charts/          # All chart components
│   │   │   ├── filters/         # Filter components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── lib/                 # Utility functions
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Helper utilities
│   ├── public/                  # Static assets
│   ├── scripts/                 # Utility scripts
│   ├── (optional) credentials.json         # Google API credentials (ignored)
│   ├── (optional) sheetid.txt              # Google Sheet ID (ignored)
│   ├── components.json          # shadcn/ui config
│   ├── next.config.ts           # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS config
│   ├── tsconfig.json            # TypeScript config
│   └── package.json             # Node dependencies
│
├── Streamlit Dashboard/         # Python Streamlit Dashboard (Alternative)
│   └── session-wise-rendering/
│       ├── credentials.json     # Google API credentials
│       └── sheetid.txt          # Google Sheet ID
│
├── Contacts/                    # RFO/Vanpal Contact Information
│   ├── Kolhapur-RFO-Contacts.json
│   └── Sangli_RFO-Contacts.json
│
├── main.py                      # WhatsApp automation script
├── config.json                  # Main system configuration
├── credentials.json             # Google Sheets API credentials
├── image_credentials.json       # Google Drive API credentials
├── rfo_list.json                # RFO/Vanpal contact details
├── requirements.txt             # Python dependencies
├── package.json                 # Root package.json
├── README.md                    # Main project documentation
└── SETUP.md                     # Setup instructions
```

### Dashboard Options

The repository includes **two dashboard implementations**:

#### 1. Next.js Dashboard (Recommended - This Project)
- **Technology**: React 19 + Next.js 15 + TypeScript
- **Location**: `next-dashboard/`
- **Features**: 
  - Modern, responsive UI with dark/light themes
  - 13+ interactive Plotly charts
  - Real-time filtering and data export
  - Mobile-optimized design
  - Better performance and user experience
- **Setup**: See instructions below

#### 2. Streamlit Dashboard (Legacy/Alternative)
- **Technology**: Python + Streamlit
- **Location**: `Streamlit Dashboard/session-wise-rendering/`
- **Features**:
  - Quick Python-based visualization
  - Simple session-based rendering
  - Useful for rapid prototyping
- **Setup**: See main repository README

Both dashboards connect to the same Google Sheets data source.

## Features

### Data Visualization
- **Wildlife Species Analysis** - Distribution by species type
- **Geographic Distribution** - Taluka and village hotspot mapping
- **Temporal Trends** - Monthly, hourly, and timeline analysis
- **Incident Heatmaps** - Day/hour intensity visualization
- **Incident Types** - Breakdown of conflict categories
- **Response Metrics** - Caller frequency and repeat location tracking

### Interactive Features
- **Dark/Light Themes** - Toggle between color schemes
- **Responsive Design** - Mobile, tablet, and desktop support
- **Real-time Filtering** - Date range, location, type filters
- **Chart Interactions** - Zoom, pan, hover tooltips
- **Data Export** - Download filtered data as CSV
- **Dynamic Charts** - Select from 12+ visualization types

### Available Charts
1. Wildlife Incidents by Species
2. Taluka Distribution
3. Incident Types Breakdown
4. Incident Frequency Over Time
5. Top 10 Talukas by Incidents
6. Monthly Incident Trend
7. Repeat Taluka Analysis
8. Wildlife Incident Timeline
9. Monthly Incidents by Taluka
10. Top Villages
11. Frequent Callers Analysis
12. Hourly Distribution of Incidents
13. Incident Heatmap (Day/Hour)

## Technologies

- **Next.js 15** - React framework with App Router
- **React 19** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Plotly.js** - Interactive charting library
- **shadcn/ui** - Beautiful component library
- **Google Sheets API** - Live data source
- **Lucide React** - Icon library

## Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint code quality checks
```

## Accessing on Mobile

### Local Network Access

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for IPv4 Address (e.g., 192.168.1.100)

2. Start the development server with network access:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
   Or update `package.json`:
   ```json
   "dev": "next dev --hostname 0.0.0.0"
   ```

3. Access from mobile device on same Wi-Fi:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

### Public Access (ngrok)

For access outside your local network:

```bash
npx ngrok http 3000
```

Use the provided ngrok URL on any device.

## Multi-Location Support

To adapt this dashboard for different districts (Kolhapur, Satara, etc.):

1. Create `src/config/location.config.ts`
2. Define location-specific configurations
3. Use environment variables for active location
4. Update data fetching to filter by district

See implementation guide in source code comments.

## Troubleshooting

### Authentication Errors
- Verify the JSON stored in `GOOGLE_CREDENTIALS_JSON` is valid and properly formatted
- Check service account has Sheet access
- Ensure Google Sheets API is enabled

### Data Not Loading
- Verify your `GOOGLE_SHEET_ID` environment variable contains the correct ID
- Check Sheet permissions
- Validate data format in Google Sheet

### Build Errors
- Delete `.next` folder and rebuild
- Clear `node_modules` and reinstall
- Check Node.js version compatibility

### Mobile Access Issues
- Ensure devices on same Wi-Fi network
- Check firewall settings
- Verify IP address is correct

## Support

For detailed setup instructions, see [SETUP.md](../SETUP.md) in the repository root.

For issues or questions, open an issue on the GitHub repository.
