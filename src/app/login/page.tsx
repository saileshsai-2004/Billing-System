"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@adyapan.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border">
        <div className="mb-8">
          <div className="text-sm font-semibold tracking-widest text-slate-500">ADYAPAN</div>
          <h1 className="mt-2 text-3xl font-bold">Billing Admin</h1>
          <p className="mt-2 text-slate-500">Sign in to create and email student bills.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-slate-950 px-4 py-3 font-medium text-white disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
