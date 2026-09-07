"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase-client";
import Link from "next/link";

export default function AdminComicsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace("/admin/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="p-8">Loading admin...</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 border-b border-hairline pb-4">
        <h1 className="font-display text-2xl">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/comics" className="text-slate hover:text-ink">Comics</Link>
          <button onClick={handleLogout} className="text-oxide hover:underline">Sign out</button>
        </div>
      </div>
      {children}
    </div>
  );
}
