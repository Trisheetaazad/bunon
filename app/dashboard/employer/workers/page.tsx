"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Worker = {
	id: string;
	skills: string[] | null;
	rating: number | null;
	available: boolean | null;
	profiles?: {
		full_name: string | null;
		district: string | null;
	}[] | null;
};

const skillOptions = ["data_entry", "transcription", "moderation", "quality_check", "form_filling"];

export default function EmployerWorkers() {
	const [workers, setWorkers] = useState<Worker[]>([]);
	const [filters, setFilters] = useState({ skill: "", district: "" });

	useEffect(() => {
		const fetchWorkers = async () => {
			const { data } = await supabase
				.from("workers")
				.select("id, skills, rating, available, profiles(full_name, district)")
				.eq("is_verified", true);

			if (data) setWorkers(data as Worker[]);
		};

		fetchWorkers();
	}, []);

	const filtered = useMemo(() => {
		return workers.filter((worker) => {
			if (filters.skill && !worker.skills?.includes(filters.skill)) return false;
			const profile = worker.profiles?.[0];
			if (filters.district && profile?.district !== filters.district) return false;
			return true;
		});
	}, [workers, filters]);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-5xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">Verified Workers</h1>
					<p className="text-gray-600">Browse and assign tasks to trusted workers.</p>
				</header>

				<div className="grid md:grid-cols-2 gap-4">
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
					<select
						className="w-full px-3 py-2 rounded-lg border border-gray-200"
						value={filters.district}
						onChange={(e) => setFilters({ ...filters, district: e.target.value })}
					>
						<option value="">Any district</option>
						<option value="Dhaka">Dhaka</option>
						<option value="Chittagong">Chittagong</option>
						<option value="Sylhet">Sylhet</option>
						<option value="Rajshahi">Rajshahi</option>
					</select>
				</div>

				<div className="grid gap-4">
					{filtered.length === 0 ? (
						<div className="bg-white border border-gray-100 rounded-2xl p-8 text-gray-500">
							No verified workers yet.
						</div>
					) : (
						filtered.map((worker) => (
							<div key={worker.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div>
									<p className="text-lg font-bold text-gray-900">{worker.profiles?.[0]?.full_name ?? "Worker"}</p>
									<p className="text-sm text-gray-600">Skills: {worker.skills?.join(", ") ?? "N/A"}</p>
									<p className="text-xs text-gray-400">District: {worker.profiles?.[0]?.district ?? "-"}</p>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-sm text-gray-500">Rating {worker.rating ?? "New"}</span>
									<button className="bg-teal-dark text-white px-4 py-2 rounded-full font-semibold">Assign task</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
