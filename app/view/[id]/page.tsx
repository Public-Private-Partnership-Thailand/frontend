import ViewProjectClient from './ViewProjectClient'
import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Project Details | Thailand PPP Platform',
}

// Server component that renders the client component
export default function ViewProjectPage() {
  return <ViewProjectClient />
}