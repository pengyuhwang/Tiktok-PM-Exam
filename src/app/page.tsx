import GeneratorSection from "@/components/GeneratorSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <GeneratorSection />
      
      <footer className="py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} TikTok Creator Insight Assistant. Powered by Aliyun Bailian.</p>
      </footer>
    </main>
  );
}