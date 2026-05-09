"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Wallet, CheckCircle, Clock, Star } from "lucide-react";

type AssignmentSummary = {
  id: string;
  status: string;
  tasks?: {
    title?: string | null;
    status?: string | null;
    pay_per_unit?: number | null;
  } | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Earned", value: "৳ 0", icon: <Wallet className="text-saffron" />, color: "bg-orange-50" },
    { label: "Tasks Done", value: "0", icon: <CheckCircle className="text-teal-dark" />, color: "bg-teal-50" },
    { label: "Active Jobs", value: "0", icon: <Clock className="text-blue-600" />, color: "bg-blue-50" },
    { label: "Rating", value: "New", icon: <Star className="text-yellow-500" />, color: "bg-yellow-50" },
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
        { label: "Total Earned", value: `৳ ${totalEarnings}`, icon: <Wallet className="text-saffron" />, color: "bg-orange-50" },
        { label: "Tasks Done", value: completed.toString(), icon: <CheckCircle className="text-teal-dark" />, color: "bg-teal-50" },
        { label: "Active Jobs", value: active.toString(), icon: <Clock className="text-blue-600" />, color: "bg-blue-50" },
        { label: "Rating", value: completed > 0 ? "5.0" : "New", icon: <Star className="text-yellow-500" />, color: "bg-yellow-50" },
      ]);
      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (loading) return <div className="p-10 text-center font-bold text-teal-dark">Updating your profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-dark">Welcome back, {userName}!</h1>
            <p className="text-gray-600">Your real-time work summary.</p>
          </div>
          <div className="mt-1">
            <button
              onClick={() => router.push('/dashboard/worker/tasks')}
              className="bg-teal-dark text-white px-4 py-2 rounded-full font-semibold hover:bg-teal-light transition"
            >
              Browse tasks
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
                You haven&apos;t claimed any tasks yet. <br/> 
                <button onClick={() => router.push('/dashboard/worker/tasks')} className="text-teal-dark font-bold underline mt-2">Browse tasks</button>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white border border-teal-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-teal-dark text-white text-xs px-3 py-1 rounded-bl-lg capitalize">
                    {assignment.status.replace('_', ' ')}
                  </div>
                  <h3 className="font-bold text-lg">{assignment.tasks?.title ?? "Task"}</h3>
                  <p className="text-gray-500 text-sm mb-4">Pay per unit: ৳{assignment.tasks?.pay_per_unit ?? 0}</p>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-dark h-full w-[30%]"></div>
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-2">Started Recently</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Onboarding Flow</h2>
            <ol className="space-y-3 text-sm text-gray-600">
              <li>1. Register and verify phone</li>
              <li>2. Complete profile</li>
              <li>3. Finish training modules</li>
              <li>4. Get certified</li>
              <li>5. Browse tasks</li>
            </ol>
            <button
              onClick={() => router.push("/dashboard/worker/training")}
              className="w-full bg-teal-dark text-white py-3 rounded-lg font-bold text-sm"
            >
              Go to Training
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}