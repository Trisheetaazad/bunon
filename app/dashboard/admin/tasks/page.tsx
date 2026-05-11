"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/shared/LanguageProvider";

type Task = {
  id: string;
  title: string;
  category: string;
  status: string;
  pay_per_unit: number;
  total_units: number;
  created_at: string;
};

export default function AdminTasks() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);

  const categoryLabel = (category: string) => {
    switch (category) {
      case "data_labeling":
        return t("Data labeling", "ডেটা লেবেলিং");
      case "transcription":
        return t("Transcription", "ট্রান্সক্রিপশন");
      case "moderation":
        return t("Moderation", "মডারেশন");
      case "form_filling":
        return t("Form filling", "ফর্ম পূরণ");
      case "other":
        return t("Other", "অন্যান্য");
      default:
        return category.replace("_", " ");
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "open":
        return t("Open", "খোলা");
      case "assigned":
        return t("Assigned", "অ্যাসাইনড");
      case "submitted":
        return t("Submitted", "জমা দেওয়া হয়েছে");
      case "approved":
        return t("Approved", "অনুমোদিত");
      case "rejected":
        return t("Rejected", "বাতিল");
      case "completed":
        return t("Completed", "সম্পন্ন");
      default:
        return status.replace("_", " ");
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, category, status, pay_per_unit, total_units, created_at")
        .order("created_at", { ascending: false });

      if (data) setTasks(data as Task[]);
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-teal-dark">{t("Task Overview", "কাজের সারসংক্ষেপ")}</h1>
          <p className="text-gray-600">{t("Monitor active work across the platform.", "প্ল্যাটফর্ম জুড়ে সক্রিয় কাজ পর্যবেক্ষণ করুন।")}</p>
        </header>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-semibold bg-gray-50">
            <span>{t("Task", "কাজ")}</span>
            <span>{t("Category", "ক্যাটাগরি")}</span>
            <span>{t("Status", "অবস্থা")}</span>
            <span>{t("Pay", "পারিশ্রমিক")}</span>
            <span>{t("Units", "ইউনিট")}</span>
          </div>
          <div className="divide-y">
            {tasks.length === 0 ? (
              <div className="px-6 py-6 text-sm text-gray-500">{t("No tasks yet.", "এখনও কোন কাজ নেই।")}</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm items-center">
                  <span className="font-semibold text-gray-900">{task.title}</span>
                  <span className="text-gray-600">{categoryLabel(task.category)}</span>
                  <span className="text-teal-dark font-semibold">{statusLabel(task.status)}</span>
                  <span className="text-gray-600">BDT {task.pay_per_unit}</span>
                  <span className="text-gray-600">{task.total_units}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
