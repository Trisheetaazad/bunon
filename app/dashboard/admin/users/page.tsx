const users = [
	{ name: "Ayesha Rahman", role: "Worker", district: "Khulna", status: "Verified" },
	{ name: "Nusrat Islam", role: "Worker", district: "Rajshahi", status: "Pending" },
	{ name: "MicroLab BD", role: "Employer", district: "Dhaka", status: "Review" },
	{ name: "Zamira Studio", role: "Employer", district: "Chittagong", status: "Verified" },
];

export default function AdminUsers() {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold text-teal-dark">User Management</h1>
					<p className="text-gray-600">Verify new employers and keep worker profiles up to date.</p>
				</header>

				<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
					<div className="grid grid-cols-4 gap-4 px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-semibold bg-gray-50">
						<span>Name</span>
						<span>Role</span>
						<span>District</span>
						<span>Status</span>
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
