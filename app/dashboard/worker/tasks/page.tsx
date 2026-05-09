"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, CalendarDays, Clock, Filter, Star } from "lucide-react";
import { useRouter } from "next/navigation";

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
  tasks?: Task;
};

export default function TaskFeed() {
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
      alert("Worker profile not found. Please complete worker registration.");
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
        alert("You have already applied or been assigned for this task.");
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
        alert("Error applying: no response from server — see console for details.");
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
      alert("Error applying: " + errMessage + " — see console for details.");
      return;
    }

    alert("Request sent. Check your assignments below.");
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
        alert("Attachment upload failed: " + uploadError.message);
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
      alert("Submission failed: " + error.message);
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

  if (loading) return <div className="p-10 text-center text-teal-dark font-bold">Loading tasks...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-teal-dark mb-2">Available Tasks</h1>
          <p className="text-gray-600">Filter tasks and apply instantly.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex items-center gap-2 text-gray-600 font-semibold">
            <Filter size={16} /> Filters
          </div>
          <div className="grid md:grid-cols-4 gap-4 flex-1">
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ")}
                </option>
              ))}
            </select>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              placeholder="Min pay (BDT)"
              type="number"
              value={filters.minPay}
              onChange={(e) => setFilters({ ...filters, minPay: e.target.value })}
            />
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              placeholder="Deadline before"
              type="date"
              value={filters.deadline}
              onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            >
              <option value="">Any skill</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border">
              <p className="text-gray-400 font-medium">No tasks available right now. Check back soon!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 max-w-xl">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {task.category.replace("_", " ")}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {task.total_units} units</span>
                    {task.deadline ? (
                      <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(task.deadline).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                  {task.required_skills && task.required_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.required_skills.map((skill) => (
                        <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {skill.replace("_", " ")}
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
                      Apply
                    </button>
                  ) : role === "employer" ? (
                    <button disabled className="bg-gray-200 text-gray-500 px-6 py-2 rounded-full font-bold w-full lg:w-auto">
                      Employers cannot apply
                    </button>
                  ) : (
                    <button onClick={() => router.push('/auth/login')} className="bg-teal-dark text-white px-6 py-2 rounded-full font-bold hover:bg-teal-light transition-all w-full lg:w-auto">
                      Login to Apply
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              No assignments yet. Apply to a task above to get started.
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{assignment.tasks?.title ?? "Task"}</p>
                    <p className="text-sm text-gray-500">Status: {assignment.status.replace("_", " ")}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star size={14} /> Units assigned: {assignment.units_assigned ?? 0}
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
                    disabled={assignment.status !== "assigned"}
                    className="bg-saffron text-teal-dark px-4 py-2 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignment.status === "assigned"
                      ? "Submit Work"
                      : assignment.status === "submitted"
                        ? "Awaiting Review"
                        : assignment.status === "approved"
                          ? "Awaiting Payment"
                          : "Awaiting Assignment"}
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