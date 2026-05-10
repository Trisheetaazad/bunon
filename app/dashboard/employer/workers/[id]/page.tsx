"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/shared/LanguageProvider";

type WorkerProfile = {
  id: string;
  full_name: string | null;
};

type AssignmentRow = {
  id: string;
  status: string;
};

type PaymentRow = {
  amount: number | string;
  status: string | null;
};

export default function WorkerSummaryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useParams();
  const workerId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const loadWorker = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push("/auth/login");
        return;
      }

      if (!workerId) {
        router.push("/dashboard/employer");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", workerId)
        .maybeSingle();

      setProfile(profileData as WorkerProfile | null);

      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("id, status")
        .eq("worker_id", workerId);

      if (assignmentData) setAssignments(assignmentData as AssignmentRow[]);

      const { data: paymentData } = await supabase
        .from("payments")
        .select("amount, status")
        .eq("worker_id", workerId);

      if (paymentData) setPayments(paymentData as PaymentRow[]);

      setLoading(false);
    };

    loadWorker();
  }, [router, workerId]);

  const stats = useMemo(() => {
    const completed = assignments.filter((item) => item.status === "approved").length;
    const active = assignments.filter((item) => ["assigned", "submitted"].includes(item.status)).length;
    const totalEarned = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    return {
      completed,
      active,
      totalEarned,
    };
  }, [assignments, payments]);

  if (loading) {
    return <div className="p-10 text-center font-bold text-teal-dark">{t("Loading worker summary...", "কর্মীর সারাংশ লোড হচ্ছে...")}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-teal-dark">{profile?.full_name ?? t("Worker", "কর্মী")}</h1>
          <Link className="text-sm font-semibold text-teal-dark underline" href="/dashboard/employer">
            {t("Back to dashboard", "ড্যাশবোর্ডে ফিরে যান")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500">{t("Total earned", "মোট আয়")}</p>
            <p className="text-2xl font-bold text-gray-900">৳ {stats.totalEarned}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500">{t("Tasks done", "সম্পন্ন কাজ")}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500">{t("Active jobs", "চলমান কাজ")}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
