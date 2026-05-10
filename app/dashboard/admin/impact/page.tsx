"use client";

import { useLanguage } from "@/components/shared/LanguageProvider";

export default function ImpactPage() {
	const { t } = useLanguage();

	const metrics = [
		{ label: t("Women employed", "কর্মরত নারী"), value: "520" },
		{ label: t("Income generated", "উৎপন্ন আয়"), value: "BDT 1.3M" },
		{ label: t("Districts reached", "আবদ্ধ জেলা"), value: "18" },
		{ label: t("Tasks completed", "সম্পন্ন কাজ"), value: "4,900" },
	];

	const districts = [
		{ name: t("Dhaka", "ঢাকা"), workers: 220 },
		{ name: t("Khulna", "খুলনা"), workers: 120 },
		{ name: t("Rajshahi", "রাজশাহী"), workers: 90 },
		{ name: t("Sylhet", "সিলেট"), workers: 70 },
	];

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">{t("Impact Metrics", "ইমপ্যাক্ট মেট্রিক")}</h1>
					<p className="text-gray-600">{t("Track program outcomes for reporting and partnerships.", "রিপোর্টিং ও অংশীদারিত্বের জন্য ফলাফল ট্র্যাক করুন।")}</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{metrics.map((item) => (
						<div key={item.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<p className="text-sm text-gray-500">{item.label}</p>
							<p className="text-2xl font-bold text-gray-900">{item.value}</p>
						</div>
					))}
				</div>

				<div className="bg-white rounded-2xl border border-gray-100 p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">{t("District coverage", "জেলা কভারেজ")}</h2>
					<div className="space-y-4">
						{districts.map((district) => (
							<div key={district.name} className="flex items-center justify-between text-sm">
								<span className="font-semibold text-gray-800">{district.name}</span>
								<span className="text-gray-600">{district.workers} {t("workers", "কর্মী")}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
