"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function Register() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    age: "",
    district: "Dhaka",
    bkashNumber: "",
    companyName: "",
    website: "",
    role: roleParam === "employer" ? "employer" : "worker",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          district: formData.district,
          role: formData.role,
          phone: formData.phone,
          age: formData.age,
          bkash_number: formData.bkashNumber,
          company_name: formData.companyName,
          website: formData.website,
        },
      },
    });

    if (authError) {
      // Check if email already exists
      if (authError.message.toLowerCase().includes("already registered")) {
        router.push(`/auth/login?message=${encodeURIComponent(t("Account exists. Please login.", "এই অ্যাকাউন্টটি আছে। অনুগ্রহ করে লগইন করুন।"))}`);
      } else {
        alert(t("Error: {message}", "ত্রুটি: {message}", { message: authError.message }));
      }
    } else {
      const userId = authData.user?.id;
      if (!userId) {
        alert(t("Check your email to confirm your account, then log in.", "অ্যাকাউন্ট নিশ্চিত করতে ইমেইল দেখুন, তারপর লগইন করুন।"));
        setLoading(false);
        return;
      }

      if (!authData.session) {
        alert(t("Check your email to confirm your account, then log in to finish setup.", "অ্যাকাউন্ট নিশ্চিত করতে ইমেইল দেখুন, তারপর সেটআপ শেষ করতে লগইন করুন।"));
        setLoading(false);
        return;
      }

      const profilePayload = {
        id: userId,
        role: formData.role,
        full_name: formData.fullName,
        phone: formData.phone || null,
        district: formData.district,
        bkash_number: formData.bkashNumber || null,
        profile_complete: false,
      };

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select();

      if (profileError) {
        console.error("profiles upsert error:", profileError);
        alert(t("Profile setup failed: {message} — see console for details.", "প্রোফাইল সেটআপ ব্যর্থ: {message} — বিস্তারিত কনসোলে দেখুন।", { message: profileError.message }));
        setLoading(false);
        return;
      }
      console.log("profiles upsert result:", profileData);

      if (formData.role === "worker") {
        const { data: workerData, error: workerError } = await supabase.from("workers").upsert({
          id: userId,
          skills: [],
          training_completed: false,
          training_score: null,
          is_verified: false,
          total_earned: 0,
          tasks_completed: 0,
          rating: 0,
          available: true,
        }, { onConflict: 'id' }).select();

        if (workerError) {
          console.error("workers upsert error:", workerError);
          alert(t("Worker setup failed: {message} — see console for details.", "কর্মী সেটআপ ব্যর্থ: {message} — বিস্তারিত কনসোলে দেখুন।", { message: workerError.message }));
          setLoading(false);
          return;
        }
        console.log("workers upsert result:", workerData);
        router.push("/dashboard/worker");
      } else {
        const { data: employerData, error: employerError } = await supabase.from("employers").upsert({
          id: userId,
          company_name: formData.companyName,
          website: formData.website || null,
          verified: false,
          total_paid: 0,
        }, { onConflict: 'id' }).select();

        if (employerError) {
          console.error("employers upsert error:", employerError);
          alert(t("Employer setup failed: {message} — see console for details.", "নিয়োগদাতা সেটআপ ব্যর্থ: {message} — বিস্তারিত কনসোলে দেখুন।", { message: employerError.message }));
          setLoading(false);
          return;
        }
        console.log("employers upsert result:", employerData);
        router.push("/dashboard/employer");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div>
        <h2 className="text-3xl font-bold text-teal-dark mb-2 text-center">{t("Join Bunon", "বুননে যোগ দিন")}</h2>
        <p className="text-gray-600 text-center mb-8">{t("Start your journey to earning from home.", "ঘরে বসে আয় করার যাত্রা শুরু করুন।")}</p>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Full Name", "পূর্ণ নাম")}</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
              placeholder={t("e.g. Rahima Begum", "যেমন: রহিমা বেগম")}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Role", "ভূমিকা")}</label>
            <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "worker" })}
                className={`px-4 py-2 ${formData.role === "worker" ? "bg-teal-dark text-white" : "bg-white text-gray-700"}`}
              >
                {t("Worker", "কর্মী")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "employer" })}
                className={`px-4 py-2 ${formData.role === "employer" ? "bg-teal-dark text-white" : "bg-white text-gray-700"}`}
              >
                {t("Employer", "নিয়োগদাতা")}
              </button>
            </div>
          </div>

          {formData.role === "worker" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Phone", "ফোন")}</label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
                  placeholder="01XXXXXXXXX"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Company Name", "কোম্পানির নাম")}</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
                placeholder={t("e.g. MicroLab BD", "যেমন: মাইক্রোল্যাব বিডি")}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Email", "ইমেইল")}</label>
            <input
              required
              type="email"
              autoComplete="new-password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
              placeholder="rahima@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Password", "পাসওয়ার্ড")}</label>
            <input 
              required
              type="password" 
              autoComplete="new-password" // PREVENTS AUTOFILL
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
              placeholder={t("Minimum 6 characters", "কমপক্ষে ৬ অক্ষর")}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Role selector moved above full name */}

          {formData.role === "worker" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Age", "বয়স")}</label>
                <input
                  required
                  type="number"
                  min={16}
                  max={70}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
                  placeholder="18"
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("bKash Number", "বিকাশ নম্বর")}</label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
                  placeholder="01XXXXXXXXX"
                  onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Website", "ওয়েবসাইট")}</label>
              <input
                type="url"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none"
                placeholder="https://company.com"
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("District", "জেলা")}</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-dark outline-none cursor-pointer"
              onChange={(e) => setFormData({...formData, district: e.target.value})}
            >
              <option>{t("Dhaka", "ঢাকা")}</option>
              <option>{t("Chittagong", "চট্টগ্রাম")}</option>
              <option>{t("Sylhet", "সিলেট")}</option>
              <option>{t("Rajshahi", "রাজশাহী")}</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-saffron text-white py-4 rounded-lg font-bold text-lg hover:brightness-110 transition disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? t("Creating Account...", "অ্যাকাউন্ট তৈরি হচ্ছে...") : t("Create Free Account", "ফ্রি অ্যাকাউন্ট খুলুন")}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          {t("Already have an account?", "ইতিমধ্যে অ্যাকাউন্ট আছে?")} <Link href="/auth/login" className="text-saffron font-bold">{t("Login", "লগইন")}</Link>
        </p>
      </div>
    </div>
  );
}