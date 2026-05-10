"use client";

import { useLanguage } from "@/components/shared/LanguageProvider";

export default function AdminUsers() {
	const { t } = useLanguage();

	const users = [
		{ name: "Ayesha Rahman", role: t("Worker", "কর্মী"), district: t("Khulna", "খুলনা"), status: t("Verified", "যাচাইকৃত") },
		{ name: "Nusrat Islam", role: t("Worker", "কর্মী"), district: t("Rajshahi", "রাজশাহী"), status: t("Pending", "অপেক্ষমান") },
		{ name: "MicroLab BD", role: t("Employer", "নিয়োগদাতা"), district: t("Dhaka", "ঢাকা"), status: t("Review", "পর্যালোচনা") },
		{ name: "Zamira Studio", role: t("Employer", "নিয়োগদাতা"), district: t("Chittagong", "চট্টগ্রাম"), status: t("Verified", "যাচাইকৃত") },
	];
	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">{t("User Management", "ব্যবহারকারী ব্যবস্থাপনা")}</h1>
					<p className="text-gray-600">{t("Verify new employers and keep worker profiles up to date.", "নতুন নিয়োগদাতা যাচাই করুন এবং কর্মীদের প্রোফাইল আপডেট রাখুন।")}</p>
				</header>

				<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
					<div className="grid grid-cols-4 gap-4 px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-semibold bg-gray-50">
						<span>{t("Name", "নাম")}</span>
						<span>{t("Role", "ভূমিকা")}</span>
						<span>{t("District", "জেলা")}</span>
						<span>{t("Status", "অবস্থা")}</span>
					</div>
					<div className="divide-y">
						{users.map((user) => (
							<div key={user.name} className="grid grid-cols-4 gap-4 px-6 py-4 text-sm items-center">
								<span className="font-semibold text-gray-900">{user.name}</span>
								<span className="text-gray-600">{user.role}</span>
								<span className="text-gray-600">{user.district}</span>
								<span className="text-teal-dark font-semibold">{user.status}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
