# Thailand Public-Private Partnership Platform

A comprehensive web platform for managing and visualizing Thailand's Public-Private Partnership (PPP) projects.

## Features

### 🏠 Home Page
- **Hero Banner**: Eye-catching banner with call-to-action buttons
- **Interactive Thailand Map**: Leaflet-based map showing project locations with markers
- **Top 10 Projects Table**: Displays the highest budget projects with quick access to details
- **Additional Project Cards**: Grid view of remaining projects

### 📊 Projects Dashboard
- **Statistics Cards**: Total projects, investment, active/completed counts
- **Interactive Charts**: 
  - Bar chart showing projects by sector
  - Doughnut chart showing projects by status
  - Line chart showing investment trends over time
- **Recent Projects Table**: Latest projects with key metrics

### 📋 Projects Page
- **Advanced Filtering**: Filter by sector, status, location, and search terms
- **Pagination**: 20 projects per page with navigation controls
- **CSV Export**: Export filtered data to CSV format
- **Responsive Table**: Full project details with action buttons
- **Authentication-based Actions**: Create/Edit buttons only visible when signed in

### 🔐 Authentication System
- **Mock Authentication**: Demo accounts for testing
- **Sign In/Sign Out**: Full authentication flow
- **Protected Routes**: Create project functionality requires authentication
- **Demo Account**: `demo@ppp.go.th` / `demo123`

### 🌐 Multi-language Support
- **English & Thai**: Complete translations for all interface elements
- **Language Switcher**: Easy switching between languages
- **Context-aware**: Maintains language preference across pages

### 🗺️ Interactive Map
- **Thailand Focus**: Centered on Thailand with appropriate zoom level
- **Project Markers**: Clickable markers showing project details
- **Popup Information**: Project name, sector, status, and cost
- **Responsive Design**: Works on all screen sizes

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Interactive charts and visualizations
- **React Leaflet**: Interactive maps
- **Papa Parse**: CSV export functionality
- **React Hook Form**: Form management
- **Lucide React**: Icon library

## Project Structure

```
app/
├── layout.tsx          # Main layout with navigation and footer
├── page.tsx           # Home page with banner, map, and top projects
├── dashboard/         # Projects dashboard with charts
├── projects/          # All projects page with filters and pagination
├── about/            # About PPP information page
├── signin/           # Authentication page
├── create/           # Create new project (existing)
├── edit/[id]/        # Edit project (existing)
└── view/[id]/        # View project details (existing)

components/
├── ThailandMap.tsx    # Interactive Thailand map component
├── ProjectCard.tsx    # Project card component (existing)
├── LoadingSpinner.tsx # Loading component (existing)
└── LanguageSwitcher.tsx # Language switcher (existing)

lib/
├── AuthContext.tsx    # Authentication context and provider
├── LanguageContext.tsx # Language context (existing)
├── translations.ts    # Translation strings (updated)
└── projectService.ts # Project data service (existing)

data/
└── ppp-projects.ts    # Project data (existing)
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Demo Accounts

- **Demo User**: `demo@ppp.go.th` / `demo123`
- **Admin User**: `admin@ppp.go.th` / `demo123`
- **Regular User**: `user@ppp.go.th` / `demo123`

## Key Features Implemented

✅ **Project Branding**: Updated to Thailand PPP Platform  
✅ **Navigation Menu**: Home, Projects dropdown, About PPP, Sign In  
✅ **Footer**: Thailand government links and information  
✅ **Home Page**: Banner, Thailand map, top 10 projects table  
✅ **Dashboard**: Chart.js visualizations with project statistics  
✅ **Projects Page**: Table with pagination, filters, and CSV export  
✅ **Authentication**: Mock authentication system with demo accounts  
✅ **Multi-language**: English and Thai translations  
✅ **Interactive Map**: Leaflet map with Thailand focus and project markers  

## Data Source

The platform uses real Thailand PPP project data including:
- Transportation projects (railways, airports, ports)
- Infrastructure development
- Public services
- Project costs, timelines, and status information

## Future Enhancements

- Real authentication system integration
- Advanced analytics and reporting
- Project document management
- Real-time project updates
- Mobile application
- API integration with government systems

## License

This project is for demonstration purposes and uses public domain data from Thailand's PPP projects.