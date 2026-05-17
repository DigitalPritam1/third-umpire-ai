import Link from "next/link";
import { ArrowRight, Shield, Zap, TrendingUp, Users, CloudRain, CheckCircle2, ChevronRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B14] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-[20%] right-[-20%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-50 animate-fadeSlideIn">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-6">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-white/10 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all group-hover:scale-105">
                <Shield className="w-5 h-5 text-slate-900 fill-slate-900" />
              </div>
              <span className="text-xl font-black tracking-tight text-white leading-tight">
                CAPTAIN COOL <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400">AI</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden items-center gap-8 text-sm font-medium text-white/60 md:flex">
              <Link className="transition-colors hover:text-white" href="#features">Features</Link>
              <Link className="transition-colors hover:text-white" href="#agents">Our Agents</Link>
            </nav>

            {/* CTA */}
            <div className="hidden md:block">
              <Link href="/dashboard" className="inline-flex items-center gap-2 transition hover:bg-white/10 border-gradient before:rounded-full text-sm font-semibold text-white bg-white/5 rounded-full px-5 py-2.5 shadow-lg backdrop-blur">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-6 text-center animate-fadeSlideIn [animation-delay:200ms]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold tracking-wide mb-8 hover:bg-indigo-500/20 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Introducing the Multi-Agent Strategy Engine
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Think like a legend.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400">
              Decide with AI.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/60 font-medium mb-10 leading-relaxed">
            The world's most advanced IPL match strategist. Powered by Google Gemini's multi-agent debate architecture to give you real-time, data-driven tactical superiority.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 transition-all hover:scale-105 border-gradient before:rounded-full text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-600 rounded-full px-8 py-4 shadow-[0_0_30px_rgba(232,121,249,0.3)]">
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 transition-all hover:bg-white/10 border border-white/10 text-base font-bold text-white bg-white/5 rounded-full px-8 py-4 backdrop-blur">
              Watch Demo
            </Link>
          </div>
          
          {/* Hero Visual Container */}
          <div className="mt-24 relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B14] via-transparent to-transparent z-10" />
            <div className="glass-card border-gradient before:rounded-3xl p-2 relative overflow-hidden">
               {/* Dashboard Mockup Image / Abstraction */}
               <div className="w-full h-[500px] bg-[#0F172A] rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                 
               {/* Abstract UI Representation */}
                 <div className="w-[80%] h-[80%] flex gap-6 z-10">
                    <div className="w-1/4 h-full bg-white/[0.02] rounded-xl border border-white/5 flex flex-col gap-4 p-4 shadow-lg backdrop-blur-sm">
                       <div className="w-full h-8 bg-white/5 rounded-lg flex items-center px-2"><div className="w-4 h-4 rounded-full bg-amber-500/50" /></div>
                       <div className="w-full h-8 bg-white/5 rounded-lg flex items-center px-2"><div className="w-4 h-4 rounded-full bg-fuchsia-500/50" /></div>
                       <div className="w-full h-8 bg-white/5 rounded-lg flex items-center px-2"><div className="w-4 h-4 rounded-full bg-indigo-500/50" /></div>
                       <div className="mt-auto w-full h-24 bg-gradient-to-t from-white/5 to-transparent rounded-lg border border-white/5" />
                    </div>
                    <div className="w-3/4 h-full flex flex-col gap-6">
                       <div className="w-full h-32 bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/10 to-amber-500/20 rounded-xl border border-white/10 flex items-center justify-between px-8 shadow-inner overflow-hidden relative">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
                         <div className="w-48 h-48 rounded-full bg-amber-500/20 blur-3xl absolute -right-10" />
                         <div className="z-10 flex flex-col gap-2">
                           <span className="text-3xl font-black text-white drop-shadow-md">CSK vs MI</span>
                           <span className="text-sm font-bold text-amber-400">WIN PROBABILITY: 72%</span>
                         </div>
                         <div className="z-10 w-32 h-16 flex items-end gap-1 opacity-80">
                            {[40, 50, 30, 60, 80, 72].map((h, i) => (
                              <div key={i} className="flex-1 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                         </div>
                       </div>
                       <div className="flex gap-6 flex-1">
                         <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/5 p-4 flex flex-col gap-3 shadow-lg">
                            <div className="w-1/2 h-4 bg-white/10 rounded" />
                            <div className="w-3/4 h-3 bg-white/5 rounded" />
                            <div className="w-full h-3 bg-white/5 rounded" />
                            <div className="w-5/6 h-3 bg-white/5 rounded" />
                         </div>
                         <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/5 p-4 flex flex-col justify-end shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4"><Zap className="w-6 h-6 text-fuchsia-500/50" /></div>
                            <div className="w-full h-12 bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/30 flex items-center justify-center">
                              <span className="text-xs font-bold text-fuchsia-300">AGENT DEBATE ACTIVE</span>
                            </div>
                         </div>
                       </div>
                    </div>
                 </div>

               </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-32">
          <div className="text-center mb-20 animate-fadeSlideIn [animation-delay:400ms]">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Tactical Superiority</h2>
            <p className="text-white/60 text-lg">Everything you need to outsmart the opposition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-amber-400" />}
              title="Real-Time Analysis"
              description="Connects instantly to Cricbuzz live data. Evaluates match situation, pitch conditions, and player form in milliseconds."
              delay="500ms"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-fuchsia-400" />}
              title="Multi-Agent Debate"
              description="Three specialized AI agents (Data, Tactical, Context) debate the best move, synthesizing their logic into a single captain's decision."
              delay="600ms"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-indigo-400" />}
              title="Win Probability"
              description="Dynamic curve predictions mapping every ball's impact on your chances of victory using advanced historical modeling."
              delay="700ms"
            />
          </div>
        </section>
        
        {/* AGENTS SECTION (Darker Container) */}
        <section id="agents" className="relative py-32 border-y border-white/5 bg-white/[0.01]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0B14] via-transparent to-[#0A0B14] z-0" />
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Meet the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-400">War Room.</span></h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  Captain Cool AI doesn't just use one model. It uses a specialized ensemble of distinct analytical personas that debate each other to arrive at the perfect tactical move.
                </p>
                <ul className="space-y-4">
                  {[
                    "Data Analyst Agent: Crunches numbers, matchups, and strike rates.",
                    "Pitch & Conditions Agent: Reads the venue, dew factor, and history.",
                    "Tactical Mastermind: Synthesizes everything into a Dhoni-esque masterstroke."
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-white/80 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/dashboard" className="inline-flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors group">
                    See them in action <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full" />
                <div className="glass-card border-gradient before:rounded-3xl p-8 relative">
                   <div className="space-y-4">
                     {/* Agent Log Mockups */}
                     <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mt-1"><TrendingUp className="w-4 h-4 text-blue-400" /></div>
                       <div>
                         <p className="text-xs font-bold text-blue-400 mb-1">DATA ANALYST</p>
                         <p className="text-sm text-white/80">Kohli strikes at 112 vs left-arm spin in middle overs. Bring on Jadeja immediately.</p>
                       </div>
                     </div>
                     <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start translate-x-4">
                       <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mt-1"><CloudRain className="w-4 h-4 text-emerald-400" /></div>
                       <div>
                         <p className="text-xs font-bold text-emerald-400 mb-1">PITCH AGENT</p>
                         <p className="text-sm text-white/80">Dew is setting in rapidly at Wankhede. Grip will be an issue for spinners in 2 overs.</p>
                       </div>
                     </div>
                     <div className="bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 rounded-xl p-4 flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mt-1"><Star className="w-4 h-4 text-amber-400" /></div>
                       <div>
                         <p className="text-xs font-bold text-amber-400 mb-1">CAPTAIN</p>
                         <p className="text-sm text-white/90 font-medium">Deploy Jadeja for 1 over now while ball is dry, keep slip. Hold Bumrah for 18th.</p>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="mx-auto max-w-5xl px-6 py-32 text-center">
          <div className="glass-card border-gradient before:rounded-3xl p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10" />
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 relative z-10">Ready to take the field?</h2>
            <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto relative z-10">
              Stop guessing. Start strategizing with the power of artificial intelligence.
            </p>
            <Link href="/dashboard" className="relative z-10 inline-flex items-center justify-center gap-2 transition-all hover:scale-105 border-gradient before:rounded-full text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-full px-10 py-5 shadow-[0_0_40px_rgba(79,70,229,0.4)]">
              Enter the Dashboard <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/[0.02] py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="text-lg font-black tracking-tight text-white">CAPTAIN COOL AI</span>
            </div>
            <p className="text-white/40 text-sm">© {new Date().getFullYear()} Google Gemini Advanced Hacks.</p>
          </div>
          <div className="text-white/50 text-sm font-medium flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-inner">
            Created by <a href="https://www.digitalpritam.in" target="_blank" rel="noopener noreferrer" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400 hover:opacity-80 font-bold transition-opacity">Digital Pritam (www.digitalpritam.in)</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
  return (
    <div 
      className="glass-card border-gradient before:rounded-3xl p-8 flex flex-col gap-4 animate-fadeSlideIn hover:-translate-y-2 transition-transform duration-300"
      style={{ animationDelay: delay }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-white/60 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
