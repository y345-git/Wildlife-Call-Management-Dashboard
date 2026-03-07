# Wildlife Call Management System

A comprehensive dashboard for visualizing and analyzing wildlife incident data to help forest departments and wildlife management teams make informed decisions.

## What This Project Does

This system provides interactive dashboards that transform raw wildlife incident data into actionable insights through:

- **Wildlife Distribution Analysis** - Identify which species are involved in most incidents
- **Geographic Hotspot Mapping** - Discover which talukas and villages need immediate attention
- **Temporal Pattern Recognition** - Understand when incidents occur most frequently (monthly, daily, hourly)
- **Incident Type Breakdown** - Analyze types of human-wildlife conflicts
- **Response Tracking** - Monitor frequent callers and repeat incident locations
- **Trend Analysis** - Track changes in incident patterns over time

## Why It Matters

Wildlife incident management teams can use these dashboards to:

- **Prioritize Resources** - Deploy teams to high-incident areas
- **Plan Interventions** - Schedule preventive measures during peak times
- **Track Effectiveness** - Monitor if interventions reduce repeat incidents
- **Generate Reports** - Export data for administrative reporting
- **Quick Decision Making** - Filter and analyze data in real-time

## Two Implementations Available

This repository provides two dashboard versions to suit different preferences:

### 🚀 **Main Branch** - Next.js Dashboard (Recommended)
Modern web application with dark/light themes, responsive design, and interactive Plotly charts.

### 🐍 **Python Branch** - Streamlit Dashboard  
Python-based dashboard with session management and familiar analytics workflow.

Both dashboards connect to the same Google Sheets data source and provide similar analytical capabilities.

## Quick Start

See **[SETUP.md](./SETUP.md)** for complete installation and configuration instructions.

## Repository Structure

- **main branch** - Contains Next.js/React dashboard
- **python branch** - Contains Streamlit/Python dashboard

Switch branches to access different implementations:
```bash
git checkout main    # Next.js dashboard
git checkout python  # Streamlit dashboard
```

## Technologies

**Next.js Dashboard:** Next.js 16, React 19, TypeScript, Tailwind CSS, Plotly.js  
**Streamlit Dashboard:** Python 3.x, Streamlit, Pandas, Plotly

## Support

For setup help or issues, please refer to [SETUP.md](./SETUP.md) or open an issue.
