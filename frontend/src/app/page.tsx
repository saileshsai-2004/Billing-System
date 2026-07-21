import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/40 text-slate-800 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-orange-300/30 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-2xl shadow-lg shadow-orange-500/30">
            A
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">ADYAPAN</h2>
            <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold block -mt-1">
              EdTech Billing Platform
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-orange-600 transition-colors">Solutions</a>
          <a href="#compliance" className="hover:text-orange-600 transition-colors">GST Compliance</a>
          <a href="#about" className="hover:text-orange-600 transition-colors">About Us</a>
        </nav>

        <Link
          href="/login"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:border-orange-400"
        >
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Admin Portal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center justify-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          Next-Gen EdTech Financial Management
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
          Simplified Billing & GST Invoicing for <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">Education</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
          Automate student course fees, issue tax-compliant GST invoices, generate instant PDF receipts, and dispatch emails effortlessly with Adyapan.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Platform Features
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-3xl bg-white/80 border border-orange-100 backdrop-blur-md shadow-xl shadow-orange-950/5 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl mb-4 border border-orange-200 shadow-sm">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Invoicing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Generate PDF course bills instantly with customized items, discounts, and breakdown.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 border border-orange-100 backdrop-blur-md shadow-xl shadow-orange-950/5 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl mb-4 border border-orange-200 shadow-sm">
              📊
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">GST Compliant</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Built-in CGST, SGST, IGST tax calculations with official state code mapping.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 border border-orange-100 backdrop-blur-md shadow-xl shadow-orange-950/5 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl mb-4 border border-orange-200 shadow-sm">
              ✉️
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Dispatch</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Seamlessly dispatch invoices directly to student email addresses via SMTP integration.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-orange-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 z-10">
        <div>
          © {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-orange-600 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}


