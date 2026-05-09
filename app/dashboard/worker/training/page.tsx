"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Module = {
	id: string;
	title: string;
	duration_minutes: number | null;
	order_index: number | null;
};

type Progress = {
	module_id: string;
	completed: boolean;
	score: number | null;
};

type ChatMessage = {
	role: "user" | "assistant";
	content: string;
};

export default function WorkerTraining() {
	const [modules, setModules] = useState<Module[]>([]);
	const [progress, setProgress] = useState<Progress[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState("");
	const [chatLoading, setChatLoading] = useState(false);
	const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
	const [language, setLanguage] = useState<"en" | "bn">("en");

	useEffect(() => {
		const loadModules = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user?.id) return;

			const { data: moduleData } = await supabase
				.from("training_modules")
				.select("id, title, duration_minutes, order_index")
				.order("order_index", { ascending: true });

			const { data: progressData } = await supabase
				.from("training_progress")
				.select("module_id, completed, score")
				.eq("worker_id", session.user.id);

			if (moduleData) setModules(moduleData as Module[]);
			if (progressData) setProgress(progressData as Progress[]);
		};

		loadModules();
	}, []);


	const handleComplete = async (moduleId: string) => {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session?.user?.id) return;

		await supabase.from("training_progress").upsert({
			worker_id: session.user.id,
			module_id: moduleId,
			completed: true,
			score: 80,
			completed_at: new Date().toISOString(),
		});

		setProgress((prev) => {
			const next = prev.filter((item) => item.module_id !== moduleId);
			next.push({ module_id: moduleId, completed: true, score: 80 });
			return next;
		});
	};

	const getStatus = (moduleId: string) => {
		const item = progress.find((entry) => entry.module_id === moduleId);
		if (!item) return "Not started";
		return item.completed ? "Completed" : "In progress";
	};

	const effectiveModuleId = selectedModuleId ?? (modules[0]?.id ?? null);
	const selectedModule = modules.find((module) => module.id === effectiveModuleId) ?? null;

	const handleSendMessage = async () => {
		if (!chatInput.trim() || !selectedModule) return;
		const nextMessage = chatInput.trim();
		setChatInput("");
		setChatLoading(true);
		setChatMessages((prev) => [...prev, { role: "user", content: nextMessage }]);

		try {
			const res = await fetch("/api/training/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: nextMessage,
					module: selectedModule.title,
					language,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error ?? "Unable to get response");
			}

			setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
		} catch (error) {
			const err = error as { message?: string } | null;
			setChatMessages((prev) => [
				...prev,
				{ role: "assistant", content: err?.message ?? "Something went wrong." },
			]);
		} finally {
			setChatLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-5xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">Training Center</h1>
					<p className="text-gray-600">Complete modules to unlock more tasks.</p>
				</header>

				<div className="grid gap-4">
					{modules.length === 0 ? (
						<div className="bg-white border border-gray-100 rounded-2xl p-8 text-gray-500">
							No modules yet. Ask an admin to add training content.
						</div>
					) : (
						modules.map((module) => (
							<div key={module.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div>
									<p className="text-lg font-bold text-gray-900">{module.title}</p>
									<p className="text-sm text-gray-600">Duration: {module.duration_minutes ?? 30} min</p>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-sm text-gray-500">{getStatus(module.id)}</span>
									<button
										onClick={() => handleComplete(module.id)}
										className="bg-teal-dark text-white px-4 py-2 rounded-full font-semibold"
									>
										Mark complete
									</button>
								</div>
							</div>
						))
					)}
				</div>

				<div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h2 className="text-xl font-bold text-gray-900">Training Chatbot</h2>
							<p className="text-sm text-gray-600">Ask questions about your training modules.</p>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setLanguage("en")}
								className={`px-3 py-1 rounded-full text-sm font-semibold ${language === "en" ? "bg-teal-dark text-white" : "bg-gray-100 text-gray-600"}`}
							>
								English
							</button>
							<button
								onClick={() => setLanguage("bn")}
								className={`px-3 py-1 rounded-full text-sm font-semibold ${language === "bn" ? "bg-teal-dark text-white" : "bg-gray-100 text-gray-600"}`}
							>
								Bengali
							</button>
						</div>
					</div>

					<div className="flex flex-col md:flex-row gap-3">
						<select
							className="w-full md:w-1/2 px-3 py-2 rounded-lg border border-gray-200"
							value={effectiveModuleId ?? ""}
							onChange={(e) => setSelectedModuleId(e.target.value)}
						>
							{modules.map((module) => (
								<option key={module.id} value={module.id}>
									{module.title}
								</option>
							))}
						</select>
						<div className="text-xs text-gray-500 self-center">
							{selectedModule ? `Module: ${selectedModule.title}` : "Select a module"}
						</div>
					</div>

					<div className="bg-gray-50 rounded-2xl p-4 space-y-3 max-h-72 overflow-y-auto">
						{chatMessages.length === 0 ? (
							<p className="text-sm text-gray-500">Ask a question to get started.</p>
						) : (
							chatMessages.map((msg, index) => (
								<div
									key={`${msg.role}-${index}`}
									className={`text-sm p-3 rounded-xl ${msg.role === "user" ? "bg-white text-gray-900 border" : "bg-teal-50 text-teal-dark"}`}
								>
									<strong className="block text-xs uppercase tracking-widest mb-1">
										{msg.role === "user" ? "You" : "Assistant"}
									</strong>
									{msg.content}
								</div>
							))
						)}
					</div>

					<div className="flex flex-col md:flex-row gap-3">
						<input
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							placeholder="Type your question..."
							className="flex-1 px-3 py-2 rounded-lg border border-gray-200"
							disabled={chatLoading}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleSendMessage();
								}
							}}
						/>
						<button
							onClick={handleSendMessage}
							disabled={chatLoading || !chatInput.trim() || !selectedModule}
							className="bg-teal-dark text-white px-5 py-2 rounded-full font-semibold disabled:opacity-50"
						>
							{chatLoading ? "Thinking..." : "Send"}
						</button>
					</div>
				</div>

				<div className="bg-teal-dark text-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<div>
						<p className="text-sm uppercase tracking-widest text-saffron font-semibold">Next step</p>
						<p className="text-lg font-semibold">Finish the training and start earning today.</p>
					</div>
					<Link href="/dashboard/worker/tasks" className="bg-white text-teal-dark px-4 py-2 rounded-full font-semibold">
						Browse tasks
					</Link>
				</div>
			</div>
		</div>
	);
}
