import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Diagnostic from '@/components/landing/Diagnostic';
import AITutor from '@/components/landing/AITutor';
import Roadmap from '@/components/landing/Roadmap';
import Analytics from '@/components/landing/Analytics';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Diagnostic />
      <AITutor />
      <Roadmap />
      <Analytics />
      <CTA />
      <Footer />
    </main>
  );
}
