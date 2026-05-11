"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Wallet, CheckCircle, Clock, Star } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

type AssignmentSummary = {
  id: string;
  status: string;
  payment_status?: string | null;
  tasks?: {
    title?: string | null;
    status?: string | null;
    pay_per_unit?: number | null;
  } | null;
};

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [stats, setStats] = useState([
    { label: t("Total Earned", "মোট আয়"), value: "৳ 0", icon: <Wallet className="text-saffron" />, color: "bg-orange-50" },
    { label: t("Tasks Done", "সম্পন্ন কাজ"), value: "0", icon: <CheckCircle className="text-teal-dark" />, color: "bg-teal-50" },
    { label: t("Active Jobs", "চলমান কাজ"), value: "0", icon: <Clock className="text-blue-600" />, color: "bg-blue-50" },
    { label: t("Rating", "রেটিং"), value: t("New", "নতুন"), icon: <Star className="text-yellow-500" />, color: "bg-yellow-50" },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const user = session.user;
      setUserName(user.user_metadata?.full_name || "User");

      // 1. Fetch tasks claimed by THIS user
      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*, tasks(title, status, pay_per_unit)")
        .eq("worker_id", user.id)
        .order("assigned_at", { ascending: false });

      const { data: paymentData } = await supabase
        .from("payments")
        .select("amount, status")
        .eq("worker_id", user.id);

      if (assignmentData) setAssignments(assignmentData);

      const completed = assignmentData?.filter((t) => t.status === "approved").length ?? 0;
      const active = assignmentData?.filter((t) => ["assigned", "submitted"].includes(t.status)).length ?? 0;
      const totalEarnings = paymentData?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ?? 0;

      setStats([
        { label: t("Total Earned", "মোট আয়"), value: `৳ ${totalEarnings}`, icon: <Wallet className="text-saffron" />, color: "bg-orange-50" },
        { label: t("Tasks Done", "সম্পন্ন কাজ"), value: completed.toString(), icon: <CheckCircle className="text-teal-dark" />, color: "bg-teal-50" },
        { label: t("Active Jobs", "চলমান কাজ"), value: active.toString(), icon: <Clock className="text-blue-600" />, color: "bg-blue-50" },
        { label: t("Rating", "রেটিং"), value: completed > 0 ? "5.0" : t("New", "নতুন"), icon: <Star className="text-yellow-500" />, color: "bg-yellow-50" },
      ]);
      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  const statusLabel = (status: string) => {
    switch (status) {
      case "assigned":
        return t("Assigned", "অ্যাসাইনড");
      case "submitted":
        return t("Submitted", "জমা দেওয়া হয়েছে");
      case "approved":
        return t("Approved", "অনুমোদিত");
      case "requested":
        return t("Requested", "অনুরোধ করা হয়েছে");
      default:
        return status.replace("_", " ");
    }
  };

  const assignmentStatusLabel = (assignment: AssignmentSummary) => {
    if (assignment.status === "approved" && assignment.payment_status === "paid") {
      return t("Complete", "সম্পন্ন");
    }
    return statusLabel(assignment.status);
  };

  if (loading) return <div className="p-10 text-center font-bold text-teal-dark">{t("Updating your profile...", "আপনার প্রোফাইল আপডেট হচ্ছে...")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-dark">
              {t("Welcome back, {name}!", "ফিরে স্বাগতম, {name}!", { name: userName })}
            </h1>
            <p className="text-gray-600">{t("Your real-time work summary.", "আপনার রিয়েল-টাইম কাজের সারাংশ।")}</p>
          </div>
          <div className="mt-1">
            <button
              onClick={() => router.push('/dashboard/worker/tasks')}
              className="bg-teal-dark text-white px-4 py-2 rounded-full font-semibold hover:bg-teal-light transition"
            >
              {t("Browse tasks", "কাজ দেখুন")}
            </button>
          </div>
        </header>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Current Assignments</h2>
            
            {assignments.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-dashed text-center text-gray-400">
                {t("You haven't claimed any tasks yet.", "আপনি এখনো কোন কাজ নেননি।")} <br/> 
                <button onClick={() => router.push('/dashboard/worker/tasks')} className="text-teal-dark font-bold underline mt-2">{t("Browse tasks", "কাজ দেখুন")}</button>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white border border-teal-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-teal-dark text-white text-xs px-3 py-1 rounded-bl-lg capitalize">
                    {assignmentStatusLabel(assignment)}
                  </div>
                  <h3 className="font-bold text-lg">{assignment.tasks?.title ?? t("Task", "কাজ")}</h3>
                  <p className="text-gray-500 text-sm mb-4">{t("Pay per unit", "ইউনিটপ্রতি পারিশ্রমিক")}:{" "}৳{assignment.tasks?.pay_per_unit ?? 0}</p>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-dark h-full w-[30%]"></div>
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-2">{t("Started Recently", "সাম্প্রতিক শুরু")}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Onboarding Flow</h2>
            <ol className="space-y-3 text-sm text-gray-600">
              <li>1. {t("Register and verify phone", "নিবন্ধন করুন এবং ফোন যাচাই করুন")}</li>
              <li>2. {t("Complete profile", "প্রোফাইল সম্পন্ন করুন")}</li>
              <li>3. {t("Finish training modules", "প্রশিক্ষণ মডিউল শেষ করুন")}</li>
              <li>4. {t("Get certified", "সার্টিফাইড হন")}</li>
              <li>5. {t("Browse tasks", "কাজ দেখুন")}</li>
            </ol>
            <button
              onClick={() => router.push("/dashboard/worker/training")}
              className="w-full bg-teal-dark text-white py-3 rounded-lg font-bold text-sm"
            >
              {t("Go to Training", "প্রশিক্ষণে যান")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}