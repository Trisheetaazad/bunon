"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [tasks, setTasks] = useState<Task[]>([]);

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
          <h1 className="text-3xl font-bold text-teal-dark">Task Overview</h1>
          <p className="text-gray-600">Monitor active work across the platform.</p>
        </header>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-semibold bg-gray-50">
            <span>Task</span>
            <span>Category</span>
            <span>Status</span>
            <span>Pay</span>
            <span>Units</span>
          </div>
          <div className="divide-y">
            {tasks.length === 0 ? (
              <div className="px-6 py-6 text-sm text-gray-500">No tasks yet.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm items-center">
                  <span className="font-semibold text-gray-900">{task.title}</span>
                  <span className="text-gray-600">{task.category.replace("_", " ")}</span>
                  <span className="text-teal-dark font-semibold">{task.status}</span>
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
