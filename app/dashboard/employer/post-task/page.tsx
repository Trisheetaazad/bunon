"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function PostTask() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState({
    title: "",
    description: "",
    category: "data_labeling",
    payPerUnit: "",
    totalUnits: "",
    deadline: "",
    requiredSkills: [] as string[],
  });

  const skillLabel = (skill: string) => {
    switch (skill) {
      case "data_entry":
        return t("Data entry", "ডাটা এন্ট্রি");
      case "transcription":
        return t("Transcription", "ট্রান্সক্রিপশন");
      case "moderation":
        return t("Moderation", "মডারেশন");
      case "quality_check":
        return t("Quality check", "মান যাচাই");
      case "form_filling":
        return t("Form filling", "ফর্ম পূরণ");
      default:
        return skill.replace("_", " ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const employerId = session?.user?.id;
    if (!employerId) {
      alert(t("Please log in as an employer first.", "প্রথমে নিয়োগদাতা হিসেবে লগইন করুন।"));
      setLoading(false);
      return;
    }

    const { data: employerRow, error: employerError } = await supabase
      .from("employers")
      .select("id")
      .eq("id", employerId)
      .maybeSingle();

    if (employerError || !employerRow) {
      alert(t("Employer profile not found. Please complete employer registration.", "নিয়োগদাতার প্রোফাইল পাওয়া যায়নি। অনুগ্রহ করে নিয়োগদাতা রেজিস্ট্রেশন সম্পন্ন করুন।"));
      setLoading(false);
      return;
    }

    const { data: taskData, error } = await supabase.from("tasks").insert({
      employer_id: employerId,
      title: task.title,
      description: task.description,
      category: task.category,
      pay_per_unit: Number(task.payPerUnit),
      total_units: Number(task.totalUnits),
      deadline: task.deadline ? new Date(task.deadline).toISOString() : null,
      status: "open",
      required_skills: task.requiredSkills,
    });

    if (error) {
      console.error("tasks insert error:", error);
      alert(t("Error posting task: {message} — see console for details.", "কাজ পোস্ট করতে সমস্যা: {message} — বিস্তারিত কনসোলে দেখুন।", { message: error.message }));
    } else {
      console.log("task posted:", taskData);
      alert(t("Task posted successfully!", "কাজ সফলভাবে পোস্ট হয়েছে!"));
      router.push("/dashboard/employer");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-teal-dark mb-2">{t("Post a New Task", "নতুন কাজ পোস্ট করুন")}</h1>
        <p className="text-gray-600 mb-8">{t("Fill in the details to find a skilled worker for your project.", "আপনার প্রকল্পের জন্য দক্ষ কর্মী খুঁজতে বিস্তারিত দিন।")}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("Job Title", "কাজের শিরোনাম")}</label>
            <input
              required
              type="text"
              placeholder={t("e.g. Product image tagging", "যেমন: পণ্যের ছবিতে ট্যাগিং")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("Description", "বিবরণ")}</label>
            <textarea
              required
              rows={4}
              placeholder={t("Describe the steps and requirements...", "ধাপ ও প্রয়োজনীয়তা লিখুন...")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("Category", "ক্যাটাগরি")}</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                value={task.category}
                onChange={(e) => setTask({ ...task, category: e.target.value })}
              >
                <option value="data_labeling">{t("Data labeling", "ডেটা লেবেলিং")}</option>
                <option value="transcription">{t("Transcription", "ট্রান্সক্রিপশন")}</option>
                <option value="moderation">{t("Moderation", "মডারেশন")}</option>
                <option value="form_filling">{t("Form filling", "ফর্ম পূরণ")}</option>
                <option value="other">{t("Other", "অন্যান্য")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("Deadline", "সময়সীমা")}</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("Pay per unit (৳)", "ইউনিটপ্রতি পারিশ্রমিক (৳)")}</label>
              <input
                required
                type="number"
                placeholder="15"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                onChange={(e) => setTask({ ...task, payPerUnit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("Total units", "মোট ইউনিট")}</label>
              <input
                required
                type="number"
                placeholder="200"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                onChange={(e) => setTask({ ...task, totalUnits: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("Required skills", "প্রয়োজনীয় দক্ষতা")}</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {["data_entry", "transcription", "moderation", "quality_check", "form_filling"].map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={task.requiredSkills.includes(skill)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...task.requiredSkills, skill]
                        : task.requiredSkills.filter((item) => item !== skill);
                      setTask({ ...task, requiredSkills: updated });
                    }}
                  />
                  {skillLabel(skill)}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-dark text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-light transition-all disabled:opacity-50"
          >
            {loading ? t("Posting...", "পোস্ট হচ্ছে...") : t("Publish Task", "কাজ প্রকাশ করুন")}
          </button>
        </form>
      </div>
    </div>
  );
}