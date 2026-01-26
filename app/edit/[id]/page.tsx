import EditProjectClient from './EditProjectClient'
import { fetchProjectsFromAPI } from '@/lib/projectService'

// Generate static params for all projects at build time
export async function generateStaticParams() {
  try {
    const projects = await fetchProjectsFromAPI()
    return projects.map((project) => ({
      id: project.id,
    }))
  } catch (error) {
    console.error('Error fetching projects for static generation:', error)
    // Return empty array if fetch fails - pages will be generated dynamically if needed
    return []
  }
}

// Server component that renders the client component
export default function EditProjectPage() {
  return <EditProjectClient />
}