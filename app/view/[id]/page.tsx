import ViewProjectClient from './ViewProjectClient'
import type { Metadata } from 'next'

// Dynamic route - no need for generateStaticParams when using dynamic rendering
// This page will be rendered on-demand for any project ID

export const metadata: Metadata = {
  title: 'Project Details | Thailand PPP Platform',
}

// Server component that renders the client component
export default function ViewProjectPage() {
  return <ViewProjectClient />
}