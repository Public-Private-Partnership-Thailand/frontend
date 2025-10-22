# Project Management Web Application

A modern, responsive web application built with Next.js 14, TypeScript, and Tailwind CSS for managing complex project data structures.

## Features

- **Modern UI/UX**: Clean, intuitive interface with responsive design
- **Form Management**: Comprehensive forms with validation using React Hook Form
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Type Safety**: Full TypeScript support with proper type definitions
- **Mock API**: Complete API routes for testing and development
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Project Structure

The application handles complex project data including:

- Basic project information (title, description, status, type)
- Budget details with breakdowns and financing arrangements
- Project periods (implementation, completion, maintenance, decommissioning)
- Parties and stakeholders with identifier information
- Additional metadata (locations, sectors, classifications, forecasts, metrics, milestones)

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: React DatePicker

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get a specific project
- `PUT /api/projects/[id]` - Update a specific project
- `DELETE /api/projects/[id]` - Delete a specific project

## Form Sections

The application includes organized form sections:

1. **Basic Information**: Title, description, status, type, purpose, public authority
2. **Budget Information**: Budget details, amounts, breakdowns, financing arrangements
3. **Project Periods**: Main period, implementation, completion, maintenance, decommissioning
4. **Parties & Stakeholders**: Project parties with identifier information
5. **Additional Information**: Identifiers, locations, sectors, classifications, forecasts, metrics, milestones, completion details

## Design Features

- **Card-based Layout**: Clean, organized information display
- **Progressive Disclosure**: Complex forms broken into manageable sections
- **Dynamic Arrays**: Add/remove items for lists (parties, locations, etc.)
- **Status Indicators**: Visual status badges with color coding
- **Responsive Grid**: Adapts to different screen sizes
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error messages and validation

## Mock Data

The application includes sample projects to demonstrate functionality:

1. **Digital Infrastructure Development Project** - Active infrastructure project
2. **Smart City Transportation System** - Planning phase smart city initiative

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User authentication and authorization
- File upload for documents
- Advanced search and filtering
- Export functionality (PDF, Excel)
- Real-time updates
- Project templates
- Dashboard analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
