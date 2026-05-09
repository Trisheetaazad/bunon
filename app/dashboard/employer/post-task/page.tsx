"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PostTask() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const employerId = session?.user?.id;
    if (!employerId) {
      alert("Please log in as an employer first.");
      setLoading(false);
      return;
    }

    const { data: employerRow, error: employerError } = await supabase
      .from("employers")
      .select("id")
      .eq("id", employerId)
      .maybeSingle();

    if (employerError || !employerRow) {
      alert("Employer profile not found. Please complete employer registration.");
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
      alert("Error posting task: " + error.message + " — see console for details.");
    } else {
      console.log("task posted:", taskData);
      alert("Task posted successfully!");
      router.push("/dashboard/employer");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-teal-dark mb-2">Post a New Task</h1>
        <p className="text-gray-600 mb-8">Fill in the details to find a skilled worker for your project.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Product image tagging"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe the steps and requirements..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                value={task.category}
                onChange={(e) => setTask({ ...task, category: e.target.value })}
              >
                <option value="data_labeling">Data labeling</option>
                <option value="transcription">Transcription</option>
                <option value="moderation">Moderation</option>
                <option value="form_filling">Form filling</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pay per unit (৳)</label>
              <input
                required
                type="number"
                placeholder="15"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-dark outline-none"
                onChange={(e) => setTask({ ...task, payPerUnit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Total units</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Required skills</label>
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
                  {skill.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-dark text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-light transition-all disabled:opacity-50"
          >
            {loading ? "Posting..." : "Publish Task"}
          </button>
        </form>
      </div>
    </div>
  );
}