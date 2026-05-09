const metrics = [
	{ label: "Women employed", value: "520" },
	{ label: "Income generated", value: "BDT 1.3M" },
	{ label: "Districts reached", value: "18" },
	{ label: "Tasks completed", value: "4,900" },
];

const districts = [
	{ name: "Dhaka", workers: 220 },
	{ name: "Khulna", workers: 120 },
	{ name: "Rajshahi", workers: 90 },
	{ name: "Sylhet", workers: 70 },
];

export default function ImpactPage() {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">Impact Metrics</h1>
					<p className="text-gray-600">Track program outcomes for reporting and partnerships.</p>
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
					<h2 className="text-xl font-bold text-gray-900 mb-4">District coverage</h2>
					<div className="space-y-4">
						{districts.map((district) => (
							<div key={district.name} className="flex items-center justify-between text-sm">
								<span className="font-semibold text-gray-800">{district.name}</span>
								<span className="text-gray-600">{district.workers} workers</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
