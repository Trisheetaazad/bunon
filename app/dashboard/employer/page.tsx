"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/shared/LanguageProvider";

type PostedTask = {
	id: string;
	title: string;
	description: string | null;
	status: string;
	pay_per_unit: number;
	total_units: number;
	created_at: string;
};

type WorkerProfile = {
	id: string;
	full_name: string | null;
	district: string | null;
};

type AssignmentRequest = {
	id: string;
	task_id: string;
	worker_id: string;
	status: string;
	created_at: string;
	attachment_url?: string | null;
	profile: WorkerProfile | null;
};

export default function EmployerDashboard() {
	const router = useRouter();
	const { t } = useLanguage();
	const [loading, setLoading] = useState(true);
	const [postedTasks, setPostedTasks] = useState<PostedTask[]>([]);
	const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>([]);
	const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

	useEffect(() => {
		const fetchEmployerData = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user?.id) {
				router.push("/auth/login");
				return;
			}

			const employerId = session.user.id;
			const { data: tasksData } = await supabase
				.from("tasks")
				.select("id, title, description, status, pay_per_unit, total_units, created_at")
				.eq("employer_id", employerId)
				.order("created_at", { ascending: false });

			const tasks = (tasksData ?? []) as PostedTask[];
			setPostedTasks(tasks);

			if (tasks.length === 0) {
				setAssignmentRequests([]);
				setLoading(false);
				return;
			}

			const taskIds = tasks.map((task) => task.id);
			const { data: assignmentData } = await supabase
				.from("assignments")
				.select("id, task_id, worker_id, status, created_at, attachment_url")
				.in("task_id", taskIds)
				.order("created_at", { ascending: false });

			const assignments = assignmentData ?? [];
			const workerIds = Array.from(new Set(assignments.map((assignment) => assignment.worker_id)));
			let profileById: Record<string, WorkerProfile> = {};

			if (workerIds.length > 0) {
				const { data: profileData } = await supabase
					.from("profiles")
					.select("id, full_name, district")
					.in("id", workerIds);

				profileById = (profileData ?? []).reduce<Record<string, WorkerProfile>>((acc, profile) => {
					acc[profile.id] = profile as WorkerProfile;
					return acc;
				}, {});
			}

			const enriched = assignments.map((assignment) => ({
				...(assignment as Omit<AssignmentRequest, "profile">),
				profile: profileById[assignment.worker_id] ?? null,
			}));

			setAssignmentRequests(enriched);
			setLoading(false);
		};

		fetchEmployerData();
	}, [router]);

	const overview = useMemo(() => {
		const openTasks = postedTasks.filter((task) => task.status === "open").length;
		const inReview = assignmentRequests.filter((assignment) => assignment.status === "submitted").length;
		const hired = assignmentRequests.filter((assignment) => assignment.status === "assigned").length;
		return [
			{ label: t("Open tasks", "খোলা কাজ"), value: openTasks.toString() },
			{ label: t("In review", "রিভিউতে") , value: inReview.toString() },
			{ label: t("Workers hired", "নিযুক্ত কর্মী"), value: hired.toString() },
			{ label: t("Payments due", "বকেয়া পেমেন্ট"), value: "BDT 0" },
		];
	}, [postedTasks, assignmentRequests, t]);

	const requestsByTask = useMemo(() => {
		return assignmentRequests.reduce<Record<string, AssignmentRequest[]>>((acc, request) => {
			if (request.status !== "requested") return acc;
			if (!acc[request.task_id]) acc[request.task_id] = [];
			acc[request.task_id].push(request);
			return acc;
		}, {});
	}, [assignmentRequests]);

	const assignedByTask = useMemo(() => {
		return assignmentRequests.reduce<Record<string, AssignmentRequest | undefined>>((acc, request) => {
			if (request.status !== "assigned") return acc;
			acc[request.task_id] = request;
			return acc;
		}, {});
	}, [assignmentRequests]);

	const submittedByTask = useMemo(() => {
		return assignmentRequests.reduce<Record<string, AssignmentRequest | undefined>>((acc, request) => {
			if (request.status !== "submitted") return acc;
			acc[request.task_id] = request;
			return acc;
		}, {});
	}, [assignmentRequests]);

	const approvedByTask = useMemo(() => {
		return assignmentRequests.reduce<Record<string, AssignmentRequest | undefined>>((acc, request) => {
			if (request.status !== "approved") return acc;
			acc[request.task_id] = request;
			return acc;
		}, {});
	}, [assignmentRequests]);

	const handleApprove = async (taskId: string, assignmentId: string) => {
		const { error: assignmentError } = await supabase
			.from("assignments")
			.update({ status: "approved" })
			.eq("id", assignmentId);

		if (assignmentError) {
			alert(t("Unable to approve work: {message}", "কাজ অনুমোদন করা যায়নি: {message}", { message: assignmentError.message }));
			return;
		}

		const { error: taskError } = await supabase
			.from("tasks")
			.update({ status: "completed" })
			.eq("id", taskId);

		if (taskError) {
			alert(t("Unable to update task status: {message}", "কাজের অবস্থা আপডেট করা যায়নি: {message}", { message: taskError.message }));
			return;
		}

		setPostedTasks((prev) =>
			prev.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task))
		);
		setAssignmentRequests((prev) =>
			prev.map((request) =>
				request.id === assignmentId ? { ...request, status: "approved" } : request
			)
		);
		setExpandedTaskId(null);
	};

	const handleReject = async (taskId: string, assignmentId: string) => {
		const { error: assignmentError } = await supabase
			.from("assignments")
			.update({ status: "rejected" })
			.eq("id", assignmentId);

		if (assignmentError) {
			alert(t("Unable to reject work: {message}", "কাজ বাতিল করা যায়নি: {message}", { message: assignmentError.message }));
			return;
		}

		const { error: taskError } = await supabase
			.from("tasks")
			.update({ status: "open" })
			.eq("id", taskId);

		if (taskError) {
			alert(t("Unable to reopen task: {message}", "কাজ পুনরায় খোলা যায়নি: {message}", { message: taskError.message }));
			return;
		}

		setPostedTasks((prev) =>
			prev.map((task) => (task.id === taskId ? { ...task, status: "open" } : task))
		);
		setAssignmentRequests((prev) =>
			prev.map((request) =>
				request.id === assignmentId ? { ...request, status: "rejected" } : request
			)
		);
		setExpandedTaskId(null);
	};

	const handleAssign = async (taskId: string, assignmentId: string) => {
		const assignedAt = new Date().toISOString();
		const { error: assignmentError } = await supabase
			.from("assignments")
			.update({ status: "assigned", assigned_at: assignedAt })
			.eq("id", assignmentId);

		if (assignmentError) {
			alert(t("Unable to assign worker: {message}", "কর্মী অ্যাসাইন করা যায়নি: {message}", { message: assignmentError.message }));
			return;
		}

		const { error: rejectError } = await supabase
			.from("assignments")
			.update({ status: "rejected" })
			.eq("task_id", taskId)
			.neq("id", assignmentId)
			.eq("status", "requested");

		if (rejectError) {
			alert(t("Unable to update other requests: {message}", "অন্যান্য অনুরোধ আপডেট করা যায়নি: {message}", { message: rejectError.message }));
			return;
		}

		const { error: taskError } = await supabase
			.from("tasks")
			.update({ status: "assigned" })
			.eq("id", taskId);

		if (taskError) {
			alert(t("Unable to update task status: {message}", "কাজের অবস্থা আপডেট করা যায়নি: {message}", { message: taskError.message }));
			return;
		}

		setPostedTasks((prev) =>
			prev.map((task) => (task.id === taskId ? { ...task, status: "assigned" } : task))
		);
		setAssignmentRequests((prev) =>
			prev.map((request) => {
				if (request.task_id !== taskId) return request;
				if (request.id === assignmentId) return { ...request, status: "assigned" };
				if (request.status === "requested") return { ...request, status: "rejected" };
				return request;
			})
		);
		setExpandedTaskId(null);
	};

	if (loading) {
		return <div className="p-10 text-center font-bold text-teal-dark">{t("Loading your dashboard...", "আপনার ড্যাশবোর্ড লোড হচ্ছে...")}</div>;
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold text-teal-dark">{t("Employer Dashboard", "নিয়োগদাতা ড্যাশবোর্ড")}</h1>
						<p className="text-gray-600">{t("Post tasks, review submissions, and manage payments.", "কাজ পোস্ট করুন, জমা পড়া কাজ রিভিউ করুন, এবং পেমেন্ট পরিচালনা করুন।")}</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<Link className="bg-teal-dark text-white px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/employer/post-task">
							{t("Post a task", "কাজ পোস্ট করুন")}
						</Link>
						<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/employer/workers">
							{t("Browse workers", "কর্মী দেখুন")}
						</Link>
					</div>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{overview.map((item) => (
						<div key={item.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<p className="text-sm text-gray-500">{item.label}</p>
							<p className="text-2xl font-bold text-gray-900">{item.value}</p>
						</div>
					))}
				</div>

				<div className="grid lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100">
						<h2 className="text-xl font-bold text-gray-900 mb-4">{t("Posted Tasks", "পোস্ট করা কাজ")}</h2>
						{postedTasks.length === 0 ? (
							<div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500">
								{t("No tasks posted yet. Start by creating your first task.", "এখনও কোন কাজ পোস্ট করা হয়নি। প্রথম কাজ তৈরি করে শুরু করুন।")}
							</div>
						) : (
							<div className="space-y-4">
								{postedTasks.map((task) => {
									const requests = requestsByTask[task.id] ?? [];
									const isExpanded = expandedTaskId === task.id;
									const assignedRequest = assignedByTask[task.id];
									const submittedRequest = submittedByTask[task.id];
									const approvedRequest = approvedByTask[task.id];
									return (
										<div key={task.id} className="border border-gray-100 rounded-2xl p-5">
											<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
												<div>
													<h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
													<p className="text-sm text-gray-500">{task.description ?? t("No description provided.", "কোন বিবরণ দেওয়া হয়নি।")}</p>
													<div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
														<span>{t("Pay per unit", "ইউনিটপ্রতি পারিশ্রমিক")}: ৳{task.pay_per_unit}</span>
														<span>{t("Total units", "মোট ইউনিট")}: {task.total_units}</span>
														<span className="capitalize">{t("Status", "অবস্থা")}: {task.status.replace("_", " ")}</span>
													</div>
												</div>
												<div className="flex flex-col items-start md:items-end gap-2">
													<span className="text-xs font-semibold text-gray-500">{t("Requests", "অনুরোধ")}: {requests.length}</span>
													{approvedRequest ? (
														<button
															type="button"
															className="bg-teal-dark text-white px-4 py-2 rounded-full text-sm font-semibold"
															onClick={() => alert(t("Payment flow not set up yet.", "পেমেন্ট ফ্লো এখনো সেটআপ হয়নি।"))}
														>
															{t("Make a Payment", "পেমেন্ট করুন")}
														</button>
													) : submittedRequest ? (
														<button
															onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
															className="bg-teal-dark text-white px-4 py-2 rounded-full text-sm font-semibold"
														>
															{t("Review Task", "কাজ রিভিউ করুন")}
														</button>
													) : assignedRequest ? (
														<Link
															className="bg-teal-dark text-white px-4 py-2 rounded-full text-sm font-semibold"
															href={`/dashboard/employer/workers/${assignedRequest.worker_id}`}
														>
															{t("Task Assigned", "কাজ অ্যাসাইন হয়েছে")}
														</Link>
													) : (
														<button
															onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
															className="bg-teal-dark text-white px-4 py-2 rounded-full text-sm font-semibold"
														>
															{t("Browse Worker Requests", "কর্মীদের অনুরোধ দেখুন")}
														</button>
													)}
												</div>
											</div>

											{isExpanded ? (
												<div className="mt-5 space-y-3">
													{submittedRequest ? (
														<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50 rounded-xl p-4">
															<div>
																<p className="text-sm font-semibold text-gray-900">{submittedRequest.profile?.full_name ?? t("Worker", "কর্মী")}</p>
																<p className="text-xs text-gray-500">{t("District", "জেলা")}: {submittedRequest.profile?.district ?? "-"}</p>
																<Link
																	className="text-xs font-semibold text-teal-dark underline"
																	href={`/dashboard/employer/workers/${submittedRequest.worker_id}`}
																>
																	{t("View worker summary", "কর্মীর সারাংশ দেখুন")}
																</Link>
																{submittedRequest.attachment_url ? (
																	<a
																		className="block text-xs font-semibold text-teal-dark underline mt-2"
																		href={submittedRequest.attachment_url}
																		target="_blank"
																		rel="noreferrer"
																	>
																		{t("View attachment", "অ্যাটাচমেন্ট দেখুন")}
																	</a>
																) : (
																	<p className="text-xs text-gray-500 mt-2">{t("No attachment submitted.", "কোন অ্যাটাচমেন্ট জমা দেওয়া হয়নি।")}</p>
																)}
															</div>
															<div className="flex flex-wrap gap-2">
																<button
																	onClick={() => handleApprove(task.id, submittedRequest.id)}
																	className="bg-saffron text-teal-dark px-4 py-2 rounded-full text-sm font-bold"
																>
																	{t("Approve", "অনুমোদন")}
																</button>
																<button
																	onClick={() => handleReject(task.id, submittedRequest.id)}
																	className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-full text-sm font-bold"
																>
																	{t("Reject", "বাতিল")}
																</button>
															</div>
														</div>
													) : requests.length === 0 ? (
														<div className="text-sm text-gray-500">{t("No worker requests yet.", "এখনও কোন কর্মীর অনুরোধ নেই।")}</div>
													) : (
														requests.map((request) => (
															<div key={request.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50 rounded-xl p-4">
																<div>
																	<p className="text-sm font-semibold text-gray-900">{request.profile?.full_name ?? t("Worker", "কর্মী")}</p>
																	<p className="text-xs text-gray-500">{t("District", "জেলা")}: {request.profile?.district ?? "-"}</p>
																	<Link
																		className="text-xs font-semibold text-teal-dark underline"
																		href={`/dashboard/employer/workers/${request.worker_id}`}
																	>
																		{t("View worker summary", "কর্মীর সারাংশ দেখুন")}
																	</Link>
																</div>
																<button
																	onClick={() => handleAssign(task.id, request.id)}
																	className="bg-saffron text-teal-dark px-4 py-2 rounded-full text-sm font-bold"
																>
																	{t("Assign worker", "কর্মী অ্যাসাইন করুন")}
																</button>
															</div>
														))
													)}
												</div>
											) : null}
										</div>
									);
								})}
							</div>
						)}
					</div>

					<div className="space-y-6">
						<div className="bg-white p-6 rounded-2xl border border-gray-100">
							<h2 className="text-xl font-bold text-gray-900 mb-4">{t("Recent submissions", "সাম্প্রতিক জমা")}</h2>
							<ul className="space-y-3 text-sm text-gray-600">
								<li>{t("Transcription batch A waiting for approval", "ট্রান্সক্রিপশন ব্যাচ A অনুমোদনের অপেক্ষায়")}</li>
								<li>{t("Data labeling project 3 submitted", "ডেটা লেবেলিং প্রজেক্ট ৩ জমা হয়েছে")}</li>
								<li>{t("Moderation queue updated 1 hour ago", "মডারেশন কিউ ১ ঘন্টা আগে আপডেট হয়েছে")}</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
