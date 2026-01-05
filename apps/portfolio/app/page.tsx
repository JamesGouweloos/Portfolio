export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Portfolio
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Showcasing my projects and work
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <a
              href="/hotel-dashboard"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Hotel Booking Analytics
              </h2>
              <p className="text-gray-600">
                End-to-end analytics platform with data engineering pipeline
              </p>
            </a>
            
            {/* Add more project cards here */}
          </div>
        </div>
      </div>
    </main>
  );
}

