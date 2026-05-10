"use client";

import Link from "next/link";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function AdminDashboard() {
	const { t } = useLanguage();
	const highlights = [
		{ label: t("Total workers", "মোট কর্মী"), value: "860" },
		{ label: t("Verified employers", "যাচাইকৃত নিয়োগদাতা"), value: "42" },
		{ label: t("Open tasks", "খোলা কাজ"), value: "128" },
		{ label: t("Payments pending", "পেমেন্ট অপেক্ষমান"), value: "19" },
	];

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">{t("Admin Dashboard", "অ্যাডমিন ড্যাশবোর্ড")}</h1>
					<p className="text-gray-600">{t("Monitor growth, approvals, and platform activity.", "বৃদ্ধি, অনুমোদন ও প্ল্যাটফর্ম কার্যক্রম পর্যবেক্ষণ করুন।")}</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{highlights.map((item) => (
						<div key={item.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<p className="text-sm text-gray-500">{item.label}</p>
							<p className="text-2xl font-bold text-gray-900">{item.value}</p>
						</div>
					))}
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-2xl border border-gray-100">
						<h2 className="text-xl font-bold text-gray-900 mb-4">{t("Quick actions", "দ্রুত কাজ")}</h2>
						<div className="flex flex-col gap-3">
							<Link className="bg-teal-dark text-white px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/users">
								{t("Review users", "ব্যবহারকারী যাচাই করুন")}
							</Link>
							<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/tasks">
								{t("Review tasks", "কাজ যাচাই করুন")}
							</Link>
							<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/payments">
								{t("Manage payments", "পেমেন্ট পরিচালনা করুন")}
							</Link>
							<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/impact">
								{t("View impact metrics", "ইমপ্যাক্ট মেট্রিক দেখুন")}
							</Link>
						</div>
					</div>

					<div className="bg-white p-6 rounded-2xl border border-gray-100">
						<h2 className="text-xl font-bold text-gray-900 mb-4">{t("Recent activity", "সাম্প্রতিক কার্যক্রম")}</h2>
						<ul className="space-y-3 text-sm text-gray-600">
							<li>{t("4 employers requested verification", "৪ জন নিয়োগদাতা যাচাইকরণের অনুরোধ করেছেন")}</li>
							<li>{t("12 workers completed training today", "আজ ১২ জন কর্মী প্রশিক্ষণ শেষ করেছেন")}</li>
							<li>{t("6 task approvals waiting for payment", "৬টি কাজের অনুমোদন পেমেন্টের অপেক্ষায়")}</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
