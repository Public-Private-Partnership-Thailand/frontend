import { fetchProjectsFromAPI } from '@/lib/projectService'
import ViewProjectClient from './ViewProjectClient'

// Generate static params for static export (server component)
export async function generateStaticParams() {
  try {
    const projects = await fetchProjectsFromAPI()
    return projects.map((project) => ({
      id: project.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Fallback: return some common project IDs from the sample data
    return [
      { id: '5' },
      { id: '6' },
      { id: '12' },
      { id: '15' },
      { id: '24' },
      { id: '25' },
      { id: '33' },
      { id: '41' },
      { id: '36' },
      { id: '3' }
    ]
  }
}

// Server component that renders the client component
export default function ViewProjectPage() {
  return <ViewProjectClient />
}