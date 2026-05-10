"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/shared/LanguageProvider";

type ImpactData = {
  total_workers: number;
  total_employed: number;
  total_earned: number;
  total_tasks_completed: number;
  districts_reached: number;
};

const fallback: ImpactData = {
  total_workers: 850,
  total_employed: 520,
  total_earned: 120000,
  total_tasks_completed: 4900,
  districts_reached: 12,
};

export default function ImpactStats() {
  const { t } = useLanguage();
  const [impact, setImpact] = useState<ImpactData>(fallback);
  const [display, setDisplay] = useState<ImpactData>(fallback);
  const displayRef = useRef(display);

  useEffect(() => {
    const fetchImpact = async () => {
      const { data, error } = await supabase
        .from("impact_metrics")
        .select("total_workers, total_employed, total_earned, total_tasks_completed, districts_reached")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setImpact({
          total_workers: data.total_workers ?? fallback.total_workers,
          total_employed: data.total_employed ?? fallback.total_employed,
          total_earned: data.total_earned ?? fallback.total_earned,
          total_tasks_completed: data.total_tasks_completed ?? fallback.total_tasks_completed,
          districts_reached: data.districts_reached ?? fallback.districts_reached,
        });
      }
    };

    fetchImpact();
  }, []);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const startValues = displayRef.current;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const next: ImpactData = {
        total_workers: Math.round(startValues.total_workers + (impact.total_workers - startValues.total_workers) * progress),
        total_employed: Math.round(startValues.total_employed + (impact.total_employed - startValues.total_employed) * progress),
        total_earned: Math.round(startValues.total_earned + (impact.total_earned - startValues.total_earned) * progress),
        total_tasks_completed: Math.round(
          startValues.total_tasks_completed + (impact.total_tasks_completed - startValues.total_tasks_completed) * progress
        ),
        districts_reached: Math.round(startValues.districts_reached + (impact.districts_reached - startValues.districts_reached) * progress),
      };

      setDisplay(next);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [impact]);

  const stats = useMemo(
    () => [
      { label: t("Women registered", "নিবন্ধিত নারী"), value: display.total_workers.toLocaleString() },
      { label: t("Women employed", "কর্মরত নারী"), value: display.total_employed.toLocaleString() },
      { label: t("Taka distributed", "বিতরণকৃত টাকা"), value: `৳${display.total_earned.toLocaleString()}` },
      { label: t("Tasks completed", "সম্পন্ন কাজ"), value: display.total_tasks_completed.toLocaleString() },
      { label: t("Districts reached", "আবদ্ধ জেলা"), value: display.districts_reached.toLocaleString() },
    ],
    [display, t]
  );

  return (
    <section id="impact" className="bg-teal-dark py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-black text-saffron mb-1">{stat.value}</div>
            <div className="text-white/70 uppercase tracking-widest text-[11px] font-bold">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}