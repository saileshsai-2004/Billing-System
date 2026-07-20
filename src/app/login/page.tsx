"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@adyapan.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex w-full bg-gray-50">
      {/* Left side: Orange Gradient Decorative Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-12 text-white flex-col justify-between overflow-hidden">
        {/* Subtle Decorative Background Graphics */}
        <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-orange-700/30 blur-3xl pointer-events-none" />

        {/* Brand Top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600 font-extrabold text-2xl shadow-lg">
            A
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">ADYAPAN</h2>
            <span className="text-xs uppercase tracking-widest text-orange-200 font-semibold">
              EdTech Billing Platform
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Billing & Invoice Management System
          </h1>
          <p className="text-orange-100 text-base leading-relaxed">
            Manage student course billing, issue GST tax invoices, track payment status, and send automated PDF bills with ease.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/10">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-orange-100 mt-1">GST Tax Compliant</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/10">
              <p className="text-2xl font-bold">Instant</p>
              <p className="text-xs text-orange-100 mt-1">PDF Email Dispatch</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-orange-200">
          © {new Date().getFullYear()} Adyapan Edutech Pvt. Ltd. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl sm:shadow-2xl">
          {/* Header Mobile Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold text-white text-xl">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">ADYAPAN</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to the Adyapan billing dashboard.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@adyapan.com"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-all shadow-md shadow-orange-500/20 active:scale-[0.99]"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
