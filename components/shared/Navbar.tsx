"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const isHome = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");
  const showLandingLinks = isHome || isAuthPage;
  const showAuthedLinks = !loading && isAuthed && !isAuthPage;

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setIsAuthed(Boolean(data.session));

      if (data.session?.user?.id) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .maybeSingle();
          setRole(profile?.role ?? (data.session.user.user_metadata?.role ?? "worker"));
        } catch {
          setRole(data.session.user.user_metadata?.role ?? "worker");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthed(Boolean(session));
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setRole(profile?.role ?? (session.user.user_metadata?.role ?? "worker"));
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    router.push("/auth/login");
  };

  // always render navbar (show on auth pages as well)

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
      <Link href="/" className="text-2xl font-black text-teal-dark tracking-tighter">
        BUNON<span className="text-saffron">.</span>
      </Link>
      
      <div className="hidden md:flex gap-8 items-center text-gray-600 font-medium">
        {showLandingLinks ? (
          <>
            <Link href="/" className="hover:text-teal-dark transition">Home</Link>
              <Link href="/#how-it-works" className="hover:text-teal-dark transition">How it Works</Link>
              <Link href="/#impact" className="hover:text-teal-dark transition">Impact</Link>
          </>
        ) : null}
        {showAuthedLinks ? (
          <Link href={role ? `/dashboard/${role}` : "/dashboard/worker"} className="hover:text-teal-dark transition">Dashboard</Link>
        ) : null}
        {showAuthedLinks && role === "worker" ? (
          <>
            <Link href="/dashboard/worker/earnings" className="hover:text-teal-dark transition">Earnings</Link>
            <Link href="/dashboard/worker/tasks" className="hover:text-teal-dark transition">Tasks</Link>
            <Link href="/dashboard/worker/training" className="hover:text-teal-dark transition">Training</Link>
          </>
        ) : null}
        {showAuthedLinks && role === "employer" ? (
          <>
            <Link href="/dashboard/employer/post-task" className="hover:text-teal-dark transition">Post task</Link>
            <Link href="/dashboard/employer/workers" className="hover:text-teal-dark transition">Workers</Link>
          </>
        ) : null}
        {showAuthedLinks && role === "admin" ? (
          <>
            <Link href="/dashboard/admin/impact" className="hover:text-teal-dark transition">Impact</Link>
            <Link href="/dashboard/admin/payments" className="hover:text-teal-dark transition">Payments</Link>
            <Link href="/dashboard/admin/tasks" className="hover:text-teal-dark transition">Tasks</Link>
            <Link href="/dashboard/admin/users" className="hover:text-teal-dark transition">Users</Link>
          </>
        ) : null}
        {showAuthedLinks ? (
          <>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-saffron text-teal-dark px-5 py-2 rounded-full font-semibold hover:brightness-110 transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="hover:text-teal-dark transition">Login</Link>
            <Link href="/auth/register">
              <button className="bg-teal-dark text-white px-5 py-2 rounded-full font-semibold hover:bg-teal-light transition-all">
                Join Platform
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}