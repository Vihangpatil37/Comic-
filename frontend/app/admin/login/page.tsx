"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase-client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin/comics");
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-paper p-8 border border-hairline rounded shadow-modal">
        <h1 className="font-display text-2xl mb-6">Admin Login</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-oxide/10 text-oxide border border-oxide/20 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-slate mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-slate mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide transition-colors"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-oxide text-paper py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
