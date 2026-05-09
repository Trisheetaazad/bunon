import Link from "next/link";

export default function AdminDashboard() {
	const highlights = [
		{ label: "Total workers", value: "860" },
		{ label: "Verified employers", value: "42" },
		{ label: "Open tasks", value: "128" },
		{ label: "Payments pending", value: "19" },
	];

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">Admin Dashboard</h1>
					<p className="text-gray-600">Monitor growth, approvals, and platform activity.</p>
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
						<h2 className="text-xl font-bold text-gray-900 mb-4">Quick actions</h2>
						<div className="flex flex-col gap-3">
							<Link className="bg-teal-dark text-white px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/users">
								Review users
							</Link>
							<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/tasks">
								Review tasks
							</Link>
							<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/payments">
								Manage payments
							</Link>
							<Link className="bg-white border border-teal-dark text-teal-dark px-4 py-3 rounded-xl font-semibold text-center" href="/dashboard/admin/impact">
								View impact metrics
							</Link>
						</div>
					</div>

					<div className="bg-white p-6 rounded-2xl border border-gray-100">
						<h2 className="text-xl font-bold text-gray-900 mb-4">Recent activity</h2>
						<ul className="space-y-3 text-sm text-gray-600">
							<li>4 employers requested verification</li>
							<li>12 workers completed training today</li>
							<li>6 task approvals waiting for payment</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
