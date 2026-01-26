'use client'

export default function ProjectsPageSkeleton() {
  return (
    <div className="px-4 sm:px-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-9 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          
          {/* Filter Dropdowns */}
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
          <div className="flex space-x-2">
            <div className="h-9 bg-gray-200 rounded w-24"></div>
            <div className="h-9 bg-gray-200 rounded w-24"></div>
            <div className="h-9 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Projects Table Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="flex space-x-2">
            <div className="h-9 bg-gray-200 rounded w-20"></div>
            <div className="h-9 bg-gray-200 rounded w-8"></div>
            <div className="h-9 bg-gray-200 rounded w-8"></div>
            <div className="h-9 bg-gray-200 rounded w-8"></div>
            <div className="h-9 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

