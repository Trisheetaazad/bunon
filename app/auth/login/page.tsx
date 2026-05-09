"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    let role = data.user?.user_metadata?.role ?? "worker";

    if (data.user?.id) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profileError && profileData?.role) {
        role = profileData.role;
      }
    }
    if (role === "employer") {
      router.push("/dashboard/employer");
      return;
    }
    if (role === "admin") {
      router.push("/dashboard/admin");
      return;
    }
    router.push("/dashboard/worker");
  };

  return (
    <div className="w-full">
      <div>
        <h2 className="text-3xl font-bold text-teal-dark mb-8 text-center">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-teal-dark text-white py-3 rounded-lg font-bold">Login</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account? <Link href="/auth/register" className="text-saffron font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}