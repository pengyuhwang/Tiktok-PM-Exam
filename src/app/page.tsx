import GeneratorSection from "@/components/GeneratorSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header - Minimalist */}
      <header className="w-full bg-white/50 backdrop-blur-sm border-b border-gray-200 py-3 px-6 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900 hidden sm:block">TikTok Insight</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 border border-gray-200">MVP v0.1</span>
        </div>
      </header>

      {/* Main Content Area - Centered like a Search Engine */}
      <div className="flex-1 flex flex-col items-center justify-start pt-[15vh] pb-12 w-full px-4 sm:px-6">
        <div className="w-full">
          <GeneratorSection />
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-gray-400 mt-auto">
        <p>© {new Date().getFullYear()} TikTok Creator Insight Assistant. Powered by Aliyun Bailian.</p>
      </footer>
    </main>
  );
}