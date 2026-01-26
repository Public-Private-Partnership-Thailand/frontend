'use client'

export default function HomePageSkeleton() {
  return (
    <div className="px-4 sm:px-0 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Search & Filters Skeleton (Hidden by default, shown when filters are open) */}
        <div className="w-0 lg:w-0 flex-shrink-0 opacity-0">
          <div className="bg-white p-6 rounded-lg shadow sticky top-4">
            {/* Title */}
            <div className="h-7 bg-gray-200 rounded w-32 mb-4"></div>
            
            {/* Search Input */}
            <div className="mb-4">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>

            {/* Multi-select Dropdowns */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}

            {/* Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Filter Toggle Button Skeleton */}
          <div className="mb-4 flex justify-end">
            <div className="h-10 bg-gray-200 rounded-md w-24"></div>
          </div>

          {/* Stats Cards Skeleton - 4 cards in grid */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-6 auto-rows-fr">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-span-12 sm:col-span-6 xl:col-span-3">
                  <div className="relative zoom-in h-full">
                    <div className="p-5 box h-full">
                      <div className="flex">
                        <div className="w-[28px] h-[28px] bg-gray-200 rounded"></div>
                      </div>
                      <div className="mt-6 h-9 bg-gray-200 rounded w-20"></div>
                      <div className="mt-1 h-5 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Charts Skeleton - 2 pie charts side by side */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {[1, 2].map((i) => (
                <div key={i} className="box p-6">
                  <div className="h-7 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-80 bg-gray-100 rounded flex items-center justify-center">
                    <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Scale & Sector Cards Skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left - Project Scale Pie Chart */}
              <div className="box p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-80 bg-gray-100 rounded flex items-center justify-center">
                  <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
                </div>
              </div>

              {/* Right - Bar Chart */}
              <div className="box p-4 sm:p-6">
                <div className="h-6 sm:h-7 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-64 sm:h-80 bg-gray-100 rounded"></div>
              </div>
            </div>

            {/* 12 Sector Cards Skeleton */}
            <div className="box p-4 sm:p-6 mt-8">
              <div className="h-6 sm:h-7 bg-gray-200 rounded w-56 mb-4"></div>
              <div className="min-h-80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div key={i} className="box p-3 sm:p-4 flex gap-2 sm:gap-4 h-full">
                    {/* Left Column - Icon */}
                    <div className="flex flex-col items-center flex-shrink-0 w-16 sm:w-20">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-md mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                    {/* Right Column - Stats */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="mb-3">
                        <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map and Latest Projects Section Skeleton */}
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* Thailand Map */}
            <div className="col-span-12 xl:col-span-8">
              <div className="h-10 bg-gray-200 rounded w-32 mb-5"></div>
              <div className="p-5 box mt-5">
                <div className="h-4 bg-gray-200 rounded w-full mb-5"></div>
                <div className="h-[310px] bg-gray-100 rounded-md"></div>
              </div>
            </div>
            
            {/* Latest Projects */}
            <div className="col-span-12 xl:col-span-4">
              <div className="h-10 bg-gray-200 rounded w-32 mb-5"></div>
              <div className="mt-5 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-4 py-4 box">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-md flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                    </div>
                  </div>
                ))}
                <div className="h-12 bg-gray-100 rounded-md border-2 border-dashed border-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

