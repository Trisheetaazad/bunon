"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/shared/LanguageProvider";

type Payment = {
  id: string;
  assignment_id: string | null;
  worker_id: string | null;
  amount: number;
  status: string;
  transaction_id: string | null;
  created_at: string;
};

export default function AdminPayments() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const statusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t("Completed", "সম্পন্ন");
      case "pending":
        return t("Pending", "অপেক্ষমান");
      case "failed":
        return t("Failed", "ব্যর্থ");
      default:
        return status.replace("_", " ");
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, assignment_id, worker_id, amount, status, transaction_id, created_at")
        .order("created_at", { ascending: false });

      if (data) setPayments(data as Payment[]);
    };

    fetchPayments();
  }, []);

  const markPaid = async (paymentId: string) => {
    setLoadingId(paymentId);
    const transactionId = prompt(t("Enter bKash transaction ID", "বিকাশ ট্রানজ্যাকশন আইডি দিন"));

    if (!transactionId) {
      setLoadingId(null);
      return;
    }

    const { error } = await supabase
      .from("payments")
      .update({ status: "completed", transaction_id: transactionId, paid_at: new Date().toISOString() })
      .eq("id", paymentId);

    if (!error) {
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId
            ? { ...payment, status: "completed", transaction_id: transactionId }
            : payment
        )
      );
    }

    setLoadingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-teal-dark">{t("Payment Management", "পেমেন্ট ব্যবস্থাপনা")}</h1>
          <p className="text-gray-600">{t("Mark bKash payouts and track history.", "বিকাশ পেমেন্ট চিহ্নিত করুন এবং ইতিহাস ট্র্যাক করুন।")}</p>
        </header>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-semibold bg-gray-50">
            <span>{t("Payment", "পেমেন্ট")}</span>
            <span>{t("Worker", "কর্মী")}</span>
            <span>{t("Amount", "পরিমাণ")}</span>
            <span>{t("Status", "অবস্থা")}</span>
            <span>{t("Action", "অ্যাকশন")}</span>
          </div>
          <div className="divide-y">
            {payments.length === 0 ? (
              <div className="px-6 py-6 text-sm text-gray-500">{t("No payments yet.", "এখনও কোন পেমেন্ট নেই।")}</div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm items-center">
                  <span className="font-semibold text-gray-900">{payment.id}</span>
                  <span className="text-gray-600">{payment.worker_id ?? "-"}</span>
                  <span className="text-gray-600">BDT {payment.amount}</span>
                  <span className="text-teal-dark font-semibold">{statusLabel(payment.status)}</span>
                  <button
                    onClick={() => markPaid(payment.id)}
                    disabled={payment.status === "completed" || loadingId === payment.id}
                    className="bg-teal-dark text-white px-3 py-2 rounded-full font-semibold disabled:opacity-50"
                  >
                    {payment.status === "completed" ? t("Paid", "পরিশোধিত") : t("Mark paid", "পেমেন্ট চিহ্নিত করুন")}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
