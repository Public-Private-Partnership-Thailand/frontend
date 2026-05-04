'use client'

export default function ViewProjectSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 animate-pulse" aria-busy="true" aria-live="polite">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-full max-w-3xl" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="h-10 w-20 bg-gray-200 rounded-md" />
              <div className="h-10 w-20 bg-gray-200 rounded-md" />
            </div>
          </div>
          <div className="mt-6">
            <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-[4rem]">
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                  <div className="h-3 bg-gray-200 rounded w-full max-w-[5rem]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3 items-start min-w-0">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0 w-full">
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
              <div className="h-6 bg-gray-200 rounded w-40 mb-6" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-100 rounded-md w-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white shadow rounded-lg overflow-hidden w-full">
              <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-5 w-5 bg-gray-200 rounded" />
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6 min-w-0 w-full">
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
              <div className="aspect-video bg-gray-100 rounded-lg w-full" />
            </div>
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-28" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded max-w-[85%] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
