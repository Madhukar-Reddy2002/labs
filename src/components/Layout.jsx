import TopBar from './TopBar' // We will build this next

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-blue-100 selection:text-blue-700 font-sans">
      {/* Global Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}