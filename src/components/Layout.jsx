import TopBar from './TopBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 relative selection:bg-blue-100 selection:text-blue-700 font-sans">
      {/* Global Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-blue-400/10 rounded-full blur-[80px] sm:blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] bg-purple-400/10 rounded-full blur-[80px] sm:blur-[120px] opacity-60"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="fixed top-0 z-50 w-[100%]">
          <TopBar />
        </div>
        <main className="flex-1 w-full max-w-[1600px] mx-auto lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}