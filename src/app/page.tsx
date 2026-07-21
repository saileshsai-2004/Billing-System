import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl shadow-lg shadow-orange-500/30">
            A
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">ADYAPAN</h2>
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block -mt-1">
              EdTech Billing Platform
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-orange-400 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-orange-400 transition-colors">Solutions</a>
          <a href="#compliance" className="hover:text-orange-400 transition-colors">GST Compliance</a>
          <a href="#about" className="hover:text-orange-400 transition-colors">About Us</a>
        </nav>

        <Link
          href="/login"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 text-sm font-semibold transition-all hover:border-orange-500/50"
        >
          <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Admin Portal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center justify-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Next-Gen EdTech Financial Management
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Simplified Billing & GST Invoicing for <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">Education</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          Automate student course fees, issue tax-compliant GST invoices, generate instant PDF receipts, and dispatch emails effortlessly with Adyapan.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Platform Features
          </a>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-all hover:text-white flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Sign In
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md hover:border-orange-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xl mb-4 border border-orange-500/20">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Automated Invoicing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate PDF course bills instantly with customized items, discounts, and breakdown.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md hover:border-orange-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-4 border border-amber-500/20">
              📊
            </div>
            <h3 className="text-xl font-bold text-white mb-2">GST Compliant</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Built-in CGST, SGST, IGST tax calculations with official state code mapping.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md hover:border-orange-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-xl mb-4 border border-yellow-500/20">
              ✉️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Dispatch</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Seamlessly dispatch invoices directly to student email addresses via SMTP integration.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 z-10">
        <div>
          © {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
        </div>
      </footer>

      {/* FIXED BOTTOM-CORNER ADMIN BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/login"
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-2xl shadow-orange-600/40 hover:shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all duration-200 border border-orange-400/40"
          title="Admin Access Login"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white group-hover:rotate-12 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="tracking-wide">Admin Login</span>
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
          </div>
        </Link>
      </div>
    </div>
  );
}

