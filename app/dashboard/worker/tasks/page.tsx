"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, CalendarDays, Clock, Filter, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/shared/LanguageProvider";

type SessionUser = {
  id: string;
  user_metadata?: {
    role?: string;
  };
};

const categories = [
  "data_labeling",
  "transcription",
  "moderation",
  "form_filling",
  "other",
];

const skillOptions = ["data_entry", "transcription", "moderation", "quality_check", "form_filling"];

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  pay_per_unit: number;
  total_units: number;
  units_completed: number;
  deadline: string | null;
  required_skills: string[] | null;
  status: string;
};

type Assignment = {
  id: string;
  status: string;
  units_assigned: number | null;
  units_done: number | null;
  attachment_url?: string | null;
  payment_status?: string | null;
  tasks?: Task;
};

export default function TaskFeed() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<Record<string, File | null>>({});
  const [filters, setFilters] = useState({
    category: "all",
    minPay: "",
    deadline: "",
    skill: "",
  });
  const router = useRouter();

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

  const statusLabel = (status: string) => {
    switch (status) {
      case "requested":
        return t("Requested", "অনুরোধ করা হয়েছে");
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
      case "open":
        return t("Open", "খোলা");
      case "pending":
        return t("Pending", "অপেক্ষমান");
      default:
        return status.replace("_", " ");
    }
  };

  const assignmentStatusLabel = (assignment: Assignment) => {
    if (assignment.status === "approved" && assignment.payment_status === "paid") {
      return t("Complete", "সম্পন্ন");
    }
    return statusLabel(assignment.status);
  };

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setRole(profile?.role ?? session.user.user_metadata?.role ?? null);
      } else {
        setRole(null);
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (!error && data) setTasks(data as Task[]);

      if (session?.user?.id) {
        const { data: assignmentData } = await supabase
          .from("assignments")
          .select("*, tasks(*)")
          .eq("worker_id", session.user.id)
          .in("status", ["requested", "assigned", "submitted", "approved"])
          .order("assigned_at", { ascending: false });

        if (assignmentData) setAssignments(assignmentData as Assignment[]);
      }

      setLoading(false);
    };

    getData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.category !== "all" && task.category !== filters.category) return false;
      if (filters.minPay && task.pay_per_unit < Number(filters.minPay)) return false;
      if (filters.deadline && task.deadline && task.deadline > filters.deadline) return false;
      if (filters.skill && task.required_skills && !task.required_skills.includes(filters.skill)) return false;
      return true;
    });
  }, [tasks, filters]);

  const handleApply = async (taskId: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: workerRow, error: workerError } = await supabase
      .from("workers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (workerError || !workerRow) {
      alert(t("Worker profile not found. Please complete worker registration.", "কর্মীর প্রোফাইল পাওয়া যায়নি। অনুগ্রহ করে কর্মী রেজিস্ট্রেশন সম্পন্ন করুন।"));
      return;
    }

    // prevent duplicate requests/assignments
    try {
      const { data: existing } = await supabase
        .from("assignments")
        .select("id")
        .eq("task_id", taskId)
        .eq("worker_id", user.id)
        .in("status", ["requested", "assigned"])
        .limit(1);

      if (existing && existing.length > 0) {
        alert(t("You have already applied or been assigned for this task.", "আপনি ইতিমধ্যে এই কাজের জন্য আবেদন করেছেন বা অ্যাসাইন হয়েছেন।"));
        return;
      }
    } catch (e) {
      console.warn("error checking existing assignments:", e);
    }

    let assignmentDataInsert = null;
    try {
      const res = await supabase
        .from("assignments")
        .insert({
        task_id: taskId,
        worker_id: user.id,
        units_assigned: 1,
        status: "requested",
        payment_status: "pending",
        })
        .select()
        .throwOnError();

      assignmentDataInsert = res.data ?? null;

      if (!assignmentDataInsert || (Array.isArray(assignmentDataInsert) && assignmentDataInsert.length === 0)) {
        console.error("assignments insert returned no data:", res);
        alert(t("Error applying: no response from server — see console for details.", "আবেদন করতে সমস্যা: সার্ভার থেকে কোন উত্তর পাওয়া যায়নি — বিস্তারিত কনসোলে দেখুন।"));
        return;
      }

      console.log("assignment insert result:", assignmentDataInsert);
    } catch (err) {
      const errObj = err as { message?: string; details?: string; hint?: string; code?: string } | null;
      const errMessage = errObj?.message ?? "Unknown error";
      console.error("assignments insert threw:", {
        message: errObj?.message ?? String(err),
        details: errObj?.details,
        hint: errObj?.hint,
        code: errObj?.code,
      });
      alert(t("Error applying: {message} — see console for details.", "আবেদন করতে সমস্যা: {message} — বিস্তারিত কনসোলে দেখুন।", { message: errMessage }));
      return;
    }

    alert(t("Request sent. Check your assignments below.", "অনুরোধ পাঠানো হয়েছে। নিচে আপনার অ্যাসাইনমেন্ট দেখুন।"));
    const { data: assignmentData } = await supabase
      .from("assignments")
      .select("*, tasks(*)")
      .eq("worker_id", user.id)
      .in("status", ["requested", "assigned", "submitted", "approved"])
      .order("assigned_at", { ascending: false });

    if (assignmentData) setAssignments(assignmentData as Assignment[]);
  };

  const handleSubmitWork = async (assignmentId: string) => {
    const file = attachmentFiles[assignmentId] ?? null;
    let attachmentUrl: string | null = null;

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${assignmentId}/${file.lastModified}_${safeName}`;
      const { error: uploadError } = await supabase
        .storage
        .from("task-attachments")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert(t("Attachment upload failed: {message}", "অ্যাটাচমেন্ট আপলোড ব্যর্থ: {message}", { message: uploadError.message }));
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from("task-attachments")
        .getPublicUrl(filePath);

      attachmentUrl = publicData?.publicUrl ?? null;
    }

    const { error } = await supabase
      .from("assignments")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        attachment_url: attachmentUrl,
      })
      .eq("id", assignmentId);

    if (error) {
      alert(t("Submission failed: {message}", "জমা দেওয়া ব্যর্থ: {message}", { message: error.message }));
      return;
    }

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: "submitted" }
          : assignment
      )
    );
  };

  if (loading) return <div className="p-10 text-center text-teal-dark font-bold">{t("Loading tasks...", "কাজ লোড হচ্ছে...")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-teal-dark mb-2">{t("Available Tasks", "উপলব্ধ কাজ")}</h1>
          <p className="text-gray-600">{t("Filter tasks and apply instantly.", "ফিল্টার করুন এবং সাথে সাথে আবেদন করুন।")}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex items-center gap-2 text-gray-600 font-semibold">
            <Filter size={16} /> {t("Filters", "ফিল্টার")}
          </div>
          <div className="grid md:grid-cols-4 gap-4 flex-1">
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">{t("All categories", "সব ক্যাটাগরি")}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              placeholder={t("Min pay (BDT)", "সর্বনিম্ন পারিশ্রমিক (BDT)")}
              type="number"
              value={filters.minPay}
              onChange={(e) => setFilters({ ...filters, minPay: e.target.value })}
            />
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              placeholder={t("Deadline before", "সময়সীমা")}
              type="date"
              value={filters.deadline}
              onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            >
              <option value="">{t("Any skill", "যেকোনো দক্ষতা")}</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skillLabel(skill)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border">
              <p className="text-gray-400 font-medium">{t("No tasks available right now. Check back soon!", "এখন কোন কাজ নেই। শিগগির আবার দেখুন!")}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 max-w-xl">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {categoryLabel(task.category)}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {task.total_units} {t("units", "ইউনিট")}</span>
                    {task.deadline ? (
                      <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(task.deadline).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                  {task.required_skills && task.required_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.required_skills.map((skill) => (
                        <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {skillLabel(skill)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="text-right flex flex-col items-end gap-3 w-full lg:w-auto">
                  <div className="text-2xl font-black text-teal-dark">৳ {task.pay_per_unit}</div>
                  {role === "worker" ? (
                    <button
                      onClick={() => handleApply(task.id)}
                      className="bg-teal-dark text-white px-6 py-2 rounded-full font-bold hover:bg-teal-light transition-all w-full lg:w-auto"
                    >
                      {t("Apply", "আবেদন করুন")}
                    </button>
                  ) : role === "employer" ? (
                    <button disabled className="bg-gray-200 text-gray-500 px-6 py-2 rounded-full font-bold w-full lg:w-auto">
                      {t("Employers cannot apply", "নিয়োগদাতারা আবেদন করতে পারবেন না")}
                    </button>
                  ) : (
                    <button onClick={() => router.push('/auth/login')} className="bg-teal-dark text-white px-6 py-2 rounded-full font-bold hover:bg-teal-light transition-all w-full lg:w-auto">
                      {t("Login to Apply", "আবেদন করতে লগইন করুন")}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{t("My Assignments", "আমার অ্যাসাইনমেন্ট")}</h2>
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              {t("No assignments yet. Apply to a task above to get started.", "এখনো কোন অ্যাসাইনমেন্ট নেই। শুরু করতে উপরের কোনো কাজে আবেদন করুন।")}
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{assignment.tasks?.title ?? t("Task", "কাজ")}</p>
                    <p className="text-sm text-gray-500">{t("Status", "অবস্থা")}: {assignmentStatusLabel(assignment)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star size={14} /> {t("Units assigned", "নির্ধারিত ইউনিট")}: {assignment.units_assigned ?? 0}
                  </div>
                </div>
                <div className="mt-4 flex flex-col md:flex-row gap-3">
                  <input
                    type="file"
                    className="flex-1 text-sm"
                    disabled={assignment.status !== "assigned"}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setAttachmentFiles((prev) => ({ ...prev, [assignment.id]: file }));
                    }}
                  />
                  <button
                    onClick={() => handleSubmitWork(assignment.id)}
                    disabled={assignment.status !== "assigned" || assignment.payment_status === "paid"}
                    className="bg-saffron text-teal-dark px-4 py-2 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignment.payment_status === "paid"
                      ? t("Paid", "পরিশোধিত")
                      : assignment.status === "assigned"
                        ? t("Submit Work", "কাজ জমা দিন")
                        : assignment.status === "submitted"
                          ? t("Awaiting Review", "রিভিউ অপেক্ষমান")
                          : assignment.status === "approved"
                            ? t("Awaiting Payment", "পেমেন্ট অপেক্ষমান")
                            : t("Awaiting Assignment", "অ্যাসাইনমেন্ট অপেক্ষমান")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}