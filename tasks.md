# Migration from Streamlit to Next.js/React - Task List

## HIGH PRIORITY (Core MVP)

### Project Foundation
- [x] TASK-001: Initialize Next.js project with TypeScript
- [x] TASK-002: Set up project structure (components, pages, styles, utils)
- [x] TASK-003: Configure ESLint, Prettier, and other dev tools
- [x] TASK-004: Install required dependencies (React, Next.js, charting libraries, etc.)

### Basic Data Fetching
- [x] TASK-005: Create API routes in Next.js for data fetching (replace Google Sheets integration)
- [x] TASK-006: Convert Google Sheets authentication to secure API keys/tokens
- [x] TASK-007: Create basic data transformation utilities (pandas operations to JavaScript)

### Core Layout & Navigation
- [x] TASK-008: Create main dashboard layout component
- [x] TASK-009: Convert sidebar filters to React components (date picker, multiselect)
- [x] TASK-010: Create KPI cards component
- [x] TASK-011: Implement chart selection buttons grid

### Essential Charts
- [x] TASK-012: Set up charting library (Recharts, Chart.js, or Plotly React)
- [x] TASK-013: Create Wildlife Incidents bar chart component
- [x] TASK-014: Create Taluka Distribution pie chart component
- [x] TASK-015: Create Raw Data Table component

### Basic State Management
- [x] TASK-016: Implement global state for filters (date range, wildlife types, talukas)
- [x] TASK-017: Add state for active chart selection
- [x] TASK-018: Create basic data filtering logic (replace pandas filtering)

## MEDIUM PRIORITY (Enhanced Features)

### Advanced Charts
- [x] TASK-019: Create Incident Types grouped bar chart component
- [x] TASK-020: Create Incident Frequency bar chart component
- [x] TASK-021: Create Top Talukas horizontal bar chart component
- [x] TASK-022: Create Monthly Trend line chart component
- [x] TASK-023: Create Top Villages horizontal bar chart component
- [x] TASK-024: Create Frequent Callers horizontal bar chart component
- [x] TASK-025: Create Hourly Distribution histogram component

### Complex Charts
- [x] TASK-026: Create Repeat Taluka line chart component
- [x] TASK-027: Create Wildlife Timeline line chart component
- [x] TASK-028: Create Monthly by Taluka line chart component
- [x] TASK-029: Create Heatmap component (replace matplotlib with canvas/SVG solution)

### Advanced State Features
- [ ] TASK-030: Implement auto-refresh functionality (replace st_autorefresh)
- [ ] TASK-031: Create data fetching hooks (useSWR or React Query)

### Enhanced Data Handling
- [ ] TASK-032: Implement data processing functions (grouping, counting, date operations)
- [ ] TASK-033: Add error handling for data loading
- [ ] TASK-034: Create loading states and skeletons

### UI Polish
- [ ] TASK-035: Convert custom CSS to React-friendly solution
- [ ] TASK-036: Implement responsive design (replace wide layout)
- [ ] TASK-037: Add Marathi font support (Devanagari)
- [ ] TASK-038: Style buttons and interactive elements
- [ ] TASK-039: Add loading animations and transitions

## LOW PRIORITY (Performance & Quality)

### Performance Optimization
- [ ] TASK-040: Implement data caching and refresh logic (replace @st.cache_data)
- [ ] TASK-041: Optimize bundle size and performance

### Testing
- [ ] TASK-042: Write unit tests for components
- [ ] TASK-043: Add integration tests for data flow
- [ ] TASK-044: Test cross-browser compatibility
- [ ] TASK-045: Add error boundaries

### Production Deployment
- [ ] TASK-046: Configure build settings for production
- [ ] TASK-047: Set up environment variables for API keys
- [ ] TASK-048: Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] TASK-049: Configure domain and SSL
- [ ] TASK-050: Set up monitoring and analytics
