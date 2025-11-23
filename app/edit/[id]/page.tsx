import EditProjectClient from './EditProjectClient'

// Dynamic route - no need for generateStaticParams when using dynamic rendering
// This page will be rendered on-demand for any project ID

// Server component that renders the client component
export default function EditProjectPage() {
  return <EditProjectClient />
}